import { GitHub, generateState } from 'arctic';
import { getGithubOAuthCredentials } from '@/config/env';
import { BadRequestError } from '@/utils/http-error';
import { getCookie } from '@/utils/request';

const STATE_COOKIE = 'oauth_state';
const RETURN_COOKIE = 'oauth_return';
const COOKIE_ATTRIBUTES = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

// NOTE: localhost keeps the request origin so local sign-in does not bounce to production
const resolveSiteUrl = (requestUrl: URL) => {
  if (LOCAL_HOSTS.includes(requestUrl.hostname)) return requestUrl.origin;

  return import.meta.env.PUBLIC_SITE_URL ?? requestUrl.origin;
};

const createGithubProvider = (requestUrl: URL) => {
  const { clientId, clientSecret } = getGithubOAuthCredentials();
  const callbackUrl = `${resolveSiteUrl(requestUrl)}/api/auth/github/callback`;

  return new GitHub(clientId, clientSecret, callbackUrl);
};

export const startGithubSignIn = (requestUrl: URL, returnTo: string) => {
  const state = generateState();
  const authorizationUrl = createGithubProvider(
    requestUrl,
  ).createAuthorizationURL(state, ['read:user', 'user:email']);

  return {
    authorizationUrl,
    cookies: [
      `${STATE_COOKIE}=${state}; ${COOKIE_ATTRIBUTES}`,
      `${RETURN_COOKIE}=${encodeURIComponent(returnTo)}; ${COOKIE_ATTRIBUTES}`,
    ],
  };
};

export const readSignInState = (request: Request) => ({
  state: getCookie(request, STATE_COOKIE),
  returnTo: decodeURIComponent(getCookie(request, RETURN_COOKIE) ?? '/'),
});

export const exchangeGithubCode = async (requestUrl: URL, code: string) => {
  const provider = createGithubProvider(requestUrl);

  try {
    const tokens = await provider.validateAuthorizationCode(code);

    return tokens.accessToken();
  } catch {
    throw new BadRequestError('OAuth exchange failed');
  }
};
