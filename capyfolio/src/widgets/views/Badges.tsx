import { Award, BookOpen, Briefcase, Code } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { t } from '../../i18n';

/*
 * Same badges and labels as components/Badge.jsx, drawn as outlined pills on white
 * so they stay readable on every widget background (including navy).
 */
const BADGES: Record<string, { label: string; Icon: LucideIcon; disc: string }> = {
  tech: { label: t.views.badgeLabels.tech, Icon: Code, disc: 'bg-navy text-on-navy' },
  academic: { label: t.views.badgeLabels.academic, Icon: BookOpen, disc: 'bg-brand-green text-on-navy' },
  career: { label: t.views.badgeLabels.career, Icon: Briefcase, disc: 'bg-gold text-ink' },
  verified: { label: t.views.badgeLabels.verified, Icon: Award, disc: 'bg-ink text-on-navy' },
};

export function BadgesView({ ctx, colors, headingId }: WidgetViewProps) {
  const badges = (ctx.user.badges ?? []).filter((key) => key in BADGES);

  return (
    <>
      <WidgetHeading id={headingId} colors={colors}>{t.views.badgesHeading}</WidgetHeading>
      <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
        {badges.map((key) => {
          const { label, Icon, disc } = BADGES[key];
          return (
            <li key={key} className="inline-flex items-center gap-2 rounded-pill border-2 border-ink bg-surface py-1 pl-1 pr-3 text-[13px] font-bold text-ink">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${disc}`} aria-hidden="true">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </li>
          );
        })}
      </ul>
    </>
  );
}
