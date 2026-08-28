import { For, Show, createSignal, onMount } from 'solid-js';
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
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function ProjectStatus(props: { status: ProjectListItem['status'] }) {
  return (
    <span class={`font-mono text-xs ${STATUS_COLOR[props.status]}`}>
      {STATUS_LABEL[props.status]}
    </span>
  );
}

function ProjectMeta(props: {
  date: string;
  status: ProjectListItem['status'];
  stats: ProjectStats | null;
}) {
  return (
    <div class='flex shrink-0 flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs'>
      <span class='text-subtle'>{formatDisplayDate(props.date)}</span>
      <ProjectStatus status={props.status} />
      <span class='text-subtle'>·</span>
      <span class='text-subtle' title='Likes'>
        <span class='text-foreground'>{props.stats?.like_count ?? 0}</span>{' '}
        likes
      </span>
      <span class='text-subtle'>·</span>
      <span class='text-subtle' title='Comments'>
        <span class='text-foreground'>{props.stats?.comment_count ?? 0}</span>{' '}
        comments
      </span>
      <span class='text-subtle'>·</span>
      <span class='text-subtle' title='Views'>
        <span class='text-foreground'>{props.stats?.view_count ?? 0}</span>{' '}
        views
      </span>
    </div>
  );
}

export default function ProjectCard(props: { project: ProjectListItem }) {
  const p = () => props.project;
  const [stats, setStats] = createSignal<ProjectStats | null>(null);

  onMount(() => {
    void getProjectStats('/api', p().slug)
      .then(setStats)
      .catch(() => undefined);
  });

  return (
    <a
      href={`/projects/${p().slug}`}
      class='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6'
    >
      <div class='flex flex-col gap-3'>
        <div class='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <h2 class='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
            {p().title}
          </h2>
          <ProjectMeta date={p().date} status={p().status} stats={stats()} />
        </div>

        <p class='text-sm leading-relaxed text-muted-foreground'>
          {p().description}
        </p>

        <div class='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div class='flex flex-wrap gap-1.5'>
            <For each={p().tags}>
              {(tag) => (
                <span class='rounded-sm border border-edge px-2 py-0.5 font-mono text-xs text-subtle'>
                  {tag}
                </span>
              )}
            </For>
          </div>

          {(p().links?.github || p().links?.live) && (
            <div class='flex items-center gap-3 font-mono text-xs text-foreground'>
              {p().links?.live && <span>live</span>}
              {p().links?.github && (
                <>
                  <span class='inline-flex items-center gap-1'>src</span>
                  <Show
                    when={
                      typeof p().githubStars === 'number'
                        ? { n: p().githubStars }
                        : false
                    }
                  >
                    {(o) => (
                      <span aria-label='GitHub stars'>
                        {o ? o()?.n?.toLocaleString() : '-'}
                      </span>
                    )}
                  </Show>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
