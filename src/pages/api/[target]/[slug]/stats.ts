import type { APIRoute } from 'astro';
import { getCounters } from '@/services/counters';
import { resolveEngagementTarget } from '@/services/engagement-targets';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { tables, slugKey, slug } = resolveEngagementTarget(params);
  const counters = await getCounters(locals.db, tables, slug);

  return Response.json({
    [slugKey]: slug,
    view_count: counters.viewCount,
    like_count: counters.likeCount,
    comment_count: counters.commentCount,
  });
};
