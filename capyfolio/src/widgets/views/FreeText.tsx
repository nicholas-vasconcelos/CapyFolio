import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { t } from '../../i18n';

/** Plain text only: React escapes it, and line breaks come from `white-space: pre-line`. */
export function FreeTextView({ widget, colors, headingId }: WidgetViewProps) {
  const title = String(widget.config.title ?? '').trim();
  const text = String(widget.config.text ?? '');

  return (
    <>
      <WidgetHeading id={headingId} colors={colors} hidden={title === ''}>
        {title || t.views.freeTextFallbackHeading}
      </WidgetHeading>
      <p className="m-0 max-w-[62ch] whitespace-pre-line text-base leading-[1.6]">{text}</p>
    </>
  );
}
