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
        frameClassName='size-5 shrink-0 rounded-sm'
        className='size-full object-cover'
      />
    )}
    <span className='whitespace-nowrap text-foreground'>
      {user ? user.display_name : 'guest'}
    </span>
    <span className='text-subtle'>in</span>
    <span className='truncate text-muted-foreground'>{path}</span>
  </div>
);
