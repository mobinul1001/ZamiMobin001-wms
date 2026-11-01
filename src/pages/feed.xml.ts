import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

// Served at /feed/ through a rewrite in _redirects.
export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  return rss({
    title: 'WMS Blog',
    description: 'Website care tips and guides from WMS.',
    site: context.site!,
    trailingSlash: true,
    items: posts
      .sort((a, b) => (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0))
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishedAt ?? undefined,
        link: post.data.path,
      })),
  });
}
