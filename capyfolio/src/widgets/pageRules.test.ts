import { describe, expect, it } from 'vitest';
import type { Project, User, WidgetInstance } from '../types';
import { layoutContextFor } from './layout';
import { galleryProjects, isEmptyOnPage } from './pageRules';

const project = (id: string, status: string): Project => ({
  id, title: id, shortDescription: '', summary: '', keyResults: [], methodology: '', files: [], images: [],
  authorIds: ['u1'], authorNames: '', institution: '', area: '', type: '', status, date: '', period: '', tags: [],
});

const user: User = { id: 'u1', name: 'Gabriel', focus: '', institution: '', tags: [], email: '' };
const ctx = layoutContextFor(user, [project('a', 'Concluído'), project('b', 'Em andamento')]);

const gallery = (status: string): WidgetInstance => ({
  id: 'g', type: 'projectGallery', size: 'Faixa', theme: { bg: 'surface', accent: 'navy' }, config: { status },
});

describe('galleryProjects', () => {
  it('filters by status and leaves out pinned projects', () => {
    expect(galleryProjects({ status: 'all' }, ctx, ['a']).map((entry) => entry.id)).toEqual(['b']);
    expect(galleryProjects({ status: 'Concluído' }, ctx, []).map((entry) => entry.id)).toEqual(['a']);
  });
});

describe('isEmptyOnPage', () => {
  it('hides a gallery whose only projects are pinned elsewhere', () => {
    expect(isEmptyOnPage(gallery('all'), ctx, ['a', 'b'])).toBe(true);
    expect(isEmptyOnPage(gallery('Concluído'), ctx, ['a'])).toBe(true);
    expect(isEmptyOnPage(gallery('all'), ctx, ['a'])).toBe(false);
  });
});
