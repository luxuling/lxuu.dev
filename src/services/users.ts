import { and, eq } from 'drizzle-orm';
import type { Db } from '@/db/client';
import { oauthAccounts, users } from '@/db/schema';
import type { GithubUser } from '@/services/github';

const GITHUB_PROVIDER = 'github';

const toProfile = (githubUser: GithubUser) => ({
  displayName: githubUser.name ?? githubUser.login,
  avatarUrl: githubUser.avatar_url,
});

const findUserIdByGithubId = async (db: Db, providerUserId: string) => {
  const [account] = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, GITHUB_PROVIDER),
        eq(oauthAccounts.providerUserId, providerUserId),
      ),
    )
    .limit(1);

  return account?.userId;
};

const createGithubUser = async (
  db: Db,
  githubUser: GithubUser,
  providerUserId: string,
) => {
  const [user] = await db
    .insert(users)
    .values(toProfile(githubUser))
    .returning();
  if (!user) throw new Error('user insert returned no row');

  await db.insert(oauthAccounts).values({
    userId: user.id,
    provider: GITHUB_PROVIDER,
    providerUserId,
    providerEmail: githubUser.email,
  });

  return user.id;
};

export const upsertGithubUser = async (db: Db, githubUser: GithubUser) => {
  const providerUserId = String(githubUser.id);
  const existingUserId = await findUserIdByGithubId(db, providerUserId);
  if (!existingUserId) return createGithubUser(db, githubUser, providerUserId);

  await db
    .update(users)
    .set({ ...toProfile(githubUser), updatedAt: new Date() })
    .where(eq(users.id, existingUserId));

  return existingUserId;
};
