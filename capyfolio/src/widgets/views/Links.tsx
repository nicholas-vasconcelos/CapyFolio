import { ArrowUpRight, BriefcaseBusiness, FolderGit2, GraduationCap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { userLink } from '../specs';
import type { LinkKey } from '../specs';
import { displayUrl, externalUrl } from '../format';
import type { WidgetViewProps } from '../viewTypes';
import { WidgetHeading } from '../WidgetHeading';
import { t } from '../../i18n';

// lucide-react 1.x has no brand logos, so each service gets a plain line icon.
const LINKS: Record<LinkKey, { label: string; Icon: LucideIcon }> = {
  github: { label: t.views.linkLabels.github, Icon: FolderGit2 },
  linkedin: { label: t.views.linkLabels.linkedin, Icon: BriefcaseBusiness },
  lattes: { label: t.views.linkLabels.lattes, Icon: GraduationCap },
};

export function LinksView({ widget, ctx, inHero, colors, headingId }: WidgetViewProps) {
  const compact = inHero || widget.size === 'P';
  const rows = (widget.config.show as LinkKey[])
    .map((key) => ({ key, value: userLink(ctx.user, key) }))
    .filter((row) => row.value !== '');

  return (
    <>
      <WidgetHeading id={headingId} colors={colors}>{t.views.linksHeading}</WidgetHeading>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map(({ key, value }) => {
          const { label, Icon } = LINKS[key];
          return (
            <li key={key}>
              <a
                href={externalUrl(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center gap-3 rounded-lg border-2 border-ink bg-surface px-3 py-2 text-ink shadow-sm hover:bg-paper focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-sm border-2 border-ink bg-navy-tint" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-bold leading-tight">{label}</span>
                  {!compact && <span className="truncate text-sm text-ink-muted">{displayUrl(value)}</span>}
                </span>
                <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden="true" />
                <span className="sr-only">{t.views.opensInNewTab}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
