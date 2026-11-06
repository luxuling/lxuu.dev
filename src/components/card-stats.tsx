import { useStats } from '@/hooks/use-stats';
import type { EngagementTarget } from '@/services/engagement-targets';

interface Props {
  target: EngagementTarget;
  slug: string;
  separator?: string;
}

export const CardStats = ({ target, slug, separator = '  ' }: Props) => {
  const stats = useStats(target, slug);
  if (!stats)
    return (
      <span className='whitespace-pre' aria-hidden='true'>
        {['<3 -', '[..] -', '(o) -'].join(separator)}
      </span>
    );

  return (
    <span className='whitespace-pre'>
      <span title='Likes'>{`<3 ${stats.like_count}`}</span>
      {separator}
      <span title='Comments'>{`[..] ${stats.comment_count}`}</span>
      {separator}
      <span title='Views'>{`(o) ${stats.view_count}`}</span>
    </span>
  );
};
