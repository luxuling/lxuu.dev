export const prerender = false;
import type { APIRoute } from 'astro';
import { projectCounters, projectViewEvents } from '@lib/db/schema';
import { SESSION_SECRET } from '@lib/env';
import { dailyViewHash, readVisitorKey } from '@lib/engagement/visitor-hash';
import { eq, and, gte, sql } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const secret = SESSION_SECRET ?? '';
  const visitorKey = await readVisitorKey(request);
  const visitorHash = await dailyViewHash(slug, request, visitorKey, secret);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const existing = await db
    .select({ id: projectViewEvents.id })
    .from(projectViewEvents)
    .where(
      and(
        eq(projectViewEvents.projectSlug, slug),
        eq(projectViewEvents.visitorHash, visitorHash),
        gte(projectViewEvents.occurredAt, todayStart),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.transaction(async (tx) => {
      await tx
        .insert(projectCounters)
        .values({
          projectSlug: slug,
          viewCount: 1,
          likeCount: 0,
          commentCount: 0,
        })
        .onConflictDoUpdate({
          target: projectCounters.projectSlug,
          set: {
            viewCount: sql`${projectCounters.viewCount} + 1`,
            updatedAt: new Date(),
          },
        });

      await tx
        .insert(projectViewEvents)
        .values({ projectSlug: slug, visitorHash });
    });
  }

  return new Response(null, { status: 204 });
};
