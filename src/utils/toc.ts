import type { MarkdownHeading } from 'astro';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const headingsToTocItems = (headings: MarkdownHeading[]): TocItem[] =>
  headings
    .filter((heading) => heading.depth >= 2 && heading.depth <= 3)
    .map((heading) => ({
      id: heading.slug,
      text: heading.text,
      level: heading.depth,
    }));
