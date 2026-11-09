import type { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { TrendingPage, type TrendingSection } from '../components/trending/TrendingPage';

const OPEN = 6;
const POPULAR = 3;
const OPEN_STATUS = 'Inscrições abertas';

/** Eventos: what is open for registration now (events arrive soonest first) and the most attended. */
export function EventsPage({ events, registeredEventIds, onToggleRegistration, loading = false }: {
  events: Event[];
  registeredEventIds: string[];
  onToggleRegistration: (eventId: string) => void;
  loading?: boolean;
}) {
  const card = (event: Event) => (
    <EventCard key={event.id} event={event} isRegistered={registeredEventIds.includes(event.id)} onToggleRegistration={() => onToggleRegistration(event.id)} />
  );
  const open = events.filter((e) => e.status === OPEN_STATUS).slice(0, OPEN);
  const popular = events.filter((e) => !open.includes(e) && e.attendeesCount > 0).sort((a, b) => b.attendeesCount - a.attendeesCount).slice(0, POPULAR);
  const sections: TrendingSection[] = [
    { key: 'abertas', title: 'Inscrições abertas', description: 'Eventos que ainda aceitam inscrição, por ordem de data.', cards: open.map(card) },
    { key: 'procurados', title: 'Mais procurados', description: 'Os eventos com mais inscritos.', cards: popular.map(card) },
  ];

  return (
    <TrendingPage
      kind="eventos"
      eyebrow="Eventos"
      title="Agenda acadêmica e oportunidades"
      subtitle="Veja o que está com inscrições abertas e o que mais atrai gente. Para filtrar por tema, modalidade ou cidade, use a busca."
      searchLabel="Buscar eventos por nome, tema ou organizador"
      placeholder="Busque por nome, tema ou organizador"
      sections={sections}
      searchAllLabel="Buscar e filtrar eventos"
      searchAllText={`Busque entre ${events.length === 1 ? 'o único evento' : `os ${events.length} eventos`}, com filtros de tema, categoria, modalidade e cidade.`}
      cardSize="narrow"
      loading={loading}
    />
  );
}
