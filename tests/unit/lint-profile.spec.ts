import { describe, expect, it } from 'vitest';

import { FORBIDDEN_TAGS, lintWidgetParts } from '@/core/lint';

describe('lintWidgetParts — html', () => {
  it('accepts clean sources without issues', () => {
    const issues = lintWidgetParts(
      '<p style="color:red">ok</p>',
      'p { color: red; }',
      'document.getElementById("x").onclick = () => {};',
    );
    expect(issues).toEqual([]);
  });

  it('flags every forbidden tag with a stable code', () => {
    for (const tag of FORBIDDEN_TAGS) {
      const issues = lintWidgetParts(`<${tag}></${tag}>`, '', '');
      const tagIssues = issues.filter((issue) => issue.code === 'tagForbidden');
      expect(tagIssues, tag).toHaveLength(1);
      expect(tagIssues[0]).toEqual({
        kind: 'tag',
        code: 'tagForbidden',
        params: { tag },
      });
    }
  });

  it('matches forbidden tags case-insensitively and with attributes', () => {
    const issues = lintWidgetParts('<INPUT type="text"><Form action="x"></Form>', '', '');
    const tags = issues.map((issue) => issue.params?.tag);
    expect(tags).toContain('input');
    expect(tags).toContain('form');
  });

  it('flags external src but allows data: URIs', () => {
    expect(lintWidgetParts('<img src="https://x.com/a.png">', '', '')).toEqual([
      { kind: 'url', code: 'srcExternal' },
    ]);
    expect(lintWidgetParts('<img src="data:image/png;base64,AAAA">', '', '')).toEqual([]);
  });

  it('flags <script src> and <link>', () => {
    const issues = lintWidgetParts('<script src="a.js"></script><link rel="x">', '', '');
    const codes = issues.map((issue) => issue.code);
    expect(codes).toContain('scriptSrc');
    expect(codes).toContain('linkTag');
  });

  it('flags forbidden attributes', () => {
    const issues = lintWidgetParts('<div tabindex="0" draggable="true"></div>', '', '');
    const attrs = issues.map((issue) => issue.params?.attr);
    expect(attrs).toContain('tabindex');
    expect(attrs).toContain('draggable');
  });
});

describe('lintWidgetParts — css', () => {
  const cases: ReadonlyArray<readonly [string]> = [
    ['@font-face { font-family: X; }'],
    ['@import "a.css";'],
    ['a { background: url(https://x.com/i.png); }'],
    ['a { overflow: auto; }'],
    ['a { overflow-y: scroll; }'],
    ['a { overflow-x: auto; }'],
    ['a { position: sticky; top: 0; }'],
    ['a { height: 100vh; }'],
    ['a { margin: 10 vh; }'],
    ['a { transform: rotateX(45deg); }'],
    ['a { perspective: 100px; }'],
  ];

  it.each(cases)('flags %s', (css) => {
    const issues = lintWidgetParts('', css, '');
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('css');
  });

  it('allows data: and fragment CSS urls', () => {
    const issues = lintWidgetParts(
      '',
      'a { background: url(data:image/png;base64,AA); }\nb { mask: url(#frag); }',
      '',
    );
    expect(issues).toEqual([]);
  });

  it('allows 2D transforms and % / flex sizing', () => {
    const issues = lintWidgetParts(
      '',
      'a { transform: rotate(45deg) translate(1px, 2px); height: 100%; }',
      '',
    );
    expect(issues).toEqual([]);
  });
});

describe('lintWidgetParts — js', () => {
  const cases: ReadonlyArray<readonly [string, string, string | null]> = [
    ['fetch("/api")', 'jsNetwork', 'fetch()'],
    ['new XMLHttpRequest()', 'jsNetwork', 'XMLHttpRequest'],
    ['new WebSocket("wss://x")', 'jsNetwork', 'WebSocket'],
    ['new EventSource("/e")', 'jsNetwork', 'EventSource'],
    ['importScripts("a.js")', 'jsNetwork', 'importScripts'],
    ['new Worker("w.js")', 'jsNetwork', 'Worker'],
    ['eval("1+1")', 'jsEval', 'eval()'],
    ['new Function("return 1")', 'jsEval', 'new Function()'],
    ['document.write("<p>")', 'jsDocumentWrite', null],
  ];

  it.each(cases)('flags %s', (js, code, api) => {
    const issues = lintWidgetParts('', '', js);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('js');
    expect(issues[0].code).toBe(code);
    if (api === null) {
      expect(issues[0].params).toBeUndefined();
    } else {
      expect(issues[0].params).toEqual({ api });
    }
  });

  it('ignores word-adjacent mentions like `fetchable`', () => {
    const issues = lintWidgetParts('', '', 'var fetchable = true;');
    expect(issues).toEqual([]);
  });
});
