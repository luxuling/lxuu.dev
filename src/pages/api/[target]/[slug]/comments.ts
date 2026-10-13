import type { APIRoute } from 'astro';
import {
  commentBodySchema,
  commentsQuerySchema,
  createComment,
  listComments,
  serializeComment,
} from '@/services/comments';
import { resolveEngagementTarget } from '@/services/engagement-targets';
import { getSessionUser, requireSessionUser } from '@/services/session';
import { readJsonBody } from '@/utils/request';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, url, locals }) => {
  const { tables, slugKey, slug } = resolveEngagementTarget(params);
  const query = commentsQuerySchema.parse(Object.fromEntries(url.searchParams));

  const user = await getSessionUser(locals, request);
  const page = await listComments(locals.db, tables, slug, query);

  return Response.json({
    items: page.items.map((row) =>
      serializeComment({
        comment: row,
        author: {
          id: row.userId,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
        },
        slugKey,
        mine: user?.id === row.userId,
      }),
    ),
    next_cursor: page.nextCursor,
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { tables, slugKey, slug } = resolveEngagementTarget(params);
  const user = await requireSessionUser(locals, request);
  const { body } = commentBodySchema.parse(await readJsonBody(request));

  const comment = await createComment(locals.db, tables, slug, user.id, body);

  return Response.json(
    serializeComment({ comment, author: user, slugKey, mine: true }),
    { status: 201 },
  );
};
