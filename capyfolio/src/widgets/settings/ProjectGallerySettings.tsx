import { useId } from 'react';
import type { GalleryStatus } from '../specs';
import type { WidgetSettingsProps } from '../viewTypes';
import { CONTROL, HINT, LABEL } from './fields';
import { t } from '../../i18n';

const OPTIONS: { value: GalleryStatus; label: string }[] = [
  { value: 'all', label: t.settings.galleryAll },
  { value: 'Concluído', label: t.settings.galleryDone },
  { value: 'Em andamento', label: t.settings.galleryInProgress },
];

export function ProjectGallerySettings({ widget, onChange }: WidgetSettingsProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL}>{t.settings.show}</label>
      <select id={id} className={CONTROL} value={widget.config.status as string} onChange={(event) => onChange({ status: event.target.value })}>
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <p className={HINT}>{t.settings.galleryHint}</p>
    </div>
  );
}
