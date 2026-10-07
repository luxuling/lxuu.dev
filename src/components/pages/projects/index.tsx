import { useMemo, useState } from 'react';
import ProjectCard, { type ProjectListItem } from './card';

interface Props {
  projects: ProjectListItem[];
}

const SECTION_LABEL_CLASS =
  'px-1 font-mono text-xs uppercase tracking-widest text-subtle';

export default function ProjectsExplorer({ projects }: Props) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo<string[]>(
    () =>
      [...new Set(projects.flatMap((project) => project.tags))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [projects],
  );

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((value) => value !== tag)
        : [...prev, tag],
    );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const searchPool = [project.title, project.description, ...project.tags]
        .join(' ')
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchPool.includes(normalizedQuery);
      const matchesTags = selectedTags.every((tag) =>
        project.tags.includes(tag),
      );
      return matchesQuery && matchesTags;
    });
  }, [projects, query, selectedTags]);

  const highlighted = filtered.filter((p) => p.highlight);
  const rest = filtered.filter((p) => !p.highlight);

  return (
    <section className='py-8 sm:py-12'>
      <div className='mx-auto flex w-full max-w-269.5 flex-col gap-8 px-4 md:px-20'>
        <div className='px-1'>
          <h1 className='text-xl font-semibold tracking-tight text-foreground'>
            projects<span className='text-muted-foreground'>.</span>
          </h1>
          <p className='mt-1 text-sm text-subtle'>
            things i built or am building
          </p>
        </div>

        <div className='flex flex-col gap-3 rounded-md border border-edge bg-panel p-4 sm:p-6'>
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder='search projects...'
            className='w-full rounded-sm border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle transition-colors focus:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
            aria-label='Search projects'
          />
          <div className='flex flex-wrap gap-2'>
            {allTags.map((tag) => (
              <button
                key={tag}
                type='button'
                onClick={() => toggleTag(tag)}
                className={`rounded-sm border px-2 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.98] ${
                  selectedTags.includes(tag)
                    ? 'border-foreground text-foreground'
                    : 'border-edge text-subtle hover:text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {highlighted.length > 0 && (
          <span className={SECTION_LABEL_CLASS}>[ highlighted ]</span>
        )}
        {highlighted.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}

        {rest.length > 0 && highlighted.length > 0 && (
          <span className={SECTION_LABEL_CLASS}>[ other ]</span>
        )}
        {rest.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}

        {filtered.length === 0 && (
          <div className='rounded-md border border-edge bg-panel p-4 text-sm text-subtle sm:p-6'>
            no projects match search/filter.
          </div>
        )}
      </div>
    </section>
  );
}
