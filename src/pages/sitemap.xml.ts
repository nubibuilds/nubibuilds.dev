import type { APIRoute } from 'astro';
import { absoluteUrl, escapeXml } from '@shared/lib/xml';
import { LANGS } from '@shared/lib/i18n';
import { getAllWork, workBase, workUrl } from '@features/work/lib/queries';
import { getAllPosts, postUrl, writingBase } from '@features/writing/lib/queries';

export const GET: APIRoute = async ({ site }) => {
  const [work, posts] = await Promise.all([getAllWork(), getAllPosts()]);

  const pages: { path: string; lastmod?: Date | undefined }[] = [
    { path: '/' },
    { path: '/about' },
    { path: '/now' },
    { path: '/uses' },
    ...LANGS.map((lang) => ({ path: workBase(lang) })),
    ...LANGS.map((lang) => ({ path: writingBase(lang) })),
    ...work.map((entry) => ({ path: workUrl(entry), lastmod: entry.data.publishedAt })),
    ...posts.map((post) => ({ path: postUrl(post), lastmod: post.data.date })),
  ];

  const urls = pages
    .map(({ path, lastmod }) => {
      const loc = `<loc>${escapeXml(absoluteUrl(path, site))}</loc>`;
      const mod = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `  <url>${loc}${mod}</url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
