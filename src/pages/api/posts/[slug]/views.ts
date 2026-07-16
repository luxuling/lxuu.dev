export const prerender = false;
import type { APIRoute } from 'astro';
import { postCounters, viewEvents } from '@lib/db/schema';
import { SESSION_SECRET } from '@lib/env';
import { eq, and, gte, sql } from 'drizzle-orm';

async function makeVisitorHash(
  slug: string,
  req: Request,
  visitorKey: string,
  secret: string,
): Promise<string> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '';
  const ua = req.headers.get('user-agent') ?? '';
  const date = new Date().toISOString().slice(0, 10);
  const raw = `${slug}|${ip}|${ua}|${date}|${visitorKey}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(raw),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 400 });

  const { db } = locals;
  const secret = SESSION_SECRET ?? '';
  let visitorKey = '';
  try {
    const body = await request.clone().json();
    if (typeof body?.visitor_key === 'string') visitorKey = body.visitor_key;
  } catch {
    /* body is optional */
  }

  const visitorHash = await makeVisitorHash(slug, request, visitorKey, secret);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const existing = await db
    .select({ id: viewEvents.id })
    .from(viewEvents)
    .where(
      and(
        eq(viewEvents.postSlug, slug),
        eq(viewEvents.visitorHash, visitorHash),
        gte(viewEvents.occurredAt, todayStart),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.transaction(async (tx) => {
      await tx
        .insert(postCounters)
        .values({ postSlug: slug, viewCount: 1, likeCount: 0, commentCount: 0 })
        .onConflictDoUpdate({
          target: postCounters.postSlug,
          set: {
            viewCount: sql`${postCounters.viewCount} + 1`,
            updatedAt: new Date(),
          },
        });

      await tx.insert(viewEvents).values({ postSlug: slug, visitorHash });
    });
  }

  return new Response(null, { status: 204 });
};
