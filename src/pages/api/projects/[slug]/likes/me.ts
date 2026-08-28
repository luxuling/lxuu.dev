export const prerender = false;
import type { APIRoute } from 'astro';
import { projectCounters, projectLikes } from '@lib/db/schema';
import { getSessionUser } from '@lib/auth/session';
import { SESSION_SECRET } from '@lib/env';
import { eq, and, sql } from 'drizzle-orm';

const unauthed = () =>
  Response.json(
    { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
    { status: 401 },
  );

export const GET: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const user = await getSessionUser(
    db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );
  if (!user) return unauthed();

  const rows = await db
    .select({ id: projectLikes.id })
    .from(projectLikes)
    .where(
      and(eq(projectLikes.userId, user.id), eq(projectLikes.projectSlug, slug)),
    )
    .limit(1);

  return Response.json({ liked: rows.length > 0 });
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const user = await getSessionUser(
    db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );
  if (!user) return unauthed();

  await db.transaction(async (tx) => {
    await tx
      .insert(projectCounters)
      .values({
        projectSlug: slug,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      })
      .onConflictDoNothing();

    const inserted = await tx
      .insert(projectLikes)
      .values({ userId: user.id, projectSlug: slug })
      .onConflictDoNothing()
      .returning({ id: projectLikes.id });

    if (inserted.length > 0) {
      await tx
        .update(projectCounters)
        .set({
          likeCount: sql`${projectCounters.likeCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(projectCounters.projectSlug, slug));
    }
  });

  return new Response(null, { status: 204 });
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const user = await getSessionUser(
    db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );
  if (!user) return unauthed();

  await db.transaction(async (tx) => {
    const deleted = await tx
      .delete(projectLikes)
      .where(
        and(
          eq(projectLikes.userId, user.id),
          eq(projectLikes.projectSlug, slug),
        ),
      )
      .returning({ id: projectLikes.id });

    if (deleted.length > 0) {
      await tx
        .update(projectCounters)
        .set({
          likeCount: sql`GREATEST(${projectCounters.likeCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(projectCounters.projectSlug, slug));
    }
  });

  return new Response(null, { status: 204 });
};
