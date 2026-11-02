import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, MessageSquare, Search, Share2 } from 'lucide-react';
import capyMascot from '../assets/capy-mascot.png';
import { CapyWordmark } from '../components/CapyWordmark';

export function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => Promise<boolean> }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const ok = await onLogin(email.trim(), password);
    setIsSubmitting(false);
    if (!ok) {
      setError('E-mail ou senha incorretos');
      return;
    }

    const redirectTo = (location.state as { from?: string } | null)?.from || '/feed';
    navigate(redirectTo, { replace: true });
  };

  const handleUnavailable = () => {
    setError('Funcionalidade ainda não disponível.');
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <div className="flex min-h-[900px] flex-wrap bg-paper">
        <section className="relative flex min-w-0 flex-[1.1_1_560px] flex-col gap-10 overflow-hidden bg-navy bg-[radial-gradient(var(--dot-grid)_1.5px,transparent_1.5px)] bg-[size:26px_26px] px-8 py-12 text-on-navy sm:px-12 lg:px-16">
          <div className="flex items-center gap-3">
            <CapyWordmark showMascot={false} size="lg" onNavy />
          </div>

          <div className="flex w-full max-w-[690px] flex-col gap-6">
            <h1 className="m-0 max-w-[600px] font-display text-[clamp(3.25rem,5vw,5rem)] font-extrabold leading-[0.96] tracking-[-0.035em] text-on-navy [text-wrap:balance]">
              Conecte-se ao universo acadêmico.
            </h1>
            <p className="m-0 max-w-[460px] text-[19px] leading-[1.55] text-on-navy-muted">
              Explore projetos, publique suas pesquisas e faça parte de uma comunidade que valoriza o conhecimento.
            </p>
          </div>

          <div className="relative z-10 flex w-full max-w-[440px] flex-col gap-3.5">
            <div className="cf-feature">
              <span className="ic"><Search className="h-[22px] w-[22px] text-ink" aria-hidden="true" /></span>
              <div>
                <strong>Descubra</strong>
                <span>Projetos de diversas áreas e instituições.</span>
              </div>
            </div>

            <div className="cf-feature green">
              <span className="ic"><Share2 className="h-[22px] w-[22px] text-ink" aria-hidden="true" /></span>
              <div>
                <strong>Compartilhe</strong>
                <span>Seus trabalhos e conquistas acadêmicas.</span>
              </div>
            </div>

            <div className="cf-feature tint">
              <span className="ic"><MessageSquare className="h-[22px] w-[22px] text-ink" aria-hidden="true" /></span>
              <div>
                <strong>Conecte-se</strong>
                <span>Com pesquisadores, estudantes e instituições.</span>
              </div>
            </div>
          </div>

          <div className="cf-disc pointer-events-none relative z-20 h-[220px] w-[220px] self-center lg:absolute lg:bottom-10 lg:right-6 lg:h-[300px] lg:w-[300px]">
            <img src={capyMascot} alt="" />
          </div>

          <span className="cf-sticker cf-pop relative z-30 -mt-20 self-center lg:absolute lg:bottom-5 lg:right-4 lg:mt-0">
            Grandes ideias também nascem na universidade.
          </span>
        </section>

        <section className="flex min-w-0 flex-[1_1_440px] items-center justify-center px-8 py-14 sm:px-8 lg:px-8">
          <div className="cf-card green block w-full max-w-[460px] p-8 sm:p-10">
            <div className="mb-6 flex flex-col gap-2">
              <h2 className="m-0 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy">Entrar na sua conta</h2>
              <p className="m-0 text-[16px] leading-[1.5] text-ink-muted">
                Acesse com seu e-mail institucional ou crie uma nova conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <div className="cf-field">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="cf-input" />
              </div>

              <div className="cf-field">
                <label htmlFor="senha">Senha</label>
                <div className="relative">
                  <input id="senha" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" className="cf-input pr-[52px]" />
                  <button type="button" aria-label="Mostrar senha" onClick={() => setShowPassword((current) => !current)} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-sm bg-transparent text-ink-muted hover:text-ink">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 text-[15px] font-semibold text-ink">
                  <AlertCircle className="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="cf-check text-[15px]">
                  <input type="checkbox" />
                  Lembrar de mim
                </label>
                <button type="button" onClick={handleUnavailable} className="cf-link text-[15px] hover:underline">Esqueceu sua senha?</button>
              </div>

              <button type="submit" disabled={isSubmitting} className="cf-btn primary lg w-full disabled:opacity-70">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-sm text-ink-muted">
              <span className="h-[2px] flex-1 bg-line" />
              <span>ou</span>
              <span className="h-[2px] flex-1 bg-line" />
            </div>

            <button type="button" onClick={handleUnavailable} className="cf-btn lg w-full">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 01-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"></path>
                <path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.5 10.5 0 0012 22.5z"></path>
                <path fill="#FBBC05" d="M6.2 14.1a6.3 6.3 0 010-4.2V7.2H2.7a10.5 10.5 0 000 9.6z"></path>
                <path fill="#EA4335" d="M12 5.7c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10.5 10.5 0 002.7 7.2l3.5 2.7c.8-2.2 3.1-4 5.8-4z"></path>
              </svg>
              Entrar com Google
            </button>

            <div className="mt-6 text-center text-ink-muted">
              Não tem uma conta? <Link to="/cadastro" className="cf-link hover:underline">Criar conta</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
