import { test, expect } from '@playwright/test';

const getStoryUrl = (id: string) =>
  `/iframe.html?id=core-tab--${id}&viewMode=story`;
const getScreenshotPath = (name: string) => `e2e/screenshots/Tab/${name}`;

test.describe('Tab Component Visuals and Interactions', () => {
  // Base states --------------------------------------------------------------
  test('Default: renders label', async ({ page }) => {
    await page.goto(getStoryUrl('default'));
    const tab = page.getByTestId('tab-0');

    await expect(tab).toBeVisible();
    await expect(tab).toContainText('Default Tab');
    await page.screenshot({ path: getScreenshotPath('tab-default.png') });
  });

  test('Active: renders with active styling', async ({ page }) => {
    await page.goto(getStoryUrl('active'));
    const tab = page.getByTestId('tab-1');

    await expect(tab).toBeVisible();
    await page.screenshot({ path: getScreenshotPath('tab-active.png') });
  });

  // Default ARIA attributes --------------------------------------------------
  test('Default: inactive tab has correct default ARIA attributes', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('default'));
    const tab = page.getByTestId('tab-0');

    await expect(tab).toHaveAttribute('role', 'tab');
    await expect(tab).toHaveAttribute('aria-selected', 'false');
    await expect(tab).toHaveAttribute('tabindex', '-1');
  });

  test('Active: active tab has correct default ARIA attributes', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('active'));
    const tab = page.getByTestId('tab-1');

    await expect(tab).toHaveAttribute('role', 'tab');
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveAttribute('tabindex', '0');
  });

  // a11y prop overrides ------------------------------------------------------
  test('AccessibilityOverride: a11y prop overrides default tabIndex', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('accessibility-override'));
    const tab = page.getByTestId('tab-30');

    await expect(tab).toHaveAttribute('role', 'tab');
    await expect(tab).toHaveAttribute('aria-selected', 'false');
    await expect(tab).toHaveAttribute('tabindex', '1');
  });

  test('AccessibilityOverride: a11y prop adds non-default ARIA attributes', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('accessibility-override'));
    const tab = page.getByTestId('tab-30');

    await expect(tab).toHaveAttribute('aria-label', 'test-label');
  });

  // Close button -------------------------------------------------------------
  test('WithCloseCallback: close button is visible with correct aria-label', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('with-close-callback'));
    const closeBtn = page.getByTestId('close-10');

    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute(
      'aria-label',
      'Close Close Callback',
    );
    await page.screenshot({
      path: getScreenshotPath('tab-close-visible.png'),
    });
  });

  test('WithCloseCallback: close button hover state', async ({ page }) => {
    await page.goto(getStoryUrl('with-close-callback'));

    await page.getByTestId('close-10').hover();
    await page.screenshot({
      path: getScreenshotPath('tab-close-hover.png'),
    });
  });

  test('WithCloseCallback: close button is keyboard-focusable and activatable', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('with-close-callback'));
    const tab = page.getByTestId('tab-10');
    const closeBtn = page.getByTestId('close-10');

    await tab.focus();
    await page.keyboard.press('Tab');
    await expect(closeBtn).toBeFocused();

    await page.keyboard.press('Enter');
    await page.screenshot({
      path: getScreenshotPath('tab-close-keyboard.png'),
    });
  });

  test('WithoutClose: pinned tab has no close button', async ({ page }) => {
    await page.goto(getStoryUrl('without-close'));

    await expect(page.getByTestId('close-11')).not.toBeVisible();
    await page.screenshot({ path: getScreenshotPath('tab-pinned.png') });
  });

  // Drag-and-drop states -----------------------------------------------------
  test('Dragging: dragged tab is visible', async ({ page }) => {
    await page.goto(getStoryUrl('dragging'));
    const tab = page.getByTestId('tab-20');

    await expect(tab).toBeVisible();
    await page.screenshot({ path: getScreenshotPath('tab-dragging.png') });
  });

  test('DropTargetLeft: drop target left indicator', async ({ page }) => {
    await page.goto(getStoryUrl('drop-target-left'));
    const tab = page.getByTestId('tab-21');

    await expect(tab).toBeVisible();
    await page.screenshot({
      path: getScreenshotPath('tab-drop-target-left.png'),
    });
  });

  test('DropTargetRight: drop target right indicator', async ({ page }) => {
    await page.goto(getStoryUrl('drop-target-right'));
    const tab = page.getByTestId('tab-22');

    await expect(tab).toBeVisible();
    await page.screenshot({
      path: getScreenshotPath('tab-drop-target-right.png'),
    });
  });

  // Edge cases ---------------------------------------------------------------
  test('LongLabel: truncated label is visible', async ({ page }) => {
    await page.goto(getStoryUrl('long-label'));
    const label = page
      .locator('span')
      .filter({ hasText: 'A longer label that overflows' });

    await expect(label).toBeVisible();
    await page.screenshot({
      path: getScreenshotPath('tab-long-label.png'),
      fullPage: false,
    });
  });
});
