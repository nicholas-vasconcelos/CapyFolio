import type { Event, Project, User } from '../types';
import { byNumberDesc, byText, type SearchConfig } from './facetedSearch';

const one = (value: string | undefined | null) => (value ? [value] : []);
const join = (...parts: (string | undefined | null | string[])[]) => parts.flat().filter(Boolean).join(' ');

/* Pessoas
 * Design → User: role → focus (falls back to role), specialties → tags,
 * institution → shortInstitution ?? institution, profile flags → badges 'career' / 'verified'.
 * The design's achievements (Evento, Certificação, Medalha) have no source, so there's no such facet. */

export const personRole = (user: User) => user.focus || user.role || '';
export const personInstitution = (user: User) => user.shortInstitution || user.institution;

export const peopleSearch: SearchConfig<User> = {
  facets: [
    { key: 'specialty', param: 'esp', legend: 'Especialidades', allLabel: 'Ver todas', display: 'chips', values: (u) => u.tags },
    { key: 'course', param: 'curso', legend: 'Curso', allLabel: 'Ver todos', values: (u) => one(u.course) },
    { key: 'institution', param: 'inst', legend: 'Instituição', allLabel: 'Ver todas', values: (u) => one(personInstitution(u)) },
    { key: 'period', param: 'periodo', legend: 'Período', allLabel: 'Ver todos', order: 'natural', values: (u) => one(u.period) },
    {
      key: 'flag',
      param: 'perfil',
      legend: 'Perfil',
      allLabel: 'Ver todos',
      match: 'all',
      values: (u) => u.badges ?? [],
      fixed: [
        { value: 'career', label: 'Pronto p/ Mercado' },
        { value: 'verified', label: 'Perfil Verificado' },
      ],
    },
  ],
  searchText: (u) => join(u.name, personRole(u), u.course, u.institution, u.shortInstitution, u.tags),
  sorts: [
    { value: 'relevancia', label: 'Relevância' },
    { value: 'conexoes', label: 'Mais conexões', compare: byNumberDesc((u) => u.connections ?? 0) },
    { value: 'nome', label: 'Nome (A–Z)', compare: byText((u) => u.name) },
  ],
};

/* Projetos. `favoritedIds` adds a "Meus favoritos" filter for the signed-in user. */

export const projectSearch = (favoritedIds: string[]): SearchConfig<Project> => ({
  facets: [
    { key: 'tag', param: 'tema', legend: 'Temas', allLabel: 'Ver todos', display: 'chips', values: (p) => p.tags },
    { key: 'area', param: 'area', legend: 'Área', allLabel: 'Ver todas', values: (p) => one(p.area) },
    { key: 'type', param: 'tipo-projeto', legend: 'Tipo de projeto', allLabel: 'Ver todos', values: (p) => one(p.type) },
    { key: 'status', param: 'status', legend: 'Status', allLabel: 'Ver todos', values: (p) => one(p.status) },
    { key: 'institution', param: 'inst', legend: 'Instituição', allLabel: 'Ver todas', values: (p) => one(p.institution) },
    { key: 'period', param: 'periodo', legend: 'Período', allLabel: 'Ver todos', order: 'natural', values: (p) => one(p.period) },
    {
      key: 'saved',
      param: 'salvos',
      legend: 'Seus projetos salvos',
      allLabel: 'Ver todos',
      values: (p) => (favoritedIds.includes(p.id) ? ['sim'] : []),
      fixed: [{ value: 'sim', label: 'Só meus favoritos' }],
    },
  ],
  searchText: (p) => join(p.title, p.shortDescription, p.authorNames, p.area, p.type, p.institution, p.tags),
  sorts: [
    { value: 'relevancia', label: 'Relevância' },
    { value: 'favoritos', label: 'Mais favoritados', compare: byNumberDesc((p) => p.favorites ?? 0) },
    { value: 'titulo', label: 'Título (A–Z)', compare: byText((p) => p.title) },
  ],
});

/* Eventos. `registeredIds` adds a "Minhas inscrições" filter for the signed-in user. */

export const eventSearch = (registeredIds: string[]): SearchConfig<Event> => ({
  facets: [
    { key: 'tag', param: 'tema', legend: 'Temas', allLabel: 'Ver todos', display: 'chips', values: (e) => e.tags },
    { key: 'category', param: 'categoria', legend: 'Categoria', allLabel: 'Ver todas', values: (e) => one(e.category) },
    { key: 'status', param: 'status', legend: 'Status', allLabel: 'Ver todos', values: (e) => one(e.status) },
    { key: 'modality', param: 'modalidade', legend: 'Modalidade', allLabel: 'Ver todas', values: (e) => one(e.modality) },
    { key: 'city', param: 'cidade', legend: 'Cidade', allLabel: 'Ver todas', values: (e) => one(e.city) },
    {
      key: 'registered',
      param: 'inscricao',
      legend: 'Suas inscrições',
      allLabel: 'Ver todas',
      values: (e) => (registeredIds.includes(e.id) ? ['sim'] : []),
      fixed: [{ value: 'sim', label: 'Só minhas inscrições' }],
    },
  ],
  searchText: (e) => join(e.title, e.shortDescription, e.category, e.organizer, e.city, e.location, e.tags),
  sorts: [
    { value: 'relevancia', label: 'Relevância' },
    { value: 'inscritos', label: 'Mais inscritos', compare: byNumberDesc((e) => e.attendeesCount) },
    { value: 'titulo', label: 'Título (A–Z)', compare: byText((e) => e.title) },
  ],
});

/* Busca: one search over all three. The Tipo facet narrows it; with exactly one type chosen,
 * that type's own facets and sorts join in (and changing Tipo clears them). */

export type SearchKind = 'pessoas' | 'projetos' | 'eventos';
export type SearchItem =
  | { kind: 'pessoas'; item: User }
  | { kind: 'projetos'; item: Project }
  | { kind: 'eventos'; item: Event };

export const SEARCH_KINDS: { value: SearchKind; label: string }[] = [
  { value: 'pessoas', label: 'Pessoas' },
  { value: 'projetos', label: 'Projetos' },
  { value: 'eventos', label: 'Eventos' },
];
export const isSearchKind = (value: string): value is SearchKind => SEARCH_KINDS.some((k) => k.value === value);

/** Lifts one type's config onto SearchItem; items of other kinds have no values and no text. */
function scoped<T>(kind: SearchKind, config: SearchConfig<T>): SearchConfig<SearchItem> {
  const own = (entry: SearchItem) => (entry.kind === kind ? (entry.item as T) : null);
  return {
    facets: config.facets.map((facet) => ({ ...facet, values: (entry) => { const item = own(entry); return item ? facet.values(item) : []; } })),
    searchText: (entry) => { const item = own(entry); return item ? config.searchText(item) : ''; },
    sorts: config.sorts.map((sort) => ({ ...sort, compare: sort.compare && ((a, b) => sort.compare!(a.item as T, b.item as T)) })),
  };
}

export function unifiedSearch(kinds: SearchKind[], favoritedIds: string[], registeredIds: string[]): SearchConfig<SearchItem> {
  const byKind = {
    pessoas: scoped('pessoas', peopleSearch),
    projetos: scoped('projetos', projectSearch(favoritedIds)),
    eventos: scoped('eventos', eventSearch(registeredIds)),
  };
  const kindFacet = {
    key: 'kind',
    param: 'tipo',
    legend: 'Tipo',
    allLabel: 'Ver todos',
    values: (entry: SearchItem) => [entry.kind],
    fixed: SEARCH_KINDS,
    resetsOthers: true,
  };
  const only = kinds.length === 1 ? byKind[kinds[0]] : null;
  return {
    facets: [kindFacet, ...(only?.facets ?? [])],
    searchText: (entry) => byKind[entry.kind].searchText(entry),
    sorts: only?.sorts ?? [{ value: 'relevancia', label: 'Relevância' }],
  };
}

/** Link to Busca limited to one type, optionally with a query. */
export const searchHref = (kind: SearchKind, query = '') => {
  const params = new URLSearchParams({ tipo: kind });
  if (query.trim()) params.set('q', query.trim());
  return `/busca?${params}`;
};
