<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { TEMPLATES } from '@/core/templates/templates';
import { useWidgetSources } from '@/composables/use-widget-sources';

const { t } = useI18n();
const sources = useWidgetSources();

function onTemplateChange(event: Event): void {
  const key = (event.target as HTMLSelectElement).value;
  if (key) {
    sources.setTemplate(key);
  }
}
</script>

<template>
  <label class="field">
    <span class="field-label">{{ t('sidebar.templateLabel') }}</span>
    <select class="field-control" :value="sources.state.activeTemplate" @change="onTemplateChange">
      <option v-if="sources.state.activeTemplate === ''" value="">
        {{ t('templates.custom') }}
      </option>
      <option v-for="(_template, key) in TEMPLATES" :key="key" :value="key">
        {{ t(`templates.${key}`) }}
      </option>
    </select>
  </label>
</template>
