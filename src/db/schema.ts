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

interface EngagementTableNames {
  slugColumn: string;
  counters: string;
  likes: string;
  likesUserIndex: string;
  likesSlugIndex: string;
  comments: string;
  commentsIndex: string;
  viewEvents: string;
  viewEventsIndex: string;
}

const createEngagementTables = (names: EngagementTableNames) => {
  const counters = pgTable(names.counters, {
    slug: text(names.slugColumn).primaryKey(),
    viewCount: bigint('view_count', { mode: 'number' }).default(0).notNull(),
    likeCount: bigint('like_count', { mode: 'number' }).default(0).notNull(),
    commentCount: bigint('comment_count', { mode: 'number' })
      .default(0)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  });

  const likes = pgTable(
    names.likes,
    {
      id: uuid('id').primaryKey().defaultRandom(),
      userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
      slug: text(names.slugColumn)
        .notNull()
        .references(() => counters.slug, { onDelete: 'cascade' }),
      createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    },
    (t) => [
      uniqueIndex(names.likesUserIndex).on(t.userId, t.slug),
      index(names.likesSlugIndex).on(t.slug),
    ],
  );

  const comments = pgTable(
    names.comments,
    {
      id: uuid('id').primaryKey().defaultRandom(),
      slug: text(names.slugColumn)
        .notNull()
        .references(() => counters.slug, { onDelete: 'cascade' }),
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
    (t) => [index(names.commentsIndex).on(t.slug, t.createdAt)],
  );

  const viewEvents = pgTable(
    names.viewEvents,
    {
      id: uuid('id').primaryKey().defaultRandom(),
      slug: text(names.slugColumn)
        .notNull()
        .references(() => counters.slug, { onDelete: 'cascade' }),
      occurredAt: timestamp('occurred_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
      visitorHash: text('visitor_hash'),
    },
    (t) => [index(names.viewEventsIndex).on(t.slug, t.occurredAt)],
  );

  return { counters, likes, comments, viewEvents };
};

export type EngagementTables = ReturnType<typeof createEngagementTables>;

export const postEngagement = createEngagementTables({
  slugColumn: 'post_slug',
  counters: 'post_counters',
  likes: 'likes',
  likesUserIndex: 'likes_user_post_idx',
  likesSlugIndex: 'likes_post_slug_idx',
  comments: 'comments',
  commentsIndex: 'comments_post_slug_created_idx',
  viewEvents: 'view_events',
  viewEventsIndex: 'view_events_post_slug_occurred_idx',
});

export const projectEngagement = createEngagementTables({
  slugColumn: 'project_slug',
  counters: 'project_counters',
  likes: 'project_likes',
  likesUserIndex: 'project_likes_user_project_idx',
  likesSlugIndex: 'project_likes_project_slug_idx',
  comments: 'project_comments',
  commentsIndex: 'project_comments_slug_created_idx',
  viewEvents: 'project_view_events',
  viewEventsIndex: 'project_view_events_slug_occurred_idx',
});

// NOTE: drizzle-kit only discovers tables that are top-level exports
export const {
  counters: postCounters,
  likes: postLikes,
  comments: postComments,
  viewEvents: postViewEvents,
} = postEngagement;

export const {
  counters: projectCounters,
  likes: projectLikes,
  comments: projectComments,
  viewEvents: projectViewEvents,
} = projectEngagement;
