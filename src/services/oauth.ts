import { GitHub, generateState } from 'arctic';
import { getGithubOAuthCredentials } from '@/config/env';
import { BadRequestError } from '@/utils/http-error';
import { getCookie } from '@/utils/request';
import { resolveSiteUrl } from '@/utils/site-url';

const STATE_COOKIE = 'oauth_state';
const RETURN_COOKIE = 'oauth_return';
const COOKIE_ATTRIBUTES = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600';

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
