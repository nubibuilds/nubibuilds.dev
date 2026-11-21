# Accessibility and keyboard use

The site is built to be used without a mouse, following WCAG 2.2 Level AA. This page records how that works, how to test it, and what has and has not been verified. It is a working record, not a claim of conformance.

## Using the site with a keyboard

| Key | What it does |
| --- | --- |
| `Tab` / `Shift+Tab` | Move to the next or previous link, button or field |
| `Enter` | Follow a link; press a button |
| `Space` | Press a button; open or close the contents list on small screens |
| `Ctrl+K` / `Cmd+K` | Open or close the interactive terminal |
| `` ` `` | Open the terminal (can be turned off: type `keys off` in the terminal) |
| `Esc` | Close the terminal or the image viewer |
| `←` `→` `Home` `End` | Move between code tabs |
| `←` `→` | Scroll a wide table or a long code block once it has focus |

The first `Tab` on every page shows a **Skip to content** link (**Langsung ke konten** on Indonesian pages) that moves focus past the header to the main content.

## How each part behaves

| Part | Element | Keyboard behaviour |
| --- | --- | --- |
| Header tabs, footer links, cards, lists | `<a>` | Tab order follows the page; the current tab has `aria-current="page"` |
| Theme and terminal buttons | `<button>` | Enter and Space; the theme button's name says which theme is active ("theme: dark, switch to light") |
| Language switch | `<nav>` with links | The current language is marked with `aria-current`; a missing translation is plain text, not a link |
| Interactive terminal | `<dialog>` opened with `showModal()` | Focus moves to the prompt; the rest of the page is inert while it is open; Esc closes it and focus returns to the button that opened it |
| Terminal prompt | `<input>` | Tab completes what you have typed. With an empty prompt, Tab and Shift+Tab move to the output, its links and the close button |
| Terminal output | `role="log"`, focusable | Announced politely as lines are added; can be scrolled with the arrow keys |
| Image viewer | `<dialog>` | Each image is wrapped in a `<button>`; Enter opens the viewer, Esc closes it, focus returns to the image |
| Contents list | `<details>` on small screens, `<nav>` beside the text on wide ones | Enter or Space on the summary; the current section is marked with `aria-current` |
| Code blocks | `<pre tabindex="0">` | Focusable so long lines can be scrolled |
| Copy button | `<button>` | The result ("copied" or "failed") changes the button's name and is announced through a live region |
| Code tabs | `role="tablist"` | One tab stop; arrows, Home and End move between tabs; Tab moves into the panel |
| Wide tables | `<table>` | Focusable only when wider than the page, so it can be scrolled |
| Search on the article list | `<input type="search">` with a label | Results are links below the field; the number of results is announced |
| Stack filter | `<button aria-pressed>` | Enter and Space; the count is announced |
| YouTube preview | `<a>` | Enter loads the player and moves focus into it |

Rules the code follows:

- Native elements first: `<a>` for navigation, `<button>` for actions, `<dialog>` for overlays, `<details>` for disclosure. No clickable `<div>` or `<span>`.
- No positive `tabindex`. `tabindex="0"` is used only for scrollable regions; `tabindex="-1"` only on `<main>`, as the target of the skip link.
- One focus style for everything: a 2px outline in `--accent`, defined once in `src/shared/styles/global.css` (`:focus-visible`). Text fields that have no outline of their own are marked on their wrapper (the search field gets the outline; the terminal prompt gets a rule above it).
- Nothing is sticky over the content except the contents list, which sits beside the text, so a focused element is never covered.
- Animation stops for visitors who ask for reduced motion in their system settings.

## Testing

```sh
pnpm build
pnpm test:e2e
```

`tests/e2e/a11y.spec.ts` covers: the skip link; a focus indicator on every tab stop of every top-level page; backwards navigation; the terminal dialog (opening, staying inside, closing, focus returning, completion, turning off the `` ` `` shortcut); the image viewer; the copy button's announcement; search; and reflow at 320px.

The same file runs an **axe-core** scan of every top-level page, one case study and one article, in both themes, against the WCAG 2.0, 2.1 and 2.2 A and AA rules. It uses the `@axe-core/playwright` dev dependency and reports the violations of every page in one run.

Manual checks worth repeating after a design change:

1. Unplug the mouse. Reach every link and button on each page with Tab, and go back with Shift+Tab.
2. Open the terminal with `Ctrl+K`, run `ls work`, reach a result with Shift+Tab, press Enter.
3. Open an image with Enter, close it with Esc, and check focus is back on the image.
4. Zoom the browser to 200% and 400% and repeat step 1.
5. Read one article and one case study with a screen reader (VoiceOver: `Cmd+F5`).

## What has been verified

Checked with Playwright against the production build, in Chromium, at desktop and phone sizes:

- Every interactive element is reachable with Tab, in page order, with a visible focus indicator, in both themes.
- No positive `tabindex`, no focusable element inside hidden content, no control without a name.
- Text contrast of every visible text node is at least 4.5:1 (3:1 for large text) in both themes.
- The dialogs trap focus, close with Esc and give focus back.
- No sideways scrolling from 320px to 1440px wide.
- Animations stop with reduced motion.
- The axe-core scan passes on every top-level page, one case study and one article, in both themes, at desktop and phone sizes. Its first run found two problems, both fixed: the language links had an accessible name that did not contain their visible text (WCAG 2.5.3), and the loop diagram scrolled sideways without keyboard access between 412px and 480px wide (WCAG 2.1.1); it now shrinks its type to fit instead.

## What has not been verified

- **Screen readers.** Nothing has been tested with VoiceOver, NVDA or TalkBack. Names, roles and live regions are set according to the specification, which is not the same as hearing them.
- **Other browsers.** Only Chromium was used. Safari and Firefox handle focus after in-page links and inside `<dialog>` slightly differently.
- **Real content.** The sample articles and case studies are placeholders. Alt text, heading order and link text in your own Markdown are yours to get right; see the checklists in the writing guides.
- **Embedded video.** The YouTube player is a third party's interface.

## Known limitations

- **Moving background ornaments.** The falling characters and drifting text run continuously and can only be stopped through the operating system's reduced-motion setting. WCAG 2.2.2 (Pause, Stop, Hide) expects a control on the page itself. An on-page switch was tried and removed by choice, because the paused state made the site feel stiff; this criterion is therefore knowingly not met.
- **Terminal.** It is an extra way to navigate, never the only one: everything it does can also be done with the ordinary links.
