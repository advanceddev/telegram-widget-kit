/**
 * Source formatting over the Prettier standalone browser build.
 *
 * The formatter and its parser plugins live in separate chunks fetched on
 * first use (`import()`), so the startup bundle never pays for them — same
 * lazy-loading strategy as the CodeMirror integration. Framework-free: a
 * pure async function over `prettier/standalone`, no Vue types here.
 *
 * Widget sources are fragments by design (see core/assemble), and imported
 * `.html` / `.tgw` files arrive minified — the `html` parser handles both
 * bare fragments and full documents, `babel` covers modern widget JS.
 */

import type { Plugin } from 'prettier';

import type { SourcePart } from '@/model/widget';

export type FormatPart = SourcePart;

/** Prettier parser used for each widget source part. */
const PARSERS: Record<FormatPart, 'html' | 'css' | 'babel'> = {
  html: 'html',
  css: 'css',
  js: 'babel',
};

/**
 * Formatting conventions (mirrors the original playground: 2-space indent,
 * LF). Widgets have a hard 32 KB budget, so a compact `printWidth` keeps
 * formatted sources reviewable without inflating line counts.
 */
const FORMAT_OPTIONS = {
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'lf',
  singleQuote: false,
  htmlWhitespaceSensitivity: 'css',
} as const;

type PrettierStandalone = typeof import('prettier/standalone');

interface LoadedFormatter {
  prettier: PrettierStandalone;
  plugins: Plugin[];
}

let loader: Promise<LoadedFormatter> | null = null;

/** Loads the standalone formatter + parser plugins once (async chunks). */
function loadFormatter(): Promise<LoadedFormatter> {
  loader ??= Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/html'),
    import('prettier/plugins/postcss'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
  ]).then(([core, html, postcss, babel, estree]) => ({
    prettier: core,
    // Each plugin module exports the plugin surface at its namespace root.
    plugins: [html, postcss, babel, estree] as unknown as Plugin[],
  }));
  return loader;
}

export interface FormatService {
  /**
   * Pretty-prints one widget source part. Rejects when the document cannot
   * be parsed (syntax error) — callers surface that as user feedback and
   * must leave the source untouched.
   */
  format(part: FormatPart, text: string): Promise<string>;
}

export function createFormatService(): FormatService {
  return {
    async format(part: FormatPart, text: string): Promise<string> {
      const { prettier, plugins } = await loadFormatter();
      return prettier.format(text, {
        ...FORMAT_OPTIONS,
        parser: PARSERS[part],
        plugins,
      });
    },
  };
}
