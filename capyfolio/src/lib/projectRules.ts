import { TAG_CATALOG, normalizeTag } from './tagCatalog';
import { isOnHost, normalizeUrl } from './url';

/*
 * Rules for publishing a project: fixed choices for type, area and status, limits for the
 * text fields, results, attachments and period. Used by the new-project page; the database
 * enforces the counts (projects_files_max, projects_key_results_max) and the content check.
 */

export const PROJECT_TYPES = [
  'Projeto de pesquisa',
  'Iniciação Científica',
  'Trabalho de Conclusão de Curso',
  'Projeto de Extensão',
  'Projeto de Engenharia',
  'Projeto Prático',
  'Dissertação',
  'Tese',
  'Projeto de disciplina',
] as const;

export const PROJECT_AREAS = [
  'Arquitetura e Urbanismo',
  'Bioinformática',
  'Ciência de Dados',
  'Dados e Análise',
  'Design',
  'Educação',
  'Engenharia Civil',
  'Engenharia Elétrica e Eletrônica',
  'Engenharia Mecânica',
  'Engenharia de Software',
  'Inteligência Artificial',
  'Redes e Segurança',
  'Robótica',
  'Saúde',
  'Sustentabilidade',
  'Visão Computacional',
] as const;

export const PROJECT_STATUSES = ['Em andamento', 'Concluído'] as const;

export const PROJECT_LIMITS = {
  summaryWords: 250,
  methodologyWords: 400,
  keyResults: 3,
  keyResultDescription: 120,
  keyResultValue: 24,
  attachments: 3,
  fileBytes: 10 * 1024 * 1024,
  /** Earliest start: this many years before the posting date. */
  periodYears: 10,
  minTags: 1,
  maxTags: 8,
} as const;

/** Sites a project link or attachment link may point at. */
export const ALLOWED_LINK_HOSTS = [
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'linkedin.com',
  'lattes.cnpq.br',
  'drive.google.com',
  'docs.google.com',
  'doi.org',
  'zenodo.org',
  'figshare.com',
  'kaggle.com',
  'colab.research.google.com',
  'huggingface.co',
  'youtube.com',
  'youtu.be',
  'figma.com',
  'behance.net',
  'scielo.br',
  'arxiv.org',
  'researchgate.net',
  'osf.io',
] as const;

export const allowedHostsLabel = 'GitHub, GitLab, LinkedIn, Lattes, Google Drive, DOI, Zenodo, Kaggle, Hugging Face, YouTube, Figma e outros repositórios acadêmicos';

/** pt-BR message for a link, or null when it is a web address on an allowed site. */
export function checkProjectLink(value: string, field: string): string | null {
  const normalized = normalizeUrl(value);
  if (normalized === null || normalized === '') return `${field}: informe um endereço válido, como https://github.com/seu-usuario/projeto.`;
  if (!isOnHost(normalized, ALLOWED_LINK_HOSTS)) return `${field}: use um link de ${allowedHostsLabel}.`;
  return null;
}

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */

export const PROJECT_FILE_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/png': 'Imagem PNG',
  'image/jpeg': 'Imagem JPEG',
  'image/webp': 'Imagem WebP',
  'application/zip': 'Arquivo ZIP',
  'application/x-zip-compressed': 'Arquivo ZIP',
  'text/csv': 'Planilha CSV',
};

export const PROJECT_FILE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.zip,.csv';

/** Browsers report some types inconsistently (CSV, ZIP); fall back to the extension. */
export function projectFileType(file: { name: string; type: string }): string | null {
  if (PROJECT_FILE_TYPES[file.type]) return file.type;
  const extension = file.name.toLowerCase().split('.').pop();
  const byExtension: Record<string, string> = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', zip: 'application/zip', csv: 'text/csv' };
  return extension ? byExtension[extension] ?? null : null;
}

/** pt-BR message when the file cannot be attached, or null. */
export function checkProjectFile(file: { name: string; type: string; size: number }): string | null {
  if (!projectFileType(file)) return 'Arquivo: envie PDF, imagem (PNG, JPEG, WebP), ZIP ou CSV.';
  if (file.size > PROJECT_LIMITS.fileBytes) return 'Arquivo: o tamanho máximo é 10 MB. Para arquivos maiores, use um link.';
  if (file.size === 0) return 'Arquivo: o arquivo está vazio.';
  return null;
}

/** "2,4 MB", "840 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('pt-BR')} KB`;
}

/* ------------------------------------------------------------------ */
/* Tags, results, period                                               */
/* ------------------------------------------------------------------ */

const CATALOG = new Set(TAG_CATALOG.map(normalizeTag));

/** Only tags from the catalog are accepted on projects. */
export const isCatalogTag = (tag: string) => CATALOG.has(normalizeTag(tag));

/** A result needs a measurable value: it must contain a number. */
export const hasNumber = (value: string) => /\d/.test(value);

/** Stored form of a result: "Redução do tempo de processamento: −40%". */
export const formatKeyResult = (description: string, value: string) => `${description.trim()}: ${value.trim()}`;

/** "2024-03" → Date at the first of the month (local time), or null. */
export function parseMonth(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return new Date(Number(match[1]), month - 1, 1);
}

/** "2024-03" for a date. */
export const toMonthValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Earliest allowed start month: 10 years before the posting date. */
export const earliestStartMonth = (now: Date = new Date()) =>
  toMonthValue(new Date(now.getFullYear() - PROJECT_LIMITS.periodYears, now.getMonth(), 1));

export interface PeriodErrors {
  start?: string;
  end?: string;
}

/** Checks the period. The end is optional only while the project is in progress. */
export function checkPeriod(start: string, end: string, status: string, now: Date = new Date()): PeriodErrors {
  const errors: PeriodErrors = {};
  const startDate = parseMonth(start);
  const endDate = end ? parseMonth(end) : null;
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const earliest = parseMonth(earliestStartMonth(now))!;

  if (!startDate) errors.start = 'Início: informe o mês e o ano.';
  else if (startDate < earliest) errors.start = `Início: o projeto precisa ter começado nos últimos ${PROJECT_LIMITS.periodYears} anos.`;
  else if (startDate > thisMonth) errors.start = 'Início: não pode ser depois do mês atual.';

  if (end && !endDate) errors.end = 'Término: informe o mês e o ano.';
  else if (!end && status === 'Concluído') errors.end = 'Término: informe quando o projeto foi concluído.';
  else if (endDate && startDate && endDate < startDate) errors.end = 'Término: não pode ser antes do início.';
  else if (endDate && status === 'Concluído' && endDate > thisMonth) errors.end = 'Término: um projeto concluído não pode terminar no futuro.';

  return errors;
}

const MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

/** "jan. 2024 - dez. 2025", or "jan. 2024 - atual" without an end. */
export function formatPeriod(start: string, end: string): string {
  const label = (value: string) => {
    const date = parseMonth(value);
    return date ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` : '';
  };
  return `${label(start)} - ${end ? label(end) : 'atual'}`;
}
