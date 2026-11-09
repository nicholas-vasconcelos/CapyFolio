import { Fragment, useCallback, useEffect, useEffectEvent, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  emptySelection,
  facetOptions,
  filterItems,
  optionLabel,
  readParams,
  writeParams,
  type SearchConfig,
  type Selection,
} from '../../lib/facetedSearch';
import { ActiveFilterPill } from './ActiveFilterPill';
import { ChipFilter } from './ChipFilter';
import { EmptyState } from './EmptyState';
import { FilterDrawer } from './FilterDrawer';
import { FilterGroup } from './FilterGroup';
import { CARD_GRID as GRID } from './cardGrid';

const TEXT_DEBOUNCE_MS = 250;
const focusRing = 'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-focus';

export interface FacetedSearchCopy {
  title: string;
  subtitle: string;
  /** Screen-reader label for the search input. */
  searchLabel: string;
  placeholder: string;
  /** "1 perfil encontrado" / "N perfis encontrados". */
  countLabel: (count: number) => string;
  /** Drawer footer on phones: "Ver N perfis". */
  viewLabel: (count: number) => string;
  emptyTitle: string;
  emptyText: string;
}

/**
 * The search screen shared by Pessoas, Projetos and Eventos: navy hero with a big search field,
 * a filter panel (a left drawer on phones), live result count, sort, removable filter pills,
 * empty state and a card grid. Text, filters and sort live in the URL so a search can be shared.
 */
export function FacetedSearchPage<T>({ config, items, getKey, renderItem, renderResults, copy, initialSearch = '', cardSize = 'wide', loading = false }: {
  config: SearchConfig<T>;
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number, selection: Selection) => React.ReactNode;
  /** Replaces the default card grid, e.g. to group mixed results. `setFacet` lets it narrow the search. */
  renderResults?: (results: T[], ctx: { selection: Selection; setFacet: (key: string, values: string[]) => void }) => React.ReactNode;
  copy: FacetedSearchCopy;
  initialSearch?: string;
  cardSize?: keyof typeof GRID;
  /** While the first load runs, show a status instead of "0 found" and the empty state. */
  loading?: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { query, selection, sort } = readParams(searchParams, config);
  const inputId = useId();
  const drawerId = useId();

  // The header search hands its text over; use it when the URL has no query of its own.
  const [text, setText] = useState(() => (searchParams.has('q') ? query : initialSearch));
  // When the URL's query changes from outside (back/forward, a link), adopt it; otherwise the
  // debounce below would write the stale text back over it. Skip when it is just our own trimmed text.
  const [seenQuery, setSeenQuery] = useState(query);
  if (query !== seenQuery) {
    setSeenQuery(query);
    if (query !== text.trim()) setText(query);
  }
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const update = (next: { query?: string; selection?: Selection; sort?: string }) =>
    setSearchParams(writeParams(config, next.query ?? query, next.selection ?? selection, next.sort ?? sort), { replace: true });

  // Debounce the text before it filters and reaches the URL.
  const commitText = useEffectEvent((value: string) => update({ query: value }));
  useEffect(() => {
    if (text.trim() === query) return;
    const id = window.setTimeout(() => commitText(text), TEXT_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [text, query]);

  const options = useMemo(() => Object.fromEntries(config.facets.map((f) => [f.key, facetOptions(items, f)])), [items, config]);
  const results = filterItems(items, config, query, selection, sort);

  const setFacet = (key: string, values: string[]) => {
    const facet = config.facets.find((f) => f.key === key);
    if (facet?.resetsOthers) update({ selection: { ...emptySelection(config), [key]: values }, sort: config.sorts[0]?.value ?? '' });
    else update({ selection: { ...selection, [key]: values } });
  };
  const toggle = (key: string, value: string) => {
    const current = selection[key] ?? [];
    setFacet(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };
  const clearAll = () => {
    setText('');
    update({ query: '', selection: emptySelection(config) });
  };

  const activeFilters = config.facets.flatMap((facet) => (selection[facet.key] ?? []).map((value) => ({ key: facet.key, value, label: optionLabel(facet, value) })));
  const hasAnything = activeFilters.length > 0 || text.trim() !== '';

  return (
    <div className="bg-paper">
      <section className="capy-hero-shell">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-7 px-4 pb-16 pt-10 sm:px-6 md:px-12 md:pt-14">
          <div className="flex flex-col gap-3">
            <h1 className="m-0 max-w-[15em] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-[56px] lg:text-[68px]">
              {copy.title}
            </h1>
            <p className="m-0 max-w-[56ch] text-lg leading-normal text-on-navy-muted md:text-[19px]">{copy.subtitle}</p>
          </div>
          <form role="search" onSubmit={(event) => { event.preventDefault(); update({ query: text }); }} className="w-full max-w-[820px]">
            <label htmlFor={inputId} className="sr-only">{copy.searchLabel}</label>
            <div className="cf-search hero focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-[3px] focus-within:outline-focus">
              <Search className="h-6 w-6 flex-none text-ink-muted" aria-hidden="true" />
              <input id={inputId} type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={copy.placeholder} autoComplete="off" />
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1344px] flex-wrap items-start gap-10 px-4 pb-[88px] pt-10 sm:px-6 md:px-12">
        <FilterDrawer
          id={drawerId}
          open={filtersOpen}
          onClose={closeFilters}
          viewResultsLabel={copy.viewLabel(results.length)}
          header={
            <>
              <h2 className="m-0 mr-auto font-display text-[26px] font-extrabold tracking-[-0.02em] text-navy">Filtros</h2>
              <button type="button" onClick={clearAll} disabled={!hasAnything} className={`min-h-[44px] cursor-pointer border-0 bg-transparent px-1 text-[15px] font-bold text-brand-green disabled:cursor-default disabled:text-ink-subtle ${focusRing}`}>
                Limpar tudo
              </button>
            </>
          }
        >
          {config.facets.map((facet) => {
            const props = { legend: facet.legend, allLabel: facet.allLabel, options: options[facet.key], selected: selection[facet.key] ?? [], onToggle: (value: string) => toggle(facet.key, value) };
            return facet.display === 'chips' ? <ChipFilter key={facet.key} {...props} /> : <FilterGroup key={facet.key} {...props} />;
          })}
        </FilterDrawer>

        <section aria-label="Resultados" className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 aria-live="polite" className="m-0 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-navy md:text-[34px]">
              {loading ? 'Carregando…' : copy.countLabel(results.length)}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls={drawerId} className="cf-btn compact lg:hidden">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filtros
                {activeFilters.length > 0 && (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-pill border-2 border-ink bg-gold px-1.5 text-[13px] font-bold">
                    <span className="sr-only">, </span>{activeFilters.length}<span className="sr-only"> ativos</span>
                  </span>
                )}
              </button>
              <label className="flex items-center gap-2.5 text-[15px] font-semibold">
                Ordenar por
                <select value={sort} onChange={(event) => update({ sort: event.target.value })} className={`h-11 cursor-pointer rounded-sm border-2 border-ink bg-surface px-3 text-[15px] font-semibold text-ink ${focusRing}`}>
                  {config.sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              {activeFilters.map(({ key, value, label }) => (
                <ActiveFilterPill key={`${key}:${value}`} label={label} onRemove={() => toggle(key, value)} />
              ))}
            </div>
          )}

          {loading ? null : results.length === 0 ? (
            <EmptyState title={copy.emptyTitle} text={copy.emptyText} actionLabel={hasAnything ? 'Limpar filtros' : undefined} onAction={clearAll} />
          ) : renderResults ? (
            renderResults(results, { selection, setFacet })
          ) : (
            <div className={`grid gap-6 ${GRID[cardSize]}`}>
              {results.map((item, index) => <Fragment key={getKey(item)}>{renderItem(item, index, selection)}</Fragment>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
