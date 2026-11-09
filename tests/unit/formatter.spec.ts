import { describe, expect, it, vi } from 'vitest';

import { createFormatter } from '@/composables/use-formatter';
import { useWidgetSources } from '@/composables/use-widget-sources';

/**
 * Formatter flow over the real Prettier standalone modules (the same ones
 * the browser loads as async chunks). `createFormatter()` owns the check
 * state; source writes land in the app-wide sources store, exactly like in
 * the UI. Detection checks are debounced (400 ms) — assertions poll with
 * `vi.waitFor`.
 */

const sources = useWidgetSources();
const formatter = createFormatter();

const MIN_CSS = 'body{margin:0;padding:0}.btn{color:#fff;background:#2aabee}';

const POLL = { timeout: 6_000, interval: 100 } as const;

function hydrateSources(css: string): void {
  sources.hydrate({ html: '<p>ok</p>', css, js: '', activeTemplate: '' });
}

describe('useFormatter', () => {
  it('flags a minified source as needing formatting', async () => {
    hydrateSources(MIN_CSS);

    await vi.waitFor(() => {
      expect(formatter.checks.css.pending).toBe(false);
      expect(formatter.checks.css.dirty).toBe(true);
    }, POLL);
  });

  it('treats an already-formatted source as clean', async () => {
    hydrateSources('body {\n  margin: 0;\n}\n');

    await vi.waitFor(() => {
      expect(formatter.checks.css.pending).toBe(false);
      expect(formatter.checks.css.dirty).toBe(false);
    }, POLL);
  });

  it('formatPart writes the formatted source into the store and clears the flag', async () => {
    hydrateSources(MIN_CSS);
    await vi.waitFor(() => expect(formatter.checks.css.dirty).toBe(true), POLL);

    const result = await formatter.formatPart('css');

    expect(result).toEqual({ ok: true, changed: true });
    expect(sources.state.css).toContain('.btn {');
    expect(sources.state.css).toBe(formatter.checks.css.formatted);
    // Formatting is an edit → the template selector switches to custom.
    expect(sources.state.activeTemplate).toBe('');
    // The seeded cache keeps the source clean after the follow-up tick.
    await vi.waitFor(() => expect(formatter.checks.css.dirty).toBe(false), POLL);
  });

  it('formatPart is a no-op for an empty source', async () => {
    hydrateSources('');

    const result = await formatter.formatPart('css');

    expect(result).toEqual({ ok: true, changed: false });
    expect(sources.state.css).toBe('');
  });

  it('reports syntax errors without touching the source', async () => {
    const broken = '.a{color:';
    hydrateSources(broken);
    // The detection run gives up quietly (pill hidden)…
    await vi.waitFor(() => {
      expect(formatter.checks.css.pending).toBe(false);
      expect(formatter.checks.css.dirty).toBe(false);
    }, POLL);

    // …and the explicit action surfaces the failure to the caller.
    const result = await formatter.formatPart('css');

    expect(result).toEqual({ ok: false, reason: 'syntax' });
    expect(sources.state.css).toBe(broken);
  });
});
