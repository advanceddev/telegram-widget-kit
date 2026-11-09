import { describe, expect, it } from 'vitest';

import { createWidgetSources } from '@/composables/use-widget-sources';
import { createPreview } from '@/composables/use-preview';
import { createSettings } from '@/composables/use-settings';
import { createTgwExport } from '@/composables/use-tgw-export';
import { buildWidgetTgw, dataByteLength } from '@/services/export-service';
import { SPLIT_RATIO_DEFAULT, WIDGET_HEIGHT_MAX, WIDGET_HEIGHT_MIN } from '@/config/limits';

describe('useWidgetSources', () => {
  it('starts with the example template loaded', () => {
    const api = createWidgetSources();
    expect(api.state.activeTemplate).toBe('example');
    expect(api.state.html).not.toBe('');
    expect(api.state.dirty).toBe(false);
  });

  it('switching a template replaces all parts and marks dirty', () => {
    const api = createWidgetSources();
    api.markClean();
    api.setTemplate('card');
    expect(api.state.activeTemplate).toBe('card');
    expect(api.state.html).not.toBe(api.state.js);
    expect(api.state.dirty).toBe(true);
  });

  it('editing a source drops the template selection (custom)', () => {
    const api = createWidgetSources();
    api.setSource('css', 'p{}');
    expect(api.state.activeTemplate).toBe('');
    expect(api.state.dirty).toBe(true);
  });

  it('ignores no-op edits', () => {
    const api = createWidgetSources();
    const html = api.state.html;
    api.setSource('html', html);
    expect(api.state.dirty).toBe(false);
  });

  it('replaceSources marks custom sources', () => {
    const api = createWidgetSources();
    api.replaceSources({ html: '<i/>', css: '', js: '' });
    expect(api.state).toMatchObject({ html: '<i/>', activeTemplate: '', dirty: true });
  });

  it('hydrate restores a snapshot without the dirty flag', () => {
    const api = createWidgetSources();
    api.hydrate({ html: 'h', css: 'c', js: 'j', activeTemplate: 'card' });
    expect(api.state).toMatchObject({
      html: 'h',
      css: 'c',
      js: 'j',
      activeTemplate: 'card',
      dirty: false,
    });
  });
});

describe('usePreview', () => {
  it('clamps bubble width to the 200–430 px range', () => {
    const api = createPreview();
    api.setWidth(100);
    expect(api.bubbleWidth.value).toBe(200);
    api.setWidth(999);
    expect(api.bubbleWidth.value).toBe(430);
    api.setWidth(321.6);
    expect(api.bubbleWidth.value).toBe(322);
  });

  it('derives the bubble height from reported content, clamped', () => {
    const api = createPreview();
    expect(api.bubbleHeight.value).toBe(WIDGET_HEIGHT_MIN);

    api.reportContentHeight(0.4);
    expect(api.bubbleHeight.value).toBe(WIDGET_HEIGHT_MIN);

    api.reportContentHeight(10_000);
    expect(api.bubbleHeight.value).toBe(WIDGET_HEIGHT_MAX);

    api.reportContentHeight(233.2);
    expect(api.bubbleHeight.value).toBe(234);
  });

  it('keeps the last reported height until a new report arrives', () => {
    // Regression: a rebuild must never collapse the bubble — when the
    // preview document is unchanged the iframe does not reload and no new
    // report arrives, so the previous height stays the truth.
    const api = createPreview();
    api.reportContentHeight(312);
    expect(api.bubbleHeight.value).toBe(312);
    api.applyPreviewDocument(api.previewDoc.value);
    expect(api.bubbleHeight.value).toBe(312);
  });

  it('ignores non-finite height reports', () => {
    const api = createPreview();
    api.reportContentHeight(Number.NaN);
    expect(api.bubbleHeight.value).toBe(WIDGET_HEIGHT_MIN);
  });

  it('toggles the scheme', () => {
    const api = createPreview();
    expect(api.scheme.value).toBe('dark');
    api.toggleScheme();
    expect(api.scheme.value).toBe('light');
    api.toggleScheme();
    expect(api.scheme.value).toBe('dark');
  });
});

describe('useSettings', () => {
  it('clamps the split ratio and resets it', () => {
    const api = createSettings();
    api.setSplitRatio(0.05);
    expect(api.splitRatio.value).toBe(0.2);
    api.setSplitRatio(0.99);
    expect(api.splitRatio.value).toBe(0.8);
    // non-finite input falls back to the default ratio
    api.setSplitRatio(Number.NaN);
    expect(api.splitRatio.value).toBe(SPLIT_RATIO_DEFAULT);
    api.resetSplit();
    expect(api.splitRatio.value).toBe(SPLIT_RATIO_DEFAULT);
  });
});

describe('useTgwExport + buildWidgetTgw', () => {
  it('derives inputMediaWidget flags from the form', () => {
    const api = createTgwExport();
    api.patch({ fwdAllowQueries: true });
    const pkg = buildWidgetTgw('<p/>', api.form);
    expect(pkg.fwd_allow_queries).toBe(true);
    expect(pkg.allow_queries).toBe(true);
    expect(pkg.shared_widget).toBe(true);
  });

  it('maps form fields onto the package', () => {
    const api = createTgwExport();
    api.patch({ allowQueries: true, sharedWidget: true, width: 320, height: 200 });
    api.readFromTgw({ format: 'tg-widget/v1', width: 1, height: 2, html: 'x' });
    expect(api.form.allowQueries).toBe(false);
    expect(api.form.width).toBe(1);
  });

  it('measures data payloads in UTF-8 bytes', () => {
    expect(dataByteLength('ии')).toBe(4);
  });
});
