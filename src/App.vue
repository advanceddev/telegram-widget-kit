<script setup lang="ts">
import { onMounted, watch, watchEffect } from 'vue';

import AppSidebar from '@/components/layout/AppSidebar.vue';
import ToastStack from '@/components/feedback/ToastStack.vue';
import WorkspacePane from '@/components/layout/WorkspacePane.vue';
import { DEBOUNCE_AUTOBUILD_MS, DEBOUNCE_CHECK_MS } from '@/config/limits';
import { useBuild } from '@/composables/use-build';
import { useDebounceFn } from '@/composables/use-debounce-fn';
import { useHotkey } from '@/composables/use-hotkey';
import { usePersistenceBinding } from '@/composables/use-persistence-binding';
import { usePreview } from '@/composables/use-preview';
import { useWidgetHeight } from '@/composables/use-widget-height';
import { useWidgetSources } from '@/composables/use-widget-sources';
import { applyThemeVars } from '@/core/mock';

const sources = useWidgetSources();
const build = useBuild();
const preview = usePreview();
const persistence = usePersistenceBinding();

// Theme palette of the mock chat, mirrored onto <html> for the workspace.
watchEffect(() => {
  applyThemeVars(document.documentElement, preview.scheme.value);
});

// A scheme change re-renders the widget inside the iframe with the new mock
// palette (the original playground rebuilt the preview on theme toggles too).
watch(
  () => preview.scheme.value,
  () => void build.build(preview.scheme.value),
);

// Editing pipeline: sources → debounced lint+sizes → auto-build.
// Auto-build is the playground behaviour (always on): the preview follows
// the sources with a debounce, no toggle, no manual build step.
const scheduleAutoBuild = useDebounceFn(() => {
  void build.build(preview.scheme.value);
}, DEBOUNCE_AUTOBUILD_MS);

const onSourcesEdited = useDebounceFn(() => {
  void build.refreshChecks();
  scheduleAutoBuild();
}, DEBOUNCE_CHECK_MS);

watch(
  () => [sources.state.html, sources.state.css, sources.state.js],
  () => onSourcesEdited(),
);

// Ctrl/Cmd+Enter — rebuild immediately (the auto-build debounce is skipped).
useHotkey({ key: 'Enter', ctrlOrMeta: true }, () => void build.build(preview.scheme.value));

// Height reports from the widget inside the preview iframe.
useWidgetHeight((height) => preview.reportContentHeight(height));

onMounted(() => {
  persistence.bind();
  void build.build(preview.scheme.value);
});
</script>

<template>
  <div class="app">
    <AppSidebar />
    <WorkspacePane />
    <ToastStack />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  height: 100vh;
}

@media (max-width: 860px) {
  .app {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    height: 100dvh;
    overflow-y: auto;
  }
}
</style>
