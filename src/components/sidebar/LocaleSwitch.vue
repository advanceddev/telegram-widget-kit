<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useLocale } from '@/composables/use-locale';
import { SUPPORTED_LOCALES } from '@/i18n';

const { t } = useI18n();
const { locale, setLocale } = useLocale();
</script>

<template>
  <div class="locale-switch" role="group" :aria-label="t('locale.label')">
    <button
      v-for="item in SUPPORTED_LOCALES"
      :key="item"
      type="button"
      class="locale-btn"
      :class="{ 'is-active': locale === item }"
      :aria-pressed="locale === item"
      @click="setLocale(item)"
    >
      {{ item.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.locale-switch {
  display: inline-flex;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px;
  gap: 2px;
}

.locale-btn {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.locale-btn:hover {
  color: var(--text);
}

.locale-btn.is-active {
  background: var(--accent);
  color: #ffffff;
}
</style>
