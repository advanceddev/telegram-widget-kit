import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ToastStack from '@/components/feedback/ToastStack.vue';
import { TOAST_DURATION_MS } from '@/config/limits';
import { useNotifications } from '@/composables/use-notifications';
import { mountWithI18n } from './helpers';

describe('ToastStack', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // the notifications composable is an app-wide singleton — clear it
    useNotifications().notices.value = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders new notices and caps the stack', () => {
    const notifications = useNotifications();
    for (let i = 0; i < 6; i += 1) {
      notifications.notify(`message-${i}`);
    }
    const wrapper = mountWithI18n(ToastStack, {
      global: { stubs: { teleport: true } },
    });
    const toasts = wrapper.findAll('.toast');
    expect(toasts.length).toBeLessThanOrEqual(4);
    expect(toasts.at(-1)?.text()).toBe('message-5');
  });

  it('auto-dismisses after the configured timeout', async () => {
    const notifications = useNotifications();
    notifications.notifyError('boom');
    const wrapper = mountWithI18n(ToastStack, {
      global: { stubs: { teleport: true } },
    });
    expect(wrapper.findAll('.toast')).toHaveLength(1);
    expect(wrapper.find('.toast--error').exists()).toBe(true);

    vi.advanceTimersByTime(TOAST_DURATION_MS + 10);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.toast')).toHaveLength(0);
  });

  it('dismisses immediately on click', async () => {
    const notifications = useNotifications();
    notifications.notifySuccess('done');
    const wrapper = mountWithI18n(ToastStack, {
      global: { stubs: { teleport: true } },
    });

    await wrapper.find('.toast--success').trigger('click');
    expect(wrapper.findAll('.toast')).toHaveLength(0);
  });
});
