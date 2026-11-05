import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import type { TagFieldProps } from '@/types/tags';
import {
  parseTagListResponse,
  parseTags,
  sameTag,
  tagSuggestions,
  tagToAdd,
  uniqueTags,
  type TagSuggestion,
} from '@/utils/tags';

const loadKnownTags = async () => {
  const response = await fetch('/tags.json');
  if (!response.ok) throw new Error('Could not load tags');

  return parseTagListResponse(await response.json());
};

const fieldStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
  padding: 8,
  border: '1px solid color-mix(in srgb, currentColor 25%, transparent)',
  borderRadius: 6,
} as const;

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 6px',
  border: '1px solid color-mix(in srgb, currentColor 25%, transparent)',
  borderRadius: 4,
  fontSize: 13,
} as const;

const inputStyle = {
  flex: '1 0 140px',
  minWidth: 140,
  border: 0,
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: '4px 2px',
} as const;

const listStyle = {
  position: 'absolute',
  zIndex: 5,
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  maxHeight: 240,
  margin: 0,
  padding: 4,
  overflow: 'auto',
  listStyle: 'none',
  border: '1px solid color-mix(in srgb, currentColor 25%, transparent)',
  borderRadius: 6,
  background: 'canvas',
  color: 'canvastext',
} as const;

const optionStyle = (active: boolean): CSSProperties => ({
  display: 'block',
  width: '100%',
  padding: '6px 8px',
  border: 0,
  borderRadius: 4,
  background: active
    ? 'color-mix(in srgb, canvastext 12%, canvas)'
    : 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
});

const hintStyle = { margin: 0, fontSize: 13, opacity: 0.7 } as const;

const optionLabel = (suggestion: TagSuggestion) =>
  suggestion.kind === 'create' ? `Create ${suggestion.tag}` : suggestion.tag;

export const TagField = ({ value, onChange, autoFocus }: TagFieldProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [known, setKnown] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const labelId = useId();
  const listId = useId();

  useEffect(() => {
    let cancelled = false;

    loadKnownTags()
      .then((tags) => {
        if (!cancelled) setKnown(tags);
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setLoadError(
          error instanceof Error ? error : new Error('Could not load tags'),
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) throw loadError;
  if (!known) return <p style={hintStyle}>Loading tags…</p>;

  const suggestions = tagSuggestions(known, value, query);
  const active =
    suggestions.length === 0
      ? 0
      : Math.min(activeIndex, suggestions.length - 1);

  const add = (tag: string) => {
    if (value.some((item) => sameTag(item, tag))) return;

    onChange([...value, tag]);
    setQuery('');
    setActiveIndex(0);
  };

  const commitQuery = () => {
    const exact = known.find((tag) => sameTag(tag, query));
    const onlyCreate =
      suggestions.length > 0 &&
      suggestions.every((item) => item.kind === 'create');

    if (exact && !value.some((tag) => sameTag(tag, exact))) {
      onChange([...value, exact]);
    } else if (onlyCreate) {
      const tag = tagToAdd(value, known, query);
      if (tag) onChange([...value, tag]);
    }

    setQuery('');
    setOpen(false);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;

    commitQuery();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setQuery('');
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (suggestions.length === 0) return;

      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) =>
        Math.min(Math.max(index + delta, 0), suggestions.length - 1),
      );
      return;
    }

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (!open) return;

      const suggestion = suggestions[active];
      if (suggestion) add(suggestion.tag);
      return;
    }

    if (event.key === 'Backspace' && query === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span id={labelId} style={{ fontWeight: 600 }}>
        Tags
      </span>
      <p style={hintStyle}>Search an existing tag, or type a new one.</p>
      <div
        style={{ position: 'relative' }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
      >
        <div role='group' aria-labelledby={labelId} style={fieldStyle}>
          {value.map((tag) => (
            <span key={tag} style={chipStyle}>
              {tag}
              <button
                type='button'
                aria-label={`Remove ${tag}`}
                onClick={() =>
                  onChange(value.filter((item) => !sameTag(item, tag)))
                }
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={query}
            autoFocus={autoFocus}
            role='combobox'
            aria-autocomplete='list'
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            aria-activedescendant={
              open && suggestions.length > 0 ? `${listId}-${active}` : undefined
            }
            placeholder='Search or create a tag'
            style={inputStyle}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActiveIndex(0);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        {open && suggestions.length > 0 && (
          <ul id={listId} role='listbox' style={listStyle}>
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.kind}-${suggestion.tag}`}
                role='presentation'
              >
                <button
                  id={`${listId}-${index}`}
                  type='button'
                  role='option'
                  aria-selected={index === active}
                  style={optionStyle(index === active)}
                  onPointerDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => add(suggestion.tag)}
                >
                  {optionLabel(suggestion)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const tagsField = {
  kind: 'form' as const,
  label: 'Tags',
  Input: TagField,
  defaultValue: () => [],
  parse: parseTags,
  validate: uniqueTags,
  serialize: (value: readonly string[]) => ({ value: uniqueTags(value) }),
  reader: {
    parse: parseTags,
  },
};
