# Writing articles

Articles are the posts on `/writing`: news, things you learned, notes and tutorials you want to share. Unlike a case study, an article has **no required structure**. Use as many sections and heading levels as the piece needs, or none at all for a short post. Only the frontmatter is fixed.

## Where files go, and their URLs

```text
src/content/writing/
├── assets/
│   └── <article-slug>/        images for one article, shared by both languages
│       └── diagram.png
├── en/
│   └── <article-slug>.md      →  /writing/<article-slug>
└── id/
    └── <article-slug>.md      →  /id/writing/<article-slug>

docs/templates/
├── article.en.md              English template
└── article.id.md              Indonesian template
```

- **The file name is the URL.** Lower case, words joined by hyphens: `what-i-learned-moving-to-astro-7.md`.
- **The same file name in `en/` and `id/` makes the two files translations of each other.** The language switch on the article links them. An article may exist in one language only.
- Use `.md` for Markdown, `.mdx` only when you need a component such as `Video` or `YouTube` (see [Markdown elements](./markdown-elements.md#mdx)).
- Saving the file is all it takes: the article appears in the list, the RSS feed (`/rss.xml` or `/id/rss.xml`), the sitemap, search and the terminal. It also gets its own social preview image.

## Start a new article

1. Copy the template into the language folder:

   ```sh
   cp docs/templates/article.en.md src/content/writing/en/<article-slug>.md
   cp docs/templates/article.id.md src/content/writing/id/<article-slug>.md   # the translation
   ```

2. Keep `draft: true` while you write. Run `pnpm dev` and open `/writing/<article-slug>`; the page shows a `[draft]` label and, until you set one, today's date.
3. Replace every `[[TODO: …]]`. Rename, add, reorder or delete the sections freely.
4. Set `draft: false` and run `pnpm build`. The build fails, naming the file and the field, if anything in [What the build enforces](#what-the-build-enforces) is wrong; when it passes, the article is ready to deploy.

## Frontmatter

```yaml
---
title: "What I learned moving a site to Astro 7"
summary: "Three surprises from the upgrade, and the one setting that made builds twice as fast."
date: 2026-11-21
tags: ["astro", "performance"]
draft: false
---
```

| Field | Required | What to write |
| --- | --- | --- |
| `title` | yes | The headline. It becomes the page heading (H1), the title in the list and on the social preview image. Keep it under about 70 characters so it is not cut off in search results. |
| `summary` | yes | One sentence on what the reader gets. Shown under the title, in search results, in the RSS feed, and as the description for search engines. |
| `date` | yes | Publication date, `YYYY-MM-DD`. Articles are listed newest first, and the list groups them by year. |
| `tags` | no | Topics, shown as `#tag` above the title and searchable. Lower case, and the same spelling every time (`astro`, not `Astro` in one and `astro` in another). |
| `draft` | no | `true` shows the file in `pnpm dev` only. Each language file has its own value. |

YAML rules: wrap text in double quotes, and always quote a value that contains `:` or `#` or starts with `[`, `{`, `@` or `` ` ``.

## The body

### What the page does for you

- **The opening paragraph** is shown larger, with a drop cap. Start the body with a full sentence, not a heading, list, image or code block.
- **`##` sections** are numbered (`## 01`, `## 02` …) on a dashed divider, each in its own colour, matching the contents list.
- **The contents list** appears beside the article once it has at least two top-level sections, and lists the sections and their sub-sections.
- **Every `##` and `###`** gets an id and a `#` link on hover, so you can share a link to a section.
- **Reading time and word count** are calculated from the body.

### Headings are free

Use any heading level, in any number, wherever the article needs one. Two ways of working, both correct:

| You write | Shown as | Numbered sections | In the contents list |
| --- | --- | --- | --- |
| `##`, `###`, `####` … (no `#`) | as written | `##` | `##` and `###` |
| `#`, `##`, `###` … (the article uses `#`) | each one level lower: `#` → h2, `##` → h3, `###` → h4 | `#` | `#` and `##` |

The page heading (H1) is always `title`. When the body uses `#`, every heading in that article is moved down one level, so the page keeps one H1 and your hierarchy stays as you wrote it. A `#` inside a code block is code, not a heading.

Recommendations, not rules: keep heading text short and plain (links or code inside a heading make its anchor harder to read), and go down one level at a time (`##` then `###`, not `##` then `#####`), because screen-reader users move through an article by its headings.

### Shapes that work

Starting points for common kinds of article. Mix, rename or ignore them.

| Kind | A shape that reads well |
| --- | --- |
| **News or update**: a release, an announcement, an event | Opening: what happened and why it matters to the reader → what changed, in detail → what it means in practice → links to the sources |
| **What I learned** | Opening: the situation → what I expected → what actually happened → what I do differently now |
| **How-to or tutorial** | Opening: what the reader will be able to do, and what they need first → numbered steps (`##` per step, or one numbered list) → a complete working example → common errors |
| **Short note** | A few paragraphs, no headings at all |
| **Opinion or reflection** | Opening: the claim → the reasons, one section each → the strongest objection, answered → conclusion |

### Other elements

Everything in [Markdown elements](./markdown-elements.md) works in an article. A few look different here than in a case study:

| Element | In an article |
| --- | --- |
| Blockquote (`> …`) | A large pull quote. One or two sentences, for the single line the reader should remember. |
| Horizontal rule (`---`) | A centred `* * *` scene break between two parts of the story; the `##` right after it drops its divider. |
| Callout (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) | Side information, a shortcut, or a warning the reader must not miss. |
| Code block with `title="file.ts"` and `{2,4-6}` | Tutorials and code you are explaining. Name the language on every block. |
| Code tabs (`<div class="code-tabs">`) | The same command for several tools (`pnpm` / `npm` / `yarn`). |
| Footnotes (`[^1]`) | Sources and asides without breaking the sentence. |
| Image with a caption | Screenshots, charts and diagrams, next to the text that explains them. |
| Video, YouTube | Clips and talks (`.mdx` only). |

Not supported: math (`$…$`) and Mermaid or PlantUML diagrams; draw diagrams as ASCII in a `text` block, or export them as an image.

## Images

- Store them in `src/content/writing/assets/<article-slug>/` and reference them from both language files with `../assets/<article-slug>/<file>`:

  ```markdown
  ![Build time before and after the upgrade, by page count](../assets/moving-to-astro-7/build-time.png "Build time fell from 48 s to 21 s")
  ```

- Astro checks the file exists (a wrong path fails the build), converts it to a modern format, makes several sizes and records its dimensions.
- Alt text describes what is visible, in the language of the file. The text in quotes becomes the caption.
- Export at most about 2000 px wide: PNG for screenshots, JPG for photos. Remove personal data, tokens and private URLs from screenshots.
- Use only images you made or have the right to publish, and credit the source in the caption when it is not yours.

## The translation

Translate `title`, `summary`, the body (headings included), image alt text and captions. Keep the file name, `date` and `tags` the same. Code stays as it is; translate its comments only if you want to.

The language switch, `/id/writing`, `/id/rss.xml`, the sitemap and the alternate-language tags for search engines follow automatically.

## Writing well

- **Lead with the point.** The first paragraph says what happened or what the reader will learn; the rest supports it.
- **Link your sources.** For news, link the original announcement, release notes or paper, not a summary of it, and note when you read it if things move fast.
- **Show, with real examples.** A command you actually ran, a figure you actually measured, an error message you actually got.
- **Keep the date honest.** `date` is when the article was published. If you later change the substance, say so in the text ("Updated 2026-12-03: …").
- **Short paragraphs.** One idea each. Lists for steps or options, prose for reasoning.

## What the build enforces

`pnpm build` stops with the file name and the reason when a published (`draft: false`) article:

- leaves `title` or `summary` empty or out, or has an empty tag;
- has no `date`, an invalid one, or still the template's `[[TODO: …]]`;
- still contains `[[TODO: …]]` anywhere in the frontmatter or the body;
- has an empty body;
- points to an image file that does not exist.

Headings are never checked: their number, level and order are up to you. Drafts are exempt from all of the above, so a half-written article can stay in the repository with `draft: true`.
