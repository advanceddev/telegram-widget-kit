/**
 * Browser-facing export helpers: clipboard with a legacy fallback, blob
 * downloads and the bot-side `tg-widget/v1` package assembly.
 */

import { buildTgwPackage } from '@/core/tgw';
import { byteLength } from '@/core/assemble';
import type { TgwFormState, TgwPackage } from '@/model/widget';

/** Copies text via the async Clipboard API, falling back to execCommand. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyViaHiddenTextarea(text);
  }
}

function copyViaHiddenTextarea(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

/** Triggers a client-side file download and revokes the object URL. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Maps the export form onto the `inputMediaWidget` fields (tgw-format.md):
 * `fwd_allow_queries` implies both `allow_queries` and `shared_widget`.
 */
export function buildWidgetTgw(minifiedHtml: string, form: TgwFormState): TgwPackage {
  return buildTgwPackage(minifiedHtml, {
    width: form.width,
    height: form.height,
    allow_queries: form.allowQueries || form.fwdAllowQueries,
    fwd_allow_queries: form.fwdAllowQueries,
    shared_widget: form.sharedWidget || form.fwdAllowQueries,
    public_data: form.publicData.trim() || null,
    chat_data: form.chatData.trim() || null,
    meta: { name: 'widget', note: 'TG Widget Kit · maps to inputMediaWidget (docs/tgw-format.md)' },
  });
}

export { byteLength as dataByteLength };
