export const prerender = false;
import type { APIRoute } from 'astro';
import { projectCounters } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;

  await db
    .insert(projectCounters)
    .values({ projectSlug: slug, viewCount: 0, likeCount: 0, commentCount: 0 })
    .onConflictDoNothing();

  const rows = await db
    .select()
    .from(projectCounters)
    .where(eq(projectCounters.projectSlug, slug))
    .limit(1);

  const row = rows[0];

  return Response.json({
    project_slug: slug,
    view_count: row?.viewCount ?? 0,
    like_count: row?.likeCount ?? 0,
    comment_count: row?.commentCount ?? 0,
  });
};
