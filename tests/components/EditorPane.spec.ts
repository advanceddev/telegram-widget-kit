import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';

import EditorPane from '@/components/editor/EditorPane.vue';
import { useWidgetSources } from '@/composables/use-widget-sources';
import { mountWithI18n } from './helpers';

// The real CodeEditor pulls CodeMirror (dynamic import) — stub it here;
// its own behaviour is covered separately in CodeEditor.spec.ts with mocks.
vi.mock('@/components/editor/CodeEditor.vue', () => ({
  default: defineComponent({
    name: 'CodeEditor',
    props: {
      modelValue: { type: String, default: '' },
      language: { type: String, required: true },
      active: { type: Boolean, default: false },
    },
    emits: ['update:modelValue'],
    setup: () => () => h('div', { class: 'cm-stub' }),
  }),
}));

/**
 * happy-dom (vitest env) does not resolve `display: none` through
 * getComputedStyle, so visibility is asserted via the v-show inline style.
 */
function isHidden(wrapper: VueWrapper, index: number): boolean {
  return (
    (wrapper.findAll('[role="tabpanel"]')[index].element as HTMLElement).style.display === 'none'
  );
}

describe('EditorPane', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    useWidgetSources().setTemplate('example');
    wrapper = mountWithI18n(EditorPane);
  });

  const tabs = () => wrapper.findAll('[role="tab"]');

  it('renders four tabs with correct ARIA state and ru labels', () => {
    expect(tabs()).toHaveLength(4);
    expect(tabs().map((tab) => tab.text())).toEqual(['HTML', 'CSS', 'JS', 'Результат']);

    expect(tabs()[0].attributes('aria-selected')).toBe('true');
    expect(tabs()[0].attributes('tabindex')).toBe('0');
    expect(tabs()[1].attributes('aria-selected')).toBe('false');
    expect(tabs()[1].attributes('tabindex')).toBe('-1');
    expect(tabs()[0].attributes('aria-controls')).toBe('panel-html');
  });

  it('shows only the active panel (v-show keeps editors alive)', async () => {
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(4);
    expect(isHidden(wrapper, 0)).toBe(false);
    expect(isHidden(wrapper, 1)).toBe(true);

    await tabs()[1].trigger('click');
    expect(tabs()[1].attributes('aria-selected')).toBe('true');
    expect(isHidden(wrapper, 1)).toBe(false);
    expect(isHidden(wrapper, 0)).toBe(true);
  });

  it('propagates source edits into the sources composable', async () => {
    const sources = useWidgetSources();
    wrapper.findComponent({ name: 'CodeEditor' }).vm.$emit('update:modelValue', '<b>edited</b>');
    expect(sources.state.html).toBe('<b>edited</b>');
    expect(sources.state.dirty).toBe(true);
    expect(sources.state.activeTemplate).toBe('');
  });

  it('switches tabs with arrow keys (roving focus)', async () => {
    await tabs()[0].trigger('keydown', { key: 'ArrowRight' });
    expect(tabs()[1].attributes('aria-selected')).toBe('true');

    await tabs()[1].trigger('keydown', { key: 'End' });
    expect(tabs()[3].attributes('aria-selected')).toBe('true');

    await tabs()[3].trigger('keydown', { key: 'Home' });
    expect(tabs()[0].attributes('aria-selected')).toBe('true');
  });
});
