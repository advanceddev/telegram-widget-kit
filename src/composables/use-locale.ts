import { computed, type ComputedRef } from 'vue';

import { DEFAULT_LOCALE, i18n, isAppLocale, type AppLocale } from '@/i18n';

/**
 * Locale state bound to the global vue-i18n instance. Keeping it outside
 * component setup lets persistence and the bootstrapping code use it too.
 */

export function useLocale(): {
  locale: ComputedRef<AppLocale>;
  setLocale(locale: AppLocale): void;
} {
  const locale = computed(() => {
    const current = i18n.global.locale.value;
    return isAppLocale(current) ? current : DEFAULT_LOCALE;
  });

  return {
    locale,

    setLocale(next: AppLocale): void {
      i18n.global.locale.value = next;
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next;
      }
    },
  };
}
