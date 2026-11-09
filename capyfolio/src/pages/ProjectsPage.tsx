import { useMemo } from 'react';
import type { Project, User } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { TrendingPage, type TrendingSection } from '../components/trending/TrendingPage';

const TRENDING = 3;
const RECENT = 6;

/** Projetos: the most favourited and the newest projects. Projects arrive newest first. */
export function ProjectsPage({ projects, users, favoritedProjectIds, onToggleFavorite, loading = false }: {
  projects: Project[];
  users: User[];
  favoritedProjectIds: string[];
  onToggleFavorite: (projectId: string) => void;
  loading?: boolean;
}) {
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const card = (project: Project) => (
    <ProjectCard
      key={project.id}
      project={project}
      author={usersById.get(project.authorIds[0])}
      isFavorited={favoritedProjectIds.includes(project.id)}
      onToggleFavorite={() => onToggleFavorite(project.id)}
    />
  );

  const trending = [...projects].filter((p) => (p.favorites ?? 0) > 0).sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0)).slice(0, TRENDING);
  const recent = projects.filter((p) => !trending.includes(p)).slice(0, RECENT);
  const sections: TrendingSection[] = [
    { key: 'em-alta', title: 'Em alta', description: 'Os projetos mais favoritados pela comunidade.', cards: trending.map(card) },
    { key: 'recentes', title: 'Publicados recentemente', description: 'Os projetos mais novos na CapyFolio.', cards: recent.map(card) },
  ];

  return (
    <TrendingPage
      kind="projetos"
      eyebrow="Projetos"
      title="Explorar pesquisas e projetos"
      subtitle="Veja o que está em alta e o que acabou de ser publicado. Para filtrar por tema, área ou instituição, use a busca."
      searchLabel="Buscar projetos por título, autor ou tema"
      placeholder="Busque por título, autor ou tema"
      sections={sections}
      searchAllLabel="Buscar e filtrar projetos"
      searchAllText={`Busque entre ${projects.length === 1 ? 'o único projeto publicado' : `os ${projects.length} projetos publicados`}, com filtros de tema, área, tipo e instituição.`}
      cardSize="narrow"
      loading={loading}
    />
  );
}
