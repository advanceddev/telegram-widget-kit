export type Parts = { html: string; css: string; js: string };

export function splitWidgetHtml(source: string): Parts {
  let css = '';
  let js = '';
  let html = source;

  // Collect <style>…</style>
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, body) => {
    css += (css ? '\n' : '') + body.trim();
    return '';
  });

  // Collect inline <script>…</script> (no src)
  html = html.replace(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi, (_, body) => {
    js += (js ? '\n' : '') + body.trim();
    return '';
  });

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

  return {
    html: html.trim(),
    css: css.trim(),
    js: js.trim(),
  };
}

/** docs/tgw-format.md inputMediaWidget) */
export type TgwPackage = {
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
};

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

export function parseTgwOrHtml(
  text: string,
  filename = '',
): {
  parts: Parts;
  tgw?: TgwPackage;
} {
  const trimmed = text.trim();
  const looksJson =
    filename.endsWith('.tgw') ||
    filename.endsWith('.tgw.json') ||
    filename.endsWith('.json') ||
    (trimmed.startsWith('{') && trimmed.includes('"html"'));

  if (looksJson) {
    const data = JSON.parse(trimmed) as TgwPackage;
    if (!data.html || typeof data.html !== 'string') {
      throw new Error('TGW: отсутствует поле html');
    }
    return { parts: splitWidgetHtml(data.html), tgw: data };
  }

  return { parts: splitWidgetHtml(trimmed) };
}
