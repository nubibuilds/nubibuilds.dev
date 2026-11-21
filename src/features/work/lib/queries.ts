import { getCollection, type CollectionEntry } from 'astro:content';
import { sectionBase, splitLangId, type Lang } from '@shared/lib/i18n';
import { PLACEHOLDER } from '@shared/lib/placeholder';
import { structureProblems } from './structure';

export type WorkEntry = CollectionEntry<'work'>;

/*
 * Case studies are stored as src/content/work/<lang>/<slug>.md, so an entry id looks like
 * "en/my-project". The same slug in another language folder is its translation.
 */

export const workLang = (entry: WorkEntry): Lang => splitLangId(entry.id).lang;

export const workSlug = (entry: WorkEntry): string => splitLangId(entry.id).slug;

/** Section root for a language: /work for English, /id/work for Indonesian. */
export const workBase = (lang: Lang) => sectionBase('work', lang);

export const workUrl = (entry: WorkEntry) => `${workBase(workLang(entry))}${workSlug(entry)}/`;

/**
 * Published case studies in display order; pass a language to get only that language.
 * Order: `order` (lower first), then `publishedAt` (newer first, dated before undated), then title.
 * Drafts are left out of the production build and shown only in `astro dev`.
 */
export async function getAllWork(lang?: Lang): Promise<WorkEntry[]> {
  const entries = await getCollection('work', ({ data }) => import.meta.env.DEV || !data.draft);
  for (const entry of entries) {
    if (!entry.data.draft && entry.body?.includes(PLACEHOLDER))
      throw new Error(
        `src/content/work/${entry.id}: template text (${PLACEHOLDER} …]]) is left in the body of a published case study. Replace it, or set draft: true.`,
      );
    const problems = entry.data.draft ? [] : structureProblems(entry.body ?? '');
    if (problems.length > 0)
      throw new Error(`src/content/work/${entry.id}: ${problems.join('; ')}. Fix it, or set draft: true.`);
  }
  return entries
    .filter((entry) => !lang || workLang(entry) === lang)
    .sort(
      (a, b) =>
        a.data.order - b.data.order ||
        (b.data.publishedAt?.getTime() ?? -Infinity) - (a.data.publishedAt?.getTime() ?? -Infinity) ||
        a.data.title.localeCompare(b.data.title),
    );
}

/** Case studies for the home page: the ones marked `featured`, or the first `fallback` if none is. */
export function pickFeatured(entries: WorkEntry[], fallback = 3): WorkEntry[] {
  const featured = entries.filter((entry) => entry.data.featured);
  return featured.length > 0 ? featured : entries.slice(0, fallback);
}

/** Every stack label used across the given case studies, alphabetically. */
export const getAllStacks = (entries: WorkEntry[]) =>
  [...new Set(entries.flatMap((entry) => entry.data.stack))].sort((a, b) => a.localeCompare(b));
