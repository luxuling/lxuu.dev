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
  <div className='flex flex-col gap-3 border border-line bg-surface p-4 sm:p-6'>
    <input
      type='text'
      value={filter.query}
      onChange={(event) => filter.setQuery(event.currentTarget.value)}
      placeholder={placeholder}
      className='w-full border border-line bg-bg px-3 py-2 text-sm text-fg transition-colors outline-none placeholder:text-fg-subtle focus:border-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg'
      aria-label={label}
    />
    <div className='flex flex-wrap gap-2'>
      {filter.allTags.map((tag) => (
        <button
          key={tag}
          type='button'
          onClick={() => filter.toggleTag(tag)}
          className={`border px-2 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg active:scale-[0.98] ${
            filter.selectedTags.includes(tag)
              ? 'border-fg text-fg'
              : 'border-line text-fg-subtle hover:text-fg'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);
