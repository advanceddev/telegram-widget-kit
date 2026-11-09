<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBuild } from '@/composables/use-build';
import type { LintIssue } from '@/model/widget';

const { t } = useI18n();
const build = useBuild();

const issues = computed(() => build.lintIssues.value);

function formatIssue(issue: LintIssue): string {
  return t(`lint.${issue.code}`, issue.params ?? {});
}
</script>

<template>
  <div v-if="issues.length" class="lint-panel" role="alert">
    <div class="lint-title">{{ t('lint.title') }}</div>
    <ul class="lint-list">
      <li v-for="(issue, index) in issues" :key="`${issue.code}-${index}`">
        {{ formatIssue(issue) }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lint-panel {
  background: var(--danger-soft);
  border: 1px solid rgba(229, 57, 53, 0.35);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-size: 11px;
  animation: lint-in var(--transition-medium) ease-out;
}

@keyframes lint-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lint-title {
  font-weight: 650;
  color: var(--danger);
  margin-bottom: 6px;
}

.lint-list {
  list-style: none;
  color: #ffb4b0;
  line-height: 1.45;
}

.lint-list li::before {
  content: '· ';
  color: var(--danger);
}
</style>
