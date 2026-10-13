import { describe, expect, it } from 'vitest';
import { postEngagement, projectEngagement } from '@/db/schema';
import { resolveEngagementTarget } from '@/services/engagement-targets';
import { NotFoundError } from '@/utils/http-error';

describe('resolveEngagementTarget', () => {
  it('resolves posts to the post tables', () => {
    expect(resolveEngagementTarget({ target: 'posts', slug: 'hello' })).toEqual(
      {
        tables: postEngagement,
        slugKey: 'post_slug',
        slug: 'hello',
      },
    );
  });

  it('resolves projects to the project tables', () => {
    const resolved = resolveEngagementTarget({ target: 'projects', slug: 'x' });

    expect(resolved.tables).toBe(projectEngagement);
    expect(resolved.slugKey).toBe('project_slug');
  });

  it.each([{ target: 'users', slug: 'x' }, { target: 'posts' }])(
    'throws not found for %j',
    (params) => {
      expect(() => resolveEngagementTarget(params)).toThrow(NotFoundError);
    },
  );
});
