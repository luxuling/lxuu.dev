import { eq, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import type { Db, DbExecutor } from '@/db/client';
import type { EngagementTables } from '@/db/schema';

interface CounterChanges {
  viewCount?: SQL;
  likeCount?: SQL;
  commentCount?: SQL;
}

export const plusOne = (column: AnyColumn) => sql`${column} + 1`;

export const minusOne = (column: AnyColumn) => sql`GREATEST(${column} - 1, 0)`;

export const ensureCounters = (
  executor: DbExecutor,
  { counters }: EngagementTables,
  slug: string,
) => executor.insert(counters).values({ slug }).onConflictDoNothing();

export const updateCounters = (
  executor: DbExecutor,
  { counters }: EngagementTables,
  slug: string,
  changes: CounterChanges,
) =>
  executor
    .update(counters)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(counters.slug, slug));

export const getCounters = async (
  db: Db,
  tables: EngagementTables,
  slug: string,
) => {
  await ensureCounters(db, tables, slug);

  const [row] = await db
    .select()
    .from(tables.counters)
    .where(eq(tables.counters.slug, slug))
    .limit(1);
  if (!row) throw new Error(`counters row missing for "${slug}"`);

  return row;
};
