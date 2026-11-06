import type { ReactNode } from 'react';
import { Lock, Users } from 'lucide-react';
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

export function ProfileCore({ user, isOwnProfile, isConnected, onToggleConnect, onOpenNewProject, heroSlot, isEditing = false, onToggleEditing, showLock = isEditing }: ProfileCoreProps) {
  const firstName = user.name.split(' ')[0];
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
              <img
                src={user.avatar || ''}
                alt={user.name}
                className="h-[200px] w-[200px] flex-none rounded-4xl border-[3px] border-paper object-cover shadow-photo sm:h-[240px] sm:w-[240px] md:h-[280px] md:w-[280px]"
              />
              <div className="min-w-0">
                <h1 className="m-0 font-display text-[clamp(2.9rem,9vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em] text-on-navy md:text-[104px]">{firstName}</h1>
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
        <div className="flex min-w-0 flex-[2.1_1_480px] flex-col gap-3 rounded-xl border-2 border-ink bg-navy-tint px-6 py-[18px] shadow-[5px_5px_0_var(--navy)]">
          <span className="text-[15px] text-ink-muted">{t.profile.specialties}</span>
          {user.tags.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={t.profile.specialties}>
              {user.tags.map((tag) => (
                <li key={tag} className="cf-tag">{tag}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[15px] text-ink">{t.profile.skillsPlaceholder}</span>
          )}
        </div>
      </div>
    </>
  );
}
