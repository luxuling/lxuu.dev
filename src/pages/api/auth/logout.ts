import type { APIRoute } from 'astro';
import {
  invalidateSession,
  makeExpiredSessionCookie,
} from '@/services/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  await invalidateSession(locals, request);

  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': makeExpiredSessionCookie() },
  });
};
