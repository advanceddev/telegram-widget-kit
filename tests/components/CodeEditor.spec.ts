import { beforeEach, describe, expect, it, vi } from 'vitest';

import CodeEditor from '@/components/editor/CodeEditor.vue';
import { mountWithI18n } from './helpers';

/**
 * CodeMirror 6 is replaced by a minimal fake for deterministic, fast tests.
 * The fake reproduces the contract `useCodeEditor` relies on:
 * synchronous dispatch → updateListener, doc replace semantics, destroy().
 */

const { FakeEditorView, instances } = vi.hoisted(() => {
  interface FakeDoc {
    length: number;
    toString(): string;
  }
  type UpdateListener = (u: { docChanged: boolean; state: { doc: FakeDoc } }) => void;

  class FakeEditorViewImpl {
    doc: string;
    listener: UpdateListener | null = null;
    destroyed = false;

    static updateListener = {
      of: (fn: UpdateListener) => ({ updateListener: fn }),
    };

    constructor(config: { state: { doc: string; extensions: unknown[] }; parent: unknown }) {
      this.doc = config.state.doc;
      for (const extension of config.state.extensions) {
        const candidate = extension as { updateListener?: UpdateListener };
        if (candidate && typeof candidate.updateListener === 'function') {
          this.listener = candidate.updateListener;
        }
      }
      viewInstances.push(this);
    }

    get state(): { doc: FakeDoc } {
      const doc = this.doc;
      return { doc: { length: doc.length, toString: () => doc } };
    }

    dispatch({ changes }: { changes: { from: number; to: number; insert: string } }): void {
      this.doc = this.doc.slice(0, changes.from) + changes.insert + this.doc.slice(changes.to);
      this.listener?.({ docChanged: true, state: this.state });
    }

    requestMeasure(): void {}
    destroy(): void {
      this.destroyed = true;
    }
  }

  const viewInstances: FakeEditorViewImpl[] = [];
  return { FakeEditorView: FakeEditorViewImpl, instances: viewInstances };
});

vi.mock('codemirror', () => ({ basicSetup: [] }));
vi.mock('@codemirror/state', () => ({ EditorState: { create: (config: unknown) => config } }));
vi.mock('@codemirror/view', () => ({
  EditorView: FakeEditorView,
  keymap: { of: (value: unknown) => value },
}));
vi.mock('@codemirror/theme-one-dark', () => ({ oneDark: [] }));
vi.mock('@codemirror/commands', () => ({
  history: () => [],
  defaultKeymap: [],
  historyKeymap: [],
}));
vi.mock('@codemirror/lang-html', () => ({ html: () => [] }));
vi.mock('@codemirror/lang-css', () => ({ css: () => [] }));
vi.mock('@codemirror/lang-javascript', () => ({ javascript: () => [] }));

/** Lets the async onMounted (chain of dynamic imports) fully settle. */
const flushEditor = async (): Promise<void> => {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await wrapperlessNextTick();
};

async function wrapperlessNextTick(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('CodeEditor', () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it('creates the editor lazily after mount with the initial doc', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: '<p>hi</p>', language: 'html', active: true },
    });
    expect(instances).toHaveLength(0); // nothing before the dynamic import resolves

    await flushEditor();

    expect(instances).toHaveLength(1);
    expect(instances[0].doc).toBe('<p>hi</p>');
    // v-show: happy-dom cannot resolve computed display — check inline style
    const loading = wrapper.find('.code-editor-loading').element as HTMLElement;
    expect(loading.style.display).toBe('none');
  });

  it('emits update:modelValue on user edits', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: 'a', language: 'js', active: true },
    });
    await flushEditor();

    instances[0].dispatch({ changes: { from: 0, to: 1, insert: 'b' } });

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
  });

  it('replaces the doc on external value changes without echo', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: 'first', language: 'css', active: true },
    });
    await flushEditor();

    await wrapper.setProps({ modelValue: 'second' });

    expect(instances[0].doc).toBe('second');
    // the programmatic replace must not re-emit the same value
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('destroys the EditorView on unmount', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: '', language: 'html', active: true },
    });
    await flushEditor();

    const view = instances[0];
    wrapper.unmount();

    expect(view.destroyed).toBe(true);
  });
});
