export enum GitHubEndpoint {
  GraphQL = 'https://api.github.com/graphql',
}

export type GitHubEnv =
  | { ok: true; username: string; token: string }
  | { ok: false; message: string };

export function getGitHubEnv(): GitHubEnv {
  const username = (import.meta.env.GITHUB_USERNAME ?? '').trim();
  const token = (import.meta.env.GITHUB_TOKEN ?? '').trim();
  if (!username || !token) {
    return {
      ok: false,
      message:
        'Set GITHUB_USERNAME and GITHUB_TOKEN in .env. Token must stay server-side only.',
    };
  }
  return { ok: true, username, token };
}
