import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildLoginUrl,
  EngagementApiError,
  getCommentsPage,
  getSessionUser,
  getStats,
  setLiked,
} from '@/services/engagement-api';

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getStats', () => {
  it('requests the target stats and returns the counts', async () => {
    const fetchMock = stubFetch(
      Response.json({
        project_slug: 'a b',
        view_count: 3,
        like_count: 2,
        comment_count: 1,
      }),
    );

    await expect(getStats('projects', 'a b')).resolves.toEqual({
      view_count: 3,
      like_count: 2,
      comment_count: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/projects/a%20b/stats',
      undefined,
    );
  });

  it('throws the message from the error envelope', async () => {
    stubFetch(
      Response.json(
        { error: { code: 'DATABASE_UNAVAILABLE', message: 'No database' } },
        { status: 503 },
      ),
    );

    await expect(getStats('posts', 'a')).rejects.toSatisfy(
      (error) =>
        error instanceof EngagementApiError &&
        error.status === 503 &&
        error.message === 'No database',
    );
  });

  it('falls back to the status text for a non-json error', async () => {
    stubFetch(new Response('nope', { status: 403, statusText: 'Forbidden' }));

    await expect(getStats('posts', 'a')).rejects.toThrow('Forbidden');
  });

  it('rejects a response that does not match the schema', async () => {
    stubFetch(Response.json({ view_count: 'many' }));

    await expect(getStats('posts', 'a')).rejects.toThrow();
  });
});

describe('getSessionUser', () => {
  it('returns null for an anonymous session', async () => {
    stubFetch(Response.json({ authenticated: false, user: null }));

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it('returns the signed-in user', async () => {
    const user = { id: 'u1', display_name: 'Ada', avatar_url: null };
    stubFetch(Response.json({ authenticated: true, user }));

    await expect(getSessionUser()).resolves.toEqual(user);
  });
});

describe('setLiked', () => {
  it.each([
    [true, 'PUT'],
    [false, 'DELETE'],
  ])('liked=%s sends %s', async (liked, method) => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));

    await setLiked('posts', 'a', liked);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts/a/likes/me',
      expect.objectContaining({ method }),
    );
  });
});

describe('getCommentsPage', () => {
  it('passes the cursor and parses the page', async () => {
    const page = { items: [], next_cursor: null };
    const fetchMock = stubFetch(Response.json(page));

    await expect(getCommentsPage('posts', 'a', 'abc=')).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts/a/comments?limit=20&cursor=abc%3D',
      undefined,
    );
  });
});

describe('buildLoginUrl', () => {
  it('encodes the return path', () => {
    expect(buildLoginUrl('/posts/a?x=1')).toBe(
      '/api/auth/github/start?redirect_uri=%2Fposts%2Fa%3Fx%3D1',
    );
  });
});
