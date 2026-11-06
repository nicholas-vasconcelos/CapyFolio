import { Eye, Undo2 } from 'lucide-react';
import { t } from '../../../i18n';

interface EditBarProps {
  dirty: boolean;
  canUndo: boolean;
  saving: boolean;
  previewing: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onUndo: () => void;
  onTogglePreview: () => void;
  onExit: () => void;
}

const DISABLED = 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none';

/**
 * Bar fixed to the bottom of the screen while widget mode is on. Fixed, not sticky:
 * the app shell sets overflow-x: hidden, which stops position: sticky from working.
 * The page reserves room for it (see ProfileEditor).
 */
export function EditBar({ dirty, canUndo, saving, previewing, onSave, onDiscard, onUndo, onTogglePreview, onExit }: EditBarProps) {
  return (
    <div data-edit-bar role="region" aria-label={t.editor.barLabel} className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-surface">
      <div className="mx-auto box-border flex max-w-[1344px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 md:px-12">
        <p className="m-0 basis-full text-[15px] font-semibold text-ink sm:mr-auto sm:basis-auto">
          {dirty ? t.editor.unsaved : t.editor.noChanges}
        </p>
        <button type="button" className={`cf-btn h-11 flex-1 px-4 text-[15px] sm:flex-none ${DISABLED}`} onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" aria-hidden="true" /> {t.editor.undo}
        </button>
        <button type="button" className="cf-btn h-11 flex-1 px-4 text-[15px] sm:flex-none aria-pressed:bg-gold" onClick={onTogglePreview} aria-pressed={previewing}>
          <Eye className="h-4 w-4" aria-hidden="true" /> {t.editor.preview}
        </button>
        <button type="button" className={`cf-btn h-11 flex-1 px-4 text-[15px] sm:flex-none ${DISABLED}`} onClick={onDiscard} disabled={!dirty}>
          {t.editor.discard}
        </button>
        <button type="button" className={`cf-btn primary h-11 flex-1 px-4 text-[15px] sm:flex-none ${DISABLED}`} onClick={onSave} disabled={!dirty || saving}>
          {saving ? t.editor.saving : t.editor.save}
        </button>
        <button type="button" className="cf-btn cta h-11 flex-1 px-4 text-[15px] sm:flex-none" onClick={onExit}>
          {t.editor.done}
        </button>
      </div>
    </div>
  );
}
