export const prerender = false;
import type { APIRoute } from 'astro';
import { projectComments, projectCounters, users } from '@lib/db/schema';
import { getSessionUser } from '@lib/auth/session';
import { SESSION_SECRET } from '@lib/env';
import { eq, and, isNull, lt, desc, sql } from 'drizzle-orm';

const MAX_BODY_LEN = 4000;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const GET: APIRoute = async ({ params, request, url, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const limitParam = parseInt(
    url.searchParams.get('limit') ?? String(DEFAULT_LIMIT),
    10,
  );
  const limit = Math.min(
    isNaN(limitParam) ? DEFAULT_LIMIT : limitParam,
    MAX_LIMIT,
  );
  const cursor = url.searchParams.get('cursor');

  const user = await getSessionUser(
    db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );

  const cursorDate = cursor
    ? new Date(Buffer.from(cursor, 'base64url').toString())
    : null;

  const conditions = [
    eq(projectComments.projectSlug, slug),
    isNull(projectComments.deletedAt),
  ];
  if (cursorDate) conditions.push(lt(projectComments.createdAt, cursorDate));

  const rows = await db
    .select({
      id: projectComments.id,
      projectSlug: projectComments.projectSlug,
      body: projectComments.body,
      createdAt: projectComments.createdAt,
      editedAt: projectComments.editedAt,
      userId: projectComments.userId,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(projectComments)
    .innerJoin(users, eq(projectComments.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(projectComments.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && items.length > 0
      ? Buffer.from(items[items.length - 1]!.createdAt.toISOString()).toString(
          'base64url',
        )
      : null;

  return Response.json({
    items: items.map((r) => ({
      id: r.id,
      project_slug: r.projectSlug,
      body: r.body,
      created_at: r.createdAt.toISOString(),
      edited_at: r.editedAt?.toISOString() ?? null,
      author: {
        id: r.userId,
        display_name: r.displayName,
        avatar_url: r.avatarUrl,
      },
      mine: user?.id === r.userId,
    })),
    next_cursor: nextCursor,
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const user = await getSessionUser(
    db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );
  if (!user) {
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  let body = '';
  try {
    const parsed = await request.json();
    if (typeof parsed?.body === 'string') body = parsed.body.trim();
  } catch {
    return Response.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid JSON' } },
      { status: 400 },
    );
  }

  if (!body || body.length > MAX_BODY_LEN) {
    return Response.json(
      {
        error: {
          code: 'VALIDATION',
          message: `Body must be 1–${MAX_BODY_LEN} chars`,
        },
      },
      { status: 422 },
    );
  }

  const [comment] = await db.transaction(async (tx) => {
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
      .insert(projectComments)
      .values({ projectSlug: slug, userId: user.id, body })
      .returning();

    await tx
      .update(projectCounters)
      .set({
        commentCount: sql`${projectCounters.commentCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(projectCounters.projectSlug, slug));

    return inserted;
  });

  if (!comment) return new Response(null, { status: 500 });

  return Response.json(
    {
      id: comment.id,
      project_slug: comment.projectSlug,
      body: comment.body,
      created_at: comment.createdAt.toISOString(),
      edited_at: null,
      author: {
        id: user.id,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
      },
      mine: true,
    },
    { status: 201 },
  );
};
