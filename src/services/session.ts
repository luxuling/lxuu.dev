import { and, eq, gt } from 'drizzle-orm';
import { sessions, users } from '@/db/schema';
import { hmacHex, randomHex } from '@/utils/hmac';
import { UnauthorizedError } from '@/utils/http-error';
import { getClientIp, getCookie } from '@/utils/request';

export interface SessionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const COOKIE_ATTRIBUTES = 'HttpOnly; Secure; SameSite=Lax; Path=/';

export const serializeUser = (user: SessionUser) => ({
  id: user.id,
  display_name: user.displayName,
  avatar_url: user.avatarUrl,
});

export const createSession = async (
  { db, sessionSecret }: App.Locals,
  userId: string,
  request: Request,
) => {
  const token = randomHex(32);
  const tokenHash = await hmacHex(sessionSecret, token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
    userAgent: request.headers.get('user-agent'),
    ipAddress: getClientIp(request),
  });

  return token;
};

export const getSessionUser = async (
  { db, sessionSecret }: App.Locals,
  request: Request,
): Promise<SessionUser | null> => {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = await hmacHex(sessionSecret, token);
  const rows = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const requireSessionUser = async (
  locals: App.Locals,
  request: Request,
) => {
  const user = await getSessionUser(locals, request);
  if (!user) throw new UnauthorizedError();

  return user;
};

export const invalidateSession = async (
  { db, sessionSecret }: App.Locals,
  request: Request,
) => {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return;

  const tokenHash = await hmacHex(sessionSecret, token);

  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
};

export const makeSessionCookie = (token: string) =>
  `${SESSION_COOKIE}=${token}; ${COOKIE_ATTRIBUTES}; Max-Age=${SESSION_MAX_AGE_SECONDS}`;

export const makeExpiredSessionCookie = () =>
  `${SESSION_COOKIE}=; ${COOKIE_ATTRIBUTES}; Max-Age=0`;
