import { Link } from 'react-router-dom';
import type { GalleryStatus } from '../specs';
import { projectCountLabel } from '../format';
import { galleryProjects } from '../pageRules';
import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { t } from '../../i18n';

const HEADING: Record<GalleryStatus, string> = {
  all: t.views.galleryAll,
  'Concluído': t.views.galleryDone,
  'Em andamento': t.views.galleryInProgress,
};

export function ProjectGalleryView({ widget, ctx, colors, headingId }: WidgetViewProps) {
  const status = (widget.config.status as GalleryStatus) ?? 'all';
  const shown = galleryProjects(widget.config, ctx, ctx.pinnedProjectIds);
  // "Destaque" only drives the page while the owner has no saved layout; after that the pinned widget decides.
  const canFeature = ctx.isOwner && !ctx.user.profileLayout && ctx.onSetFeaturedProject;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <WidgetHeading id={headingId} colors={colors} aside={projectCountLabel(ctx.projects.length)}>
          {HEADING[status]}
        </WidgetHeading>
        {ctx.isOwner && ctx.onOpenNewProject && (
          <button type="button" onClick={ctx.onOpenNewProject} className={`min-h-[44px] text-[15px] font-bold hover:underline ${colors.link}`}>
            {t.views.addProject}
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className={`m-0 text-[15px] ${colors.muted}`}>{t.views.noOtherProjects}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-5 p-0">
          {shown.map((project) => (
            <li key={project.id} className="cf-project">
              <span className={`cf-tag ${project.status === 'Concluído' ? 'done' : 'progress'} self-start px-3 py-1 text-[13px]`}>{project.status}</span>
              <h3 className="m-0 font-display text-[21px] font-bold leading-[1.2]">{project.title}</h3>
              <span className="sum">{project.area}</span>
              <div className="mt-auto flex gap-2">
                <Link to={`/projeto/${project.id}`} className="cf-btn primary h-11 flex-1 px-4 text-[15px]">
                  {t.views.open}<span className="sr-only">: {project.title}</span>
                </Link>
                {canFeature && (
                  <button type="button" onClick={() => ctx.onSetFeaturedProject?.(project.id)} className="cf-btn h-11 px-4 text-[15px]">
                    {t.views.feature}<span className="sr-only">: {project.title}</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
