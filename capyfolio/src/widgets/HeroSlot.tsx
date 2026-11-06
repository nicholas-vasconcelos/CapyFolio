import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import type { ProfileLayout, WidgetInstance } from '../types';
import { isWidgetEmpty } from './layout';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetRenderContext } from './viewTypes';
import { t } from '../i18n';

export interface HeroEditing {
  renderControls: (widget: WidgetInstance) => ReactNode;
  onAdd: () => void;
}

/** The optional widget in the top right of the hero. Empty is allowed and renders nothing for visitors. */
export function HeroSlot({ layout, ctx, editing }: { layout: ProfileLayout; ctx: WidgetRenderContext; editing?: HeroEditing }) {
  const widget = layout.hero;

  if (editing) {
    if (widget) return <WidgetFrame widget={widget} ctx={ctx} inHero controls={editing.renderControls(widget)} />;
    return (
      <button
        type="button"
        onClick={editing.onAdd}
        data-add-hero
        aria-label={t.widgets.addToHeroLabel}
        className="flex min-h-[120px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-on-navy bg-transparent font-display text-[17px] font-bold text-on-navy hover:bg-on-navy/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold"
      >
        <Plus className="h-5 w-5" aria-hidden="true" /> {t.widgets.addToHero}
      </button>
    );
  }

  if (!widget || isWidgetEmpty(widget, ctx)) return null;
  return <WidgetFrame widget={widget} ctx={ctx} inHero />;
}
