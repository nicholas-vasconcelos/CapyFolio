import type { User } from '../types';
import { PersonCard } from '../components/search/PersonCard';
import { TrendingPage, type TrendingSection } from '../components/trending/TrendingPage';

const FEATURED = 6;
const READY = 3;

/** Pessoas: the most connected students and those marked "Pronto p/ Mercado". */
export function PeoplePage({ users, loading = false }: { users: User[]; loading?: boolean }) {
  const featured = [...users].filter((u) => (u.connections ?? 0) > 0).sort((a, b) => (b.connections ?? 0) - (a.connections ?? 0)).slice(0, FEATURED);
  const ready = users.filter((u) => (u.badges ?? []).includes('career') && !featured.includes(u)).slice(0, READY);
  const sections: TrendingSection[] = [
    { key: 'destaque', title: 'Em destaque', description: 'Estudantes com mais conexões na comunidade.', cards: featured.map((user, i) => <PersonCard key={user.id} user={user} index={i} />) },
    { key: 'mercado', title: 'Prontos para o mercado', description: 'Estudantes com o selo Pronto p/ Mercado no perfil.', cards: ready.map((user, i) => <PersonCard key={user.id} user={user} index={i} />) },
  ];

  return (
    <TrendingPage
      kind="pessoas"
      eyebrow="Pessoas"
      title="Conheça quem está construindo"
      subtitle="Veja os estudantes em destaque. Para filtrar por especialidade, curso ou instituição, use a busca."
      searchLabel="Buscar pessoas por nome, área ou tecnologia"
      placeholder="Busque por nome, área ou tecnologia"
      sections={sections}
      searchAllLabel="Buscar e filtrar pessoas"
      searchAllText={`Busque entre ${users.length === 1 ? 'o único perfil' : `os ${users.length} perfis`}, com filtros de especialidade, curso, instituição e período.`}
      cardSize="wide"
      loading={loading}
    />
  );
}
