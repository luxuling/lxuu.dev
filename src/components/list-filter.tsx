import type { ListFilterState } from '@/hooks/use-list-filter';
import { tagLabel } from '@/utils/tags';

interface Props {
  filter: ListFilterState;
  placeholder: string;
  label: string;
}

const chipClass = (isSelected: boolean) =>
  `cursor-pointer border px-3 py-1 text-small transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
    isSelected
      ? 'border-fg bg-fg text-bg'
      : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
  }`;

export const ListFilter = ({ filter, placeholder, label }: Props) => (
  <div className='flex flex-col gap-4'>
    <label className='flex items-center gap-3 border border-line bg-surface/40 px-4 py-3 text-small transition-colors focus-within:border-line-strong'>
      <span className='text-fg-muted' aria-hidden='true'>
        [/]
      </span>
      <input
        type='search'
        value={filter.query}
        onChange={(event) => filter.setQuery(event.currentTarget.value)}
        placeholder={placeholder}
        className='min-w-0 flex-1 bg-transparent text-fg caret-fg outline-none placeholder:text-fg-subtle'
        aria-label={label}
      />
      <span className='shrink-0 text-micro text-fg-subtle'>
        {filter.filtered.length}{' '}
        {filter.filtered.length === 1 ? 'result' : 'results'}
      </span>
    </label>

    <div className='flex flex-wrap gap-2'>
      <button
        type='button'
        onClick={filter.clearTags}
        className={chipClass(filter.selectedTags.length === 0)}
        aria-pressed={filter.selectedTags.length === 0}
      >
        all
      </button>
      {filter.allTags.map((tag) => {
        const isSelected = filter.selectedTags.includes(tag);

        return (
          <button
            key={tag}
            type='button'
            onClick={() => filter.toggleTag(tag)}
            className={chipClass(isSelected)}
            aria-pressed={isSelected}
          >
            {tagLabel(tag)}
          </button>
        );
      })}
    </div>
  </div>
);
