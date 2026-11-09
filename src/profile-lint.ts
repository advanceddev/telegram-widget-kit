/**
 * Client-side lint against Telegram widget profile 1.
 * Flags tags/attrs the validator would strip or that break the contract.
 */

/** Elements that are dropped or rewritten out of profile */
export const FORBIDDEN_TAGS = [
  'input',
  'select',
  'option',
  'optgroup',
  'textarea',
  'label',
  'fieldset',
  'legend',
  'datalist',
  'output',
  'form',
  'progress',
  'meter',
  'dialog',
  'audio',
  'video',
  'source',
  'track',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'portal',
  'template',
  'slot',
  'math',
  'fencedframe',
  'applet',
  'param',
  // presentational legacy
  'font',
  'center',
  'big',
  'tt',
  'strike',
  'nobr',
] as const;

/** Attributes that are out */
const FORBIDDEN_ATTRS = [
  'contenteditable',
  'spellcheck',
  'inputmode',
  'enterkeyhint',
  'autocapitalize',
  'draggable',
  'tabindex',
  'autofocus',
  'accesskey',
  'align',
  'valign',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'color',
  'face',
  'nowrap',
];

export type LintIssue = {
  kind: 'tag' | 'attr' | 'url' | 'css' | 'js';
  message: string;
};

export function lintWidgetParts(html: string, css: string, js: string): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const tag of FORBIDDEN_TAGS) {
    const re = new RegExp(`<\\s*${tag}\\b`, 'gi');
    if (re.test(html)) {
      issues.push({
        kind: 'tag',
        message: `<${tag}> запрещён в profile 1 (будет удалён клиентом)`,
      });
    }
  }

  if (/\bsrc\s*=\s*["'](?!data:)/i.test(html)) {
    issues.push({
      kind: 'url',
      message: 'src= только data: (PNG/JPEG/GIF/WebP) — внешние URL запрещены',
    });
  }

  if (/<script[^>]+src\s*=/i.test(html)) {
    issues.push({
      kind: 'tag',
      message: '<script src> запрещён — только inline JS',
    });
  }
  if (/<link\b/i.test(html)) {
    issues.push({
      kind: 'tag',
      message: '<link> запрещён — CSS только inline',
    });
  }

  for (const attr of FORBIDDEN_ATTRS) {
    const re = new RegExp(`\\s${attr}\\s*=`, 'i');
    if (re.test(html)) {
      issues.push({
        kind: 'attr',
        message: `атрибут ${attr}= вне профиля`,
      });
    }
  }

  if (/@font-face/i.test(css)) {
    issues.push({
      kind: 'css',
      message: '@font-face запрещён — только system-ui / sans-serif / serif / monospace',
    });
  }
  if (/@import\b/i.test(css)) {
    issues.push({ kind: 'css', message: '@import запрещён' });
  }
  if (/\burl\s*\(\s*["']?(?!data:|#)/i.test(css)) {
    issues.push({ kind: 'css', message: 'url() в CSS только data: или #fragment' });
  }
  if (/\b(overflow)\s*:\s*(auto|scroll)\b/i.test(css)) {
    issues.push({
      kind: 'css',
      message: 'overflow: auto/scroll запрещён — скролла внутри виджета нет',
    });
  }
  if (/\bposition\s*:\s*sticky\b/i.test(css)) {
    issues.push({ kind: 'css', message: 'position: sticky вне профиля' });
  }
  if (/\b(vh|dvh|svh|lvh)\b/i.test(css)) {
    issues.push({ kind: 'css', message: 'единицы vh/dvh/svh вне профиля — используй % / flex' });
  }
  if (
    /\b(rotate[xyz]|translate[z]|perspective|matrix3d|transform-style|backface-visibility)\b/i.test(
      css,
    )
  ) {
    issues.push({ kind: 'css', message: '3D transforms вне профиля' });
  }

  const jsForbidden = [
    [/\bfetch\s*\(/, 'fetch() недоступен (NetworkDisabledError)'],
    [/\bXMLHttpRequest\b/, 'XMLHttpRequest недоступен'],
    [/\bWebSocket\b/, 'WebSocket недоступен'],
    [/\bEventSource\b/, 'EventSource недоступен'],
    [/\bimportScripts\s*\(/, 'importScripts недоступен'],
    [/\bWorker\s*\(/, 'Worker недоступен'],
    [/\beval\s*\(/, 'eval запрещён / не нужен'],
    [/\bnew\s+Function\s*\(/, 'new Function запрещён / не нужен'],
    [/\bdocument\.write\s*\(/, 'document.write вне профиля'],
  ] as const;

  for (const [re, msg] of jsForbidden) {
    if (re.test(js)) {
      issues.push({ kind: 'js', message: msg });
    }
  }

  return issues;
}
