import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import { Avatar } from './Avatar';

// Person cards cycle their hard shadow green, gold, navy, ink across a grid.
const shadows = [
  'shadow-[5px_5px_0_var(--green)]',
  'shadow-[5px_5px_0_var(--gold)]',
  'shadow-[5px_5px_0_var(--navy)]',
  'shadow-[5px_5px_0_var(--ink)]',
];
const avatarTones = ['green', 'navy', 'gold'] as const;

export function UserCard({ user, index = 0, isConnected, onToggleConnect }: { user: User; index?: number; isConnected?: boolean; onToggleConnect?: () => void }) {
  return (
    <article className={`cf-person max-w-none ${shadows[index % shadows.length]}`}>
      <div className="flex items-start gap-4">
        <Avatar name={user.name} src={user.avatar} size="lg" tone={avatarTones[index % avatarTones.length]} />
        <div className="min-w-0 flex-1">
          <h3><Link to={`/perfil/${user.id}`} className="block break-words text-ink hover:text-navy">{user.name}</Link></h3>
          <span className="role mt-0.5 block">{user.focus}</span>
        </div>
        <span className="mt-1 flex-none text-sm text-ink-muted">{user.connections ?? 0} conexões</span>
      </div>

      <div className="text-base">
        <strong>{user.course}</strong>
        <br />
        <span className="text-ink-muted">{user.period} • {user.institution}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="cf-tag skill">{tag}</span>
        ))}
      </div>

      <div className="foot justify-between">
        <span className="text-[13px] font-bold text-green-ink">Perfil acadêmico</span>
        <button type="button" onClick={onToggleConnect} aria-pressed={!!isConnected} className="cf-chip">
          {isConnected ? 'Conectado' : 'Conectar'}
        </button>
      </div>

      <Link to={`/perfil/${user.id}`} className="cf-btn primary w-full">
        Ver perfil
        <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
      </Link>
    </article>
  );
}
