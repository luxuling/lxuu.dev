import { describe, expect, it } from 'vitest';
import { buildSitemap } from '@/utils/sitemap';

describe('buildSitemap', () => {
  it('lists each path as an absolute url with an optional lastmod day', () => {
    const xml = buildSitemap('https://www.lxuu.dev', [
      { path: '/' },
      { path: '/posts/hello', lastModified: new Date('2026-11-01T15:30:00Z') },
    ]);

    expect(xml).toContain('<url><loc>https://www.lxuu.dev/</loc></url>');
    expect(xml).toContain(
      '<url><loc>https://www.lxuu.dev/posts/hello</loc><lastmod>2026-11-01</lastmod></url>',
    );
  });

  it('escapes characters that would break the xml', () => {
    const xml = buildSitemap('https://www.lxuu.dev', [{ path: '/a?b=1&c=2' }]);

    expect(xml).toContain('<loc>https://www.lxuu.dev/a?b=1&amp;c=2</loc>');
  });
});
