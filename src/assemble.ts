/**
 * Assemble HTML + CSS + JS into a single self-contained widget document,
 * and a stronger minify for size checks / export.
 */

export function assembleWidget(html: string, css: string, js: string): string {
  const body = html.trim();
  const style = css.trim();
  const script = js.trim();

  let inner = body;
  if (/<html[\s>]/i.test(body)) {
    const m = body.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    inner = m ? m[1].trim() : body;
  }

  const parts = ['<!DOCTYPE html>', '<html>', '<head>', '<meta charset="utf-8">'];

  if (style) {
    parts.push(`<style>${style}</style>`);
  }

  parts.push('</head>', '<body>', inner || '');

  if (script) {
    parts.push(`<script>${script}</script>`);
  }

  parts.push('</body>', '</html>');
  return parts.join('');
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>~+=])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/:0(px|em|rem|%)/g, ':0')
    .replace(/([: ,(])0+\.(\d)/g, '$1.$2')
    .trim();
}

/** Conservative JS minify — safe for typical widget scripts (no string-aware full parse) */
function minifyJs(js: string): string {
  return (
    js
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // strip // comments not inside strings (heuristic)
      .replace(/(^|[^:\\])\/\/[^\n\r]*/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};,=()[\]<>!~?:+\-*/%&|^])\s*/g, '$1')
      .replace(/;}/g, '}')
      .replace(/\{;/g, '{')
      .trim()
  );
}

function minifyHtmlMarkup(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Stronger minify used for Built tab / export sizes */
export function minifyWidget(source: string): string {
  let out = source.replace(/<!--[\s\S]*?-->/g, '');

  out = out.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, a, css, c) => {
    return a + minifyCss(css) + c;
  });

  out = out.replace(
    /(<script\b(?![^>]*\bsrc\s*=)[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_, a, js, c) => {
      return a + minifyJs(js) + c;
    },
  );

  // minify markup outside style/script by temporary placeholders
  const blocks: string[] = [];
  out = out.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, (m) => {
    blocks.push(m);
    return `\0BLK${blocks.length - 1}\0`;
  });
  out = minifyHtmlMarkup(out);
  out = out.replace(/\0BLK(\d+)\0/g, (_, i) => blocks[+i]);

  return out.trim();
}

export async function zlibSize(text: string): Promise<number> {
  try {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(text));
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    // raw deflate + ~6 bytes zlib wrapper (RFC 1950)
    return buf.byteLength + 6;
  } catch {
    return Math.round(new TextEncoder().encode(text).length * 0.45);
  }
}

export function rawSize(text: string): number {
  return new TextEncoder().encode(text).length;
}
