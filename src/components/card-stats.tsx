import { useStats } from '@/hooks/use-stats';
import type { EngagementTarget } from '@/services/engagement-targets';

interface Props {
  target: EngagementTarget;
  slug: string;
}

interface StatProps {
  title: string;
  label: string;
  count: number;
}

const Stat = ({ title, label, count }: StatProps) => (
  <>
    <span className='text-subtle'>·</span>
    <span className='text-subtle' title={title}>
      <span className='text-foreground'>{count}</span> {label}
    </span>
  </>
);

export const CardStats = ({ target, slug }: Props) => {
  const stats = useStats(target, slug);

  return (
    <>
      <Stat title='Likes' label='likes' count={stats?.like_count ?? 0} />
      <Stat
        title='Comments'
        label='comments'
        count={stats?.comment_count ?? 0}
      />
      <Stat title='Views' label='views' count={stats?.view_count ?? 0} />
    </>
  );
};
