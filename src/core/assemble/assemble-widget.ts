/**
 * Assembles HTML + CSS + JS into a single self-contained widget document —
 * the exact payload shape Telegram expects (one mini-HTML file, inline
 * <style> in <head>, inline <script> at the end of <body>).
 */

import type { Parts } from '@/model/widget';

export function assembleWidget(parts: Parts): string {
  const body = extractBodyMarkup(parts.html);
  const style = parts.css.trim();
  const script = parts.js.trim();

  const chunks: string[] = ['<!DOCTYPE html>', '<html>', '<head>', '<meta charset="utf-8">'];

  if (style) {
    chunks.push(`<style>${style}</style>`);
  }

  chunks.push('</head>', '<body>', body || '');

  if (script) {
    chunks.push(`<script>${script}</script>`);
  }

  chunks.push('</body>', '</html>');
  return chunks.join('');
}

/** Accepts both a fragment and a full document; unwraps <body> when present. */
function extractBodyMarkup(html: string): string {
  const body = html.trim();
  if (!/<html[\s>]/i.test(body)) {
    return body;
  }
  const match = body.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return (match ? match[1] : body).trim();
}
