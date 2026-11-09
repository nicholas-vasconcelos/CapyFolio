import { X } from 'lucide-react';

export function ActiveFilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} aria-label={`Remover filtro ${label}`} className="cf-chip removable">
      {label}
      <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
    </button>
  );
}
