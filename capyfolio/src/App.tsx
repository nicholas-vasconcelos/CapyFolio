import { useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Download } from 'lucide-react';

import { AppDataProvider, useAppData } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { Toast } from './components/Toast';
import { CreateContentModal, type NewPostSubmission } from './components/CreateContentModal';
import { FEED_COMMENT_LIMIT, PostCard } from './components/PostCard';
import { PostPage } from './pages/PostPage';
import { PeoplePage } from './pages/PeoplePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { EventsPage } from './pages/EventsPage';
import { SearchPage } from './pages/SearchPage';
import { Avatar } from './components/Avatar';
import { PhotoGrid } from './components/PhotoGrid';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { postService } from './services/postService';
import { projectService } from './services/projectService';
import { userService } from './services/userService';
import { connectionService, favoriteService, registrationService } from './services/membershipServices';
import type { Event, Post, Project, ProjectFile, User } from './types';
import { NewProjectPage } from './pages/NewProjectPage';
import type { NewProjectSubmission } from './pages/NewProjectPage';
import { uploadImage, uploadProjectFile } from './lib/storage';
import { TEXT_LIMITS, isBlockedContentError, validateText } from './lib/contentRules';
import { externalUrl } from './lib/url';
import { t } from './i18n';

const SAVE_ERROR_MESSAGE = 'Não foi possível salvar. Tente novamente.';

/** Adds or removes `id` from a list without duplicates. */
const toggleId = (ids: string[], id: string, on: boolean) => (on ? (ids.includes(id) ? ids : [...ids, id]) : ids.filter((entry) => entry !== id));

function AppShell() {
  const { currentUser, isAuthenticated, isPasswordRecovery, isDemo, login, loginAsDemo, register, logout, setCurrentUser } = useAuth();
  const {
    users, projects, events, posts, favoritedProjectIds, registeredEventIds, connectedUserIds, loading,
    setUsers, setProjects, setEvents, setPosts, setFavoritedProjectIds, setRegisteredEventIds, setConnectedUserIds,
  } = useAppData();
  const { toastMessage, showToast, clearToast } = useToast();
  const navigate = useNavigate();
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultTab, setCreateModalDefaultTab] = useState<'project' | 'post'>('project');

  const handleLogin = async (email: string, password: string): Promise<true | string> => {
    try {
      const sessionUser = await login(email, password);
      if (!sessionUser) return 'E-mail ou senha incorretos';
      showToast(`Sessão iniciada como ${sessionUser.name}.`);
      return true;
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'EMAIL_NOT_CONFIRMED') {
        return 'Confirme seu e-mail antes de entrar. Procure o link que enviamos para sua caixa de entrada.';
      }
      console.error(cause);
      return 'Não foi possível entrar agora. Tente novamente.';
    }
  };

  const handleDemoLogin = async (): Promise<true | string> => {
    try {
      const sessionUser = await loginAsDemo();
      if (!sessionUser) return 'A conta de demonstração não está disponível agora.';
      showToast('Você está na conta de demonstração. Explore à vontade: nada será salvo.');
      return true;
    } catch (cause) {
      console.error(cause);
      return 'Não foi possível abrir a demonstração. Tente novamente.';
    }
  };

  /** `null` = signed in; `'confirm_email'` = account created, waiting for email confirmation; otherwise an error message. */
  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    educationLevel: string;
    educationStatus: string | null;
    institution: string;
    course: string;
    period: string;
    focus: string;
    tags: string[];
    bio: string;
    defaultAvatarUrl: string;
    photo: File | null;
  }): Promise<string | null> => {
    if (data.password !== data.confirmPassword) {
      return 'As senhas não conferem.';
    }

    try {
      const { confirmPassword: _confirm, ...input } = data;
      const result = await register(input);
      if (result.status === 'confirm_email') return 'confirm_email';
      showToast(
        result.photoFailed
          ? 'Conta criada, mas não foi possível enviar a foto. Você pode trocá-la ao personalizar o perfil.'
          : 'Conta institucional criada com sucesso!',
      );
      return null;
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'EMAIL_TAKEN') {
        return 'Este e-mail já está cadastrado.';
      }
      console.error(cause);
      return 'Erro ao criar a conta.';
    }
  };

  /**
   * Optimistic toggle for a per-account id list: update the UI first, write one row, roll back and toast on error.
   * `adjust` mirrors the visible counter change on the related item.
   */
  const toggleMembership = async (options: {
    id: string;
    on: boolean;
    setIds: (updater: (ids: string[]) => string[]) => void;
    write: (profileId: string, id: string, on: boolean) => Promise<void>;
    adjust: (delta: number) => void;
    successMessage: string;
  }) => {
    if (!currentUser) return;
    const { id, on, setIds, write, adjust, successMessage } = options;
    setIds((ids) => toggleId(ids, id, on));
    adjust(on ? 1 : -1);
    try {
      await write(currentUser.id, id, on);
      showToast(successMessage);
    } catch (cause) {
      console.error(cause);
      setIds((ids) => toggleId(ids, id, !on));
      adjust(on ? -1 : 1);
      showToast(SAVE_ERROR_MESSAGE);
    }
  };

  const handleToggleFavoriteProject = (projectId: string) => {
    const on = !favoritedProjectIds.includes(projectId);
    void toggleMembership({
      id: projectId,
      on,
      setIds: setFavoritedProjectIds,
      write: favoriteService.set,
      adjust: (delta) =>
        setProjects((previous) =>
          previous.map((project) => (project.id === projectId ? { ...project, favorites: Math.max(0, (project.favorites ?? 0) + delta) } : project)),
        ),
      successMessage: on ? 'Projeto salvo nos seus favoritos acadêmicos!' : 'Projeto removido dos favoritos.',
    });
  };

  const handleToggleEventRegistration = (eventId: string) => {
    const on = !registeredEventIds.includes(eventId);
    void toggleMembership({
      id: eventId,
      on,
      setIds: setRegisteredEventIds,
      write: registrationService.set,
      adjust: (delta) =>
        setEvents((previous) =>
          previous.map((event) => (event.id === eventId ? { ...event, attendeesCount: Math.max(0, event.attendeesCount + delta) } : event)),
        ),
      successMessage: on ? 'Inscrição confirmada!' : 'Inscrição cancelada.',
    });
  };

  const handleToggleConnect = (userId: string) => {
    if (!currentUser || userId === currentUser.id) return;
    const on = !connectedUserIds.includes(userId);
    void toggleMembership({
      id: userId,
      on,
      setIds: setConnectedUserIds,
      write: connectionService.set,
      // Only the target's counter: the signed-in user's own count is refreshed on the next load.
      adjust: (delta) =>
        setUsers((previous) =>
          previous.map((user) => (user.id === userId ? { ...user, connections: Math.max(0, (user.connections ?? 0) + delta) } : user)),
        ),
      successMessage: on ? 'Conexão acadêmica adicionada!' : 'Conexão removida.',
    });
  };

  /** Single place that persists a changed user and mirrors it into app state. Rolls back and toasts on error. */
  const handleUpdateUser = async (next: User) => {
    const previous = users.find((user) => user.id === next.id) ?? currentUser;
    setUsers((list) => list.map((user) => (user.id === next.id ? next : user)));
    try {
      const saved = await userService.update(next);
      setUsers((list) => list.map((user) => (user.id === saved.id ? saved : user)));
      setCurrentUser(saved);
    } catch (cause) {
      console.error(cause);
      if (previous) setUsers((list) => list.map((user) => (user.id === previous.id ? previous : user)));
      showToast(isBlockedContentError(cause) ? t.validation.blockedByServer : SAVE_ERROR_MESSAGE);
      throw cause;
    }
  };

  /** The logged-in user as stored in `users`, which is fresher than the session copy. */
  const currentUserRecord = () => users.find((user) => user.id === currentUser?.id) ?? currentUser;

  const handleSetFeaturedProject = async (projectId: string) => {
    const owner = currentUserRecord();
    if (!owner) return;
    try {
      await handleUpdateUser({ ...owner, featuredProjectId: projectId });
      showToast('Projeto em destaque atualizado.');
    } catch {
      // handleUpdateUser already rolled back and showed a toast.
    }
  };

  /** Uploads the post's photos, then saves it. False (after a toast) when something failed, so the popup keeps the draft. */
  const handleCreatePost = async (payload: NewPostSubmission): Promise<boolean> => {
    if (!currentUser) return false;

    let images: string[];
    try {
      images = await Promise.all((payload.photos ?? []).map((file) => uploadImage('project-media', file)));
    } catch (cause) {
      console.error(cause);
      showToast(cause instanceof Error && cause.message ? cause.message : 'Não foi possível enviar as fotos. Tente novamente.');
      return false;
    }

    try {
      const saved = await postService.create(
        { category: payload.category, content: payload.content, relatedProjectId: payload.relatedProjectId ?? null, images },
        currentUser.id,
      );
      setPosts((previous) => [saved, ...previous]);
      showToast('Publicação compartilhada com a comunidade.');
      setIsCreateModalOpen(false);
      navigate('/feed');
      return true;
    } catch (cause) {
      console.error(cause);
      showToast(isBlockedContentError(cause) ? t.validation.blockedByServer : 'Não foi possível publicar. Tente novamente.');
      return false;
    }
  };

  /** Uploads the attachments, saves the project and opens it. False (after a toast) when something failed. */
  const handleCreateProject = async (payload: NewProjectSubmission): Promise<boolean> => {
    if (!currentUser) return false;

    let images: string[];
    try {
      images = await Promise.all(payload.photos.map((file) => uploadImage('project-media', file)));
    } catch (cause) {
      console.error(cause);
      showToast(cause instanceof Error && cause.message ? cause.message : 'Não foi possível enviar as fotos. Tente novamente.');
      return false;
    }

    let files: ProjectFile[];
    try {
      files = await Promise.all(
        payload.attachments.map((attachment) =>
          attachment.kind === 'file'
            ? uploadProjectFile(attachment.file)
            : Promise.resolve<ProjectFile>({ kind: 'link', name: attachment.name, size: '', type: 'Link', url: attachment.url }),
        ),
      );
    } catch (cause) {
      console.error(cause);
      showToast(cause instanceof Error && cause.message ? cause.message : 'Não foi possível enviar os arquivos. Tente novamente.');
      return false;
    }

    let saved: Project;
    try {
      saved = await projectService.create(
        {
          title: payload.title,
          shortDescription: payload.shortDescription,
          summary: payload.summary,
          keyResults: payload.keyResults,
          methodology: payload.methodology,
          institution: currentUser.institution,
          area: payload.area,
          type: payload.type,
          status: payload.status,
          period: payload.period,
          tags: payload.tags,
          url: payload.url,
          files,
          images,
        },
        currentUser.id,
      );
    } catch (cause) {
      console.error(cause);
      showToast(isBlockedContentError(cause) ? t.validation.blockedByServer : 'Não foi possível publicar o projeto. Tente novamente.');
      return false;
    }

    setProjects((previous) => [saved, ...previous]);

    if (payload.setAsFeatured) {
      const owner = currentUserRecord();
      if (owner) {
        try {
          await handleUpdateUser({ ...owner, featuredProjectId: saved.id });
        } catch {
          // The project is published; only the featured flag failed, and a toast already said so.
        }
      }
    }

    showToast('Projeto publicado com sucesso!');
    navigate(`/projeto/${saved.id}`);
    return true;
  };

  const openNewProject = () => {
    setIsCreateModalOpen(false);
    navigate('/projeto/novo');
  };

  const updatePost = (postId: string, update: (post: Post) => Post) =>
    setPosts((previous) => previous.map((post) => (post.id === postId ? update(post) : post)));

  const handleToggleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const target = posts.find((post) => post.id === postId);
    if (!target) return;
    const liked = !target.likedByMe;
    const apply = (on: boolean) => (post: Post) => ({
      ...post,
      likedByMe: on,
      likes: Math.max(0, post.likes + (on ? 1 : -1)),
    });

    updatePost(postId, apply(liked));
    try {
      await postService.toggleLike(postId, currentUser.id, liked);
    } catch (cause) {
      console.error(cause);
      updatePost(postId, apply(!liked));
      showToast(SAVE_ERROR_MESSAGE);
    }
  };

  /** Checks the comment and starts saving it. False (with a toast) when the text was refused, so the box keeps it. */
  const handleAddComment = (postId: string, text: string): boolean => {
    const body = text.trim();
    if (!currentUser || !body) return false;
    const problem = validateText(body, 'Comentário', TEXT_LIMITS.comment);
    if (problem) {
      showToast(problem);
      return false;
    }
    void saveComment(postId, body);
    return true;
  };

  const saveComment = async (postId: string, body: string) => {
    if (!currentUser) return;

    const tempId = `pending-${crypto.randomUUID()}`;
    updatePost(postId, (post) => ({
      ...post,
      comments: [
        ...post.comments,
        {
          id: tempId,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorInstitution: currentUser.shortInstitution || currentUser.institution,
          text: body,
          timestamp: 'Agora mesmo',
        },
      ],
    }));

    try {
      const saved = await postService.addComment(postId, currentUser.id, body);
      updatePost(postId, (post) => ({ ...post, comments: post.comments.map((comment) => (comment.id === tempId ? saved : comment)) }));
    } catch (cause) {
      console.error(cause);
      updatePost(postId, (post) => ({ ...post, comments: post.comments.filter((comment) => comment.id !== tempId) }));
      showToast(isBlockedContentError(cause) ? t.validation.blockedByServer : 'Não foi possível enviar o comentário. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isPasswordRecovery) {
    return (
      <>
        <ResetPasswordPage />
        <Toast message={toastMessage} onClose={clearToast} />
      </>
    );
  }

  return (
    <>
      {isAuthenticated && currentUser ? (
        <Layout
          currentUser={currentUser}
          isDemo={isDemo}
          onOpenCreateModal={() => {
            setCreateModalDefaultTab('project');
            setIsCreateModalOpen(true);
          }}
          onLogout={handleLogout}
          globalSearchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          onSearchSubmit={() => {
            // The header search covers people, projects and events; Busca owns the text from here.
            const query = globalSearchQuery.trim();
            navigate(query ? `/busca?${new URLSearchParams({ q: query })}` : '/busca');
            setGlobalSearchQuery('');
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            {/* Already signed in (e.g. after the demo button): the login and sign-up pages lead to the feed. */}
            <Route path="/login" element={<Navigate to="/feed" replace />} />
            <Route path="/cadastro" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<ProtectedRoute><FeedPage currentUser={currentUser} posts={posts} projects={projects} events={events} users={users} onOpenCreateModal={(tab) => { if (tab === 'project') openNewProject(); else { setCreateModalDefaultTab(tab); setIsCreateModalOpen(true); } }} onToggleLike={handleToggleLikePost} onAddComment={handleAddComment} /></ProtectedRoute>} />
            <Route path="/post/:id" element={<ProtectedRoute><PostPage currentUser={currentUser} posts={posts} loading={loading} onToggleLike={handleToggleLikePost} onAddComment={handleAddComment} /></ProtectedRoute>} />
            <Route path="/projetos" element={<ProtectedRoute><ProjectsPage loading={loading} projects={projects} users={users} favoritedProjectIds={favoritedProjectIds} onToggleFavorite={handleToggleFavoriteProject} /></ProtectedRoute>} />
            <Route path="/projeto/novo" element={<ProtectedRoute><NewProjectPage currentUser={currentUser} onSubmit={handleCreateProject} /></ProtectedRoute>} />
            <Route path="/projeto/:id" element={<ProtectedRoute><ProjectDetailPage projects={projects} loading={loading} users={users} favoritedProjectIds={favoritedProjectIds} onToggleFavorite={handleToggleFavoriteProject} /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><EventsPage loading={loading} events={events} registeredEventIds={registeredEventIds} onToggleRegistration={handleToggleEventRegistration} /></ProtectedRoute>} />
            <Route path="/evento/:id" element={<ProtectedRoute><EventDetailPage events={events} loading={loading} registeredEventIds={registeredEventIds} onToggleRegistration={handleToggleEventRegistration} /></ProtectedRoute>} />
            <Route path="/pessoas" element={<ProtectedRoute><PeoplePage users={users} loading={loading} /></ProtectedRoute>} />
            <Route path="/busca" element={<ProtectedRoute><SearchPage loading={loading} users={users} projects={projects} events={events} favoritedProjectIds={favoritedProjectIds} registeredEventIds={registeredEventIds} onToggleFavorite={handleToggleFavoriteProject} onToggleRegistration={handleToggleEventRegistration} /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage currentUser={currentUser} users={users} projects={projects} connectedUserIds={connectedUserIds} onToggleConnect={handleToggleConnect} onSetFeaturedProject={handleSetFeaturedProject} onUpdateUser={handleUpdateUser} onOpenNewProject={openNewProject} /></ProtectedRoute>} />
            <Route path="/perfil/:id" element={<ProtectedRoute><ProfilePage currentUser={currentUser} users={users} projects={projects} connectedUserIds={connectedUserIds} onToggleConnect={handleToggleConnect} onSetFeaturedProject={handleSetFeaturedProject} onUpdateUser={handleUpdateUser} onOpenNewProject={openNewProject} /></ProtectedRoute>} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} onDemoLogin={handleDemoLogin} />} />
          <Route path="/cadastro" element={<RegisterPage onRegister={handleRegister} />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {isCreateModalOpen && currentUser && (
        <CreateContentModal
          defaultTab={createModalDefaultTab}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitPost={handleCreatePost}
          onStartProject={openNewProject}
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
  onAddComment: (postId: string, text: string) => boolean;
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
              <PostCard
                key={post.id}
                post={post}
                currentUserName={currentUser.name}
                commentLimit={FEED_COMMENT_LIMIT}
                onToggleLike={() => onToggleLike(post.id)}
                onAddComment={(text) => onAddComment(post.id, text)}
              />
            ))}
          </div>

          <aside className="flex w-full max-w-[380px] flex-col gap-8">
            <div className="cf-card gold">
              <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Projetos em destaque</h2>
              <div className="flex flex-col gap-3">
                {featuredProjects(projects).slice(0, 3).map((project) => (
                  <Link key={project.id} to={`/projeto/${project.id}`} className="cf-tile">
                    {project.images[0] ? (
                      <img src={project.images[0]} alt="" loading="lazy" className="h-11 w-11 flex-none rounded-sm border-2 border-ink object-cover" />
                    ) : (
                      <span className="ic bg-navy-tint text-ink" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/></svg>
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <strong className="truncate">{project.title}</strong>
                      <span className="meta">{project.area}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="cf-card">
              <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Próximos eventos</h2>
              <div className="flex flex-col gap-3">
                {upcomingEvents(events).slice(0, 3).map((event) => (
                  <Link key={event.id} to={`/evento/${event.id}`} className="flex items-center gap-3 rounded-lg border-2 border-ink bg-surface px-3 py-3 no-underline shadow-sm hover:bg-paper">
                    {event.cover && <img src={event.cover} alt="" loading="lazy" className="h-12 w-12 flex-none rounded-sm border-2 border-ink object-cover" />}
                    <span className="min-w-0">
                      <strong className="block font-display text-[17px] font-bold leading-[1.25] text-ink">{event.title}</strong>
                      <span className="mt-1 block text-sm text-ink-muted">{event.date} • {event.city}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ProjectDetailPage({ projects, users, favoritedProjectIds, onToggleFavorite, loading }: {
  projects: Project[];
  loading: boolean;
  users: User[];
  favoritedProjectIds: string[];
  onToggleFavorite: (projectId: string) => void;
}) {
  const { id } = useParams();
  // No fallback to another project: an unknown id is a not-found page, not the first project.
  const project = projects.find((item) => item.id === id);
  const [activeTab, setActiveTab] = useState('Visão geral');
  const tabs = ['Visão geral', 'Metodologia', 'Resultados', 'Arquivos', 'Autores'];

  if (!project) {
    return loading ? <LoadingPage /> : <NotFoundPage />;
  }
  const authors = users.filter((user) => project.authorIds.includes(user.id));

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
            {project.images[0] ? (
              <img src={project.images[0]} alt={project.title} className="h-[260px] w-[260px] flex-none rounded-2xl border-[3px] border-paper object-cover shadow-card-gold" />
            ) : (
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
            )}

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
        {project.images.length > 0 && (
          <section aria-label="Fotos do projeto" className="mb-10 rounded-3xl border-2 border-ink bg-surface p-3 shadow-card-green">
            <PhotoGrid images={project.images} alt={project.title} size="lg" />
          </section>
        )}

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
                  {project.keyResults.map((item, index) => (
                    <li key={`${index}-${item}`} className="cf-result">
                      <i aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12l5 5L20 7" /></svg></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'Arquivos' && project.files.length === 0 && (
                <div className="cf-empty">
                  <h3>Nenhum arquivo anexado</h3>
                  <p>Os autores ainda não adicionaram arquivos a este projeto.</p>
                </div>
              )}
              {activeTab === 'Arquivos' && project.files.length > 0 && (
                <div className="flex flex-col gap-3">
                  {project.files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-ink bg-surface px-4 py-3 text-base font-medium text-ink shadow-sm">
                      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                        {file.name}
                        <span className="block text-sm text-ink-muted">{[file.type, file.size].filter(Boolean).join(' • ')}</span>
                      </span>
                      {/* Sample rows only describe a file; there is nothing to download for them. */}
                      {file.url && (file.kind === 'link' ? (
                        <a href={externalUrl(file.url)} target="_blank" rel="noopener noreferrer" className="cf-btn h-11 flex-none px-4 text-[15px]">
                          Abrir link
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only"> {file.name} (abre em nova aba)</span>
                        </a>
                      ) : (
                        <a href={file.url} download={file.name} className="cf-btn h-11 flex-none px-4 text-[15px]">
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Baixar
                          <span className="sr-only"> {file.name}</span>
                        </a>
                      ))}
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
                <a href={externalUrl(project.url)} target="_blank" rel="noopener noreferrer" className="cf-btn primary w-full">
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

function EventDetailPage({ events, registeredEventIds, onToggleRegistration, loading }: {
  events: Event[];
  loading: boolean;
  registeredEventIds: string[];
  onToggleRegistration: (eventId: string) => void;
}) {
  const { id } = useParams();
  const event = events.find((item) => item.id === id);

  if (!event) {
    return loading ? <LoadingPage /> : <NotFoundPage />;
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
              <img src={event.cover ?? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&auto=format&fit=crop&q=80'} alt={event.title} className="h-80 w-full rounded-lg object-cover" />
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

/** Most favourited first, so the feed sidebar shows the community's highlights rather than the newest drafts. */
function featuredProjects(projects: Project[]): Project[] {
  return [...projects].sort((first, second) => (second.favorites ?? 0) - (first.favorites ?? 0));
}

/** Open events first, then the rest; the feed sidebar shows the top three. */
function upcomingEvents(events: Event[]): Event[] {
  const isOpen = (event: Event) => event.status === 'Inscrições abertas';
  return [...events.filter(isOpen), ...events.filter((event) => !isOpen(event))];
}

function LoadingPage() {
  return (
    <div className="mx-auto max-w-[1344px] px-4 py-16 sm:px-6 md:px-12">
      <p role="status" className="text-ink-muted">Carregando...</p>
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
      <ScrollToTop />
      <AuthProvider>
        <ToastProvider>
          <AppDataProvider>
            <AppShell />
          </AppDataProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
