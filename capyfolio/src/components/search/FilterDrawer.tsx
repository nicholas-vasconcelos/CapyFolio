import { useEffect, useRef, useSyncExternalStore } from 'react';
import { X } from 'lucide-react';

// Matches Tailwind's `lg`: from here up the panel sits beside the results.
const DESKTOP_QUERY = '(min-width: 1024px)';
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP_QUERY).matches, () => true);

const focusRing = 'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-focus';

/**
 * The filter panel. On desktop it is a plain sidebar; below `lg` it becomes a drawer that slides
 * in from the left, with a backdrop, Escape to close, locked page scroll and a "Ver N perfis" footer.
 */
export function FilterDrawer({ id, open, onClose, viewResultsLabel, header, children }: {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Footer button text on phones, e.g. "Ver 7 perfis". */
  viewResultsLabel: string;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const isDrawerOpen = open && !isDesktop;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDesktop && open) onClose();
  }, [isDesktop, open, onClose]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [isDrawerOpen, onClose]);

  return (
    <>
      {isDrawerOpen && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" aria-hidden="true" onClick={onClose} />}
      <aside
        id={id}
        aria-label="Filtros"
        role={isDesktop ? undefined : 'dialog'}
        aria-modal={isDrawerOpen || undefined}
        inert={!isDesktop && !open}
        className={`flex min-w-0 flex-col gap-6 border-2 border-ink bg-surface p-6 shadow-[6px_6px_0_var(--navy)]
          lg:max-w-[340px] lg:flex-[1_1_300px] lg:rounded-2xl
          max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[min(360px,88vw)] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-r-2xl max-lg:border-l-0 max-lg:pb-0
          max-lg:duration-200 motion-reduce:transition-none
          ${open
            // Opening: visible at once (so the close button can take focus), then slide in.
            ? 'max-lg:translate-x-0 max-lg:transition-transform'
            // Closing: slide out, then hide, which also removes it from the tab order.
            : 'max-lg:invisible max-lg:-translate-x-full max-lg:transition-[transform,visibility]'}`}
      >
        <div className="flex items-center justify-between gap-3">
          {header}
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar filtros" className="cf-icon-btn lg:hidden">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {children}

        <div className="sticky bottom-0 -mx-6 mt-auto border-t-2 border-line bg-surface px-6 py-4 lg:hidden">
          <button type="button" onClick={onClose} className={`cf-btn primary w-full ${focusRing}`}>
            {viewResultsLabel}
          </button>
        </div>
      </aside>
    </>
  );
}
