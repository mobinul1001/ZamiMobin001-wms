import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const fields = {
  // Final URL path with trailing slash, for example /about-us/.
  path: z.string(),
  // Page language when it is not the site default, for example pt-BR.
  lang: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  robots: z.string().optional(),
  h1: z.string(),
  // Open Graph and Twitter tags as they appear on the old page.
  social: z.record(z.string(), z.any()).optional(),
  schema: z.array(z.any()).optional(),
  // Read from the page's FAQPage schema. The visible Q&A stays in the body for now.
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
};

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object(fields),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    ...fields,
    publishedAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    author: z.string().nullable().optional(),
    categories: z.array(z.string()).optional(),
  }),
});

export const collections = { pages, blog };
