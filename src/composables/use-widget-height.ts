import { useEventListener } from './use-event-listener';

/**
 * Listens for the height reporter posted by the SDK mock inside the preview
 * iframe (`{ type: 'tw-widget-height', height }`) and forwards valid reports.
 */

export function useWidgetHeight(onHeight: (height: number) => void): void {
  useEventListener(window, 'message', (raw) => {
    const event = raw as MessageEvent;
    const data: unknown = event.data;
    if (typeof data !== 'object' || data === null) {
      return;
    }
    const message = data as { type?: unknown; height?: unknown };
    if (message.type !== 'tw-widget-height') {
      return;
    }
    if (typeof message.height !== 'number' || !Number.isFinite(message.height)) {
      return;
    }
    onHeight(message.height);
  });
}
