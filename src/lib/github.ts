/**
 * GitHub GraphQL for profile + contribution calendar.
 * Contribution shape matches https://github.com/yuichkun/github-contribution-graph-example
 * (server-side PAT — same as Next.js process.env.GITHUB_TOKEN on Vercel).
 */
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

type GraphQLBody = {
  data?: {
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
  errors?: { message: string }[];
};

const ENDPOINT = 'https://api.github.com/graphql';

/** Calendar fields match yuichkun example; profile fields added on the same `user`. */
const QUERY = `
query ($userName: String!) {
  user(login: $userName) {
    login
    name
    avatarUrl
    bio
    url
    followers { totalCount }
    following { totalCount }
    repositories(privacy: PUBLIC) {
      totalCount
    }
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
    contributionDays: week.contributionDays.map((day) => ({
      ...day,
      color: '',
      weekday: new Date(`${day.date}T12:00:00Z`).getUTCDay(),
    })),
  }));
}

/** Call from Astro/server only — use `GITHUB_TOKEN`, not PUBLIC_*. */
export async function fetchGitHubHome(
  userName: string,
  token: string,
): Promise<GitHubHomeData> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { userName },
    }),
  });

  const body = (await res.json()) as GraphQLBody;

  if (!res.ok || body.errors?.length) {
    throw new Error(
      body.errors?.map((e) => e.message).join('; ') ??
        `${res.status} ${res.statusText}`,
    );
  }

  const user = body.data?.user;
  if (!user) {
    throw new Error('User not found');
  }

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
