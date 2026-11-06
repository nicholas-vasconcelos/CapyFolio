import { useId } from 'react';
import type { ReactNode } from 'react';
import type { WidgetInstance, WidgetSize } from '../types';
import { isEmptyOnPage } from './pageRules';
import { WIDGET_REGISTRY } from './registry';
import { accentShadowClass, bgClass, textOn } from './theme';
import type { WidgetRenderContext } from './viewTypes';
import { WidgetHeading } from './WidgetHeading';
import { t } from '../i18n';

/*
 * The box around every widget: fixed 2px ink outline, the chosen background, a hard
 * shadow in the chosen accent, and text colours derived from the background.
 * Grid placement comes from the size; in the hero the widget is a compact card.
 * In widget mode the outline turns dashed, the controls sit on top, and an empty
 * widget shows the owner a prompt instead of its content.
 */

const GRID_SPAN: Record<WidgetSize, string> = {
  P: 'col-span-1',
  M: 'col-span-1 sm:col-span-2',
  G: 'col-span-1 sm:col-span-2 sm:row-span-2',
  Faixa: 'col-span-full',
};

const RADIUS: Record<WidgetSize, string> = {
  P: 'rounded-xl',
  M: 'rounded-xl',
  G: 'rounded-3xl',
  Faixa: 'rounded-3xl',
};

interface WidgetFrameProps {
  widget: WidgetInstance;
  ctx: WidgetRenderContext;
  inHero?: boolean;
  /** Edit controls; when set, the widget is shown in widget mode. */
  controls?: ReactNode;
}

export function WidgetFrame({ widget, ctx, inHero = false, controls }: WidgetFrameProps) {
  const headingId = useId();
  const { View, spec, emptyPrompt } = WIDGET_REGISTRY[widget.type];
  const colors = textOn(widget.theme.bg);
  const editing = controls !== undefined;
  const empty = editing && isEmptyOnPage(widget, ctx, ctx.pinnedProjectIds);

  const placement = inHero ? 'rounded-xl p-5' : `${GRID_SPAN[widget.size]} ${RADIUS[widget.size]} p-6 md:p-7`;

  return (
    <section
      aria-labelledby={headingId}
      data-widget-type={widget.type}
      data-widget-id={widget.id}
      className={`flex min-w-0 flex-col gap-4 border-2 border-ink has-[[data-dragging=true]]:opacity-80 has-[[data-dragging=true]]:outline has-[[data-dragging=true]]:outline-[3px] has-[[data-dragging=true]]:outline-offset-4 has-[[data-dragging=true]]:outline-gold ${editing ? 'border-dashed' : ''} ${placement} ${bgClass(widget.theme.bg)} ${accentShadowClass(widget.theme.accent)} ${colors.text}`}
    >
      {controls}
      {empty ? (
        <>
          <WidgetHeading id={headingId} colors={colors}>{spec.label}</WidgetHeading>
          <p className="m-0 text-[15px] leading-[1.5]">{emptyPrompt}</p>
          <p className={`m-0 text-sm ${colors.muted}`}>{t.widgets.hiddenWhileEmpty}</p>
        </>
      ) : (
        <View widget={widget} ctx={ctx} inHero={inHero} colors={colors} headingId={headingId} />
      )}
    </section>
  );
}
