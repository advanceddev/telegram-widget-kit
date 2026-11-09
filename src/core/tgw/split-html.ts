/**
 * Splits a widget document (fragment or full HTML) back into editable
 * HTML / CSS / JS parts — the inverse of `assembleWidget`.
 */

import type { Parts } from '@/model/widget';

export function splitWidgetHtml(source: string): Parts {
  let css = '';
  let js = '';
  let html = source;

  // Collect <style>…</style>
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, body: string) => {
    css += (css ? '\n' : '') + body.trim();
    return '';
  });

  // Collect inline <script>…</script> (no src)
  html = html.replace(
    /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi,
    (_, body: string) => {
      js += (js ? '\n' : '') + body.trim();
      return '';
    },
  );

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1];
  } else {
    html = html
      .replace(/<!DOCTYPE[^>]*>/i, '')
      .replace(/<\/?html\b[^>]*>/gi, '')
      .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body\b[^>]*>/gi, '');
  }

  return { html: html.trim(), css: css.trim(), js: js.trim() };
}
