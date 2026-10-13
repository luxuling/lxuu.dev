import type { APIRoute } from 'astro';
import { resolveEngagementTarget } from '@/services/engagement-targets';
import { addLike, hasLiked, removeLike } from '@/services/likes';
import { requireSessionUser } from '@/services/session';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals }) => {
  const { tables, slug } = resolveEngagementTarget(params);
  const user = await requireSessionUser(locals, request);

  return Response.json({
    liked: await hasLiked(locals.db, tables, slug, user.id),
  });
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { tables, slug } = resolveEngagementTarget(params);
  const user = await requireSessionUser(locals, request);

  await addLike(locals.db, tables, slug, user.id);

  return new Response(null, { status: 204 });
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { tables, slug } = resolveEngagementTarget(params);
  const user = await requireSessionUser(locals, request);

  await removeLike(locals.db, tables, slug, user.id);

  return new Response(null, { status: 204 });
};
