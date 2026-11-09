import { getCurrentScope, onScopeDispose } from 'vue';

/**
 * `addEventListener` with automatic removal when the owning scope is
 * disposed. Keeps component code free of manual listener bookkeeping.
 */

type EventTargetLike = Window | Document | HTMLElement;

export function useEventListener(
  target: EventTargetLike,
  event: string,
  handler: (event: Event) => void,
  options?: AddEventListenerOptions,
): void {
  target.addEventListener(event, handler, options);

  if (getCurrentScope()) {
    onScopeDispose(() => target.removeEventListener(event, handler, options));
  }
}
