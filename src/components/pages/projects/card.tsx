import { useEffect, useState } from 'react';
import {
  getProjectStats,
  type ProjectStats,
} from '@lib/engagement/engagement-api';

export interface ProjectListItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  status: 'active' | 'wip' | 'archived';
  date: string;
  links?: {
    github?: string;
    live?: string;
  };
  githubStars?: number;
  highlight?: boolean;
}

export const STATUS_LABEL: Record<ProjectListItem['status'], string> = {
  active: '[active]',
  wip: '[wip]',
  archived: '[archived]',
};

export const STATUS_COLOR: Record<ProjectListItem['status'], string> = {
  active: 'text-foreground',
  wip: 'text-muted-foreground',
  archived: 'text-subtle',
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDisplayDate(dateStr: string) {
  const d = new Date(`${dateStr}-01`);
  if (isNaN(d.getTime())) return dateStr;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function ProjectStatus({ status }: { status: ProjectListItem['status'] }) {
  return (
    <span className={`font-mono text-xs ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function ProjectMeta({
  date,
  status,
  stats,
}: {
  date: string;
  status: ProjectListItem['status'];
  stats: ProjectStats | null;
}) {
  return (
    <div className='flex shrink-0 flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs'>
      <span className='text-subtle'>{formatDisplayDate(date)}</span>
      <ProjectStatus status={status} />
      <span className='text-subtle'>·</span>
      <span className='text-subtle' title='Likes'>
        <span className='text-foreground'>{stats?.like_count ?? 0}</span> likes
      </span>
      <span className='text-subtle'>·</span>
      <span className='text-subtle' title='Comments'>
        <span className='text-foreground'>{stats?.comment_count ?? 0}</span>{' '}
        comments
      </span>
      <span className='text-subtle'>·</span>
      <span className='text-subtle' title='Views'>
        <span className='text-foreground'>{stats?.view_count ?? 0}</span> views
      </span>
    </div>
  );
}

export default function ProjectCard({
  project: p,
}: {
  project: ProjectListItem;
}) {
  const [stats, setStats] = useState<ProjectStats | null>(null);

  useEffect(() => {
    void getProjectStats('/api', p.slug)
      .then(setStats)
      .catch(() => undefined);
  }, [p.slug]);

  return (
    <a
      href={`/projects/${p.slug}`}
      className='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6'
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <h2 className='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
            {p.title}
          </h2>
          <ProjectMeta date={p.date} status={p.status} stats={stats} />
        </div>

        <p className='text-sm leading-relaxed text-muted-foreground'>
          {p.description}
        </p>

        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap gap-1.5'>
            {p.tags.map((tag) => (
              <span
                key={tag}
                className='rounded-sm border border-edge px-2 py-0.5 font-mono text-xs text-subtle'
              >
                {tag}
              </span>
            ))}
          </div>

          {(p.links?.github || p.links?.live) && (
            <div className='flex items-center gap-3 font-mono text-xs text-foreground'>
              {p.links?.live && <span>live</span>}
              {p.links?.github && (
                <>
                  <span className='inline-flex items-center gap-1'>src</span>
                  {typeof p.githubStars === 'number' && (
                    <span aria-label='GitHub stars'>
                      {p.githubStars.toLocaleString('en-US')}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
