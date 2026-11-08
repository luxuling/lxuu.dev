import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { NAV_ITEMS } from '@/data/site';
import { buildSitemap } from '@/utils/sitemap';
import { resolveSiteUrl } from '@/utils/site-url';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const [posts, projects] = await Promise.all([
    getCollection('posts', (entry) => entry.data.status === 'posted'),
    getCollection('projects'),
  ]);

  const entries = [
    { path: '/' },
    ...NAV_ITEMS.map((item) => ({ path: item.href })),
    ...posts.map((entry) => ({
      path: `/posts/${entry.id}`,
      lastModified: entry.data.date,
    })),
    ...projects.map((entry) => ({
      path: `/projects/${entry.id}`,
      lastModified: entry.data.date,
    })),
  ];

  return new Response(buildSitemap(resolveSiteUrl(url), entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
