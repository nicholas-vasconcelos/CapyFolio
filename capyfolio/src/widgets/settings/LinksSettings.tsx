import { LINK_KEYS, userLink } from '../specs';
import type { LinkKey } from '../specs';
import type { WidgetSettingsProps } from '../viewTypes';
import { HINT } from './fields';
import { t } from '../../i18n';

const LABELS: Record<LinkKey, string> = t.views.linkLabels;

export function LinksSettings({ widget, ctx, onChange }: WidgetSettingsProps) {
  const shown = widget.config.show as LinkKey[];
  const anyEmpty = LINK_KEYS.some((key) => userLink(ctx.user, key) === '');

  const toggle = (key: LinkKey) => {
    const next = shown.includes(key) ? shown.filter((entry) => entry !== key) : [...shown, key];
    onChange({ show: next });
  };

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-[15px] font-semibold text-ink">{t.settings.linksLegend}</legend>
      {LINK_KEYS.map((key) => {
        const filled = userLink(ctx.user, key) !== '';
        return (
          <label key={key} className="flex min-h-[44px] items-center gap-3 text-base text-ink">
            <input type="checkbox" className="h-5 w-5 accent-navy" checked={shown.includes(key)} onChange={() => toggle(key)} />
            <span>
              {LABELS[key]}
              {!filled && <span className="text-ink-muted">{t.settings.linkNotFilled}</span>}
            </span>
          </label>
        );
      })}
      {anyEmpty && <p className={HINT}>{t.settings.linksHint}</p>}
    </fieldset>
  );
}
