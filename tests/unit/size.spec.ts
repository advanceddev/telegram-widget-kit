import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSizeMeasurer, evaluateSizeVerdict, rawSize, zlibSize } from '@/core/assemble';

describe('rawSize / byteLength', () => {
  it('counts UTF-8 bytes, not UTF-16 units', () => {
    // 'и' is 2 bytes in UTF-8
    expect(rawSize('ии')).toBe(4);
    expect(rawSize('abc')).toBe(3);
    expect(rawSize('')).toBe(0);
  });
});

describe('zlibSize', () => {
  it('compresses repetitive text well below the raw size', async () => {
    const text = 'a'.repeat(10_000);
    const z = await zlibSize(text);
    expect(z).toBeGreaterThan(0);
    expect(z).toBeLessThan(200);
  });

  it('stays under the 4 KB limit for a realistic widget payload', async () => {
    const widget = `<!DOCTYPE html><html><head><style>${'p{color:red}'.repeat(80)}</style></head><body>${'<p>line</p>'.repeat(150)}</body></html>`;
    const z = await zlibSize(widget);
    expect(z).toBeLessThan(4_096);
    expect(z).toBeGreaterThan(50);
  });

  it('falls back to an estimate when CompressionStream is unavailable', async () => {
    const original = globalThis.CompressionStream;
    vi.stubGlobal('CompressionStream', undefined);
    try {
      const z = await zlibSize('x'.repeat(1_000));
      expect(z).toBe(Math.round(1_000 * 0.45));
    } finally {
      vi.unstubAllGlobals();
      void original;
    }
  });
});

describe('createSizeMeasurer', () => {
  it('returns the measurement of the latest request', async () => {
    const measurer = createSizeMeasurer();
    const first = await measurer.measure('hello');
    expect(first).not.toBeNull();
    expect(first?.raw).toBe(5);
  });

  it('drops stale results after reset()', async () => {
    const measurer = createSizeMeasurer();
    const stale = measurer.measure('stale payload');
    measurer.reset();
    await expect(stale).resolves.toBeNull();
  });

  it('drops the earlier of two overlapping measurements', async () => {
    const measurer = createSizeMeasurer();
    const first = measurer.measure('first');
    const second = measurer.measure('second payload');
    await expect(first).resolves.toBeNull();
    const result = await second;
    expect(result?.raw).toBe('second payload'.length);
  });
});

describe('evaluateSizeVerdict', () => {
  it.each([
    [32_769, 1_000, false, 'bad'],
    [10_000, 4_097, false, 'bad'],
    [10_000, 3_900, false, 'warn'],
    [10_000, 1_000, false, 'ok'],
    [10_000, 1_000, true, 'okBuilt'],
  ] as const)('raw=%i, zlib=%i, built=%s → %s', (raw, zlib, isBuilt, expected) => {
    const verdict = evaluateSizeVerdict({ raw, zlib }, isBuilt);
    expect(verdict.messageKey).toBe(expected);
  });

  it('does not warn while zlib is still measuring (null)', () => {
    const verdict = evaluateSizeVerdict({ raw: 10_000, zlib: null }, false);
    expect(verdict.level).toBe('ok');
    expect(verdict.messageKey).toBe('ok');
  });

  it('marks oversized raw input as bad even while measuring', () => {
    const verdict = evaluateSizeVerdict({ raw: 40_000, zlib: null }, false);
    expect(verdict.level).toBe('bad');
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
