/*
 * Articles may use any heading level, `#` included. The page already has its H1 (the article
 * `title`), so when an article body uses `#`, every heading in it is moved down one level:
 * `#` → h2, `##` → h3, `###` → h4 … (h6 stays h6). The writer's own hierarchy is kept, the page
 * keeps a single H1, and the section numbers, colours, contents list and `#` links work as usual.
 * An article without `#` is left exactly as written. Case studies are never touched (a `#` there
 * fails the build instead: src/features/work/lib/structure.ts).
 *
 * This is a Sätteri mdast plugin, registered in astro.config.mjs. The factory runs once per
 * document and returns null for anything that is not an article using `#`.
 */
import type { SatteriProcessorOptions } from '@astrojs/markdown-satteri';
import { headingLines } from './markdown-headings';

type MdastPluginEntry = NonNullable<SatteriProcessorOptions['mdastPlugins']>[number];

const ARTICLES = '/src/content/writing/';

export const articleHeadings: MdastPluginEntry = (ctx) =>
  ctx.fileURL && decodeURIComponent(ctx.fileURL.pathname).includes(ARTICLES) && headingLines(ctx.source, 1, { frontmatter: true }).length > 0
    ? {
        name: 'article-headings',
        heading(node) {
          return { ...node, children: node.children, depth: Math.min(node.depth + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6 };
        },
      }
    : null;
