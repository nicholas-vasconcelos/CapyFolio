import type { WidgetInstance } from '../types';
import type { LayoutContext } from './specs';
import type { TextColors } from './theme';

/** What a widget view can read about the page it is rendered on. */
export interface WidgetRenderContext extends LayoutContext {
  /** The viewer owns this profile (owner-only actions may show). */
  isOwner: boolean;
  /** Projects already pinned somewhere on this page; the gallery leaves them out. */
  pinnedProjectIds: string[];
  /** Owner actions. Only passed on the owner's own profile. */
  onOpenNewProject?: () => void;
  onSetFeaturedProject?: (projectId: string) => void;
}

export interface WidgetSettingsProps {
  widget: WidgetInstance;
  ctx: LayoutContext;
  /** New config for the widget; it is validated before it reaches the draft. */
  onChange: (config: Record<string, unknown>, coalesceKey?: string) => void;
}

export interface WidgetViewProps {
  widget: WidgetInstance;
  ctx: WidgetRenderContext;
  /** Rendered in the compact hero slot instead of the grid. */
  inHero: boolean;
  /** Text colours that pass contrast on this widget's background. */
  colors: TextColors;
  /** Id for the widget's h2, which labels the whole section. */
  headingId: string;
}
