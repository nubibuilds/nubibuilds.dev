---
title: "One slash, two URLs: when canonical and hreflang disagree"
summary: "A pre-launch check found my canonical links ending in a slash and my hreflang links not. Why that matters, and the one rule that fixed it."
date: 2026-11-22
tags: ["seo", "astro", "i18n"]
draft: false
---

Just before this site went live, every check I had was green: a clean type-check, all end-to-end tests passing, and a Lighthouse SEO score of 100 on every page I measured. Then a last read through the generated HTML turned up something none of those checks looked at. The same page was announcing two different addresses for itself, and the only difference was one character at the end.

## What the HTML said

This is the `<head>` of the `/work` page as the build produced it:

```html title="dist/work/index.html"
<link rel="canonical" href="https://nubibuilds.dev/work/">
<link rel="alternate" hreflang="en" href="https://nubibuilds.dev/work">
<link rel="alternate" hreflang="id" href="https://nubibuilds.dev/id/work">
<link rel="alternate" hreflang="x-default" href="https://nubibuilds.dev/work">
```

The canonical link says the real address is `/work/`, with a slash. The `hreflang` links, which tell search engines which page is the English version and which is the Indonesian one, say `/work`, without it. The sitemap used the slash. The navigation links did not.

To a person, `/work` and `/work/` are the same page. To a search engine they are two URLs, and depending on the host, one of them is either a redirect or a second copy of the same content.

## Why one character matters

Each of those tags is a signal about which URL is the real one. Google's guidance on duplicate URLs is direct about mixing them:[^1]

> Don't specify different URLs as canonical for the same page using different canonicalization techniques.

The same page asks for internal links to point at the canonical URL, not a duplicate, and for `hreflang` to name canonical pages. Its `hreflang` guide adds that each language version must list itself as well as all the others.[^2] My English page listed `/work` as itself while declaring `/work/` canonical. The pair no longer pointed cleanly at each other.

None of this breaks the site for visitors, which is exactly why it slipped through. Search engines may still work it out. But sending mixed signals and hoping they get resolved the way you meant is not a plan.

## Where the two forms came from

Astro's static build writes each page as a folder with an `index.html` inside: `dist/work/index.html`. The URL that maps to that file naturally ends in a slash, and that is what `Astro.url.pathname` returns during the build. The canonical link was built from it, so it had the slash.

The `hreflang` links came from a different place: small helpers that build URLs for the two languages, which returned `/work` and `/id/work`. The sitemap used a third helper that added the slash. Three pieces of code, each reasonable on its own, and two of them agreed.

## The fix: one rule, written down once

I picked the form the build already publishes, the one with the slash, and made every URL follow it:

```ts title="src/shared/lib/i18n.ts" {2}
export const sectionBase = (section: string, lang: Lang) =>
  lang === DEFAULT_LANG ? `/${section}/` : `/${lang}/${section}/`;
```

- **Section and entry URLs** end in `/`: `/work/`, `/id/writing/`, `/work/nubibuilds/`.
- **Canonical, `og:url` and `hreflang`** now go through the same `absoluteUrl` helper the sitemap uses, so they cannot drift apart again.
- **Navigation and footer links** use the slash too, so no click lands on the second address.
- **The 404 page** no longer declares a canonical URL at all, since it is not meant to be indexed.

One side effect needed care. The header highlights the active tab by comparing the current path with each link. With the slash on one side and not the other, that comparison fails in the dev server, which serves both forms. Comparing both without the trailing slash fixed it.

## A test that compares the signals

A score of 100 told me each tag was well formed. It did not tell me the tags agreed with each other. So I added an end-to-end test that checks exactly that. For each bilingual list page, it reads the canonical URL and every `hreflang` URL. Then it checks that each one appears in the sitemap and that the page lists itself among its language versions. It also checks that every internal page link on the home page ends in a slash.

If a future change brings back a URL without the slash, the test suite now fails before the site goes out.

## What I took away

Checks that score each tag on its own will not catch tags that contradict each other. When several parts of a site describe the same thing, here the address of a page, decide on one form, produce it in one place, and test that everything that mentions it agrees.

[^1]: Google Search Central, [How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), read 22 November 2026.

[^2]: Google Search Central, [Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions), read 22 November 2026.
