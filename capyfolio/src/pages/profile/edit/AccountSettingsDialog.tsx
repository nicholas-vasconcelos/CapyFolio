import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { User } from '../../../types';
import { fmt, t } from '../../../i18n';
import { TEXT_LIMITS, validateText } from '../../../lib/contentRules';
import type { TextRules } from '../../../lib/contentRules';
import { EDUCATION_LEVELS, EDUCATION_STATUSES, LINK_HOSTS, educationQuestions, isEducationLevel, isEducationStatus, periodOptions } from '../../../lib/profileOptions';
import type { EducationLevel, EducationStatus } from '../../../lib/profileOptions';
import { isOnHost, normalizeUrl } from '../../../lib/url';

/*
 * Dialog for the fixed part of the profile that sign-up collects (name, institution,
 * course, period…) plus the GitHub, LinkedIn and Lattes links. Opened from the edit bar.
 * Saves on its own, separately from the widget layout.
 */

type FormState = {
  educationLevel: EducationLevel | '';
  educationStatus: EducationStatus | '';
  name: string;
  institution: string;
  shortInstitution: string;
  course: string;
  period: string;
  focus: string;
  location: string;
  bio: string;
  github: string;
  linkedin: string;
  lattes: string;
};

type LinkKey = keyof typeof LINK_HOSTS;

const TEXT_FIELDS: { key: Exclude<keyof FormState, LinkKey | 'period' | 'educationLevel' | 'educationStatus'>; label: string; rules: TextRules }[] = [
  { key: 'name', label: 'Nome', rules: TEXT_LIMITS.name },
  { key: 'shortInstitution', label: 'Sigla da instituição', rules: TEXT_LIMITS.shortInstitution },
  { key: 'focus', label: 'Área de foco', rules: TEXT_LIMITS.focus },
  { key: 'location', label: 'Cidade', rules: TEXT_LIMITS.location },
  { key: 'bio', label: 'Resumo acadêmico', rules: TEXT_LIMITS.bio },
];

const LINK_FIELDS: { key: LinkKey; label: string; placeholder: string }[] = [
  { key: 'github', label: 'GitHub', placeholder: 'github.com/seu-usuario' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/seu-perfil' },
  { key: 'lattes', label: 'Currículo Lattes', placeholder: 'lattes.cnpq.br/0000000000000000' },
];

const FOCUSABLE = 'button:not(:disabled), a[href], select, input, textarea, [tabindex]:not([tabindex="-1"])';

const fromUser = (user: User): FormState => ({
  educationLevel: isEducationLevel(user.educationLevel) ? user.educationLevel : '',
  educationStatus: isEducationStatus(user.educationStatus) ? user.educationStatus : '',
  name: user.name ?? '',
  institution: user.institution ?? '',
  shortInstitution: user.shortInstitution ?? '',
  course: user.course ?? '',
  period: user.period ?? '',
  focus: user.focus ?? '',
  location: user.location ?? '',
  bio: user.bio ?? '',
  github: user.github ?? '',
  linkedin: user.linkedin ?? '',
  lattes: user.lattes ?? '',
});

function Field({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="cf-field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="ml-1.5 font-semibold text-ink-muted">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <span className="text-sm text-ink-muted">{hint}</span>}
      {error && (
        <span id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-semibold text-ink">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

interface AccountSettingsDialogProps {
  user: User;
  /** Persists the changed user; rejects (after showing its own error toast) when saving failed. */
  onSave: (next: User) => Promise<void>;
  onClose: () => void;
}

export function AccountSettingsDialog({ user, onSave, onClose }: AccountSettingsDialogProps) {
  const titleId = useId();
  const idFor = (key: string) => `${titleId}-${key}`;
  const [form, setForm] = useState<FormState>(() => fromUser(user));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'form', string>>>({});
  const [saving, setSaving] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Focus moves into the dialog, Tab stays inside, Esc closes, and focus returns to the opener.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    firstFieldRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  const set = (key: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const questions = educationQuestions(form.educationLevel, form.educationStatus);
  const periodChoices = periodOptions(questions.periodKind);

  const validate = () => {
    const next: typeof errors = {};
    for (const field of TEXT_FIELDS) {
      const problem = validateText(form[field.key], field.label, field.rules);
      if (problem) next[field.key] = problem;
    }
    if (!form.educationLevel) next.educationLevel = 'Nível de formação: selecione uma opção.';
    if (form.educationLevel && questions.askStatus && !form.educationStatus) next.educationStatus = 'Situação: selecione uma opção.';
    const institution = validateText(form.institution, questions.institutionLabel, { ...TEXT_LIMITS.institution, required: questions.institutionRequired });
    if (institution) next.institution = institution;
    const course = validateText(form.course, questions.courseLabel, { ...TEXT_LIMITS.course, required: questions.courseRequired });
    if (course) next.course = course;
    if (questions.periodKind !== 'none' && !form.period) next.period = `${questions.periodLabel}: selecione uma opção.`;
    for (const field of LINK_FIELDS) {
      const value = form[field.key].trim();
      if (!value) continue;
      if (normalizeUrl(value) === null) next[field.key] = fmt(t.validation.invalidUrl, { field: field.label });
      else if (!isOnHost(value, LINK_HOSTS[field.key])) next[field.key] = `${field.label}: use um endereço de ${LINK_HOSTS[field.key][0]}.`;
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    const firstError = Object.keys(next)[0];
    if (firstError) {
      document.getElementById(idFor(firstError))?.focus();
      return;
    }

    const link = (key: LinkKey) => normalizeUrl(form[key]) ?? '';
    setSaving(true);
    try {
      await onSave({
        ...user,
        name: form.name.trim(),
        institution: form.institution.trim(),
        shortInstitution: form.shortInstitution.trim(),
        educationLevel: form.educationLevel || undefined,
        educationStatus: questions.askStatus ? form.educationStatus || undefined : undefined,
        course: form.course.trim(),
        period: questions.periodKind === 'none' ? '' : form.period,
        focus: form.focus.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        github: link('github'),
        linkedin: link('linkedin'),
        lattes: link('lattes'),
      });
      onClose();
    } catch {
      // onSave already showed a toast; keep the dialog open so nothing typed is lost.
      setErrors({ form: 'Não foi possível salvar. Revise os dados e tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const describedBy = (key: keyof FormState) => (errors[key] ? `${idFor(key)}-error` : undefined);
  const input = (key: Exclude<keyof FormState, 'period' | 'bio' | 'educationLevel' | 'educationStatus'>, extra: { placeholder?: string; maxLength?: number; inputMode?: 'url' } = {}) => (
    <input
      id={idFor(key)}
      ref={key === 'name' ? firstFieldRef : undefined}
      className="cf-input"
      value={form[key]}
      onChange={(event) => set(key)(event.target.value)}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={describedBy(key)}
      {...extra}
    />
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl border-2 border-ink bg-paper sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88vh] sm:w-[640px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:shadow-card"
      >
        <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-4">
          <h2 id={titleId} className="m-0 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">
            Dados da conta
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar dados da conta" className="cf-btn h-11 w-11 px-0">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-8 overflow-y-auto px-6 py-6">
            <fieldset className="m-0 flex flex-col gap-[18px] border-0 p-0">
              <legend className="mb-4 p-0 text-[17px] font-bold text-brand-green">Identificação</legend>
              <Field id={idFor('name')} label="Nome" error={errors.name}>
                {input('name', { maxLength: TEXT_LIMITS.name.maxChars })}
              </Field>
              <Field id={idFor('location')} label="Cidade" optional error={errors.location}>
                {input('location', { placeholder: 'Ex: Recife, PE', maxLength: TEXT_LIMITS.location.maxChars })}
              </Field>
            </fieldset>

            <fieldset className="m-0 flex flex-col gap-[18px] border-0 p-0">
              <legend className="mb-4 p-0 text-[17px] font-bold text-brand-green">Formação</legend>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                <Field id={idFor('educationLevel')} label="Nível de formação" error={errors.educationLevel}>
                  <select
                    id={idFor('educationLevel')}
                    className="cf-input"
                    value={form.educationLevel}
                    onChange={(event) => set('educationLevel')(event.target.value)}
                    aria-invalid={errors.educationLevel ? true : undefined}
                    aria-describedby={describedBy('educationLevel')}
                  >
                    <option value="">Selecione</option>
                    {EDUCATION_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                  </select>
                </Field>
                {questions.askStatus && (
                  <Field id={idFor('educationStatus')} label="Situação" error={errors.educationStatus}>
                    <select
                      id={idFor('educationStatus')}
                      className="cf-input"
                      value={form.educationStatus}
                      onChange={(event) => set('educationStatus')(event.target.value)}
                      aria-invalid={errors.educationStatus ? true : undefined}
                      aria-describedby={describedBy('educationStatus')}
                    >
                      <option value="">Selecione</option>
                      {EDUCATION_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                  </Field>
                )}
              </div>
              <Field id={idFor('institution')} label={questions.institutionLabel} optional={!questions.institutionRequired} error={errors.institution}>
                {input('institution', { maxLength: TEXT_LIMITS.institution.maxChars })}
              </Field>
              <Field id={idFor('shortInstitution')} label="Sigla da instituição" optional error={errors.shortInstitution} hint="Aparece nos seus comentários e cartões. Ex: UFPE.">
                {input('shortInstitution', { maxLength: TEXT_LIMITS.shortInstitution.maxChars })}
              </Field>
              <div className={`grid grid-cols-1 gap-[18px] ${questions.periodKind !== 'none' ? 'sm:grid-cols-2' : ''}`}>
                <Field id={idFor('course')} label={questions.courseLabel} optional={!questions.courseRequired} error={errors.course}>
                  {input('course', { maxLength: TEXT_LIMITS.course.maxChars })}
                </Field>
                {questions.periodKind !== 'none' && (
                  <Field id={idFor('period')} label={questions.periodLabel} error={errors.period}>
                    <select
                      id={idFor('period')}
                      className="cf-input"
                      value={form.period}
                      onChange={(event) => set('period')(event.target.value)}
                      aria-invalid={errors.period ? true : undefined}
                      aria-describedby={describedBy('period')}
                    >
                      <option value="">Selecione</option>
                      {/* Keeps an older answer (from before the level was asked) selectable. */}
                      {form.period && !periodChoices.includes(form.period) && <option value={form.period}>{form.period}</option>}
                      {periodChoices.map((period) => <option key={period} value={period}>{period}</option>)}
                    </select>
                  </Field>
                )}
              </div>
              <Field id={idFor('focus')} label="Área de foco" optional error={errors.focus}>
                {input('focus', { placeholder: 'Ex: Ciência de dados', maxLength: TEXT_LIMITS.focus.maxChars })}
              </Field>
              <Field id={idFor('bio')} label="Resumo acadêmico" optional error={errors.bio}>
                <textarea
                  id={idFor('bio')}
                  className="cf-input h-auto py-3 leading-[1.5]"
                  rows={4}
                  value={form.bio}
                  maxLength={TEXT_LIMITS.bio.maxChars}
                  onChange={(event) => set('bio')(event.target.value)}
                  aria-invalid={errors.bio ? true : undefined}
                  aria-describedby={describedBy('bio')}
                />
                <span className="text-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                  {fmt(t.settings.charCount, { n: form.bio.length, max: TEXT_LIMITS.bio.maxChars })}
                </span>
              </Field>
            </fieldset>

            <fieldset className="m-0 flex flex-col gap-[18px] border-0 p-0">
              <legend className="mb-1 p-0 text-[17px] font-bold text-brand-green">Links</legend>
              <p className="m-0 mb-3 text-[15px] text-ink-muted">Aparecem no widget Links do seu perfil. Deixe em branco o que você não tiver.</p>
              {LINK_FIELDS.map((field) => (
                <Field key={field.key} id={idFor(field.key)} label={field.label} optional error={errors[field.key]}>
                  {input(field.key, { placeholder: field.placeholder, inputMode: 'url', maxLength: 200 })}
                </Field>
              ))}
            </fieldset>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t-2 border-ink px-6 py-4">
            {errors.form && (
              <p role="alert" className="m-0 mr-auto flex items-start gap-1.5 text-sm font-semibold text-ink">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                {errors.form}
              </p>
            )}
            <button type="button" className="cf-btn h-11 px-4 text-[15px]" onClick={onClose}>Cancelar</button>
            <button type="submit" className="cf-btn primary h-11 px-4 text-[15px] disabled:opacity-60" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar dados'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
