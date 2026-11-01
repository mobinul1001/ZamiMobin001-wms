import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seo = z.object({
  title: z.string(),
  description: z.string().optional(),
  // Path with trailing slash, for example /about-us/. Made absolute by the layout.
  canonicalPath: z.string().optional(),
  robots: z.string().optional(),
  ogImage: z.string().optional(),
  h1: z.string(),
  // Schema types kept from the old page, for example ["FAQPage", "BreadcrumbList"].
  schema: z.array(z.any()).optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: seo,
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: seo.extend({
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().optional(),
    categories: z.array(z.string()).optional(),
  }),
});

export const collections = { pages, blog };
