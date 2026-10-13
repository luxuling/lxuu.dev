import { z } from 'astro/zod';
import type { GithubProfileCredentials } from '@/config/env';
import { HttpError } from '@/utils/http-error';

const GRAPHQL_URL = 'https://api.github.com/graphql';
const REST_URL = 'https://api.github.com';

// NOTE: GitHub rejects requests without a User-Agent and workerd sends none by default
const BASE_HEADERS = { 'User-Agent': 'lxuu.dev' };

const REST_HEADERS = {
  ...BASE_HEADERS,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const HOME_QUERY = `
query ($userName: String!) {
  user(login: $userName) {
    login
    name
    avatarUrl
    bio
    url
    followers { totalCount }
    following { totalCount }
    repositories(privacy: PUBLIC) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

const AVATAR_QUERY = `
query ($userName: String!) {
  user(login: $userName) {
    avatarUrl
  }
}
`;

const graphqlEnvelopeSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
  message: z.string().optional(),
});

const countSchema = z.object({ totalCount: z.number() });

const contributionDaySchema = z
  .object({ date: z.string(), contributionCount: z.number() })
  .transform((day) => ({
    ...day,
    weekday: new Date(`${day.date}T12:00:00Z`).getUTCDay(),
  }));

const contributionWeekSchema = z.object({
  contributionDays: z.array(contributionDaySchema),
});

const homeSchema = z
  .object({
    user: z.object({
      login: z.string(),
      name: z.string().nullable(),
      avatarUrl: z.string(),
      bio: z.string().nullable(),
      url: z.string(),
      followers: countSchema,
      following: countSchema,
      repositories: countSchema,
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
          weeks: z.array(contributionWeekSchema),
        }),
      }),
    }),
  })
  .transform(({ user }) => ({
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    profileUrl: user.url,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    publicRepos: user.repositories.totalCount,
    totalContributions:
      user.contributionsCollection.contributionCalendar.totalContributions,
    weeks: user.contributionsCollection.contributionCalendar.weeks,
  }));

const avatarSchema = z.object({ user: z.object({ avatarUrl: z.string() }) });

const githubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string(),
  email: z.string().nullable(),
});

const repoSchema = z.object({ stargazers_count: z.number() });

export type GithubHome = z.infer<typeof homeSchema>;
export type ContributionWeek = z.infer<typeof contributionWeekSchema>;
export type ContributionDay = z.infer<typeof contributionDaySchema>;
export type GithubUser = z.infer<typeof githubUserSchema>;

const requestGraphql = async <Output>(
  schema: z.ZodType<Output>,
  query: string,
  { username, token }: GithubProfileCredentials,
) => {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { userName: username } }),
  });

  const envelope = graphqlEnvelopeSchema.parse(await res.json());
  if (envelope.errors?.length) {
    throw new Error(envelope.errors.map((error) => error.message).join('; '));
  }
  if (!res.ok) {
    throw new Error(envelope.message ?? `${res.status} ${res.statusText}`);
  }

  return schema.parse(envelope.data);
};

export const fetchGithubHome = (credentials: GithubProfileCredentials) =>
  requestGraphql(homeSchema, HOME_QUERY, credentials);

export const fetchGithubAvatar = async (
  credentials: GithubProfileCredentials,
) => {
  const { user } = await requestGraphql(
    avatarSchema,
    AVATAR_QUERY,
    credentials,
  );

  const res = await fetch(`${user.avatarUrl}&size=128`);
  if (!res.ok) throw new Error(`avatar request failed with ${res.status}`);

  return res;
};

export const fetchGithubUser = async (accessToken: string) => {
  const res = await fetch(`${REST_URL}/user`, {
    headers: { ...REST_HEADERS, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new HttpError(502, 'BAD_GATEWAY', 'Failed to fetch GitHub user');
  }

  return githubUserSchema.parse(await res.json());
};

const parseRepoFullName = (repoUrl: string) => {
  if (!URL.canParse(repoUrl)) return null;

  const url = new URL(repoUrl);
  const [owner, repo] = url.pathname.split('/').filter(Boolean);
  if (url.hostname.replace(/^www\./, '') !== 'github.com') return null;
  if (!owner || !repo) return null;

  return `${owner}/${repo}`;
};

export const fetchGithubStarCount = async (repoUrl: string, token?: string) => {
  const fullName = parseRepoFullName(repoUrl);
  if (!fullName) return null;

  const res = await fetch(`${REST_URL}/repos/${fullName}`, {
    headers: token
      ? { ...REST_HEADERS, Authorization: `Bearer ${token}` }
      : REST_HEADERS,
  });
  if (!res.ok) return null;

  return repoSchema.parse(await res.json()).stargazers_count;
};
