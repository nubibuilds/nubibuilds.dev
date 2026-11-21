import { expect, test, type Page } from '@playwright/test';
import { site } from '../../src/shared/config/site';

/** Open the first article in a list page and return to the caller once it has loaded; skips the test when none is published. */
async function openFirstArticle(page: Page, listUrl: string) {
  await page.goto(listUrl);
  const first = page.locator('main ul.rows a.row').first();
  test.skip((await first.count()) === 0, 'no published article yet');
  await first.click();
  await expect(page.locator('article.prose')).toBeVisible();
}

/** Open the first case study on /work; skips the test when none is published. */
async function openFirstCase(page: Page) {
  await page.goto('/work');
  const first = page.locator('[data-showcase] .wc-title a').first();
  test.skip((await first.count()) === 0, 'no published case study yet');
  await first.click();
}

test.describe('navigation', () => {
  test('home shows the hero and links to work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: './work' }).click();
    await expect(page).toHaveURL(/\/work\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('every top-level page renders without horizontal scrolling', async ({ page }) => {
    for (const path of ['/', '/work', '/id/work', '/about', '/writing', '/id/writing', '/now', '/uses']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(1);
    }
  });

  // The background ornaments are placed at a percentage of their section's height; if they are visible
  // while the page is still arriving, they jump as it grows (Lighthouse measured 0.12 on /writing).
  test('pages load without layout shift, and the ornaments show once loaded', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { cls: number }).cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!entry.hadRecentInput) (window as unknown as { cls: number }).cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    for (const path of ['/', '/work', '/writing', '/id/writing', '/about', '/now', '/uses']) {
      await page.goto(path);
      await page.waitForTimeout(500);
      const cls = await page.evaluate(() => (window as unknown as { cls: number }).cls);
      expect(cls, `${path} layout shift`).toBeLessThan(0.05);
      await expect(page.locator('html')).not.toHaveClass(/orn-wait/);
      await expect(page.locator('main .orn').first()).toHaveCSS('visibility', 'visible');
    }
  });

  test('unknown URLs get the 404 page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('language', () => {
  test('Indonesian pages keep Work, Writing and the feed in Indonesian', async ({ page }) => {
    await page.goto('/id/work');
    const nav = page.getByRole('navigation', { name: 'Utama' });
    await expect(nav.getByRole('link', { name: './work' })).toHaveAttribute('href', '/id/work/');
    await expect(nav.getByRole('link', { name: './writing' })).toHaveAttribute('href', '/id/writing/');
    await expect(nav.getByRole('link', { name: './about' })).toHaveAttribute('href', '/about/');
    await expect(page.locator('footer a', { hasText: 'rss.xml' })).toHaveAttribute('href', '/id/rss.xml');

    await nav.getByRole('link', { name: './writing' }).click();
    await expect(page).toHaveURL(/\/id\/writing\/?$/);
  });

  test('English pages link to the English sections', async ({ page }) => {
    await page.goto('/work');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: './work' })).toHaveAttribute('href', '/work/');
    await expect(page.locator('footer a', { hasText: 'rss.xml' })).toHaveAttribute('href', '/rss.xml');
  });

  test('`cd work` in the terminal stays in Indonesian on an Indonesian page', async ({ page }) => {
    await page.goto('/id/writing');
    await page.locator('[data-terminal-open]').click();
    const input = page.locator('[data-terminal-input]');
    await input.fill('cd work');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/id\/work\/?$/);
  });

  test('the page frame follows the page language', async ({ page }) => {
    await page.goto('/id/writing');
    await expect(page.locator('a.skip')).toHaveText('Langsung ke konten');
    await expect(page.getByRole('navigation', { name: 'Lainnya' })).toBeAttached();
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-label', /^theme: (gelap|terang), ganti ke /);
    await expect(page.locator('[data-terminal]')).toHaveAttribute('aria-label', 'Terminal interaktif');

    await page.goto('/writing');
    await expect(page.locator('a.skip')).toHaveText('Skip to content');
    await expect(page.locator('[data-terminal]')).toHaveAttribute('aria-label', 'Interactive terminal');
  });
});

test.describe('theme', () => {
  test('the toggle switches and remembers the theme', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.locator('[data-theme-toggle]').click();
    const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(after).not.toBe(before);

    await page.reload();
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(after);
  });

  // tokens.css writes the light palette twice (chosen with the button / following the system); they must match.
  test('the light theme is the same whether chosen or followed from the system', async ({ page }) => {
    const tokens = () =>
      page.evaluate(() => {
        const names = new Set<string>();
        for (const sheet of document.styleSheets) {
          let rules: CSSRuleList;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          const visit = (list: CSSRuleList) => {
            for (const rule of list) {
              if (rule instanceof CSSStyleRule && rule.selectorText.includes(':root')) {
                for (const prop of rule.style) if (prop.startsWith('--')) names.add(prop);
              }
              if ('cssRules' in rule) visit((rule as CSSGroupingRule).cssRules);
            }
          };
          visit(rules);
        }
        const style = getComputedStyle(document.documentElement);
        return Object.fromEntries([...names].sort().map((name) => [name, style.getPropertyValue(name).trim()]));
      });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const followed = await tokens();

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
    const chosen = await tokens();

    expect(Object.keys(followed).length).toBeGreaterThan(15);
    expect(chosen).toEqual(followed);
  });

  test('the toggle names the active theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    await expect(toggle).toHaveAttribute('aria-label', 'theme: dark, switch to light');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'theme: light, switch to dark');

    // With no saved choice, the name follows a change of the system setting.
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(toggle).toHaveAttribute('aria-label', 'theme: light, switch to dark');
  });
});

test.describe('work showcase', () => {
  test('headings do not skip a level on the list pages', async ({ page }) => {
    for (const path of ['/work', '/id/work', '/writing', '/']) {
      await page.goto(path);
      const levels = await page.locator('main :is(h1, h2, h3, h4)').evaluateAll((nodes) => nodes.map((node) => Number(node.tagName[1])));
      levels.forEach((level, i) => expect(i === 0 || level <= levels[i - 1] + 1, `${path}: h${levels[i - 1]} followed by h${level}`).toBeTruthy());
    }
  });

  test('a case study switches between English and Indonesian', async ({ page }) => {
    await openFirstCase(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const other = page.locator('[data-lang-switch] a[hreflang="id"]');
    test.skip((await other.count()) === 0, 'the first case study has no Indonesian version');
    await other.click();
    await expect(page).toHaveURL(/\/id\/work\/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  });

  test('cards link to their case study', async ({ page }) => {
    await page.goto('/work');
    const card = page.locator('[data-showcase]').first();
    test.skip((await card.count()) === 0, 'no published case study yet');
    await expect(card).toBeVisible();
    await card.locator('.wc-title a').click();
    await expect(page).toHaveURL(/\/work\/.+/);
    await expect(page.locator('article.prose')).toBeVisible();
  });

  test('the stack filter narrows the list and "all" restores it', async ({ page }) => {
    await page.goto('/work');
    const filter = page.locator('[data-filter]');
    test.skip(!(await filter.isVisible()), 'fewer than two stacks: the filter is not shown');

    const total = await page.locator('[data-showcase]').count();
    await filter.locator('button').nth(1).click();
    const shown = await page.locator('[data-showcase]:visible').count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThanOrEqual(total);

    await filter.locator('[data-filter-value="*"]').click();
    await expect(page.locator('[data-showcase]:visible')).toHaveCount(total);
  });

  // Runs without the filter bar: hides a card the way the filter does and checks the spacing around it.
  test('a card hidden by the filter leaves the others evenly spaced, each with its divider', async ({ page }) => {
    await page.goto('/work');
    const cards = page.locator('.work-list > .work-card');
    test.skip((await cards.count()) < 3, 'needs at least three case studies');

    const measure = () =>
      page.evaluate(() => {
        const visible = [...document.querySelectorAll<HTMLElement>('.work-list > .work-card')].filter((card) => !card.hidden);
        // Layout offsets, not bounding boxes: the scroll-driven reveal animation moves cards with transforms.
        return visible.slice(1).map((card, i) => ({
          gap: card.offsetTop - (visible[i].offsetTop + visible[i].offsetHeight),
          divider: getComputedStyle(card).borderTopStyle,
        }));
      });
    const before = await measure();

    await cards.nth(1).evaluate((card) => ((card as HTMLElement).hidden = true));
    const after = await measure();
    expect(after.length).toBe(before.length - 1);
    for (const pair of after) expect(pair).toEqual(before[0]);

    await cards.nth(0).evaluate((card) => ((card as HTMLElement).hidden = true));
    const firstVisible = page.locator('.work-list > .work-card:not([hidden])').first();
    await expect(firstVisible).toHaveCSS('border-top-style', 'none');
  });
});

test.describe('articles', () => {
  test('code blocks get a copy button and headings get anchor links', async ({ page }) => {
    await openFirstArticle(page, '/writing');
    await expect(page.locator('.code-frame .code-copy').first()).toBeVisible();
    const anchors = page.locator('article.prose .anchor');
    expect(await anchors.count()).toBeGreaterThan(0);
    await expect(anchors.first()).toHaveAttribute('href', /^#.+/);
  });

  test('the language switch moves between English and Indonesian', async ({ page }) => {
    await openFirstArticle(page, '/writing');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const toIndonesian = page.locator('[data-lang-switch] a[hreflang="id"]').first();
    test.skip(!(await toIndonesian.count()), 'this article has no Indonesian version');
    await toIndonesian.click();
    await expect(page).toHaveURL(/\/id\/writing\/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    await page.locator('[data-lang-switch] a[hreflang="en"]').first().click();
    await expect(page).toHaveURL(/^(?!.*\/id\/).*\/writing\/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('the article list can be searched', async ({ page }) => {
    await page.goto('/writing');
    const titles = page.locator('main ul.rows a.row .title');
    test.skip((await titles.count()) === 0, 'no published article yet');
    const title = (await titles.first().innerText()).trim();
    const word = title.split(/\s+/).find((part) => /^[\p{L}\p{N}]{3,}$/u.test(part)) ?? title.slice(0, 4);

    await page.locator('[data-search] input').fill(word);
    await expect(page.locator('[data-search-status]')).toBeVisible();
    await expect(page.locator('[data-search-results] a').first()).toBeVisible();

    await page.locator('[data-search] input').fill('zzzzzzzz-no-such-word');
    await expect(page.locator('[data-search-results]')).toBeHidden();
  });
});

test.describe('terminal', () => {
  test('opens from the header, answers help and navigates with cd', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-terminal-open]').click();
    const terminal = page.locator('[data-terminal]');
    await expect(terminal).toBeVisible();

    const input = page.locator('[data-terminal-input]');
    await input.fill('help');
    await input.press('Enter');
    await expect(page.locator('[data-terminal-out]')).toContainText('grep');

    await input.fill('definitely-not-a-command');
    await input.press('Enter');
    await expect(page.locator('[data-terminal-out]')).toContainText('command not found');

    await input.fill('cd work');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/work\/?$/);
  });

  test('`lang` switches a case study to its translation on the same host', async ({ page }) => {
    await openFirstCase(page);
    test.skip((await page.locator('link[rel="alternate"][hreflang="id"]').count()) === 0, 'no Indonesian version');

    await page.locator('[data-terminal-open]').click();
    const input = page.locator('[data-terminal-input]');
    await input.fill('lang id');
    await input.press('Enter');
    await expect(page).toHaveURL(/localhost:\d+\/id\/work\/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  });

  test('Escape closes it', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-terminal-open]').click();
    await expect(page.locator('[data-terminal]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-terminal]')).toBeHidden();
  });

  test('the page behind it does not scroll while it is open', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse wheel events are a desktop input');
    await page.goto('/');
    await page.locator('[data-terminal-open]').click();
    await expect(page.locator('[data-terminal]')).toBeVisible();
    // A wheel over the backdrop, as a visitor would scroll (a script can still scroll a locked page).
    await page.mouse.move(8, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.keyboard.press('Escape');
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});

test.describe('machine-readable files', () => {
  test('sitemap, feeds, robots and the search index are served', async ({ request }) => {
    for (const path of ['/sitemap.xml', '/rss.xml', '/id/rss.xml', '/robots.txt', '/search.json']) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should return 200`).toBeTruthy();
    }
    const index = await (await request.get('/search.json')).json();
    expect(Array.isArray(index)).toBeTruthy();
  });

  test('search engines are told what `site.indexable` says', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    for (const path of ['/', '/work', '/id/writing', '/about']) {
      await page.goto(path);
      const tag = page.locator('meta[name="robots"]');
      if (site.indexable) await expect(tag, `${path} should be indexable`).toHaveCount(0);
      else await expect(tag, `${path} should carry noindex`).toHaveAttribute('content', /noindex/);
    }
    expect(robots.includes('Sitemap:')).toBe(site.indexable);
    expect(robots).toContain('Allow: /');
  });

  test('canonical, hreflang, the sitemap and internal links name the same URL', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!));

    for (const path of ['/work/', '/id/work/', '/writing/', '/id/writing/']) {
      await page.goto(path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(listed.has(canonical!), `${path}: canonical ${canonical} should be in the sitemap`).toBeTruthy();

      // Every language version named by hreflang is itself a canonical URL from the sitemap,
      // and the page lists itself among them.
      const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
        links.map((link) => link.getAttribute('href')!),
      );
      expect(alternates).toContain(canonical);
      for (const href of alternates) expect(listed.has(href), `${path}: hreflang ${href} should be in the sitemap`).toBeTruthy();
    }

    // Internal page links use the same trailing-slash form, so no click lands on a second address.
    await page.goto('/');
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
    const pageLinks = hrefs.filter((href) => !href.includes('#') && !/\.\w+$/.test(href));
    for (const href of pageLinks) expect(href, `${href} should end in "/"`).toMatch(/\/$/);
  });
});
