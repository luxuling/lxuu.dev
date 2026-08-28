import { For, createMemo, createSignal } from 'solid-js';
import PostCard, { type PostListItem } from './card';

interface Props {
  posts: PostListItem[];
}

export default function PostsExplorer(props: Props) {
  const [query, setQuery] = createSignal('');
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

  const allTags = createMemo<string[]>(() =>
    [...new Set(props.posts.flatMap((post) => post.tags))].sort((a, b) =>
      a.localeCompare(b),
    ),
  );

  const selectedTagSet = createMemo(() => new Set(selectedTags()));

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((value) => value !== tag)
        : [...prev, tag],
    );

  const filtered = createMemo(() => {
    const normalizedQuery = query().trim().toLowerCase();
    return props.posts.filter((post) => {
      const searchPool = [post.title, post.description, ...post.tags]
        .join(' ')
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchPool.includes(normalizedQuery);
      const matchesTags = [...selectedTagSet()].every((tag) =>
        post.tags.includes(tag),
      );
      return matchesQuery && matchesTags;
    });
  });

  return (
    <section class='py-8 sm:py-12'>
      <div class='mx-auto flex w-full max-w-269.5 flex-col gap-8 px-4 md:px-20'>
        <div class='px-1'>
          <h1 class='text-xl font-semibold tracking-tight text-foreground'>
            posts<span class='text-muted-foreground'>.</span>
          </h1>
          <p class='mt-1 text-sm text-subtle'>writing from the journal repo</p>
        </div>

        <div class='flex flex-col gap-3 rounded-md border border-edge bg-panel p-4 sm:p-6'>
          <input
            type='text'
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder='search posts...'
            class='w-full rounded-sm border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle transition-colors focus:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
            aria-label='Search posts'
          />
          <div class='flex flex-wrap gap-2'>
            <For each={allTags()}>
              {(tag) => (
                <button
                  type='button'
                  onClick={() => toggleTag(tag)}
                  class='rounded-sm border px-2 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.98]'
                  classList={{
                    'border-edge text-subtle hover:text-foreground':
                      !selectedTags().includes(tag),
                    'border-foreground text-foreground':
                      selectedTags().includes(tag),
                  }}
                >
                  {tag}
                </button>
              )}
            </For>
          </div>
        </div>

        <For each={filtered()}>{(post) => <PostCard post={post} />}</For>

        {filtered().length === 0 && (
          <div class='rounded-md border border-edge bg-panel p-4 text-sm text-subtle sm:p-6'>
            no posts match search/filter.
          </div>
        )}
      </div>
    </section>
  );
}
