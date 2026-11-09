import type { MessageSchema } from '@/i18n';

/** English messages — type-checked against the Russian schema. */
export const en: MessageSchema = {
  common: {
    px: 'px',
    measuring: '…',
  },

  locale: {
    label: 'Interface language',
  },

  sidebar: {
    sectionSource: 'Widget',
    sectionChecks: 'Checks',
    templateLabel: 'Template',
    widthLabel: 'Bubble width',
    themeToggle: 'Chat theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    hintLine1: 'Separate sources: HTML · CSS · JS.',
    hintLine2: 'Edits apply to the preview automatically; exports always use the latest build.',
    hintRebuild: 'rebuild right away.',
  },

  export: {
    summary: 'Export settings',
    note:
      'inputMediaWidget parameters for the bot (not inside the HTML). The HTML is fixed when ' +
      'the widget is sent; the bot can update public_data and chat_data later.',
    allowQueries: 'allow_queries',
    fwdAllowQueries: 'fwd_allow_queries',
    sharedWidget: 'shared_widget',
    dimensions: 'width / height (0 = auto)',
    publicData: 'public_data (JSON, ≤1024 B)',
    chatData: 'chat_data (JSON, ≤1024 B)',
  },

  stats: {
    html: 'HTML',
    zlib: 'zlib-9',
  },

  size: {
    status: {
      ok: 'OK (limits 32 KB / 4 KB)',
      okBuilt: 'OK · ready to send',
      warn: 'Close to the limit — keep headroom',
      bad: 'LIMIT EXCEEDED (32 KB / 4 KB)',
    },
  },

  lint: {
    title: '⚠ Profile violations',
    tagForbidden: '<{tag}> is forbidden in profile 1 (the client strips it)',
    srcExternal: 'src= accepts data: URIs only (PNG/JPEG/GIF/WebP) — external URLs are forbidden',
    scriptSrc: '<script src> is forbidden — inline JS only',
    linkTag: '<link> is forbidden — inline CSS only',
    attrForbidden: 'attribute {attr}= is outside the profile',
    cssFontFace: "{'@'}font-face is forbidden — system-ui / sans-serif / serif / monospace only",
    cssImport: "{'@'}import is forbidden",
    cssUrl: 'CSS url() accepts data: or #fragment only',
    cssOverflow: 'overflow: auto/scroll is forbidden — widgets do not scroll',
    cssSticky: 'position: sticky is outside the profile',
    cssViewportUnits: 'vh/dvh/svh units are outside the profile — use % / flex',
    css3dTransforms: '3D transforms are outside the profile',
    jsNetwork: '{api} is unavailable (NetworkDisabledError)',
    jsEval: '{api} is forbidden / never needed',
    jsDocumentWrite: 'document.write is outside the profile',
  },

  editor: {
    tabHtml: 'HTML',
    tabCss: 'CSS',
    tabJs: 'JS',
    tabBuilt: 'Built',
    builtEmpty: 'The minified build output will appear here.',
    loading: 'Loading editor…',
  },

  format: {
    button: 'Format',
    title: 'Format document ({hotkey})',
    hotkeyMac: '⇧ ⌥ F',
    hotkeyOther: 'Shift+Alt+F',
    error: 'Could not format {part} — check the syntax',
  },

  preview: {
    title: 'Preview',
    frameTitle: 'Widget preview',
  },

  actions: {
    copy: 'Copy HTML',
    copied: 'Copied ✓',
    downloadHtml: 'Download .html',
    downloadTgw: 'Download .tgw',
    open: 'Open file…',
  },

  templates: {
    custom: 'custom',
    example: 'example',
    card: 'card',
    counter: 'counter',
    status: 'status',
    converter: 'converter',
    wallet: 'wallet',
    cube3d: 'cube 3d',
    poll: 'poll · corpus',
    ticker: 'ticker · corpus',
    promo: 'promo · corpus',
    order: 'order · corpus',
  },

  toast: {
    fileOpened: 'File loaded: {name}',
    openError: 'Could not open: {message}',
    publicDataTooBig: 'public_data exceeds {limit} bytes ({size})',
    chatDataTooBig: 'chat_data exceeds {limit} bytes ({size})',
  },

  layout: {
    splitLabel: 'Resize the editor and preview panes',
  },
};
