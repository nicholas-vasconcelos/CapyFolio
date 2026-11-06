import { describe, expect, it } from 'vitest';
import type { ProfileLayout } from '../../../types';
import { MAX_UNDO, editorReducer, initEditor, isDirty } from './editorState';

const layout = (n: number): ProfileLayout => ({
  version: 1,
  hero: null,
  widgets: Array.from({ length: n }, (_, index) => ({
    id: `w${index}`, type: 'freeText', size: 'M', theme: { bg: 'surface', accent: 'navy' }, config: { title: '', text: `${index}` },
  })),
});

describe('editorReducer', () => {
  it('applies changes, marks dirty and undoes them', () => {
    let state = initEditor(layout(1));
    state = editorReducer(state, { type: 'apply', next: layout(2) });
    expect(isDirty(state)).toBe(true);
    state = editorReducer(state, { type: 'undo' });
    expect(state.draft.widgets).toHaveLength(1);
    expect(isDirty(state)).toBe(false);
  });

  it('ignores refused changes (same object back)', () => {
    const state = initEditor(layout(1));
    expect(editorReducer(state, { type: 'apply', next: state.draft })).toBe(state);
  });

  it('makes one undo step for a run of changes with the same key', () => {
    let state = initEditor(layout(1));
    state = editorReducer(state, { type: 'apply', next: layout(2), coalesceKey: 'text:w0' });
    state = editorReducer(state, { type: 'apply', next: layout(3), coalesceKey: 'text:w0' });
    state = editorReducer(state, { type: 'apply', next: layout(4), coalesceKey: 'text:w1' });
    expect(state.undo).toHaveLength(2);
  });

  it('computes updates from the latest draft, so a whole drag is one undo step', () => {
    let state = initEditor(layout(1));
    const grow = (draft: ProfileLayout) => layout(draft.widgets.length + 1);
    state = editorReducer(state, { type: 'update', change: grow, coalesceKey: 'drag:1' });
    state = editorReducer(state, { type: 'update', change: grow, coalesceKey: 'drag:1' });
    expect(state.draft.widgets).toHaveLength(3);
    expect(state.undo).toHaveLength(1);
    expect(editorReducer(state, { type: 'update', change: (draft) => draft })).toBe(state);
  });

  it(`keeps at most ${MAX_UNDO} undo steps`, () => {
    let state = initEditor(layout(0));
    for (let n = 1; n <= MAX_UNDO + 5; n += 1) state = editorReducer(state, { type: 'apply', next: layout(n) });
    expect(state.undo).toHaveLength(MAX_UNDO);
  });

  it('discards back to the saved layout and adopts a newly saved one', () => {
    let state = editorReducer(initEditor(layout(1)), { type: 'apply', next: layout(2) });
    expect(editorReducer(state, { type: 'discard' }).draft.widgets).toHaveLength(1);
    state = editorReducer(state, { type: 'saved', layout: state.draft });
    expect(isDirty(state)).toBe(false);
    expect(state.undo).toHaveLength(0);
  });
});
