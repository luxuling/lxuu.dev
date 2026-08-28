import type {
  CommentItem,
  CommentsPage,
  LikeMeResponse,
  PostStats,
  ProjectStats,
  SessionResponse,
} from './types';

export type {
  CommentItem,
  CommentsPage,
  LikeMeResponse,
  PostStats,
  ProjectStats,
  SessionResponse,
};

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function readJsonOrNull<T>(res: Response): Promise<T | null> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text) as T;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error?.message) return body.error.message;
  } catch {
    /* ignore */
  }
  return res.statusText || `HTTP ${res.status}`;
}

class EngagementApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'EngagementApiError';
    this.status = status;
    this.code = code;
  }
}

async function engagementFetch<T>(
  base: string,
  path: string,
  init?: RequestInit,
): Promise<{ res: Response; data: T | null }> {
  const { headers: _h, ...rest } = init ?? {};
  const headers = new Headers(_h);
  headers.set('Accept', 'application/json');
  const res = await fetch(joinUrl(base, path), {
    ...rest,
    credentials: 'include' as RequestCredentials,
    headers,
  });

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }

  const data = await readJsonOrNull<T>(res);
  return { res, data };
}

function getOrCreateVisitorKey(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '';
  }
  const key = 'lxuu_engagement_visitor';
  let v = window.localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    window.localStorage.setItem(key, v);
  }
  return v;
}

export function normalizeEngagementApiBase(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  return raw.replace(/\/+$/, '');
}

export function buildLoginUrl(base: string, redirectUri: string): string {
  // base may be relative (e.g. "/api"); new URL() needs an absolute base,
  // otherwise it throws "Invalid URL". Anchor to the current origin.
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const u = new URL(joinUrl(base, '/auth/github/start'), origin);
  u.searchParams.set('redirect_uri', redirectUri);
  return u.toString();
}

export async function postView(base: string, postSlug: string): Promise<void> {
  const body: { visitor_key?: string } = {};
  const vk = getOrCreateVisitorKey();
  if (vk) body.visitor_key = vk;

  try {
    await fetch(joinUrl(base, `/posts/${encodeURIComponent(postSlug)}/views`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    /* ignore network errors for view beacon */
  }
}

export async function getStats(
  base: string,
  postSlug: string,
): Promise<PostStats> {
  const { data } = await engagementFetch<PostStats>(
    base,
    `/posts/${encodeURIComponent(postSlug)}/stats`,
  );
  if (!data) {
    throw new EngagementApiError('Empty stats response', 500);
  }
  return data;
}

export async function getSession(base: string): Promise<SessionResponse> {
  const res = await fetch(joinUrl(base, '/auth/session'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (res.status === 401) {
    return { authenticated: false, user: null };
  }
  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
  const data = await readJsonOrNull<SessionResponse>(res);
  return data ?? { authenticated: false, user: null };
}

export async function getLikeMe(
  base: string,
  postSlug: string,
): Promise<LikeMeResponse> {
  const { data } = await engagementFetch<LikeMeResponse>(
    base,
    `/posts/${encodeURIComponent(postSlug)}/likes/me`,
  );
  if (!data) {
    throw new EngagementApiError('Empty like state', 500);
  }
  return data;
}

export async function putLike(base: string, postSlug: string): Promise<void> {
  const res = await fetch(
    joinUrl(base, `/posts/${encodeURIComponent(postSlug)}/likes/me`),
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
    },
  );

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export async function deleteLike(
  base: string,
  postSlug: string,
): Promise<void> {
  const res = await fetch(
    joinUrl(base, `/posts/${encodeURIComponent(postSlug)}/likes/me`),
    {
      method: 'DELETE',
      credentials: 'include' as RequestCredentials,
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export async function getCommentsPage(
  base: string,
  postSlug: string,
  cursor?: string | null,
  limit = 20,
): Promise<CommentsPage> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (cursor) q.set('cursor', cursor);
  const { data } = await engagementFetch<CommentsPage>(
    base,
    `/posts/${encodeURIComponent(postSlug)}/comments?${q}`,
  );
  if (!data) {
    throw new EngagementApiError('Empty comments response', 500);
  }
  return data;
}

export async function postComment(
  base: string,
  postSlug: string,
  body: string,
): Promise<CommentItem> {
  const { data } = await engagementFetch<CommentItem>(
    base,
    `/posts/${encodeURIComponent(postSlug)}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
  );
  if (!data) {
    throw new EngagementApiError('Empty create-comment response', 500);
  }
  return data;
}

export async function patchComment(
  base: string,
  commentId: string,
  body: string,
): Promise<CommentItem> {
  const { data } = await engagementFetch<CommentItem>(
    base,
    `/comments/${encodeURIComponent(commentId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
  );
  if (!data) {
    throw new EngagementApiError('Empty patch-comment response', 500);
  }
  return data;
}

export async function deleteComment(
  base: string,
  commentId: string,
): Promise<void> {
  const res = await fetch(
    joinUrl(base, `/comments/${encodeURIComponent(commentId)}`),
    {
      method: 'DELETE',
      credentials: 'include' as RequestCredentials,
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export async function postProjectView(
  base: string,
  projectSlug: string,
): Promise<void> {
  const body: { visitor_key?: string } = {};
  const vk = getOrCreateVisitorKey();
  if (vk) body.visitor_key = vk;

  try {
    await fetch(
      joinUrl(base, `/projects/${encodeURIComponent(projectSlug)}/views`),
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
  } catch {
    /* ignore network errors for view beacon */
  }
}

export async function getProjectStats(
  base: string,
  projectSlug: string,
): Promise<ProjectStats> {
  const { data } = await engagementFetch<ProjectStats>(
    base,
    `/projects/${encodeURIComponent(projectSlug)}/stats`,
  );
  if (!data) {
    throw new EngagementApiError('Empty stats response', 500);
  }
  return data;
}

export async function getProjectLikeMe(
  base: string,
  projectSlug: string,
): Promise<LikeMeResponse> {
  const { data } = await engagementFetch<LikeMeResponse>(
    base,
    `/projects/${encodeURIComponent(projectSlug)}/likes/me`,
  );
  if (!data) {
    throw new EngagementApiError('Empty like state', 500);
  }
  return data;
}

export async function putProjectLike(
  base: string,
  projectSlug: string,
): Promise<void> {
  const res = await fetch(
    joinUrl(base, `/projects/${encodeURIComponent(projectSlug)}/likes/me`),
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
    },
  );

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export async function deleteProjectLike(
  base: string,
  projectSlug: string,
): Promise<void> {
  const res = await fetch(
    joinUrl(base, `/projects/${encodeURIComponent(projectSlug)}/likes/me`),
    {
      method: 'DELETE',
      credentials: 'include' as RequestCredentials,
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export async function getProjectCommentsPage(
  base: string,
  projectSlug: string,
  cursor?: string | null,
  limit = 20,
): Promise<CommentsPage> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (cursor) q.set('cursor', cursor);
  const { data } = await engagementFetch<CommentsPage>(
    base,
    `/projects/${encodeURIComponent(projectSlug)}/comments?${q}`,
  );
  if (!data) {
    throw new EngagementApiError('Empty comments response', 500);
  }
  return data;
}

export async function postProjectComment(
  base: string,
  projectSlug: string,
  body: string,
): Promise<CommentItem> {
  const { data } = await engagementFetch<CommentItem>(
    base,
    `/projects/${encodeURIComponent(projectSlug)}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
  );
  if (!data) {
    throw new EngagementApiError('Empty create-comment response', 500);
  }
  return data;
}

export async function postLogout(base: string): Promise<void> {
  const res = await fetch(joinUrl(base, '/auth/logout'), {
    method: 'POST',
    credentials: 'include' as RequestCredentials,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}
