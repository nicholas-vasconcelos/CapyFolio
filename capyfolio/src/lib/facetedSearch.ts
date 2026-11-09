/*
 * Faceted search shared by the Pessoas, Projetos and Eventos screens. Each screen describes
 * its facets, text fields and sorts in a SearchConfig; these pure functions do the rest.
 * Kept free of React so a server-side query can replace `filterItems` later.
 *
 * Rules: text is a case-insensitive substring over `searchText`; within a facet any selected
 * value matches (OR) unless the facet says `match: 'all'`; across facets all must match (AND);
 * an empty facet is no restriction. Option counts are taken over the full list.
 */

export type Selection = Record<string, string[]>;

export interface Facet<T> {
  key: string;
  /** URL query param, in Portuguese so shared links read well. */
  param: string;
  legend: string;
  /** "Ver todos" / "Ver todas", agreeing with the plural noun. */
  allLabel: string;
  display?: 'chips' | 'checkboxes';
  values: (item: T) => string[];
  match?: 'any' | 'all';
  /** 'count' (default): most common first. 'natural': 1º, 2º… / A–Z. */
  order?: 'count' | 'natural';
  /** Fixed options with labels, e.g. flags stored as keys. Options nobody has are dropped. */
  fixed?: { value: string; label: string }[];
  /** Changing this facet clears every other facet and the sort (e.g. Tipo, whose choice swaps the other facets). */
  resetsOthers?: boolean;
}

export interface SortOption<T> {
  /** Also the URL value; the first sort is the default and is left out of the URL. */
  value: string;
  label: string;
  compare?: (a: T, b: T) => number;
}

export interface SearchConfig<T> {
  facets: Facet<T>[];
  searchText: (item: T) => string;
  sorts: SortOption<T>[];
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

const normalize = (value: string) => value.toLocaleLowerCase('pt-BR');
const naturalSort = (a: string, b: string) => a.localeCompare(b, 'pt-BR', { numeric: true });
export const byText = <T>(get: (item: T) => string) => (a: T, b: T) => get(a).localeCompare(get(b), 'pt-BR');
export const byNumberDesc = <T>(get: (item: T) => number) => (a: T, b: T) => get(b) - get(a);

export const emptySelection = <T>(config: SearchConfig<T>): Selection => Object.fromEntries(config.facets.map((f) => [f.key, []]));

export function matchesText<T>(config: SearchConfig<T>, item: T, query: string): boolean {
  const q = normalize(query.trim());
  return !q || normalize(config.searchText(item)).includes(q);
}

export function matchesFacets<T>(config: SearchConfig<T>, item: T, selection: Selection): boolean {
  return config.facets.every((facet) => {
    const selected = selection[facet.key] ?? [];
    if (!selected.length) return true;
    const own = facet.values(item);
    return facet.match === 'all' ? selected.every((v) => own.includes(v)) : selected.some((v) => own.includes(v));
  });
}

export function filterItems<T>(items: T[], config: SearchConfig<T>, query: string, selection: Selection, sort: string): T[] {
  const found = items.filter((item) => matchesText(config, item, query) && matchesFacets(config, item, selection));
  const compare = config.sorts.find((s) => s.value === sort)?.compare;
  return compare ? [...found].sort(compare) : found;
}

export function facetOptions<T>(items: T[], facet: Facet<T>): FacetOption[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const value of new Set(facet.values(item))) {
      if (value.trim()) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  if (facet.fixed) {
    return facet.fixed.map(({ value, label }) => ({ value, label, count: counts.get(value) ?? 0 })).filter((o) => o.count > 0);
  }
  const options = [...counts].map(([value, count]) => ({ value, label: value, count }));
  return facet.order === 'natural'
    ? options.sort((a, b) => naturalSort(a.label, b.label))
    : options.sort((a, b) => b.count - a.count || naturalSort(a.label, b.label));
}

export const optionLabel = <T>(facet: Facet<T>, value: string) => facet.fixed?.find((f) => f.value === value)?.label ?? value;

export function readParams<T>(params: URLSearchParams, config: SearchConfig<T>): { query: string; selection: Selection; sort: string } {
  const selection = Object.fromEntries(config.facets.map((f) => [f.key, params.getAll(f.param)]));
  const sortParam = params.get('ordem');
  const sort = config.sorts.find((s) => s.value === sortParam)?.value ?? config.sorts[0]?.value ?? '';
  return { query: params.get('q') ?? '', selection, sort };
}

export function writeParams<T>(config: SearchConfig<T>, query: string, selection: Selection, sort: string): URLSearchParams {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  for (const facet of config.facets) for (const value of selection[facet.key] ?? []) params.append(facet.param, value);
  if (sort && sort !== config.sorts[0]?.value) params.set('ordem', sort);
  return params;
}
