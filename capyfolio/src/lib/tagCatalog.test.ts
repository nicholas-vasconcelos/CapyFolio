import { describe, expect, it } from 'vitest';
import {
  COURSE_PROFILES,
  SUGGESTED_TAGS,
  TAG_CATALOG,
  TAG_GROUPS,
  canonicalTag,
  courseProfileFor,
  normalizeTag,
  searchTags,
  suggestedTagsFor,
} from './tagCatalog';

const profile = (id: string) => COURSE_PROFILES.find((entry) => entry.id === id) ?? null;

describe('tag catalog', () => {
  it('has no duplicate tags across groups', () => {
    const normalized = TAG_CATALOG.map(normalizeTag);
    const duplicates = normalized.filter((tag, index) => normalized.indexOf(tag) !== index);
    expect(duplicates).toEqual([]);
  });

  it('has unique group ids', () => {
    const ids = TAG_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only suggests tags that exist in the catalog', () => {
    for (const tag of SUGGESTED_TAGS) expect(TAG_CATALOG).toContain(tag);
    for (const entry of COURSE_PROFILES) {
      for (const tag of entry.suggestions) expect(TAG_CATALOG, `${entry.id}: ${tag}`).toContain(tag);
    }
  });

  it('gives every course profile known groups and at least 8 suggestions', () => {
    const ids = new Set(TAG_GROUPS.map((group) => group.id));
    for (const entry of COURSE_PROFILES) {
      expect(entry.suggestions.length, entry.id).toBeGreaterThanOrEqual(8);
      for (const group of entry.groups) expect(ids.has(group), `${entry.id}: ${group}`).toBe(true);
    }
  });
});

describe('courseProfileFor', () => {
  it.each([
    ['Arquitetura e Urbanismo', 'architecture'],
    ['Arq. e Urbanismo', 'architecture'],
    ['ARQUITETURA', 'architecture'],
    ['Ciência da Computação', 'computing'],
    ['Engenharia de Software', 'computing'],
    ['Engenharia de Computação', 'computing'],
    ['Análise e Desenvolvimento de Sistemas', 'computing'],
    ['Engenharia Civil', 'civil'],
    ['Engenharia Mecânica', 'engineering'],
    ['Engenharia Química', 'engineering'],
    ['Design Gráfico', 'design'],
    ['Design de Moda', 'design'],
    ['Publicidade e Propaganda', 'communication'],
    ['Cinema e Audiovisual', 'communication'],
    ['Música', 'arts'],
    ['Ciências Biológicas', 'science'],
    ['Química', 'science'],
    ['Psicologia', 'humanities'],
    ['Direito', 'business'],
    ['Administração', 'business'],
  ])('maps "%s" to %s', (course, id) => {
    expect(courseProfileFor(course)?.id).toBe(id);
  });

  it('matches whole words only and returns null for unknown or empty courses', () => {
    // "estatistica" contains "ti" but must not count as the "TI" (computing) keyword.
    expect(courseProfileFor('Estatística')?.id).toBe('science');
    expect(courseProfileFor('Curso inventado')).toBeNull();
    expect(courseProfileFor('')).toBeNull();
    expect(courseProfileFor(null)).toBeNull();
  });
});

describe('searchTags', () => {
  it('shows the general suggestions for an empty query without a course', () => {
    expect(searchTags('', [])).toEqual(SUGGESTED_TAGS);
    expect(searchTags('', ['Python'])).not.toContain('Python');
  });

  it("shows the course's suggestions for an empty query", () => {
    const architecture = profile('architecture');
    expect(searchTags('', [], 8, architecture)).toEqual(architecture!.suggestions.slice(0, 8));
    expect(suggestedTagsFor(architecture, ['Revit'])).not.toContain('Revit');
  });

  it('ignores case and accents', () => {
    expect(searchTags('visao', [])).toContain('Visão Computacional');
    expect(searchTags('maquete fisica', [])).toEqual(['Maquete física']);
  });

  it("ranks the course's tags first without hiding the others", () => {
    const architecture = profile('architecture');
    const results = searchTags('re', [], 1000, architecture);
    expect(results.indexOf('Revit')).toBeLessThan(results.indexOf('React'));
    expect(results.indexOf('Renderização')).toBeLessThan(results.indexOf('React'));
    expect(results).toContain('React');

    const computing = searchTags('re', [], 1000, profile('computing'));
    expect(computing.indexOf('React')).toBeLessThan(computing.indexOf('Revit'));
    // The course's own suggestions lead within its matches.
    expect(computing[0]).toBe('React');
    expect(searchTags('re', [], 5, architecture)[0]).toBe('Revit');
  });

  it('finds architecture tags', () => {
    expect(searchTags('revit', [])).toEqual(['Revit']);
    expect(searchTags('maquete', [])).toEqual(expect.arrayContaining(['Maquete física', 'Maquete eletrônica']));
    expect(searchTags('urbanismo', [], 8)).toEqual(expect.arrayContaining(['Urbanismo', 'Urbanismo tático']));
  });

  it('puts prefix and word-start matches before inner matches', () => {
    const testes = searchTags('test', [], 50);
    expect(testes.indexOf('Testes unitários')).toBeLessThan(testes.indexOf('Pentest'));
  });

  it('excludes tags already picked and respects the limit', () => {
    const react = searchTags('react', ['React']);
    expect(react).not.toContain('React');
    expect(react).toEqual(expect.arrayContaining(['React Native', 'React Query']));
    expect(searchTags('a', [], 5)).toHaveLength(5);
  });
});

describe('canonicalTag', () => {
  it('returns the catalog spelling for known tags and trims custom ones', () => {
    expect(canonicalTag('  typescript ')).toBe('TypeScript');
    expect(canonicalTag('qa tester')).toBe('QA Tester');
    expect(canonicalTag('  Meu   tema ')).toBe('Meu tema');
  });
});
