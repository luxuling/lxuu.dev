import { useEffect, useState } from 'react';
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
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function PostMeta({ date, stats }: { date: string; stats: PostStats | null }) {
  return (
    <div className='flex shrink-0 flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs'>
      <span className='text-subtle'>{formatDisplayDate(date)}</span>
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

export default function PostCard({ post: p }: { post: PostListItem }) {
  const [stats, setStats] = useState<PostStats | null>(null);

  useEffect(() => {
    void getStats('/api', p.slug)
      .then(setStats)
      .catch(() => undefined);
  }, [p.slug]);

  return (
    <a
      href={`/posts/${p.slug}`}
      className='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6'
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <h2 className='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
            {p.title}
          </h2>
          <PostMeta date={p.date} stats={stats} />
        </div>

        <p className='text-sm leading-relaxed text-muted-foreground'>
          {p.description}
        </p>

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
      </div>
    </a>
  );
}
