import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().transform((str) => new Date(str)),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

const shipped = defineCollection({
  loader: glob({ base: './src/content/shipped', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    companySlug: z.string(),
    visual: z.enum(['chart', 'tooltip', 'controls', 'pipeline', 'map', 'lock', 'batch', 'python', 'docs', 'queue']),
    summary: z.string(),
    order: z.number(),
    legacySlug: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  }),
});

export const collections = { blog, shipped };
