import { getCurrentScope, onScopeDispose } from 'vue';

/**
 * Trailing debounce with `cancel`/`flush` and automatic teardown when the
 * owning scope (component/effect) is disposed — no stray timers after unmount.
 */

export interface DebouncedFn<Args extends unknown[]> {
  (...args: Args): void;
  cancel(): void;
  flush(): void;
}

export function useDebounceFn<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): DebouncedFn<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: Args | null = null;

  function invoke(): void {
    timer = null;
    const args = pendingArgs;
    pendingArgs = null;
    if (args !== null) {
      fn(...args);
    }
  }

  const debounced = ((...args: Args) => {
    pendingArgs = args;
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(invoke, delay);
  }) as DebouncedFn<Args>;

  debounced.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingArgs = null;
  };

  debounced.flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      invoke();
    }
  };

  if (getCurrentScope()) {
    onScopeDispose(() => debounced.cancel());
  }

  return debounced;
}
