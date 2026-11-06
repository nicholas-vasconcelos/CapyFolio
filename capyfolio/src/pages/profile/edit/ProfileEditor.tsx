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
import { t } from '../../../i18n';

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
    await editor.save();
    showToast(t.editor.saved);
  };

  const discard = () => {
    if (window.confirm(t.editor.confirmDiscard)) editor.discard();
  };

  const editing = !previewing;

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
      />

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
