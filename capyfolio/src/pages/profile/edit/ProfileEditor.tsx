import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProfileLayout, Project, User } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { HeroSlot } from '../../../widgets/HeroSlot';
import { WidgetGrid } from '../../../widgets/WidgetGrid';
import { layoutContextFor } from '../../../widgets/layout';
import type { WidgetRenderContext } from '../../../widgets/viewTypes';
import { ProfileCore } from '../ProfileCore';
import { EditBar } from './EditBar';
import { useLayoutEditor } from './useLayoutEditor';
import { WidgetCatalog } from './WidgetCatalog';
import { WidgetControls } from './WidgetControls';
import { AccountSettingsDialog } from './AccountSettingsDialog';
import { t } from '../../../i18n';
import { TEXT_LIMITS, validateText } from '../../../lib/contentRules';
import { uploadImage } from '../../../lib/storage';
import { randomDefaultAvatar } from '../../../lib/defaultAvatars';
import type { HeroColor } from '../../../lib/heroColors';
import { HeroColorPicker } from './HeroColorPicker';

const LEAVE_MESSAGE = t.editor.confirmLeave;

interface ProfileEditorProps {
  user: User;
  projects: Project[];
  initialLayout: ProfileLayout;
  onUpdateUser: (next: User) => Promise<void>;
  onOpenNewProject: () => void;
  onExit: () => void;
}

/** The owner's profile in widget mode. Mounted only while editing, so the draft starts from the current layout. */
export function ProfileEditor({ user, projects, initialLayout, onUpdateUser, onOpenNewProject, onExit }: ProfileEditorProps) {
  // Polite live region: a counter makes a repeated message still count as a change.
  const [live, setLive] = useState({ text: '', n: 0 });
  const announce = (text: string) => setLive((previous) => ({ text, n: previous.n + 1 }));
  const editor = useLayoutEditor({ user, projects, initialLayout, onUpdateUser, announce });
  const { showToast } = useToast();
  const [previewing, setPreviewing] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [catalog, setCatalog] = useState<'grid' | 'hero' | null>(null);
  const { draft, dirty } = editor;

  // After adding or removing, keyboard focus goes to the new widget or the nearest control.
  const focusNext = useRef<string | null>(null);
  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    const selector = target.startsWith('[') ? target : `[data-widget-id="${target}"] [role=toolbar] button:not(:disabled)`;
    document.querySelector<HTMLElement>(selector)?.focus();
  }, [draft]);

  const removeWidget = (id: string) => {
    if (draft.hero?.id === id) {
      focusNext.current = '[data-add-hero]';
    } else {
      const index = draft.widgets.findIndex((widget) => widget.id === id);
      const neighbour = draft.widgets[index + 1] ?? draft.widgets[index - 1];
      focusNext.current = neighbour ? neighbour.id : '[data-add-widget]';
    }
    editor.remove(id);
  };

  const ctx = useMemo<WidgetRenderContext>(() => ({
    ...layoutContextFor(user, projects),
    isOwner: !previewing,
    pinnedProjectIds: [draft.hero, ...draft.widgets]
      .filter((widget) => widget?.type === 'pinnedProject')
      .map((widget) => widget!.config.projectId as string),
    onOpenNewProject: previewing ? undefined : onOpenNewProject,
  }), [user, projects, draft, previewing, onOpenNewProject]);

  // Leaving with unsaved changes asks first: page reloads/closes and in-app links.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.origin !== window.location.origin) return;
      if (!window.confirm(LEAVE_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  const exit = () => {
    if (dirty && !window.confirm(LEAVE_MESSAGE)) return;
    onExit();
  };

  const save = async () => {
    // "Texto livre" is shown to every visitor, so it gets the same content check as posts.
    for (const widget of [draft.hero, ...draft.widgets]) {
      if (widget?.type !== 'freeText') continue;
      const problem =
        validateText(String(widget.config.title ?? ''), t.widgets.types.freeText.label, TEXT_LIMITS.freeTextTitle) ??
        validateText(String(widget.config.text ?? ''), t.widgets.types.freeText.label, TEXT_LIMITS.freeTextBody);
      if (problem) {
        showToast(problem);
        announce(problem);
        return;
      }
    }
    if (await editor.save()) showToast(t.editor.saved);
  };

  const discard = () => {
    if (window.confirm(t.editor.confirmDiscard)) editor.discard();
  };

  const editing = !previewing;

  // The photo is part of the fixed profile, so it saves right away instead of waiting for "Salvar".
  // onUpdateUser rolls back and shows its own toast on failure; rethrowing lets the controls show the error too.
  const changePhoto = async (file: File) => {
    let url: string;
    try {
      url = await uploadImage('avatars', file);
    } catch (cause) {
      throw new Error(cause instanceof Error && cause.message ? cause.message : t.profile.photo.failed);
    }
    await savePhoto(url);
  };

  const resetToDefaultPhoto = () => savePhoto(randomDefaultAvatar());

  // Specialties are part of the fixed profile too, so they save on their own button, not with the layout.
  const changeTags = async (tags: string[]) => {
    try {
      await onUpdateUser({ ...user, tags });
    } catch {
      throw new Error(t.profile.tags.failed);
    }
    announce(t.profile.tags.saved);
    showToast(t.profile.tags.saved);
  };

  // Part of the fixed profile, so it saves right away. The page shows the new colour at once
  // (onUpdateUser updates the app state first) and rolls back with a toast if saving fails.
  const changeHeroColor = async (heroColor: HeroColor) => {
    if (heroColor === (user.heroColor ?? 'navy')) return;
    try {
      await onUpdateUser({ ...user, heroColor });
      announce(t.profile.heroColorSaved);
    } catch {
      // onUpdateUser already showed an error toast.
    }
  };

  const savePhoto = async (avatar: string) => {
    try {
      await onUpdateUser({ ...user, avatar });
    } catch {
      throw new Error(t.profile.photo.failed);
    }
    announce(t.profile.photo.saved);
    showToast(t.profile.photo.saved);
  };

  return (
    // Bottom padding keeps the last widgets clear of the fixed edit bar.
    <div className="min-h-screen bg-paper pb-44 text-ink sm:pb-24">
      <p role="status" aria-live="polite" className="sr-only">
        {live.n % 2 === 1 ? `${live.text}\u00A0` : live.text}
      </p>
      <ProfileCore
        user={user}
        isOwnProfile
        isConnected={false}
        onToggleConnect={() => undefined}
        onOpenNewProject={onOpenNewProject}
        isEditing
        showLock={editing}
        onToggleEditing={exit}
        onChangePhoto={editing ? changePhoto : undefined}
        onUseDefaultPhoto={editing ? resetToDefaultPhoto : undefined}
        onChangeTags={editing ? changeTags : undefined}
        heroColorPicker={editing ? <HeroColorPicker value={user.heroColor} onChange={(color) => void changeHeroColor(color)} /> : undefined}
        heroSlot={
          <HeroSlot
            layout={draft}
            ctx={ctx}
            editing={editing ? {
              renderControls: (widget) => <WidgetControls widget={widget} editor={editor} ctx={ctx} inHero onRemove={removeWidget} />,
              onAdd: () => setCatalog('hero'),
            } : undefined}
          />
        }
      />

      <main className="mx-auto box-border max-w-[1344px] px-4 pb-[88px] pt-12 sm:px-6 md:px-12">
        <WidgetGrid
          layout={draft}
          ctx={ctx}
          editing={editing ? {
            renderControls: (widget, index) => <WidgetControls widget={widget} editor={editor} ctx={ctx} index={index} onRemove={removeWidget} />,
            onAdd: () => setCatalog('grid'),
          } : undefined}
        />
      </main>

      <EditBar
        dirty={dirty}
        canUndo={editor.canUndo}
        saving={editor.saving}
        previewing={previewing}
        onSave={save}
        onDiscard={discard}
        onUndo={editor.undo}
        onTogglePreview={() => {
          announce(previewing ? t.announce.previewOff : t.announce.previewOn);
          setPreviewing(!previewing);
        }}
        onExit={exit}
        onOpenAccount={() => setAccountOpen(true)}
      />

      {accountOpen && (
        <AccountSettingsDialog
          user={user}
          onClose={() => setAccountOpen(false)}
          onSave={async (next) => {
            await onUpdateUser(next);
            announce(t.editor.accountSaved);
            showToast(t.editor.accountSaved);
          }}
        />
      )}

      {catalog && (
        <WidgetCatalog
          target={catalog}
          draft={draft}
          ctx={ctx}
          onClose={() => setCatalog(null)}
          onPick={(type) => {
            focusNext.current = editor.add(type, catalog);
            setCatalog(null);
          }}
        />
      )}
    </div>
  );
}
