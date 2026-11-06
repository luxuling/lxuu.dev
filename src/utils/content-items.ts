import type { CollectionEntry } from 'astro:content';
import type {
  BuildingItem,
  PostListItem,
  ProjectListItem,
} from '@/types/content';
import { formatMonthYear } from '@/utils/format-date';

type PostEntry = Pick<CollectionEntry<'posts'>, 'id' | 'data'>;
type ProjectEntry = Pick<CollectionEntry<'projects'>, 'id' | 'data'>;

export const sortEntries = <Entry extends PostEntry | ProjectEntry>(
  entries: Entry[],
) =>
  entries.toSorted((a, b) => {
    const aOrder = a.data.order ?? Infinity;
    const bOrder = b.data.order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;

    return b.data.date.getTime() - a.data.date.getTime();
  });

export const toPostListItem = (entry: PostEntry): PostListItem => ({
  slug: entry.id,
  title: entry.data.title,
  description: entry.data.description,
  tags: entry.data.tags,
  dateLabel: formatMonthYear(entry.data.date),
  thumbnail: entry.data.thumbnail ?? null,
});

export const toProjectListItem = (entry: ProjectEntry): ProjectListItem => ({
  slug: entry.id,
  title: entry.data.title,
  description: entry.data.description,
  tags: entry.data.tags,
  dateLabel: formatMonthYear(entry.data.date),
  thumbnail: entry.data.thumbnail ?? null,
  status: entry.data.status,
  logo: entry.data.logo ?? null,
  hasLiveLink: Boolean(entry.data.links?.live),
  hasGithubLink: Boolean(entry.data.links?.github),
});

export const toBuildingItem = (entry: ProjectEntry): BuildingItem => ({
  slug: entry.id,
  title: entry.data.title,
  description: entry.data.description,
  live: entry.data.links?.live ?? null,
  github: entry.data.links?.github ?? null,
});

export const logoInitials = (title: string) => {
  const capitals = title.match(/[A-Z]/g);
  if (capitals && capitals.length >= 2)
    return capitals.slice(0, 2).join('').toLowerCase();

  return title.slice(0, 2).toLowerCase();
};
