import { beforeEach, describe, expect, it, vi } from 'vitest';

import EditorPane from '@/components/editor/EditorPane.vue';
import { useWidgetSources } from '@/composables/use-widget-sources';
import { fakeViewInstances } from './codemirror-fake';
import { flushEditor, mountWithI18n } from './helpers';

/**
 * Integration: minified sources (the .html / .tgw import case) → the format
 * pill appears in the editor's bottom-right corner → clicking it (or the
 * global Shift+Alt+F shortcut) pretty-prints the source in place, the editor
 * doc follows and the pill disappears. CodeMirror is replaced by the shared
 * fake; Prettier runs for real (same modules as in the browser).
 */

const sources = useWidgetSources();

const MIN_HTML = '<h1>Заголовок</h1><p>Абзац</p><div><span>x</span><span>y</span></div>';

const POLL = { timeout: 8_000, interval: 120 } as const;

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

describe('format overlay (EditorPane integration)', () => {
  beforeEach(() => {
    fakeViewInstances.length = 0;
  });

  it('hides the pill for clean sources', async () => {
    sources.hydrate({
      html: '<h1>Заголовок</h1>\n<p>Абзац</p>\n',
      css: '',
      js: '',
      activeTemplate: '',
    });
    const wrapper = mountWithI18n(EditorPane);
    await flushEditor();

    // Give the debounced detection check time to run and settle.
    await new Promise((resolve) => setTimeout(resolve, 1_400));

    expect(wrapper.find('.format-hint').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shows the pill for minified sources and formats on click', async () => {
    sources.hydrate({ html: MIN_HTML, css: '', js: '', activeTemplate: '' });
    const wrapper = mountWithI18n(EditorPane);
    await flushEditor();
    expect(fakeViewInstances.length).toBe(3); // html + css + js editors

    await vi.waitFor(() => expect(wrapper.find('.format-hint').exists()).toBe(true), POLL);
    expect(wrapper.find('.format-hint-label').text()).toBe('Форматировать');
    expect(wrapper.find('.format-hint-kbd').exists()).toBe(true);

    await wrapper.find('.format-hint').trigger('click');

    // Sources are pretty-printed in place…
    await vi.waitFor(() => {
      expect(sources.state.html.split('\n').length).toBeGreaterThan(2);
      expect(sources.state.html).toContain('<h1>');
    }, POLL);
    // …the editor doc follows through the modelValue loop…
    await vi.waitFor(() => {
      expect(fakeViewInstances[0].doc).toBe(sources.state.html);
    }, POLL);
    // …and the pill goes away.
    await vi.waitFor(() => {
      expect(wrapper.find('.format-hint').exists()).toBe(false);
    }, POLL);

    wrapper.unmount();
  });

  it('formats the active tab via the global Shift+Alt+F shortcut', async () => {
    sources.hydrate({ html: MIN_HTML, css: '', js: '', activeTemplate: '' });
    const wrapper = mountWithI18n(EditorPane);
    await flushEditor();

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        code: 'KeyF',
        shiftKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    await vi.waitFor(() => {
      expect(sources.state.html.split('\n').length).toBeGreaterThan(2);
    }, POLL);

    wrapper.unmount();
  });
});
