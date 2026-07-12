import { getCollection } from 'astro:content';
import { getBlogImageSources } from '../../utils/blog-image';

export const prerender = true;

export async function GET() {
  const posts = (await getCollection('blog'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => {
      const image = post.data.heroImage ? getBlogImageSources(post.data.heroImage) : null;

      return {
        slug: post.id,
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate.toISOString(),
        image,
      };
    });

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
