import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Event } from '../types';
import { LlmEventCover } from './LlmEventCover';

export function EventCard({ event, isRegistered, onToggleRegistration }: { event: Event; isRegistered?: boolean; onToggleRegistration?: () => void }) {
  const isOpen = event.status === 'Inscrições abertas';

  // Covers without an image: flat navy field with the hero dot grid and the calendar (Evento) icon in a tile.
  const cover = event.category === 'Palestra' || event.category === 'Simpósio' ? <LlmEventCover /> : (
    <div className="flex h-48 w-full items-end overflow-hidden rounded-lg border-2 border-ink bg-navy bg-[radial-gradient(var(--dot-grid)_1.5px,transparent_1.5px)] bg-[size:26px_26px] p-4 sm:h-52">
      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-sm border-2 border-ink bg-gold text-ink">
          <CalendarDays className="h-[22px] w-[22px]" aria-hidden="true" />
        </span>
        <span className="font-display text-[17px] font-bold text-on-navy">{event.category}</span>
      </div>
    </div>
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-surface shadow-[6px_6px_0_var(--green)] transition-[transform,box-shadow] duration-[120ms] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hover">
      <Link to={`/evento/${event.id}`} className="block px-3 pt-3">
        {cover}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="cf-tag topic">{event.category}</span>
          <span className={`cf-tag ${isOpen ? 'done' : 'text-ink-muted'}`}>{event.status}</span>
        </div>

        <Link to={`/evento/${event.id}`} className="font-display text-[21px] font-bold leading-[1.2] text-ink hover:text-navy">
          {event.title}
        </Link>
        <p className="text-[15px] leading-[1.5] text-ink-muted">{event.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <div className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" />{event.date}</div>
          <div className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden="true" />{event.city}</div>
          <div className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" />{event.attendeesCount}</div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-line pt-3">
          <span className="text-sm text-ink-muted">{event.modality}</span>
          <button
            type="button"
            onClick={onToggleRegistration}
            disabled={!isOpen}
            aria-pressed={!!isRegistered}
            className="cf-chip disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-paper-deep disabled:text-ink-muted"
          >
            {isRegistered ? 'Inscrito' : 'Inscrever-se'}
          </button>
        </div>
      </div>
    </article>
  );
}
