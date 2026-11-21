import { toAlternates, type Lang, type LangUrls } from '@shared/lib/i18n';
import { ui } from '../i18n';
import { getAllWork, workBase, workLang, workSlug, workUrl, type WorkEntry } from './queries';

export interface CaseProps {
  entry: WorkEntry;
  /** The case study after this one in the same language (wraps around); absent if it is the only one. */
  next?: WorkEntry;
  urls: LangUrls;
  /** Zero-based position of this case study in its language's list. */
  index: number;
  /** Number of case studies in this language. */
  total: number;
}

/** `getStaticPaths()` for the case-study route of one language. */
export async function caseStaticPaths(lang: Lang) {
  const all = await getAllWork();
  const entries = all.filter((entry) => workLang(entry) === lang);

  return entries.map((entry, i) => {
    const slug = workSlug(entry);
    const urls: LangUrls = {};
    for (const other of all) {
      if (workSlug(other) === slug) urls[workLang(other)] = workUrl(other);
    }
    const props: CaseProps = { entry, next: entries.length > 1 ? entries[(i + 1) % entries.length] : undefined, urls, index: i, total: entries.length };
    return { params: { slug }, props };
  });
}

/** Layout props (title, language, hreflang, …) for a case-study page. */
export function caseMeta(entry: WorkEntry, urls: LangUrls) {
  return {
    // "<project>: Case Study — NubiBuilds": says what the page is, and keeps a project named
    // like the site from reading "NubiBuilds — NubiBuilds".
    title: `${entry.data.title}: ${ui[workLang(entry)].caseTitle}`,
    description: entry.data.summary,
    windowTitle: '~/work',
    path: '~/work',
    lang: workLang(entry),
    alternates: toAlternates(urls),
  };
}

export const workIndexUrls = (): LangUrls => ({ en: workBase('en'), id: workBase('id') });

/** Layout props for the case-study list of one language. */
export function workIndexMeta(lang: Lang) {
  return {
    title: ui[lang].pageTitle,
    description: ui[lang].description,
    windowTitle: '~/work',
    path: '~/work',
    lang,
    alternates: toAlternates(workIndexUrls()),
  };
}
