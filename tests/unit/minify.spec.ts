import { describe, expect, it } from 'vitest';

import { minifyWidget } from '@/core/assemble';

describe('minifyWidget', () => {
  it('minifies CSS inside <style> blocks', () => {
    const out = minifyWidget('<style>p { color : red ; margin : 0px ; }</style>');
    expect(out).toBe('<style>p{color:red;margin:0}</style>');
  });

  it('strips CSS comments and drops the trailing semicolon', () => {
    const out = minifyWidget('<style>/* header */\np{color:red;}</style>');
    expect(out).toBe('<style>p{color:red}</style>');
  });

  it('minifies JS inside inline <script> blocks', () => {
    const out = minifyWidget(
      '<script>\n  // leading comment\n  var  a = 1;\n  /* block */ var b = 2;\n</script>',
    );
    expect(out).toBe('<script>var a=1;var b=2;</script>');
  });

  it('does not minify external <script src> blocks', () => {
    const source = '<script  src="x.js" >var  a = 1;</script>';
    const out = minifyWidget(source);
    expect(out).toContain('var  a = 1;');
  });

  it('protects // inside string literals (heuristic)', () => {
    const out = minifyWidget("<script>var url = 'http://example.com';</script>");
    expect(out).toBe("<script>var url='http://example.com';</script>");
  });

  it('minifies markup between blocks and restores the blocks', () => {
    const out = minifyWidget(
      '<div>   spaced   </div> <style>p{color:red}</style> <!-- gone --> <b>ok</b>',
    );
    expect(out).toBe('<div> spaced </div> <style>p{color:red}</style> <b>ok</b>');
    expect(out).not.toContain('<!--');
  });

  it('removes HTML comments everywhere', () => {
    expect(minifyWidget('<!-- a --><p>x</p><!-- b -->')).toBe('<p>x</p>');
  });

  it('returns trimmed output for an empty document', () => {
    expect(minifyWidget('')).toBe('');
  });
});
