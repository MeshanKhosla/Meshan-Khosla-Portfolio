import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().transform((str) => new Date(str)),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const collections = { blog };
