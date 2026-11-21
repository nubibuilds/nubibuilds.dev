import { site as siteConfig } from '@shared/config/site';
import { absoluteUrl, escapeXml } from '@shared/lib/xml';
import { ui, type Lang } from '../i18n';
import { getAllPosts, postUrl, writingBase } from './queries';

/** RSS 2.0 feed of the articles written in one language. */
export async function writingFeed(lang: Lang, site: URL | undefined): Promise<Response> {
  const posts = await getAllPosts(lang);

  const items = posts
    .map((post) => {
      const link = escapeXml(absoluteUrl(postUrl(post), site));
      return [
        '    <item>',
        `      <title>${escapeXml(post.data.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.data.summary)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — ${ui[lang].pageTitle}`)}</title>
    <link>${escapeXml(absoluteUrl(writingBase(lang), site))}</link>
    <description>${escapeXml(ui[lang].description)}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
