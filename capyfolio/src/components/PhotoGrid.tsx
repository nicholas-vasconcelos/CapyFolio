import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * Photos on posts (up to 4) and projects (up to 3). Outlined like every other surface:
 * 2px ink border, radius-lg, no blurred shadow. Clicking a photo opens it full size.
 *
 * Layouts: 1 photo fills the width; 2 sit side by side; 3 = one large on the left and two
 * stacked on the right; 4 = a 2×2 grid.
 */

export function PhotoGrid({ images, alt, size = 'md' }: {
  images: string[];
  /** Describes the set, e.g. the post author or project title; each photo gets "Foto N de M". */
  alt: string;
  /** 'lg' for the project page, 'md' for feed posts. */
  size?: 'md' | 'lg';
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const photos = images.filter(Boolean).slice(0, 4);
  if (photos.length === 0) return null;

  const height = size === 'lg' ? 'h-[260px] sm:h-[420px]' : 'h-[220px] sm:h-[340px]';
  const label = (index: number) => `${alt}: foto ${index + 1} de ${photos.length}`;

  const tile = (index: number, className = '') => (
    <button
      key={photos[index]}
      type="button"
      onClick={() => setOpenIndex(index)}
      aria-label={`Ampliar ${label(index)}`}
      className={`group relative block min-h-0 overflow-hidden rounded-lg border-2 border-ink bg-paper-deep focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold ${className}`}
    >
      <img src={photos[index]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none" />
    </button>
  );

  let grid;
  if (photos.length === 1) {
    grid = <div className={`grid ${height}`}>{tile(0)}</div>;
  } else if (photos.length === 2) {
    grid = <div className={`grid grid-cols-2 gap-2 ${height}`}>{tile(0)}{tile(1)}</div>;
  } else if (photos.length === 3) {
    grid = (
      <div className={`grid grid-cols-[2fr_1fr] grid-rows-2 gap-2 ${height}`}>
        {tile(0, 'row-span-2')}
        {tile(1)}
        {tile(2)}
      </div>
    );
  } else {
    grid = <div className={`grid grid-cols-2 grid-rows-2 gap-2 ${height}`}>{photos.map((_, index) => tile(index))}</div>;
  }

  return (
    <>
      {grid}
      {openIndex !== null && (
        <Lightbox images={photos} index={openIndex} label={label} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}

function Lightbox({ images, index, label, onChange, onClose }: {
  images: string[];
  index: number;
  label: (index: number) => string;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const many = images.length > 1;
  const go = useCallback((delta: number) => onChange((index + delta + images.length) % images.length), [index, images.length, onChange]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight' && many) go(1);
      else if (event.key === 'ArrowLeft' && many) go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, many, onClose]);

  const control = 'flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 border-ink bg-surface text-ink shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold';

  return (
    <div role="dialog" aria-modal="true" aria-label={label(index)} className="fixed inset-0 z-50 flex flex-col bg-ink/90 p-4 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="m-0 text-[15px] font-semibold text-on-navy [font-variant-numeric:tabular-nums]">{many ? `${index + 1} / ${images.length}` : ''}</p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar foto" className={control}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {/* Clicking the dark area around the photo closes it, like most photo viewers. */}
      <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-4" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        {many && (
          <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={control}>
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
        <img src={images[index]} alt={label(index)} className="max-h-full min-w-0 max-w-full rounded-lg border-2 border-paper object-contain" />
        {many && (
          <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className={control}>
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
