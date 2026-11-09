import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Event, Project, User } from '../types';
import type { Selection } from '../lib/facetedSearch';
import { SEARCH_KINDS, isSearchKind, unifiedSearch, type SearchItem, type SearchKind } from '../lib/searchConfigs';
import { FacetedSearchPage, type FacetedSearchCopy } from '../components/search/FacetedSearchPage';
import { CARD_GRID, type CardSize } from '../components/search/cardGrid';
import { PersonCard } from '../components/search/PersonCard';
import { ProjectCard } from '../components/ProjectCard';
import { EventCard } from '../components/EventCard';

const PREVIEW_PER_KIND = 4;

const plural = (one: string, many: string) => (n: number) => (n === 1 ? `1 ${one}` : `${n} ${many}`);

const KIND_COPY: Record<SearchKind, FacetedSearchCopy & { cardSize: CardSize; noun: (n: number) => string }> = {
  pessoas: {
    title: 'Encontre estudantes pelo que já construíram',
    subtitle: 'Filtre por especialidade, curso, instituição e período. Cada resultado leva ao portfólio completo.',
    searchLabel: 'Buscar pessoas por nome, área ou tecnologia',
    placeholder: 'Busque por nome, área ou tecnologia',
    countLabel: plural('perfil encontrado', 'perfis encontrados'),
    viewLabel: (n) => `Ver ${plural('perfil', 'perfis')(n)}`,
    emptyTitle: 'Nenhum perfil com esses filtros',
    emptyText: 'Remova algum filtro ou busque por outra especialidade para ver mais estudantes.',
    cardSize: 'wide',
    noun: plural('perfil', 'perfis'),
  },
  projetos: {
    title: 'Explorar pesquisas e projetos',
    subtitle: 'Filtre por tema, área, tipo e instituição. Cada resultado leva à página completa do projeto.',
    searchLabel: 'Buscar projetos por título, autor ou tema',
    placeholder: 'Busque por título, autor ou tema',
    countLabel: plural('projeto encontrado', 'projetos encontrados'),
    viewLabel: (n) => `Ver ${plural('projeto', 'projetos')(n)}`,
    emptyTitle: 'Nenhum projeto com esses filtros',
    emptyText: 'Remova algum filtro ou busque por outro tema para ver mais projetos.',
    cardSize: 'narrow',
    noun: plural('projeto', 'projetos'),
  },
  eventos: {
    title: 'Agenda acadêmica e oportunidades',
    subtitle: 'Filtre por tema, categoria, modalidade e cidade. Inscreva-se direto pelo cartão do evento.',
    searchLabel: 'Buscar eventos por nome, tema ou organizador',
    placeholder: 'Busque por nome, tema ou organizador',
    countLabel: plural('evento encontrado', 'eventos encontrados'),
    viewLabel: (n) => `Ver ${plural('evento', 'eventos')(n)}`,
    emptyTitle: 'Nenhum evento com esses filtros',
    emptyText: 'Remova algum filtro ou busque por outro tema para ver mais eventos.',
    cardSize: 'narrow',
    noun: plural('evento', 'eventos'),
  },
};

const ALL_COPY: FacetedSearchCopy = {
  title: 'Busque pessoas, projetos e eventos',
  subtitle: 'Tudo da CapyFolio em um só lugar. Escolha um tipo nos filtros para ver as opções dele.',
  searchLabel: 'Buscar em pessoas, projetos e eventos',
  placeholder: 'Busque por nome, tema ou tecnologia',
  countLabel: plural('resultado', 'resultados'),
  viewLabel: (n) => `Ver ${plural('resultado', 'resultados')(n)}`,
  emptyTitle: 'Nada encontrado com essa busca',
  emptyText: 'Tente outro termo ou remova algum filtro para ver mais resultados.',
};

/**
 * Busca: searches people, projects and events together. `?tipo=` narrows it (the trending pages
 * link here with their own type); with exactly one type, its own filters and sorts appear.
 */
export function SearchPage({ users, projects, events, favoritedProjectIds, registeredEventIds, onToggleFavorite, onToggleRegistration, loading = false }: {
  users: User[];
  projects: Project[];
  events: Event[];
  favoritedProjectIds: string[];
  registeredEventIds: string[];
  onToggleFavorite: (projectId: string) => void;
  onToggleRegistration: (eventId: string) => void;
  loading?: boolean;
}) {
  const [searchParams] = useSearchParams();
  const kindsKey = searchParams.getAll('tipo').filter(isSearchKind).join(',');
  const kinds = useMemo(() => (kindsKey ? (kindsKey.split(',') as SearchKind[]) : []), [kindsKey]);
  const only = kinds.length === 1 ? kinds[0] : null;

  const config = useMemo(() => unifiedSearch(kinds, favoritedProjectIds, registeredEventIds), [kinds, favoritedProjectIds, registeredEventIds]);
  const items = useMemo<SearchItem[]>(() => [
    ...users.map((item) => ({ kind: 'pessoas' as const, item })),
    ...projects.map((item) => ({ kind: 'projetos' as const, item })),
    ...events.map((item) => ({ kind: 'eventos' as const, item })),
  ], [users, projects, events]);
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const renderItem = (entry: SearchItem, index: number, selection: Selection) => {
    switch (entry.kind) {
      case 'pessoas':
        return <PersonCard user={entry.item} index={index} highlighted={selection.specialty ?? []} />;
      case 'projetos':
        return (
          <ProjectCard
            project={entry.item}
            author={usersById.get(entry.item.authorIds[0])}
            isFavorited={favoritedProjectIds.includes(entry.item.id)}
            onToggleFavorite={() => onToggleFavorite(entry.item.id)}
          />
        );
      case 'eventos':
        return <EventCard event={entry.item} isRegistered={registeredEventIds.includes(entry.item.id)} onToggleRegistration={() => onToggleRegistration(entry.item.id)} />;
    }
  };

  // Several types at once: one group per type, a preview of each and a way to narrow to it.
  const renderGrouped = (results: SearchItem[], { selection, setFacet }: { selection: Selection; setFacet: (key: string, values: string[]) => void }) => (
    <div className="flex flex-col gap-12">
      {SEARCH_KINDS.map(({ value: kind, label }) => {
        const ofKind = results.filter((entry) => entry.kind === kind);
        if (!ofKind.length) return null;
        const { cardSize, noun } = KIND_COPY[kind];
        return (
          <section key={kind} aria-labelledby={`busca-${kind}`} className="flex flex-col gap-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-line pb-3">
              <h3 id={`busca-${kind}`} className="m-0 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">
                {label} <span className="font-sans text-base font-semibold text-ink-muted">· {noun(ofKind.length)}</span>
              </h3>
              <button type="button" onClick={() => setFacet('kind', [kind])} className="cf-link inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[15px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-focus">
                {ofKind.length > PREVIEW_PER_KIND ? `Ver todos os ${noun(ofKind.length)}` : `Filtrar só ${label.toLowerCase()}`}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className={`grid gap-6 ${CARD_GRID[cardSize]}`}>
              {ofKind.slice(0, PREVIEW_PER_KIND).map((entry, index) => (
                <div key={entry.item.id} className="contents">{renderItem(entry, index, selection)}</div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <FacetedSearchPage
      config={config}
      items={items}
      loading={loading}
      getKey={(entry) => `${entry.kind}:${entry.item.id}`}
      renderItem={renderItem}
      renderResults={only ? undefined : renderGrouped}
      cardSize={only ? KIND_COPY[only].cardSize : 'narrow'}
      copy={only ? KIND_COPY[only] : ALL_COPY}
    />
  );
}
