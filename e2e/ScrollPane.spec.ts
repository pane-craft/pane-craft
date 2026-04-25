import { test, expect, type Page } from '@playwright/test';

const getStoryUrl = (id: string) =>
  `/iframe.html?id=core-scrollpane--${id}&viewMode=story`;
const getScreenshotPath = (name: string) => `e2e/screenshots/ScrollPane/${name}`;

const getScrollOffset = (page: Page, axis: 'horizontal' | 'vertical') =>
  page.locator('[data-testid="scroll-pane-viewport"]').evaluate(
    (el, ax) => (ax === 'horizontal' ? el.scrollLeft : el.scrollTop),
    axis,
  );

test.describe('ScrollPane Component Visuals and Interactions', () => {
  // Horizontal overflow — base states ----------------------------------------
  test('HorizontalOverflow: hides scrollbar by default', async ({ page }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const track = page.getByTestId('scroll-pane-track');

    await expect(track).toBeAttached();
    await expect(track).toHaveCSS('opacity', '0');
    await page.screenshot({
      path: getScreenshotPath('horizontal-default-hidden.png'),
    });
  });

  test('HorizontalOverflow: reveals scrollbar on pointer enter', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const pane = page.getByTestId('scroll-pane');
    const track = page.getByTestId('scroll-pane-track');

    await pane.hover();
    await expect(track).toHaveCSS('opacity', '1');
    await page.screenshot({
      path: getScreenshotPath('horizontal-hover-track.png'),
    });
  });

  test('HorizontalOverflow: thumb grows on hover', async ({ page }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const pane = page.getByTestId('scroll-pane');
    const thumb = page.getByTestId('scroll-pane-thumb');

    await pane.hover();
    const restingHeight = await thumb.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().height,
    );

    await thumb.hover();
    // Wait for the height transition to settle before measuring.
    await expect
      .poll(() =>
        thumb.evaluate(
          (el) => (el as HTMLElement).getBoundingClientRect().height,
        ),
      )
      .toBeGreaterThan(restingHeight);
    await page.screenshot({
      path: getScreenshotPath('horizontal-thumb-hover.png'),
    });
  });

  // Horizontal overflow — ARIA -----------------------------------------------
  test('HorizontalOverflow: track exposes scrollbar ARIA attributes', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const track = page.getByTestId('scroll-pane-track');

    await expect(track).toHaveAttribute('role', 'scrollbar');
    await expect(track).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(track).toHaveAttribute('aria-valuemin', '0');
    await expect(track).toHaveAttribute('aria-valuenow', '0');
    await expect(track).toHaveAttribute('tabindex', '0');
  });

  // Horizontal overflow — interactions ---------------------------------------
  test('HorizontalOverflow: dragging the thumb scrolls the viewport', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const pane = page.getByTestId('scroll-pane');
    const thumb = page.getByTestId('scroll-pane-thumb');

    await pane.hover();
    const before = await getScrollOffset(page, 'horizontal');
    expect(before).toBe(0);

    const box = await thumb.boundingBox();
    if (!box) throw new Error('thumb bounding box unavailable');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, {
      steps: 8,
    });
    await page.mouse.up();

    const after = await getScrollOffset(page, 'horizontal');
    expect(after).toBeGreaterThan(0);
    await page.screenshot({
      path: getScreenshotPath('horizontal-after-drag.png'),
    });
  });

  test('HorizontalOverflow: clicking the track jumps the thumb (jump mode)', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const pane = page.getByTestId('scroll-pane');
    const track = page.getByTestId('scroll-pane-track');

    await pane.hover();
    const trackBox = await track.boundingBox();
    if (!trackBox) throw new Error('track bounding box unavailable');

    await page.mouse.click(
      trackBox.x + trackBox.width * 0.85,
      trackBox.y + trackBox.height / 2,
    );

    const after = await getScrollOffset(page, 'horizontal');
    expect(after).toBeGreaterThan(0);
    await page.screenshot({
      path: getScreenshotPath('horizontal-after-track-click.png'),
    });
  });

  test('HorizontalOverflow: vertical wheel translates to horizontal scroll', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const viewport = page.getByTestId('scroll-pane-viewport');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('viewport bounding box unavailable');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200);

    const after = await getScrollOffset(page, 'horizontal');
    expect(after).toBeGreaterThan(0);
  });

  test('HorizontalOverflow: ArrowRight on focused track scrolls forward', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const track = page.getByTestId('scroll-pane-track');

    await track.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    const after = await getScrollOffset(page, 'horizontal');
    expect(after).toBeGreaterThan(0);
  });

  test('HorizontalOverflow: End key scrolls to the maximum offset', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-overflow'));
    const track = page.getByTestId('scroll-pane-track');

    await track.focus();
    await page.keyboard.press('End');

    const after = await getScrollOffset(page, 'horizontal');
    expect(after).toBeGreaterThan(100);
  });

  // No overflow --------------------------------------------------------------
  test('HorizontalNoOverflow: track is not rendered when content fits', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('horizontal-no-overflow'));

    await expect(page.getByTestId('scroll-pane')).toBeVisible();
    await expect(page.getByTestId('scroll-pane-track')).toHaveCount(0);
    await page.screenshot({
      path: getScreenshotPath('horizontal-no-overflow.png'),
    });
  });

  // Always visible -----------------------------------------------------------
  test('AlwaysVisibleScrollbar: track is visible without hover', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('always-visible-scrollbar'));
    const track = page.getByTestId('scroll-pane-track');

    await expect(track).toBeVisible();
    await expect(track).toHaveCSS('opacity', '1');
    await page.screenshot({
      path: getScreenshotPath('always-visible.png'),
    });
  });

  // Vertical orientation -----------------------------------------------------
  test('VerticalOverflow: track is positioned on the right and oriented vertically', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('vertical-overflow'));
    const pane = page.getByTestId('scroll-pane');
    const track = page.getByTestId('scroll-pane-track');

    await expect(pane).toHaveAttribute('data-orientation', 'vertical');
    await expect(track).toHaveAttribute('aria-orientation', 'vertical');

    await pane.hover();
    await page.screenshot({
      path: getScreenshotPath('vertical-hover-track.png'),
    });
  });

  test('VerticalOverflow: dragging the thumb scrolls the viewport vertically', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('vertical-overflow'));
    const pane = page.getByTestId('scroll-pane');
    const thumb = page.getByTestId('scroll-pane-thumb');

    await pane.hover();
    const before = await getScrollOffset(page, 'vertical');
    expect(before).toBe(0);

    const box = await thumb.boundingBox();
    if (!box) throw new Error('thumb bounding box unavailable');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, {
      steps: 8,
    });
    await page.mouse.up();

    const after = await getScrollOffset(page, 'vertical');
    expect(after).toBeGreaterThan(0);
    await page.screenshot({
      path: getScreenshotPath('vertical-after-drag.png'),
    });
  });

  // Increment track click ----------------------------------------------------
  test('IncrementTrackClick: clicking the track pages forward (~80% viewport)', async ({
    page,
  }) => {
    await page.goto(getStoryUrl('increment-track-click'));
    const track = page.getByTestId('scroll-pane-track');

    const trackBox = await track.boundingBox();
    if (!trackBox) throw new Error('track bounding box unavailable');

    await page.mouse.click(
      trackBox.x + trackBox.width * 0.9,
      trackBox.y + trackBox.height / 2,
    );

    const after = await getScrollOffset(page, 'horizontal');
    expect(after).toBeGreaterThan(0);
    await page.screenshot({
      path: getScreenshotPath('increment-after-click.png'),
    });
  });
});
