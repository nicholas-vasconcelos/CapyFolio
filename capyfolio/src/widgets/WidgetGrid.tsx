import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import type { ProfileLayout, WidgetInstance } from '../types';
import { MAX_WIDGETS } from './layout';
import { isEmptyOnPage } from './pageRules';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetRenderContext } from './viewTypes';
import { fmt, t } from '../i18n';

/*
 * The body grid: 1 column on phones, 2 from 640px, 4 from 1024px. Widgets keep their
 * saved order (no `grid-auto-flow: dense`), so reading and keyboard order match.
 * Outside widget mode, widgets with nothing to show are skipped.
 */

export interface GridEditing {
  renderControls: (widget: WidgetInstance, index: number) => ReactNode;
  onAdd: () => void;
}

interface WidgetGridProps {
  layout: ProfileLayout;
  ctx: WidgetRenderContext;
  /** Present in widget mode (and absent in "Ver como visitante"). */
  editing?: GridEditing;
}

export function WidgetGrid({ layout, ctx, editing }: WidgetGridProps) {
  const visible = editing ? layout.widgets : layout.widgets.filter((widget) => !isEmptyOnPage(widget, ctx, ctx.pinnedProjectIds));
  if (visible.length === 0 && !editing) return null;
  const full = layout.widgets.length >= MAX_WIDGETS;

  return (
    <div data-widget-grid className="grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map((widget, index) => (
        <WidgetFrame key={widget.id} widget={widget} ctx={ctx} controls={editing?.renderControls(widget, index)} />
      ))}
      {editing && (
        <button
          type="button"
          onClick={editing.onAdd}
          disabled={full}
          data-add-widget
          className="col-span-1 flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink bg-transparent p-6 font-display text-[17px] font-bold text-ink hover:bg-navy-tint focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-5 w-5" aria-hidden="true" /> {t.widgets.addWidget}
          </span>
          {full && <span className="font-sans text-sm font-normal text-ink-muted">{fmt(t.widgets.gridFull, { n: MAX_WIDGETS })}</span>}
        </button>
      )}
    </div>
  );
}
