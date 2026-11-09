import { computed, ref, type ComputedRef, type Ref } from 'vue';

import {
  BUBBLE_WIDTH_DEFAULT,
  BUBBLE_WIDTH_MAX,
  BUBBLE_WIDTH_MIN,
  WIDGET_HEIGHT_MAX,
  WIDGET_HEIGHT_MIN,
} from '@/config/limits';
import type { WidgetScheme } from '@/model/widget';

/**
 * Preview pane state: chat scheme, bubble width and the reported widget
 * height. The height arrives asynchronously from the iframe (postMessage),
 * so the bubble height is derived with clamping in a computed.
 */

export interface PreviewApi {
  scheme: Ref<WidgetScheme>;
  bubbleWidth: Ref<number>;
  bubbleHeight: ComputedRef<number>;
  previewDoc: Ref<string>;
  toggleScheme(): void;
  setScheme(scheme: WidgetScheme): void;
  setWidth(width: number): void;
  reportContentHeight(rawHeight: number): void;
  applyPreviewDocument(doc: string): void;
}

function clampWidth(value: number): number {
  if (!Number.isFinite(value)) {
    return BUBBLE_WIDTH_DEFAULT;
  }
  return Math.min(Math.max(Math.round(value), BUBBLE_WIDTH_MIN), BUBBLE_WIDTH_MAX);
}

export function createPreview(): PreviewApi {
  const scheme = ref<WidgetScheme>('dark');
  const bubbleWidth = ref(BUBBLE_WIDTH_DEFAULT);
  const contentHeight = ref<number | null>(null);
  const previewDoc = ref('');

  const bubbleHeight = computed(() => {
    const raw = contentHeight.value ?? WIDGET_HEIGHT_MIN;
    return Math.min(Math.max(Math.ceil(raw), WIDGET_HEIGHT_MIN), WIDGET_HEIGHT_MAX);
  });

  return {
    scheme,
    bubbleWidth,
    bubbleHeight,
    previewDoc,

    toggleScheme(): void {
      scheme.value = scheme.value === 'dark' ? 'light' : 'dark';
    },

    setScheme(next: WidgetScheme): void {
      scheme.value = next;
    },

    setWidth(next: number): void {
      bubbleWidth.value = clampWidth(next);
    },

    reportContentHeight(rawHeight: number): void {
      if (Number.isFinite(rawHeight)) {
        contentHeight.value = rawHeight;
      }
    },

    applyPreviewDocument(doc: string): void {
      previewDoc.value = doc;
    },
  };
}

const singleton = createPreview();

export function usePreview(): PreviewApi {
  return singleton;
}
