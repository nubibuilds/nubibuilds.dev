import { toAlternates as alternates, type Lang, type LangUrls } from '@shared/lib/i18n';
import { ui } from '../i18n';
import { getAllPosts, postLang, postSlug, postUrl, writingBase, type PostEntry } from './queries';

export type { LangUrls };

export interface ArticleProps {
  post: PostEntry;
  /** Up to three other posts in the same language, not counting `newer` and `older`. */
  more: PostEntry[];
  /** The next newer and next older post in the same language, if any. */
  newer?: PostEntry;
  older?: PostEntry;
  urls: LangUrls;
}

/** `getStaticPaths()` for the article route of one language. */
export async function articleStaticPaths(lang: Lang) {
  const all = await getAllPosts();
  const posts = all.filter((post) => postLang(post) === lang);

  return posts.map((post, index) => {
    const slug = postSlug(post);
    const urls: LangUrls = {};
    for (const other of all) {
      if (postSlug(other) === slug) urls[postLang(other)] = postUrl(other);
    }
    // Posts are newest first, so the newer neighbour comes before this one.
    const newer = posts[index - 1];
    const older = posts[index + 1];
    const props: ArticleProps = {
      post,
      newer,
      older,
      // "More writing" skips the two neighbours, which already have their own links.
      more: posts.filter((other) => other !== post && other !== newer && other !== older).slice(0, 3),
      urls,
    };
    return { params: { slug }, props };
  });
}

/** Layout props (title, language, hreflang, …) for an article page. */
export function articleMeta(post: PostEntry, urls: LangUrls) {
  return {
    title: post.data.title,
    description: post.data.summary,
    windowTitle: '~/writing',
    path: '~/writing',
    type: 'article' as const,
    published: post.data.date,
    lang: postLang(post),
    alternates: alternates(urls),
  };
}

export const writingIndexUrls = (): LangUrls => ({ en: writingBase('en'), id: writingBase('id') });

/** Layout props for the article list of one language. */
export function writingIndexMeta(lang: Lang) {
  return {
    title: ui[lang].pageTitle,
    description: ui[lang].description,
    windowTitle: '~/writing',
    path: '~/writing',
    lang,
    alternates: alternates(writingIndexUrls()),
  };
}
