import {
  pgTable,
  uuid,
  text,
  bigint,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    providerEmail: text('provider_email'),
    linkedAt: timestamp('linked_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex('oauth_accounts_provider_user_idx').on(
      t.provider,
      t.providerUserId,
    ),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
  },
  (t) => [index('sessions_token_hash_idx').on(t.tokenHash)],
);

export const postCounters = pgTable('post_counters', {
  postSlug: text('post_slug').primaryKey(),
  viewCount: bigint('view_count', { mode: 'number' }).default(0).notNull(),
  likeCount: bigint('like_count', { mode: 'number' }).default(0).notNull(),
  commentCount: bigint('comment_count', { mode: 'number' })
    .default(0)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postSlug: text('post_slug')
      .notNull()
      .references(() => postCounters.postSlug, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex('likes_user_post_idx').on(t.userId, t.postSlug),
    index('likes_post_slug_idx').on(t.postSlug),
  ],
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postSlug: text('post_slug')
      .notNull()
      .references(() => postCounters.postSlug, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    editedAt: timestamp('edited_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [index('comments_post_slug_created_idx').on(t.postSlug, t.createdAt)],
);

export const viewEvents = pgTable(
  'view_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postSlug: text('post_slug')
      .notNull()
      .references(() => postCounters.postSlug, { onDelete: 'cascade' }),
    occurredAt: timestamp('occurred_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    visitorHash: text('visitor_hash'),
  },
  (t) => [
    index('view_events_post_slug_occurred_idx').on(t.postSlug, t.occurredAt),
  ],
);
