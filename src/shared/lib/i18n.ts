/**
 * Languages the content (articles and case studies) can be written in.
 * English is the default and lives at /writing and /work; Indonesian lives under /id/.
 * The rest of the site is English only, except the frame around every page (`frameText`).
 */
export const LANGS = ['en', 'id'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const isLang = (value: string | undefined): value is Lang => (LANGS as readonly string[]).includes(value ?? '');

export const langNames: Record<Lang, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
};

/**
 * Interface text of the frame around every page: skip link, header buttons, navigation names
 * and the terminal. It follows the page's language, so an Indonesian page is Indonesian throughout.
 */
const FRAME_TEXT = {
  en: {
    skip: 'Skip to content',
    primaryNav: 'Primary',
    moreNav: 'More',
    openTerminal: 'Open the interactive terminal',
    terminalShortcut: 'Terminal (Ctrl+K)',
    switchTheme: 'Switch between dark and light theme',
    // Set by the script once the active theme is known; they start with the visible word "theme".
    themeIsDark: 'theme: dark, switch to light',
    themeIsLight: 'theme: light, switch to dark',
    terminal: 'Interactive terminal',
    closeTerminal: 'Close terminal',
    terminalOutput: 'Terminal output',
    terminalCommand: 'Terminal command',
  },
  id: {
    skip: 'Langsung ke konten',
    primaryNav: 'Utama',
    moreNav: 'Lainnya',
    openTerminal: 'Buka terminal interaktif',
    terminalShortcut: 'Terminal (Ctrl+K)',
    // Starts with the button's visible word "theme", so the spoken name matches what is shown (WCAG 2.5.3).
    switchTheme: 'theme: ganti tema gelap atau terang',
    themeIsDark: 'theme: gelap, ganti ke terang',
    themeIsLight: 'theme: terang, ganti ke gelap',
    terminal: 'Terminal interaktif',
    closeTerminal: 'Tutup terminal',
    terminalOutput: 'Keluaran terminal',
    terminalCommand: 'Perintah terminal',
  },
} satisfies Record<Lang, Record<string, string>>;

/** Frame text for a page's language; anything unknown falls back to English. */
export const frameText = (lang: string | undefined) => FRAME_TEXT[isLang(lang) ? lang : DEFAULT_LANG];

/** URL of each language version that exists for a page. */
export type LangUrls = Partial<Record<Lang, string>>;

/**
 * Content is stored as <collection>/<lang>/<slug>.md, so an entry id looks like "en/my-post".
 * Two files with the same slug in different language folders are translations of each other.
 * A file placed directly in the collection folder counts as English.
 */
export function splitLangId(id: string): { lang: Lang; slug: string } {
  const parts = id.split('/');
  const first = parts[0];
  return parts.length > 1 && isLang(first) ? { lang: first, slug: parts.slice(1).join('/') } : { lang: DEFAULT_LANG, slug: id };
}

/**
 * Root of a content section for a language: sectionBase('work', 'id') → "/id/work/".
 * Every internal URL ends in "/", the form the static build publishes (work/index.html) and the
 * form used in canonical links, so links, the sitemap and hreflang all name the same address.
 */
export const sectionBase = (section: string, lang: Lang) => (lang === DEFAULT_LANG ? `/${section}/` : `/${lang}/${section}/`);

/** `alternates` for the layout (hreflang links) from the language versions of a page. */
export const toAlternates = (urls: LangUrls) => LANGS.filter((lang) => urls[lang]).map((lang) => ({ lang, href: urls[lang]! }));

/** Sections that exist in every language. Everything else is English only. */
const BILINGUAL = /^\/(work|writing)(?=\/|$)/;
const FEED = '/rss.xml';

/**
 * Keep the visitor in the language of the page they are on: on an Indonesian page, links to
 * /work, /writing and the feed go to their /id/… versions. Other links are returned unchanged.
 */
export function localizeHref(href: string, lang: string | undefined): string {
  if (!isLang(lang) || lang === DEFAULT_LANG) return href;
  return BILINGUAL.test(href) || href === FEED ? `/${lang}${href}` : href;
}
