import { describe, expect, it } from 'vitest';
import type { ProfileLayout, Project, User, WidgetInstance } from '../types';
import {
  MAX_WIDGETS,
  addWidget,
  createWidget,
  defaultLayout,
  featuredProjectIdFromLayout,
  isWidgetEmpty,
  layoutContextFor,
  moveWidget,
  moveWidgetTo,
  removeWidget,
  resizeWidget,
  resolveLayout,
  sanitizeLayout,
  setHeroWidget,
  setWidgetConfig,
  setWidgetTheme,
} from './layout';
import { textOn } from './theme';

const makeProject = (id: string, overrides: Partial<Project> = {}): Project => ({
  id,
  title: `Projeto ${id}`,
  images: [],
  shortDescription: '',
  summary: '',
  keyResults: ['Redução de 40% no tempo de processamento.'],
  methodology: '',
  files: [],
  authorIds: ['u1'],
  authorNames: 'Arthur',
  institution: 'Ibmec Rio',
  area: 'Fullstack & IA',
  type: 'Projeto Prático',
  status: 'Concluído',
  date: '15 dez. 2025',
  period: '',
  tags: [],
  ...overrides,
});

const user: User = {
  id: 'u1',
  name: 'Arthur',
  focus: 'Fullstack & IA',
  institution: 'Ibmec Rio',
  tags: ['React'],
  badges: ['tech', 'career'],
  featuredProjectId: 'p2',
  email: 'arthur@ibmec.br',
  github: 'github.com/arthur',
};

const projects = [
  makeProject('p1'),
  makeProject('p2', { status: 'Em andamento', keyResults: [] }),
  makeProject('other', { authorIds: ['someone-else'] }),
];

const ctx = layoutContextFor(user, projects);

const counter = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const widget = (overrides: Partial<WidgetInstance>): WidgetInstance => ({
  id: 'x',
  type: 'freeText',
  size: 'M',
  theme: { bg: 'surface', accent: 'navy' },
  config: { title: '', text: 'Olá' },
  ...overrides,
});

const layout = (widgets: WidgetInstance[], hero: WidgetInstance | null = null): ProfileLayout => ({
  version: 1,
  hero,
  widgets,
});

describe('layoutContextFor', () => {
  it('keeps only projects the user authored', () => {
    expect(ctx.projects.map((project) => project.id)).toEqual(['p1', 'p2']);
  });
});

describe('defaultLayout', () => {
  it('recreates the old profile page with an empty hero slot', () => {
    const result = defaultLayout(ctx, counter());
    expect(result.hero).toBeNull();
    expect(result.widgets.map((entry) => entry.type)).toEqual(['pinnedProject', 'links', 'badges', 'projectGallery']);
    expect(result.widgets[0].size).toBe('G');
  });

  it('starts the pinned project at M when there are no badges, so the grid has no gap', () => {
    const noBadges = layoutContextFor({ ...user, badges: [] }, projects);
    const result = defaultLayout(noBadges, counter());
    expect(result.widgets.map((entry) => `${entry.type}:${entry.size}`)).toEqual(['pinnedProject:M', 'links:M', 'projectGallery:Faixa']);
  });

  it('pins the featured project', () => {
    expect(defaultLayout(ctx, counter()).widgets[0].config).toEqual({ projectId: 'p2' });
  });

  it('skips widgets the user has no data for', () => {
    const empty = layoutContextFor({ ...user, badges: [], featuredProjectId: null }, []);
    expect(defaultLayout(empty, counter()).widgets.map((entry) => entry.type)).toEqual(['links', 'projectGallery']);
  });
});

describe('sanitizeLayout', () => {
  it('falls back to the default layout for garbage or an unknown version', () => {
    for (const raw of [null, 'oops', 42, [], { version: 2, hero: null, widgets: [] }]) {
      expect(sanitizeLayout(raw, ctx, counter())).toEqual(defaultLayout(ctx, counter()));
    }
  });

  it('keeps an empty hero slot', () => {
    expect(sanitizeLayout(layout([]), ctx).hero).toBeNull();
  });

  it('drops unknown widget types', () => {
    const result = sanitizeLayout(layout([widget({ type: 'weather' as never })]), ctx);
    expect(result.widgets).toEqual([]);
  });

  it('drops a pinned project that was deleted or belongs to someone else', () => {
    const result = sanitizeLayout(
      layout([
        widget({ id: 'a', type: 'pinnedProject', size: 'G', config: { projectId: 'deleted' } }),
        widget({ id: 'b', type: 'pinnedProject', size: 'G', config: { projectId: 'other' } }),
        widget({ id: 'c', type: 'pinnedProject', size: 'G', config: { projectId: 'p1' } }),
      ]),
      ctx,
    );
    expect(result.widgets.map((entry) => entry.id)).toEqual(['c']);
  });

  it('drops a key result whose index no longer exists', () => {
    const result = sanitizeLayout(
      layout([
        widget({ id: 'a', type: 'keyResult', size: 'P', config: { projectId: 'p1', resultIndex: 5 } }),
        widget({ id: 'b', type: 'keyResult', size: 'P', config: { projectId: 'p1', resultIndex: 0 } }),
      ]),
      ctx,
    );
    expect(result.widgets.map((entry) => entry.id)).toEqual(['b']);
  });

  it('forces invalid sizes and colours back to the widget defaults', () => {
    const [result] = sanitizeLayout(
      layout([widget({ size: 'XL' as never, theme: { bg: 'red' as never, accent: 'purple' as never } })]),
      ctx,
    ).widgets;
    expect(result.size).toBe('M');
    expect(result.theme).toEqual({ bg: 'surface', accent: 'navy' });
  });

  it('removes widgets from the hero that are not hero-safe', () => {
    const result = sanitizeLayout(layout([], widget({ type: 'freeText' })), ctx);
    expect(result.hero).toBeNull();
  });

  it('never leaves a navy background in the navy hero', () => {
    const hero = widget({ type: 'links', size: 'M', theme: { bg: 'navy', accent: 'gold' }, config: {} });
    expect(sanitizeLayout(layout([], hero), ctx).hero?.theme).toEqual({ bg: 'surface', accent: 'gold' });
  });

  it('allows at most two navy widgets', () => {
    const navy = (id: string) => widget({ id, theme: { bg: 'navy', accent: 'gold' } });
    const result = sanitizeLayout(layout([navy('a'), navy('b'), navy('c')]), ctx);
    expect(result.widgets.map((entry) => entry.theme.bg)).toEqual(['navy', 'navy', 'surface']);
  });

  it('caps the grid at the maximum number of widgets', () => {
    const many = Array.from({ length: MAX_WIDGETS + 3 }, (_, index) => widget({ id: `w${index}` }));
    expect(sanitizeLayout(layout(many), ctx).widgets).toHaveLength(MAX_WIDGETS);
  });

  it('makes duplicate and missing ids unique', () => {
    const result = sanitizeLayout(layout([widget({ id: 'same' }), widget({ id: 'same' }), widget({ id: '' })]), ctx, counter());
    expect(new Set(result.widgets.map((entry) => entry.id)).size).toBe(3);
  });

  it('truncates free text to its limits', () => {
    const [result] = sanitizeLayout(layout([widget({ config: { title: 't'.repeat(100), text: 'x'.repeat(900) } })]), ctx).widgets;
    expect((result.config.title as string).length).toBe(60);
    expect((result.config.text as string).length).toBe(600);
  });

  it('keeps only known link keys', () => {
    const [result] = sanitizeLayout(layout([widget({ type: 'links', config: { show: ['github', 'tiktok'] } })]), ctx).widgets;
    expect(result.config).toEqual({ show: ['github'] });
  });
});

describe('resolveLayout', () => {
  it('uses the saved layout when there is one', () => {
    const saved = layout([widget({ id: 'mine' })]);
    expect(resolveLayout({ ...user, profileLayout: saved }, projects).widgets.map((entry) => entry.id)).toEqual(['mine']);
  });

  it('uses the default layout otherwise', () => {
    expect(resolveLayout(user, projects, counter())).toEqual(defaultLayout(ctx, counter()));
  });
});

describe('featuredProjectIdFromLayout', () => {
  const pinned = (id: string, projectId: string) => widget({ id, type: 'pinnedProject', size: 'G', config: { projectId } });

  it('prefers the hero', () => {
    expect(featuredProjectIdFromLayout(layout([pinned('a', 'p1')], pinned('h', 'p2')))).toBe('p2');
  });

  it('falls back to the first pinned project in the grid, then null', () => {
    expect(featuredProjectIdFromLayout(layout([widget({}), pinned('a', 'p1')]))).toBe('p1');
    expect(featuredProjectIdFromLayout(layout([widget({})]))).toBeNull();
  });
});

describe('isWidgetEmpty', () => {
  it('detects widgets with nothing to show', () => {
    const noLinks = layoutContextFor({ ...user, github: '' }, projects);
    expect(isWidgetEmpty(widget({ type: 'links', config: { show: ['github'] } }), noLinks)).toBe(true);
    expect(isWidgetEmpty(widget({ type: 'links', config: { show: ['github'] } }), ctx)).toBe(false);
    expect(isWidgetEmpty(widget({ config: { title: 'Oi', text: '   ' } }), ctx)).toBe(true);
    expect(isWidgetEmpty(widget({ type: 'badges', config: {} }), layoutContextFor({ ...user, badges: [] }, projects))).toBe(true);
    expect(isWidgetEmpty(widget({ type: 'projectGallery', config: { status: 'Em andamento' } }), ctx)).toBe(false);
    expect(isWidgetEmpty(widget({ type: 'projectGallery', config: { status: 'all' } }), layoutContextFor(user, []))).toBe(true);
  });
});

describe('editing actions', () => {
  const base = layout([widget({ id: 'a' }), widget({ id: 'b' }), widget({ id: 'c' })]);

  it('creates widgets with defaults, or null without data', () => {
    expect(createWidget('keyResult', ctx, () => 'k')).toEqual({
      id: 'k',
      type: 'keyResult',
      size: 'P',
      theme: { bg: 'greenTint', accent: 'green' },
      config: { projectId: 'p1', resultIndex: 0 },
    });
    expect(createWidget('pinnedProject', layoutContextFor(user, []))).toBeNull();
  });

  it('adds up to the maximum', () => {
    expect(addWidget(base, widget({ id: 'd' })).widgets).toHaveLength(4);
    const full = layout(Array.from({ length: MAX_WIDGETS }, (_, index) => widget({ id: `w${index}` })));
    expect(addWidget(full, widget({ id: 'extra' }))).toBe(full);
  });

  it('moves widgets and ignores moves past the ends', () => {
    expect(moveWidget(base, 'b', -1).widgets.map((entry) => entry.id)).toEqual(['b', 'a', 'c']);
    expect(moveWidget(base, 'c', 1)).toBe(base);
    expect(moveWidget(base, 'a', -1)).toBe(base);
  });

  it('moves a widget to any position, clamped, for drag and drop', () => {
    expect(moveWidgetTo(base, 'c', 0).widgets.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);
    expect(moveWidgetTo(base, 'a', 2).widgets.map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
    expect(moveWidgetTo(base, 'a', 99).widgets.map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
    expect(moveWidgetTo(base, 'b', 1)).toBe(base);
    expect(moveWidgetTo(base, 'b', -1)).toBe(base);
    expect(moveWidgetTo(base, 'missing', 0)).toBe(base);
  });

  it('removes from the grid or the hero', () => {
    expect(removeWidget(base, 'b').widgets.map((entry) => entry.id)).toEqual(['a', 'c']);
    const withHero = layout([], widget({ id: 'h', type: 'links', config: { show: ['github'] } }));
    expect(removeWidget(withHero, 'h').hero).toBeNull();
  });

  it('only resizes to sizes the widget allows', () => {
    expect(resizeWidget(base, 'a', 'G').widgets[0].size).toBe('G');
    expect(resizeWidget(base, 'a', 'P').widgets[0].size).toBe('M');
  });

  it('only puts hero-safe widgets in the hero, on a light background', () => {
    expect(setHeroWidget(base, widget({ id: 'h' }))).toBe(base);
    const links = widget({ id: 'h', type: 'links', theme: { bg: 'navy', accent: 'gold' }, config: { show: ['github'] } });
    expect(setHeroWidget(base, links).hero?.theme.bg).toBe('surface');
    expect(setHeroWidget(setHeroWidget(base, links), null).hero).toBeNull();
  });

  it('refuses a third navy widget and a navy hero', () => {
    let next = setWidgetTheme(base, 'a', { bg: 'navy' });
    next = setWidgetTheme(next, 'b', { bg: 'navy' });
    expect(setWidgetTheme(next, 'c', { bg: 'navy' })).toBe(next);
    expect(setWidgetTheme(next, 'a', { accent: 'green' }).widgets[0].theme).toEqual({ bg: 'navy', accent: 'green' });

    const withHero = layout([], widget({ id: 'h', type: 'links', config: { show: ['github'] } }));
    expect(setWidgetTheme(withHero, 'h', { bg: 'navy' })).toBe(withHero);
  });

  it('validates new config', () => {
    const pinned = layout([widget({ id: 'p', type: 'pinnedProject', size: 'G', config: { projectId: 'p1' } })]);
    expect(setWidgetConfig(pinned, 'p', { projectId: 'p2' }, ctx).widgets[0].config).toEqual({ projectId: 'p2' });
    expect(setWidgetConfig(pinned, 'p', { projectId: 'other' }, ctx)).toBe(pinned);
  });

  it('does not mutate its input', () => {
    const snapshot = JSON.stringify(base);
    moveWidget(base, 'b', 1);
    removeWidget(base, 'a');
    setWidgetTheme(base, 'a', { bg: 'goldTint' });
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe('textOn', () => {
  it('uses light text only on navy', () => {
    expect(textOn('navy').text).toBe('text-on-navy');
    expect(textOn('surface').text).toBe('text-ink');
  });

  it('uses green-ink, not green, for headings on green-tint', () => {
    expect(textOn('greenTint').heading).toBe('text-green-ink');
  });
});
