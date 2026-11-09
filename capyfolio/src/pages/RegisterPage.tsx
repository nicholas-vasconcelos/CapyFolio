import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ImageUp, MailCheck, Palette, Trash2 } from 'lucide-react';
import { CapyWordmark } from '../components/CapyWordmark';
import { TagPicker } from '../components/TagPicker';
import { nextDefaultAvatar, randomDefaultAvatar } from '../lib/defaultAvatars';
import { IMAGE_MIME_TYPES, validateImage } from '../lib/imageRules';
import { TEXT_LIMITS, validateText } from '../lib/contentRules';
import { EDUCATION_LEVELS, EDUCATION_STATUSES, educationQuestions, periodOptions } from '../lib/profileOptions';
import type { EducationLevel, EducationStatus } from '../lib/profileOptions';
import { Field, FieldError, StepHeading, Stepper, errorProps, useStepFocus } from '../components/wizard/Wizard';

type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  educationLevel: EducationLevel;
  educationStatus: EducationStatus | null;
  institution: string;
  course: string;
  period: string;
  focus: string;
  tags: string[];
  bio: string;
  defaultAvatarUrl: string;
  photo: File | null;
};

const STEPS = [
  { label: 'Acesso', title: 'Crie seu acesso', lead: 'Comece com seu nome, e-mail e uma senha.' },
  { label: 'Formação', title: 'Sua formação', lead: 'Comece pelo nível de formação; as outras perguntas dependem dele.' },
  { label: 'Competências', title: 'Suas competências', lead: 'Escolha as mais comuns no seu curso ou busque qualquer outra. Você pode mudar depois.' },
  { label: 'Perfil', title: 'Foto e resumo', lead: 'Escolha uma foto e escreva um resumo curto. As duas etapas são opcionais.' },
] as const;

const BIO_MAX = 600;

/** `onRegister` resolves to null when signed in, `'confirm_email'` when confirmation is pending, otherwise an error message. */
export function RegisterPage({ onRegister }: { onRegister: (data: RegisterData) => Promise<string | null> }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    educationLevel: '' as EducationLevel | '',
    educationStatus: '' as EducationStatus | '',
    institution: '',
    course: '',
    period: '',
    focus: '',
    bio: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [defaultAvatarUrl, setDefaultAvatarUrl] = useState(() => randomDefaultAvatar());
  const [photo, setPhoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Set when the account was created but email confirmation is required before signing in. */
  const [confirmation, setConfirmation] = useState<{ email: string; hadPhoto: boolean } | null>(null);
  const headingRef = useStepFocus(step);
  const fileRef = useRef<HTMLInputElement>(null);

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const questions = educationQuestions(form.educationLevel, form.educationStatus);
  const periodChoices = periodOptions(questions.periodKind);

  /** Level and status change which questions apply; a period answer from another kind is dropped. */
  const setEducation = (key: 'educationLevel' | 'educationStatus') => (value: string) =>
    setForm((current) => {
      const next = { ...current, [key]: value };
      const kind = educationQuestions(next.educationLevel, next.educationStatus).periodKind;
      if (!periodOptions(kind).includes(next.period)) next.period = '';
      return next;
    });

  const validate = (index: number): Record<string, string> => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (!form.name.trim()) next.name = 'Informe seu nome completo.';
      else {
        const problem = validateText(form.name, 'Nome', TEXT_LIMITS.name);
        if (problem) next.name = problem;
      }
      if (!form.email.trim()) next.email = 'Informe seu e-mail.';
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Informe um e-mail válido.';
      if (form.password.length < 8) next.password = 'A senha deve ter pelo menos 8 caracteres.';
      if (form.password !== form.confirmPassword) next.confirmPassword = 'As senhas não conferem.';
    }
    if (index === 1) {
      if (!form.educationLevel) next.educationLevel = 'Selecione seu nível de formação.';
      if (form.educationLevel && questions.askStatus && !form.educationStatus) next.educationStatus = 'Informe se está em andamento ou concluído.';
      const institution = validateText(form.institution, questions.institutionLabel, { ...TEXT_LIMITS.institution, required: questions.institutionRequired });
      if (institution) next.institution = institution;
      const course = validateText(form.course, questions.courseLabel, { ...TEXT_LIMITS.course, required: questions.courseRequired });
      if (course) next.course = course;
      if (questions.periodKind !== 'none' && !form.period) next.period = `Selecione: ${questions.periodLabel.toLowerCase()}.`;
      const focus = validateText(form.focus, 'Área de foco', TEXT_LIMITS.focus);
      if (focus) next.focus = focus;
    }
    if (index === 3) {
      const bio = validateText(form.bio, 'Resumo acadêmico', TEXT_LIMITS.bio);
      if (bio) next.bio = bio;
    }
    return next;
  };

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    try {
      validateImage(file);
      setPhoto(file);
      setErrors((current) => ({ ...current, photo: '' }));
    } catch (cause) {
      setErrors((current) => ({ ...current, photo: cause instanceof Error ? cause.message : 'Imagem inválida.' }));
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async () => {
    setIsSubmitting(true);
    const result = await onRegister({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      educationLevel: form.educationLevel as EducationLevel,
      educationStatus: questions.askStatus ? (form.educationStatus as EducationStatus) : null,
      institution: form.institution.trim(),
      course: form.course.trim(),
      period: questions.periodKind === 'none' ? '' : form.period,
      focus: form.focus.trim(),
      tags,
      bio: form.bio.trim(),
      defaultAvatarUrl,
      photo,
    });
    setIsSubmitting(false);

    if (result === 'confirm_email') {
      setConfirmation({ email: form.email.trim(), hadPhoto: Boolean(photo) });
      return;
    }
    if (result) {
      // Email problems belong to the first step; anything else stays here.
      if (/e-mail/i.test(result)) {
        setErrors({ email: result });
        setStep(0);
      } else {
        setErrors({ form: result });
      }
      return;
    }
    navigate('/perfil', { replace: true });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else void submit();
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8"><CapyWordmark showMascot size="lg" /></div>
        <div className="cf-card green mx-auto block max-w-2xl p-6 sm:p-10" role="status">
          <MailCheck className="h-8 w-8 text-navy" aria-hidden="true" />
          <h1 className="mt-4 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy">Confirme seu e-mail</h1>
          <div className="mt-3 text-base leading-[1.5] text-ink">
            Enviamos um link de confirmação para <strong>{confirmation.email}</strong>. Abra o e-mail e confirme sua conta para entrar no CapyFolio.
          </div>
          {confirmation.hadPhoto && (
            <div className="mt-2 text-base leading-[1.5] text-ink">
              Sua foto será enviada depois: ao entrar, use "Personalizar perfil" para adicioná-la.
            </div>
          )}
          <div className="mt-2 text-[15px] leading-[1.5] text-ink-muted">Não encontrou? Confira a caixa de spam ou promoções.</div>
          <div className="mt-8 border-t-2 border-line pt-6">
            <Link to="/login" className="cf-btn primary">Ir para o login</Link>
          </div>
        </div>
      </div>
    );
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8"><CapyWordmark showMascot size="lg" /></div>
      <div className="cf-card green mx-auto block max-w-2xl p-6 sm:p-10">
        <Stepper steps={STEPS} current={step} label="Etapas do cadastro" />
        <StepHeading steps={STEPS} current={step} headingRef={headingRef} />

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
          {step === 0 && (
            <>
              <Field id="cadastro-name" label="Nome completo" error={errors.name}>
                <input id="cadastro-name" type="text" autoComplete="name" value={form.name} onChange={(event) => set('name')(event.target.value)} className="cf-input" placeholder="Como você quer ser chamado(a)" />
              </Field>
              <Field id="cadastro-email" label="E-mail institucional" error={errors.email}>
                <input id="cadastro-email" type="email" autoComplete="email" value={form.email} onChange={(event) => set('email')(event.target.value)} className="cf-input" placeholder="seu@universidade.br" />
              </Field>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                <Field id="cadastro-password" label="Senha" error={errors.password}>
                  <div className="relative">
                    <input id="cadastro-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(event) => set('password')(event.target.value)} className="cf-input pr-[52px]" placeholder="Mínimo 8 caracteres" />
                    <button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-sm text-ink-muted hover:text-ink">
                      {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                </Field>
                <Field id="cadastro-confirmPassword" label="Confirmar senha" error={errors.confirmPassword}>
                  <input id="cadastro-confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => set('confirmPassword')(event.target.value)} className="cf-input" placeholder="Repita a senha" />
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                <Field id="cadastro-level" label="Nível de formação" error={errors.educationLevel}>
                  <select id="cadastro-level" value={form.educationLevel} onChange={(event) => setEducation('educationLevel')(event.target.value)} className={`cf-input ${form.educationLevel ? '' : 'text-placeholder'}`} {...errorProps('cadastro-level', errors.educationLevel)}>
                    <option value="" disabled>Selecione</option>
                    {EDUCATION_LEVELS.map((level) => <option key={level.value} value={level.value} className="text-ink">{level.label}</option>)}
                  </select>
                </Field>
                {form.educationLevel && questions.askStatus && (
                  <Field id="cadastro-status" label="Situação" error={errors.educationStatus}>
                    <select id="cadastro-status" value={form.educationStatus} onChange={(event) => setEducation('educationStatus')(event.target.value)} className={`cf-input ${form.educationStatus ? '' : 'text-placeholder'}`} {...errorProps('cadastro-status', errors.educationStatus)}>
                      <option value="" disabled>Selecione</option>
                      {EDUCATION_STATUSES.map((status) => <option key={status.value} value={status.value} className="text-ink">{status.label}</option>)}
                    </select>
                  </Field>
                )}
              </div>

              {/* The rest of the step appears once the level (and, with a degree, the status) is known. */}
              {form.educationLevel && (!questions.askStatus || form.educationStatus) && (
                <>
                  <Field id="cadastro-institution" label={questions.institutionLabel} optional={!questions.institutionRequired} error={errors.institution}>
                    <input id="cadastro-institution" type="text" autoComplete="organization" value={form.institution} onChange={(event) => set('institution')(event.target.value)} className="cf-input" placeholder={questions.institutionPlaceholder} maxLength={TEXT_LIMITS.institution.maxChars} {...errorProps('cadastro-institution', errors.institution)} />
                  </Field>
                  <div className={`grid grid-cols-1 gap-[18px] ${questions.periodKind !== 'none' ? 'sm:grid-cols-2' : ''}`}>
                    <Field id="cadastro-course" label={questions.courseLabel} optional={!questions.courseRequired} error={errors.course}>
                      <input id="cadastro-course" type="text" value={form.course} onChange={(event) => set('course')(event.target.value)} className="cf-input" placeholder={questions.coursePlaceholder} maxLength={TEXT_LIMITS.course.maxChars} {...errorProps('cadastro-course', errors.course)} />
                    </Field>
                    {questions.periodKind !== 'none' && (
                      <Field id="cadastro-period" label={questions.periodLabel} error={errors.period}>
                        <select id="cadastro-period" value={form.period} onChange={(event) => set('period')(event.target.value)} className={`cf-input ${form.period ? '' : 'text-placeholder'}`} {...errorProps('cadastro-period', errors.period)}>
                          <option value="" disabled>Selecione</option>
                          {periodChoices.map((period) => <option key={period} value={period} className="text-ink">{period}</option>)}
                        </select>
                      </Field>
                    )}
                  </div>
                  <Field id="cadastro-focus" label="Área de foco" optional error={errors.focus}>
                    <input id="cadastro-focus" type="text" value={form.focus} onChange={(event) => set('focus')(event.target.value)} className="cf-input" placeholder="O que você mais estuda ou constrói" maxLength={TEXT_LIMITS.focus.maxChars} {...errorProps('cadastro-focus', errors.focus)} />
                  </Field>
                </>
              )}
            </>
          )}

          {step === 2 && <TagPicker id="cadastro-tags" label="Buscar outras competências" value={tags} onChange={setTags} course={form.course} />}

          {step === 3 && (
            <>
              <div className="cf-field">
                <span className="font-sans text-[15px] font-bold" id="cadastro-photo-label">Foto do perfil <span className="ml-1 font-semibold text-ink-muted">(opcional)</span></span>
                <div className="flex flex-wrap items-center gap-6">
                  <img
                    src={photoPreview ?? defaultAvatarUrl}
                    alt={photo ? 'Prévia da sua foto' : 'Avatar padrão'}
                    className="h-32 w-32 flex-none rounded-3xl border-2 border-ink object-cover shadow-md sm:h-36 sm:w-36"
                  />
                  <div className="flex min-w-0 flex-col items-start gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept={IMAGE_MIME_TYPES.join(',')}
                      className="sr-only"
                      id="cadastro-photo"
                      aria-labelledby="cadastro-photo-label"
                      onChange={(event) => choosePhoto(event.target.files?.[0])}
                    />
                    <button type="button" onClick={() => fileRef.current?.click()} className="cf-btn">
                      <ImageUp className="h-5 w-5" aria-hidden="true" />
                      {photo ? 'Trocar foto' : 'Enviar foto'}
                    </button>
                    {photo ? (
                      <button type="button" onClick={() => setPhoto(null)} className="cf-link inline-flex min-h-[44px] items-center gap-2 text-[15px]">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Usar avatar padrão
                      </button>
                    ) : (
                      <button type="button" onClick={() => setDefaultAvatarUrl((url) => nextDefaultAvatar(url))} className="cf-link inline-flex min-h-[44px] items-center gap-2 text-[15px]">
                        <Palette className="h-4 w-4" aria-hidden="true" />
                        Trocar cor do avatar
                      </button>
                    )}
                    <span className="text-sm text-ink-muted">PNG, JPEG ou WebP, até 5 MB.</span>
                  </div>
                </div>
                <FieldError message={errors.photo} />
              </div>

              <Field id="cadastro-bio" label="Resumo acadêmico" optional error={errors.bio}>
                <textarea
                  id="cadastro-bio"
                  rows={4}
                  maxLength={BIO_MAX}
                  value={form.bio}
                  onChange={(event) => set('bio')(event.target.value)}
                  placeholder="Suas linhas de pesquisa, interesses e o que você procura."
                  className="cf-input h-auto py-3"
                />
                <span className="self-end text-sm text-ink-muted [font-variant-numeric:tabular-nums]">{form.bio.length}/{BIO_MAX}</span>
              </Field>
            </>
          )}

          {errors.form && (
            <div role="alert">
              <FieldError message={errors.form} />
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-6">
            {step === 0 ? (
              <Link to="/login" className="cf-btn">Voltar para o login</Link>
            ) : (
              <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="cf-btn">Voltar</button>
            )}
            <button type="submit" disabled={isSubmitting} className="cf-btn primary disabled:opacity-70">
              {isLast ? (isSubmitting ? 'Criando conta...' : 'Criar conta') : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
