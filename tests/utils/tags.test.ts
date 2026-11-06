import { describe, expect, it } from 'vitest';
import {
  tagLabel,
  parseTagListResponse,
  parseTags,
  tagSuggestions,
  tagToAdd,
  uniqueTags,
} from '@/utils/tags';

describe('uniqueTags', () => {
  it('trims, dedupes without caring about case, and sorts', () => {
    expect(
      uniqueTags([' React ', 'react', 'Astro', '  ', 'TanStack  Query']),
    ).toEqual(['Astro', 'React', 'TanStack Query']);
  });
});

describe('parseTags', () => {
  it('treats a missing list as no tags', () => {
    expect(parseTags(undefined)).toEqual([]);
  });

  it('rejects a list that is not strings', () => {
    expect(() => parseTags(['Astro', 1])).toThrow();
  });
});

describe('parseTagListResponse', () => {
  it('reads the tags array from the response', () => {
    expect(parseTagListResponse({ tags: ['Vite', 'vite'] })).toEqual(['Vite']);
  });
});

describe('tagSuggestions', () => {
  const known = ['Astro', 'React', 'TanStack Query'];

  it('hides tags that are already selected', () => {
    expect(tagSuggestions(known, ['React'], '')).toEqual([
      { kind: 'existing', tag: 'Astro' },
      { kind: 'existing', tag: 'TanStack Query' },
    ]);
  });

  it('filters by the typed text and offers a new tag when nothing matches exactly', () => {
    expect(tagSuggestions(known, [], 'tan')).toEqual([
      { kind: 'existing', tag: 'TanStack Query' },
      { kind: 'create', tag: 'tan' },
    ]);
  });

  it('does not offer to create a tag that already exists under different casing', () => {
    expect(tagSuggestions(known, [], 'react')).toEqual([
      { kind: 'existing', tag: 'React' },
    ]);
  });
});

describe('tagToAdd', () => {
  it('uses the existing spelling when the typed tag matches one', () => {
    expect(tagToAdd([], ['React'], ' react ')).toBe('React');
  });

  it('returns the new tag when it is not in the list', () => {
    expect(tagToAdd(['Astro'], ['Astro'], 'Rust')).toBe('Rust');
  });

  it('returns nothing for a blank value or a tag already selected', () => {
    expect(tagToAdd([], [], '   ')).toBeNull();
    expect(tagToAdd(['React'], ['React'], 'react')).toBeNull();
  });
});

describe('tagLabel', () => {
  it('prefixes a hash and kebab-cases the tag', () => {
    expect(tagLabel('Vue.js')).toBe('#vue.js');
    expect(tagLabel(' TanStack  Query ')).toBe('#tanstack-query');
  });
});
