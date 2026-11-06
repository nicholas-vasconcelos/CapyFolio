import type { Project, WidgetInstance } from '../types';
import { isWidgetEmpty } from './layout';
import type { GalleryStatus, LayoutContext } from './specs';

/*
 * Rules that depend on the whole page rather than on one widget, e.g. the gallery
 * leaving out projects that are already pinned elsewhere.
 */

/** Projects the gallery shows: its status filter, minus projects pinned on the page. */
export function galleryProjects(config: Record<string, unknown>, ctx: LayoutContext, pinnedProjectIds: string[]): Project[] {
  const status = (config.status as GalleryStatus) ?? 'all';
  return ctx.projects.filter(
    (project) => (status === 'all' || project.status === status) && !pinnedProjectIds.includes(project.id),
  );
}

/** Nothing to show on this page: the widget's own data is empty, or the gallery only had pinned projects. */
export function isEmptyOnPage(widget: WidgetInstance, ctx: LayoutContext, pinnedProjectIds: string[]): boolean {
  if (isWidgetEmpty(widget, ctx)) return true;
  if (widget.type === 'projectGallery') return galleryProjects(widget.config, ctx, pinnedProjectIds).length === 0;
  return false;
}
