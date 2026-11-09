import { mount, type ComponentMountingOptions } from '@vue/test-utils';
import { createAppI18n, DEFAULT_LOCALE, type AppLocale } from '@/i18n';

/** Mounts a component with a fresh vue-i18n instance (no cross-test leakage). */
export function mountWithI18n<T>(
  component: T,
  options: ComponentMountingOptions<T> = {},
  locale: AppLocale = DEFAULT_LOCALE,
) {
  return mount(component as never, {
    ...options,
    global: {
      ...options.global,
      plugins: [...(options.global?.plugins ?? []), createAppI18n(locale)],
    },
  });
}
