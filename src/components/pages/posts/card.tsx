import { For, createSignal, onMount } from 'solid-js';
import { getStats, type PostStats } from '@lib/engagement/engagement-api';

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

export interface PostListItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  highlight?: boolean;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(`${dateStr}-01`);
  if (isNaN(d.getTime())) return dateStr;
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function PostMeta(props: { date: string; stats: PostStats | null }) {
  return (
    <div class='flex shrink-0 flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs'>
      <span class='text-subtle'>{formatDisplayDate(props.date)}</span>
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

export default function PostCard(props: { post: PostListItem }) {
  const p = () => props.post;
  const [stats, setStats] = createSignal<PostStats | null>(null);

  onMount(() => {
    void getStats('/api', p().slug)
      .then(setStats)
      .catch(() => undefined);
  });

  return (
    <a
      href={`/posts/${p().slug}`}
      class='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6'
    >
      <div class='flex flex-col gap-3'>
        <div class='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <h2 class='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
            {p().title}
          </h2>
          <PostMeta date={p().date} stats={stats()} />
        </div>

        <p class='text-sm leading-relaxed text-muted-foreground'>
          {p().description}
        </p>

        <div class='flex flex-wrap gap-1.5'>
          <For each={p().tags}>
            {(tag) => (
              <span class='rounded-sm border border-edge px-2 py-0.5 font-mono text-xs text-subtle'>
                {tag}
              </span>
            )}
          </For>
        </div>
      </div>
    </a>
  );
}
