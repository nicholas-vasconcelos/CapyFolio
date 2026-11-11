import { ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { IMAGE_MIME_TYPES, validateImage } from '../lib/imageRules';

export type PickedPhoto = { id: string; file: File; preview: string };

/** Revokes the preview URLs of photos that are no longer in the list. */
export const releasePhotos = (photos: PickedPhoto[]) => photos.forEach((photo) => URL.revokeObjectURL(photo.preview));

/**
 * Photo state for a form, with the previews freed when the form goes away. Kept in the form
 * (not the picker) so a wizard can hide the picker on other steps without losing the photos.
 */
export function usePickedPhotos(): [PickedPhoto[], Dispatch<SetStateAction<PickedPhoto[]>>] {
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);
  useEffect(() => () => releasePhotos(latest.current), []);
  return [photos, setPhotos];
}

/**
 * Picks up to `max` photos (PNG, JPEG or WebP, 5 MB each) with previews. Files are only
 * uploaded when the form is sent, so nothing is stored for a draft that is abandoned.
 * The first photo is the cover where a cover is used (projects).
 */
export function PhotoPicker({ photos, onChange, max, label, hint, coverHint = false }: {
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  max: number;
  label: string;
  hint?: string;
  /** Marks the first photo as the cover. */
  coverHint?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const add = (files: FileList | null) => {
    if (!files) return;
    const room = max - photos.length;
    const picked: PickedPhoto[] = [];
    let problem = '';
    for (const file of Array.from(files)) {
      if (picked.length >= room) {
        problem = `Fotos: no máximo ${max}.`;
        break;
      }
      try {
        validateImage(file);
        picked.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
      } catch (cause) {
        problem = cause instanceof Error ? cause.message : 'Não foi possível usar esta imagem.';
      }
    }
    setError(problem);
    if (picked.length) onChange([...photos, ...picked]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (id: string) => {
    const gone = photos.filter((photo) => photo.id === id);
    releasePhotos(gone);
    setError('');
    onChange(photos.filter((photo) => photo.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-bold leading-[1.3] text-ink">
        {label} <span className="ml-1 font-semibold text-ink-muted">(opcional, até {max})</span>
      </span>
      {hint && <p className="m-0 text-sm text-ink-muted">{hint}</p>}

      {photos.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0">
          {photos.map((photo, index) => (
            <li key={photo.id} className="relative">
              <img src={photo.preview} alt={`Foto ${index + 1}`} className="aspect-square w-full rounded-lg border-2 border-ink object-cover" />
              {coverHint && index === 0 && (
                <span className="absolute bottom-2 left-2 rounded-pill border-2 border-ink bg-gold px-2 py-0.5 text-[13px] font-bold text-ink">Capa</span>
              )}
              <button
                type="button"
                onClick={() => remove(photo.id)}
                aria-label={`Remover foto ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-surface text-ink shadow-xs focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {photos.length < max ? (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={IMAGE_MIME_TYPES.join(',')}
            multiple
            className="sr-only"
            onChange={(event) => add(event.target.files)}
          />
          <label htmlFor={inputId} className="cf-btn h-12 cursor-pointer self-start px-4 text-[15px]">
            <ImagePlus className="h-[18px] w-[18px]" aria-hidden="true" />
            {photos.length === 0 ? 'Adicionar fotos' : 'Adicionar mais fotos'}
          </label>
        </>
      ) : (
        <p className="m-0 text-sm text-ink-muted">Você já adicionou {max} fotos, o máximo.</p>
      )}
      {error && <p role="alert" className="m-0 text-sm font-semibold text-ink">{error}</p>}
    </div>
  );
}
