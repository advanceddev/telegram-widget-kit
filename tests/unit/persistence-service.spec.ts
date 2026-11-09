import { describe, expect, it } from 'vitest';

import {
  PREFS_STORAGE_KEY,
  clearPrefs,
  createDefaultPrefs,
  loadPrefs,
  savePrefs,
  type PreferencesStorage,
} from '@/services/persistence-service';

function createMemoryStorage(
  initial: Record<string, string> = {},
): PreferencesStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

const VALID_PAYLOAD = {
  version: 1,
  locale: 'en',
  sources: { html: '<p>x</p>', css: 'p{}', js: 'go()', activeTemplate: '' },
  preview: { scheme: 'light', width: 400 },
  // Legacy payloads may still carry `settings.autoBuild` — it is dropped.
  settings: { autoBuild: false, splitRatio: 0.4 },
  export: {
    allowQueries: true,
    fwdAllowQueries: false,
    sharedWidget: true,
    width: 320,
    height: 240,
    publicData: '{}',
    chatData: '',
  },
};

describe('loadPrefs', () => {
  it('returns null without storage', () => {
    expect(loadPrefs(null)).toBeNull();
  });

  it('returns null when nothing is stored', () => {
    expect(loadPrefs(createMemoryStorage())).toBeNull();
  });

  it('returns null on corrupted json', () => {
    expect(loadPrefs(createMemoryStorage({ [PREFS_STORAGE_KEY]: '{oops' }))).toBeNull();
  });

  it('returns null on a foreign version (migration hook)', () => {
    expect(
      loadPrefs(
        createMemoryStorage({
          [PREFS_STORAGE_KEY]: JSON.stringify({ ...VALID_PAYLOAD, version: 99 }),
        }),
      ),
    ).toBeNull();
  });

  it('restores a valid payload', () => {
    const prefs = loadPrefs(
      createMemoryStorage({ [PREFS_STORAGE_KEY]: JSON.stringify(VALID_PAYLOAD) }),
    );
    expect(prefs).not.toBeNull();
    expect(prefs?.locale).toBe('en');
    expect(prefs?.sources.html).toBe('<p>x</p>');
    expect(prefs?.preview.scheme).toBe('light');
    expect(prefs?.preview.width).toBe(400);
    expect(prefs?.settings.splitRatio).toBe(0.4);
    expect(prefs?.settings).not.toHaveProperty('autoBuild');
    expect(prefs?.export.publicData).toBe('{}');
  });

  it('normalizes out-of-range numbers and unknown locales', () => {
    const broken = {
      ...VALID_PAYLOAD,
      locale: 'de',
      preview: { scheme: 'neon', width: 99_999 },
      settings: { autoBuild: 'yes', splitRatio: 5 },
    };
    const prefs = loadPrefs(createMemoryStorage({ [PREFS_STORAGE_KEY]: JSON.stringify(broken) }));
    expect(prefs?.locale).toBe('ru');
    expect(prefs?.preview.scheme).toBe('dark');
    expect(prefs?.preview.width).toBe(430);
    expect(prefs?.settings.splitRatio).toBe(0.8);
    expect(prefs?.settings).not.toHaveProperty('autoBuild');
  });
});

describe('savePrefs / clearPrefs', () => {
  it('serializes the snapshot under the versioned key', () => {
    const storage = createMemoryStorage();
    savePrefs(createDefaultPrefs(), storage);
    const raw = storage.data.get(PREFS_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '{}').version).toBe(1);
  });

  it('swallows quota errors', () => {
    const failing: PreferencesStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('QuotaExceededError');
      },
      removeItem: () => undefined,
    };
    expect(() => savePrefs(createDefaultPrefs(), failing)).not.toThrow();
  });

  it('no-ops without storage', () => {
    expect(() => savePrefs(createDefaultPrefs(), null)).not.toThrow();
    expect(() => clearPrefs(null)).not.toThrow();
  });

  it('removes the key on clear', () => {
    const storage = createMemoryStorage({ [PREFS_STORAGE_KEY]: '{}' });
    clearPrefs(storage);
    expect(storage.data.has(PREFS_STORAGE_KEY)).toBe(false);
  });
});
