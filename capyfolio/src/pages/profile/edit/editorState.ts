import type { ProfileLayout } from '../../../types';

/*
 * Pure state for widget mode: the saved layout, the draft being edited and an undo
 * stack. Kept out of React so it can be unit-tested.
 */

export const MAX_UNDO = 20;

export interface EditorState {
  saved: ProfileLayout;
  draft: ProfileLayout;
  undo: ProfileLayout[];
  /** Key of the last change, so typing in one field makes one undo step, not one per key. */
  lastKey: string | null;
}

export type EditorAction =
  | { type: 'apply'; next: ProfileLayout; coalesceKey?: string }
  /** Like apply, but computed from the latest draft (for pointer drags, whose handlers outlive a render). */
  | { type: 'update'; change: (draft: ProfileLayout) => ProfileLayout; coalesceKey?: string }
  | { type: 'undo' }
  | { type: 'discard' }
  | { type: 'saved'; layout: ProfileLayout }
  | { type: 'reset'; layout: ProfileLayout };

export const initEditor = (layout: ProfileLayout): EditorState => ({ saved: layout, draft: layout, undo: [], lastKey: null });

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'apply': {
      // Layout actions return the same object when they refuse a change.
      if (action.next === state.draft) return state;
      const coalesce = action.coalesceKey !== undefined && action.coalesceKey === state.lastKey;
      const undo = coalesce ? state.undo : [...state.undo, state.draft].slice(-MAX_UNDO);
      return { ...state, draft: action.next, undo, lastKey: action.coalesceKey ?? null };
    }
    case 'update':
      return editorReducer(state, { type: 'apply', next: action.change(state.draft), coalesceKey: action.coalesceKey });
    case 'undo': {
      if (state.undo.length === 0) return state;
      return { ...state, draft: state.undo[state.undo.length - 1], undo: state.undo.slice(0, -1), lastKey: null };
    }
    case 'discard':
      return initEditor(state.saved);
    case 'saved':
      return initEditor(action.layout);
    case 'reset':
      return initEditor(action.layout);
  }
}

/** Unsaved changes exist. Compared by value because undo can bring back an equal layout. */
export const isDirty = (state: EditorState): boolean => JSON.stringify(state.draft) !== JSON.stringify(state.saved);
