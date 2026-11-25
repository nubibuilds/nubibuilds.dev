import { expect, test, type Page } from '@playwright/test';

/**
 * Keyboard and accessibility checks (WCAG 2.2 AA). They run against the production build.
 *
 * The axe-core scan at the bottom uses the @axe-core/playwright dev dependency.
 * If it is ever missing, the scan is skipped and the keyboard tests still run.
 *
 * Automated checks do not prove conformance: see docs/accessibility.md for what was
 * verified by hand and what still needs a person (screen reader, real content).
 */

const PAGES = ['/', '/work', '/id/work', '/writing', '/id/writing', '/about', '/now', '/uses'];

/**
 * Open the first entry of a list page. Returns false, without navigating, when the list is
 * empty (nothing published yet), so the caller can skip instead of timing out.
 */
async function firstDetail(page: Page, list: string, link: string): Promise<boolean> {
  await page.goto(list);
  const first = page.locator(link).first();
  if ((await first.count()) === 0) return false;
  await first.click();
  await page.waitForLoadState('domcontentloaded');
  return true;
}

const WORK_LINK = '[data-showcase] .wc-title a';
const ARTICLE_LINK = 'main ul.rows a.row';

/**
 * What has focus, and whether a focus indicator is drawn for it. Scrolling to a newly focused
 * element can take a few frames to settle (longer on a busy machine), so an element that looks
 * off screen is measured again, for up to half a second, before it counts as off screen.
 */
const focusInfo = (page: Page) =>
  page.evaluate(async () => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const ring = (node: Element) => {
      const style = getComputedStyle(node);
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
    };
    // Text fields without their own outline are marked on their wrapper.
    const wrapper = el.closest('.search-field, .term-in');
    const marked = wrapper ? ring(wrapper) || getComputedStyle(wrapper).borderTopColor !== 'rgba(0, 0, 0, 0)' : false;
    const visible = () => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight + 1 && rect.right > 0 && rect.left < window.innerWidth + 1;
    };
    let onScreen = visible();
    for (const start = performance.now(); !onScreen && performance.now() - start < 500; ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      onScreen = visible();
    }
    return {
      name: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40),
      tag: el.tagName,
      indicated: ring(el) || marked,
      positiveTabindex: el.tabIndex > 0,
      onScreen,
    };
  });

test.describe('keyboard', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the skip link is the first stop and moves focus into the main content', async ({ page }) => {
    await page.goto('/work');
    await page.keyboard.press('Tab');
    const skip = page.locator('a.skip');
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('main'))).toBeTruthy();
  });

  // Text is sized in rem, so it follows the browser's font-size setting; the hidden skip link must not peek out.
  test('the skip link stays hidden until focused when the browser text size is doubled', async ({ page, context }) => {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: 32, fixed: 32 } });
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.body).fontSize)).toBe('30px');
    const skip = page.locator('a.skip');
    await expect(skip).not.toBeInViewport();
    await page.keyboard.press('Tab');
    await expect(skip).toBeInViewport({ ratio: 1 });
  });

  test('every tab stop is visible, on screen, and shows a focus indicator', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const seen: string[] = [];
      for (let i = 0; i < 120; i += 1) {
        await page.keyboard.press('Tab');
        const info = await focusInfo(page);
        if (!info) break; // focus left the page: the end of the tab order, so no trap
        const key = `${info.tag}:${info.name}`;
        if (seen[0] === key && i > 1) break;
        seen.push(key);
        expect(info.indicated, `${path}: no focus indicator on "${info.name}"`).toBeTruthy();
        expect(info.onScreen, `${path}: "${info.name}" is focused off screen`).toBeTruthy();
        expect(info.positiveTabindex, `${path}: positive tabindex on "${info.name}"`).toBeFalsy();
      }
      expect(seen.length, `${path}: nothing is focusable`).toBeGreaterThan(5);
    }
  });

  test('Shift+Tab walks the same stops backwards', async ({ page }) => {
    await page.goto('/about');
    const forward: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      forward.push((await focusInfo(page))?.name ?? '');
    }
    const backward: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab');
      backward.push((await focusInfo(page))?.name ?? '');
    }
    expect(backward).toEqual(forward.slice(0, 5).reverse());
  });

  test('the theme button works with Enter and Space', async ({ page }) => {
    await page.goto('/');
    const theme = () => page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator('[data-theme-toggle]').focus();
    await page.keyboard.press('Enter');
    const first = await theme();
    await page.keyboard.press('Space');
    expect(await theme()).not.toBe(first);
  });

  test('the back-to-top button shows once scrolled, and returns focus to the top', async ({ page }) => {
    await page.goto('/about');
    const button = page.locator('[data-to-top]');
    await expect(button).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName('Back to top');

    await button.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('a.skip')).toBeFocused();
    await expect(button).toBeHidden();
  });
});

test.describe('terminal dialog', () => {
  test('opens from the keyboard, keeps focus inside, and gives it back on Escape', async ({ page }) => {
    await page.goto('/');
    const opener = page.locator('[data-terminal-open]');
    const dialog = page.locator('[data-terminal]');
    const input = page.locator('[data-terminal-input]');

    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(input).toBeFocused();

    // With an empty prompt Tab is not captured: every stop stays inside the dialog.
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => !document.activeElement || document.activeElement === document.body || !!document.activeElement.closest('[data-terminal]'));
      expect(inside, 'focus escaped the open dialog').toBeTruthy();
    }

    // The close button and the links printed by `ls` are reachable.
    await input.focus();
    await input.fill('ls');
    await input.press('Enter');
    await page.keyboard.press('Shift+Tab');
    await expect(input).not.toBeFocused();
    await expect(page.locator('[data-terminal-out] a').first()).toBeVisible();
    await page.locator('[data-terminal-close]').focus();
    await expect(page.locator('[data-terminal-close]')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('Tab still completes a half-typed command', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-terminal-open]').click();
    const input = page.locator('[data-terminal-input]');
    await input.fill('whoa');
    await input.press('Tab');
    await expect(input).toHaveValue(/^whoami\s?$/);
    await expect(input).toBeFocused();
  });

  test('the single-key ` shortcut can be turned off', async ({ page }) => {
    await page.goto('/');
    const dialog = page.locator('[data-terminal]');
    await page.locator('main').click({ position: { x: 4, y: 4 } });
    await page.keyboard.press('`');
    await expect(dialog).toBeVisible();

    const input = page.locator('[data-terminal-input]');
    await input.fill('keys off');
    await input.press('Enter');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await page.locator('main').click({ position: { x: 4, y: 4 } });
    await page.keyboard.press('`');
    await expect(dialog).toBeHidden();
    await page.keyboard.press('Control+k');
    await expect(dialog).toBeVisible();
  });
});

test.describe('content widgets', () => {
  test('an image opens in the viewer with Enter and focus returns on Escape', async ({ page }) => {
    test.skip(!(await firstDetail(page, '/work', WORK_LINK)), 'no published case study yet');
    const zoom = page.locator('button.zoom').first();
    test.skip((await zoom.count()) === 0, 'this case study has no zoomable image');

    await zoom.focus();
    await page.keyboard.press('Enter');
    const viewer = page.locator('dialog.lightbox');
    await expect(viewer).toBeVisible();
    await expect(page.locator('.lightbox-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(zoom).toBeFocused();
  });

  test('the copy button reports its result to assistive technology', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    test.skip(!(await firstDetail(page, '/writing', ARTICLE_LINK)), 'no published article yet');
    const copy = page.locator('.code-copy').first();
    test.skip((await copy.count()) === 0, 'this article has no code block');

    await copy.focus();
    await page.keyboard.press('Enter');
    await expect(copy).toHaveAttribute('aria-label', 'Copied to clipboard');
    await expect(page.locator('[role="status"].sr-only')).toHaveText('Code copied to clipboard');
  });

  test('search results can be reached with Tab', async ({ page }) => {
    await page.goto('/writing');
    const input = page.locator('[data-search] input');
    await input.focus();
    expect((await focusInfo(page))?.indicated).toBeTruthy();
    const titles = page.locator('main ul.rows a.row .title');
    test.skip((await titles.count()) === 0, 'no published article yet');
    const title = (await titles.first().innerText()).trim();
    await input.fill(title.split(/\s+/).find((part) => /^[\p{L}\p{N}]{3,}$/u.test(part)) ?? title.slice(0, 4));
    await expect(page.locator('[data-search-results] a').first()).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-search-results] a').first()).toBeFocused();
  });

  test('pages reflow at 320px wide (400% zoom) without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of PAGES) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} scrolls sideways at 320px`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('axe-core scan', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let AxeBuilder: any;

  test.beforeAll(async () => {
    try {
      // Built at run time so type-checking does not need the package.
      const name = '@axe-core/playwright';
      AxeBuilder = (await import(name)).default;
    } catch {
      AxeBuilder = undefined;
    }
  });

  for (const scheme of ['dark', 'light'] as const) {
    test(`no WCAG 2.2 A/AA violations (${scheme} theme)`, async ({ page }) => {
      test.skip(!AxeBuilder, 'run `pnpm add -D @axe-core/playwright` to enable the axe-core scan');
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });

      const targets = [...PAGES];
      // One case study and one article too, once something is published.
      if (await firstDetail(page, '/work', WORK_LINK)) targets.push(new URL(page.url()).pathname);
      if (await firstDetail(page, '/writing', ARTICLE_LINK)) targets.push(new URL(page.url()).pathname);

      // Scan every page before asserting, so one run reports all violations instead of stopping at the first page.
      const found: string[] = [];
      for (const path of targets) {
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        for (const v of results.violations as { id: string; help: string; nodes: { target: string[] }[] }[]) {
          found.push(`${path}: ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
        }
      }
      expect(found, `${scheme} theme`).toEqual([]);
    });
  }
});
