<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBuild } from '@/composables/use-build';

const { t } = useI18n();
const build = useBuild();

const output = computed(() => build.builtMinified.value);
</script>

<template>
  <pre v-if="output" class="built-pre">{{ output }}</pre>
  <div v-else class="built-empty">{{ t('editor.builtEmpty') }}</div>
</template>

<style scoped>
.built-pre {
  height: 100%;
  overflow: auto;
  margin: 0;
  padding: 14px 16px;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.5;
  color: #b8c0d0;
  white-space: pre-wrap;
  word-break: break-all;
  background: #0d0f14;
}

.built-empty {
  padding: 14px 16px;
  font-size: 12px;
  color: var(--muted);
}
</style>
