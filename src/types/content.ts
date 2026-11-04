import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

export interface PostListItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  dateLabel: string;
}

export interface ProjectListItem extends PostListItem {
  status: ProjectStatus;
  hasLiveLink: boolean;
  hasGithubLink: boolean;
}
