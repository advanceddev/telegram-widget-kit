import { onScopeDispose, ref, type Ref } from 'vue';

import { SPLIT_RATIO_MAX, SPLIT_RATIO_MIN, SPLIT_RATIO_STEP } from '@/config/limits';

/**
 * Resizable editor/preview split: pointer drag on the separator, keyboard
 * support (arrows / Home / End / Enter = reset) and a body-level dragging
 * class so CSS can disable text selection and iframe pointer interception.
 */

export interface SplitDragBinding {
  dragging: Ref<boolean>;
  onPointerDown(event: PointerEvent): void;
  onPointerMove(event: PointerEvent): void;
  onPointerUp(event: PointerEvent): void;
  onKeydown(event: KeyboardEvent): void;
}

export function useSplitDrag(
  container: Ref<HTMLElement | null>,
  ratio: Ref<number>,
  onChange: (ratio: number) => void,
  onReset: () => void,
): SplitDragBinding {
  const dragging = ref(false);

  function ratioFromPointer(event: PointerEvent): number | null {
    const element = container.value;
    if (!element) {
      return null;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0) {
      return null;
    }
    return (event.clientX - rect.left) / rect.width;
  }

  function applyRatio(event: PointerEvent): void {
    const next = ratioFromPointer(event);
    if (next !== null) {
      onChange(next); // consumer clamps via settings.setSplitRatio
    }
  }

  function startDragging(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    dragging.value = true;
    document.body.classList.add('is-split-dragging');
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function stopDragging(event: PointerEvent): void {
    if (!dragging.value) {
      return;
    }
    dragging.value = false;
    document.body.classList.remove('is-split-dragging');
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // pointer already released — nothing to clean up
    }
  }

  onScopeDispose(() => {
    document.body.classList.remove('is-split-dragging');
  });

  return {
    dragging,

    onPointerDown: startDragging,

    onPointerMove(event) {
      if (dragging.value) {
        applyRatio(event);
      }
    },

    onPointerUp: stopDragging,

    onKeydown(event) {
      switch (event.key) {
        case 'ArrowLeft': {
          onChange(ratio.value - SPLIT_RATIO_STEP);
          event.preventDefault();
          break;
        }
        case 'ArrowRight': {
          onChange(ratio.value + SPLIT_RATIO_STEP);
          event.preventDefault();
          break;
        }
        case 'Home': {
          onChange(SPLIT_RATIO_MIN);
          event.preventDefault();
          break;
        }
        case 'End': {
          onChange(SPLIT_RATIO_MAX);
          event.preventDefault();
          break;
        }
        case 'Enter': {
          onReset();
          event.preventDefault();
          break;
        }
        default:
          break;
      }
    },
  };
}
