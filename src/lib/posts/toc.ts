export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface MarkdownHeading {
  depth: number;
  slug: string;
  text: string;
}

export function headingsToTocItems(headings: MarkdownHeading[]): TocItem[] {
  return headings
    .filter((h) => h.depth >= 2 && h.depth <= 3)
    .map((h) => ({ id: h.slug, text: h.text, level: h.depth }));
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(parseInt(code, 10)),
    );
}

function slugify(raw: string): string {
  return decodeEntities(raw)
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Injects `id` attributes on every `h2`/`h3` in the HTML string and
 * returns both the modified HTML and the ordered list of heading items.
 */
export function extractAndInjectHeadings(html: string): {
  html: string;
  items: TocItem[];
} {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();

  const processed = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const level = parseInt(tag[1]!, 10);
      const text = decodeEntities(inner.replace(/<[^>]+>/g, '').trim());
      let id = slugify(text);

      const count = seen.get(id) ?? 0;
      if (count > 0) id = `${id}-${count}`;
      seen.set(id, count + 1);

      items.push({ id, text, level });
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html: processed, items };
}
