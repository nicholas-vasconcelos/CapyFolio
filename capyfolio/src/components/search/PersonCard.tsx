import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { personInstitution, personRole } from '../../lib/searchConfigs';
import { Avatar } from '../Avatar';

// Hard shadow cycles gold, green, navy, ink across the grid; hover lifts to a larger ink shadow.
const shadows = [
  'shadow-[5px_5px_0_var(--gold)]',
  'shadow-[5px_5px_0_var(--green)]',
  'shadow-[5px_5px_0_var(--navy)]',
  'shadow-[5px_5px_0_var(--ink)]',
];
const avatarTones = ['green', 'gold', 'navy'] as const;

/** Result card for "Buscar pessoas". Specialties in `highlighted` are drawn gold. */
export function PersonCard({ user, index = 0, highlighted = [] }: { user: User; index?: number; highlighted?: string[] }) {
  const meta = [user.period, personInstitution(user)].filter(Boolean).join(' · ');
  const readyForMarket = (user.badges ?? []).includes('career');
  const connections = user.connections ?? 0;
  const connectionsLabel = `${connections} ${connections === 1 ? 'conexão' : 'conexões'}`;

  return (
    <article className={`cf-person min-w-0 max-w-none hover:shadow-[8px_8px_0_var(--ink)] ${shadows[index % shadows.length]}`}>
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatar} size="lg" tone={avatarTones[index % avatarTones.length]} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="[overflow-wrap:anywhere]">{user.name}</h3>
          {personRole(user) && <span className="role [overflow-wrap:anywhere]">{personRole(user)}</span>}
          {/* Phones: the count sits under the role so the name keeps the full width. */}
          <span className="text-sm text-ink-muted sm:hidden">{connectionsLabel}</span>
        </div>
        <span className="hidden flex-none self-start pt-1 text-right text-sm text-ink-muted sm:block">{connectionsLabel}</span>
      </div>

      {(user.course || meta) && (
        <div className="flex min-w-0 flex-col gap-0.5 text-base [overflow-wrap:anywhere]">
          {user.course && <strong>{user.course}</strong>}
          {meta && <span className="text-ink-muted">{meta}</span>}
        </div>
      )}

      {user.tags.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Especialidades">
          {user.tags.map((tag) => (
            <li key={tag} className={`cf-tag skill ${highlighted.includes(tag) ? 'match' : ''}`}>{tag}</li>
          ))}
        </ul>
      )}

      {readyForMarket && (
        <div className="foot">
          <span className="ml-auto text-[13px] font-bold text-green-ink">Pronto p/ Mercado</span>
        </div>
      )}

      <Link to={`/perfil/${user.id}`} className="cf-btn primary mt-auto w-full" aria-label={`Ver portfólio de ${user.name}`}>
        Ver portfólio
        <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
      </Link>
    </article>
  );
}
