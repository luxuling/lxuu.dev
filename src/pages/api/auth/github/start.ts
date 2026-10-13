import type { APIRoute } from 'astro';
import { startGithubSignIn } from '@/services/oauth';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const returnTo = url.searchParams.get('redirect_uri') ?? '/';
  const { authorizationUrl, cookies } = startGithubSignIn(url, returnTo);

  const headers = new Headers({ Location: authorizationUrl.toString() });
  cookies.forEach((cookie) => headers.append('Set-Cookie', cookie));

  return new Response(null, { status: 302, headers });
};
