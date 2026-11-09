import { useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import {
  MAX_TAG_LENGTH,
  MAX_TAGS,
  canonicalTag,
  courseProfileFor,
  normalizeTag,
  searchTags,
  suggestedTagsFor,
} from '../lib/tagCatalog';

type Option = { kind: 'tag'; value: string } | { kind: 'custom'; value: string };

/**
 * Searchable multi-select for profile tags (ARIA combobox + listbox).
 * With a `course`, the course's common tags show as one-click chips and rank first in search;
 * every other tag stays searchable, and a tag outside the catalog can still be added.
 */
export function TagPicker({ id, label, value, onChange, course, allowCustom = true, max = MAX_TAGS }: {
  id: string;
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  /** Free-text course name; picks the suggestions and ranking. */
  course?: string;
  /** False: only tags from the catalog can be picked (projects). */
  allowCustom?: boolean;
  max?: number;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const hintId = useId();
  const chipsLabelId = useId();
  const atLimit = value.length >= max;

  const profile = useMemo(() => courseProfileFor(course), [course]);
  // Chips keep their place when picked (shown as pressed), so the row does not jump around.
  const chips = useMemo(() => suggestedTagsFor(profile), [profile]);
  const isPicked = (tag: string) => value.some((entry) => normalizeTag(entry) === normalizeTag(tag));

  const options = useMemo<Option[]>(() => {
    // With an empty query the chips already show the suggestions, so the list only opens once the student types.
    if (!query.trim()) return [];
    const matches: Option[] = searchTags(query, value, 8, profile).map((tag) => ({ kind: 'tag', value: tag }));
    const typed = query.trim().slice(0, MAX_TAG_LENGTH);
    const known = matches.some((option) => normalizeTag(option.value) === normalizeTag(typed));
    const taken = value.some((tag) => normalizeTag(tag) === normalizeTag(typed));
    if (allowCustom && !known && !taken) matches.push({ kind: 'custom', value: canonicalTag(typed) });
    return matches;
  }, [query, value, profile, allowCustom]);

  const add = (tag: string) => {
    if (atLimit || isPicked(tag)) return;
    onChange([...value, tag]);
    setQuery('');
    setActive(0);
    inputRef.current?.focus();
  };

  const remove = (tag: string) => {
    onChange(value.filter((entry) => normalizeTag(entry) !== normalizeTag(tag)));
  };

  const toggleChip = (tag: string) => {
    if (isPicked(tag)) remove(tag);
    else if (!atLimit) onChange([...value, tag]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (options.length ? (current + 1) % options.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (options.length ? (current - 1 + options.length) % options.length : 0));
    } else if (event.key === 'Enter') {
      // Enter picks the highlighted option and never submits the surrounding form.
      event.preventDefault();
      if (open && options[active]) add(options[active].value);
    } else if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'Backspace' && !query && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const showList = open && !atLimit && options.length > 0;
  const chipsLabel = profile ? `Comuns em ${profile.label}` : 'Sugestões populares';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <span id={chipsLabelId} className="text-[15px] font-bold text-ink">{chipsLabel}</span>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-labelledby={chipsLabelId}>
          {chips.map((tag) => {
            const picked = isPicked(tag);
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={picked}
                  disabled={!picked && atLimit}
                  onClick={() => toggleChip(tag)}
                  className="cf-chip min-h-[44px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {picked ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                  {tag}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="cf-field">
        <label htmlFor={id}>{label}</label>

        {value.length > 0 && (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Tags escolhidas">
            {value.map((tag) => (
              <li key={tag}>
                <span className="cf-chip removable">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      remove(tag);
                      inputRef.current?.focus();
                    }}
                    aria-label={`Remover ${tag}`}
                    className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-gold"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-describedby={hintId}
            aria-activedescendant={showList && options[active] ? `${listId}-${active}` : undefined}
            value={query}
            disabled={atLimit}
            maxLength={MAX_TAG_LENGTH}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            placeholder={atLimit ? 'Limite de tags atingido' : 'Busque qualquer competência, ferramenta ou função'}
            className="cf-input pl-12 disabled:bg-paper"
            autoComplete="off"
          />

          {showList && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Resultados da busca"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 m-0 max-h-72 list-none overflow-y-auto rounded-sm border-2 border-ink bg-surface p-1.5 shadow-md"
            >
              {options.map((option, index) => (
                <li
                  key={`${option.kind}-${option.value}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // mousedown keeps focus in the input, so the list does not close before the click lands.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    add(option.value);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-sm px-3 text-[15px] font-semibold text-ink ${index === active ? 'bg-gold-tint' : ''}`}
                >
                  {option.kind === 'custom' ? (
                    <>
                      <Plus className="h-4 w-4 flex-none" aria-hidden="true" />
                      Adicionar “{option.value}”
                    </>
                  ) : (
                    option.value
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id={hintId} className="text-sm text-ink-muted" aria-live="polite">
          {value.length}/{max} tags. Use as setas para navegar e Enter para adicionar.{allowCustom ? '' : ' Só tags da lista são aceitas.'}
        </div>
      </div>
    </div>
  );
}
