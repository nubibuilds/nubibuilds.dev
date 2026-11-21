# NubiBuilds

Personal site of an AI-native full-stack developer: terminal-styled, static, and content-driven.

- **Stack:** Astro 7 · Markdown/MDX content collections · plain CSS (custom properties) · TypeScript
- **Output:** fully static (`dist/`), deployable to Cloudflare Pages, Vercel, Netlify, or any static host
- **Package manager:** pnpm
- **Node:** 22.23.4 or newer

## Quick start

```sh
pnpm install
pnpm dev
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Local dev server with hot reload; drafts are shown |
| `pnpm check` | Type-check `.astro` and `.ts` files |
| `pnpm build` | Build the static site into `dist/` |
| `pnpm preview` | Serve the built site locally |
| `pnpm test:e2e` | End-to-end tests against the built site (run `pnpm build` first) |
| `pnpm lighthouse` | Build, then check the performance, accessibility and SEO budgets |

First run of the end-to-end tests only: `pnpm exec playwright install chromium`.

## Documentation

The full guide is in [`docs/`](./docs/README.md):

| Document | What it covers |
| --- | --- |
| [Overview](./docs/README.md) | Pages, folder structure, features, deploying, testing and CI |
| [Colour palette](./docs/colour-palette.md) | Every colour in both themes and the rules for using them |
| [Markdown elements](./docs/markdown-elements.md) | Every supported Markdown element, with syntax |
| [Writing articles](./docs/writing-articles.md) | Free-form posts: frontmatter, headings, images, templates (`docs/templates/`) |
| [Writing case studies](./docs/writing-case-studies.md) | Structure, frontmatter and templates (`docs/templates/`) for `/work` |
| [Accessibility](./docs/accessibility.md) | Keyboard use, testing, and what is verified |
| [ASCII portrait](./docs/ascii-portrait.md) | Redrawing the About page portrait from another photo |

## Architecture: feature-driven

Routes are thin. Each page in `src/pages` only composes features; UI, data and logic live in the
feature that owns them. Code used by more than one feature lives in `shared`.

```text
src/
├── pages/        routes only
├── app/          SiteLayout: the layout every page uses (adds the terminal and search)
├── features/     home · work · writing · about · contact · terminal · search
├── shared/       config · layouts · styles · ui · lib
├── content/      work/{en,id}/ and writing/{en,id}/ (Markdown)
└── content.config.ts   frontmatter schemas, validated at build time
```

- A feature may import from `shared`, never from another feature. Pages and `src/app` are where
  features meet.
- Import with the aliases `@app/*`, `@features/*` and `@shared/*`.
- Adding a feature = a new folder in `src/features` with `components/`, and `lib/`, `data/` or
  `styles/` if needed.

## Before publishing

Anything in `[SQUARE BRACKETS]` is a placeholder.

1. `src/shared/config/site.ts`: the site address (`url`), your details, links, portrait, and (optionally) the analytics token.
2. `src/features/about/data/`: `about.ts`, `now.ts`, `uses.ts`.
3. `src/content/work/`: add case studies, starting from `docs/templates/` (see
   [Writing case studies](./docs/writing-case-studies.md)). `src/content/writing/`: add articles, the same
   way ([Writing articles](./docs/writing-articles.md)).
4. `indexable` in `site.ts` is `true`. Set it to `false` to keep the whole site out of search results.

## Deploying

The site runs on Cloudflare Workers (static assets) at `nubibuilds.dev`, configured in
`wrangler.jsonc`.

- **Automatic:** every push to `main` is built and deployed by Cloudflare Workers Builds
  (build command `pnpm build`, deploy command `npx wrangler deploy`). It does not wait for CI.
- **Manual:** `pnpm run deploy` builds and deploys from your machine (first time: `pnpm exec wrangler login`).
  Not `pnpm deploy`, which is a pnpm built-in command.
- **Vercel** (alternative): import the repository; Astro is detected automatically.

No adapter is needed: the site is static. `.github/workflows/ci.yml` runs the type-check, build,
end-to-end tests and Lighthouse on every push to `main` and on every pull request.
