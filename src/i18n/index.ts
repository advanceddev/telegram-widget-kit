import { createI18n } from 'vue-i18n';

import { en } from './locales/en';
import { ru } from './locales/ru';

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

/** Russian is the source of truth for the message schema. */
export type MessageSchema = typeof ru;

export const DEFAULT_LOCALE: AppLocale = 'ru';

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function createAppI18n(initialLocale: AppLocale = DEFAULT_LOCALE) {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: { ru, en },
    missingWarn: false,
    fallbackWarn: false,
  });
}

/** App-wide instance. `main.ts` mounts it; composables bind to it directly. */
export const i18n = createAppI18n();

export { en, ru };
