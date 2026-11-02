import { Bell, ChevronRight, LogOut, Menu, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { Avatar } from './Avatar';
import { CapyWordmark } from './CapyWordmark';

export function Layout({
  currentUser,
  onOpenCreateModal,
  onLogout,
  globalSearchQuery,
  onSearchChange,
  onSearchSubmit,
  children,
}: {
  currentUser: User;
  onOpenCreateModal: () => void;
  onLogout: () => void;
  globalSearchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/projetos', label: 'Projetos' },
    { to: '/pessoas', label: 'Pessoas' },
    { to: '/feed', label: 'Feed' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/perfil', label: 'Meu Portfólio' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink antialiased selection:bg-navy/15 selection:text-navy overflow-x-hidden">
      {/* NavBar: NavLink sets aria-current="page", which .cf-nav turns into the gold pill. */}
      <header className="cf-nav sticky top-0 z-30 flex-nowrap justify-between gap-x-4 px-4 sm:px-6 xl:px-12">
        <button type="button" onClick={() => navigate('/feed')} className="flex min-h-[44px] flex-none items-center cursor-pointer">
          <CapyWordmark showMascot size="md" />
        </button>

        {/* .cf-nav nav forces display:flex, so the wrapper does the responsive hiding. */}
        <div className="hidden lg:block">
          <nav aria-label="Principal">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>
        </div>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
          className="cf-search hidden min-w-0 flex-1 xl:flex"
        >
          <Search className="h-5 w-5 flex-none text-ink-muted" aria-hidden="true" />
          <input
            type="text"
            aria-label="Buscar"
            value={globalSearchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar..."
          />
        </form>

        <div className="flex flex-none items-center gap-3">
          <button type="button" onClick={onOpenCreateModal} className="cf-btn compact primary hidden xl:inline-flex">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Publicar</span>
          </button>

          <Link to="/eventos" className="cf-icon-btn relative" title="Notificações Acadêmicas" aria-label="Notificações Acadêmicas">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-ink bg-gold" aria-hidden="true" />
          </Link>

          <Link to="/perfil" className="hidden rounded-full sm:inline-flex" title={`Portfólio de ${currentUser.name}`}>
            <Avatar name={currentUser.name} src={currentUser.avatar} />
          </Link>

          <button type="button" onClick={onLogout} title="Sair para tela de Login" aria-label="Sair para tela de Login" className="cf-icon-btn hidden sm:inline-flex">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="cf-icon-btn xl:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Fechar menu" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto border-l-2 border-ink bg-surface p-4">
            <div className="flex items-center justify-between gap-3 border-b-2 border-line pb-4">
              <CapyWordmark showMascot size="sm" />
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu" className="cf-icon-btn">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Principal" className="mt-5 flex flex-col gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `flex min-h-[44px] items-center justify-between rounded-pill border-2 px-4 font-semibold text-ink ${isActive ? 'border-ink bg-gold' : 'border-transparent hover:bg-navy-tint'}`}
                >
                  <span>{label}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-3 border-t-2 border-line pt-5">
              <div role="search" className="cf-search">
                <Search className="h-5 w-5 flex-none text-ink-muted" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Buscar"
                  value={globalSearchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar..."
                />
              </div>
              <button type="button" onClick={() => { onOpenCreateModal(); setIsMobileMenuOpen(false); }} className="cf-btn primary w-full">
                <Plus className="h-5 w-5" aria-hidden="true" />
                Publicar
              </button>
              <button type="button" onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="cf-btn w-full">
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t-2 border-ink bg-surface">
        <div className="mx-auto flex max-w-[1344px] flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink-muted sm:px-6 md:px-12 lg:flex-row">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <CapyWordmark showMascot size="sm" />
            <span className="hidden text-line-strong sm:inline" aria-hidden="true">|</span>
            <span>Comunidade Universitária de Pesquisa, Projetos e Conhecimento</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-semibold text-ink">
            <Link to="/projetos" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-navy">Projetos</Link>
            <Link to="/pessoas" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-navy">Pessoas</Link>
            <Link to="/eventos" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-navy">Eventos</Link>
            <Link to="/feed" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-navy">Feed</Link>
            <Link to="/perfil" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-navy">Meu Portfólio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
