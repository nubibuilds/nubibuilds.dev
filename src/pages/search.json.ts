import type { APIRoute } from 'astro';
import { getAllWork, workLang, workUrl } from '@features/work/lib/queries';
import { getAllPosts, postLang, postUrl } from '@features/writing/lib/queries';

/** Markdown → plain words, good enough for matching and short snippets. */
const plain = (markdown = '') =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);

/** The index read by src/features/search/lib/search.js. */
export const GET: APIRoute = async () => {
  const [work, posts] = await Promise.all([getAllWork(), getAllPosts()]);

  const items = [
    ...work.map((entry) => ({
      kind: 'work',
      lang: workLang(entry),
      title: entry.data.title,
      url: workUrl(entry),
      summary: entry.data.summary,
      tags: entry.data.stack,
      body: plain([...Object.values(entry.data.highlights), entry.body ?? ''].join(' ')),
    })),
    ...posts.map((post) => ({
      kind: 'writing',
      lang: postLang(post),
      title: post.data.title,
      url: postUrl(post),
      summary: post.data.summary,
      tags: post.data.tags,
      body: plain(post.body),
    })),
  ];

  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
