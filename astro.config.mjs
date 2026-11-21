// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { codeMeta } from './src/shared/lib/code-meta.mjs';
import { articleHeadings } from './src/shared/lib/article-headings.ts';
import { nubibuildsTheme } from './src/shared/lib/shiki-theme.mjs';
import { site } from './src/shared/config/site.ts';

// Absolute path of a project folder, without Node imports (so type-checking needs no @types/node).
const dir = (/** @type {string} */ path) => decodeURIComponent(new URL(path, import.meta.url).pathname);

export default defineConfig({
  // The address lives in src/shared/config/site.ts (`url`), with the rest of the site details.
  site: site.url,
  output: 'static',
  integrations: [mdx()],
  image: {
    // Images in Markdown and <Image> get several sizes (srcset), so phones do not download desktop files.
    layout: 'constrained',
  },
  markdown: {
    // Markdown and MDX are rendered by Sätteri (Astro 7 default); code blocks are highlighted by Shiki.
    // articleHeadings: an article that uses `#` has its headings moved down one level (see the file).
    processor: satteri({ mdastPlugins: [articleHeadings] }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // NubiBuilds theme: token colours are the --code-* variables in prose.css,
      // so code follows the site palette in both dark and light themes.
      theme: nubibuildsTheme,
      wrap: false,
      // Reads `title="…"` and `{2,4-6}` after the language on a code fence.
      transformers: [codeMeta()],
    },
  },
  vite: {
    resolve: {
      alias: {
        '@app': dir('./src/app'),
        '@features': dir('./src/features'),
        '@shared': dir('./src/shared'),
      },
    },
  },
});
