import { RAW_LIMIT, ZLIB_FALLBACK_RATIO, ZLIB_LIMIT, ZLIB_WARN_THRESHOLD } from '@/config/limits';
import type { SizeReport, SizeVerdict } from '@/model/widget';

/**
 * Size accounting for widget payloads: UTF-8 raw length and an estimated
 * zlib level 9 compressed length (the Telegram acceptance limits).
 */

export function rawSize(text: string): number {
  return byteLength(text);
}

const encoder = new TextEncoder();

/** UTF-8 byte length of a string (module-level encoder, no per-call alloc). */
export function byteLength(text: string): number {
  return encoder.encode(text).length;
}

/**
 * Compressed size via the platform CompressionStream (raw deflate + ~6 bytes
 * of the RFC 1950 zlib wrapper). Falls back to a conservative estimate when
 * the API is unavailable (older WebViews, non-browser test environments).
 */
export async function zlibSize(text: string): Promise<number> {
  try {
    const stream = new CompressionStream('deflate');
    const writer = stream.writable.getWriter();
    void writer.write(encoder.encode(text));
    void writer.close();
    const buffer = await new Response(stream.readable).arrayBuffer();
    return buffer.byteLength + 6;
  } catch {
    return Math.round(rawSize(text) * ZLIB_FALLBACK_RATIO);
  }
}

/**
 * Async race guard for debounce pipelines: measures a document and reports
 * `null` if a newer measurement has been requested meanwhile, so stale
 * results never overwrite fresh ones in the UI.
 */
export function createSizeMeasurer() {
  let epoch = 0;

  return {
    /** Invalidates all in-flight measurements. */
    reset(): void {
      epoch += 1;
    },
    async measure(text: string): Promise<SizeReport | null> {
      const ticket = ++epoch;
      const report: SizeReport = { raw: rawSize(text), zlib: await zlibSize(text) };
      return ticket === epoch ? report : null;
    },
  };
}

/** Verdict against the profile 1 limits (32 KB raw / 4 KB zlib). */
export function evaluateSizeVerdict(report: SizeReport, isBuilt: boolean): SizeVerdict {
  const { raw, zlib } = report;
  if (raw > RAW_LIMIT || (zlib !== null && zlib > ZLIB_LIMIT)) {
    return { level: 'bad', messageKey: 'bad' };
  }
  if (zlib !== null && zlib > ZLIB_WARN_THRESHOLD) {
    return { level: 'warn', messageKey: 'warn' };
  }
  return { level: 'ok', messageKey: isBuilt ? 'okBuilt' : 'ok' };
}
