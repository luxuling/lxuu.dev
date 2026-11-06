import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

export interface PostListItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  dateLabel: string;
  thumbnail: string | null;
}

export interface ProjectListItem extends PostListItem {
  status: ProjectStatus;
  logo: string | null;
  hasLiveLink: boolean;
  hasGithubLink: boolean;
}

export interface BuildingItem {
  slug: string;
  title: string;
  description: string;
  live: string | null;
  github: string | null;
}
