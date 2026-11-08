export interface SitemapEntry {
  path: string;
  lastModified?: Date;
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);

const toUrlElement = (siteUrl: string, entry: SitemapEntry) => {
  const loc = `<loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>`;
  const lastmod = entry.lastModified
    ? `<lastmod>${entry.lastModified.toISOString().slice(0, 10)}</lastmod>`
    : '';

  return `<url>${loc}${lastmod}</url>`;
};

export const buildSitemap = (siteUrl: string, entries: SitemapEntry[]) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => toUrlElement(siteUrl, entry)),
    '</urlset>',
  ].join('\n');
