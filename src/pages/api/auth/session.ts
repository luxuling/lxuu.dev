import type { APIRoute } from 'astro';
import { getSessionUser, serializeUser } from '@/services/session';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const user = await getSessionUser(locals, request);

  return Response.json({
    authenticated: user !== null,
    user: user && serializeUser(user),
  });
};
