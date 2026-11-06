import { Check, Cpu, Database, Eye, FolderGit2 } from 'lucide-react';
import type { Project } from '../../types';
import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { ProjectLink } from './ProjectLink';
import { fmt, t } from '../../i18n';

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

function ProjectCover({ project }: { project: Project }) {
  if (project.media) {
    return (
      <img
        src={project.media}
        alt={fmt(t.views.projectCover, { title: project.title })}
        className="h-44 w-full rounded-lg border-2 border-ink object-cover md:h-52"
      />
    );
  }

  return (
    <div className="flex h-44 w-full items-end rounded-lg border-2 border-ink bg-brand-green p-4 md:h-52" style={TOPO_RINGS} aria-hidden="true">
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

      {size === 'G' && <ProjectCover project={project} />}

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
