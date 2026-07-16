export const prerender = false;
import type { APIRoute } from 'astro';
import { invalidateSession, makeExpiredSessionCookie } from '@lib/auth/session';
import { SESSION_SECRET } from '@lib/env';

export const POST: APIRoute = async ({ request, locals }) => {
  await invalidateSession(
    locals.db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );

  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': makeExpiredSessionCookie() },
  });
};
