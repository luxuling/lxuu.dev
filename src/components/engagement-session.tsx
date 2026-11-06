import { LoadingImage } from '@/components/loading-image';
import type { EngagementUser } from '@/services/engagement-api';

interface Props {
  path: string;
  user: EngagementUser | null;
}

export const EngagementSession = ({ path, user }: Props) => (
  <div className='flex min-w-0 items-center gap-x-2'>
    {user?.avatar_url && (
      <LoadingImage
        src={user.avatar_url}
        alt=''
        width={20}
        height={20}
        frameClassName='size-5 shrink-0'
        className='size-full object-cover'
      />
    )}
    <span className='whitespace-nowrap text-fg'>
      {user ? user.display_name : 'guest'}
    </span>
    <span className='text-fg-subtle'>in</span>
    <span className='truncate text-fg-muted'>{path}</span>
  </div>
);
