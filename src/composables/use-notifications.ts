import { ref, type Ref } from 'vue';

import { TOAST_DURATION_MS, TOAST_STACK_MAX } from '@/config/limits';

/**
 * Lightweight toast queue (replaces the original `alert()` calls).
 * Notifications auto-dismiss; the stack is capped to avoid flooding.
 */

export type NoticeKind = 'error' | 'success' | 'info';

export interface Notice {
  id: number;
  kind: NoticeKind;
  message: string;
}

export interface NotificationsApi {
  readonly notices: Ref<Notice[]>;
  notify(message: string, kind?: NoticeKind): void;
  notifyError(message: string): void;
  notifySuccess(message: string): void;
  dismiss(id: number): void;
}

export function createNotifications(): NotificationsApi {
  const notices = ref<Notice[]>([]);
  let nextId = 0;
  const timers = new Map<number, ReturnType<typeof setTimeout>>();

  function scheduleDismiss(id: number): void {
    timers.set(
      id,
      setTimeout(() => dismiss(id), TOAST_DURATION_MS),
    );
  }

  function dismiss(id: number): void {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }
    notices.value = notices.value.filter((notice) => notice.id !== id);
  }

  function notify(message: string, kind: NoticeKind = 'info'): void {
    const notice: Notice = { id: ++nextId, kind, message };
    notices.value = [...notices.value, notice].slice(-TOAST_STACK_MAX);
    scheduleDismiss(notice.id);
  }

  return {
    notices,
    notify,
    notifyError: (message) => notify(message, 'error'),
    notifySuccess: (message) => notify(message, 'success'),
    dismiss,
  };
}

const singleton = createNotifications();

export function useNotifications(): NotificationsApi {
  return singleton;
}
