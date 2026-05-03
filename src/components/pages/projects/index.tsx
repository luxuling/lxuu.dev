import { For, createMemo, createSignal } from 'solid-js';
import ProjectCard, { type ProjectListItem } from './card';

interface Props {
  projects: ProjectListItem[];
}

export default function ProjectsExplorer(props: Props) {
  const [query, setQuery] = createSignal('');
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

  const allTags = createMemo<string[]>(() =>
    [...new Set(props.projects.flatMap((project) => project.tags))].sort(
      (a, b) => a.localeCompare(b),
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
    return props.projects.filter((project) => {
      const searchPool = [project.title, project.description, ...project.tags]
        .join(' ')
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchPool.includes(normalizedQuery);
      const matchesTags = [...selectedTagSet()].every((tag) =>
        project.tags.includes(tag),
      );
      return matchesQuery && matchesTags;
    });
  });

  const featured = createMemo(() => filtered().filter((p) => p.featured));
  const rest = createMemo(() => filtered().filter((p) => !p.featured));

  return (
    <section class='py-8 sm:py-12'>
      <div class='mx-auto flex w-full max-w-269.5 flex-col gap-6 px-4 md:px-20'>
        <div class='px-1'>
          <h1 class='text-xl font-semibold tracking-tight text-foreground'>
            projects<span class='text-muted-foreground'>.</span>
          </h1>
          <p class='mt-1 text-sm text-subtle'>things i built or am building</p>
        </div>

        <div class='flex flex-col gap-3 rounded-md border border-edge bg-panel p-4 sm:p-6'>
          <input
            type='text'
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder='search projects...'
            class='w-full rounded-md border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle focus:border-muted'
            aria-label='Search projects'
          />
          <div class='flex flex-wrap gap-2'>
            <For each={allTags()}>
              {(tag) => (
                <button
                  type='button'
                  onClick={() => toggleTag(tag)}
                  class='rounded-sm border px-2 py-1 font-mono text-xs transition-colors'
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

        <For each={featured()}>
          {(project, index) => (
            <>
              {index() === 0 && (
                <span class='px-1 font-mono text-xs uppercase tracking-widest text-subtle'>
                  [ featured ]
                </span>
              )}
              <ProjectCard project={project} />
            </>
          )}
        </For>

        <For each={rest()}>
          {(project, index) => (
            <>
              {index() === 0 && featured().length > 0 && (
                <span class='px-1 font-mono text-xs uppercase tracking-widest text-subtle'>
                  [ other ]
                </span>
              )}
              <ProjectCard project={project} />
            </>
          )}
        </For>

        {filtered().length === 0 && (
          <div class='rounded-md border border-edge bg-panel p-4 text-sm text-subtle sm:p-6'>
            no projects match search/filter.
          </div>
        )}
      </div>
    </section>
  );
}
