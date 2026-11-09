import { describe, expect, it } from 'vitest';

import LintPanel from '@/components/sidebar/LintPanel.vue';
import SizeStatsPanel from '@/components/sidebar/SizeStatsPanel.vue';
import ThemeField from '@/components/sidebar/ThemeField.vue';
import { useBuild } from '@/composables/use-build';
import { usePreview } from '@/composables/use-preview';
import { mountWithI18n } from './helpers';

describe('LintPanel', () => {
  it('renders nothing when there are no issues', () => {
    const wrapper = mountWithI18n(LintPanel);
    expect(wrapper.find('.lint-panel').exists()).toBe(false);
  });

  it('localizes issues with interpolation params', () => {
    const build = useBuild();
    build.lintIssues.value = [
      { kind: 'tag', code: 'tagForbidden', params: { tag: 'input' } },
      { kind: 'js', code: 'jsNetwork', params: { api: 'fetch()' } },
    ];
    const wrapper = mountWithI18n(LintPanel);
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain('<input>');
    expect(items[0].text()).toContain('profile 1');
    expect(items[1].text()).toContain('fetch()');
    expect(items[1].text()).toContain('NetworkDisabledError');
  });
});

describe('SizeStatsPanel', () => {
  it('shows placeholders before the first measurement', () => {
    const build = useBuild();
    build.sizeReport.value = null;
    build.sizeVerdict.value = null;
    const wrapper = mountWithI18n(SizeStatsPanel);
    expect(wrapper.text()).toContain('…');
    expect(wrapper.text()).toContain('—');
  });

  it('formats sizes and maps the verdict to a localized status', () => {
    const build = useBuild();
    build.sizeReport.value = { raw: 2048, zlib: 1024 };
    build.sizeVerdict.value = { level: 'ok', messageKey: 'okBuilt' };
    const wrapper = mountWithI18n(SizeStatsPanel);

    expect(wrapper.text()).toContain('2.00 KB');
    expect(wrapper.text()).toContain('1.00 KB');
    expect(wrapper.find('.limit.ok').text()).toContain('готово к отправке');
  });

  it('marks the exceeded limit as bad', () => {
    const build = useBuild();
    build.sizeReport.value = { raw: 40_000, zlib: 5_000 };
    build.sizeVerdict.value = { level: 'bad', messageKey: 'bad' };
    const wrapper = mountWithI18n(SizeStatsPanel);
    expect(wrapper.find('.limit.bad').exists()).toBe(true);
    expect(wrapper.text()).toContain('ПРЕВЫШЕН');
  });
});

describe('ThemeField', () => {
  it('renders the segmented control and switches the chat scheme', async () => {
    const preview = usePreview();
    preview.setScheme('dark');
    const wrapper = mountWithI18n(ThemeField);

    const buttons = wrapper.findAll('.segment-btn');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].classes()).toContain('is-active');
    expect(buttons[0].attributes('aria-pressed')).toBe('true');
    expect(buttons[1].attributes('aria-pressed')).toBe('false');

    await buttons[1].trigger('click');
    expect(preview.scheme.value).toBe('light');
    expect(buttons[1].classes()).toContain('is-active');
  });
});
