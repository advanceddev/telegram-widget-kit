import { createApp } from 'vue';

import App from './App.vue';
import { i18n } from './i18n';
import { usePersistenceBinding } from './composables/use-persistence-binding';
import { usePreview } from './composables/use-preview';
import { applyThemeVars } from './core/mock';

import './assets/styles/tokens.css';
import './assets/styles/base.css';
import './assets/styles/ui.css';

// Restore persisted preferences before the first render to avoid flicker.
usePersistenceBinding().restore();

// Apply the theme palette to <html> up front (no flash of default colours).
if (typeof document !== 'undefined') {
  applyThemeVars(document.documentElement, usePreview().scheme.value);
  document.documentElement.lang = i18n.global.locale.value;
}

createApp(App).use(i18n).mount('#app');
