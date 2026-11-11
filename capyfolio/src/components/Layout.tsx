import { ChevronRight, LogOut, Menu, PlayCircle, Plus, Search, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { Avatar } from './Avatar';
import { CapyWordmark } from './CapyWordmark';

export function Layout({
  currentUser,
  isDemo = false,
  onOpenCreateModal,
  onLogout,
  globalSearchQuery,
  onSearchChange,
  onSearchSubmit,
  children,
}: {
  currentUser: User;
  /** Signed in as the demo account: shows a strip saying nothing is saved. */
  isDemo?: boolean;
  onOpenCreateModal: () => void;
  onLogout: () => void;
  globalSearchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  // Busca has its own large search field, so the header one is hidden there.
  const showSearch = useLocation().pathname !== '/busca';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoNoteHidden, setIsDemoNoteHidden] = useState(false);
  // Header search: an icon button that expands into a field.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);
  const closeSearch = (returnFocus = true) => {
    setIsSearchOpen(false);
    if (returnFocus) window.setTimeout(() => searchButtonRef.current?.focus(), 0);
  };
  const profileMeta = currentUser.course || currentUser.focus;

  const navItems = [
    { to: '/feed', label: 'Feed' },
    { to: '/projetos', label: 'Projetos' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/pessoas', label: 'Pessoas' },
    { to: '/perfil', label: 'Meu Portfólio' },
  ];

  // The centred nav shows as many links as fit between the logo and the actions; the rest
  // drop off from the end and stay reachable in the menu. Measured from a hidden copy of the links.
  const headerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleNavCount, setVisibleNavCount] = useState(navItems.length);
  useLayoutEffect(() => {
    const header = headerRef.current, left = leftRef.current, right = rightRef.current, measure = measureRef.current;
    if (!header || !left || !right || !measure) return;
    const fit = () => {
      const style = getComputedStyle(header);
      const inner = header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const columnGap = parseFloat(style.columnGap) || 0;
      // Both side columns are as wide as the wider side, which keeps the nav truly centred.
      const available = inner - 2 * Math.max(left.offsetWidth, right.offsetWidth) - 2 * columnGap;
      const links = [...measure.children] as HTMLElement[];
      const linkGap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      let used = 0;
      let count = 0;
      for (const link of links) {
        const next = used + (count ? linkGap : 0) + link.offsetWidth;
        if (next > available) break;
        used = next;
        count += 1;
      }
      setVisibleNavCount(count);
    };
    fit();
    const observer = new ResizeObserver(fit);
    [header, left, right].forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink antialiased overflow-x-hidden">
      {/* NavBar: NavLink sets aria-current="page", which .cf-nav turns into the gold pill. */}
      <header ref={headerRef} className="cf-nav sticky top-0 z-30 grid grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] gap-x-4 px-4 sm:px-6 xl:px-12">
        <button ref={leftRef} type="button" onClick={() => navigate('/feed')} className="flex min-h-[44px] items-center justify-self-start cursor-pointer">
          <CapyWordmark showMascot size="md" />
        </button>

        <nav aria-label="Principal" className="min-w-0 flex-nowrap justify-center">
          {navItems.slice(0, visibleNavCount).map(({ to, label }) => (
            <NavLink key={to} to={to}>{label}</NavLink>
          ))}
        </nav>
        {/* Hidden copy used only to measure each link's width. */}
        <div ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex gap-1 [&>span]:whitespace-nowrap [&>span]:border-2 [&>span]:border-transparent [&>span]:px-4 [&>span]:py-2.5 [&>span]:text-base [&>span]:font-semibold">
          {navItems.map(({ to, label }) => <span key={to}>{label}</span>)}
        </div>

        <div ref={rightRef} className="flex items-center gap-3 justify-self-end">
          <button type="button" onClick={onOpenCreateModal} className="cf-btn compact primary hidden xl:inline-flex">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Publicar</span>
          </button>

          {showSearch && (isSearchOpen ? (
            // Phones: the field covers the header row. From lg: it opens inline.
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit();
                closeSearch(false);
              }}
              onKeyDown={(event) => { if (event.key === 'Escape') closeSearch(); }}
              className="absolute inset-0 z-10 flex items-center gap-2 bg-surface px-4 sm:px-6 lg:static lg:z-auto lg:w-[340px] lg:bg-transparent lg:px-0"
            >
              <div className="cf-search min-w-0 flex-1 focus-within:border-navy">
                <Search className="h-5 w-5 flex-none text-ink-muted" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  aria-label="Buscar pessoas, projetos e eventos"
                  value={globalSearchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar pessoas, projetos e eventos"
                />
              </div>
              <button type="button" onClick={() => closeSearch()} aria-label="Fechar busca" className="cf-icon-btn flex-none">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <button ref={searchButtonRef} type="button" onClick={() => setIsSearchOpen(true)} aria-label="Buscar" title="Buscar pessoas, projetos e eventos" className="cf-icon-btn">
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          ))}

          <Link to="/perfil" className="hidden rounded-full sm:inline-flex" title={`Portfólio de ${currentUser.name}`}>
            <Avatar name={currentUser.name} src={currentUser.avatar} />
          </Link>

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="cf-icon-btn"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Fechar menu" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto border-l-2 border-ink bg-surface p-4">
            <div className="flex items-center justify-between gap-3 border-b-2 border-line pb-4">
              <Link
                to="/perfil"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 hover:bg-navy-tint focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-focus"
              >
                <Avatar name={currentUser.name} src={currentUser.avatar} size="md" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-lg font-bold text-ink">{currentUser.name}</span>
                  {profileMeta && <span className="truncate text-sm text-ink-muted">{profileMeta}</span>}
                </span>
              </Link>
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

      {isDemo && !isDemoNoteHidden && (
        <div role="status" className="border-b-2 border-ink bg-gold-tint">
          <div className="mx-auto flex max-w-[1344px] items-center gap-3 px-4 py-1.5 text-[15px] text-ink sm:px-6 xl:px-12">
            <PlayCircle className="h-5 w-5 flex-none" aria-hidden="true" />
            <p className="m-0 min-w-0 flex-1"><strong className="font-semibold">Conta de demonstração.</strong> Teste tudo à vontade: nada do que você fizer será salvo.</p>
            <button type="button" onClick={() => setIsDemoNoteHidden(true)} aria-label="Fechar aviso" className="flex h-11 w-11 flex-none items-center justify-center rounded-sm text-ink hover:bg-gold/30">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
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
