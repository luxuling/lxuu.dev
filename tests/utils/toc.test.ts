import { describe, expect, it } from 'vitest';
import { headingsToTocItems } from '@/utils/toc';

describe('headingsToTocItems', () => {
  it('keeps every heading level and indents from the shallowest one', () => {
    const items = headingsToTocItems([
      { depth: 1, slug: 'problem', text: 'Problem' },
      { depth: 2, slug: 'stack', text: 'Stack' },
      { depth: 3, slug: 'astro', text: 'Astro' },
      { depth: 6, slug: 'detail', text: 'Detail' },
    ]);

    expect(items).toEqual([
      { id: 'problem', text: 'Problem', indent: 0 },
      { id: 'stack', text: 'Stack', indent: 1 },
      { id: 'astro', text: 'Astro', indent: 2 },
      { id: 'detail', text: 'Detail', indent: 5 },
    ]);
  });

  it('starts the indent at zero when the content has no h1', () => {
    const items = headingsToTocItems([
      { depth: 2, slug: 'stack', text: 'Stack' },
      { depth: 3, slug: 'astro', text: 'Astro' },
    ]);

    expect(items).toEqual([
      { id: 'stack', text: 'Stack', indent: 0 },
      { id: 'astro', text: 'Astro', indent: 1 },
    ]);
  });
});
