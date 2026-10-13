import type { ListFilterState } from '@/hooks/use-list-filter';

interface Props {
  filter: Pick<
    ListFilterState,
    'query' | 'setQuery' | 'allTags' | 'selectedTags' | 'toggleTag'
  >;
  placeholder: string;
  label: string;
}

export const ListFilter = ({ filter, placeholder, label }: Props) => (
  <div className='flex flex-col gap-3 rounded-md border border-edge bg-panel p-4 sm:p-6'>
    <input
      type='text'
      value={filter.query}
      onChange={(event) => filter.setQuery(event.currentTarget.value)}
      placeholder={placeholder}
      className='w-full rounded-sm border border-edge bg-background px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-subtle focus:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
      aria-label={label}
    />
    <div className='flex flex-wrap gap-2'>
      {filter.allTags.map((tag) => (
        <button
          key={tag}
          type='button'
          onClick={() => filter.toggleTag(tag)}
          className={`rounded-sm border px-2 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.98] ${
            filter.selectedTags.includes(tag)
              ? 'border-foreground text-foreground'
              : 'border-edge text-subtle hover:text-foreground'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);
