<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EditorPane from '@/components/editor/EditorPane.vue';
import PreviewPane from '@/components/preview/PreviewPane.vue';
import { SPLIT_RATIO_MAX, SPLIT_RATIO_MIN } from '@/config/limits';
import { useSettings } from '@/composables/use-settings';
import { useSplitDrag } from '@/composables/use-split-drag';

const { t } = useI18n();
const settings = useSettings();

const container = ref<HTMLElement | null>(null);

const { dragging, onPointerDown, onPointerMove, onPointerUp, onKeydown } = useSplitDrag(
  container,
  settings.splitRatio,
  (ratio) => settings.setSplitRatio(ratio),
  () => settings.resetSplit(),
);

const editorStyle = computed(() => ({
  flexBasis: `${settings.splitRatio.value * 100}%`,
}));

const ratioPercent = computed(() => Math.round(settings.splitRatio.value * 100));
const ratioMin = computed(() => Math.round(SPLIT_RATIO_MIN * 100));
const ratioMax = computed(() => Math.round(SPLIT_RATIO_MAX * 100));
</script>

<template>
  <div ref="container" class="workspace">
    <section class="pane pane-editor" :style="editorStyle">
      <EditorPane />
    </section>

    <div
      class="split-divider"
      :class="{ 'is-dragging': dragging }"
      role="separator"
      aria-orientation="vertical"
      :aria-valuemin="ratioMin"
      :aria-valuemax="ratioMax"
      :aria-valuenow="ratioPercent"
      :aria-label="t('layout.splitLabel')"
      tabindex="0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
      @dblclick="settings.resetSplit()"
    ></div>

    <section class="pane pane-preview">
      <PreviewPane />
    </section>
  </div>
</template>

<style scoped>
.workspace {
  display: flex;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.pane-editor {
  flex: 0 0 auto;
}

.pane-preview {
  flex: 1 1 0;
}

.split-divider {
  flex: 0 0 6px;
  cursor: col-resize;
  background: transparent;
  border-left: 1px solid var(--border);
  position: relative;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

/* wide invisible grab zone */
.split-divider::before {
  content: '';
  position: absolute;
  inset: 0 -4px;
}

.split-divider:hover,
.split-divider:focus-visible,
.split-divider.is-dragging {
  border-left-color: var(--accent);
  background: linear-gradient(to right, transparent, var(--accent-soft), transparent);
}

@media (max-width: 1100px) {
  .workspace {
    flex-direction: column;
  }

  .pane-editor {
    flex: 1 1 50%;
  }

  .pane-preview {
    flex: 1 1 50%;
  }

  .split-divider {
    display: none;
  }
}
</style>
