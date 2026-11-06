import type { WidgetAccent, WidgetBg, WidgetTheme } from '../../../types';
import { MAX_NAVY_WIDGETS, WIDGET_ACCENTS, WIDGET_BGS } from '../../../widgets/theme';
import { fmt, t } from '../../../i18n';

/*
 * Palette-only colour choice: 6 backgrounds and 4 accents, each a real button with
 * aria-pressed and a visible name. There is no free colour input anywhere.
 */

interface ColorPickerProps {
  theme: WidgetTheme;
  inHero: boolean;
  /** Two navy widgets already exist and this one is not one of them. */
  navyLimitReached: boolean;
  onChange: (theme: { bg?: WidgetBg; accent?: WidgetAccent }) => void;
}

const SWATCH =
  'flex min-h-[44px] items-center gap-2 rounded-md border-2 px-2.5 text-[13px] font-semibold text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-45';

export function ColorPicker({ theme, inHero, navyLimitReached, onChange }: ColorPickerProps) {
  const navyReason = inHero
    ? t.editor.navyNotInHero
    : navyLimitReached
      ? fmt(t.editor.navyLimit, { n: MAX_NAVY_WIDGETS })
      : null;

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 text-[15px] font-semibold text-ink">{t.editor.background}</legend>
        <div className="flex flex-wrap gap-2">
          {WIDGET_BGS.map((option) => {
            const disabled = option.value === 'navy' && navyReason !== null && theme.bg !== 'navy';
            const pressed = theme.bg === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={pressed}
                disabled={disabled}
                title={disabled ? navyReason ?? undefined : undefined}
                onClick={() => onChange({ bg: option.value })}
                className={`${SWATCH} ${pressed ? 'border-ink bg-navy-tint' : 'border-line bg-surface'}`}
              >
                <span className="h-5 w-5 flex-none rounded-full border-2 border-ink" style={{ background: option.swatch }} aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
        {navyReason && theme.bg !== 'navy' && <p className="m-0 mt-2 text-sm text-ink-muted">{navyReason}</p>}
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 text-[15px] font-semibold text-ink">{t.editor.accent}</legend>
        <div className="flex flex-wrap gap-2">
          {WIDGET_ACCENTS.map((option) => {
            const pressed = theme.accent === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={pressed}
                onClick={() => onChange({ accent: option.value })}
                className={`${SWATCH} ${pressed ? 'border-ink bg-navy-tint' : 'border-line bg-surface'}`}
              >
                <span className="h-5 w-5 flex-none rounded-full border-2 border-ink" style={{ background: option.swatch }} aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="m-0 mt-2 text-sm text-ink-muted">{t.editor.accentHint}</p>
      </fieldset>
    </div>
  );
}
