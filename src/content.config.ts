import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PLACEHOLDER, findPlaceholders } from './shared/lib/placeholder';

/**
 * Case studies. Every project must tell the same four-part story, so the
 * card summaries are required fields and the build fails if one is missing.
 * The Markdown body starts with four H2s: Problem, Architecture, Implementation, Result
 * (checked by `getAllWork`). The writing guide is docs/writing-case-studies.md.
 *
 * Media is optional. A picture is either a path relative to the Markdown file (`image()` makes
 * Astro validate that the file exists and optimise it at build time) or the full URL of an
 * image hosted elsewhere, which is used as it is.
 */
const remoteUrl = z.string().regex(/^https?:\/\/\S+$/, 'Use a full URL starting with https://, or a path relative to this file');

/** Required text: an empty or whitespace-only value fails the build. */
const text = z.string().trim().min(1, 'Required: write the real text');

/*
 * Template text (`[[TODO: …]]`) left in a published case study fails the build: the frontmatter
 * is checked here, the body by `getAllWork` in src/features/work/lib/queries.ts.
 */
const work = defineCollection({
  /* Only case studies live here, in en/ and id/. Templates are in docs/templates/. */
  loader: glob({ pattern: '{en,id}/**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: text,
      summary: text,
      year: text,
      role: text,
      timeline: text,
      status: text,
      stack: z.array(z.string()).default([]),
      /** Lower numbers are listed first. */
      order: z.number().default(0),
      /** Hidden from the production build; still shown (and labelled) in `astro dev`. */
      draft: z.boolean().default(false),
      /** Show on the home page. If no case study is featured, the first three are shown. */
      featured: z.boolean().default(false),
      /** Release date, YYYY-MM-DD. Among case studies with the same `order`, newer ones come first. */
      publishedAt: z.coerce.date().optional(),
      highlights: z.object({
        problem: text,
        architecture: text,
        implementation: text,
        result: text,
      }),
      metrics: z.array(z.object({ value: text, label: text })).default([]),
      repo: z.url().optional(),
      demo: z.url().optional(),
      /** Main screenshot: replaces the generated ASCII cover on cards and opens the case study. */
      cover: z.union([remoteUrl, image()]).optional(),
      coverAlt: z.string().optional(),
      /** Pixel size of a remote `cover` (not needed for files in the repository). */
      coverWidth: z.number().int().positive().optional(),
      coverHeight: z.number().int().positive().optional(),
      /** More screenshots, shown as a zoomable grid at the end of the case study. */
      gallery: z
        .array(
          z.object({
            src: z.union([remoteUrl, image()]),
            alt: text,
            caption: z.string().optional(),
            /** Pixel size of a remote image (not needed for files in the repository). */
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
          }),
        )
        .default([]),
      /** YouTube video id (the 11 characters after `v=`), not the full URL. */
      youtube: z
        .string()
        .regex(/^[\w-]{11}$/, 'Use the 11-character video id, not the full URL')
        .optional(),
      youtubeTitle: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.draft) return;
      for (const path of findPlaceholders(data))
        ctx.addIssue({ code: 'custom', path, message: `Template text left in a published case study: replace the ${PLACEHOLDER} …]] value, or set draft: true` });
    }),
});

/*
 * The article template writes `date: "[[TODO: …]]"`. While the article is a draft that stands in
 * for a date (the build date, so `astro dev` can show the page); published, it fails the build.
 */
const placeholderDates = new WeakSet<Date>();
const articleDate = z.union([
  z.coerce.date(),
  z
    .string()
    .includes(PLACEHOLDER)
    .transform(() => {
      const date = new Date();
      placeholderDates.add(date);
      return date;
    }),
]);

/*
 * Articles: news, things learned, notes shared. The body has no required structure; headings
 * are free (src/shared/lib/article-headings.ts). Template text (`[[TODO: …]]`) or an empty body
 * in a published article fails the build: the frontmatter is checked here, the body by
 * `getAllPosts` in src/features/writing/lib/queries.ts. Guide: docs/writing-articles.md.
 */
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z
    .object({
      title: text,
      summary: text,
      /** Publication date, YYYY-MM-DD. Articles are listed newest first. */
      date: articleDate,
      tags: z.array(text).default([]),
      /** Hidden from the production build; still shown (and labelled) in `astro dev`. */
      draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.draft) return;
      const message = `Template text left in a published article: replace the ${PLACEHOLDER} …]] value, or set draft: true`;
      for (const path of findPlaceholders(data)) ctx.addIssue({ code: 'custom', path, message });
      if (placeholderDates.has(data.date)) ctx.addIssue({ code: 'custom', path: ['date'], message: `${message} (write the publication date as YYYY-MM-DD)` });
    }),
});

export const collections = { work, writing };
