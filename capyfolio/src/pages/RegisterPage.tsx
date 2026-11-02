import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { CapyWordmark } from '../components/CapyWordmark';

export function RegisterPage({ onRegister }: { onRegister: (data: { name: string; email: string; password: string; confirmPassword: string; institution: string; course: string; period: string; focus: string; tags: string[]; bio: string; }) => Promise<string | null> }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: 'Universidade Federal Fluminense (UFF)',
    course: 'Ciência da Computação',
    period: '6º Período',
    focus: 'Dados e Análise',
    tagsInput: 'Python, GeoPandas, PostgreSQL',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = 'Informe seu nome completo.';
    if (!form.email.trim()) nextErrors.email = 'Informe seu e-mail.';
    if (!form.password) nextErrors.password = 'Informe uma senha.';
    if (form.password.length < 8) nextErrors.password = 'A senha deve ter pelo menos 8 caracteres.';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'As senhas não conferem.';
    if (!form.institution.trim()) nextErrors.institution = 'Informe a instituição.';
    if (!form.course.trim()) nextErrors.course = 'Informe o curso.';
    if (!form.period.trim()) nextErrors.period = 'Informe o período.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const tags = form.tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
    setErrors({});
    setIsSubmitting(true);
    const result = await onRegister({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      institution: form.institution.trim(),
      course: form.course.trim(),
      period: form.period.trim(),
      focus: form.focus.trim(),
      tags,
      bio: form.bio.trim(),
    });
    setIsSubmitting(false);

    if (result) {
      setErrors({ email: result });
      return;
    }

    navigate('/perfil', { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8"><CapyWordmark showMascot size="lg" /></div>
      <div className="cf-card green block mx-auto max-w-2xl p-6 sm:p-10">
        <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy">Criar sua conta acadêmica</h1>
        <div className="mt-2 mb-8 text-base leading-[1.5] text-ink-muted">Configure seu perfil universitário para publicar pesquisas e se conectar com estudantes.</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div className="cf-field">
              <label htmlFor="cadastro-name">Nome completo</label>
              <input id="cadastro-name" type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="cf-input" placeholder="Ex: Gabriel Costa" />
              {errors.name && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.name}</span>}
            </div>
            <div className="cf-field">
              <label htmlFor="cadastro-email">E-mail institucional</label>
              <input id="cadastro-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="cf-input" placeholder="seu@id.uff.br" />
              {errors.email && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.email}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div className="cf-field">
              <label htmlFor="cadastro-password">Senha</label>
              <input id="cadastro-password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="cf-input" placeholder="Mínimo 8 caracteres" />
              {errors.password && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.password}</span>}
            </div>
            <div className="cf-field">
              <label htmlFor="cadastro-confirmPassword">Confirmar senha</label>
              <input id="cadastro-confirmPassword" type="password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="cf-input" placeholder="Confirme sua senha" />
              {errors.confirmPassword && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div className="cf-field">
              <label htmlFor="cadastro-institution">Instituição de Ensino</label>
              <input id="cadastro-institution" type="text" value={form.institution} onChange={(event) => setForm((current) => ({ ...current, institution: event.target.value }))} className="cf-input" />
              {errors.institution && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.institution}</span>}
            </div>
            <div className="cf-field">
              <label htmlFor="cadastro-course">Curso</label>
              <input id="cadastro-course" type="text" value={form.course} onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))} className="cf-input" />
              {errors.course && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.course}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div className="cf-field">
              <label htmlFor="cadastro-period">Período</label>
              <input id="cadastro-period" type="text" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} className="cf-input" />
              {errors.period && <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />{errors.period}</span>}
            </div>
            <div className="cf-field">
              <label htmlFor="cadastro-focus">Área / Foco de Atuação</label>
              <input id="cadastro-focus" type="text" value={form.focus} onChange={(event) => setForm((current) => ({ ...current, focus: event.target.value }))} className="cf-input" />
            </div>
          </div>

          <div className="cf-field">
            <label htmlFor="cadastro-tagsInput">Tags (separadas por vírgula)</label>
            <input id="cadastro-tagsInput" type="text" value={form.tagsInput} onChange={(event) => setForm((current) => ({ ...current, tagsInput: event.target.value }))} className="cf-input" />
          </div>

          <div className="cf-field">
            <label htmlFor="cadastro-bio">Resumo acadêmico</label>
            <textarea id="cadastro-bio" rows={3} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Fale brevemente sobre suas linhas de pesquisa e interesses..." className="cf-input h-auto py-3" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-6">
            <Link to="/login" className="cf-btn">Voltar para Login</Link>
            <button type="submit" disabled={isSubmitting} className="cf-btn primary disabled:opacity-70">{isSubmitting ? 'Criando...' : 'Criar conta'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
