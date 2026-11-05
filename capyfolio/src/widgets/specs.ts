import type { Project, User, WidgetSize, WidgetTheme, WidgetType } from '../types';

/*
 * Pure, React-free description of each widget type: where it may go, which sizes
 * it takes and how its config is validated. The React side (views, settings forms)
 * lives in the registry and builds on these specs.
 */

export interface LayoutContext {
  user: User;
  /** Projects authored by the profile's user. */
  projects: Project[];
}

export type WidgetCategory = 'trabalho' | 'contato' | 'conquistas' | 'pessoal';

export type LinkKey = 'github' | 'linkedin' | 'lattes';
export const LINK_KEYS: LinkKey[] = ['github', 'linkedin', 'lattes'];

export type GalleryStatus = 'all' | 'Concluído' | 'Em andamento';
const GALLERY_STATUSES: GalleryStatus[] = ['all', 'Concluído', 'Em andamento'];

export const FREE_TEXT_TITLE_MAX = 60;
export const FREE_TEXT_BODY_MAX = 600;

export interface WidgetSpec {
  type: WidgetType;
  label: string;
  category: WidgetCategory;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  /** May be placed in the hero slot (top right of the profile). */
  heroSafe: boolean;
  defaultTheme: WidgetTheme;
  /** Starting config for a new widget, or null when the user has no data for it. */
  createConfig: (ctx: LayoutContext) => Record<string, unknown> | null;
  /** Cleaned config, or null when the widget can no longer be shown (e.g. its project was deleted). */
  sanitizeConfig: (config: Record<string, unknown>, ctx: LayoutContext) => Record<string, unknown> | null;
  /** True when there is nothing to show: owners see a prompt, visitors see nothing. */
  isEmpty: (config: Record<string, unknown>, ctx: LayoutContext) => boolean;
}

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const ownsProject = (ctx: LayoutContext, projectId: unknown): projectId is string =>
  typeof projectId === 'string' && ctx.projects.some((project) => project.id === projectId);

export const userLink = (user: User, key: LinkKey): string => (user[key] ?? '').trim();

export const WIDGET_SPECS: Record<WidgetType, WidgetSpec> = {
  pinnedProject: {
    type: 'pinnedProject',
    label: 'Projeto fixado',
    category: 'trabalho',
    sizes: ['P', 'M', 'G'],
    defaultSize: 'G',
    heroSafe: true,
    defaultTheme: { bg: 'surface', accent: 'green' },
    createConfig: (ctx) => {
      const featured = ctx.projects.find((project) => project.id === ctx.user.featuredProjectId);
      const project = featured ?? ctx.projects[0];
      return project ? { projectId: project.id } : null;
    },
    sanitizeConfig: (config, ctx) => (ownsProject(ctx, config.projectId) ? { projectId: config.projectId } : null),
    isEmpty: () => false,
  },

  projectGallery: {
    type: 'projectGallery',
    label: 'Galeria de projetos',
    category: 'trabalho',
    sizes: ['M', 'G', 'Faixa'],
    defaultSize: 'Faixa',
    heroSafe: false,
    defaultTheme: { bg: 'surface', accent: 'navy' },
    createConfig: () => ({ status: 'all' }),
    sanitizeConfig: (config) => ({
      status: (GALLERY_STATUSES as unknown[]).includes(config.status) ? config.status : 'all',
    }),
    isEmpty: (config, ctx) =>
      !ctx.projects.some((project) => config.status === 'all' || project.status === config.status),
  },

  keyResult: {
    type: 'keyResult',
    label: 'Resultado-chave',
    category: 'trabalho',
    sizes: ['P'],
    defaultSize: 'P',
    heroSafe: true,
    defaultTheme: { bg: 'greenTint', accent: 'green' },
    createConfig: (ctx) => {
      const project = ctx.projects.find((entry) => entry.keyResults?.length > 0);
      return project ? { projectId: project.id, resultIndex: 0 } : null;
    },
    sanitizeConfig: (config, ctx) => {
      const project = ctx.projects.find((entry) => entry.id === config.projectId);
      const index = config.resultIndex;
      if (!project || typeof index !== 'number' || !Number.isInteger(index)) return null;
      if (index < 0 || index >= (project.keyResults?.length ?? 0)) return null;
      return { projectId: project.id, resultIndex: index };
    },
    isEmpty: () => false,
  },

  links: {
    type: 'links',
    label: 'Links',
    category: 'contato',
    sizes: ['P', 'M'],
    defaultSize: 'M',
    heroSafe: true,
    defaultTheme: { bg: 'surface', accent: 'ink' },
    createConfig: () => ({ show: [...LINK_KEYS] }),
    sanitizeConfig: (config) => {
      const requested = Array.isArray(config.show) ? config.show : LINK_KEYS;
      return { show: LINK_KEYS.filter((key) => requested.includes(key)) };
    },
    isEmpty: (config, ctx) =>
      !(config.show as LinkKey[]).some((key) => userLink(ctx.user, key) !== ''),
  },

  badges: {
    type: 'badges',
    label: 'Selos do perfil',
    category: 'conquistas',
    sizes: ['M'],
    defaultSize: 'M',
    heroSafe: true,
    defaultTheme: { bg: 'goldTint', accent: 'gold' },
    createConfig: () => ({}),
    sanitizeConfig: () => ({}),
    isEmpty: (_config, ctx) => (ctx.user.badges ?? []).length === 0,
  },

  freeText: {
    type: 'freeText',
    label: 'Texto livre',
    category: 'pessoal',
    sizes: ['M', 'G'],
    defaultSize: 'M',
    heroSafe: false,
    defaultTheme: { bg: 'surface', accent: 'navy' },
    createConfig: () => ({ title: '', text: '' }),
    sanitizeConfig: (config) => ({
      title: asString(config.title).trim().slice(0, FREE_TEXT_TITLE_MAX),
      text: asString(config.text).slice(0, FREE_TEXT_BODY_MAX),
    }),
    isEmpty: (config) => asString(config.text).trim() === '',
  },
};

export const WIDGET_TYPES = Object.keys(WIDGET_SPECS) as WidgetType[];

export const isWidgetType = (value: unknown): value is WidgetType =>
  typeof value === 'string' && (WIDGET_TYPES as string[]).includes(value);
