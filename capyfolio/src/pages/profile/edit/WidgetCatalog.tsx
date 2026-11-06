import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import type { ProfileLayout, WidgetType } from '../../../types';
import { MAX_WIDGETS, createWidget } from '../../../widgets/layout';
import { CATEGORY_LABELS, WIDGET_REGISTRY } from '../../../widgets/registry';
import { WIDGET_TYPES } from '../../../widgets/specs';
import type { WidgetCategory } from '../../../widgets/specs';
import type { WidgetRenderContext } from '../../../widgets/viewTypes';
import { WidgetFrame } from '../../../widgets/WidgetFrame';
import { fmt, t } from '../../../i18n';

/*
 * Drawer listing every widget type, grouped by category, with a live preview built
 * from the student's own data. Side panel on desktop, bottom sheet on phones.
 */

interface WidgetCatalogProps {
  target: 'grid' | 'hero';
  draft: ProfileLayout;
  ctx: WidgetRenderContext;
  onPick: (type: WidgetType) => void;
  onClose: () => void;
}

const CATEGORIES: WidgetCategory[] = ['trabalho', 'contato', 'conquistas', 'pessoal'];

const FOCUSABLE = 'button:not(:disabled), a[href], select, input, textarea, [tabindex]:not([tabindex="-1"])';

export function WidgetCatalog({ target, draft, ctx, onPick, onClose }: WidgetCatalogProps) {
  const titleId = useId();
  const gridFull = target === 'grid' && draft.widgets.length >= MAX_WIDGETS;
  // Previews show the widget as a visitor would, without owner buttons.
  const previewCtx: WidgetRenderContext = { ...ctx, isOwner: false, onOpenNewProject: undefined, onSetFeaturedProject: undefined };

  // Focus: move into the drawer on open, keep Tab inside it, close on Esc,
  // and return to whatever opened it (unless that control is gone, e.g. the
  // hero "Adicionar" button replaced by the new widget; the page handles that).
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.closest('[inert]'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  const reasonFor = (type: WidgetType): string | null => {
    const entry = WIDGET_REGISTRY[type];
    if (gridFull) return fmt(t.widgets.gridFull, { n: MAX_WIDGETS });
    if (target === 'hero' && !entry.spec.heroSafe) return t.editor.tooBigForHero;
    if (!createWidget(type, ctx, () => 'check')) return entry.noDataReason;
    return null;
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-2 border-ink bg-paper sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-4">
          <h2 id={titleId} className="m-0 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">
            {target === 'hero' ? t.editor.catalogTitleHero : t.editor.catalogTitle}
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.editor.catalogClose} className="cf-btn h-11 w-11 px-0">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-8 overflow-y-auto px-6 py-6">
          {target === 'hero' && (
            <p className="m-0 text-[15px] text-ink-muted">{t.editor.catalogHeroHint}</p>
          )}
          {CATEGORIES.map((category) => {
            const types = WIDGET_TYPES.filter((type) => WIDGET_REGISTRY[type].spec.category === category);
            if (types.length === 0) return null;
            return (
              <section key={category} className="flex flex-col gap-4">
                <h3 className="m-0 text-[17px] font-bold text-brand-green">{CATEGORY_LABELS[category]}</h3>
                {types.map((type) => {
                  const entry = WIDGET_REGISTRY[type];
                  const reason = reasonFor(type);
                  const preview = reason ? null : createWidget(type, ctx, () => `preview-${type}`);
                  const reasonId = `${titleId}-${type}-reason`;
                  return (
                    <article key={type} className="flex flex-col gap-3 rounded-xl border-2 border-ink bg-surface p-4 shadow-sm">
                      <div>
                        <h4 className="m-0 font-display text-[19px] font-bold text-ink">{entry.spec.label}</h4>
                        <p className="m-0 mt-1 text-[15px] text-ink-muted">{entry.description}</p>
                      </div>
                      {preview && (
                        <div inert aria-hidden="true" className="pointer-events-none max-h-[220px] overflow-hidden rounded-xl bg-paper p-3">
                          <WidgetFrame widget={preview} ctx={previewCtx} inHero />
                        </div>
                      )}
                      {reason && <p id={reasonId} className="m-0 text-sm text-ink-muted">{reason}</p>}
                      <button
                        type="button"
                        className="cf-btn primary self-start disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
                        disabled={reason !== null}
                        aria-describedby={reason ? reasonId : undefined}
                        onClick={() => onPick(type)}
                      >
                        {t.editor.catalogAdd}<span className="sr-only"> {entry.spec.label}</span>
                      </button>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
