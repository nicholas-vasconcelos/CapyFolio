import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Camera, Lock, Pencil, Users } from 'lucide-react';
import { TagPicker } from '../../components/TagPicker';
import { IMAGE_MIME_TYPES } from '../../lib/imageRules';
import { isDefaultAvatar } from '../../lib/defaultAvatars';
import type { User } from '../../types';
import { plural, t } from '../../i18n';
import { HeroActions } from './HeroActions';

/*
 * The fixed part of every profile ("Layout A, revised"): the navy hero and the
 * stat row that overlaps it. Students cannot move, hide or restyle any of this;
 * it is edited only through the profile form. The hero slot (top right) is passed
 * in by the page and may be empty.
 */

interface ProfileCoreProps {
  user: User;
  isOwnProfile: boolean;
  isConnected: boolean;
  onToggleConnect: () => void;
  onOpenNewProject: () => void;
  /** Widget in the top right of the hero. Empty is allowed. */
  heroSlot?: ReactNode;
  /** Widget mode is on: the fixed part shows its lock. */
  isEditing?: boolean;
  /** Owner only: turns widget mode on or off. */
  onToggleEditing?: () => void;
  /** Show the lock on the fixed part (off in "Ver como visitante"). Defaults to isEditing. */
  showLock?: boolean;
  /** Owner in edit mode: replaces the photo. Resolves once saved; rejects with a pt-BR message. */
  onChangePhoto?: (file: File) => Promise<void>;
  /** Owner in edit mode: switches back to a default silhouette. */
  onUseDefaultPhoto?: () => Promise<void>;
  /** Owner in edit mode: saves the specialties. Rejects with a pt-BR message. */
  onChangeTags?: (tags: string[]) => Promise<void>;
}

/** The "Especialidades" panel; in edit mode the owner can open the tag picker in place. */
function SpecialtiesPanel({ user, onChangeTags }: { user: User; onChangeTags?: (tags: string[]) => Promise<void> }) {
  const [draft, setDraft] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!draft || !onChangeTags) return;
    setBusy(true);
    setError('');
    try {
      await onChangeTags(draft);
      setDraft(null);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.profile.tags.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-[2.1_1_480px] flex-col gap-3 rounded-xl border-2 border-ink bg-navy-tint px-6 py-[18px] shadow-[5px_5px_0_var(--navy)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] text-ink-muted">{t.profile.specialties}</span>
        {onChangeTags && !draft && (
          <button type="button" onClick={() => setDraft(user.tags)} className="cf-btn compact">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {t.profile.tags.edit}
          </button>
        )}
      </div>

      {draft ? (
        <div className="flex flex-col gap-4">
          <TagPicker id="perfil-tags" label={t.profile.tags.search} value={draft} onChange={setDraft} course={user.course} />
          {error && <span role="alert" className="text-sm font-semibold text-ink">{error}</span>}
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={() => void save()} className="cf-btn compact primary disabled:opacity-70">
              {busy ? t.profile.tags.saving : t.profile.tags.save}
            </button>
            <button type="button" disabled={busy} onClick={() => { setDraft(null); setError(''); }} className="cf-btn compact">
              {t.profile.tags.cancel}
            </button>
          </div>
        </div>
      ) : user.tags.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={t.profile.specialties}>
          {user.tags.map((tag) => (
            <li key={tag} className="cf-tag">{tag}</li>
          ))}
        </ul>
      ) : (
        <span className="text-[15px] text-ink">{t.profile.skillsPlaceholder}</span>
      )}
    </div>
  );
}

/** Photo controls shown under the hero photo while the owner edits the profile. */
function PhotoControls({ hasCustomPhoto, onChangePhoto, onUseDefaultPhoto }: {
  hasCustomPhoto: boolean;
  onChangePhoto: (file: File) => Promise<void>;
  onUseDefaultPhoto?: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.profile.photo.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_MIME_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void run(() => onChangePhoto(file));
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="cf-btn compact on-navy disabled:opacity-70">
          <Camera className="h-4 w-4" aria-hidden="true" />
          {busy ? t.profile.photo.uploading : t.profile.photo.change}
        </button>
        {hasCustomPhoto && onUseDefaultPhoto && (
          <button type="button" disabled={busy} onClick={() => void run(onUseDefaultPhoto)} className="cf-link on-navy min-h-[44px] px-1 text-[15px] disabled:opacity-70">
            {t.profile.photo.useDefault}
          </button>
        )}
      </div>
      <p className="m-0 text-sm text-on-navy-muted" aria-live="polite">{error || t.profile.photo.hint}</p>
    </div>
  );
}

function LockNote() {
  return (
    <p
      title={t.profile.lockNote}
      className="m-0 inline-flex items-center gap-2 rounded-pill border-2 border-dashed border-on-navy-muted px-3 py-1 text-sm font-semibold text-on-navy"
    >
      <Lock className="h-4 w-4" aria-hidden="true" />
      {t.profile.lockNote}
    </p>
  );
}

const formatConnections = (count: number): string => plural(count, t.profile.connectionsOne, t.profile.connectionsOther);

export function ProfileCore({ user, isOwnProfile, isConnected, onToggleConnect, onOpenNewProject, heroSlot, isEditing = false, onToggleEditing, showLock = isEditing, onChangePhoto, onUseDefaultPhoto, onChangeTags }: ProfileCoreProps) {
  const studyLine = [user.course, user.institution, user.location].filter(Boolean).join(' · ');

  return (
    <>
      <section className="capy-hero-shell overflow-hidden">
        <div className="relative mx-auto box-border flex max-w-[1344px] flex-col gap-8 px-4 pb-24 pt-20 sm:px-6 md:px-12 md:pb-[120px] md:pt-24 xl:flex-row xl:items-start xl:justify-between">
          {/* Top row, above the content: the lock note on the left, the actions on the right.
              Kept out of the columns so the photo and the hero widget start at the same height. */}
          {showLock && (
            <div className="absolute left-4 top-3 flex h-11 items-center sm:left-6 md:left-12 md:top-4">
              <LockNote />
            </div>
          )}
          <div className="absolute right-4 top-3 z-10 sm:right-6 md:right-12 md:top-4">
            <HeroActions
              isOwnProfile={isOwnProfile}
              isEditing={isEditing}
              onOpenNewProject={onOpenNewProject}
              onToggleEditing={onToggleEditing}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center md:gap-8">
              <div className="flex flex-none flex-col items-start gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-[200px] w-[200px] flex-none rounded-4xl border-[3px] border-ink object-cover shadow-photo sm:h-[240px] sm:w-[240px] md:h-[280px] md:w-[280px]"
                />
              ) : (
                // New accounts have no photo yet: show initials instead of a broken image.
                <span
                  aria-hidden="true"
                  className="flex h-[200px] w-[200px] flex-none select-none items-center justify-center rounded-4xl border-[3px] border-ink bg-paper font-display text-[72px] font-extrabold tracking-[-0.04em] text-navy shadow-photo sm:h-[240px] sm:w-[240px] md:h-[280px] md:w-[280px] md:text-[96px]"
                >
                  {user.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
              {onChangePhoto && (
                <PhotoControls
                  hasCustomPhoto={Boolean(user.avatar) && !isDefaultAvatar(user.avatar)}
                  onChangePhoto={onChangePhoto}
                  onUseDefaultPhoto={onUseDefaultPhoto}
                />
              )}
              </div>
              <div className="min-w-0">
                <h1 className="m-0 font-display text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-on-navy [overflow-wrap:anywhere] [text-wrap:balance] md:text-[80px]">{user.name}</h1>
                <p className="mt-2 font-display text-base font-bold leading-[1.2] text-gold-light sm:text-[22px] md:text-[26px]">{user.focus}</p>
                {studyLine && <p className="mt-1 text-sm text-on-navy-muted sm:text-base md:text-lg">{studyLine}</p>}
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-on-navy-muted [font-variant-numeric:tabular-nums]">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {formatConnections(user.connections ?? 0)}
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-[62ch] text-base leading-[1.6] text-on-navy-muted sm:text-[18px] md:text-[19px]">
              {user.bio || t.profile.bioFallback}
            </p>
          </div>

          <div className="flex flex-col gap-5 xl:flex-[0_1_380px]">
            {heroSlot}
            {/* Connecting is a visitor's main action, so it stays a visible button. */}
            {!isOwnProfile && (
              <button type="button" onClick={onToggleConnect} aria-pressed={isConnected} className="cf-btn on-navy h-[52px] self-start xl:self-end">
                {isConnected ? t.profile.connected : t.profile.connect}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 box-border flex max-w-[1344px] flex-wrap gap-6 px-4 sm:px-6 md:px-12">
        <div className="cf-stat shadow-[5px_5px_0_var(--green)]">
          <span>{t.profile.course}</span>
          <strong>{user.course || t.profile.coursePlaceholder}</strong>
        </div>
        <div className="cf-stat shadow-[5px_5px_0_var(--gold)]">
          <span>{t.profile.period}</span>
          <strong>{user.period || t.profile.periodPlaceholder}</strong>
        </div>
        <SpecialtiesPanel user={user} onChangeTags={onChangeTags} />
      </div>
    </>
  );
}
