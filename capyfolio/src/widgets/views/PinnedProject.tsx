import { Check, Cpu, Database, Eye, FolderGit2 } from 'lucide-react';
import type { Project } from '../../types';
import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { ProjectLink } from './ProjectLink';
import { fmt, t } from '../../i18n';
import { PhotoGrid } from '../../components/PhotoGrid';

/** Icon for a cover without an image, following the system's fixed icon meanings. */
const coverIcon = (area: string) => {
  const className = 'h-7 w-7';
  if (/vis[ãa]o|imagem|vision/i.test(area)) return <Eye className={className} />;
  if (/\bIA\b|\bAI\b|LLM|intelig/i.test(area)) return <Cpu className={className} />;
  if (/dado|data|an[áa]lise/i.test(area)) return <Database className={className} />;
  return <FolderGit2 className={className} />;
};

// Topographic rings on green, as the design system asks for imageless covers.
const TOPO_RINGS = {
  backgroundImage: 'repeating-radial-gradient(circle at 78% 120%, transparent 0 22px, var(--green-ink) 22px 24px)',
};

/** Cover height per size: the hero and small tiles get a shorter photo so the text still fits. */
const COVER_HEIGHT = { P: 'h-40', M: 'h-44', G: 'h-44 md:h-52' } as const;

function ProjectCover({ project, size }: { project: Project; size: 'P' | 'M' | 'G' }) {
  const photo = project.images[0] ?? project.media;
  if (photo) {
    return (
      <img
        src={photo}
        alt={fmt(t.views.projectCover, { title: project.title })}
        className={`${COVER_HEIGHT[size]} w-full rounded-lg border-2 border-ink object-cover`}
      />
    );
  }

  return (
    <div className={`flex ${COVER_HEIGHT[size]} w-full items-end rounded-lg border-2 border-ink bg-brand-green p-4`} style={TOPO_RINGS} aria-hidden="true">
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-sm border-2 border-ink bg-paper text-ink">
        {coverIcon(project.area)}
      </span>
    </div>
  );
}

export function PinnedProjectView({ widget, ctx, inHero, colors, headingId }: WidgetViewProps) {
  const project = ctx.projects.find((entry) => entry.id === widget.config.projectId);
  if (!project) return null;

  const size = inHero ? 'P' : widget.size;
  const meta = [project.type, project.area, project.date].filter(Boolean).join(' · ');
  const keyResults = (project.keyResults ?? []).slice(0, 3);

  return (
    <>
      <WidgetHeading id={headingId} colors={colors}>{t.views.pinnedHeading}</WidgetHeading>

      {/* Large: every photo of the project (opens full size). Smaller and in the hero: the cover. */}
      {size === 'G' && project.images.length > 1 ? (
        <PhotoGrid images={project.images} alt={project.title} />
      ) : (
        <ProjectCover project={project} size={size as 'P' | 'M' | 'G'} />
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`cf-tag ${project.status === 'Concluído' ? 'done' : 'progress'} px-3 py-1 text-[13px]`}>{project.status}</span>
        {size !== 'P' && meta && <span className={`text-sm ${colors.muted}`}>{meta}</span>}
      </div>

      <h3 className={`m-0 font-display font-bold leading-[1.2] tracking-[-0.01em] ${size === 'G' ? 'text-[26px]' : 'text-[21px]'}`}>
        {project.title}
      </h3>

      {size !== 'P' && project.shortDescription && (
        <p className="m-0 max-w-[62ch] text-[15px] leading-[1.5]">{project.shortDescription}</p>
      )}

      {size === 'G' && keyResults.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label={t.views.keyResultsList}>
          {keyResults.map((result) => (
            <li key={result} className="flex gap-2 text-[15px] leading-[1.45]">
              <Check className={`mt-0.5 h-4 w-4 flex-none ${colors.link}`} aria-hidden="true" />
              <span>{result}</span>
            </li>
          ))}
        </ul>
      )}

      <ProjectLink projectId={project.id} title={project.title} colors={colors} />
    </>
  );
}
