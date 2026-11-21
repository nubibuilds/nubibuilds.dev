import type { APIRoute } from 'astro';
import { loadSharp, renderOgPng, type OgCard } from '@shared/lib/og';
import { getAllWork, workSlug } from '@features/work/lib/queries';
import { getAllPosts, postSlug } from '@features/writing/lib/queries';

/**
 * /og/work/<lang>/<slug>.png and /og/writing/<lang>/<slug>.png: one social preview image per
 * case study and article. Generated only when `sharp` is installed (see shared/lib/og.ts).
 */
export async function getStaticPaths() {
  if (!(await loadSharp())) return [];
  const [work, posts] = await Promise.all([getAllWork(), getAllPosts()]);

  return [
    ...work.map((entry) => {
      const props: OgCard = { title: entry.data.title, command: `cat ${workSlug(entry)}/case-study.md`, dir: '~/work' };
      return { params: { slug: `work/${entry.id}` }, props };
    }),
    ...posts.map((post) => {
      const props: OgCard = { title: post.data.title, command: `less ${postSlug(post)}.md`, dir: '~/writing' };
      return { params: { slug: `writing/${post.id}` }, props };
    }),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng(props as OgCard);
  if (!png) return new Response('Not found', { status: 404 });
  return new Response(png as unknown as BodyInit, { headers: { 'Content-Type': 'image/png' } });
};
