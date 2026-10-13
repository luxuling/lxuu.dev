import type { APIRoute } from 'astro';
import { resolveEngagementTarget } from '@/services/engagement-targets';
import { recordView, viewBodySchema } from '@/services/views';
import { readJsonBody } from '@/utils/request';
import { dailyViewHash } from '@/utils/visitor-hash';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { tables, slug } = resolveEngagementTarget(params);
  const { visitor_key: visitorKey } = viewBodySchema.parse(
    await readJsonBody(request),
  );

  const visitorHash = await dailyViewHash(
    slug,
    request,
    visitorKey,
    locals.sessionSecret,
  );

  await recordView(locals.db, tables, slug, visitorHash);

  return new Response(null, { status: 204 });
};
