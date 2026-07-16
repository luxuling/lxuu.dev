import { eq, gt, and } from 'drizzle-orm';
import type { Db } from '@lib/db/client';
import { sessions, users } from '@lib/db/schema';

export interface SessionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

const SESSION_COOKIE = 'session';
const SESSION_EXPIRY_DAYS = 30;

async function hashToken(token: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSession(
  db: Db,
  userId: string,
  secret: string,
  request: Request,
): Promise<string> {
  const token = generateToken();
  const tokenHash = await hashToken(token, secret);
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
    userAgent: request.headers.get('user-agent'),
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip'),
  });

  return token;
}

export async function getSessionUser(
  db: Db,
  cookieHeader: string | null,
  secret: string,
): Promise<SessionUser | null> {
  if (!cookieHeader) return null;

  const token = parseCookieValue(cookieHeader, SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = await hashToken(token, secret);
  const now = new Date();

  const rows = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  return rows[0] ?? null;
}

export async function invalidateSession(
  db: Db,
  cookieHeader: string | null,
  secret: string,
): Promise<void> {
  if (!cookieHeader) return;
  const token = parseCookieValue(cookieHeader, SESSION_COOKIE);
  if (!token) return;
  const tokenHash = await hashToken(token, secret);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export function makeSessionCookie(token: string, maxAge: number): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function makeExpiredSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseCookieValue(header: string, name: string): string | null {
  const match = header.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));
  return match?.[1] ?? null;
}
