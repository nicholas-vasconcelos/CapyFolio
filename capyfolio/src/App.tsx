import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Plus, Search, Share2 } from 'lucide-react';

import { AppDataProvider, useAppData } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toast } from './components/Toast';
import { CreateContentModal } from './components/CreateContentModal';
import { EventCard } from './components/EventCard';
import { PostCard } from './components/PostCard';
import { ProjectCard } from './components/ProjectCard';
import { UserCard } from './components/UserCard';
import Badge from './components/Badge';
import { Avatar } from './components/Avatar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { postService } from './services/postService';
import { projectService } from './services/projectService';
import type { Event, Post, Project, User } from './types';

function AppShell() {
  const { currentUser, isAuthenticated, login, register, logout } = useAuth();
  const { users, projects, events, posts, setUsers, setProjects, setPosts } = useAppData();
  const { toastMessage, showToast, clearToast } = useToast();
  const navigate = useNavigate();
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultTab, setCreateModalDefaultTab] = useState<'project' | 'post'>('project');
  const [favoritedProjectIds, setFavoritedProjectIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoritedProjectIds(JSON.parse(localStorage.getItem('capyfolio_favorites') ?? '[]'));
    setRegisteredEventIds(JSON.parse(localStorage.getItem('capyfolio_registrations') ?? '[]'));
    setConnectedUserIds(JSON.parse(localStorage.getItem('capyfolio_connections') ?? '[]'));
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const sessionUser = await login(email, password);
    if (!sessionUser) return false;
    showToast(`Sessão iniciada como ${sessionUser.name}.`);
    return true;
  };

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    institution: string;
    course: string;
    period: string;
    focus: string;
    tags: string[];
    bio: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      return 'As senhas não conferem.';
    }

    try {
      const created = await register(data);
      setUsers((previous) => [...previous, created]);
      showToast('Conta institucional criada com sucesso!');
      return null;
    } catch {
      return 'Erro ao criar a conta.';
    }
  };

  const persistFavoriteProjects = (next: string[]) => {
    localStorage.setItem('capyfolio_favorites', JSON.stringify(next));
    setFavoritedProjectIds(next);
  };

  const persistEventRegistrations = (next: string[]) => {
    localStorage.setItem('capyfolio_registrations', JSON.stringify(next));
    setRegisteredEventIds(next);
  };

  const persistConnections = (next: string[]) => {
    localStorage.setItem('capyfolio_connections', JSON.stringify(next));
    setConnectedUserIds(next);
  };

  const handleToggleFavoriteProject = (projectId: string) => {
    const next = favoritedProjectIds.includes(projectId)
      ? favoritedProjectIds.filter((id) => id !== projectId)
      : [...favoritedProjectIds, projectId];
    persistFavoriteProjects(next);
    showToast(next.includes(projectId) ? 'Projeto salvo nos seus favoritos acadêmicos!' : 'Projeto removido dos favoritos.');
  };

  const handleToggleEventRegistration = (eventId: string) => {
    const next = registeredEventIds.includes(eventId)
      ? registeredEventIds.filter((id) => id !== eventId)
      : [...registeredEventIds, eventId];
    persistEventRegistrations(next);
    showToast(next.includes(eventId) ? 'Inscrição confirmada!' : 'Inscrição cancelada.');
  };

  const handleToggleConnect = (userId: string) => {
    const next = connectedUserIds.includes(userId)
      ? connectedUserIds.filter((id) => id !== userId)
      : [...connectedUserIds, userId];
    persistConnections(next);
    showToast(next.includes(userId) ? 'Conexão acadêmica adicionada!' : 'Conexão removida.');
  };

  const handleCreatePost = async (payload: { category: string; content: string; relatedProjectId?: string | null }) => {
    if (!currentUser) return;

    const created: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: `${currentUser.course ?? 'Estudante'} • ${currentUser.period ?? 'Período'}`,
      authorInstitution: currentUser.shortInstitution || currentUser.institution,
      authorAvatar: currentUser.avatar || '',
      isOrganization: false,
      category: payload.category,
      timestamp: 'Agora mesmo',
      content: payload.content,
      relatedProjectId: payload.relatedProjectId ?? null,
      relatedEventId: null,
      likes: 1,
      likedByMe: true,
      comments: [],
    };

    const saved = await postService.create(created);
    setPosts((previous) => [saved, ...previous]);
    showToast('Publicação compartilhada com a comunidade.');
    setIsCreateModalOpen(false);
    navigate('/feed');
  };

  const handleCreateProject = async (payload: {
    title: string;
    shortDescription: string;
    summary: string;
    area: string;
    type: string;
    status: string;
    period: string;
    tags: string[];
    url: string;
    setAsFeatured: boolean;
    keyResults: string[];
  }) => {
    if (!currentUser) return;

    const nextProject: Project = {
      id: `p-${Date.now()}`,
      title: payload.title,
      shortDescription: payload.shortDescription,
      summary: payload.summary,
      keyResults: payload.keyResults.length ? payload.keyResults : ['Projeto publicado com resultados iniciais relevantes.'],
      methodology: payload.summary,
      files: [{ name: 'relatorio_tecnico.pdf', size: '1.2 MB', type: 'Relatório PDF' }],
      authorIds: [currentUser.id],
      authorNames: currentUser.name,
      institution: currentUser.institution,
      area: payload.area,
      type: payload.type,
      status: payload.status,
      date: new Date().toISOString().slice(0, 10),
      period: payload.period,
      tags: payload.tags,
      url: payload.url,
      visualType: 'standard',
      media: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=1200&auto=format&fit=crop&q=80',
      favorites: 1,
    };

    const saved = await projectService.create(nextProject);
    setProjects((previous) => [saved, ...previous]);

    if (payload.setAsFeatured) {
      setUsers((previous) =>
        previous.map((user) => (user.id === currentUser.id ? { ...user, featuredProjectId: saved.id } : user)),
      );
    }

    showToast('Projeto publicado com sucesso!');
    setIsCreateModalOpen(false);
    navigate(`/projeto/${saved.id}`);
  };

  const handleToggleLikePost = async (postId: string) => {
    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      const liked = !post.likedByMe;
      return {
        ...post,
        likedByMe: liked,
        likes: Math.max(0, liked ? post.likes + 1 : post.likes - 1),
      };
    });
    setPosts(nextPosts);
    await postService.replaceAll(nextPosts);
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [
          ...post.comments,
          {
            id: `comment-${Date.now()}`,
            authorName: currentUser.name,
            authorInstitution: currentUser.shortInstitution || currentUser.institution,
            text: text.trim(),
            timestamp: 'Agora',
          },
        ],
      };
    });

    setPosts(nextPosts);
    await postService.replaceAll(nextPosts);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isAuthenticated && currentUser ? (
        <Layout
          currentUser={currentUser}
          onOpenCreateModal={() => {
            setCreateModalDefaultTab('project');
            setIsCreateModalOpen(true);
          }}
          onLogout={handleLogout}
          globalSearchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          onSearchSubmit={() => navigate('/pessoas')}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<ProtectedRoute><FeedPage currentUser={currentUser} posts={posts} projects={projects} events={events} users={users} onOpenCreateModal={(tab) => { setCreateModalDefaultTab(tab); setIsCreateModalOpen(true); }} onToggleLike={handleToggleLikePost} onAddComment={handleAddComment} /></ProtectedRoute>} />
            <Route path="/projetos" element={<ProtectedRoute><ProjectsPage projects={projects} users={users} favoritedProjectIds={favoritedProjectIds} onToggleFavorite={handleToggleFavoriteProject} /></ProtectedRoute>} />
            <Route path="/projeto/:id" element={<ProtectedRoute><ProjectDetailPage projects={projects} users={users} favoritedProjectIds={favoritedProjectIds} onToggleFavorite={handleToggleFavoriteProject} /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><EventsPage events={events} registeredEventIds={registeredEventIds} onToggleRegistration={handleToggleEventRegistration} /></ProtectedRoute>} />
            <Route path="/evento/:id" element={<ProtectedRoute><EventDetailPage events={events} registeredEventIds={registeredEventIds} onToggleRegistration={handleToggleEventRegistration} /></ProtectedRoute>} />
            <Route path="/pessoas" element={<ProtectedRoute><PeoplePage users={users} connectedUserIds={connectedUserIds} onToggleConnect={handleToggleConnect} initialSearch={globalSearchQuery} /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage currentUser={currentUser} users={users} projects={projects} connectedUserIds={connectedUserIds} onToggleConnect={handleToggleConnect} onSetFeaturedProject={(projectId) => { setUsers((previous) => previous.map((user) => (user.id === currentUser.id ? { ...user, featuredProjectId: projectId } : user))); showToast('Projeto em destaque atualizado.'); }} onOpenNewProject={() => { setCreateModalDefaultTab('project'); setIsCreateModalOpen(true); }} /></ProtectedRoute>} />
            <Route path="/perfil/:id" element={<ProtectedRoute><ProfilePage currentUser={currentUser} users={users} projects={projects} connectedUserIds={connectedUserIds} onToggleConnect={handleToggleConnect} onSetFeaturedProject={(projectId) => { setUsers((previous) => previous.map((user) => (user.id === currentUser.id ? { ...user, featuredProjectId: projectId } : user))); showToast('Projeto em destaque atualizado.'); }} onOpenNewProject={() => { setCreateModalDefaultTab('project'); setIsCreateModalOpen(true); }} /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/cadastro" element={<RegisterPage onRegister={handleRegister} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {isCreateModalOpen && currentUser && (
        <CreateContentModal
          currentUser={currentUser}
          projects={projects}
          defaultTab={createModalDefaultTab}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitPost={handleCreatePost}
          onSubmitProject={handleCreateProject}
        />
      )}

      <Toast message={toastMessage} onClose={clearToast} />
    </>
  );
}

function FeedPage({ currentUser, posts, projects, events, onOpenCreateModal, onToggleLike, onAddComment }: {
  currentUser: User;
  posts: Post[];
  projects: Project[];
  events: Event[];
  users: User[];
  onOpenCreateModal: (tab: 'project' | 'post') => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}) {
  return (
    <div className="bg-paper">
      <section className="capy-hero-shell">
        <div className="mx-auto max-w-[1344px] px-4 py-10 sm:px-6 md:px-12 md:py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[17px] font-semibold text-gold-light">Feed acadêmico</span>
              <h1 className="font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-6xl lg:text-[76px]">Bem-vindo, {currentUser.name}</h1>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <button type="button" onClick={() => onOpenCreateModal('post')} className="cf-btn lg on-navy">
                Nova postagem
              </button>
              <button type="button" onClick={() => onOpenCreateModal('project')} className="cf-btn lg cta on-navy-cta">
                + Publicar projeto
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1344px] px-4 pb-16 pt-10 sm:px-6 md:px-12 md:pt-14">
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-8">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border-2 border-ink bg-surface p-6 shadow-card md:p-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <Avatar name={post.authorName} size="md" tone="navy" />
                  <div className="min-w-0 flex-[1_1_200px]">
                    <strong className="block font-display text-[21px] font-bold leading-[1.2] text-ink">{post.authorName}</strong>
                    <span className="text-[15px] text-ink-muted">{post.authorRole} • {post.authorInstitution}</span>
                  </div>
                  <span className="cf-tag topic flex-none">{post.category}</span>
                </div>

                <p className="mt-5 text-[19px] leading-[1.6] text-ink">{post.content}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => onToggleLike(post.id)} aria-pressed={!!post.likedByMe} className={`cf-counter ${post.likedByMe ? 'liked' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={post.likedByMe ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11Z" /></svg>
                    {post.likes}
                  </button>
                  <button type="button" className="cf-counter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" /></svg>
                    {post.comments.length}
                  </button>
                  <span className="ml-auto text-sm text-ink-muted">{post.timestamp}</span>
                </div>

                {post.comments.length > 0 && (
                  <div className="mt-5 flex flex-col gap-3">
                    {post.comments.slice(-1).map((comment) => (
                      <div key={comment.id} className="cf-comment">
                        <Avatar name={comment.authorName} size="xs" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between gap-3">
                            <strong>{comment.authorName}</strong>
                            <span className="text-sm text-ink-muted">{comment.timestamp}</span>
                          </div>
                          <p className="text-base leading-[1.5] text-ink">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget as HTMLFormElement;
                    const input = form.querySelector('input') as HTMLInputElement | null;
                    if (!input || !input.value.trim()) return;
                    onAddComment(post.id, input.value);
                    input.value = '';
                  }}
                  className="mt-5 flex flex-wrap gap-3"
                >
                  <input aria-label={`Responder como ${currentUser.name}`} placeholder="Responder como Arthur" className="cf-input h-12 min-w-[200px] flex-1" />
                  <button type="submit" className="cf-btn primary">
                    Enviar
                  </button>
                </form>
              </article>
            ))}
          </div>

          <aside className="flex w-full max-w-[380px] flex-col gap-8">
            <div className="cf-card gold">
              <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Projetos em destaque</h2>
              <div className="flex flex-col gap-3">
                {projects.slice(0, 3).map((project) => (
                  <a key={project.id} href={`/projeto/${project.id}`} className="cf-tile">
                    <span className="ic bg-navy-tint text-ink" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/></svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="truncate">{project.title}</strong>
                      <span className="meta">{project.area}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="cf-card">
              <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Próximos eventos</h2>
              <div className="flex flex-col gap-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="rounded-lg border-2 border-ink bg-surface px-4 py-3 shadow-sm">
                    <strong className="block font-display text-[17px] font-bold leading-[1.25] text-ink">{event.title}</strong>
                    <span className="mt-1 block text-sm text-ink-muted">{event.date} • {event.city}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ProjectsPage({ projects, users, favoritedProjectIds, onToggleFavorite }: {
  projects: Project[];
  users: User[];
  favoritedProjectIds: string[];
  onToggleFavorite: (projectId: string) => void;
}) {
  return (
    <div className="bg-paper">
      <section className="capy-hero-shell">
        <div className="mx-auto flex max-w-[1344px] flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6 md:px-12 md:py-14">
          <div className="flex flex-col gap-2">
            <span className="text-[17px] font-semibold text-gold-light">Projetos</span>
            <h1 className="max-w-[15em] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-[56px] lg:text-[68px]">Explorar pesquisas e projetos</h1>
          </div>
          <span className="cf-tag on-navy">
            <Search className="h-4 w-4" aria-hidden="true" />
            {projects.length} projetos
          </span>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1344px] grid-cols-1 gap-6 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-2 md:px-12 md:pt-14 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            author={users.find((user) => user.id === project.authorIds[0])}
            isFavorited={favoritedProjectIds.includes(project.id)}
            onToggleFavorite={() => onToggleFavorite(project.id)}
          />
        ))}
      </main>
    </div>
  );
}

function ProjectDetailPage({ projects, users, favoritedProjectIds, onToggleFavorite }: {
  projects: Project[];
  users: User[];
  favoritedProjectIds: string[];
  onToggleFavorite: (projectId: string) => void;
}) {
  const { id } = useParams();
  const project = projects.find((item) => item.id === id) ?? projects[0];
  const [activeTab, setActiveTab] = useState('Visão geral');
  const authors = users.filter((user) => project.authorIds.includes(user.id));
  const tabs = ['Visão geral', 'Metodologia', 'Resultados', 'Arquivos', 'Autores'];

  if (!project) {
    return <NotFoundPage />;
  }

  return (
    <div className="bg-paper">
      <section className="capy-hero-shell">
        <div className="mx-auto max-w-[1344px] px-4 pt-6 pb-10 sm:px-6 md:px-12 md:pt-8 md:pb-16">
          <nav aria-label="Trilha" className="cf-crumbs mb-8 flex-wrap items-center">
            <Link to="/projetos" className="hover:underline">Projetos</Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-xl truncate">{project.title}</span>
          </nav>

          <div className="flex flex-wrap gap-8 md:gap-10 items-start">
            <div className="relative h-[260px] w-[260px] flex-none overflow-hidden rounded-2xl border-[3px] border-paper bg-brand-green shadow-card-gold" aria-label={project.title}>
              <svg viewBox="0 0 260 260" className="absolute inset-0 h-full w-full stroke-green-tint opacity-60" fill="none" strokeWidth="2" aria-hidden="true">
                <ellipse cx="140" cy="140" rx="30" ry="22" />
                <ellipse cx="140" cy="140" rx="70" ry="48" />
                <ellipse cx="138" cy="142" rx="115" ry="88" />
                <ellipse cx="135" cy="145" rx="160" ry="118" />
              </svg>
              <span className="absolute left-5 top-5 flex h-16 w-16 items-center justify-center rounded-sm border-[3px] border-ink bg-gold text-ink">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/></svg>
              </span>
            </div>

            <div className="min-w-0 flex-[1_1_420px]">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="cf-tag topic">{project.area}</span>
                <span className={`cf-tag ${project.status === 'Concluído' ? 'done' : 'progress'}`}>{project.status}</span>
                <span className="ml-auto text-sm text-on-navy-muted">{project.date}</span>
              </div>

              <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-none tracking-[-0.03em] text-on-navy [text-wrap:balance] md:text-5xl lg:text-[56px]">{project.title}</h1>

              <div className="mt-5 flex flex-col gap-1">
                <strong className="font-display text-xl font-bold text-on-navy">{authors.map((author) => author.name).join(', ') || 'Equipe acadêmica'}</strong>
                <span className="text-base text-on-navy-muted">{project.institution}</span>
              </div>

              <p className="mt-5 max-w-[62ch] text-[19px] leading-[1.6] text-on-navy-muted">{project.summary}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="cf-tag on-navy">{tag}</span>
                ))}
                <button type="button" onClick={() => onToggleFavorite(project.id)} aria-pressed={favoritedProjectIds.includes(project.id)} className="cf-btn cta on-navy-cta ml-auto">
                  {favoritedProjectIds.includes(project.id) ? 'Salvo' : 'Favoritar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1344px] px-4 pb-16 pt-10 sm:px-6 md:px-12 md:pt-14">
        <div className="cf-tabs" role="tablist" aria-label="Seções do projeto">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="cf-tab cursor-pointer"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-10">
          <div className="min-w-0 flex-[1_1_480px]">
            <div className="rounded-2xl border-2 border-ink bg-surface p-7 shadow-card md:p-8">
              {activeTab === 'Visão geral' && (
                <>
                  <h2 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Resumo</h2>
                  <p className="mt-4 text-[19px] leading-[1.6] text-ink">{project.summary}</p>
                </>
              )}
              {activeTab === 'Metodologia' && <p className="text-[19px] leading-[1.6] text-ink">{project.methodology}</p>}
              {activeTab === 'Resultados' && (
                <ul className="flex flex-col gap-3">
                  {project.keyResults.map((item) => (
                    <li key={item} className="cf-result">
                      <i aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12l5 5L20 7" /></svg></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'Arquivos' && (
                <div className="flex flex-col gap-3">
                  {project.files.map((file) => (
                    <div key={file.name} className="rounded-lg border-2 border-ink bg-surface px-4 py-3 text-base font-medium text-ink shadow-sm">
                      {file.name} <span className="text-ink-muted">({file.size})</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'Autores' && (
                <div className="flex flex-col gap-3">
                  {authors.map((author) => (
                    <div key={author.id} className="flex items-center gap-3.5 rounded-lg border-2 border-ink bg-surface px-4 py-3 shadow-sm">
                      <Avatar name={author.name} src={author.avatar} />
                      <div>
                        <p className="font-display text-[17px] font-bold text-ink">{author.name}</p>
                        <p className="text-sm text-ink-muted">{author.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="w-full max-w-[360px]">
            <div className="cf-card shadow-card-gold">
              <span className="text-[17px] font-semibold text-brand-green">Projeto</span>
              <h3>{project.title}</h3>
              <div className="flex flex-col gap-1">
                <p><span className="font-bold text-ink">Tipo:</span> {project.type}</p>
                <p><span className="font-bold text-ink">Status:</span> {project.status}</p>
                <p><span className="font-bold text-ink">Período:</span> {project.period}</p>
                <p><span className="font-bold text-ink">Instituição:</span> {project.institution}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="cf-tag skill">{tag}</span>
                ))}
              </div>
              {project.url && (
                <a href={project.url} target="_blank" rel="noreferrer" className="cf-btn primary w-full">
                  Abrir repositório
                  <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function EventsPage({ events, registeredEventIds, onToggleRegistration }: {
  events: Event[];
  registeredEventIds: string[];
  onToggleRegistration: (eventId: string) => void;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="capy-hero-shell">
        <div className="mx-auto flex max-w-[1344px] flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6 md:px-12 md:py-14">
          <div className="flex flex-col gap-2">
            <span className="text-[17px] font-semibold text-gold-light">Eventos</span>
            <h1 className="max-w-[15em] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-[56px] lg:text-[68px]">Agenda acadêmica e oportunidades</h1>
          </div>
          <span className="cf-tag on-navy">
            <Search className="h-4 w-4" aria-hidden="true" />
            {events.length} eventos
          </span>
        </div>
      </section>

      <main className="mx-auto max-w-[1344px] px-4 pb-16 pt-10 sm:px-6 md:px-12 md:pt-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isRegistered={registeredEventIds.includes(event.id)} onToggleRegistration={() => onToggleRegistration(event.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}

function EventDetailPage({ events, registeredEventIds, onToggleRegistration }: {
  events: Event[];
  registeredEventIds: string[];
  onToggleRegistration: (eventId: string) => void;
}) {
  const { id } = useParams();
  const event = events.find((item) => item.id === id) ?? events[0];

  if (!event) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="capy-hero-shell">
        <div className="mx-auto max-w-[1344px] px-4 pt-6 pb-10 sm:px-6 md:px-12 md:pt-8 md:pb-14">
          <nav aria-label="Trilha" className="cf-crumbs mb-8 flex-wrap items-center">
            <Link to="/eventos" className="hover:underline">Eventos</Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-md truncate">{event.title}</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[17px] font-semibold text-gold-light">Evento</span>
              <h1 className="max-w-[15em] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-[56px] lg:text-[68px]">{event.title}</h1>
            </div>
            <span className={`cf-tag ${event.status === 'Inscrições abertas' ? 'done' : ''}`}>
              {event.status}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1344px] px-4 pb-16 pt-10 sm:px-6 md:px-12 md:pt-14">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-3xl border-2 border-ink bg-surface p-3 shadow-card-green">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&auto=format&fit=crop&q=80" alt={event.title} className="h-80 w-full rounded-lg object-cover" />
            </div>

            <div className="rounded-2xl border-2 border-ink bg-surface p-7 shadow-card">
              <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Sobre o evento</h2>
              <p className="mt-3 max-w-[68ch] text-base leading-[1.5] text-ink-muted">{event.aboutText}</p>
              <div className="mt-6 flex flex-col gap-3">
                {event.schedule.map((item) => (
                  <div key={`${event.id}-${item.time}-${item.title}`} className="rounded-lg border-2 border-ink bg-surface px-4 py-3 shadow-sm">
                    <p className="text-sm font-bold text-navy [font-variant-numeric:tabular-nums]">{item.time}</p>
                    <p className="mt-1 font-display text-[17px] font-bold text-ink">{item.title}</p>
                    <p className="text-sm text-ink-muted">{item.speaker}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="cf-card gold">
              <span className="text-[17px] font-semibold text-green-ink">Resumo</span>
              <h3>{event.title}</h3>
              <div className="flex flex-col gap-1">
                <p><span className="font-bold text-ink">Categoria:</span> {event.category}</p>
                <p><span className="font-bold text-ink">Status:</span> {event.status}</p>
                <p><span className="font-bold text-ink">Data:</span> {event.date}</p>
                <p><span className="font-bold text-ink">Local:</span> {event.location}</p>
                <p><span className="font-bold text-ink">Modalidade:</span> {event.modality}</p>
              </div>
              <button
                type="button"
                disabled={event.status !== 'Inscrições abertas'}
                onClick={() => onToggleRegistration(event.id)}
                aria-pressed={registeredEventIds.includes(event.id)}
                className="cf-btn primary w-full disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-paper-deep disabled:text-ink-muted disabled:shadow-none disabled:transform-none"
              >
                {registeredEventIds.includes(event.id) ? 'Inscrito' : 'Inscrever-se'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PeoplePage({ users, connectedUserIds, onToggleConnect, initialSearch }: {
  users: User[];
  connectedUserIds: string[];
  onToggleConnect: (userId: string) => void;
  initialSearch: string;
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const target = `${user.name} ${user.focus} ${user.institution}`.toLowerCase();
      return target.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, users]);

  return (
    <div className="bg-paper">
      <section className="capy-hero-shell">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-6 px-4 py-10 sm:px-6 md:px-12 md:py-14">
          <div className="flex flex-col gap-2">
            <span className="text-[17px] font-semibold text-gold-light">Pessoas</span>
            <h1 className="max-w-[15em] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-[56px] lg:text-[68px]">Conecte-se com estudantes e pesquisadores</h1>
          </div>
          <div role="search" className="cf-search hero w-full max-w-2xl">
            <Search className="h-6 w-6 flex-none text-ink-muted" aria-hidden="true" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} aria-label="Buscar por nome ou foco" placeholder="Buscar por nome ou foco" />
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1344px] grid-cols-1 gap-6 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-2 md:px-12 md:pt-14 xl:grid-cols-3">
        {filteredUsers.map((user, index) => (
          <UserCard key={user.id} user={user} index={index} isConnected={connectedUserIds.includes(user.id)} onToggleConnect={() => onToggleConnect(user.id)} />
        ))}
      </main>
    </div>
  );
}

function ProfilePage({ currentUser, users, projects, connectedUserIds, onToggleConnect, onSetFeaturedProject, onOpenNewProject }: {
  currentUser: User;
  users: User[];
  projects: Project[];
  connectedUserIds: string[];
  onToggleConnect: (userId: string) => void;
  onSetFeaturedProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}) {
  const { id } = useParams();
  const profileUser = users.find((user) => user.id === id) ?? currentUser;
  const isOwnProfile = !id || id === currentUser.id;
  const visibleProjects = projects.filter((project) => project.authorIds.includes(profileUser.id));
  const featuredProject = projects.find((project) => project.id === profileUser.featuredProjectId) ?? visibleProjects[0];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="capy-hero-shell overflow-hidden">
        <div className="mx-auto box-border max-w-[1344px] px-4 pb-16 pt-8 sm:px-6 md:px-12 md:pb-24 md:pt-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img src={profileUser.avatar || ''} alt={profileUser.name} className="h-[200px] w-[200px] rounded-4xl border-[3px] border-paper object-cover shadow-photo sm:h-[240px] sm:w-[240px] md:h-[280px] md:w-[280px]" />
              <div className="min-w-0">
                <h1 className="m-0 font-display text-[clamp(2.9rem,9vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em] text-on-navy md:text-[104px]">{profileUser.name.split(' ')[0]}</h1>
                <p className="mt-2 font-display text-base font-bold leading-[1.2] text-gold-light sm:text-[22px] md:text-[26px]">{profileUser.focus}</p>
                <p className="mt-1 text-sm text-on-navy-muted sm:text-base md:text-lg">{profileUser.institution}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3.5 md:justify-end">
              {isOwnProfile ? (
                <button type="button" onClick={onOpenNewProject} className="cf-btn cta on-navy-cta h-[52px]">
                  <Plus className="h-5 w-5" aria-hidden="true" /> Novo projeto
                </button>
              ) : (
                <button type="button" onClick={() => onToggleConnect(profileUser.id)} aria-pressed={connectedUserIds.includes(profileUser.id)} className="cf-btn on-navy h-[52px]">
                  {connectedUserIds.includes(profileUser.id) ? 'Conectado' : 'Conectar'}
                </button>
              )}
              <button type="button" className="cf-btn on-navy h-[52px]">
                <Share2 className="h-5 w-5" aria-hidden="true" />
                Compartilhar portfólio
              </button>
            </div>
          </div>

          <p className="mt-8 max-w-[62ch] text-base leading-[1.6] text-on-navy-muted sm:text-[18px] md:text-[19px]">{profileUser.bio || 'Estudante com foco em projetos práticos, inovação e desenvolvimento de soluções digitais com impacto profissional real.'}</p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {profileUser.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="cf-tag on-navy">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-14 max-w-[1344px] box-border px-4 pb-[88px] sm:px-6 md:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="cf-stat shadow-[5px_5px_0_var(--green)]">
            <span>Curso</span>
            <strong>{profileUser.course}</strong>
          </div>
          <div className="cf-stat shadow-[5px_5px_0_var(--gold)]">
            <span>Período</span>
            <strong>{profileUser.period}</strong>
          </div>
          <div className="cf-stat shadow-[5px_5px_0_var(--navy)]">
            <span>Conexões</span>
            <strong className="[font-variant-numeric:tabular-nums]">{profileUser.connections ?? 0}</strong>
          </div>
        </div>

        {profileUser.badges && profileUser.badges.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {profileUser.badges.map((badgeKey) => (
              <Badge key={badgeKey} type={badgeKey} />
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-4 self-start rounded-2xl border-2 border-ink bg-navy-tint p-7 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Especialidades</h3>
              <span className="cf-tag topic">Perfil</span>
            </div>
            <p className="text-base leading-[1.5] text-ink-soft">
              Áreas de atuação e principais competências acadêmicas do perfil profissional.
            </p>
            <div className="flex flex-wrap gap-2">
              {profileUser.tags.map((tag) => (
                <span key={tag} className="cf-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {featuredProject && (
              <div className="cf-card gold">
                <h3>Projeto em destaque</h3>
                <div className="overflow-hidden rounded-lg border-2 border-ink bg-surface">
                  <img src={featuredProject.media || ''} alt={featuredProject.title} className="h-40 w-full object-cover" />
                </div>
                <div>
                  <strong className="block font-display text-[21px] font-bold leading-[1.2] text-ink">{featuredProject.title}</strong>
                  <span className="mt-1 block text-[15px] text-ink-muted">{featuredProject.area}</span>
                </div>
                {isOwnProfile && (
                  <button type="button" onClick={() => onSetFeaturedProject(featuredProject.id)} className="self-start text-[15px] font-bold text-navy hover:underline">
                    Atualizar destaque
                  </button>
                )}
              </div>
            )}

            <div className="rounded-2xl border-2 border-ink bg-surface p-7 shadow-card-green">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Outros projetos</h3>
                {isOwnProfile && visibleProjects.length > 0 && (
                  <button type="button" onClick={onOpenNewProject} className="cf-link hover:underline">Adicionar projeto</button>
                )}
              </div>

              {visibleProjects.length === 0 ? (
                <div className="cf-empty mt-6">
                  <p>Você ainda não publicou nenhum projeto.</p>
                  {isOwnProfile && (
                    <button type="button" onClick={onOpenNewProject} className="cf-btn cta">
                      Criar meu primeiro projeto
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {visibleProjects.map((project) => (
                    <div key={project.id} className="cf-project">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`cf-tag ${project.status === 'Concluído' ? 'done' : 'progress'} px-3 py-1 text-[13px]`}>{project.status}</span>
                        {profileUser.featuredProjectId === project.id && <span className="text-sm font-bold text-green-ink">Destaque</span>}
                      </div>
                      <strong>{project.title}</strong>
                      <span className="sum">{project.area}</span>
                      <div className="mt-auto flex gap-2">
                        <Link to={`/projeto/${project.id}`} className="cf-btn primary h-11 flex-1 px-4 text-[15px]">Abrir</Link>
                        {isOwnProfile && (
                          <button type="button" onClick={() => onSetFeaturedProject(project.id)} className="cf-btn h-11 px-4 text-[15px]">
                            Destaque
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[1344px] px-4 py-16 sm:px-6 md:px-12">
      <div className="cf-empty mx-auto max-w-2xl">
        <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Página não encontrada</h1>
        <p>A rota que você tentou acessar não existe ou foi removida.</p>
        <Link to="/feed" className="cf-btn primary">Voltar ao feed</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
