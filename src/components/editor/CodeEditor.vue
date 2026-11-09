<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCodeEditor } from '@/composables/use-code-editor';
import type { SourcePart } from '@/model/widget';

const props = defineProps<{
  modelValue: string;
  /** Per-instance constant: the editor is never re-targeted to another language. */
  language: SourcePart;
  /** Whether the owning tab panel is visible (drives CodeMirror measuring). */
  active: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const { t } = useI18n();

const host = ref<HTMLElement | null>(null);
const { ready } = useCodeEditor({
  host,
  value: computed(() => props.modelValue),
  active: computed(() => props.active),
  language: props.language,
  onChange: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div class="code-editor">
    <div v-show="!ready" class="code-editor-loading">{{ t('editor.loading') }}</div>
    <div ref="host" class="code-editor-host"></div>
  </div>
</template>

<style scoped>
.code-editor {
  position: absolute;
  inset: 0;
}

.code-editor-loading {
  padding: 14px 16px;
  font-size: 12px;
  color: var(--muted);
}

.code-editor-host {
  height: 100%;
}

/* CodeMirror host overrides (originally in styles.css) */
.code-editor-host :deep(.cm-editor) {
  height: 100%;
  font-size: 13px;
}

.code-editor-host :deep(.cm-scroller) {
  font-family: var(--mono) !important;
  line-height: 1.55 !important;
}
</style>
