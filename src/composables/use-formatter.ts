import { computed, reactive, watch, type ComputedRef } from 'vue';

import { DEBOUNCE_FORMAT_CHECK_MS } from '@/config/limits';
import type { SourcePart } from '@/model/widget';
import { createFormatService, type FormatService } from '@/services/format-service';
import { useDebounceFn, type DebouncedFn } from './use-debounce-fn';
import { useWidgetSources } from './use-widget-sources';

/**
 * Tracks which widget sources differ from their Prettier-formatted state and
 * applies formatting on demand. Imported `.html` / `.tgw` files arrive
 * minified, so the editor flags them and offers a one-keystroke fix.
 *
 * Detection runs per part on a trailing debounce and is race-guarded like
 * the size measurer: every check carries a token, and only the newest one
 * may write state. A finished formatting action seeds the cache with the
 * formatted text, so the source watcher's follow-up tick is a cache hit and
 * the "needs formatting" pill disappears without a second Prettier run.
 */

export type FormatResult = { ok: true; changed: boolean } | { ok: false; reason: 'syntax' };

export interface FormatCheckState {
  /** Source text the check was performed against (`''` = never checked). */
  readonly source: string;
  /** Prettier output for `source`, or `null` while pending / on parse error. */
  readonly formatted: string | null;
  /** `true` while the source awaits its check. */
  readonly pending: boolean;
  /** `true` when the document differs from its formatted form. */
  readonly dirty: boolean;
}

export interface FormatterApi {
  /** Per-part check state, deep-reactive. */
  readonly checks: Readonly<Record<SourcePart, FormatCheckState>>;
  /** Reactive "needs formatting" flag for one part. */
  needsFormatOf(part: SourcePart): ComputedRef<boolean>;
  /**
   * Pretty-prints the part into the source store. Resolves `ok: false`
   * on syntax errors without touching the source.
   */
  formatPart(part: SourcePart): Promise<FormatResult>;
}

const SOURCE_PARTS: readonly SourcePart[] = ['html', 'css', 'js'];

function emptyCheck(): FormatCheckState {
  return { source: '', formatted: null, pending: false, dirty: false };
}

export function createFormatter(service: FormatService = createFormatService()): FormatterApi {
  const sources = useWidgetSources();

  const checks = reactive<Record<SourcePart, FormatCheckState>>({
    html: emptyCheck(),
    css: emptyCheck(),
    js: emptyCheck(),
  });

  /** Race guard: monotonically increasing token per part. */
  const tokens: Record<SourcePart, number> = { html: 0, css: 0, js: 0 };

  async function check(part: SourcePart): Promise<void> {
    const text = sources.state[part];
    const current = checks[part];
    // Finished check against the same text → cache hit.
    if (!current.pending && text === current.source) {
      return;
    }
    if (text === '') {
      checks[part] = emptyCheck();
      return;
    }

    const token = ++tokens[part];
    checks[part] = { ...emptyCheck(), pending: true };
    try {
      const formatted = await service.format(part, text);
      if (token !== tokens[part]) {
        return; // superseded by a newer check
      }
      checks[part] = { source: text, formatted, pending: false, dirty: formatted !== text };
    } catch {
      if (token !== tokens[part]) {
        return;
      }
      // Unparseable document: hide the pill; the format action reports why.
      checks[part] = { source: text, formatted: null, pending: false, dirty: false };
    }
  }

  async function formatPart(part: SourcePart): Promise<FormatResult> {
    const text = sources.state[part];
    if (text === '') {
      return { ok: true, changed: false };
    }

    const cached = checks[part];
    let formatted: string;
    if (!cached.pending && cached.source === text && cached.formatted !== null) {
      formatted = cached.formatted; // reuse the detection run
    } else {
      const token = ++tokens[part];
      try {
        formatted = await service.format(part, text);
      } catch {
        if (token === tokens[part]) {
          checks[part] = { source: text, formatted: null, pending: false, dirty: false };
        }
        return { ok: false, reason: 'syntax' };
      }
    }

    // Seed the cache so the watcher's follow-up tick is a no-op.
    checks[part] = { source: formatted, formatted, pending: false, dirty: false };
    sources.setSource(part, formatted);
    return { ok: true, changed: formatted !== text };
  }

  // Sources → debounced per-part checks. `immediate` flags minified state
  // restored from localStorage / imports right after startup.
  const schedules = {} as Record<SourcePart, DebouncedFn<[]>>;
  for (const part of SOURCE_PARTS) {
    const schedule = useDebounceFn(() => void check(part), DEBOUNCE_FORMAT_CHECK_MS);
    schedules[part] = schedule;
    watch(
      () => sources.state[part],
      () => schedule(),
      { immediate: true },
    );
  }

  function needsFormatOf(part: SourcePart): ComputedRef<boolean> {
    return computed(() => checks[part].dirty);
  }

  return { checks, needsFormatOf, formatPart };
}

const singleton = createFormatter();

export function useFormatter(): FormatterApi {
  return singleton;
}
