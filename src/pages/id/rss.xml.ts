import type { APIRoute } from 'astro';
import { writingFeed } from '@features/writing/lib/feed';

/** Indonesian articles. The English feed is /rss.xml. */
export const GET: APIRoute = ({ site }) => writingFeed('id', site);
