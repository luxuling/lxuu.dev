import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { uniqueTags } from '@/utils/tags';

export const prerender = false;

export const GET: APIRoute = async () => {
  const [posts, projects] = await Promise.all([
    getCollection('posts'),
    getCollection('projects'),
  ]);

  const tags = uniqueTags(
    [...posts, ...projects].flatMap((entry) => entry.data.tags),
  );

  return Response.json({ tags });
};
