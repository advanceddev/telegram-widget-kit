<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <p class="hint">
    {{ t('sidebar.hintLine1') }}
    {{ t('sidebar.hintLine2') }}<br />
    <kbd>Ctrl</kbd>+<kbd>Enter</kbd> — {{ t('sidebar.hintRebuild') }}
  </p>
</template>

<style scoped>
.hint {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.5;
}

.hint kbd {
  background: var(--bg);
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  border-radius: 4px;
  padding: 0 4px;
  font-size: 10px;
  font-family: var(--mono);
}
</style>
