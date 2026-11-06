import { keyResultHighlight } from '../format';
import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { ProjectLink } from './ProjectLink';
import { t } from '../../i18n';

export function KeyResultView({ widget, ctx, colors, headingId }: WidgetViewProps) {
  const project = ctx.projects.find((entry) => entry.id === widget.config.projectId);
  const result = project?.keyResults?.[widget.config.resultIndex as number];
  if (!project || !result) return null;

  const highlight = keyResultHighlight(result);

  return (
    <>
      <WidgetHeading id={headingId} colors={colors}>{t.views.keyResultHeading}</WidgetHeading>
      {highlight && (
        // The figure is repeated in the sentence below, so screen readers skip it here.
        <p aria-hidden="true" className={`m-0 font-display text-[44px] font-extrabold leading-none tracking-[-0.03em] [font-variant-numeric:tabular-nums] ${colors.heading}`}>
          {highlight}
        </p>
      )}
      <p className="m-0 text-[15px] leading-[1.5]">{result}</p>
      <p className={`m-0 text-sm ${colors.muted}`}>{project.title}</p>
      <ProjectLink projectId={project.id} title={project.title} colors={colors} />
    </>
  );
}
