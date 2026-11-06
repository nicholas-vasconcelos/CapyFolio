import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { TextColors } from '../theme';
import { t } from '../../i18n';

/** "Ver projeto" link shared by project widgets; the title is added for screen readers. */
export function ProjectLink({ projectId, title, colors }: { projectId: string; title: string; colors: TextColors }) {
  return (
    <Link
      to={`/projeto/${projectId}`}
      className={`mt-auto inline-flex min-h-[44px] items-center gap-2 self-start text-[15px] font-bold hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold ${colors.link}`}
    >
      {t.views.viewProject}<span className="sr-only">: {title}</span>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
