import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Link2, Plus, Trash2 } from 'lucide-react';
import { TagPicker } from '../components/TagPicker';
import { Field, FieldError, StepHeading, Stepper, errorProps, useStepFocus } from '../components/wizard/Wizard';
import type { WizardStep } from '../components/wizard/Wizard';
import { TEXT_LIMITS, countWords, validateText } from '../lib/contentRules';
import {
  PROJECT_AREAS,
  PROJECT_FILE_ACCEPT,
  PROJECT_LIMITS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  allowedHostsLabel,
  checkPeriod,
  checkProjectFile,
  checkProjectLink,
  earliestStartMonth,
  formatFileSize,
  formatKeyResult,
  formatPeriod,
  hasNumber,
  isCatalogTag,
  toMonthValue,
} from '../lib/projectRules';
import { normalizeUrl } from '../lib/url';
import type { User } from '../types';
import { PhotoPicker, usePickedPhotos } from '../components/PhotoPicker';

export type ProjectAttachment =
  | { id: string; kind: 'file'; file: File }
  | { id: string; kind: 'link'; name: string; url: string };

export interface NewProjectSubmission {
  title: string;
  shortDescription: string;
  summary: string;
  methodology: string;
  area: string;
  type: string;
  status: string;
  period: string;
  keyResults: string[];
  tags: string[];
  url: string;
  attachments: ProjectAttachment[];
  /** Up to three photos; the first is the cover. Uploaded by the caller. */
  photos: File[];
  setAsFeatured: boolean;
}

export const PROJECT_MAX_PHOTOS = 3;

const STEPS: readonly WizardStep[] = [
  { label: 'Básico', title: 'Sobre o projeto', lead: 'Dê um título e escolha o tipo, a área e a situação do projeto.' },
  { label: 'Conteúdo', title: 'Resumo e metodologia', lead: `Explique o projeto em até ${PROJECT_LIMITS.summaryWords} palavras e como ele foi feito em até ${PROJECT_LIMITS.methodologyWords}.` },
  { label: 'Resultados', title: 'Período e resultados', lead: `Informe quando o projeto aconteceu (nos últimos ${PROJECT_LIMITS.periodYears} anos) e até ${PROJECT_LIMITS.keyResults} resultados mensuráveis.` },
  { label: 'Tags', title: 'Tags do projeto', lead: `Escolha de ${PROJECT_LIMITS.minTags} a ${PROJECT_LIMITS.maxTags} tags da lista. Elas ajudam outras pessoas a encontrar o projeto.` },
  { label: 'Fotos', title: 'Fotos do projeto', lead: `Mostre o projeto em até ${PROJECT_MAX_PHOTOS} fotos: protótipo, equipe, resultados. A primeira vira a capa.` },
  { label: 'Links', title: 'Links e arquivos', lead: `Adicione o repositório e até ${PROJECT_LIMITS.attachments} anexos: arquivos de até 10 MB ou links.` },
];

type KeyResultDraft = { description: string; value: string };

const newId = () => crypto.randomUUID();

/** Step-by-step form for publishing a project (replaces the old popup). */
export function NewProjectPage({ currentUser, onSubmit }: {
  currentUser: User;
  /** Resolves true when the project was published (the caller navigates away). */
  onSubmit: (project: NewProjectSubmission) => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const headingRef = useStepFocus(step);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    type: '',
    area: '',
    status: '',
    summary: '',
    methodology: '',
    start: '',
    end: '',
    url: '',
    setAsFeatured: false,
  });
  const [results, setResults] = useState<KeyResultDraft[]>([{ description: '', value: '' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [photos, setPhotos] = usePickedPhotos();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  // Fixed when the page opens, so the month limits do not shift between renders.
  const [{ thisMonth, earliestMonth }] = useState(() => ({ thisMonth: toMonthValue(new Date()), earliestMonth: earliestStartMonth() }));
  const isLast = step === STEPS.length - 1;

  const validate = (index: number): Record<string, string> => {
    const next: Record<string, string> = {};
    const add = (key: string, message: string | null | undefined) => {
      if (message) next[key] = message;
    };

    if (index === 0) {
      add('title', validateText(form.title, 'Título', TEXT_LIMITS.projectTitle));
      add('shortDescription', validateText(form.shortDescription, 'Resumo curto', TEXT_LIMITS.projectShortDescription));
      if (!form.type) next.type = 'Tipo: selecione uma opção.';
      if (!form.area) next.area = 'Área: selecione uma opção.';
      if (!form.status) next.status = 'Situação: selecione uma opção.';
    }

    if (index === 1) {
      add('summary', validateText(form.summary, 'Resumo', { required: true, minChars: 100, maxWords: PROJECT_LIMITS.summaryWords, allowLinks: true }));
      add('methodology', validateText(form.methodology, 'Metodologia', { maxWords: PROJECT_LIMITS.methodologyWords, allowLinks: true }));
    }

    if (index === 2) {
      const period = checkPeriod(form.start, form.end, form.status);
      add('start', period.start);
      add('end', period.end);
      results.forEach((result, i) => {
        if (!result.description.trim() && !result.value.trim()) return;
        add(`result-${i}-description`, validateText(result.description, 'Resultado', { required: true, minChars: 5, maxChars: PROJECT_LIMITS.keyResultDescription }));
        if (!result.value.trim()) next[`result-${i}-value`] = 'Valor: informe o número que mostra o resultado, como 40% ou 3x.';
        else if (!hasNumber(result.value)) next[`result-${i}-value`] = 'Valor: precisa ter um número, como 40%, 3x ou 120 pessoas.';
        else add(`result-${i}-value`, validateText(result.value, 'Valor', { maxChars: PROJECT_LIMITS.keyResultValue }));
      });
    }

    if (index === 3) {
      if (tags.length < PROJECT_LIMITS.minTags) next.tags = 'Tags: escolha pelo menos uma tag da lista.';
      else if (tags.some((tag) => !isCatalogTag(tag))) next.tags = 'Tags: use só tags da lista.';
    }

    if (index === 5) {
      if (form.url.trim()) add('url', checkProjectLink(form.url, 'Repositório'));
      attachments.forEach((attachment) => {
        if (attachment.kind === 'file') add(`attachment-${attachment.id}`, checkProjectFile(attachment.file));
        else {
          add(`attachment-${attachment.id}-name`, validateText(attachment.name, 'Nome do link', { required: true, minChars: 3, maxChars: 80 }));
          add(`attachment-${attachment.id}-url`, checkProjectLink(attachment.url, 'Endereço'));
        }
      });
    }
    return next;
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = PROJECT_LIMITS.attachments - attachments.length;
    const picked = Array.from(files).slice(0, room);
    const rejected = picked.map((file) => checkProjectFile(file)).find(Boolean);
    const accepted = picked.filter((file) => !checkProjectFile(file));
    setAttachments((current) => [...current, ...accepted.map((file) => ({ id: newId(), kind: 'file' as const, file }))]);
    setErrors((current) => ({ ...current, attachments: rejected ?? (files.length > room ? `Anexos: no máximo ${PROJECT_LIMITS.attachments}.` : '') }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const addLink = () =>
    setAttachments((current) => (current.length >= PROJECT_LIMITS.attachments ? current : [...current, { id: newId(), kind: 'link', name: '', url: '' }]));

  const updateLink = (id: string, key: 'name' | 'url', value: string) =>
    setAttachments((current) => current.map((entry) => (entry.id === id && entry.kind === 'link' ? { ...entry, [key]: value } : entry)));

  const removeAttachment = (id: string) => setAttachments((current) => current.filter((entry) => entry.id !== id));

  const submit = async () => {
    // Every step is checked again: a later step can depend on an earlier answer (status → period).
    for (let index = 0; index < STEPS.length; index += 1) {
      const stepErrors = validate(index);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setStep(index);
        return;
      }
    }

    setIsSubmitting(true);
    const ok = await onSubmit({
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      summary: form.summary.trim(),
      methodology: form.methodology.trim(),
      area: form.area,
      type: form.type,
      status: form.status,
      period: formatPeriod(form.start, form.end),
      keyResults: results
        .filter((result) => result.description.trim() && result.value.trim())
        .map((result) => formatKeyResult(result.description, result.value)),
      tags,
      url: normalizeUrl(form.url) ?? '',
      attachments: attachments.map((entry) => (entry.kind === 'link' ? { ...entry, name: entry.name.trim(), url: normalizeUrl(entry.url) ?? '' } : entry)),
      photos: photos.map((photo) => photo.file),
      setAsFeatured: form.setAsFeatured,
    });
    setIsSubmitting(false);
    if (!ok) setErrors({ form: 'Não foi possível publicar o projeto. Revise os dados e tente novamente.' });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!isLast) setStep(step + 1);
    else void submit();
  };

  const wordCount = (value: string, max: number) => (
    <span className="self-end text-sm text-ink-muted [font-variant-numeric:tabular-nums]">{countWords(value)}/{max} palavras</span>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="cf-card green mx-auto block max-w-2xl p-6 sm:p-10">
        <Stepper steps={STEPS} current={step} label="Etapas da publicação do projeto" />
        <StepHeading steps={STEPS} current={step} headingRef={headingRef} />

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
          {step === 0 && (
            <>
              <Field id="projeto-title" label="Título" error={errors.title}>
                <input id="projeto-title" className="cf-input" value={form.title} onChange={(event) => set('title')(event.target.value)} maxLength={TEXT_LIMITS.projectTitle.maxChars} placeholder="Ex: Observatório de dados urbanos e climáticos" {...errorProps('projeto-title', errors.title)} />
              </Field>
              <Field id="projeto-short" label="Resumo curto" error={errors.shortDescription} hint="Uma frase que aparece nos cartões do projeto.">
                <input id="projeto-short" className="cf-input" value={form.shortDescription} onChange={(event) => set('shortDescription')(event.target.value)} maxLength={TEXT_LIMITS.projectShortDescription.maxChars} placeholder="O problema e a contribuição em uma frase" {...errorProps('projeto-short', errors.shortDescription)} />
              </Field>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                <Field id="projeto-type" label="Tipo" error={errors.type}>
                  <select id="projeto-type" className={`cf-input ${form.type ? '' : 'text-placeholder'}`} value={form.type} onChange={(event) => set('type')(event.target.value)} {...errorProps('projeto-type', errors.type)}>
                    <option value="" disabled>Selecione</option>
                    {PROJECT_TYPES.map((type) => <option key={type} value={type} className="text-ink">{type}</option>)}
                  </select>
                </Field>
                <Field id="projeto-area" label="Área" error={errors.area}>
                  <select id="projeto-area" className={`cf-input ${form.area ? '' : 'text-placeholder'}`} value={form.area} onChange={(event) => set('area')(event.target.value)} {...errorProps('projeto-area', errors.area)}>
                    <option value="" disabled>Selecione</option>
                    {PROJECT_AREAS.map((area) => <option key={area} value={area} className="text-ink">{area}</option>)}
                  </select>
                </Field>
              </div>
              <Field id="projeto-status" label="Situação" error={errors.status}>
                <select id="projeto-status" className={`cf-input ${form.status ? '' : 'text-placeholder'}`} value={form.status} onChange={(event) => set('status')(event.target.value)} {...errorProps('projeto-status', errors.status)}>
                  <option value="" disabled>Selecione</option>
                  {PROJECT_STATUSES.map((status) => <option key={status} value={status} className="text-ink">{status}</option>)}
                </select>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field id="projeto-summary" label="Resumo" error={errors.summary}>
                <textarea id="projeto-summary" rows={7} className="cf-input h-auto py-3 leading-[1.5]" value={form.summary} onChange={(event) => set('summary')(event.target.value)} placeholder="Contexto, objetivo e o que o projeto entrega." {...errorProps('projeto-summary', errors.summary)} />
                {wordCount(form.summary, PROJECT_LIMITS.summaryWords)}
              </Field>
              <Field id="projeto-methodology" label="Metodologia" optional error={errors.methodology}>
                <textarea id="projeto-methodology" rows={7} className="cf-input h-auto py-3 leading-[1.5]" value={form.methodology} onChange={(event) => set('methodology')(event.target.value)} placeholder="Métodos, ferramentas e etapas do trabalho." {...errorProps('projeto-methodology', errors.methodology)} />
                {wordCount(form.methodology, PROJECT_LIMITS.methodologyWords)}
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                <Field id="projeto-start" label="Início" error={errors.start}>
                  <input id="projeto-start" type="month" className="cf-input" value={form.start} min={earliestMonth} max={thisMonth} onChange={(event) => set('start')(event.target.value)} {...errorProps('projeto-start', errors.start)} />
                </Field>
                <Field id="projeto-end" label="Término" optional={form.status !== 'Concluído'} error={errors.end} hint={form.status === 'Concluído' ? undefined : 'Deixe em branco se o projeto continua.'}>
                  <input id="projeto-end" type="month" className="cf-input" value={form.end} min={form.start || earliestMonth} max={form.status === 'Concluído' ? thisMonth : undefined} onChange={(event) => set('end')(event.target.value)} {...errorProps('projeto-end', errors.end)} />
                </Field>
              </div>

              <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
                <legend className="mb-1 p-0 font-sans text-[15px] font-bold">
                  Principais resultados <span className="ml-1 font-semibold text-ink-muted">(opcional, até {PROJECT_LIMITS.keyResults})</span>
                </legend>
                <p className="m-0 text-sm text-ink-muted">Cada resultado tem uma descrição e um valor com número, como “Redução do tempo de processamento” e “−40%”.</p>
                {results.map((result, index) => {
                  const descriptionId = `projeto-result-${index}-description`;
                  const valueId = `projeto-result-${index}-value`;
                  return (
                    <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border-2 border-line p-4 sm:grid-cols-[1fr_9rem_auto] sm:items-start">
                      <Field id={descriptionId} label={`Resultado ${index + 1}`} error={errors[`result-${index}-description`]}>
                        <input id={descriptionId} className="cf-input" value={result.description} maxLength={PROJECT_LIMITS.keyResultDescription} placeholder="O que mudou" onChange={(event) => setResults((current) => current.map((entry, i) => (i === index ? { ...entry, description: event.target.value } : entry)))} {...errorProps(descriptionId, errors[`result-${index}-description`])} />
                      </Field>
                      <Field id={valueId} label="Valor" error={errors[`result-${index}-value`]}>
                        <input id={valueId} className="cf-input" value={result.value} maxLength={PROJECT_LIMITS.keyResultValue} placeholder="Ex: 40%" onChange={(event) => setResults((current) => current.map((entry, i) => (i === index ? { ...entry, value: event.target.value } : entry)))} {...errorProps(valueId, errors[`result-${index}-value`])} />
                      </Field>
                      <button type="button" aria-label={`Remover resultado ${index + 1}`} className="cf-btn h-11 w-11 self-end px-0 sm:mt-[29px]" onClick={() => setResults((current) => (current.length === 1 ? [{ description: '', value: '' }] : current.filter((_, i) => i !== index)))}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
                {results.length < PROJECT_LIMITS.keyResults && (
                  <button type="button" className="cf-link inline-flex min-h-[44px] items-center gap-2 self-start text-[15px]" onClick={() => setResults((current) => [...current, { description: '', value: '' }])}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar resultado
                  </button>
                )}
              </fieldset>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2">
              <TagPicker id="projeto-tags" label="Buscar tags" value={tags} onChange={setTags} course={currentUser.course} allowCustom={false} max={PROJECT_LIMITS.maxTags} />
              <FieldError message={errors.tags} />
            </div>
          )}

          {step === 4 && (
            <PhotoPicker
              photos={photos}
              onChange={setPhotos}
              max={PROJECT_MAX_PHOTOS}
              label="Fotos"
              hint="PNG, JPEG ou WebP, até 5 MB cada. Elas aparecem na página do projeto e a primeira nos cartões."
              coverHint
            />
          )}

          {step === 5 && (
            <>
              <Field id="projeto-url" label="Repositório ou página do projeto" optional error={errors.url} hint={`Links aceitos: ${allowedHostsLabel}.`}>
                <input id="projeto-url" className="cf-input" inputMode="url" value={form.url} onChange={(event) => set('url')(event.target.value)} placeholder="github.com/seu-usuario/projeto" maxLength={300} {...errorProps('projeto-url', errors.url)} />
              </Field>

              <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
                <legend className="mb-1 p-0 font-sans text-[15px] font-bold">
                  Anexos <span className="ml-1 font-semibold text-ink-muted">(opcional, até {PROJECT_LIMITS.attachments})</span>
                </legend>
                <p className="m-0 text-sm text-ink-muted">PDF, imagem, ZIP ou CSV de até 10 MB. Para arquivos maiores, adicione um link.</p>

                {attachments.map((attachment, index) =>
                  attachment.kind === 'file' ? (
                    <div key={attachment.id} className="flex items-center gap-3 rounded-lg border-2 border-ink bg-surface px-4 py-3 shadow-sm">
                      <FileUp className="h-5 w-5 flex-none text-ink" aria-hidden="true" />
                      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                        <strong className="block">{attachment.file.name}</strong>
                        <span className="text-sm text-ink-muted">{formatFileSize(attachment.file.size)}</span>
                      </span>
                      <button type="button" aria-label={`Remover ${attachment.file.name}`} className="cf-btn h-11 w-11 flex-none px-0" onClick={() => removeAttachment(attachment.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div key={attachment.id} className="grid grid-cols-1 gap-3 rounded-lg border-2 border-line p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-start">
                      <Field id={`projeto-link-${attachment.id}-name`} label={`Nome do link ${index + 1}`} error={errors[`attachment-${attachment.id}-name`]}>
                        <input id={`projeto-link-${attachment.id}-name`} className="cf-input" value={attachment.name} maxLength={80} placeholder="Ex: Artigo completo" onChange={(event) => updateLink(attachment.id, 'name', event.target.value)} {...errorProps(`projeto-link-${attachment.id}-name`, errors[`attachment-${attachment.id}-name`])} />
                      </Field>
                      <Field id={`projeto-link-${attachment.id}-url`} label="Endereço" error={errors[`attachment-${attachment.id}-url`]}>
                        <input id={`projeto-link-${attachment.id}-url`} className="cf-input" inputMode="url" value={attachment.url} maxLength={300} placeholder="doi.org/..." onChange={(event) => updateLink(attachment.id, 'url', event.target.value)} {...errorProps(`projeto-link-${attachment.id}-url`, errors[`attachment-${attachment.id}-url`])} />
                      </Field>
                      <button type="button" aria-label={`Remover link ${index + 1}`} className="cf-btn h-11 w-11 self-end px-0 sm:mt-[29px]" onClick={() => removeAttachment(attachment.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ),
                )}

                {attachments.length < PROJECT_LIMITS.attachments ? (
                  <div className="flex flex-wrap gap-3">
                    <input ref={fileRef} id="projeto-files" type="file" multiple accept={PROJECT_FILE_ACCEPT} className="sr-only" onChange={(event) => addFiles(event.target.files)} />
                    <button type="button" className="cf-btn" onClick={() => fileRef.current?.click()}>
                      <FileUp className="h-5 w-5" aria-hidden="true" /> Enviar arquivo
                    </button>
                    <button type="button" className="cf-btn" onClick={addLink}>
                      <Link2 className="h-5 w-5" aria-hidden="true" /> Adicionar link
                    </button>
                  </div>
                ) : (
                  <p className="m-0 text-sm text-ink-muted">Você já adicionou {PROJECT_LIMITS.attachments} anexos, o máximo por projeto.</p>
                )}
                <FieldError message={errors.attachments} />
              </fieldset>

              <label className="cf-check text-[15px]">
                <input type="checkbox" checked={form.setAsFeatured} onChange={(event) => setForm((current) => ({ ...current, setAsFeatured: event.target.checked }))} />
                Definir como projeto em destaque no meu perfil
              </label>
            </>
          )}

          {errors.form && (
            <div role="alert">
              <FieldError message={errors.form} />
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-6">
            {step === 0 ? (
              <Link to="/projetos" className="cf-btn">Cancelar</Link>
            ) : (
              <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="cf-btn">Voltar</button>
            )}
            <button type="submit" disabled={isSubmitting} className="cf-btn primary disabled:opacity-70">
              {isLast ? (isSubmitting ? 'Publicando...' : 'Publicar projeto') : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
