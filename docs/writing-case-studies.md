# Writing case studies

Each project on `/work` is one Markdown file per language in `src/content/work/`. That folder holds only case studies and their images; the templates live here in `docs/templates/`.

```text
src/content/work/
├── assets/
│   └── <project-slug>/       images for one project, shared by both languages
│       ├── cover.png
│       └── screen-1.png
├── en/
│   └── <project-slug>.md     →  /work/<project-slug>
└── id/
    └── <project-slug>.md     →  /id/work/<project-slug>

docs/templates/
├── case-study.en.md          English template
└── case-study.id.md          Indonesian template
```

- **The file name is the URL.** Lower case, words joined by hyphens: `invoice-sync.md`.
- **The same file name in `en/` and `id/` makes the two files translations of each other.** The language switch on the page links them. A case study may exist in one language only.
- **Every `.md` or `.mdx` file in `en/` and `id/` is a case study.** Keep notes, drafts of the guide or other files elsewhere; a work-in-progress case study stays in place with `draft: true`.

## Start a new case study

1. Copy the template into the language folder:

   ```sh
   cp docs/templates/case-study.en.md src/content/work/en/<project-slug>.md
   cp docs/templates/case-study.id.md src/content/work/id/<project-slug>.md   # the translation
   ```

2. Keep `draft: true` while you write. Run `pnpm dev` and open `/work/<project-slug>`; the page shows a `[draft]` label.
3. Replace every `[[TODO: …]]`. Delete the optional parts you do not use (a constraint line, a second metric, the code block).
4. Put the images in `src/content/work/assets/<project-slug>/` and uncomment `cover`, `coverAlt` and `gallery`.
5. Set `draft: false` and run `pnpm build`. The build fails, naming the file and the field, if anything below is missing; when it passes, the case study is ready to deploy.

## Frontmatter

### Required

| Field | What to write |
| --- | --- |
| `title` | The project name. It becomes the page heading (H1), so the body has no `#` heading. |
| `summary` | One sentence: what the product is and the outcome. Shown on the card and under the title. |
| `year` | The year it shipped, in quotes: `"2026"`. |
| `role` | Your role: `"Lead engineer (full-stack)"`. |
| `timeline` | When the work happened: `"Mar 2026 → Jul 2026"`. |
| `status` | `"Live"`, `"Archived"`, `"In progress"`… |
| `highlights.problem` | One sentence. Shown as step 01 of the overview and linked to the first `##` section. |
| `highlights.architecture` | One sentence: the key decision and its trade-off. Step 02. |
| `highlights.implementation` | One sentence: how the hard part was built. Step 03. |
| `highlights.result` | One sentence: the measurable outcome. Step 04. |

### Optional

| Field | What it does |
| --- | --- |
| `stack` | Technologies, shown as chips and used as the filters on `/work`. Keep the same spelling across projects (`PostgreSQL`, not `Postgres` in one and `PostgreSQL` in another), or the filter splits them. |
| `metrics` | Result figures (`value` + `label`), shown as large numbers under the overview. Use two to four real, measured figures; leave the field out to hide the section. |
| `order` | Position in the list; lower first. Default `0`. |
| `publishedAt` | `YYYY-MM-DD`. Among equal `order`, newer first. |
| `featured` | `true` puts the case study on the home page. With none featured, the first three are shown. |
| `draft` | `true` shows the file in `pnpm dev` only. Each language file has its own value. |
| `repo`, `demo` | Full `https://` URLs, shown as buttons under the summary. |
| `cover`, `coverAlt` | The main screenshot and its description. Without a cover the card gets a generated ASCII cover. |
| `gallery` | More screenshots (`src`, `alt`, optional `caption`), shown as a zoomable grid at the end. |
| `youtube`, `youtubeTitle` | A walkthrough video: the 11-character id after `v=` in the URL, and its title. |

YAML rules: wrap text in double quotes, and always quote a value that contains `:` or `#` or starts with `[`, `{` or `*`.

## The body

### Required structure

The body starts with **four `##` sections, in this order**. The overview links its four steps to them by position, and they get the numbered, coloured headings (01 coral, 02 cyan, 03 violet, 04 green).

| # | English | Indonesian | What the reader must learn |
| --- | --- | --- | --- |
| 01 | `## Problem` | `## Masalah` | Who had the problem, what it cost them (time, money, errors, in figures where possible), why existing tools or the old way fell short, and the constraints you worked under (team, time, budget, scale, legal). |
| 02 | `## Architecture` | `## Arsitektur` | The shape of the system and the principle behind it, a diagram, and each significant decision with the options weighed, why you chose it, and what it cost. |
| 03 | `## Implementation` | `## Implementasi` | The hardest part: what you tried first, what broke, what you changed, how you tested it; a short code excerpt of the key idea; the milestones. |
| 04 | `## Result` | `## Hasil` | What changed for users and the business, with the same figures as `metrics` and how they were measured; what you would do next. |

Headings:

- **No `#` heading in the body.** The page heading is `title`.
- **`###`** for sub-sections: an architecture decision, named by the decision itself (`### An event log as the source of truth`), a milestone, a test strategy. They appear nested in the contents list.
- **`####`** and deeper are allowed for detail; they are not in the contents list.
- **More `##` sections are allowed after the four**, for example `## Lessons learned` or `## Credits`. They are numbered 05, 06… and shown in green, like Result. Do not put a `##` before `Problem`: the order is what links each overview step to its section.
- Headings are plain text. Links, code or emphasis inside a heading make the anchor harder to read.

The build checks this for every published file: a `#` heading, or fewer than four `##` sections, fails it. Lines inside code blocks are not counted, so `# comments` in a shell snippet are fine.

### Other elements

Everything in [Markdown elements](./markdown-elements.md) can be used anywhere in the four sections. What each is good for in a case study:

| Element | Use it for |
| --- | --- |
| Paragraphs, **bold**, _italic_, `inline code` | The story. Bold a key figure or term once, not whole sentences. |
| Lists | Constraints, milestones (numbered), next steps. |
| ASCII diagram (` ```text `) | The architecture overview. Keep it under about 70 characters wide so it fits on a phone without much sideways scrolling. |
| Code block with `title="path/file.ts"` and `{2,4-6}` line highlights | The one idea that made the solution work. Short excerpts, not whole files. |
| Code tabs (`<div class="code-tabs">`) | The same idea in two places or two languages, side by side. |
| Table | Options weighed in a decision, before/after comparisons, benchmarks. |
| Callout (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) | A pitfall you hit, or a rule the reader must not miss. One or two per case study. |
| Blockquote (`>`) | A single line worth remembering, or a user's own words (with their permission). |
| Image (`![alt](../assets/<project-slug>/file.png "caption")`) | A screenshot or chart at the point in the story where it matters. |
| Footnote (`[^1]`) | How a figure was measured, or a source, without breaking the sentence. |
| `<kbd>`, `<mark>` | A keyboard shortcut; one highlighted phrase. |
| Video, YouTube component | Short clips or an embedded walkthrough. Needs an `.mdx` file; see Markdown elements. |

Not supported: math (`$…$`) and Mermaid or PlantUML diagrams. Draw diagrams as ASCII in a `text` block, or export them as an image.

## Images

- Store them in `src/content/work/assets/<project-slug>/` and reference them from both language files with `../assets/<project-slug>/<file>`. Astro checks that the file exists, converts it to a modern format, makes several sizes, and records its dimensions.
- Export screenshots at most about 2000 px wide: PNG for interfaces, JPG for photos.
- `coverAlt`, every gallery `alt` and every image's alt text describe what is visible ("Dashboard listing synced invoices with their status"), not "screenshot of…". In the Indonesian file, write them in Indonesian.
- Remove customer names, emails, tokens and any personal data from screenshots before adding them.
- A remote image (`https://…`) is served as it is, without optimisation; give `coverWidth`/`coverHeight` (or `width`/`height` in the gallery) so the layout does not shift.

## The translation

Translate: `title` (only if the name itself changes), `summary`, `role`, `timeline`, `status`, the four `highlights`, each metric `label`, `coverAlt`, gallery `alt` and `caption`, and the whole body, including the `##` headings (`Masalah`, `Arsitektur`, `Implementasi`, `Hasil`).

Keep identical: the file name, `order`, `stack`, `year`, `publishedAt`, `featured`, metric `value`, `repo`, `demo`, `youtube`, and image paths. Code blocks stay as they are; translate only their comments if you want to.

The language switch, `/id/work`, the sitemap, search and the alternate-language tags for search engines follow automatically.

## Writing well

- **Lead with figures.** "No-shows fell from 28% to 9%" beats "no-shows fell sharply". Say how and over what period each figure was measured.
- **Show the decision, not just the result.** For each important choice, name the alternative you rejected and the price you paid.
- **Write about what you did.** Use "I" for your part and "we" for the team's, so the reader can tell them apart.
- **Respect confidentiality.** Leave out client names, internal figures and code you are not allowed to publish, or get permission first.
- **Keep it readable.** About 800–1,800 words for the body; short paragraphs; one idea per paragraph.

## What the build enforces

`pnpm build` stops with the file name and the reason when a published (`draft: false`) case study:

- leaves a required field empty or out;
- still contains `[[TODO: …]]` in the frontmatter or the body;
- has a `#` heading, or fewer than four `##` sections;
- points to an image file that does not exist, or has a malformed `repo`, `demo` or `youtube` value.

Drafts are exempt, so a half-written file can stay in the repository with `draft: true`.
