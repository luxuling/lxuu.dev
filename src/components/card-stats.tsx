import { useStats } from '@/hooks/use-stats';
import type { EngagementTarget } from '@/services/engagement-targets';

interface Props {
  target: EngagementTarget;
  slug: string;
}

export const CardStats = ({ target, slug }: Props) => {
  const stats = useStats(target, slug);
  if (!stats) return <span aria-hidden='true'>{'<3 ·  [..] ·  (o) ·'}</span>;

  return (
    <span className='whitespace-pre'>
      <span title='Likes'>{`<3 ${stats.like_count}`}</span>
      {'  '}
      <span title='Comments'>{`[..] ${stats.comment_count}`}</span>
      {'  '}
      <span title='Views'>{`(o) ${stats.view_count}`}</span>
    </span>
  );
};
