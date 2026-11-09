import { describe, expect, it } from 'vitest';

import { TEMPLATES } from '@/core/templates/templates';
import { lintWidgetParts } from '@/core/lint';

const EXPECTED_TEMPLATE_KEYS = [
  'example',
  'card',
  'counter',
  'status',
  'converter',
  'wallet',
  'cube3d',
  'poll',
  'ticker',
  'promo',
  'order',
] as const;

describe('TEMPLATES', () => {
  it('ships the full original template set', () => {
    expect(Object.keys(TEMPLATES)).toEqual([...EXPECTED_TEMPLATE_KEYS]);
  });

  it('has non-empty sources in every template', () => {
    for (const [key, template] of Object.entries(TEMPLATES)) {
      expect(template.html.trim(), `${key}.html`).not.toBe('');
      expect(template.css.trim(), `${key}.css`).not.toBe('');
    }
  });

  it('provides js for interactive templates', () => {
    for (const key of ['example', 'counter', 'converter', 'wallet', 'cube3d']) {
      expect(TEMPLATES[key].js.trim()).not.toBe('');
    }
  });

  it('keeps every template free of profile 1 violations', () => {
    for (const [key, template] of Object.entries(TEMPLATES)) {
      const issues = lintWidgetParts(template.html, template.css, template.js);
      expect(
        issues.map((issue) => issue.code),
        `${key} violations`,
      ).toEqual([]);
    }
  });

  it('uses only data: or no src attributes at all', () => {
    for (const [key, template] of Object.entries(TEMPLATES)) {
      expect(template.html, key).not.toMatch(/\bsrc\s*=\s*["'](?!data:)/i);
    }
  });
});
