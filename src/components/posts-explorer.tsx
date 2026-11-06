import {
  ExplorerEmpty,
  ExplorerList,
  ExplorerShell,
} from '@/components/explorer-shell';
import { ListFilter } from '@/components/list-filter';
import { PostCard } from '@/components/post-card';
import { useListFilter } from '@/hooks/use-list-filter';
import type { PostListItem } from '@/types/content';

interface Props {
  posts: PostListItem[];
}

export const PostsExplorer = ({ posts }: Props) => {
  const filter = useListFilter(posts);

  return (
    <ExplorerShell
      path='~/posts'
      title='posts'
      subtitle='writing from the journal repo'
    >
      <ListFilter
        filter={filter}
        placeholder='search posts...'
        label='Search posts'
      />

      {filter.filtered.length > 0 ? (
        <ExplorerList>
          {filter.filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ExplorerList>
      ) : (
        <ExplorerEmpty
          message='no posts match search/filter.'
          onClear={filter.clear}
        />
      )}
    </ExplorerShell>
  );
};
