import type { APIRoute } from 'astro';
import { site as config } from '@shared/config/site';
import { absoluteUrl } from '@shared/lib/xml';

/**
 * Crawling stays allowed even while `site.indexable` is false: a crawler has to fetch a page
 * to see its `noindex` tag, and a page blocked here could still be listed by its bare URL.
 * What changes is that the sitemap is no longer advertised.
 */
export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /', ''];
  if (config.indexable) lines.push(`Sitemap: ${absoluteUrl('/sitemap.xml', site)}`, '');
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
