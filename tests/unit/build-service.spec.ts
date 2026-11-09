import { describe, expect, it } from 'vitest';

import { createBuildPipeline } from '@/services/build-service';

const PARTS = { html: '<p>widget</p>', css: 'p { color : red }', js: 'boot();' };

describe('createBuildPipeline', () => {
  it('lints the three sources synchronously', () => {
    const pipeline = createBuildPipeline();
    const issues = pipeline.lint({ html: '<input>', css: '', js: 'fetch("/x")' });
    expect(issues.map((issue) => issue.code)).toEqual(['tagForbidden', 'jsNetwork']);
  });

  it('assembles, minifies and measures in one build', async () => {
    const pipeline = createBuildPipeline();
    const result = await pipeline.build(PARTS);
    expect(result).not.toBeNull();
    // assembled keeps the raw css, minified collapses it
    expect(result?.assembled).toContain('<style>p { color : red }</style>');
    expect(result?.minified).toContain('<style>p{color:red}</style>');
    expect(result?.minified.length).toBeLessThanOrEqual(result!.assembled.length);
    expect(result?.report.raw).toBeGreaterThan(0);
    expect(result?.report.zlib).toBeGreaterThan(0);
    expect(result?.verdict.level).toBe('ok');
  });

  it('drops an in-flight build after invalidate()', async () => {
    const pipeline = createBuildPipeline();
    const pending = pipeline.build(PARTS);
    pipeline.invalidate();
    await expect(pending).resolves.toBeNull();
  });

  it('drops a superseded build in favor of the newer one', async () => {
    const pipeline = createBuildPipeline();
    const first = pipeline.build(PARTS);
    const second = pipeline.build(PARTS);
    await expect(first).resolves.toBeNull();
    const result = await second;
    expect(result).not.toBeNull();
  });

  it('wraps the assembled document with the SDK mock for preview', async () => {
    const pipeline = createBuildPipeline();
    const result = await pipeline.build(PARTS);
    const doc = pipeline.previewDocument(result!.assembled, 'light');
    expect(doc).toContain('window.TelegramWidget');
    expect(doc).toContain('"bg_color":"#ffffff"');
    expect(doc).toContain('<p>widget</p>');
  });
});
