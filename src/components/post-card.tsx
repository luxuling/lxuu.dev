import { CardStats } from '@/components/card-stats';
import { TagList } from '@/components/tag-list';
import type { PostListItem } from '@/types/content';

interface Props {
  post: PostListItem;
}

export const PostCard = ({ post }: Props) => (
  <a
    href={`/posts/${post.slug}`}
    className='group block border border-line bg-surface p-4 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:p-6'
  >
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
        <h2 className='text-sm font-semibold text-fg underline-offset-4 group-hover:underline'>
          {post.title}
        </h2>
        <div className='flex shrink-0 flex-wrap items-center gap-2 font-mono text-xs sm:gap-3'>
          <span className='text-fg-subtle'>{post.dateLabel}</span>
          <CardStats target='posts' slug={post.slug} />
        </div>
      </div>

      <p className='text-sm/relaxed text-fg-muted'>{post.description}</p>

      <TagList tags={post.tags} />
    </div>
  </a>
);
