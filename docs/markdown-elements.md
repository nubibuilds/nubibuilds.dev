# Markdown elements

Every element you can use in the body of an article or case study: how to write it and how it looks on this site. A case study also has a required structure (four `##` sections in a fixed order); see [Writing case studies](./writing-case-studies.md). An article has none; see [Writing articles](./writing-articles.md). To see an element rendered, use it in a file with `draft: true` and open the page in `pnpm dev`.

## Support at a glance

| Category | Elements | Status |
| --- | --- | --- |
| Structure | Heading, Paragraph, Horizontal Rule | Supported |
| Formatting | Bold, Italic, Strikethrough, Inline Code | Supported |
| Lists | Ordered, Unordered, Nested, Task List | Supported |
| Navigation | Links, Reference Links | Supported |
| Media | Images | Supported, with optimisation, captions and zoom |
| Code | Inline Code, Fenced Code Block | Supported, with highlighting, file names, line highlights, tabs and a copy button |
| Content | Blockquote, Tables | Supported; a blockquote can also be a callout |
| Extended | Footnotes | Supported |
| Extended | HTML | Supported |
| Extended | Math | **Not supported** (see [Math](#math)) |
| Diagram | Mermaid, PlantUML | **Not supported** (see [Diagram](#diagram)) |
| Metadata | YAML Frontmatter | Supported, and validated at build time |

Markdown is processed by Sätteri, Astro 7's default processor, with GFM (GitHub Flavored Markdown) on. Styling is in `src/shared/styles/prose.css`; the interactive parts are added by `src/shared/lib/prose-enhance.js`.

---

## Structure

### Heading

```markdown
# Part           (articles only)
## Section
### Sub-section
#### Detail
```

- **`##`** starts a numbered section: a coloured `## 01`, `## 02`, ... above the heading, on a dashed divider. In an article the colours match the contents list.
- **In a case study** the first four `##` are, in order, Problem, Architecture, Implementation and Result (Masalah, Arsitektur, Implementasi, Hasil), coloured coral, cyan, violet and green; the overview at the top links to them by position. More `##` sections may follow (numbered 05, 06…, in green). A published case study with fewer than four fails the build.
- **`###`** is shown with a cyan `###` prefix. Use it for sub-sections, such as one architecture decision, named by the decision itself.
- `##` and `###` get an id generated from their text, a `#` link on hover, and a place in the contents list. Keep heading text plain (no links or code), so the id stays readable.
- **`#` depends on the page.** The page heading (H1) always comes from `title` in the frontmatter.
  - **Articles:** headings are free, `#` included. When an article body uses `#`, every heading in it is shown one level lower (`#` → h2, `##` → h3 …), so `#` becomes the numbered section and `##` its sub-section. See [Writing articles](./writing-articles.md#headings-are-free).
  - **Case studies:** do not use `#`; in a published case study it fails the build.
  - A `#` line inside a code block is code, never a heading.
- `####` and deeper are allowed, but they are not in the contents list and have no special styling.

### Paragraph

Plain lines of text. Separate paragraphs with one blank line.

```markdown
First paragraph.

Second paragraph. A new line without a blank line
stays in the same paragraph.
```

Punctuation is tidied automatically: straight quotes become curly quotes, `--` and `---` inside a sentence become dashes, and `...` becomes an ellipsis. This does not happen inside code.

### Horizontal Rule

```markdown
---
```

Shown as a dashed line across the column; in an article it is a centred `* * *` scene break instead, and the `##` heading right after it drops its own divider. Leave a blank line above it; without one, `---` directly under text turns that text into a heading.

---

## Formatting

| Element | Syntax | How it looks |
| --- | --- | --- |
| Bold | `**bold**` | Bold, in a brighter text colour |
| Italic | `_italic_` or `*italic*` | Italic |
| Strikethrough | `~~struck~~` | Struck through, dimmed |
| Inline Code | `` `code` `` | A small bordered box with amber text |

They combine: `**_bold italic_**`.

For inline code that contains a backtick, wrap it in double backticks: ``` `` a`b `` ```.

---

## Lists

### Unordered

```markdown
- First item
- Second item
```

Shown with a green `-` marker. Long text that wraps stays aligned under the text, not under the marker.

### Ordered

```markdown
1. First step
2. Second step
```

Numbers are green. The numbers you type do not matter; numbering is automatic.

### Nested

Indent by two spaces (or level with the parent item's text):

```markdown
- Parent
  - Child
    - Grandchild
1. Step
   - A detail of the step
```

### Task List

```markdown
- [x] Done
- [ ] Not yet
```

Shown as terminal-style checkboxes: a green `[x]` and a dimmed `[ ]`. Readers cannot tick them. Each checkbox is named after its item, so a screen reader announces what is done.

---

## Navigation

### Links

```markdown
[Link text](https://example.com)
[Link with a title](https://example.com "Shown on hover")
[Another page on this site](/work)
[A section on this page](#structure)
<https://example.com>
```

- Links are cyan and turn green on hover.
- For pages on this site, use a path starting with `/`.
- To link to a heading, use `#` followed by its id: the heading text in lower case, with spaces replaced by hyphens.
- A bare URL without angle brackets may not become a link. Use `<https://...>` or the `[text](url)` form.

### Reference Links

Useful when the same URL is used several times, or is too long to sit in the middle of a sentence.

```markdown
Read the [Astro documentation][astro] and its [images guide][astro-images].

[astro]: https://docs.astro.build
[astro-images]: https://docs.astro.build/en/guides/images/ "Optional title"
```

The definitions at the bottom are not shown on the page. Labels are not case-sensitive.

---

## Media

### Images

```markdown
![Alt text describing the image](../assets/slug/diagram.png "Caption under the image")
```

| Part | Purpose |
| --- | --- |
| Alt text (in `[]`) | Read by screen readers, and shown if the image fails to load. Always fill it in, describing what is visible, in the language of the file. |
| Path | Relative to the Markdown file. Entries are in `en/` and `id/`, and images in the collection's `assets/<slug>/` folder (`src/content/work/assets/` or `src/content/writing/assets/`), so the path starts with `../assets/`. Both language files use the same path. A path to a missing file fails the build. |
| Title (in `""`) | Optional. Becomes the caption under the image. |

What happens automatically:

- **Optimisation.** An image with a relative path is converted to a modern format, generated in several sizes, and given dimensions so the layout does not shift.
- **Loading on demand.** An image loads only when it nears the screen.
- **Zoom.** Click an image to see it large; `Esc` or a click closes it.

Things to know:

- Images in `public/` (a path starting with `/`, such as `/og.png`) are shown as they are, **without optimisation**.
- Avoid linking images from other sites.
- An image wrapped in a link does not get zoom, because the click belongs to the link.

For project screenshots on cards and in the case-study gallery, use `cover` and `gallery` in the frontmatter (see [Writing case studies](./writing-case-studies.md#images)).

### Video and YouTube

Not part of standard Markdown. Both are components, and work only in `.mdx` files.

```mdx
import Video from '@shared/ui/Video.astro';
import YouTube from '@shared/ui/YouTube.astro';

<Video src="/media/demo.mp4" poster="/media/demo.jpg" loop width={1280} height={720} caption="Drag to reorder" />

<YouTube id="XXXXXXXXXXX" title="Video title" />
```

- **`Video`** is for short clips in `public/media/`. With `loop`, the clip plays silently while it is on screen, like a GIF but far lighter. Without `loop`, it shows a player with controls.
- **`YouTube`** loads only a thumbnail; the player loads on click. `id` is the 11 characters after `v=` in the video URL. The thumbnail is requested from `i.ytimg.com`; nothing else from YouTube loads before play.

---

## Code

### Inline Code

```markdown
Run `pnpm dev`, then open `localhost:4321`.
```

### Fenced Code Block

Three backticks, followed by the language name:

````markdown
```ts
export function greet(name: string): string {
  return `hello, ${name}`;
}
```
````

Every block automatically gets:

- syntax colours from the site palette, applied at build time;
- a header strip with the language name;
- line numbers;
- a `[ copy ]` button.

Commonly used languages: `ts`, `js`, `tsx`, `jsx`, `json`, `bash`, `sh`, `html`, `css`, `astro`, `md`, `yaml`, `sql`, `python`, `go`, `rust`, `diff`. An unknown language is shown as plain text.

#### File name

````markdown
```ts title="src/greet.ts"
// ...
```
````

The file name appears in the header strip, before the language name.

#### Line highlights

````markdown
```ts {2,4-6}
// lines 2, 4, 5 and 6 get a faint green background
```
````

The two combine: ` ```ts title="src/greet.ts" {2,4-6} `.

#### Code tabs

Wrap several blocks in `<div class="code-tabs">`. Leave a **blank line** after `<div>`, between blocks, and before `</div>`.

````markdown
<div class="code-tabs">

```bash title="pnpm"
pnpm add astro
```

```bash title="npm"
npm install astro
```

</div>
````

- The tab name comes from `title`, or from the language name if there is no title.
- The reader's choice is remembered and applied to every other tab group that has a tab with the same name.
- Without JavaScript the blocks are shown one after another.

#### ASCII diagrams

Use the `text` language: no line numbers, drawn in cyan.

````markdown
```text
┌──────────┐      ┌──────────┐
│  CLIENT  │ ───▶ │   API    │
└──────────┘      └──────────┘
```
````

A wide diagram can be scrolled sideways on small screens. Keep it under about 70 characters wide so most of it fits on a phone.

---

## Content

### Blockquote

```markdown
> The one idea you want the reader to leave with.
```

In an article it becomes a pull quote: large, bold text beside a big green quotation mark. Keep it to one or two sentences. In a case study it is a box with a cyan `>` prefix.

### Callout

A blockquote whose first line is a marker:

```markdown
> [!NOTE]
> Background the reader should know.

> [!TIP]
> A shortcut or a better way.

> [!IMPORTANT]
> Something that must not be missed.

> [!WARNING]
> This can go wrong; here is how to avoid it.

> [!CAUTION]
> This can lose data or break production.
```

| Marker | Colour | Use for |
| --- | --- | --- |
| `[!NOTE]` | cyan | Extra information |
| `[!TIP]` | green | Advice |
| `[!IMPORTANT]` | violet | Key points |
| `[!WARNING]` | amber | Warnings |
| `[!CAUTION]` | coral | Serious risks |

A callout can hold several paragraphs, lists or code. Without JavaScript it is shown as an ordinary blockquote with its marker visible.

### Tables

```markdown
| Option | Latency | Cost |
| :----- | :-----: | ---: |
| A      |  12 ms  |  low |
| B      |  40 ms  | high |
```

- The second row separates the header from the body. Colons set the alignment: `:---` left, `:---:` centre, `---:` right.
- The header row has a darker background; even rows are striped.
- A table wider than the column can be scrolled sideways.
- Cells can use inline formatting (bold, code, links). To write `|` inside a cell, type `\|`.

---

## Extended

### Footnotes

```markdown
A claim that needs a source[^1], and another with a name[^source].

[^1]: The explanation or source for the first footnote.
[^source]: A label can be a word; the numbers are still assigned in order.
```

- In the text, a footnote is a small clickable number in square brackets.
- All notes are collected at the end of the page, each with a `↩` link back to where it was cited.
- Definitions can be written anywhere in the file.

### HTML

HTML can be written directly in an `.md` file.

```markdown
Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open the terminal.

The <mark>highlighted part</mark> gets an amber background.

First line<br>second line in the same paragraph.
```

| Element | How it looks on this site |
| --- | --- |
| `<kbd>` | A small keyboard key |
| `<mark>` | An amber highlight |
| `<div class="code-tabs">` | Code tabs (see [Code tabs](#code-tabs)) |
| `<br>` | A line break |

Rules:

- To use Markdown inside an HTML block, leave a blank line after the opening tag and before the closing tag.
- Do not write `<script>` or `<style>` in content.
- HTML without special styling is shown with the browser's defaults.

### Math

**Not supported.** `$E = mc^2$` and `$$ ... $$` are shown as plain text.

What you can use now:

| Need | How |
| --- | --- |
| A simple formula | Inline code: `` `E = mc^2` ``, or Unicode characters: `E = mc²`, `O(n log n)`, `Σ`, `√` |
| A complex formula | Export it as an SVG or PNG and insert it as an [image](#images), with the formula as its alt text |

Turning it on needs extra packages (a setting on the Markdown processor, and KaTeX to draw the formulas) and has never been tested in this project.

---

## Diagram

**Mermaid and PlantUML are not supported.** A ` ```mermaid ` or ` ```plantuml ` block is shown as code, not as a drawn diagram.

What you can use now:

| How | When it fits |
| --- | --- |
| An ASCII diagram in a ` ```text ` block | Architecture and simple flows. It matches the terminal style of the site and follows the dark and light themes. |
| Export the diagram as SVG or PNG and insert it as an [image](#images) | Complex diagrams. Draw it in a Mermaid or PlantUML editor, export, and save it in `src/content/work/assets/<project-slug>/`. The image is optimised and can be zoomed. |

Tip: keep the diagram's source (a `.mmd` or `.puml` file) next to the image, so it is easy to update.

Drawing Mermaid in the browser needs a large JavaScript library, so it is deliberately left out.

---

## Metadata

### YAML Frontmatter

The block between two `---` lines at the very top of the file. It is a convention, not Markdown syntax: it is not shown as text, but the site uses it for the title, date, order and more.

```yaml
---
title: "Article title"
summary: "A one-sentence summary."
date: 2026-11-12
tags: ["topic"]
draft: false
---
```

- Fields for articles: the `writing` collection in `src/content.config.ts`, explained in [Writing articles](./writing-articles.md#frontmatter).
- Fields for case studies: the `work` collection in `src/content.config.ts`, explained in [Writing case studies](./writing-case-studies.md#frontmatter). Start from the templates in [`templates/`](./templates/).
- The schemas are in `src/content.config.ts`. A required field that is empty or of the wrong type makes `pnpm build` fail with a message naming the file and the field.
- In the templates, `[[TODO: …]]` marks text still to write. A published article or case study (`draft: false`) that still contains it, in the frontmatter or the body, fails the build.

The YAML rules that cause most errors:

| Situation | Write |
| --- | --- |
| The value contains `:` | `title: "Astro: first notes"` |
| The value starts with `[`, `{`, `#`, `@` or `` ` `` | `title: "[Draft] Title"` |
| A short list | `tags: ["a", "b"]` |
| A list of objects | Each item starts with `-`, indented by two spaces |
| A date | `date: 2026-11-12`, without quotes |
| Indentation | Always spaces, never tabs |

---

## MDX

An `.mdx` file is Markdown that can import and use components. Use it only when needed, for example for `Video` or `YouTube`.

```mdx
---
title: "Title"
summary: "Summary."
date: 2026-11-12
---

import YouTube from '@shared/ui/YouTube.astro';

Ordinary Markdown text.

<YouTube id="XXXXXXXXXXX" title="Video title" />
```

Differences from `.md` to keep in mind:

- `{` and `}` are read as code. To write them as text, put them in inline code or type `\{`.
- `<` in the middle of text is read as the start of a tag. Type `&lt;` or put it in inline code.
- Every HTML tag must be closed: `<br />`, not `<br>`.
- `import` lines go after the frontmatter, before the body.

---

## Cheat sheet

````markdown
## Section                        heading (in the contents list; # in articles only)
**bold** _italic_ ~~struck~~      formatting
`code`                            inline code
- item / 1. step / - [x]          lists
[text](url) / [text][label]       links
![alt](../assets/slug/a.png "c")  image
```ts title="a.ts" {2,4-6}        code block
> quote                           blockquote
> [!NOTE]                         callout
| a | b |                         table
text[^1]                          footnote
<kbd>Ctrl</kbd>                   HTML
---                               horizontal rule
````
