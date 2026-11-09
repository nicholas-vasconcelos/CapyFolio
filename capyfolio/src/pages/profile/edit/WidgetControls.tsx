import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Palette, Settings as Gear, Trash2 } from 'lucide-react';
import type { WidgetInstance, WidgetSize } from '../../../types';
import type { LayoutContext } from '../../../widgets/specs';
import { WIDGET_REGISTRY } from '../../../widgets/registry';
import { MAX_NAVY_WIDGETS } from '../../../widgets/theme';
import type { LayoutEditor } from './useLayoutEditor';
import { ColorPicker } from './ColorPicker';
import { DragHandle } from './DragHandle';
import { fmt, t } from '../../../i18n';

const SIZE_LABELS: Record<WidgetSize, string> = t.widgets.sizes;

const FOCUS = 'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold';

function IconButton({ id, label, onClick, disabled, pressed, children }: {
  id?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-navy-tint disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent aria-pressed:bg-navy-tint ${FOCUS}`}
    >
      {children}
    </button>
  );
}

interface WidgetControlsProps {
  widget: WidgetInstance;
  editor: LayoutEditor;
  ctx: LayoutContext;
  inHero?: boolean;
  /** Position in the grid; unused in the hero. */
  index?: number;
  /** Removes the widget (the page moves focus to a neighbour). */
  onRemove: (id: string) => void;
}

/** The toolbar and its panels on top of a widget in widget mode. Always drawn on white, so it reads on any background. */
export function WidgetControls({ widget, editor, ctx, inHero = false, index = 0, onRemove }: WidgetControlsProps) {
  const [panel, setPanel] = useState<'colors' | 'settings' | null>(null);
  const ids = { size: useId(), panel: useId() };
  const { spec, Settings } = WIDGET_REGISTRY[widget.type];
  const count = editor.draft.widgets.length;
  const navyCount = editor.draft.widgets.filter((entry) => entry.theme.bg === 'navy').length;

  const toggle = (next: 'colors' | 'settings') => setPanel((current) => (current === next ? null : next));

  return (
    <div className="flex flex-col gap-3">
      <div role="toolbar" aria-label={fmt(t.editor.controlsLabel, { label: spec.label })} className="flex flex-wrap items-center gap-1 self-start rounded-lg border-2 border-ink bg-surface p-1 text-ink">
        {!inHero && (
          <>
            <DragHandle widget={widget} index={index} count={count} editor={editor} />
            {spec.sizes.length > 1 && (
              <>
                <label htmlFor={ids.size} className="sr-only">{t.editor.size}</label>
                <select
                  id={ids.size}
                  value={widget.size}
                  onChange={(event) => editor.resize(widget.id, event.target.value as WidgetSize)}
                  className={`h-11 rounded-md border-2 border-line bg-surface px-2 text-[15px] font-semibold text-ink ${FOCUS}`}
                >
                  {spec.sizes.map((size) => (
                    <option key={size} value={size}>{SIZE_LABELS[size]}</option>
                  ))}
                </select>
              </>
            )}
          </>
        )}
        <IconButton label={t.editor.colors} pressed={panel === 'colors'} onClick={() => toggle('colors')}>
          <Palette className="h-5 w-5" aria-hidden="true" />
        </IconButton>
        {Settings && (
          <IconButton label={t.editor.configure} pressed={panel === 'settings'} onClick={() => toggle('settings')}>
            <Gear className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        )}
        <IconButton label={inHero ? t.editor.removeFromHero : t.editor.remove} onClick={() => onRemove(widget.id)}>
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </IconButton>
      </div>

      {panel && (
        <div id={ids.panel} className="rounded-lg border-2 border-ink bg-surface p-4 text-ink">
          {panel === 'colors' ? (
            <ColorPicker
              theme={widget.theme}
              inHero={inHero}
              navyLimitReached={navyCount >= MAX_NAVY_WIDGETS}
              onChange={(theme) => editor.setTheme(widget.id, theme)}
            />
          ) : (
            Settings && <Settings widget={widget} ctx={ctx} onChange={(config, key) => editor.setConfig(widget.id, config, key)} />
          )}
        </div>
      )}
    </div>
  );
}
