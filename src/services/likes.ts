import { and, eq } from 'drizzle-orm';
import type { Db } from '@/db/client';
import type { EngagementTables } from '@/db/schema';
import {
  ensureCounters,
  minusOne,
  plusOne,
  updateCounters,
} from '@/services/counters';

export const hasLiked = async (
  db: Db,
  { likes }: EngagementTables,
  slug: string,
  userId: string,
) => {
  const rows = await db
    .select({ id: likes.id })
    .from(likes)
    .where(and(eq(likes.userId, userId), eq(likes.slug, slug)))
    .limit(1);

  return rows.length > 0;
};

export const addLike = (
  db: Db,
  tables: EngagementTables,
  slug: string,
  userId: string,
) =>
  db.transaction(async (tx) => {
    await ensureCounters(tx, tables, slug);

    const inserted = await tx
      .insert(tables.likes)
      .values({ userId, slug })
      .onConflictDoNothing()
      .returning({ id: tables.likes.id });
    if (inserted.length === 0) return;

    await updateCounters(tx, tables, slug, {
      likeCount: plusOne(tables.counters.likeCount),
    });
  });

export const removeLike = (
  db: Db,
  tables: EngagementTables,
  slug: string,
  userId: string,
) =>
  db.transaction(async (tx) => {
    const deleted = await tx
      .delete(tables.likes)
      .where(and(eq(tables.likes.userId, userId), eq(tables.likes.slug, slug)))
      .returning({ id: tables.likes.id });
    if (deleted.length === 0) return;

    await updateCounters(tx, tables, slug, {
      likeCount: minusOne(tables.counters.likeCount),
    });
  });
