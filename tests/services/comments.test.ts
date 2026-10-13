import { describe, expect, it } from 'vitest';
import {
  commentBodySchema,
  commentsQuerySchema,
  serializeComment,
} from '@/services/comments';
import { encodeCursor } from '@/utils/cursor';

describe('commentBodySchema', () => {
  it('trims the body', () => {
    expect(commentBodySchema.parse({ body: '  hi  ' })).toEqual({ body: 'hi' });
  });

  it.each([{ body: '   ' }, { body: 'x'.repeat(4001) }, { body: 42 }, {}])(
    'rejects %j',
    (input) => {
      const result = commentBodySchema.safeParse(input);

      expect(result.error?.issues.map((issue) => issue.message)).toEqual([
        'Body must be 1–4000 chars',
      ]);
    },
  );
});

describe('commentsQuerySchema', () => {
  it('defaults the limit and leaves the cursor unset', () => {
    expect(commentsQuerySchema.parse({})).toEqual({ limit: 20 });
  });

  it('coerces the limit and decodes the cursor to a date', () => {
    const date = new Date('2026-05-13T10:15:30.000Z');
    const query = commentsQuerySchema.parse({
      limit: '5',
      cursor: encodeCursor(date),
    });

    expect(query).toEqual({ limit: 5, cursor: date });
  });

  it.each([{ limit: '0' }, { limit: '101' }, { limit: 'abc' }])(
    'rejects limit %j',
    (input) => {
      expect(commentsQuerySchema.safeParse(input).success).toBe(false);
    },
  );

  it.each(['not base64!', btoa('not a date')])(
    'rejects cursor %j',
    (cursor) => {
      expect(commentsQuerySchema.safeParse({ cursor }).success).toBe(false);
    },
  );
});

describe('serializeComment', () => {
  it('uses the slug key of the target and snake_case fields', () => {
    const json = serializeComment({
      comment: {
        id: 'c1',
        slug: 'lxuu-dev',
        body: 'Nice',
        createdAt: new Date('2026-05-13T10:15:30.000Z'),
        editedAt: null,
      },
      author: { id: 'u1', displayName: 'Ada', avatarUrl: null },
      slugKey: 'project_slug',
      mine: true,
    });

    expect(json).toEqual({
      id: 'c1',
      project_slug: 'lxuu-dev',
      body: 'Nice',
      created_at: '2026-05-13T10:15:30.000Z',
      edited_at: null,
      author: { id: 'u1', display_name: 'Ada', avatar_url: null },
      mine: true,
    });
  });
});
