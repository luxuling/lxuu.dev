export const prerender = false;
import type { APIRoute } from 'astro';
import { createGithubProvider, resolveSiteUrl } from '@lib/auth/oauth';
import { users, oauthAccounts } from '@lib/db/schema';
import { createSession, makeSessionCookie } from '@lib/auth/session';
import { SESSION_SECRET } from '@lib/env';
import { eq, and } from 'drizzle-orm';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

function parseCookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));
  return match?.[1] ?? null;
}

export const GET: APIRoute = async ({ url, request, locals }) => {
  const cookieHeader = request.headers.get('cookie');
  const stateParam = url.searchParams.get('state');
  const storedState = parseCookieValue(cookieHeader, 'oauth_state');
  const returnTo = decodeURIComponent(
    parseCookieValue(cookieHeader, 'oauth_return') ?? '/',
  );

  if (!stateParam || !storedState || stateParam !== storedState) {
    return new Response('Invalid state', { status: 400 });
  }

  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });

  const siteUrl = resolveSiteUrl(url);
  const github = createGithubProvider(siteUrl);

  let accessToken: string;
  try {
    const tokens = await github.validateAuthorizationCode(code);
    accessToken = tokens.accessToken();
  } catch {
    return new Response('OAuth exchange failed', { status: 400 });
  }

  const ghRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!ghRes.ok)
    return new Response('Failed to fetch GitHub user', { status: 502 });
  const ghUser = (await ghRes.json()) as GitHubUser;

  const { db } = locals;

  const existingOAuth = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, 'github'),
        eq(oauthAccounts.providerUserId, String(ghUser.id)),
      ),
    )
    .limit(1);

  let userId: string;

  if (existingOAuth[0]) {
    userId = existingOAuth[0].userId;
    await db
      .update(users)
      .set({
        displayName: ghUser.name ?? ghUser.login,
        avatarUrl: ghUser.avatar_url,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        displayName: ghUser.name ?? ghUser.login,
        avatarUrl: ghUser.avatar_url,
      })
      .returning();

    if (!newUser) return new Response('Failed to create user', { status: 500 });
    userId = newUser.id;

    await db.insert(oauthAccounts).values({
      userId,
      provider: 'github',
      providerUserId: String(ghUser.id),
      providerEmail: ghUser.email,
    });
  }

  const token = await createSession(db, userId, SESSION_SECRET ?? '', request);
  const sessionMaxAge = 30 * 24 * 60 * 60;

  return new Response(null, {
    status: 302,
    headers: {
      Location: returnTo.startsWith('/') ? returnTo : '/',
      'Set-Cookie': makeSessionCookie(token, sessionMaxAge),
    },
  });
};
