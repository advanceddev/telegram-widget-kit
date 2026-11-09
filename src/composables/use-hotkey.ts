import { useEventListener } from './use-event-listener';

/**
 * Global keyboard shortcut. `ctrlOrMeta: true` matches Ctrl (Win/Linux)
 * or Cmd (macOS) — the playground Build hotkey convention.
 */

export interface HotkeyCombo {
  key: string;
  ctrlOrMeta?: boolean;
}

export function useHotkey(combo: HotkeyCombo, handler: (event: KeyboardEvent) => void): void {
  const expectedKey = combo.key.toLowerCase();

  useEventListener(window, 'keydown', (raw) => {
    const event = raw as KeyboardEvent;
    if (event.key.toLowerCase() !== expectedKey) {
      return;
    }
    if (combo.ctrlOrMeta && !(event.ctrlKey || event.metaKey)) {
      return;
    }
    event.preventDefault();
    handler(event);
  });
}
