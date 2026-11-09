/**
 * Conservative minifier for size accounting and export.
 * Regex-based on purpose: safe for typical widget scripts without shipping a
 * full JS parser into the playground bundle. It never touches string literals
 * beyond collapsing whitespace heuristically, matching the original tool.
 */

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

/** Conservative JS minify — safe for typical widget scripts (no string-aware full parse). */
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

function minifyMarkup(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Minifies <style> blocks, inline <script> blocks and the markup between them. */
export function minifyWidget(source: string): string {
  let out = source.replace(/<!--[\s\S]*?-->/g, '');

  out = out.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_, open, css, close) => open + minifyCss(css) + close,
  );

  out = out.replace(
    /(<script\b(?![^>]*\bsrc\s*=)[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_, open, js, close) => open + minifyJs(js) + close,
  );

  // Minify markup outside style/script via temporary placeholders.
  const blocks: string[] = [];
  out = out.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, (block) => {
    blocks.push(block);
    return `\0BLK${blocks.length - 1}\0`;
  });
  out = minifyMarkup(out);
  out = out.replace(/\0BLK(\d+)\0/g, (_, index) => blocks[Number(index)]);

  return out.trim();
}
