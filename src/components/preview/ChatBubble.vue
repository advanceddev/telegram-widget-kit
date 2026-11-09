<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { WIDGET_HEIGHT_MAX } from '@/config/limits';
import { usePreview } from '@/composables/use-preview';

const { t } = useI18n();
const { scheme, bubbleWidth, bubbleHeight, previewDoc } = usePreview();
</script>

<template>
  <div class="chat-mock" :data-theme="scheme">
    <div
      class="bubble"
      :style="{
        width: `${bubbleWidth}px`,
        height: `${bubbleHeight}px`,
        maxHeight: `${WIDGET_HEIGHT_MAX}px`,
      }"
    >
      <!--
        The iframe is keyed by the preview document itself: every new build
        remounts the iframe with the full `srcdoc` present at creation time —
        the initial navigation is reliable in every browser. Patching the
        `srcdoc` attribute of a live iframe is not (WebKit/Firefox skip the
        re-navigation, leaving the initial empty document visible — the
        "empty iframe on first launch" bug). An identical document keeps the
        same key, so no reload happens and the bubble height is preserved.
      -->
      <iframe
        v-if="previewDoc"
        :key="previewDoc"
        class="preview-frame"
        :title="t('preview.frameTitle')"
        sandbox="allow-scripts"
        :srcdoc="previewDoc"
      ></iframe>
    </div>
    <div class="time">12:34</div>
  </div>
</template>

<style scoped>
.chat-mock {
  position: relative;
  background: var(--chat-dark);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-overlay);
  transition: background-color var(--transition-medium);
}

.chat-mock[data-theme='light'] {
  background: var(--chat-light);
}

.bubble {
  width: 320px;
  max-width: 100%;
  min-height: 50px;
  max-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  background: #182533;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: height 180ms ease-out;
}

.chat-mock[data-theme='light'] .bubble {
  background: #ffffff;
}

.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: none;
  display: block;
  background: transparent;
  vertical-align: top;
  animation: preview-frame-in 180ms ease-out;
}

@keyframes preview-frame-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.time {
  position: absolute;
  right: 30px;
  bottom: 26px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.chat-mock[data-theme='light'] .time {
  color: rgba(0, 0, 0, 0.38);
  text-shadow: none;
}
</style>
