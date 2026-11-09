import { describe, expect, it } from 'vitest';

import { telegramMockScript, wrapForPreview } from '@/core/mock';
import { applyThemeVars, THEME_PARAMS } from '@/core/mock';

describe('THEME_PARAMS', () => {
  it('exposes the full palette for both schemes', () => {
    for (const scheme of ['dark', 'light'] as const) {
      const theme = THEME_PARAMS[scheme];
      expect(Object.keys(theme)).toEqual([
        'bg_color',
        'text_color',
        'hint_color',
        'link_color',
        'button_color',
        'button_text_color',
        'secondary_bg_color',
      ]);
      for (const value of Object.values(theme)) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('applies theme vars onto a DOM node', () => {
    const root = document.createElement('div');
    applyThemeVars(root, 'dark');
    expect(root.style.getPropertyValue('--tg-theme-bg-color')).toBe('#182533');
    expect(root.style.getPropertyValue('--tg-color-scheme')).toBe('dark');

    applyThemeVars(root, 'light');
    expect(root.style.getPropertyValue('--tg-theme-bg-color')).toBe('#ffffff');
    expect(root.style.getPropertyValue('--tg-color-scheme')).toBe('light');
  });
});

describe('telegramMockScript', () => {
  it('installs the SDK v1 surface on window.TelegramWidget', () => {
    const script = telegramMockScript('dark');
    expect(script).toContain('window.TelegramWidget');
    expect(script).toContain('profile:1');
    expect(script).toContain('isProfileAtLeast');
    expect(script).toContain('onEvent');
    expect(script).toContain('HapticFeedback');
    expect(script).toContain('request:function');
    expect(script).toContain('copyText:function');
    expect(script).toContain("chatType:'private'");
  });

  it('embeds the scheme palette and height reporter', () => {
    const script = telegramMockScript('light');
    expect(script).toContain('"bg_color":"#ffffff"');
    expect(script).toContain('colorScheme:"light"');
    expect(script).toContain('tw-widget-height');
    expect(script).toContain('ResizeObserver');
  });
});

describe('wrapForPreview', () => {
  it('wraps a bare fragment into a full document', () => {
    const doc = wrapForPreview('<p>x</p>', 'dark');
    expect(doc.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(doc).toContain('<body><p>x</p></body>');
    expect(doc).toContain('window.TelegramWidget');
    expect(doc.indexOf('TelegramWidget')).toBeLessThan(doc.indexOf('<body>'));
  });

  it('injects the mock into an existing <head>', () => {
    const doc = wrapForPreview('<html><head><title>t</title></head><body>x</body></html>', 'dark');
    expect(doc).toContain('<head><base target="_blank"><script>');
    expect(doc).toContain('<title>t</title>');
    expect(doc).toContain('window.TelegramWidget={');
    expect(doc.indexOf('window.TelegramWidget')).toBeLessThan(doc.indexOf('<title>'));
  });

  it('creates a <head> for a full document without one', () => {
    const doc = wrapForPreview('<html><body>x</body></html>', 'dark');
    expect(doc).toContain('<head>');
    expect(doc).toContain('window.TelegramWidget');
  });
});
