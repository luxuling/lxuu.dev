import { CardStats } from '@/components/card-stats';
import { TagLine } from '@/components/tag-list';
import type { PostListItem } from '@/types/content';

interface Props {
  post: PostListItem;
}

const CARD_CLASS =
  'group flex flex-col gap-2 border border-line bg-surface/40 p-4 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg md:flex-row md:items-center md:gap-6 md:p-6';

export const PostCard = ({ post }: Props) => (
  <a href={`/posts/${post.slug}`} className={CARD_CLASS}>
    <div className='flex items-center gap-3 md:contents'>
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt=''
          className='size-16 shrink-0 border border-line object-cover md:size-24'
        />
      )}
      <div className='flex min-w-0 flex-1 items-center justify-between gap-4 md:hidden'>
        <h3 className='truncate text-title font-semibold text-fg'>
          {post.title}
        </h3>
        <span className='shrink-0 text-small text-fg-muted lowercase'>
          {post.dateLabel}
        </span>
      </div>
    </div>

    <div className='flex min-w-0 flex-1 flex-col gap-2 md:gap-3'>
      <div className='hidden items-center justify-between gap-4 md:flex'>
        <h3 className='truncate text-title font-semibold text-fg underline-offset-4 group-hover:underline'>
          {post.title}
        </h3>
        <span className='shrink-0 text-small text-fg-subtle lowercase'>
          {post.dateLabel}
        </span>
      </div>

      <p className='text-body text-fg-muted'>{post.description}</p>

      <div className='mt-1 flex flex-col gap-2 md:mt-0 md:flex-row md:items-center md:justify-between md:gap-6'>
        <TagLine tags={post.tags} />
        <span className='shrink-0 text-small text-fg-subtle'>
          <CardStats target='posts' slug={post.slug} />
        </span>
      </div>
    </div>
  </a>
);
