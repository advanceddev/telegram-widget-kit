import { describe, expect, it } from 'vitest';

import { splitWidgetHtml } from '@/core/tgw';
import { parseTgwOrHtml, buildTgwPackage } from '@/core/tgw';

describe('splitWidgetHtml', () => {
  it('extracts css, js and body from a full document', () => {
    const parts = splitWidgetHtml(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><style>a{color:red}</style></head><body><p>x</p><script>go()</script></body></html>',
    );
    expect(parts.css).toBe('a{color:red}');
    expect(parts.js).toBe('go()');
    expect(parts.html).toBe('<p>x</p>');
  });

  it('concatenates multiple style and script blocks', () => {
    const parts = splitWidgetHtml(
      '<style>a{}</style><b/><style>b{}</style><script>one()</script><script>two()</script>',
    );
    expect(parts.css).toBe('a{}\nb{}');
    expect(parts.js).toBe('one()\ntwo()');
  });

  it('keeps a plain fragment untouched', () => {
    const parts = splitWidgetHtml('<p>hello</p>');
    expect(parts).toEqual({ html: '<p>hello</p>', css: '', js: '' });
  });

  it('strips document scaffolding without <body>', () => {
    const parts = splitWidgetHtml(
      '<!DOCTYPE html><html><head><style>a{}</style></head><p>x</p></html>',
    );
    expect(parts.html).toBe('<p>x</p>');
    expect(parts.css).toBe('a{}');
  });

  it('ignores external <script src> when collecting js', () => {
    const parts = splitWidgetHtml('<p>x</p><script src="a.js"></script>');
    expect(parts.js).toBe('');
    // external scripts stay in the markup (the profile linter flags them)
    expect(parts.html).toContain('a.js');
  });

  it('round-trips with assembleWidget', async () => {
    const { assembleWidget } = await import('@/core/assemble');
    const source = assembleWidget({ html: '<p>r</p>', css: 'p{color:blue}', js: 'init()' });
    const parts = splitWidgetHtml(source);
    expect(parts).toEqual({ html: '<p>r</p>', css: 'p{color:blue}', js: 'init()' });
  });
});

describe('buildTgwPackage', () => {
  it('applies defaults for optional fields', () => {
    const pkg = buildTgwPackage('<p>x</p>');
    expect(pkg).toEqual({
      format: 'tg-widget/v1',
      width: 0,
      height: 0,
      html: '<p>x</p>',
      allow_queries: false,
      fwd_allow_queries: false,
      shared_widget: false,
      public_data: null,
      chat_data: null,
      meta: undefined,
    });
  });

  it('preserves provided options', () => {
    const pkg = buildTgwPackage('<p>x</p>', {
      width: 320,
      height: 240,
      allow_queries: true,
      shared_widget: true,
      public_data: '{"a":1}',
      meta: { name: 'test' },
    });
    expect(pkg.width).toBe(320);
    expect(pkg.height).toBe(240);
    expect(pkg.allow_queries).toBe(true);
    expect(pkg.shared_widget).toBe(true);
    expect(pkg.public_data).toBe('{"a":1}');
    expect(pkg.meta).toEqual({ name: 'test' });
  });
});

describe('parseTgwOrHtml', () => {
  it('parses a plain html fragment', () => {
    const { parts, tgw } = parseTgwOrHtml('<p>hi</p>');
    expect(parts.html).toBe('<p>hi</p>');
    expect(tgw).toBeUndefined();
  });

  it('parses a tgw json package', () => {
    const pkg = buildTgwPackage('<p>hi</p><style>a{}</style>', { width: 300, allow_queries: true });
    const { parts, tgw } = parseTgwOrHtml(JSON.stringify(pkg), 'widget.tgw');
    expect(tgw).toEqual(pkg);
    expect(parts.html).toBe('<p>hi</p>');
    expect(parts.css).toBe('a{}');
  });

  it('detects json by content when the filename has no extension', () => {
    const pkg = buildTgwPackage('<p>hi</p>');
    const { tgw } = parseTgwOrHtml(JSON.stringify(pkg));
    expect(tgw?.html).toBe('<p>hi</p>');
  });

  it('throws when the json package has no html field', () => {
    expect(() => parseTgwOrHtml('{"format":"tg-widget/v1"}', 'x.tgw')).toThrow(/html/);
  });

  it('throws on malformed json', () => {
    expect(() => parseTgwOrHtml('{ broken', 'x.tgw')).toThrow();
  });
});
