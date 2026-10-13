import type { ProjectStatus } from '@/types/content';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: '[active]',
  wip: '[wip]',
  archived: '[archived]',
};

export const STATUS_COLOR: Record<ProjectStatus, string> = {
  active: 'text-foreground',
  wip: 'text-muted-foreground',
  archived: 'text-subtle',
};
