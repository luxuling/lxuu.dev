import { LoadingImage } from '@/components/loading-image';
import type { EngagementUser } from '@/services/engagement-api';

interface Props {
  path: string;
  user: EngagementUser | null;
}

export const EngagementSession = ({ path, user }: Props) => (
  <p className='flex min-w-0 items-center gap-2 text-fg-subtle'>
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
    <span className='truncate'>
      {user ? <span className='text-fg'>{user.display_name}</span> : '$ guest'}{' '}
      in {path}
    </span>
  </p>
);
