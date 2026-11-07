import type { MarkdownHeading } from 'astro';

export interface TocItem {
  id: string;
  text: string;
  indent: number;
}

export const headingsToTocItems = (headings: MarkdownHeading[]): TocItem[] => {
  const shallowestDepth = Math.min(...headings.map((heading) => heading.depth));

  return headings.map((heading) => ({
    id: heading.slug,
    text: heading.text,
    indent: heading.depth - shallowestDepth,
  }));
};
