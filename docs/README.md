# NubiBuilds documentation

How the site is put together, how to fill it with content, and how to look after it.

| Document | What it covers |
| --- | --- |
| [Colour palette](./colour-palette.md) | Every colour in the dark and light themes, what each is for, and the rules for using them |
| [Markdown elements](./markdown-elements.md) | Every Markdown element: syntax, how it looks on this site, and what is not supported |
| [Writing articles](./writing-articles.md) | Articles: free structure, frontmatter, images, and the templates in [`templates/`](./templates/) |
| [Writing case studies](./writing-case-studies.md) | The required structure of a case study, its frontmatter, and the templates in [`templates/`](./templates/) |
| [Accessibility](./accessibility.md) | Keyboard use, how each component behaves, how to test, and what is verified |
| [ASCII portrait](./ascii-portrait.md) | Redrawing the About page portrait from another photo, background removal, and the script's options |

The `README.md` in the project root is the short technical overview. This folder is the full guide.

Terms used throughout: an **article** is an entry on the Writing pages; a **case study** is an entry on the Work pages.

## The site at a glance

The personal site of an AI-native full-stack developer: terminal-styled, static, and driven by Markdown content.

- **Stack:** Astro 7, Markdown/MDX, plain CSS, TypeScript.
- **Output:** static HTML in `dist/`, hostable on Cloudflare Pages, Vercel, or any static host.
- **JavaScript in the browser:** very little. Every interactive feature is an enhancement; without JavaScript the pages still read correctly.

## Pages

| URL | Content | Source |
| --- | --- | --- |
| `/` | Hero, principles, featured case studies, short about, latest three articles, contact | `src/pages/index.astro` |
| `/work` | English case studies, with a stack filter | `src/content/work/en/` |
| `/work/<slug>` | One English case study | `src/content/work/en/<slug>.md` |
| `/id/work` | Indonesian case studies | `src/content/work/id/` |
| `/id/work/<slug>` | One Indonesian case study | `src/content/work/id/<slug>.md` |
| `/writing` | English articles, with search | `src/content/writing/en/` |
| `/writing/<slug>` | One English article | `src/content/writing/en/<slug>.md` |
| `/id/writing` | Indonesian articles | `src/content/writing/id/` |
| `/id/writing/<slug>` | One Indonesian article | `src/content/writing/id/<slug>.md` |
| `/about` | Story, profile, principles, journey, toolbox | `src/features/about/data/about.ts` |
| `/now` | What has your attention right now | `src/features/about/data/now.ts` |
| `/uses` | The tools you work with | `src/features/about/data/uses.ts` |
| `/rss.xml`, `/id/rss.xml` | Article feed per language | generated |
| `/sitemap.xml`, `/robots.txt`, `/search.json` | For search engines and the on-site search | generated |
| `/og/...png` | Social preview image per article and case study | generated |

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Local server with hot reload. Draft articles and case studies are shown. |
| `pnpm check` | Type-checks `.astro` and `.ts` files |
| `pnpm build` | Builds the static site into `dist/` |
| `pnpm preview` | Serves the built site locally |
| `pnpm test:e2e` | End-to-end tests against the built site (run `pnpm build` first) |
| `pnpm lighthouse` | Builds, then measures performance, accessibility and SEO |

## Folder structure

The project is feature-driven: pages only compose features, and each feature owns its components, data and logic.

```text
src/
├── pages/        routes only; they compose features
├── app/          SiteLayout: the layout every page uses (adds the terminal and search)
├── features/
│   ├── home/     hero and ASCII logo
│   ├── work/     project cards, case studies, two languages, covers, gallery, filter
│   ├── writing/  article list, article page, two languages, RSS
│   ├── about/    principles, loop diagram, profile, journey, toolbox, now, uses
│   ├── contact/  contact panel
│   ├── terminal/ interactive terminal
│   └── search/   search
├── shared/
│   ├── config/   site.ts: name, role, links, navigation, analytics
│   ├── layouts/  BaseLayout: head, header, footer
│   ├── styles/   tokens.css (colours), global.css, prose.css (Markdown), toc.css
│   ├── ui/       shared components: Section, Prompt, Toc, LangSwitch, Rain, Marquee, Video, YouTube
│   └── lib/      scripts and helpers (i18n.ts holds the language list)
├── content/
│   ├── work/     en/ and id/, one file per case study; assets/ for their images
│   └── writing/  en/ and id/, one file per article; assets/ for their images
└── content.config.ts   frontmatter schemas, validated at build time
```

Rules:

- A feature may import from `shared`, never from another feature.
- Pages and `src/app` are where features are combined.
- Imports use the aliases `@app/*`, `@features/*` and `@shared/*`.

## Features

- **Theme.** Dark by default; light follows the visitor's system setting. The `[ theme ]` button in the window bar switches it and the choice is remembered.
- **Interactive terminal.** The `[ >_ ]` button, `Ctrl/Cmd+K`, or the `` ` `` key. Type `help` for the commands: `ls`, `cd`, `cat`, `grep`, `theme`, `lang` and more. Tab completes; ↑/↓ recall history.
- **Search.** The field on the article lists and the terminal's `grep`. The index (`/search.json`) is built from the content; no external service.
- **Two languages for articles and case studies.** English at `/writing` and `/work`, Indonesian at `/id/writing` and `/id/work`, linked by the `lang [en] id` switch. On an Indonesian page, the `./work` and `./writing` tabs, the terminal's `cd work` and `cd writing`, and the `rss.xml` link stay in Indonesian. The page frame (skip link, header button names, navigation names, terminal labels) follows the page language; its text is `frameText` in `src/shared/lib/i18n.ts`. Home, About, Now and Uses are English only.
- **Moving ornaments.** Falling characters and drifting text behind each section (`Rain` and `Marquee`; their text is in `src/shared/ui/ornaments.ts`). They thin out below 720px and 412px, and stop for visitors who prefer reduced motion.
- **Social preview images.** Every article and case study gets its own 1200×630 image, drawn by `src/shared/lib/og.ts`. Other pages use `public/og.png`.
- **Analytics (optional).** Set `analytics.cloudflareToken` in `src/shared/config/site.ts` to load Cloudflare Web Analytics in production builds. Leave it empty for none.

## Before publishing

Anything in `[SQUARE BRACKETS]` is a placeholder.

1. `src/shared/config/site.ts`: the site address (`url`, which the sitemap, feeds, canonical URLs and social images use), name, location, stack, status, email, GitHub, LinkedIn, and the portrait. `owner.portrait` chooses between `"ascii"` (a character portrait), `"photo"` (the file named in `owner.photo`, kept in `public/`) and `"none"`. To redraw the ASCII portrait from another photo, see [ASCII portrait](./ascii-portrait.md).
2. `src/features/about/data/`: `about.ts`, `now.ts`, `uses.ts`. The location on `/now` comes from `owner.base` in `site.ts`.
3. `src/content/work/`: add case studies. Copy a template from [`templates/`](./templates/) and follow [Writing case studies](./writing-case-studies.md); the build refuses a published case study that is incomplete.
4. `src/content/writing/`: add articles. Copy a template from [`templates/`](./templates/) and follow [Writing articles](./writing-articles.md).
5. `indexable` in `src/shared/config/site.ts` is `true`. Set it to `false` to keep the whole site out of search results while you prepare it. See below.

### Keeping the site out of search results

`indexable: false` puts `<meta name="robots" content="noindex, nofollow">` on every page and removes the sitemap line from `robots.txt`. Crawling itself stays allowed on purpose: a crawler must be able to fetch a page to see its `noindex`.

When you switch to `indexable: true`:

1. Rebuild and deploy.
2. In `lighthouserc.json`, change `categories:seo` from `"warn"` back to `"error"`. It is relaxed while the site is hidden, because Lighthouse counts `noindex` as an SEO failure.
3. Add the site to Google Search Console and submit `/sitemap.xml`.

The 404 page is always `noindex`, whatever this setting says.

## Deploying

The site runs on Cloudflare Workers as static assets, on the custom domain `nubibuilds.dev`. `wrangler.jsonc` holds the setup: files from `dist/`, `404.html` for unknown paths, and no `workers.dev` or preview addresses, so the site has one address.

- **Automatic:** GitHub Actions deploys every push to `main`, and only when CI passes. In `.github/workflows/ci.yml`, the `build` job type-checks, builds, and runs the end-to-end tests and Lighthouse, then uploads `dist/`. The `deploy` job then publishes that same `dist/` with `cloudflare/wrangler-action`. Pull requests are checked but never deployed. The job needs the repository secret `CLOUDFLARE_API_TOKEN`: a Cloudflare API token made from the *Edit Cloudflare Workers* template. The account ID is `account_id` in `wrangler.jsonc`.
- **Manual:** `pnpm run deploy` builds and deploys from your machine. Log in once with `pnpm exec wrangler login`. Use `pnpm run deploy`, not `pnpm deploy`: the latter is a pnpm built-in command.
- **Vercel** (alternative): import the repository; Astro is detected automatically.

No adapter is needed: the site is static. Cache and security headers are in `public/_headers` (Cloudflare, Netlify) and `vercel.json` (Vercel).

## Releasing

Pushing a version tag creates a GitHub release. From an up-to-date `main` with nothing uncommitted:

```sh
pnpm version patch        # or minor / major: updates package.json, commits and tags
git push origin main --follow-tags
```

`.github/workflows/release.yml` then checks that the tag matches `version` in `package.json` and is on `main`, waits until CI and the deploy succeed for that commit, and creates the release with the list of commits since the previous one. A tag with a hyphen, such as `v1.0.0-beta.1`, becomes a pre-release. An existing release is never changed, and its notes can be edited on GitHub afterwards.

## Testing and CI

- **End-to-end tests** (`tests/e2e/site.spec.ts`, Playwright) cover navigation, the theme toggle, the work filter, article features, the language switch on articles and case studies, search, the terminal, and sideways scrolling at desktop and phone sizes. First run only: `pnpm exec playwright install chromium`.
- **Accessibility tests** (`tests/e2e/a11y.spec.ts`) cover keyboard use and run an axe-core scan of every page in both themes. See [Accessibility](./accessibility.md).
- **Lighthouse budgets** (`lighthouserc.json`): performance ≥ 90, accessibility ≥ 95, SEO ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms. Needs Chrome installed.
- **CI.** `.github/workflows/ci.yml` is a GitHub Actions workflow (type-check, build, end-to-end tests, Lighthouse) that runs on every push to `main` and on every pull request.

INP and TTFB are field metrics: check them after deploying, with PageSpeed Insights or the analytics above.
