import { useEventListener } from './use-event-listener';

/**
 * Global keyboard shortcut.
 *
 * - `ctrlOrMeta: true` matches Ctrl (Win/Linux) or Cmd (macOS) — the
 *   playground rebuild hotkey convention (Ctrl/Cmd+Enter).
 * - `code` matches the physical key, so combos survive keyboard layouts and
 *   macOS modifier characters (Option+F produces `ƒ`, not `f`).
 * - `shift` / `alt` are compared exactly when set.
 * - Events already consumed elsewhere (e.g. the CodeMirror-scoped handler)
 *   arrive here with `defaultPrevented` and are ignored — no double fires.
 */

export interface HotkeyCombo {
  /** Logical key to match (`event.key`), e.g. `'Enter'`. */
  key?: string;
  /** Physical key to match (`event.code`), e.g. `'KeyF'`. Takes precedence. */
  code?: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useHotkey(combo: HotkeyCombo, handler: (event: KeyboardEvent) => void): void {
  const expectedKey = combo.key?.toLowerCase();

  useEventListener(window, 'keydown', (raw) => {
    const event = raw as KeyboardEvent;
    if (event.defaultPrevented) {
      return;
    }
    if (combo.code !== undefined) {
      if (event.code !== combo.code) {
        return;
      }
    } else if (expectedKey !== undefined) {
      if (event.key.toLowerCase() !== expectedKey) {
        return;
      }
    } else {
      return;
    }
    if (combo.ctrlOrMeta && !(event.ctrlKey || event.metaKey)) {
      return;
    }
    if (combo.shift !== undefined && event.shiftKey !== combo.shift) {
      return;
    }
    if (combo.alt !== undefined && event.altKey !== combo.alt) {
      return;
    }
    event.preventDefault();
    handler(event);
  });
}
