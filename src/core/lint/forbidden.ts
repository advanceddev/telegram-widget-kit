/**
 * Elements and attributes that Telegram's profile 1 validator drops or that
 * break the widget contract (docs/sdk-v1.md, docs/profile-v1.md).
 */

/** Elements that are dropped or rewritten out of profile. */
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

/** Attributes that are out. */
export const FORBIDDEN_ATTRS = [
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
] as const;

/** JS APIs blocked by the sandbox (NetworkDisabledError / inert). */
export const FORBIDDEN_JS_APIS = [
  { pattern: /\bfetch\s*\(/, code: 'jsNetwork', api: 'fetch()' },
  { pattern: /\bXMLHttpRequest\b/, code: 'jsNetwork', api: 'XMLHttpRequest' },
  { pattern: /\bWebSocket\b/, code: 'jsNetwork', api: 'WebSocket' },
  { pattern: /\bEventSource\b/, code: 'jsNetwork', api: 'EventSource' },
  { pattern: /\bimportScripts\s*\(/, code: 'jsNetwork', api: 'importScripts' },
  { pattern: /\bWorker\s*\(/, code: 'jsNetwork', api: 'Worker' },
  { pattern: /\beval\s*\(/, code: 'jsEval', api: 'eval()' },
  { pattern: /\bnew\s+Function\s*\(/, code: 'jsEval', api: 'new Function()' },
] as const;
