import { beforeEach, describe, expect, it, vi } from 'vitest';

import CodeEditor from '@/components/editor/CodeEditor.vue';
import { fakeViewInstances } from './codemirror-fake';
import { flushEditor, mountWithI18n } from './helpers';

/**
 * CodeMirror 6 is replaced by a minimal fake (see ./codemirror-fake.ts) for
 * deterministic, fast tests. The fake reproduces the contract `useCodeEditor`
 * relies on: synchronous dispatch → updateListener, doc replace semantics,
 * destroy().
 */

vi.mock('codemirror', () => ({ basicSetup: [] }));
vi.mock('@codemirror/state', () => ({ EditorState: { create: (config: unknown) => config } }));
vi.mock('@codemirror/view', async () => {
  const { FakeEditorView } = await import('./codemirror-fake');
  return { EditorView: FakeEditorView, keymap: { of: (value: unknown) => value } };
});
vi.mock('@codemirror/theme-one-dark', () => ({ oneDark: [] }));
vi.mock('@codemirror/commands', () => ({
  history: () => [],
  defaultKeymap: [],
  historyKeymap: [],
}));
vi.mock('@codemirror/lang-html', () => ({ html: () => [] }));
vi.mock('@codemirror/lang-css', () => ({ css: () => [] }));
vi.mock('@codemirror/lang-javascript', () => ({ javascript: () => [] }));

describe('CodeEditor', () => {
  beforeEach(() => {
    fakeViewInstances.length = 0;
  });

  it('creates the editor lazily after mount with the initial doc', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: '<p>hi</p>', language: 'html', active: true },
    });
    expect(fakeViewInstances).toHaveLength(0); // nothing before the dynamic import resolves

    await flushEditor();

    expect(fakeViewInstances).toHaveLength(1);
    expect(fakeViewInstances[0].doc).toBe('<p>hi</p>');
    // v-show: happy-dom cannot resolve computed display — check inline style
    const loading = wrapper.find('.code-editor-loading').element as HTMLElement;
    expect(loading.style.display).toBe('none');
  });

  it('emits update:modelValue on user edits', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: 'a', language: 'js', active: true },
    });
    await flushEditor();

    fakeViewInstances[0].dispatch({ changes: { from: 0, to: 1, insert: 'b' } });

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
  });

  it('replaces the doc on external value changes without echo', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: 'first', language: 'css', active: true },
    });
    await flushEditor();

    await wrapper.setProps({ modelValue: 'second' });

    expect(fakeViewInstances[0].doc).toBe('second');
    // the programmatic replace must not re-emit the same value
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('destroys the EditorView on unmount', async () => {
    const wrapper = mountWithI18n(CodeEditor, {
      props: { modelValue: '', language: 'html', active: true },
    });
    await flushEditor();

    const view = fakeViewInstances[0];
    wrapper.unmount();

    expect(view.destroyed).toBe(true);
  });
});
