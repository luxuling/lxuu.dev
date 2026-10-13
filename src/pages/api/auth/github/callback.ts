import type { APIRoute } from 'astro';
import { fetchGithubUser } from '@/services/github';
import { exchangeGithubCode, readSignInState } from '@/services/oauth';
import { createSession, makeSessionCookie } from '@/services/session';
import { upsertGithubUser } from '@/services/users';
import { BadRequestError } from '@/utils/http-error';
import { resolveReturnPath } from '@/utils/return-path';

export const prerender = false;

export const GET: APIRoute = async ({ url, request, locals }) => {
  const { state, returnTo } = readSignInState(request);
  if (!state || url.searchParams.get('state') !== state) {
    throw new BadRequestError('Invalid state');
  }

  const code = url.searchParams.get('code');
  if (!code) throw new BadRequestError('Missing code');

  const accessToken = await exchangeGithubCode(url, code);
  const githubUser = await fetchGithubUser(accessToken);

  const userId = await upsertGithubUser(locals.db, githubUser);
  const token = await createSession(locals, userId, request);

  return new Response(null, {
    status: 302,
    headers: {
      Location: resolveReturnPath(returnTo, url.origin),
      'Set-Cookie': makeSessionCookie(token),
    },
  });
};
