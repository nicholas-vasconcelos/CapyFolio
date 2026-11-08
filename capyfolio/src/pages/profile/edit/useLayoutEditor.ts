import { useMemo, useReducer, useState } from 'react';
import type { ProfileLayout, Project, User, WidgetAccent, WidgetBg, WidgetSize, WidgetType } from '../../../types';
import { fmt, t } from '../../../i18n';
import {
  addWidget,
  createWidget,
  featuredProjectIdFromLayout,
  layoutContextFor,
  moveWidget,
  moveWidgetTo,
  removeWidget,
  resizeWidget,
  sanitizeLayout,
  setHeroWidget,
  setWidgetConfig,
  setWidgetTheme,
} from '../../../widgets/layout';
import { WIDGET_SPECS } from '../../../widgets/specs';
import { editorReducer, initEditor, isDirty } from './editorState';

interface Options {
  user: User;
  projects: Project[];
  /** The layout shown before editing started (saved or default). */
  initialLayout: ProfileLayout;
  onUpdateUser: (next: User) => Promise<void>;
  /** Sends a short message to the page's aria-live region. */
  announce: (message: string) => void;
}

/** Widget mode for the owner's profile: a draft layout, undo, save and discard. */
export function useLayoutEditor({ user, projects, initialLayout, onUpdateUser, announce }: Options) {
  const [state, dispatch] = useReducer(editorReducer, initialLayout, initEditor);
  const [saving, setSaving] = useState(false);
  const ctx = useMemo(() => layoutContextFor(user, projects), [user, projects]);
  const draft = state.draft;

  const labelOf = (id: string) => {
    const widget = draft.hero?.id === id ? draft.hero : draft.widgets.find((entry) => entry.id === id);
    return widget ? WIDGET_SPECS[widget.type].label : '';
  };

  /** Applies a change and, when it was not refused, announces it. */
  const apply = (next: ProfileLayout, message?: string, coalesceKey?: string) => {
    if (next === draft) return;
    dispatch({ type: 'apply', next, coalesceKey });
    if (message) announce(message);
  };

  return {
    draft,
    dirty: isDirty(state),
    canUndo: state.undo.length > 0,
    saving,

    announce,

    /*
     * Reordering, for the drag handle. These read the latest draft inside the reducer,
     * because a pointer drag's listeners outlive the render that created them. All
     * changes in one drag (or one keyboard pick-up) share a key, so they undo as one step.
     * The handle announces positions itself.
     */
    moveOnto: (id: string, targetId: string, coalesceKey: string) =>
      dispatch({
        type: 'update',
        coalesceKey,
        change: (latest) => moveWidgetTo(latest, id, latest.widgets.findIndex((widget) => widget.id === targetId)),
      }),
    moveBy: (id: string, direction: -1 | 1, coalesceKey: string) =>
      dispatch({ type: 'update', coalesceKey, change: (latest) => moveWidget(latest, id, direction) }),
    moveToIndex: (id: string, index: number, coalesceKey: string) =>
      dispatch({ type: 'update', coalesceKey, change: (latest) => moveWidgetTo(latest, id, index) }),
    resize: (id: string, size: WidgetSize) =>
      apply(resizeWidget(draft, id, size), fmt(t.announce.resized, { label: labelOf(id), size: t.widgets.sizes[size] })),
    setTheme: (id: string, theme: { bg?: WidgetBg; accent?: WidgetAccent }) =>
      apply(setWidgetTheme(draft, id, theme), fmt(t.announce.recolored, { label: labelOf(id) })),
    // Config changes are not announced: the form fields already say what changed.
    setConfig: (id: string, config: Record<string, unknown>, coalesceKey?: string) =>
      apply(setWidgetConfig(draft, id, config, ctx), undefined, coalesceKey),
    remove: (id: string) => apply(removeWidget(draft, id), fmt(t.announce.removed, { label: labelOf(id) })),

    /** Adds a new widget to the grid or the hero. Returns its id, or null when it cannot be created. */
    add: (type: WidgetType, target: 'grid' | 'hero'): string | null => {
      const widget = createWidget(type, ctx);
      if (!widget) return null;
      const label = WIDGET_SPECS[type].label;
      if (target === 'hero') apply(setHeroWidget(draft, widget), fmt(t.announce.addedToHero, { label }));
      else apply(addWidget(draft, widget), fmt(t.announce.added, { label }));
      return widget.id;
    },

    undo: () => {
      dispatch({ type: 'undo' });
      announce(t.announce.undone);
    },
    discard: () => {
      dispatch({ type: 'discard' });
      announce(t.announce.discarded);
    },

    save: async () => {
      const clean = sanitizeLayout(draft, ctx);
      const featuredProjectId = featuredProjectIdFromLayout(clean) ?? user.featuredProjectId ?? null;
      setSaving(true);
      try {
        await onUpdateUser({ ...user, profileLayout: clean, featuredProjectId });
        dispatch({ type: 'saved', layout: clean });
        announce(t.editor.saved);
      } catch {
        // onUpdateUser already rolled back and showed an error toast; keep the draft so nothing is lost.
      } finally {
        setSaving(false);
      }
    },
  };
}

export type LayoutEditor = ReturnType<typeof useLayoutEditor>;
