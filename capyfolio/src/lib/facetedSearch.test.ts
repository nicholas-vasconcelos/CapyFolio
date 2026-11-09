import { describe, expect, it } from 'vitest';
import type { Event, Project, User } from '../types';
import { emptySelection, facetOptions, filterItems, readParams, writeParams } from './facetedSearch';
import { eventSearch, peopleSearch, projectSearch, searchHref, unifiedSearch, type SearchItem } from './searchConfigs';

const user = (id: string, over: Partial<User>): User => ({ id, name: id, focus: '', institution: '', tags: [], ...over });
const people = [
  user('Bia', { tags: ['React', 'Python'], course: 'Estatística', badges: ['career', 'verified'], connections: 5 }),
  user('Ana', { tags: ['Python'], course: 'Computação', badges: ['verified'], connections: 9 }),
  user('Caio', { tags: ['React'], course: 'Computação', focus: 'Dados', connections: 1 }),
];
const names = (list: { name: string }[]) => list.map((u) => u.name);
const select = (over: Record<string, string[]>) => ({ ...emptySelection(peopleSearch), ...over });
const facet = (key: string) => peopleSearch.facets.find((f) => f.key === key)!;

describe('filterItems (people)', () => {
  it('matches text over name, role and specialties, case-insensitively', () => {
    expect(names(filterItems(people, peopleSearch, 'dados', select({}), 'relevancia'))).toEqual(['Caio']);
    expect(names(filterItems(people, peopleSearch, 'PYTH', select({}), 'relevancia'))).toEqual(['Bia', 'Ana']);
  });
  it('ORs within a facet and ANDs across facets', () => {
    const s = select({ specialty: ['React', 'Python'], course: ['Computação'] });
    expect(names(filterItems(people, peopleSearch, '', s, 'relevancia'))).toEqual(['Ana', 'Caio']);
  });
  it('requires every selected profile flag', () => {
    expect(names(filterItems(people, peopleSearch, '', select({ flag: ['career', 'verified'] }), 'relevancia'))).toEqual(['Bia']);
  });
  it('sorts by connections and by name', () => {
    expect(names(filterItems(people, peopleSearch, '', select({}), 'conexoes'))).toEqual(['Ana', 'Bia', 'Caio']);
    expect(names(filterItems(people, peopleSearch, '', select({}), 'nome'))).toEqual(['Ana', 'Bia', 'Caio']);
  });
});

describe('facetOptions', () => {
  it('counts against the full list, most common first', () => {
    expect(facetOptions(people, facet('course'))).toEqual([
      { value: 'Computação', label: 'Computação', count: 2 },
      { value: 'Estatística', label: 'Estatística', count: 1 },
    ]);
  });
  it('labels fixed options and drops the ones nobody has', () => {
    expect(facetOptions(people, facet('flag')).map((o) => [o.label, o.count])).toEqual([['Pronto p/ Mercado', 1], ['Perfil Verificado', 2]]);
    expect(facetOptions([people[2]], facet('flag'))).toEqual([]);
  });
});

it('round-trips through URL params and leaves the default sort out', () => {
  const selection = select({ specialty: ['React', 'Node.js'], flag: ['career'] });
  const params = writeParams(peopleSearch, 'ia', selection, 'nome');
  expect(readParams(params, peopleSearch)).toEqual({ query: 'ia', selection, sort: 'nome' });
  expect(writeParams(peopleSearch, '', selection, 'relevancia').has('ordem')).toBe(false);
});

describe('project and event configs', () => {
  const project = (id: string, over: Partial<Project>) => ({ id, title: id, shortDescription: '', authorNames: '', area: '', type: '', status: '', institution: '', period: '', tags: [], ...over }) as Project;
  const event = (id: string, over: Partial<Event>) => ({ id, title: id, shortDescription: '', category: '', status: '', organizer: '', city: '', location: '', modality: '', tags: [], attendeesCount: 0, ...over }) as Event;

  it('filters projects to the user’s favourites and sorts by favourites', () => {
    const config = projectSearch(['b']);
    const list = [project('a', { favorites: 3 }), project('b', { favorites: 1 }), project('c', { favorites: 7 })];
    expect(filterItems(list, config, '', { ...emptySelection(config), saved: ['sim'] }, 'relevancia').map((p) => p.id)).toEqual(['b']);
    expect(filterItems(list, config, '', emptySelection(config), 'favoritos').map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });

  it('filters events by modality and the user’s registrations', () => {
    const config = eventSearch(['x']);
    const list = [event('x', { modality: 'Online' }), event('y', { modality: 'Presencial' }), event('z', { modality: 'Online' })];
    const online = { ...emptySelection(config), modality: ['Online'] };
    expect(filterItems(list, config, '', online, 'relevancia').map((e) => e.id)).toEqual(['x', 'z']);
    expect(filterItems(list, config, '', { ...online, registered: ['sim'] }, 'relevancia').map((e) => e.id)).toEqual(['x']);
  });
});

describe('unifiedSearch', () => {
  const p = (id: string, over: Partial<Project> = {}) => ({ id, title: id, shortDescription: '', authorNames: '', area: '', type: '', status: '', institution: '', period: '', tags: [], ...over }) as Project;
  const items: SearchItem[] = [
    { kind: 'pessoas', item: user('Python Pessoa', { tags: ['Python'] }) },
    { kind: 'projetos', item: p('Projeto Python', { area: 'Dados', tags: ['Python'] }) },
    { kind: 'projetos', item: p('Projeto Web', { area: 'Web' }) },
  ];
  const ids = (list: SearchItem[]) => list.map((e) => e.item.id);

  it('searches every type when no Tipo is chosen, with only the Tipo facet', () => {
    const config = unifiedSearch([], [], []);
    expect(config.facets.map((f) => f.key)).toEqual(['kind']);
    expect(ids(filterItems(items, config, 'python', emptySelection(config), 'relevancia'))).toEqual(['Python Pessoa', 'Projeto Python']);
  });

  it('adds that type’s facets and sorts when exactly one Tipo is chosen', () => {
    const config = unifiedSearch(['projetos'], [], []);
    expect(config.facets.map((f) => f.key)).toContain('area');
    expect(config.sorts.map((s) => s.value)).toContain('favoritos');
    const selection = { ...emptySelection(config), kind: ['projetos'], area: ['Web'] };
    expect(ids(filterItems(items, config, '', selection, 'relevancia'))).toEqual(['Projeto Web']);
  });

  it('builds scoped links to Busca', () => {
    expect(searchHref('eventos', ' ia ')).toBe('/busca?tipo=eventos&q=ia');
    expect(searchHref('pessoas')).toBe('/busca?tipo=pessoas');
  });
});

it('never reuses a URL param between the Tipo facet and a type’s facets', () => {
  for (const kind of ['pessoas', 'projetos', 'eventos'] as const) {
    const params = unifiedSearch([kind], [], []).facets.map((f) => f.param);
    expect(new Set(params).size).toBe(params.length);
  }
});
