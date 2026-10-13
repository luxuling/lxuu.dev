import type { APIRoute } from 'astro';
import {
  commentBodySchema,
  commentParamsSchema,
  deleteComment,
  serializeComment,
  updateComment,
} from '@/services/comments';
import { requireSessionUser } from '@/services/session';
import { readJsonBody } from '@/utils/request';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = commentParamsSchema.parse(params);
  const user = await requireSessionUser(locals, request);
  const { body } = commentBodySchema.parse(await readJsonBody(request));

  const updated = await updateComment(locals.db, id, user.id, body);

  return Response.json(
    serializeComment({ ...updated, author: user, mine: true }),
  );
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { id } = commentParamsSchema.parse(params);
  const user = await requireSessionUser(locals, request);

  await deleteComment(locals.db, id, user.id);

  return new Response(null, { status: 204 });
};
