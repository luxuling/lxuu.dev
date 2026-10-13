import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { z } from 'astro/zod';
import type { Db } from '@/db/client';
import type { EngagementTables } from '@/db/schema';
import { users } from '@/db/schema';
import {
  ensureCounters,
  minusOne,
  plusOne,
  updateCounters,
} from '@/services/counters';
import { engagementTargets } from '@/services/engagement-targets';
import { serializeUser, type SessionUser } from '@/services/session';
import { decodeCursor, encodeCursor } from '@/utils/cursor';
import { NotFoundError } from '@/utils/http-error';

const MAX_BODY_LENGTH = 4000;
const BODY_MESSAGE = `Body must be 1–${MAX_BODY_LENGTH} chars`;
const NOT_FOUND_MESSAGE = 'Comment not found or not yours';

type CommentsTable = EngagementTables['comments'];
type CommentRow = CommentsTable['$inferSelect'];
type SlugKey =
  (typeof engagementTargets)[keyof typeof engagementTargets]['slugKey'];

export const commentBodySchema = z.object({
  body: z
    .string(BODY_MESSAGE)
    .trim()
    .min(1, BODY_MESSAGE)
    .max(MAX_BODY_LENGTH, BODY_MESSAGE),
});

export const commentParamsSchema = z.object({ id: z.uuid() });

export const commentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.base64().transform(decodeCursor).pipe(z.date()).optional(),
});

type CommentsQuery = z.infer<typeof commentsQuerySchema>;

interface CommentView {
  comment: Pick<CommentRow, 'id' | 'slug' | 'body' | 'createdAt' | 'editedAt'>;
  author: SessionUser;
  slugKey: SlugKey;
  mine: boolean;
}

export const serializeComment = ({
  comment,
  author,
  slugKey,
  mine,
}: CommentView) => ({
  id: comment.id,
  [slugKey]: comment.slug,
  body: comment.body,
  created_at: comment.createdAt.toISOString(),
  edited_at: comment.editedAt?.toISOString() ?? null,
  author: serializeUser(author),
  mine,
});

const ownActiveComment = (
  comments: CommentsTable,
  id: string,
  userId: string,
) =>
  and(
    eq(comments.id, id),
    eq(comments.userId, userId),
    isNull(comments.deletedAt),
  );

export const listComments = async (
  db: Db,
  { comments }: EngagementTables,
  slug: string,
  { limit, cursor }: CommentsQuery,
) => {
  const conditions = [eq(comments.slug, slug), isNull(comments.deletedAt)];
  if (cursor) conditions.push(lt(comments.createdAt, cursor));

  const rows = await db
    .select({
      id: comments.id,
      slug: comments.slug,
      body: comments.body,
      createdAt: comments.createdAt,
      editedAt: comments.editedAt,
      userId: comments.userId,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1);

  const items = rows.slice(0, limit);
  const lastItem = items.at(-1);
  const hasMore = rows.length > limit;

  return {
    items,
    nextCursor: hasMore && lastItem ? encodeCursor(lastItem.createdAt) : null,
  };
};

export const createComment = async (
  db: Db,
  tables: EngagementTables,
  slug: string,
  userId: string,
  body: string,
) => {
  const [comment] = await db.transaction(async (tx) => {
    await ensureCounters(tx, tables, slug);

    const inserted = await tx
      .insert(tables.comments)
      .values({ slug, userId, body })
      .returning();

    await updateCounters(tx, tables, slug, {
      commentCount: plusOne(tables.counters.commentCount),
    });

    return inserted;
  });
  if (!comment) throw new Error('comment insert returned no row');

  return comment;
};

export const updateComment = async (
  db: Db,
  id: string,
  userId: string,
  body: string,
) => {
  for (const { tables, slugKey } of Object.values(engagementTargets)) {
    const [comment] = await db
      .update(tables.comments)
      .set({ body, editedAt: new Date() })
      .where(ownActiveComment(tables.comments, id, userId))
      .returning();

    if (comment) return { comment, slugKey };
  }

  throw new NotFoundError(NOT_FOUND_MESSAGE);
};

export const deleteComment = async (db: Db, id: string, userId: string) => {
  for (const { tables } of Object.values(engagementTargets)) {
    const [comment] = await db
      .update(tables.comments)
      .set({ deletedAt: new Date() })
      .where(ownActiveComment(tables.comments, id, userId))
      .returning({ slug: tables.comments.slug });
    if (!comment) continue;

    await updateCounters(db, tables, comment.slug, {
      commentCount: minusOne(tables.counters.commentCount),
    });

    return;
  }

  throw new NotFoundError(NOT_FOUND_MESSAGE);
};
