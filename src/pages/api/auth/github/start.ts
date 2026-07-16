export const prerender = false;
import type { APIRoute } from 'astro';
import { createGithubProvider, resolveSiteUrl } from '@lib/auth/oauth';
import { generateState } from 'arctic';

export const GET: APIRoute = async ({ url }) => {
  const returnTo = url.searchParams.get('redirect_uri') ?? '/';
  const siteUrl = resolveSiteUrl(url);

  const github = createGithubProvider(siteUrl);
  const state = generateState();

  const authUrl = github.createAuthorizationURL(state, [
    'read:user',
    'user:email',
  ]);

  const cookieOpts = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600';
  const headers = new Headers({
    Location: authUrl.toString(),
  });
  headers.append('Set-Cookie', `oauth_state=${state}; ${cookieOpts}`);
  headers.append(
    'Set-Cookie',
    `oauth_return=${encodeURIComponent(returnTo)}; ${cookieOpts}`,
  );

  return new Response(null, { status: 302, headers });
};
