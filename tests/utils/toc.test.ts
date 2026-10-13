import { describe, expect, it } from 'vitest';
import { headingsToTocItems } from '@/utils/toc';

describe('headingsToTocItems', () => {
  it('keeps only h2 and h3 headings', () => {
    const items = headingsToTocItems([
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'stack', text: 'Stack' },
      { depth: 3, slug: 'astro', text: 'Astro' },
      { depth: 4, slug: 'detail', text: 'Detail' },
    ]);

    expect(items).toEqual([
      { id: 'stack', text: 'Stack', level: 2 },
      { id: 'astro', text: 'Astro', level: 3 },
    ]);
  });
});
