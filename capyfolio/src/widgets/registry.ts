import type { ComponentType } from 'react';
import type { WidgetType } from '../types';
import { WIDGET_SPECS } from './specs';
import type { WidgetCategory, WidgetSpec } from './specs';
import type { WidgetSettingsProps, WidgetViewProps } from './viewTypes';
import { BadgesView } from './views/Badges';
import { FreeTextView } from './views/FreeText';
import { KeyResultView } from './views/KeyResult';
import { LinksView } from './views/Links';
import { PinnedProjectView } from './views/PinnedProject';
import { ProjectGalleryView } from './views/ProjectGallery';
import { FreeTextSettings } from './settings/FreeTextSettings';
import { KeyResultSettings } from './settings/KeyResultSettings';
import { LinksSettings } from './settings/LinksSettings';
import { PinnedProjectSettings } from './settings/PinnedProjectSettings';
import { ProjectGallerySettings } from './settings/ProjectGallerySettings';
import { t } from '../i18n';

const text = (type: WidgetType) => {
  const { description, emptyPrompt, noDataReason } = t.widgets.types[type];
  return { description, emptyPrompt, noDataReason };
};

/** Everything the page needs per widget type. */
export interface WidgetRegistryEntry {
  spec: WidgetSpec;
  View: ComponentType<WidgetViewProps>;
  /** Settings form; absent when the widget has nothing to configure. */
  Settings?: ComponentType<WidgetSettingsProps>;
  /** One line for the catalogue. */
  description: string;
  /** Shown to the owner in widget mode when the widget has nothing to show. */
  emptyPrompt: string;
  /** Why the widget cannot be added when the student has no data for it. */
  noDataReason: string;
}

export const CATEGORY_LABELS: Record<WidgetCategory, string> = t.widgets.categories;

export const WIDGET_REGISTRY: Record<WidgetType, WidgetRegistryEntry> = {
  pinnedProject: {
    spec: WIDGET_SPECS.pinnedProject,
    ...text('pinnedProject'),
    View: PinnedProjectView,
    Settings: PinnedProjectSettings,
  },
  projectGallery: {
    spec: WIDGET_SPECS.projectGallery,
    ...text('projectGallery'),
    View: ProjectGalleryView,
    Settings: ProjectGallerySettings,
  },
  keyResult: {
    spec: WIDGET_SPECS.keyResult,
    ...text('keyResult'),
    View: KeyResultView,
    Settings: KeyResultSettings,
  },
  links: {
    spec: WIDGET_SPECS.links,
    ...text('links'),
    View: LinksView,
    Settings: LinksSettings,
  },
  badges: {
    spec: WIDGET_SPECS.badges,
    ...text('badges'),
    View: BadgesView,
  },
  freeText: {
    spec: WIDGET_SPECS.freeText,
    ...text('freeText'),
    View: FreeTextView,
    Settings: FreeTextSettings,
  },
};
