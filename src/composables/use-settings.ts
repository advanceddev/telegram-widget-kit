import { ref, type Ref } from 'vue';

import { SPLIT_RATIO_DEFAULT, SPLIT_RATIO_MAX, SPLIT_RATIO_MIN } from '@/config/limits';

/**
 * Workspace settings: the editor/preview split ratio.
 *
 * Auto-build is not a setting anymore — it is the behaviour of the
 * playground (the preview always follows the sources, see `App.vue`),
 * so there is nothing to toggle and nothing to persist.
 */

export interface SettingsApi {
  readonly splitRatio: Ref<number>;
  setSplitRatio(value: number): void;
  resetSplit(): void;
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return SPLIT_RATIO_DEFAULT;
  }
  return Math.min(Math.max(value, SPLIT_RATIO_MIN), SPLIT_RATIO_MAX);
}

export function createSettings(): SettingsApi {
  const splitRatio = ref(SPLIT_RATIO_DEFAULT);

  return {
    splitRatio,

    setSplitRatio(value: number): void {
      splitRatio.value = clampRatio(value);
    },

    resetSplit(): void {
      splitRatio.value = SPLIT_RATIO_DEFAULT;
    },
  };
}

const singleton = createSettings();

export function useSettings(): SettingsApi {
  return singleton;
}
