import { describe, expect, it } from 'vitest';

import { createFormatService } from '@/services/format-service';

/**
 * Prettier standalone in the node/vitest environment — the same modules the
 * browser fetches as async chunks. Each `format()` call re-imports cached
 * modules, so the first test pays the parse cost and the rest are fast.
 */

const service = createFormatService();

describe('formatService', () => {
  it('pretty-prints minified CSS into a multi-line document', async () => {
    const minified = 'body{margin:0;padding:0}.btn{color:#fff;background:#2aabee}';
    const formatted = await service.format('css', minified);

    expect(formatted).toContain('.btn {');
    expect(formatted.split('\n').length).toBeGreaterThan(2);
  });

  it('formats CSS idempotently', async () => {
    const once = await service.format('css', 'body{margin:0}');
    const twice = await service.format('css', once);

    expect(twice).toBe(once);
  });

  it('formats a minified HTML fragment (widget sources are fragments)', async () => {
    const minified =
      '<h1>Заголовок</h1><p>Абзац</p><div class="row"><span>x</span><span>y</span></div>';
    const formatted = await service.format('html', minified);

    expect(formatted).toContain('<h1>');
    expect(formatted).toContain('</div>');
    expect(formatted.split('\n').length).toBeGreaterThan(2);
  });

  it('formats full HTML documents with embedded style and script', async () => {
    const doc =
      '<!DOCTYPE html><html><head><style>body{color:red}</style></head><body><p>ok</p><script>const a=1;</script></body></html>';
    const formatted = await service.format('html', doc);

    expect(formatted.toLowerCase()).toContain('<!doctype html>');
    expect(formatted).toContain('const a = 1;');
  });

  it('formats minified JS', async () => {
    const minified = 'const a=1;function f(x){return x+a}f(2)';
    const formatted = await service.format('js', minified);

    expect(formatted).toContain('const a = 1;');
    expect(formatted.split('\n').length).toBeGreaterThan(1);
  });

  it('rejects unparseable JS with an error (sources stay untouched upstream)', async () => {
    await expect(service.format('js', 'const = ;')).rejects.toThrow();
  });

  it('treats an empty source as already formatted', async () => {
    const formatted = await service.format('css', '');

    expect(formatted.trim()).toBe('');
  });
});
