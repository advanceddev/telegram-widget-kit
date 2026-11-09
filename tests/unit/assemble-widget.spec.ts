import { describe, expect, it } from 'vitest';

import { assembleWidget } from '@/core/assemble';

describe('assembleWidget', () => {
  it('assembles a fragment into a self-contained document', () => {
    const doc = assembleWidget({ html: '<p>hi</p>', css: '', js: '' });
    expect(doc).toBe(
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><p>hi</p></body></html>',
    );
  });

  it('inlines CSS into <head>', () => {
    const doc = assembleWidget({ html: '<p>x</p>', css: 'p{color:red}', js: '' });
    expect(doc).toContain('<style>p{color:red}</style>');
    expect(doc.indexOf('<style>')).toBeLessThan(doc.indexOf('<body>'));
  });

  it('inlines JS at the end of <body>', () => {
    const doc = assembleWidget({ html: '<p>x</p>', css: '', js: 'console.log(1)' });
    expect(doc).toContain('<script>console.log(1)</script>');
    expect(doc.indexOf('<script>')).toBeGreaterThan(doc.indexOf('<body>'));
  });

  it('omits empty style and script tags', () => {
    const doc = assembleWidget({ html: '<p>x</p>', css: '   ', js: '\n\t' });
    expect(doc).not.toContain('<style');
    expect(doc).not.toContain('<script');
  });

  it('unwraps <body> from a full document input', () => {
    const doc = assembleWidget({
      html: '<!DOCTYPE html><html><body><h1>full</h1></body></html>',
      css: '',
      js: '',
    });
    expect(doc).toContain('<body><h1>full</h1></body>');
    expect(doc.match(/<body>/g)).toHaveLength(1);
  });

  it('trims source parts', () => {
    const doc = assembleWidget({ html: '  <b>x</b>  ', css: '  a{}  ', js: '  f()  ' });
    expect(doc).toContain('<body><b>x</b><script>f()</script></body>');
    expect(doc).toContain('<style>a{}</style>');
  });

  it('handles empty html', () => {
    const doc = assembleWidget({ html: '', css: '', js: '' });
    expect(doc).toContain('<body></body>');
  });
});
