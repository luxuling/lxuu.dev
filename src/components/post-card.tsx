import { CardStats } from '@/components/card-stats';
import { TagList } from '@/components/tag-list';
import type { PostListItem } from '@/types/content';

interface Props {
  post: PostListItem;
}

export const PostCard = ({ post }: Props) => (
  <a
    href={`/posts/${post.slug}`}
    className='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6'
  >
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
        <h2 className='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
          {post.title}
        </h2>
        <div className='flex shrink-0 flex-wrap items-center gap-2 font-mono text-xs sm:gap-3'>
          <span className='text-subtle'>{post.dateLabel}</span>
          <CardStats target='posts' slug={post.slug} />
        </div>
      </div>

      <p className='text-sm/relaxed text-muted-foreground'>
        {post.description}
      </p>

      <TagList tags={post.tags} />
    </div>
  </a>
);
