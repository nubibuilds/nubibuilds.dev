import { getCollection, type CollectionEntry } from 'astro:content';
import { sectionBase, splitLangId, type Lang } from '@shared/lib/i18n';
import { PLACEHOLDER } from '@shared/lib/placeholder';

export type PostEntry = CollectionEntry<'writing'>;

/*
 * Articles are stored as src/content/writing/<lang>/<slug>.md, so an entry id looks like
 * "en/my-post". Two files with the same slug in different language folders are translations
 * of each other. A file placed directly in src/content/writing/ counts as English.
 */

export const postLang = (post: PostEntry): Lang => splitLangId(post.id).lang;

export const postSlug = (post: PostEntry): string => splitLangId(post.id).slug;

/** Section root for a language: /writing for English, /id/writing for Indonesian. */
export const writingBase = (lang: Lang) => sectionBase('writing', lang);

export const postUrl = (post: PostEntry) => `${writingBase(postLang(post))}${postSlug(post)}/`;

/**
 * Published posts, newest first; pass a language to get only that language. Drafts show only in `astro dev`.
 * A published post with template text or no body stops the build.
 */
export async function getAllPosts(lang?: Lang): Promise<PostEntry[]> {
  const entries = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  for (const post of entries) {
    if (post.data.draft) continue;
    if (post.body?.includes(PLACEHOLDER))
      throw new Error(
        `src/content/writing/${post.id}: template text (${PLACEHOLDER} …]]) is left in the body of a published article. Replace it, or set draft: true.`,
      );
    if (!post.body?.trim())
      throw new Error(`src/content/writing/${post.id}: a published article has no body. Write it, or set draft: true.`);
  }
  return entries
    .filter((post) => !lang || postLang(post) === lang)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** YYYY-MM-DD, the way `ls -l --time-style=long-iso` would print it. */
export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export function wordCount(body = ''): number {
  const words = body.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Rough reading time at 200 words per minute, never less than one minute. */
export const readingMinutes = (body = '') => Math.max(1, Math.round(wordCount(body) / 200));
