import type { CollectionEntry } from 'astro:content';
import type { PostListItem, ProjectListItem } from '@/types/content';
import { formatMonthYear } from '@/utils/format-date';

type PostEntry = Pick<CollectionEntry<'posts'>, 'id' | 'data'>;
type ProjectEntry = Pick<CollectionEntry<'projects'>, 'id' | 'data'>;

export const sortByNewest = <Entry extends PostEntry | ProjectEntry>(
  entries: Entry[],
) => entries.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const toPostListItem = (entry: PostEntry): PostListItem => ({
  slug: entry.id,
  title: entry.data.title,
  description: entry.data.description,
  tags: entry.data.tags,
  dateLabel: formatMonthYear(entry.data.date),
  highlight: entry.data.highlight,
});

export const toProjectListItem = (entry: ProjectEntry): ProjectListItem => ({
  slug: entry.id,
  title: entry.data.title,
  description: entry.data.description,
  tags: entry.data.tags,
  dateLabel: formatMonthYear(entry.data.date),
  highlight: entry.data.highlight,
  status: entry.data.status,
  hasLiveLink: Boolean(entry.data.links?.live),
  hasGithubLink: Boolean(entry.data.links?.github),
});
