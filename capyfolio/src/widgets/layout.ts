import type { ProfileLayout, Project, User, WidgetAccent, WidgetBg, WidgetInstance, WidgetSize, WidgetType } from '../types';
import { DEFAULT_THEME, HERO_BGS, MAX_NAVY_WIDGETS, isWidgetAccent, isWidgetBg } from './theme';
import { WIDGET_SPECS, isWidgetType } from './specs';
import type { LayoutContext } from './specs';

/*
 * Pure functions for reading, validating and editing a profile's widget layout.
 * No React and no storage here, so it can be unit-tested and later reused to
 * validate layouts on a server.
 */

export const LAYOUT_VERSION = 1;
export const MAX_WIDGETS = 12;

export type IdFactory = () => string;

export const createWidgetId: IdFactory = () =>
  `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const layoutContextFor = (user: User, allProjects: Project[]): LayoutContext => ({
  user,
  projects: allProjects.filter((project) => project.authorIds.includes(user.id)),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A new widget of `type` with default size, theme and config, or null when the user has no data for it. */
export function createWidget(type: WidgetType, ctx: LayoutContext, newId: IdFactory = createWidgetId): WidgetInstance | null {
  const spec = WIDGET_SPECS[type];
  const config = spec.createConfig(ctx);
  if (!config) return null;
  return { id: newId(), type, size: spec.defaultSize, theme: { ...spec.defaultTheme }, config };
}

function sanitizeWidget(raw: unknown, ctx: LayoutContext, inHero: boolean, newId: IdFactory): WidgetInstance | null {
  if (!isRecord(raw) || !isWidgetType(raw.type)) return null;
  const spec = WIDGET_SPECS[raw.type];
  if (inHero && !spec.heroSafe) return null;

  const config = spec.sanitizeConfig(isRecord(raw.config) ? raw.config : {}, ctx);
  if (!config) return null;

  const size: WidgetSize = (spec.sizes as unknown[]).includes(raw.size) ? (raw.size as WidgetSize) : spec.defaultSize;

  const rawTheme = isRecord(raw.theme) ? raw.theme : {};
  let bg: WidgetBg = isWidgetBg(rawTheme.bg) ? rawTheme.bg : spec.defaultTheme.bg;
  const accent: WidgetAccent = isWidgetAccent(rawTheme.accent) ? rawTheme.accent : spec.defaultTheme.accent;
  if (inHero && !HERO_BGS.includes(bg)) bg = DEFAULT_THEME.bg;

  const id = typeof raw.id === 'string' && raw.id.trim() !== '' ? raw.id : newId();
  return { id, type: raw.type, size, theme: { bg, accent }, config };
}

/**
 * Turns anything read from storage into a valid layout: unknown types, widgets whose
 * data is gone and widgets that are not allowed where they sit are dropped; sizes,
 * colours and config are forced into range; ids are made unique; the grid is capped
 * at MAX_WIDGETS and at MAX_NAVY_WIDGETS navy backgrounds. Never throws.
 */
export function sanitizeLayout(raw: unknown, ctx: LayoutContext, newId: IdFactory = createWidgetId): ProfileLayout {
  if (!isRecord(raw) || raw.version !== LAYOUT_VERSION) return defaultLayout(ctx, newId);

  const hero = raw.hero == null ? null : sanitizeWidget(raw.hero, ctx, true, newId);
  const seen = new Set<string>(hero ? [hero.id] : []);

  let navyCount = 0;
  const widgets: WidgetInstance[] = [];
  for (const entry of Array.isArray(raw.widgets) ? raw.widgets : []) {
    if (widgets.length >= MAX_WIDGETS) break;
    const widget = sanitizeWidget(entry, ctx, false, newId);
    if (!widget) continue;
    if (seen.has(widget.id)) widget.id = newId();
    seen.add(widget.id);
    if (widget.theme.bg === 'navy') {
      navyCount += 1;
      if (navyCount > MAX_NAVY_WIDGETS) widget.theme = { ...widget.theme, bg: DEFAULT_THEME.bg };
    }
    widgets.push(widget);
  }

  return { version: LAYOUT_VERSION, hero, widgets };
}

/** The layout everyone starts with. It reproduces the profile page as it was before widgets. */
export function defaultLayout(ctx: LayoutContext, newId: IdFactory = createWidgetId): ProfileLayout {
  const types: WidgetType[] = ['pinnedProject', 'projectGallery', 'links'];
  if ((ctx.user.badges ?? []).length > 0) types.push('badges');

  const widgets = types
    .map((type) => createWidget(type, ctx, newId))
    .filter((widget): widget is WidgetInstance => widget !== null);

  return { version: LAYOUT_VERSION, hero: null, widgets };
}

/** The layout to render for a user: their saved one, cleaned, or the default. */
export function resolveLayout(user: User, allProjects: Project[], newId: IdFactory = createWidgetId): ProfileLayout {
  const ctx = layoutContextFor(user, allProjects);
  return user.profileLayout ? sanitizeLayout(user.profileLayout, ctx, newId) : defaultLayout(ctx, newId);
}

/** The project the rest of the app treats as featured: the hero's pinned project, else the first one in the grid. */
export function featuredProjectIdFromLayout(layout: ProfileLayout): string | null {
  const pinned = [layout.hero, ...layout.widgets].find((widget) => widget?.type === 'pinnedProject');
  return pinned ? (pinned.config.projectId as string) : null;
}

export const isWidgetEmpty = (widget: WidgetInstance, ctx: LayoutContext): boolean =>
  WIDGET_SPECS[widget.type].isEmpty(widget.config, ctx);

export const navyWidgetCount = (layout: ProfileLayout): number =>
  layout.widgets.filter((widget) => widget.theme.bg === 'navy').length;

/* Editing actions. Each returns a new layout and leaves the input untouched. */

const mapWidget = (layout: ProfileLayout, id: string, change: (widget: WidgetInstance) => WidgetInstance): ProfileLayout => ({
  ...layout,
  hero: layout.hero?.id === id ? change(layout.hero) : layout.hero,
  widgets: layout.widgets.map((widget) => (widget.id === id ? change(widget) : widget)),
});

export function addWidget(layout: ProfileLayout, widget: WidgetInstance): ProfileLayout {
  if (layout.widgets.length >= MAX_WIDGETS) return layout;
  return { ...layout, widgets: [...layout.widgets, widget] };
}

export function setHeroWidget(layout: ProfileLayout, widget: WidgetInstance | null): ProfileLayout {
  if (widget && !WIDGET_SPECS[widget.type].heroSafe) return layout;
  if (widget && !HERO_BGS.includes(widget.theme.bg)) {
    widget = { ...widget, theme: { ...widget.theme, bg: DEFAULT_THEME.bg } };
  }
  return { ...layout, hero: widget };
}

export function removeWidget(layout: ProfileLayout, id: string): ProfileLayout {
  return {
    ...layout,
    hero: layout.hero?.id === id ? null : layout.hero,
    widgets: layout.widgets.filter((widget) => widget.id !== id),
  };
}

export function moveWidget(layout: ProfileLayout, id: string, direction: -1 | 1): ProfileLayout {
  const index = layout.widgets.findIndex((widget) => widget.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= layout.widgets.length) return layout;
  const widgets = [...layout.widgets];
  [widgets[index], widgets[target]] = [widgets[target], widgets[index]];
  return { ...layout, widgets };
}

export function resizeWidget(layout: ProfileLayout, id: string, size: WidgetSize): ProfileLayout {
  return mapWidget(layout, id, (widget) =>
    WIDGET_SPECS[widget.type].sizes.includes(size) ? { ...widget, size } : widget,
  );
}

/** Changes background and/or accent. Refused when it would break the hero or navy limits. */
export function setWidgetTheme(layout: ProfileLayout, id: string, theme: { bg?: WidgetBg; accent?: WidgetAccent }): ProfileLayout {
  const inHero = layout.hero?.id === id;
  const current = inHero ? layout.hero : layout.widgets.find((widget) => widget.id === id);
  if (!current) return layout;

  const bg = theme.bg ?? current.theme.bg;
  if (inHero && !HERO_BGS.includes(bg)) return layout;
  if (!inHero && bg === 'navy' && current.theme.bg !== 'navy' && navyWidgetCount(layout) >= MAX_NAVY_WIDGETS) return layout;

  return mapWidget(layout, id, (widget) => ({
    ...widget,
    theme: { bg, accent: theme.accent ?? widget.theme.accent },
  }));
}

/** Replaces a widget's config after validating it; invalid config leaves the layout unchanged. */
export function setWidgetConfig(layout: ProfileLayout, id: string, config: Record<string, unknown>, ctx: LayoutContext): ProfileLayout {
  const widget = layout.hero?.id === id ? layout.hero : layout.widgets.find((entry) => entry.id === id);
  if (!widget) return layout;
  const clean = WIDGET_SPECS[widget.type].sanitizeConfig(config, ctx);
  if (!clean) return layout;
  return mapWidget(layout, id, (entry) => ({ ...entry, config: clean }));
}
