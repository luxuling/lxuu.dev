export const prerender = false;
import type { APIRoute } from 'astro';
import { getSessionUser } from '@lib/auth/session';
import { SESSION_SECRET } from '@lib/env';

export const GET: APIRoute = async ({ request, locals }) => {
  const user = await getSessionUser(
    locals.db,
    request.headers.get('cookie'),
    SESSION_SECRET ?? '',
  );

  return Response.json({
    authenticated: !!user,
    user: user
      ? {
          id: user.id,
          display_name: user.displayName,
          avatar_url: user.avatarUrl,
        }
      : null,
  });
};
