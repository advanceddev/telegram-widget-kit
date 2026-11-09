/**
 * The `tg-widget/v1` JSON package — a portable representation of the bot-side
 * `inputMediaWidget` payload (docs/tgw-format.md). The playground exports and
 * re-imports it so widget metadata survives round-trips.
 */

import type { TgwPackage } from '@/model/widget';
import { splitWidgetHtml } from './split-html';
import type { Parts } from '@/model/widget';

export function buildTgwPackage(html: string, opts: Partial<TgwPackage> = {}): TgwPackage {
  return {
    format: 'tg-widget/v1',
    width: opts.width ?? 0,
    height: opts.height ?? 0,
    html,
    allow_queries: opts.allow_queries ?? false,
    fwd_allow_queries: opts.fwd_allow_queries ?? false,
    shared_widget: opts.shared_widget ?? false,
    public_data: opts.public_data ?? null,
    chat_data: opts.chat_data ?? null,
    meta: opts.meta,
  };
}

export function parseTgwOrHtml(text: string, filename = ''): { parts: Parts; tgw?: TgwPackage } {
  const trimmed = text.trim();
  const looksJson =
    filename.endsWith('.tgw') ||
    filename.endsWith('.tgw.json') ||
    filename.endsWith('.json') ||
    (trimmed.startsWith('{') && trimmed.includes('"html"'));

  if (looksJson) {
    const data = JSON.parse(trimmed) as TgwPackage;
    if (!data.html || typeof data.html !== 'string') {
      throw new Error('TGW: missing "html" field');
    }
    return { parts: splitWidgetHtml(data.html), tgw: data };
  }

  return { parts: splitWidgetHtml(trimmed) };
}
