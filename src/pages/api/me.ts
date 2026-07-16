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

  if (!user) {
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  return Response.json({
    user: {
      id: user.id,
      display_name: user.displayName,
      avatar_url: user.avatarUrl,
    },
  });
};
