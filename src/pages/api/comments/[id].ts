export const prerender = false;
import type { APIRoute } from 'astro';
import {
  comments,
  postCounters,
  projectComments,
  projectCounters,
} from '@lib/db/schema';
import { getSessionUser } from '@lib/auth/session';
import { SESSION_SECRET } from '@lib/env';
import { eq, and, isNull, sql } from 'drizzle-orm';

const MAX_BODY_LEN = 4000;

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) return new Response(null, { status: 400 });

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

  const [updatedPostComment] = await db
    .update(comments)
    .set({ body, editedAt: new Date() })
    .where(
      and(
        eq(comments.id, id),
        eq(comments.userId, user.id),
        isNull(comments.deletedAt),
      ),
    )
    .returning();

  if (updatedPostComment) {
    return Response.json({
      id: updatedPostComment.id,
      post_slug: updatedPostComment.postSlug,
      body: updatedPostComment.body,
      created_at: updatedPostComment.createdAt.toISOString(),
      edited_at: updatedPostComment.editedAt?.toISOString() ?? null,
      author: {
        id: user.id,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
      },
      mine: true,
    });
  }

  const [updatedProjectComment] = await db
    .update(projectComments)
    .set({ body, editedAt: new Date() })
    .where(
      and(
        eq(projectComments.id, id),
        eq(projectComments.userId, user.id),
        isNull(projectComments.deletedAt),
      ),
    )
    .returning();

  if (updatedProjectComment) {
    return Response.json({
      id: updatedProjectComment.id,
      project_slug: updatedProjectComment.projectSlug,
      body: updatedProjectComment.body,
      created_at: updatedProjectComment.createdAt.toISOString(),
      edited_at: updatedProjectComment.editedAt?.toISOString() ?? null,
      author: {
        id: user.id,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
      },
      mine: true,
    });
  }

  return Response.json(
    {
      error: { code: 'NOT_FOUND', message: 'Comment not found or not yours' },
    },
    { status: 404 },
  );
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) return new Response(null, { status: 400 });

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

  const [deletedPostComment] = await db
    .update(comments)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(comments.id, id),
        eq(comments.userId, user.id),
        isNull(comments.deletedAt),
      ),
    )
    .returning({ id: comments.id, postSlug: comments.postSlug });

  if (deletedPostComment) {
    await db
      .update(postCounters)
      .set({
        commentCount: sql`GREATEST(${postCounters.commentCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(postCounters.postSlug, deletedPostComment.postSlug));

    return new Response(null, { status: 204 });
  }

  const [deletedProjectComment] = await db
    .update(projectComments)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(projectComments.id, id),
        eq(projectComments.userId, user.id),
        isNull(projectComments.deletedAt),
      ),
    )
    .returning({
      id: projectComments.id,
      projectSlug: projectComments.projectSlug,
    });

  if (deletedProjectComment) {
    await db
      .update(projectCounters)
      .set({
        commentCount: sql`GREATEST(${projectCounters.commentCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(
        eq(projectCounters.projectSlug, deletedProjectComment.projectSlug),
      );

    return new Response(null, { status: 204 });
  }

  return Response.json(
    {
      error: { code: 'NOT_FOUND', message: 'Comment not found or not yours' },
    },
    { status: 404 },
  );
};
