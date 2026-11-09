/**
 * Versioned, dependency-injected persistence of playground preferences.
 * localStorage is touched only here; every consumer gets plain objects, so
 * tests can pass an in-memory storage and SSR never crashes.
 */

import { isAppLocale, type AppLocale } from '@/i18n';
import type { TgwFormState, WidgetScheme } from '@/model/widget';
import {
  BUBBLE_WIDTH_DEFAULT,
  BUBBLE_WIDTH_MAX,
  BUBBLE_WIDTH_MIN,
  SPLIT_RATIO_DEFAULT,
  SPLIT_RATIO_MAX,
  SPLIT_RATIO_MIN,
} from '@/config/limits';

export const PREFS_STORAGE_KEY = 'tg-widget-kit:prefs:v1';

export interface PersistedPrefs {
  version: 1;
  locale: AppLocale;
  sources: { html: string; css: string; js: string; activeTemplate: string };
  preview: { scheme: WidgetScheme; width: number };
  settings: { splitRatio: number };
  export: TgwFormState;
}

/** Minimal Storage surface (real localStorage or an in-memory test double). */
export interface PreferencesStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createDefaultPrefs(): PersistedPrefs {
  return {
    version: 1,
    locale: 'ru',
    sources: { html: '', css: '', js: '', activeTemplate: '' },
    preview: { scheme: 'dark', width: BUBBLE_WIDTH_DEFAULT },
    settings: { splitRatio: SPLIT_RATIO_DEFAULT },
    export: {
      allowQueries: false,
      fwdAllowQueries: false,
      sharedWidget: false,
      width: 0,
      height: 0,
      publicData: '',
      chatData: '',
    },
  };
}

/** Returns the real localStorage, or `null` where it is unavailable. */
export function getDefaultStorage(): PreferencesStorage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage;
  } catch {
    return null;
  }
}

export function loadPrefs(
  storage: PreferencesStorage | null = getDefaultStorage(),
): PersistedPrefs | null {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return normalizePrefs(JSON.parse(raw));
  } catch {
    return null; // corrupted or quota-blocked payload — start fresh
  }
}

export function savePrefs(
  prefs: PersistedPrefs,
  storage: PreferencesStorage | null = getDefaultStorage(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // QuotaExceededError etc. — persistence is best-effort by design.
  }
}

export function clearPrefs(storage: PreferencesStorage | null = getDefaultStorage()): void {
  storage?.removeItem(PREFS_STORAGE_KEY);
}

/** Defensive normalisation: unknown payloads never crash the app. */
function normalizePrefs(value: unknown): PersistedPrefs | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1) {
    return null; // future migration hook
  }

  const prefs = createDefaultPrefs();
  const sources = asRecord(raw.sources);
  if (sources) {
    prefs.sources = {
      html: asString(sources.html, ''),
      css: asString(sources.css, ''),
      js: asString(sources.js, ''),
      activeTemplate: asString(sources.activeTemplate, ''),
    };
  }

  const preview = asRecord(raw.preview);
  if (preview) {
    prefs.preview = {
      scheme: preview.scheme === 'light' ? 'light' : 'dark',
      width: clampNumber(preview.width, BUBBLE_WIDTH_MIN, BUBBLE_WIDTH_MAX, BUBBLE_WIDTH_DEFAULT),
    };
  }

  const settings = asRecord(raw.settings);
  if (settings) {
    // Older payloads may still carry a `settings.autoBuild` flag — it is
    // intentionally dropped: auto-build is now the always-on behaviour.
    prefs.settings = {
      splitRatio: clampNumber(
        settings.splitRatio,
        SPLIT_RATIO_MIN,
        SPLIT_RATIO_MAX,
        SPLIT_RATIO_DEFAULT,
      ),
    };
  }

  const exportForm = asRecord(raw.export);
  if (exportForm) {
    prefs.export = {
      allowQueries: exportForm.allowQueries === true,
      fwdAllowQueries: exportForm.fwdAllowQueries === true,
      sharedWidget: exportForm.sharedWidget === true,
      width: clampNumber(exportForm.width, 0, 600, 0),
      height: clampNumber(exportForm.height, 0, 600, 0),
      publicData: asString(exportForm.publicData, ''),
      chatData: asString(exportForm.chatData, ''),
    };
  }

  if (isAppLocale(raw.locale)) {
    prefs.locale = raw.locale;
  }

  return prefs;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(Math.max(num, min), max);
}
