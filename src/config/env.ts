import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_TOKEN,
  GITHUB_USERNAME,
} from 'astro:env/server';
import { ServiceUnavailableError } from '@/utils/http-error';

export interface GithubProfileCredentials {
  username: string;
  token: string;
}

export const getGithubProfileCredentials =
  (): GithubProfileCredentials | null => {
    if (!GITHUB_USERNAME || !GITHUB_TOKEN) return null;

    return { username: GITHUB_USERNAME, token: GITHUB_TOKEN };
  };

export const getGithubOAuthCredentials = () => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new ServiceUnavailableError(
      'OAUTH_UNAVAILABLE',
      'GitHub sign-in is not configured for this deployment.',
    );
  }

  return { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET };
};
