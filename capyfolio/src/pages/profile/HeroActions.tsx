import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Ellipsis, Plus, Settings, Share2 } from 'lucide-react';
import { t } from '../../i18n';

/*
 * Profile actions behind a "⋯" button in the top right of the hero. Opening it shows
 * small icon-only buttons (their names are in aria-label and the hover tooltip).
 * A disclosure, not a menu: Tab moves through the buttons, Esc or a click outside closes.
 */

const ICON_BUTTON = 'cf-btn h-11 w-11 px-0';
// Pressed or open: no white fill (white on a white border reads badly on navy); the
// outline, shadow and icon turn gold instead.

function IconAction({ label, onClick, pressed, variant = 'on-navy', children }: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  variant?: 'on-navy' | 'cta on-navy-cta';
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`${ICON_BUTTON} ${variant} aria-pressed:border-gold aria-pressed:text-gold-light aria-pressed:shadow-[4px_4px_0_var(--gold)]`}
    >
      {children}
    </button>
  );
}

interface HeroActionsProps {
  isOwnProfile: boolean;
  /** Widget mode is on (the gear shows as pressed). */
  isEditing: boolean;
  onOpenNewProject: () => void;
  /** Owner only: turns widget mode on or off. */
  onToggleEditing?: () => void;
}

export function HeroActions({ isOwnProfile, isEditing, onOpenNewProject, onToggleEditing }: HeroActionsProps) {
  const [open, setOpen] = useState(false);
  const groupId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Every action closes the row again.
  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    // Column on phones (drops down beside the photo), row on wider screens (opens to the left).
    <div ref={rootRef} className="flex flex-col items-end gap-2.5 sm:flex-row-reverse sm:items-center">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={groupId}
        aria-label={t.profile.moreActions}
        title={t.profile.moreActions}
        onClick={() => setOpen((value) => !value)}
        className={`${ICON_BUTTON} on-navy aria-expanded:border-gold aria-expanded:text-gold-light aria-expanded:shadow-[4px_4px_0_var(--gold)]`}
      >
        <Ellipsis className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div id={groupId} role="group" aria-label={t.profile.actions} className="flex flex-col gap-2.5 sm:flex-row-reverse">
          {isOwnProfile && (
            <IconAction label={t.profile.newProject} variant="cta on-navy-cta" onClick={run(onOpenNewProject)}>
              <Plus className="h-5 w-5" aria-hidden="true" />
            </IconAction>
          )}
          {isOwnProfile && onToggleEditing && (
            <IconAction label={t.profile.customize} pressed={isEditing} onClick={run(onToggleEditing)}>
              <Settings className="h-5 w-5" aria-hidden="true" />
            </IconAction>
          )}
          {/* Sharing is not built yet; the button keeps its place, as before. */}
          <IconAction label={t.profile.share} onClick={run(() => undefined)}>
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </IconAction>
        </div>
      )}
    </div>
  );
}
