<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCodeEditor } from '@/composables/use-code-editor';
import { useFormatter } from '@/composables/use-formatter';
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
  /** Document-format request (overlay click or Shift+Alt+F in the editor). */
  (event: 'format', part: SourcePart): void;
}>();

const { t } = useI18n();
const formatter = useFormatter();

const host = ref<HTMLElement | null>(null);
const { ready } = useCodeEditor({
  host,
  value: computed(() => props.modelValue),
  active: computed(() => props.active),
  language: props.language,
  onChange: (value) => emit('update:modelValue', value),
  onFormatShortcut: () => emit('format', props.language),
});

/** The pill only appears for documents Prettier would actually change. */
const needsFormat = formatter.needsFormatOf(props.language);
const showFormatHint = computed(() => ready.value && needsFormat.value);

function isApplePlatform(): boolean {
  const source =
    typeof navigator === 'undefined' ? '' : `${navigator.platform} ${navigator.userAgent}`;
  return /Mac|iPhone|iPad/i.test(source);
}

const hotkeyLabel = isApplePlatform() ? t('format.hotkeyMac') : t('format.hotkeyOther');
const hintTitle = computed(() => t('format.title', { hotkey: hotkeyLabel }));
</script>

<template>
  <div class="code-editor">
    <div v-show="!ready" class="code-editor-loading">{{ t('editor.loading') }}</div>
    <div ref="host" class="code-editor-host"></div>
    <Transition name="format-hint">
      <button
        v-if="showFormatHint"
        type="button"
        class="format-hint"
        :title="hintTitle"
        :aria-label="hintTitle"
        @click="emit('format', language)"
      >
        <span class="format-hint-label">{{ t('format.button') }}</span>
        <kbd class="format-hint-kbd">{{ hotkeyLabel }}</kbd>
      </button>
    </Transition>
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

/* Floating "document is not formatted" pill, bottom-right of the editor. */
.format-hint {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px 7px 13px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--panel) 86%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text);
  font-size: 12px;
  font-weight: 550;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: var(--shadow-overlay);
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.format-hint:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

.format-hint:active {
  transform: translateY(0);
}

.format-hint:focus-visible {
  border-color: var(--accent);
  box-shadow: var(--shadow-overlay), var(--focus-ring);
}

.format-hint-label {
  white-space: nowrap;
}

.format-hint-kbd {
  font-family: var(--mono);
  font-size: 10.5px;
  line-height: 1;
  padding: 4px 7px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--panel-3);
  color: var(--muted);
  white-space: nowrap;
}

.format-hint:hover .format-hint-kbd {
  border-color: var(--accent-dim);
  color: var(--accent);
}

/* Micro-animation: rise + fade in/out. */
.format-hint-enter-active {
  transition:
    opacity 180ms ease-out,
    transform 180ms ease-out;
}

.format-hint-leave-active {
  transition:
    opacity 120ms ease-in,
    transform 120ms ease-in;
}

.format-hint-enter-from,
.format-hint-leave-to {
  opacity: 0;
  transform: translateY(6px);
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
