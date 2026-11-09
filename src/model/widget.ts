/**
 * Shared widget-domain types. Type-only module: safe to import from
 * `src/core` (framework-free) and from the Vue application layer.
 */

/** Colour scheme of the mock chat bubble. */
export type WidgetScheme = 'dark' | 'light';

/** The three editable sources of a widget. */
export type SourcePart = 'html' | 'css' | 'js';

/** Raw source split of a widget. */
export type Parts = Record<SourcePart, string>;

/** Tabs of the editor pane: three sources plus the built output. */
export type EditorTab = SourcePart | 'built';

/* ------------------------------------------------------------------ */
/* Lint                                                                */
/* ------------------------------------------------------------------ */

export type LintKind = 'tag' | 'attr' | 'url' | 'css' | 'js';

/**
 * Stable, language-independent issue codes. The UI maps them to localized
 * messages via vue-i18n (`lint.*` keys), so `src/core` stays framework-free.
 */
export type LintIssueCode =
  | 'tagForbidden'
  | 'srcExternal'
  | 'scriptSrc'
  | 'linkTag'
  | 'attrForbidden'
  | 'cssFontFace'
  | 'cssImport'
  | 'cssUrl'
  | 'cssOverflow'
  | 'cssSticky'
  | 'cssViewportUnits'
  | 'css3dTransforms'
  | 'jsNetwork'
  | 'jsEval'
  | 'jsDocumentWrite';

export interface LintIssue {
  kind: LintKind;
  code: LintIssueCode;
  /** Interpolation params for the localized message (`{tag}`, `{api}`, …). */
  params?: Readonly<Record<string, string>>;
}

/* ------------------------------------------------------------------ */
/* Size accounting                                                     */
/* ------------------------------------------------------------------ */

export type SizeLevel = 'ok' | 'warn' | 'bad';

/** Current size accounting for a source state or a built artifact. */
export interface SizeReport {
  /** UTF-8 byte length of the document. */
  raw: number;
  /** Estimated zlib-9 byte length; `null` while measuring. */
  zlib: number | null;
}

/** Verdict of a size check, keyed for i18n. */
export interface SizeVerdict {
  level: SizeLevel;
  /** i18n key under `size.status.*`. */
  messageKey: 'ok' | 'okBuilt' | 'warn' | 'bad';
}

/* ------------------------------------------------------------------ */
/* TGW package (docs/tgw-format.md → inputMediaWidget)                 */
/* ------------------------------------------------------------------ */

/** JSON package exchanged with a bot: `tg-widget/v1`. */
export interface TgwPackage {
  format: 'tg-widget/v1';
  width: number;
  height: number;
  html: string;
  allow_queries?: boolean;
  fwd_allow_queries?: boolean;
  shared_widget?: boolean;
  public_data?: string | null;
  chat_data?: string | null;
  meta?: { name?: string; note?: string };
}

/** Form state of the export panel (see AppSidebar → ExportSettingsPanel). */
export interface TgwFormState {
  allowQueries: boolean;
  fwdAllowQueries: boolean;
  sharedWidget: boolean;
  width: number;
  height: number;
  publicData: string;
  chatData: string;
}
