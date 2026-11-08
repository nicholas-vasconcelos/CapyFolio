import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { CapyWordmark } from '../components/CapyWordmark';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

/** Opened from the "redefinir senha" email link, which signs the user in with a recovery session. */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated, clearPasswordRecovery } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updatePassword(password);
      clearPasswordRecovery();
      showToast('Senha atualizada com sucesso.');
      navigate('/feed', { replace: true });
    } catch (cause) {
      console.error(cause);
      setError('Não foi possível atualizar a senha. Abra o link do e-mail novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8"><CapyWordmark showMascot size="lg" /></div>
      <div className="cf-card green block mx-auto max-w-2xl p-6 sm:p-10">
        <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy">Redefinir senha</h1>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-[18px]">
            <div className="cf-field">
              <label htmlFor="nova-senha">Nova senha</label>
              <input id="nova-senha" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="cf-input" placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="cf-field">
              <label htmlFor="confirmar-senha">Confirmar nova senha</label>
              <input id="confirmar-senha" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="cf-input" placeholder="Confirme sua senha" />
            </div>
            {error && (
              <div role="alert" className="flex items-start gap-2 text-[15px] font-semibold text-ink">
                <AlertCircle className="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />
                {error}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t-2 border-line pt-6">
              <button type="submit" disabled={isSubmitting} className="cf-btn primary disabled:opacity-70">{isSubmitting ? 'Salvando...' : 'Salvar nova senha'}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-3 text-base leading-[1.5] text-ink">
              Este link expirou ou já foi usado. Na tela de login, use "Esqueceu sua senha?" para receber um novo link.
            </div>
            <div className="mt-8 border-t-2 border-line pt-6">
              <Link to="/login" className="cf-btn primary">Ir para o login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
