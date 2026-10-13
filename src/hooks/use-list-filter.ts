import { useMemo, useState } from 'react';

interface Filterable {
  title: string;
  description: string;
  tags: string[];
}

const matchesQuery = (item: Filterable, query: string) =>
  [item.title, item.description, ...item.tags]
    .join(' ')
    .toLowerCase()
    .includes(query);

export type ListFilterState = ReturnType<typeof useListFilter>;

export const useListFilter = <Item extends Filterable>(items: Item[]) => {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(
    () =>
      [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter(
      (item) =>
        matchesQuery(item, normalizedQuery) &&
        selectedTags.every((tag) => item.tags.includes(tag)),
    );
  }, [items, query, selectedTags]);

  const toggleTag = (tag: string) =>
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((value) => value !== tag)
        : [...previous, tag],
    );

  return { query, setQuery, selectedTags, toggleTag, allTags, filtered };
};
