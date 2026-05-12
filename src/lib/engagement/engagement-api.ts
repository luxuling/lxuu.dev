/** Browser client for the engagement API — see `docs/post-engagement-api-contract.md`. */

export interface PostStats {
  post_slug: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface SessionUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

export interface MeResponse {
  user: SessionUser;
}

export interface LikeMeResponse {
  liked: boolean;
}

export interface LikeMutationBody {
  post_slug: string;
  like_count: number;
  liked: boolean;
}

export interface CommentAuthor {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface CommentItem {
  id: string;
  post_slug: string;
  body: string;
  created_at: string;
  edited_at: string | null;
  author: CommentAuthor;
  mine: boolean;
}

export interface CommentsPage {
  items: CommentItem[];
  next_cursor: string | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function normalizeEngagementApiBase(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  return raw.replace(/\/+$/, '');
}

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
    const body = (await res.json()) as ApiErrorBody;
    if (body?.error?.message) return body.error.message;
  } catch {
    /* ignore */
  }
  return res.statusText || `HTTP ${res.status}`;
}

export class EngagementApiError extends Error {
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
  const res = await fetch(joinUrl(base, path), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }

  const data = await readJsonOrNull<T>(res);
  return { res, data };
}

export function getOrCreateVisitorKey(): string {
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
      credentials: 'include',
      Accept: 'application/json',
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
      credentials: 'include',
      Accept: 'application/json',
    },
  );

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export async function postLogout(base: string): Promise<void> {
  const res = await fetch(joinUrl(base, '/auth/logout'), {
    method: 'POST',
    credentials: 'include',
    Accept: 'application/json',
  });

  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }
}

export function buildOAuthStartUrl(
  base: string,
  provider: 'github' | 'google',
  redirectUri: string,
): string {
  const u = new URL(joinUrl(base, `/auth/${provider}/start`));
  u.searchParams.set('redirect_uri', redirectUri);
  return u.toString();
}
