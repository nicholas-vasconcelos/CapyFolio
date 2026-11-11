import { ArrowRight, CalendarDays, FolderOpen, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project, User } from '../types';
import { Avatar } from './Avatar';
import { SpatialMapProjectCover } from './SpatialMapProjectCover';

export function ProjectCard({ project, author, isFavorited, onToggleFavorite }: { project: Project; author?: User; isFavorited?: boolean; onToggleFavorite?: () => void }) {
  // Covers without an image: flat green field with topographic rings and one icon in a tile.
  const photo = project.images[0] ?? project.media;
  const cover = photo ? (
    <img src={photo} alt="" loading="lazy" className="h-52 w-full rounded-lg border-2 border-ink object-cover sm:h-56" />
  ) : project.visualType === 'spatial-map' ? <SpatialMapProjectCover /> : (
    <div className="relative flex h-52 w-full items-end overflow-hidden rounded-lg border-2 border-ink bg-brand-green p-4 sm:h-56">
      <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full stroke-green-tint opacity-60" fill="none" strokeWidth="2" aria-hidden="true">
        <ellipse cx="170" cy="80" rx="30" ry="22" />
        <ellipse cx="170" cy="80" rx="70" ry="48" />
        <ellipse cx="168" cy="82" rx="115" ry="88" />
        <ellipse cx="165" cy="85" rx="160" ry="118" />
      </svg>
      <div className="relative z-10 flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-sm border-2 border-ink bg-gold text-ink">
          <FolderOpen className="h-[22px] w-[22px]" aria-hidden="true" />
        </span>
        <span className="font-display text-[17px] font-bold text-white">Projeto</span>
      </div>
    </div>
  );

  return (
    <article className="cf-project overflow-hidden p-0 gap-0">
      <Link to={`/projeto/${project.id}`} className="block px-3 pt-3">
        {cover}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="cf-tag topic">{project.area}</span>
          <button type="button" onClick={onToggleFavorite} aria-pressed={!!isFavorited} className={`cf-counter flex-none ${isFavorited ? 'liked' : ''}`}>
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-ink' : ''}`} aria-hidden="true" />
            {project.favorites ?? 0}
          </button>
        </div>

        <Link to={`/projeto/${project.id}`} className="font-display text-[21px] font-bold leading-[1.2] text-ink hover:text-navy">
          {project.title}
        </Link>
        <p className="text-[15px] leading-[1.5] text-ink-muted">{project.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {project.date}
          </div>
          <div className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {project.institution}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-line pt-3">
          <div className="flex min-w-0 items-center gap-3">
            {author && (
              <>
                <Avatar name={author.name} src={author.avatar} size="xs" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ink">{author.name}</p>
                  <p className="truncate text-sm text-ink-muted">{project.type}</p>
                </div>
              </>
            )}
          </div>
          <Link to={`/projeto/${project.id}`} className="inline-flex flex-none items-center gap-2 text-[15px] font-bold text-navy hover:underline">
            Ver projeto
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
