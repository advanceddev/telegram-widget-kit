<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatBytes } from '@/core/utils/format';
import { useBuild } from '@/composables/use-build';

const { t } = useI18n();
const build = useBuild();

const rawText = computed(() => {
  const report = build.sizeReport.value;
  return report ? formatBytes(report.raw) : '—';
});

const zlibText = computed(() => {
  const report = build.sizeReport.value;
  if (!report || report.zlib === null) {
    return t('common.measuring');
  }
  return formatBytes(report.zlib);
});

const statusText = computed(() => {
  const verdict = build.sizeVerdict.value;
  return verdict ? t(`size.status.${verdict.messageKey}`) : '—';
});

const statusLevel = computed(() => build.sizeVerdict.value?.level ?? '');
</script>

<template>
  <div class="stats">
    <div class="stat-row">
      <span>{{ t('stats.html') }}</span>
      <strong>{{ rawText }}</strong>
    </div>
    <div class="stat-row">
      <span>{{ t('stats.zlib') }}</span>
      <strong>{{ zlibText }}</strong>
    </div>
    <div class="limit" :class="statusLevel" aria-live="polite">{{ statusText }}</div>
  </div>
</template>

<style scoped>
.stats {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-size: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  color: var(--muted);
}

.stat-row strong {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.limit {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-weight: 600;
  font-size: 12px;
  transition: color var(--transition-fast);
}

.limit.ok {
  color: var(--ok);
}

.limit.warn {
  color: var(--warn);
}

.limit.bad {
  color: var(--danger);
}
</style>
