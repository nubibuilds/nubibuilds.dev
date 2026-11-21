import type { APIRoute } from 'astro';
import { writingFeed } from '@features/writing/lib/feed';

/** English articles. The Indonesian feed is /id/rss.xml. */
export const GET: APIRoute = ({ site }) => writingFeed('en', site);
