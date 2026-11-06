import type { ReactNode } from 'react';
import type { TextColors } from './theme';

interface WidgetHeadingProps {
  id: string;
  colors: TextColors;
  children: ReactNode;
  /** Keep the heading for screen readers only (e.g. a free text with no title). */
  hidden?: boolean;
  /** Small text after the heading, such as a count. */
  aside?: ReactNode;
}

/** The h2 every widget starts with. Widget titles sit under the person's name (h1). */
export function WidgetHeading({ id, colors, children, hidden = false, aside }: WidgetHeadingProps) {
  if (hidden) {
    return <h2 id={id} className="sr-only">{children}</h2>;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 id={id} className={`m-0 font-display text-[21px] font-extrabold leading-[1.15] tracking-[-0.02em] ${colors.heading}`}>
        {children}
      </h2>
      {aside && <span className={`text-sm ${colors.muted}`}>{aside}</span>}
    </div>
  );
}
