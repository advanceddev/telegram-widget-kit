<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatBubble from '@/components/preview/ChatBubble.vue';
import { formatBytes } from '@/core/utils/format';
import { useBuild } from '@/composables/use-build';

const { t } = useI18n();
const build = useBuild();

const buildMeta = computed(() => {
  const meta = build.builtMeta.value;
  if (!meta) {
    return '';
  }
  return `${formatBytes(meta.raw)} · zlib ${formatBytes(meta.zlib ?? 0)}`;
});
</script>

<template>
  <section class="preview-pane">
    <div class="preview-bar">
      <span class="preview-label">{{ t('preview.title') }}</span>
      <span class="build-meta">{{ buildMeta }}</span>
    </div>
    <div class="preview-wrap">
      <ChatBubble />
    </div>
  </section>
</template>

<style scoped>
.preview-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: #0f1116;
}

.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.build-meta {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  transition: color var(--transition-fast);
}

.preview-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  overflow: auto;
}
</style>
