import { z } from 'astro/zod';
import type { EngagementTarget } from '@/services/engagement-targets';

const API_BASE = '/api';
const VISITOR_KEY_STORAGE = 'lxuu_engagement_visitor';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const apiErrorSchema = z.object({
  error: z.object({ message: z.string() }),
});

const statsSchema = z.object({
  view_count: z.number(),
  like_count: z.number(),
  comment_count: z.number(),
});

const userSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  avatar_url: z.string().nullable(),
});

const sessionSchema = z.object({ user: userSchema.nullable() });

const likeStateSchema = z.object({ liked: z.boolean() });

const commentSchema = z.object({
  id: z.string(),
  body: z.string(),
  created_at: z.string(),
  edited_at: z.string().nullable(),
  author: userSchema,
  mine: z.boolean(),
});

const commentsPageSchema = z.object({
  items: z.array(commentSchema),
  next_cursor: z.string().nullable(),
});

export type EngagementStats = z.infer<typeof statsSchema>;
export type EngagementUser = z.infer<typeof userSchema>;
export type EngagementComment = z.infer<typeof commentSchema>;

export class EngagementApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = 'EngagementApiError';
    this.status = status;
  }
}

const readErrorMessage = async (res: Response) => {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!isJson) return res.statusText || `HTTP ${res.status}`;

  return apiErrorSchema.parse(await res.json()).error.message;
};

const request = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new EngagementApiError(await readErrorMessage(res), res.status);
  }

  return res;
};

const targetPath = (target: EngagementTarget, slug: string, resource: string) =>
  `/${target}/${encodeURIComponent(slug)}/${resource}`;

const getVisitorKey = () => {
  const stored = localStorage.getItem(VISITOR_KEY_STORAGE);
  if (stored) return stored;

  const created = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY_STORAGE, created);

  return created;
};

export const buildLoginUrl = (returnPath: string) =>
  `${API_BASE}/auth/github/start?redirect_uri=${encodeURIComponent(returnPath)}`;

export const sendView = (target: EngagementTarget, slug: string) =>
  navigator.sendBeacon(
    `${API_BASE}${targetPath(target, slug, 'views')}`,
    new Blob([JSON.stringify({ visitor_key: getVisitorKey() })], {
      type: 'application/json',
    }),
  );

export const getStats = async (target: EngagementTarget, slug: string) => {
  const res = await request(targetPath(target, slug, 'stats'));

  return statsSchema.parse(await res.json());
};

export const getSessionUser = async () => {
  const res = await request('/auth/session');

  return sessionSchema.parse(await res.json()).user;
};

export const getLiked = async (target: EngagementTarget, slug: string) => {
  const res = await request(targetPath(target, slug, 'likes/me'));

  return likeStateSchema.parse(await res.json()).liked;
};

export const setLiked = (
  target: EngagementTarget,
  slug: string,
  liked: boolean,
) =>
  request(targetPath(target, slug, 'likes/me'), {
    method: liked ? 'PUT' : 'DELETE',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
  });

export const getCommentsPage = async (
  target: EngagementTarget,
  slug: string,
  cursor: string | null,
) => {
  const query = new URLSearchParams({ limit: '20' });
  if (cursor) query.set('cursor', cursor);

  const res = await request(targetPath(target, slug, `comments?${query}`));

  return commentsPageSchema.parse(await res.json());
};

export const createComment = async (
  target: EngagementTarget,
  slug: string,
  body: string,
) => {
  const res = await request(targetPath(target, slug, 'comments'), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ body }),
  });

  return commentSchema.parse(await res.json());
};

export const updateComment = async (commentId: string, body: string) => {
  const res = await request(`/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ body }),
  });

  return commentSchema.parse(await res.json());
};

export const deleteComment = (commentId: string) =>
  request(`/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });

export const logout = () => request('/auth/logout', { method: 'POST' });
