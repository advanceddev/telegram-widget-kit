<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { usePreview } from '@/composables/use-preview';

const { t } = useI18n();
const { scheme, setScheme } = usePreview();
</script>

<template>
  <div class="field">
    <span class="field-label">{{ t('sidebar.themeToggle') }}</span>
    <div class="segment" role="group" :aria-label="t('sidebar.themeToggle')">
      <button
        type="button"
        class="segment-btn"
        :class="{ 'is-active': scheme === 'dark' }"
        :aria-pressed="scheme === 'dark'"
        :title="t('sidebar.themeDark')"
        @click="setScheme('dark')"
      >
        <svg class="segment-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M10.9 9.7a5.3 5.3 0 0 1-4.6-4.6 5.3 5.3 0 0 1 .1-1.6 5.4 5.4 0 1 0 6.1 6.1c-.5.1-1 .2-1.6.1Z"
            fill="currentColor"
          />
        </svg>
        {{ t('sidebar.themeDark') }}
      </button>
      <button
        type="button"
        class="segment-btn"
        :class="{ 'is-active': scheme === 'light' }"
        :aria-pressed="scheme === 'light'"
        :title="t('sidebar.themeLight')"
        @click="setScheme('light')"
      >
        <svg class="segment-icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="3.2" fill="currentColor" />
          <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
            <path
              d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1"
            />
          </g>
        </svg>
        {{ t('sidebar.themeLight') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.segment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
}

.segment-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.segment-btn:hover {
  color: var(--text);
}

.segment-btn.is-active {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.segment-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
</style>
