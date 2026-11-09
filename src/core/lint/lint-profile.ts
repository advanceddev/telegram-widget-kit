/**
 * Client-side lint against Telegram widget profile 1.
 * Flags tags/attrs the validator would strip and APIs the sandbox blocks.
 *
 * Issues carry stable `code`s + interpolation params; localized wording lives
 * in `src/i18n/locales/*` (`lint.*`), keeping this module framework-free.
 */

import type { LintIssue, LintIssueCode } from '@/model/widget';
import { FORBIDDEN_ATTRS, FORBIDDEN_JS_APIS, FORBIDDEN_TAGS } from './forbidden';

export function lintWidgetParts(html: string, css: string, js: string): LintIssue[] {
  const issues: LintIssue[] = [];
  pushHtmlIssues(issues, html);
  pushCssIssues(issues, css);
  pushJsIssues(issues, js);
  return issues;
}

function pushHtmlIssues(issues: LintIssue[], html: string): void {
  for (const tag of FORBIDDEN_TAGS) {
    if (new RegExp(`<\\s*${tag}\\b`, 'i').test(html)) {
      issues.push({ kind: 'tag', code: 'tagForbidden', params: { tag } });
    }
  }

  if (/\bsrc\s*=\s*["'](?!data:)/i.test(html)) {
    issues.push({ kind: 'url', code: 'srcExternal' });
  }

  if (/<script[^>]+src\s*=/i.test(html)) {
    issues.push({ kind: 'tag', code: 'scriptSrc' });
  }

  if (/<link\b/i.test(html)) {
    issues.push({ kind: 'tag', code: 'linkTag' });
  }

  for (const attr of FORBIDDEN_ATTRS) {
    if (new RegExp(`\\s${attr}\\s*=`, 'i').test(html)) {
      issues.push({ kind: 'attr', code: 'attrForbidden', params: { attr } });
    }
  }
}

function pushCssIssues(issues: LintIssue[], css: string): void {
  const rules: ReadonlyArray<readonly [RegExp, LintIssueCode]> = [
    [/@font-face/i, 'cssFontFace'],
    [/@import\b/i, 'cssImport'],
    [/\burl\s*\(\s*["']?(?!data:|#)/i, 'cssUrl'],
    // covers overflow-x/y/inline/block too (the original pattern missed them)
    [/\boverflow(?:-x|-y|-inline|-block)?\s*:\s*(auto|scroll)\b/i, 'cssOverflow'],
    [/\bposition\s*:\s*sticky\b/i, 'cssSticky'],
    // a digit before the unit: `100vh` (the original \bvh\b pattern missed it)
    [/\d\s*(vh|dvh|svh|lvh)\b/i, 'cssViewportUnits'],
    [
      /\b(rotate[xyz]|translate[z]|perspective|matrix3d|transform-style|backface-visibility)\b/i,
      'css3dTransforms',
    ],
  ];

  for (const [pattern, code] of rules) {
    if (pattern.test(css)) {
      issues.push({ kind: 'css', code });
    }
  }
}

function pushJsIssues(issues: LintIssue[], js: string): void {
  for (const { pattern, code, api } of FORBIDDEN_JS_APIS) {
    if (pattern.test(js)) {
      issues.push({ kind: 'js', code, params: { api } });
    }
  }

  if (/\bdocument\.write\s*\(/.test(js)) {
    issues.push({ kind: 'js', code: 'jsDocumentWrite' });
  }
}
