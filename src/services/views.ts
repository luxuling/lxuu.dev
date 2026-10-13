import { and, eq, gte } from 'drizzle-orm';
import { z } from 'astro/zod';
import type { Db } from '@/db/client';
import type { EngagementTables } from '@/db/schema';
import { plusOne } from '@/services/counters';

export const viewBodySchema = z.object({
  visitor_key: z.string().trim().default(''),
});

const startOfUtcDay = () => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);

  return date;
};

export const recordView = async (
  db: Db,
  { counters, viewEvents }: EngagementTables,
  slug: string,
  visitorHash: string,
) => {
  const existing = await db
    .select({ id: viewEvents.id })
    .from(viewEvents)
    .where(
      and(
        eq(viewEvents.slug, slug),
        eq(viewEvents.visitorHash, visitorHash),
        gte(viewEvents.occurredAt, startOfUtcDay()),
      ),
    )
    .limit(1);
  if (existing.length > 0) return;

  await db.transaction(async (tx) => {
    await tx
      .insert(counters)
      .values({ slug, viewCount: 1 })
      .onConflictDoUpdate({
        target: counters.slug,
        set: { viewCount: plusOne(counters.viewCount), updatedAt: new Date() },
      });

    await tx.insert(viewEvents).values({ slug, visitorHash });
  });
};
