import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue';

import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

import type { SourcePart } from '@/model/widget';

/**
 * CodeMirror 6 integration for Vue.
 *
 * Design notes:
 * - CodeMirror (~120 KB of vendor code) is imported dynamically in
 *   `onMounted`, so it lands in an async chunk and never blocks first paint.
 * - The `EditorView` instance lives in a `shallowRef`: CodeMirror instances
 *   must never be wrapped in a Vue deep-reactive proxy.
 * - External value updates are dispatched with an echo-suppression flag, so
 *   a programmatic replace never re-emits `update:modelValue` (no cursor
 *   jumps, no feedback loops with the source store).
 * - Panels stay mounted (`v-show` in `EditorPane`); re-activation only
 *   triggers `requestMeasure()`, preserving scroll/cursor/history.
 */

const LANGUAGE_LOADERS: Record<SourcePart, () => Promise<Extension>> = {
  html: () => import('@codemirror/lang-html').then((m) => m.html()),
  css: () => import('@codemirror/lang-css').then((m) => m.css()),
  js: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
};

export interface CodeEditorOptions {
  /** Mount point for the editor DOM. */
  host: Ref<HTMLElement | null>;
  /** Current document value (reactive source of truth). */
  value: Ref<string>;
  /** Whether the owning panel is visible (drives `requestMeasure`). */
  active: Ref<boolean>;
  language: SourcePart;
  /** Called on user edits only (never for programmatic replaces). */
  onChange(value: string): void;
}

export interface CodeEditorBinding {
  ready: Ref<boolean>;
}

export function useCodeEditor(options: CodeEditorOptions): CodeEditorBinding {
  const ready = ref(false);
  const view = shallowRef<EditorView | null>(null);

  let lastValue = options.value.value;
  let applyingExternal = false;

  onMounted(async () => {
    const host = options.host.value;
    if (!host) {
      return;
    }

    const [core, stateModule, themeModule, commandsModule, language] = await Promise.all([
      import('codemirror'),
      import('@codemirror/state'),
      import('@codemirror/theme-one-dark'),
      import('@codemirror/commands'),
      LANGUAGE_LOADERS[options.language](),
    ]);

    const { EditorState } = stateModule;
    const { EditorView: View, keymap } = await import('@codemirror/view');

    const extensions: Extension[] = [
      core.basicSetup,
      themeModule.oneDark,
      commandsModule.history(),
      keymap.of([...commandsModule.defaultKeymap, ...commandsModule.historyKeymap]),
      language,
      View.updateListener.of((update) => {
        if (!update.docChanged || applyingExternal) {
          return;
        }
        lastValue = update.state.doc.toString();
        options.onChange(lastValue);
      }),
    ];

    const instance = new View({
      state: EditorState.create({ doc: lastValue, extensions }),
      parent: host,
    });
    view.value = instance;
    ready.value = true;

    if (options.active.value) {
      instance.requestMeasure();
    }
  });

  // External value changes (template switch, file open, restore) → replace doc.
  watch(options.value, (value) => {
    const current = view.value;
    if (!current || value === lastValue) {
      return;
    }
    applyingExternal = true;
    current.dispatch({
      changes: { from: 0, to: current.state.doc.length, insert: value },
    });
    applyingExternal = false;
    lastValue = value;
  });

  watch(options.active, (active) => {
    if (active) {
      view.value?.requestMeasure();
    }
  });

  onBeforeUnmount(() => {
    view.value?.destroy();
    view.value = null;
  });

  return { ready };
}
