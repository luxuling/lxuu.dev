import { GitHubEndpoint } from '../../config/config';

export type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
  weekday: number;
};

export type ContributionWeek = {
  contributionDays: ContributionDay[];
};

export type GitHubHomeData = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  profileUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalContributions: number;
  weeks: ContributionWeek[];
};

type RawDay = { date: string; contributionCount: number };
type RawWeek = { contributionDays: RawDay[] };
type GraphqlError = { message: string };
type GraphqlResponse<T> = { data?: T; errors?: GraphqlError[] };

type HomeUserQuery = {
  user: null | {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    url: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    repositories: { totalCount: number };
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: RawWeek[];
      };
    };
  };
};

function resolveError(res: Response, raw: unknown): string {
  const body = raw as GraphqlResponse<unknown>;
  if (body?.errors?.length) return body.errors.map((e) => e.message).join('; ');
  const msg = (raw as Record<string, unknown>)?.message;
  if (typeof msg === 'string' && msg) return msg;
  return `${res.status} ${res.statusText}`;
}

async function githubGraphqlRequest<TData>(
  query: string,
  variables: Record<string, unknown> | undefined,
  token: string,
): Promise<TData> {
  const res = await fetch(GitHubEndpoint.GraphQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const raw: unknown = await res.json();
  const body = raw as GraphqlResponse<TData>;
  if (!res.ok || body.errors?.length) throw new Error(resolveError(res, raw));
  if (body.data === undefined) throw new Error('No data in GraphQL response');
  return body.data;
}

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

function normalizeWeeks(weeks: RawWeek[]): ContributionWeek[] {
  return weeks.map((week) => ({
    contributionDays: week.contributionDays.map(
      (day): ContributionDay => ({
        ...day,
        color: '',
        weekday: new Date(`${day.date}T12:00:00Z`).getUTCDay(),
      }),
    ),
  }));
}

export async function fetchGitHubHome(
  userName: string,
  token: string,
): Promise<GitHubHomeData> {
  const data = await githubGraphqlRequest<HomeUserQuery>(
    HOME_QUERY,
    { userName },
    token,
  );
  const user = data.user;
  if (!user) throw new Error('User not found');
  const cal = user.contributionsCollection.contributionCalendar;
  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    profileUrl: user.url,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    publicRepos: user.repositories.totalCount,
    totalContributions: cal.totalContributions,
    weeks: normalizeWeeks(cal.weeks),
  };
}
