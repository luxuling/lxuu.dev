import { describe, expect, it } from 'vitest';
import {
  sortByNewest,
  toPostListItem,
  toProjectListItem,
} from '@/utils/content-items';

const post = (id: string, date: string) => ({
  id,
  data: {
    title: `Title ${id}`,
    description: 'Description',
    tags: ['astro'],
    status: 'posted' as const,
    date: new Date(date),
    highlight: false,
  },
});

describe('sortByNewest', () => {
  it('orders entries from newest to oldest without mutating the input', () => {
    const entries = [post('old', '2025-01-01'), post('new', '2026-01-01')];

    expect(sortByNewest(entries).map((entry) => entry.id)).toEqual([
      'new',
      'old',
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(['old', 'new']);
  });
});

describe('toPostListItem', () => {
  it('maps an entry to a list item with a month label', () => {
    expect(toPostListItem(post('hello', '2026-07-16'))).toEqual({
      slug: 'hello',
      title: 'Title hello',
      description: 'Description',
      tags: ['astro'],
      dateLabel: 'Jul 2026',
      highlight: false,
    });
  });
});

describe('toProjectListItem', () => {
  it('flags which links a project has', () => {
    const item = toProjectListItem({
      id: 'lxuu-dev',
      data: {
        title: 'lxuu.dev',
        description: 'Portfolio',
        tags: [],
        status: 'active',
        date: new Date('2026-07-16'),
        highlight: true,
        links: { github: 'https://github.com/luxuling/lxuu.dev', live: null },
      },
    });

    expect(item).toMatchObject({
      status: 'active',
      hasGithubLink: true,
      hasLiveLink: false,
    });
  });
});
