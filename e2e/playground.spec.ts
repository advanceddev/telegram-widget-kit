import { expect, test, type Page } from '@playwright/test';

/**
 * E2E smoke suite for the Vue 3 playground.
 * Covers the critical paths: build pipeline, tabs, templates, theme,
 * language switch, lint feedback and the resizable split.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // CodeMirror loads asynchronously — wait for at least one editor instance.
  await expect(page.locator('.cm-editor').first()).toBeVisible();
});

test('renders the workspace with sidebar, editors and preview', async ({ page }) => {
  await expect(page.locator('.brand-title')).toHaveText('TG Widget Kit');
  await expect(page.locator('.sidebar select')).toBeVisible();
  await expect(page.locator('[role="tab"]')).toHaveCount(4);
  await expect(page.locator('.chat-mock')).toBeVisible();
  await expect(page.locator('.preview-frame')).toBeAttached();
});

test('Build & Preview produces the built output and size stats', async ({ page }) => {
  await page.getByRole('button', { name: /Build & Preview/i }).click();

  await page.getByRole('tab', { name: 'Результат' }).click();
  await expect(page.locator('.built-pre')).toContainText('<!DOCTYPE html>');
  await expect(page.locator('.built-pre')).toContainText('<script>');

  const stats = page.locator('.stats');
  await expect(stats).toContainText('B');
  await expect(stats.locator('.limit.ok')).toBeVisible();
});

test('switching a template replaces the editor content', async ({ page }) => {
  const select = page.locator('.sidebar select');
  await select.selectOption('card');
  const editorText = await page.locator('.cm-content').first().innerText();
  expect(editorText).toContain('card');
});

test('theme toggle switches the chat mock scheme', async ({ page }) => {
  const mock = page.locator('.chat-mock');
  await expect(mock).toHaveAttribute('data-theme', 'dark');
  await page
    .locator('.sidebar')
    .getByRole('button', { name: /Dark \/ Light/i })
    .click();
  await expect(mock).toHaveAttribute('data-theme', 'light');
});

test('language switch translates the UI', async ({ page }) => {
  await expect(page.locator('.sidebar select')).toHaveAccessibleName(/Шаблон/i);
  await page.locator('.locale-switch').getByRole('button', { name: 'EN' }).click();
  await expect(page.locator('.sidebar select')).toHaveAccessibleName(/Template/i);
  await expect(page.getByRole('tab', { name: 'Built' })).toBeVisible();
});

test('profile violations surface in the lint panel', async ({ page }) => {
  await typeInEditor(page, 0, '<input type="text">\n');
  const lint = page.locator('.lint-panel');
  await expect(lint).toBeVisible({ timeout: 5_000 });
  await expect(lint).toContainText('<input>');
});

test('resizable split changes pane proportions and persists ARIA state', async ({ page }) => {
  const divider = page.locator('[role="separator"]');
  const workspace = page.locator('.workspace');
  const before = await workspace.boundingBox();
  const dividerBox = await divider.boundingBox();

  await page.mouse.move(
    dividerBox!.x + dividerBox!.width / 2,
    dividerBox!.y + dividerBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(before!.x + before!.width * 0.85, dividerBox!.y + 50, { steps: 5 });
  await page.mouse.up();

  const now = Number(await divider.getAttribute('aria-valuenow'));
  expect(now).toBeGreaterThan(65);
  expect(now).toBeLessThanOrEqual(80);
});

test('auto-build refreshes the preview while typing', async ({ page }) => {
  await typeInEditor(page, 0, '<p id="probe">probe</p>\n');
  const frame = page.frameLocator('.preview-frame');
  await expect(frame.locator('#probe')).toBeAttached({ timeout: 5_000 });
});

/** Types into the Nth CodeMirror editor (0 = HTML, 1 = CSS, 2 = JS). */
async function typeInEditor(page: Page, index: number, text: string): Promise<void> {
  const panel = page.locator('[role="tabpanel"]').nth(index);
  await panel.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+ArrowUp');
  await page.keyboard.insertText(text);
  // let the debounced pipeline (lint 220ms + auto-build 650ms) settle
  await page.waitForTimeout(1_000);
}
