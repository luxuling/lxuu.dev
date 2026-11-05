import { z } from 'astro/zod';

export interface TagSuggestion {
  kind: 'existing' | 'create';
  tag: string;
}

const tagListSchema = z.array(z.string());

export const normalizeTag = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

export const sameTag = (left: string, right: string) =>
  normalizeTag(left).localeCompare(normalizeTag(right), undefined, {
    sensitivity: 'accent',
  }) === 0;

export const uniqueTags = (tags: readonly string[]) => {
  const seen = new Map<string, string>();

  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (!normalized) continue;

    const key = normalized.toLocaleLowerCase();
    if (!seen.has(key)) seen.set(key, normalized);
  }

  return [...seen.values()].sort((left, right) => left.localeCompare(right));
};

export const parseTags = (value: unknown) => {
  if (value === undefined) return [];

  return uniqueTags(tagListSchema.parse(value));
};

export const parseTagListResponse = (value: unknown) => {
  const parsed = z.object({ tags: tagListSchema }).parse(value);

  return uniqueTags(parsed.tags);
};

export const tagSuggestions = (
  known: readonly string[],
  selected: readonly string[],
  query: string,
): TagSuggestion[] => {
  const normalized = normalizeTag(query);
  const available = known.filter(
    (tag) => !selected.some((chosen) => sameTag(chosen, tag)),
  );
  const matches = normalized
    ? available.filter((tag) =>
        tag.toLocaleLowerCase().includes(normalized.toLocaleLowerCase()),
      )
    : available;
  const exact = [...selected, ...known].some((tag) => sameTag(tag, normalized));

  return [
    ...matches.map((tag) => ({ kind: 'existing' as const, tag })),
    ...(normalized && !exact
      ? [{ kind: 'create' as const, tag: normalized }]
      : []),
  ];
};

export const tagToAdd = (
  selected: readonly string[],
  known: readonly string[],
  query: string,
) => {
  const normalized = normalizeTag(query);
  if (!normalized) return null;
  if (selected.some((tag) => sameTag(tag, normalized))) return null;

  return known.find((tag) => sameTag(tag, normalized)) ?? normalized;
};
