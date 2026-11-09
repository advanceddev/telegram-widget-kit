import { reactive } from 'vue';

import { TEMPLATES } from '@/core/templates/templates';
import type { Parts, SourcePart } from '@/model/widget';

/**
 * Widget source code state (HTML / CSS / JS + active template).
 *
 * Composition-API state pattern: a `createX()` factory owns a plain reactive
 * object; the module exports one app-wide instance plus the factory for tests.
 */

export interface WidgetSourcesState {
  html: string;
  css: string;
  js: string;
  /** Selected template key; `''` = custom (edited) sources. */
  activeTemplate: string;
  /** `true` when sources changed since the last successful build. */
  dirty: boolean;
}

export interface WidgetSourcesApi {
  readonly state: Readonly<WidgetSourcesState>;
  setTemplate(key: string): void;
  setSource(part: SourcePart, value: string): void;
  replaceSources(parts: Parts, options?: { dirty?: boolean }): void;
  /** Applies a persisted snapshot verbatim (no dirty flag, keeps template). */
  hydrate(next: { html: string; css: string; js: string; activeTemplate: string }): void;
  markClean(): void;
}

export function createWidgetSources(): WidgetSourcesApi {
  const state = reactive<WidgetSourcesState>({
    html: TEMPLATES.example.html,
    css: TEMPLATES.example.css,
    js: TEMPLATES.example.js,
    activeTemplate: 'example',
    dirty: false,
  });

  return {
    state,

    setTemplate(key: string): void {
      const template = TEMPLATES[key];
      if (!template) {
        return;
      }
      state.html = template.html;
      state.css = template.css;
      state.js = template.js;
      state.activeTemplate = key;
      state.dirty = true;
    },

    setSource(part: SourcePart, value: string): void {
      if (state[part] === value) {
        return;
      }
      state[part] = value;
      state.activeTemplate = '';
      state.dirty = true;
    },

    replaceSources(parts: Parts, options: { dirty?: boolean } = {}): void {
      state.html = parts.html;
      state.css = parts.css;
      state.js = parts.js;
      state.activeTemplate = '';
      state.dirty = options.dirty ?? true;
    },

    hydrate(next: { html: string; css: string; js: string; activeTemplate: string }): void {
      state.html = next.html;
      state.css = next.css;
      state.js = next.js;
      state.activeTemplate = next.activeTemplate;
      state.dirty = false;
    },

    markClean(): void {
      state.dirty = false;
    },
  };
}

const singleton = createWidgetSources();

export function useWidgetSources(): WidgetSourcesApi {
  return singleton;
}
