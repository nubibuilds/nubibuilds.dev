# Colour palette

Every colour is a CSS variable defined in `src/shared/styles/tokens.css`. Components never write a colour value directly; they use the variables, so the dark and light themes switch by swapping the values behind them.

The look is a green phosphor terminal: a dark, green-tinted background, one green accent, and four supporting colours that each have a job.

## Dark theme (default)

### Background and surfaces

| Variable | Value | Used for |
| --- | --- | --- |
| `--bg` | `#0a0e0b` | Page background |
| `--surface` | `#0f1511` | Cards, code blocks, row lists, contact boxes |
| `--bar` | `#111813` | Window bar, card headers, the header strip on code blocks |
| `--hover` | `#141d17` | Background of an element while hovered |
| `--line` | `#223027` | Borders and dividers |

### Text

| Variable | Value | Used for |
| --- | --- | --- |
| `--fg` | `#cfdad2` | Body text |
| `--hi` | `#e8f1ea` | Headings and emphasised text |
| `--dim` | `#8a9d8f` | Secondary text: labels, dates, comments, prompts |

### Accents

| Variable | Value | Role |
| --- | --- | --- |
| `--accent` | `#62f08f` | Primary: the name in the prompt, active tab, buttons, cursor, ornaments, the "Result" section |
| `--amber` | `#f0b45a` | The path in the prompt, placeholders, inline code, stack chips, constants in code |
| `--cyan` | `#7fd4ff` | Links, the "Architecture" section, ASCII diagrams, function names in code |
| `--coral` | `#ff8a7a` | The "Problem" section, error messages, caution callouts |
| `--violet` | `#b9a6ff` | The "Implementation" section, article tags, keywords in code |
| `--on-accent` | `#0a0e0b` | Text on an `--accent` background (buttons while hovered) |

## Light theme

Cards are deliberately not pure white. Surfaces are only slightly lighter than the background, as in the dark theme, so a card never draws more attention than what is inside it.

### Background and surfaces

| Variable | Value |
| --- | --- |
| `--bg` | `#eef2ec` |
| `--surface` | `#f6f8f4` |
| `--bar` | `#e5ebe3` |
| `--hover` | `#dde5dc` |
| `--line` | `#c3cfc5` |

### Text

| Variable | Value |
| --- | --- |
| `--fg` | `#26332b` |
| `--hi` | `#0a0e0b` |
| `--dim` | `#516357` |

### Accents

| Variable | Value |
| --- | --- |
| `--accent` | `#0b7039` |
| `--amber` | `#8a5700` |
| `--cyan` | `#0a6589` |
| `--coral` | `#b3392b` |
| `--violet` | `#5b43c4` |
| `--on-accent` | `#ffffff` |

The light accents are darker than the dark-theme ones because they have to read as text on a light background.

## Other variables

| Variable | Dark | Light | Purpose |
| --- | --- | --- | --- |
| `--orn` | `0.16` | `0.14` | Opacity of the background ornaments |
| `--scan` | `0.3` | `0` | Strength of the CRT scanlines (off in the light theme) |
| `--glow` | soft green glow | none | Glow on the ASCII logo and project covers |
| `--glow-drop` | soft green glow | none | The same glow as a `filter`, for gradient text such as the home page logo |

## Colours in code blocks

Syntax highlighting uses the same palette, mapped in `src/shared/styles/prose.css`:

| Part of the code | Colour |
| --- | --- |
| Keywords (`function`, `return`, `const`) | `--violet` |
| Function names | `--cyan` |
| Strings | `--accent` |
| Constants and types | `--amber` |
| Comments and punctuation | `--dim` |
| Everything else | `--fg` |

## Colours of the four case-study sections

This order is used consistently on project cards, section numbers and the case-study contents list:

| Section | Colour |
| --- | --- |
| 01 Problem | `--coral` |
| 02 Architecture | `--cyan` |
| 03 Implementation | `--violet` |
| 04 Result | `--accent` |

The article contents list cycles through `--accent`, `--cyan`, `--violet` and `--amber`, and so do the section numbers above each `##` heading in an article, so a section and its entry in the contents list share a colour.

## Callout colours

| Callout | Colour |
| --- | --- |
| `[!NOTE]` | `--cyan` |
| `[!TIP]` | `--accent` |
| `[!IMPORTANT]` | `--violet` |
| `[!WARNING]` | `--amber` |
| `[!CAUTION]` | `--coral` |

## Rules

- **Always use the variables**, for example `color: var(--accent)`. Never write a colour value in a component.
- **One primary accent.** `--accent` is for the most important thing on screen. The other four are only for the jobs listed above, not for decoration.
- **Colour is never the only signal.** Case-study sections are also numbered, callouts are labelled, and the active tab has an underline.
- **Keep text contrast.** Every text colour in both themes is above 4.5:1 against `--bg`, `--surface`, `--bar` and `--hover`. If you change a colour, check it against all four.
- **Cards have a full border**, never a border on one side only.

## Changing a colour

1. Open `src/shared/styles/tokens.css`.
2. Change the value in the `:root` block for the dark theme.
3. For the light theme, change it in **both** blocks, which must stay identical: `:root[data-theme='light']` (when the visitor picks light with the button) and `@media (prefers-color-scheme: light)` (when following the system). An end-to-end test (`the light theme is the same whether chosen or followed from the system`) fails if they differ.
4. If `--bg` changes, also update the two `theme-color` lines in `src/shared/layouts/BaseLayout.astro` and the bottom stop of the background gradient in `public/favicon.svg` (then regenerate `public/favicon.ico` and `public/apple-touch-icon.png` from it).
