import type { APIRoute } from 'astro';
import { requireSessionUser, serializeUser } from '@/services/session';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const user = await requireSessionUser(locals, request);

  return Response.json({ user: serializeUser(user) });
};
