import { useId, useState } from 'react';
import { FREE_TEXT_BODY_MAX, FREE_TEXT_TITLE_MAX } from '../specs';
import type { WidgetSettingsProps } from '../viewTypes';
import { CONTROL, HINT, LABEL } from './fields';
import { fmt, t } from '../../i18n';

/*
 * Inputs keep their own text: the saved config is trimmed, and feeding that back
 * while typing would eat spaces. Each field makes a single undo step per edit run.
 */
export function FreeTextSettings({ widget, onChange }: WidgetSettingsProps) {
  const titleId = useId();
  const textId = useId();
  const [title, setTitle] = useState(String(widget.config.title ?? ''));
  const [text, setText] = useState(String(widget.config.text ?? ''));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor={titleId} className={LABEL}>{t.settings.title}</label>
        <input
          id={titleId}
          className={CONTROL}
          value={title}
          maxLength={FREE_TEXT_TITLE_MAX}
          aria-describedby={`${titleId}-count`}
          onChange={(event) => {
            setTitle(event.target.value);
            onChange({ title: event.target.value, text }, `title:${widget.id}`);
          }}
        />
        <p id={`${titleId}-count`} className={`${HINT} [font-variant-numeric:tabular-nums]`}>
          {fmt(t.settings.charCount, { n: title.length, max: FREE_TEXT_TITLE_MAX })}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={textId} className={LABEL}>{t.settings.text}</label>
        <textarea
          id={textId}
          className={`${CONTROL} h-auto py-2 leading-[1.5]`}
          rows={6}
          value={text}
          maxLength={FREE_TEXT_BODY_MAX}
          aria-describedby={`${textId}-count`}
          onChange={(event) => {
            setText(event.target.value);
            onChange({ title, text: event.target.value }, `text:${widget.id}`);
          }}
        />
        <p id={`${textId}-count`} className={`${HINT} [font-variant-numeric:tabular-nums]`}>
          {fmt(t.settings.charCount, { n: text.length, max: FREE_TEXT_BODY_MAX })}. {t.settings.textHint}
        </p>
      </div>
    </div>
  );
}
