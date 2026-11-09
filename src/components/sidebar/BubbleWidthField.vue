<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { BUBBLE_WIDTH_MAX, BUBBLE_WIDTH_MIN } from '@/config/limits';
import { usePreview } from '@/composables/use-preview';

const { t } = useI18n();
const { bubbleWidth, setWidth } = usePreview();

/** Range fill progress for the CSS gradient track. */
const fill = computed(() => {
  const span = BUBBLE_WIDTH_MAX - BUBBLE_WIDTH_MIN;
  return `${((bubbleWidth.value - BUBBLE_WIDTH_MIN) / span) * 100}%`;
});

function onInput(event: Event): void {
  setWidth(Number((event.target as HTMLInputElement).value));
}
</script>

<template>
  <label class="field">
    <span class="field-label">
      {{ t('sidebar.widthLabel') }}
      <em class="field-value">{{ bubbleWidth }} {{ t('common.px') }}</em>
    </span>
    <input
      type="range"
      :min="BUBBLE_WIDTH_MIN"
      :max="BUBBLE_WIDTH_MAX"
      step="1"
      :value="bubbleWidth"
      :style="{ '--fill': fill }"
      :aria-label="t('sidebar.widthLabel')"
      @input="onInput"
    />
  </label>
</template>
