import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGithubHome,
  fetchGithubStarCount,
  fetchGithubUser,
} from '@/services/github';
import { HttpError } from '@/utils/http-error';

const credentials = { username: 'luxuling', token: 'token' };

const stubFetch = (body: unknown, status = 200) => {
  const fetchMock = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

const homeResponse = {
  data: {
    user: {
      login: 'luxuling',
      name: null,
      avatarUrl: 'https://avatars.example/u/1',
      bio: 'bio',
      url: 'https://github.com/luxuling',
      followers: { totalCount: 3 },
      following: { totalCount: 4 },
      repositories: { totalCount: 5 },
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: 7,
          weeks: [
            {
              contributionDays: [{ date: '2026-10-07', contributionCount: 2 }],
            },
          ],
        },
      },
    },
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchGithubHome', () => {
  it('flattens the profile and adds the weekday to each day', async () => {
    stubFetch(homeResponse);

    await expect(fetchGithubHome(credentials)).resolves.toEqual({
      login: 'luxuling',
      name: null,
      avatarUrl: 'https://avatars.example/u/1',
      bio: 'bio',
      profileUrl: 'https://github.com/luxuling',
      followers: 3,
      following: 4,
      publicRepos: 5,
      totalContributions: 7,
      weeks: [
        {
          contributionDays: [
            { date: '2026-10-07', contributionCount: 2, weekday: 3 },
          ],
        },
      ],
    });
  });

  it('sends a user agent and the bearer token', async () => {
    const fetchMock = stubFetch(homeResponse);

    await fetchGithubHome(credentials);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'lxuu.dev',
          Authorization: 'Bearer token',
        }),
      }),
    );
  });

  it('throws the graphql error messages', async () => {
    stubFetch({ errors: [{ message: 'first' }, { message: 'second' }] });

    await expect(fetchGithubHome(credentials)).rejects.toThrow('first; second');
  });

  it('throws the api message on a failed request', async () => {
    stubFetch({ message: 'Bad credentials' }, 401);

    await expect(fetchGithubHome(credentials)).rejects.toThrow(
      'Bad credentials',
    );
  });
});

describe('fetchGithubUser', () => {
  it('throws a bad gateway error when github rejects the token', async () => {
    stubFetch({ message: 'Bad credentials' }, 401);

    await expect(fetchGithubUser('token')).rejects.toSatisfy(
      (error) => error instanceof HttpError && error.status === 502,
    );
  });
});

describe('fetchGithubStarCount', () => {
  it('returns the star count for a github repository', async () => {
    const fetchMock = stubFetch({ stargazers_count: 42 });

    await expect(
      fetchGithubStarCount('https://github.com/luxuling/lxuu.dev'),
    ).resolves.toBe(42);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/luxuling/lxuu.dev',
      expect.anything(),
    );
  });

  it.each(['https://gitlab.com/a/b', 'https://github.com/only-owner', 'nope'])(
    'returns null without a request for %s',
    async (repoUrl) => {
      const fetchMock = stubFetch({});

      await expect(fetchGithubStarCount(repoUrl)).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('returns null when github does not return the repository', async () => {
    stubFetch({ message: 'Not Found' }, 404);

    await expect(
      fetchGithubStarCount('https://github.com/luxuling/private'),
    ).resolves.toBeNull();
  });
});
