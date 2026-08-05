import { GitHub } from 'arctic';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '@lib/env';

export function createGithubProvider(siteUrl: string) {
  return new GitHub(
    GITHUB_CLIENT_ID ?? '',
    GITHUB_CLIENT_SECRET ?? '',
    `${siteUrl}/api/auth/github/callback`,
  );
}

/**
 * Origin to use for the OAuth callback URL.
 * On localhost, use the actual request origin so local dev works without
 * bouncing to production; otherwise prefer the configured PUBLIC_SITE_URL.
 */
export function resolveSiteUrl(requestUrl: URL): string {
  const host = requestUrl.hostname;
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  if (isLocal) return requestUrl.origin;
  return import.meta.env.PUBLIC_SITE_URL ?? requestUrl.origin;
}
