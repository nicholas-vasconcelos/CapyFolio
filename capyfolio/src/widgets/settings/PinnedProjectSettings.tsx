import { useId } from 'react';
import type { WidgetSettingsProps } from '../viewTypes';
import { CONTROL, LABEL } from './fields';
import { t } from '../../i18n';

export function PinnedProjectSettings({ widget, ctx, onChange }: WidgetSettingsProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL}>{t.settings.project}</label>
      <select id={id} className={CONTROL} value={widget.config.projectId as string} onChange={(event) => onChange({ projectId: event.target.value })}>
        {ctx.projects.map((project) => (
          <option key={project.id} value={project.id}>{project.title}</option>
        ))}
      </select>
    </div>
  );
}
