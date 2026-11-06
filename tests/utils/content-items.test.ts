import { describe, expect, it } from 'vitest';
import {
  logoInitials,
  sortEntries,
  toPostListItem,
  toProjectListItem,
} from '@/utils/content-items';

const post = (id: string, date: string, order?: number | null) => ({
  id,
  data: {
    title: `Title ${id}`,
    description: 'Description',
    tags: ['astro'],
    status: 'posted' as const,
    date: new Date(date),
    highlight: false,
    order,
  },
});

describe('sortEntries', () => {
  it('orders entries from newest to oldest without mutating the input', () => {
    const entries = [post('old', '2025-01-01'), post('new', '2026-01-01')];

    expect(sortEntries(entries).map((entry) => entry.id)).toEqual([
      'new',
      'old',
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(['old', 'new']);
  });

  it('puts ordered entries first, then the rest by newest date', () => {
    const sorted = sortEntries([
      post('old', '2024-01-01'),
      post('second', '2020-01-01', 2),
      post('new', '2026-01-01', null),
      post('first', '2019-01-01', 1),
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual([
      'first',
      'second',
      'new',
      'old',
    ]);
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
      thumbnail: null,
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

describe('logoInitials', () => {
  it('uses the first two capitals of a camel-cased title', () => {
    expect(logoInitials('BlastJok')).toBe('bj');
  });

  it('falls back to the first two letters', () => {
    expect(logoInitials('lxuu-dev')).toBe('lx');
    expect(logoInitials('Dotfiles')).toBe('do');
  });
});
