import { useId } from 'react';
import type { WidgetSettingsProps } from '../viewTypes';
import { CONTROL, LABEL } from './fields';
import { t } from '../../i18n';

export function KeyResultSettings({ widget, ctx, onChange }: WidgetSettingsProps) {
  const projectId = useId();
  const resultId = useId();
  const withResults = ctx.projects.filter((project) => (project.keyResults ?? []).length > 0);
  const current = withResults.find((project) => project.id === widget.config.projectId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor={projectId} className={LABEL}>{t.settings.project}</label>
        <select
          id={projectId}
          className={CONTROL}
          value={widget.config.projectId as string}
          onChange={(event) => onChange({ projectId: event.target.value, resultIndex: 0 })}
        >
          {withResults.map((project) => (
            <option key={project.id} value={project.id}>{project.title}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={resultId} className={LABEL}>{t.settings.result}</label>
        <select
          id={resultId}
          className={CONTROL}
          value={String(widget.config.resultIndex)}
          onChange={(event) => onChange({ projectId: widget.config.projectId, resultIndex: Number(event.target.value) })}
        >
          {(current?.keyResults ?? []).map((result, index) => (
            <option key={result} value={index}>{result}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
