/*
 * Choices for the education ("Formação") part of the profile, shared by sign-up and the
 * account settings dialog. The level and status come first; the other questions follow from them.
 */

/** Semesters for an undergraduate course in progress. */
export const PERIODS: readonly string[] = Array.from({ length: 12 }, (_, index) => `${index + 1}º Período`);

export type EducationLevel = 'none' | 'bachelor' | 'licentiate' | 'technologist' | 'masters' | 'doctorate';
export type EducationStatus = 'in_progress' | 'completed';

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'none', label: 'Sem graduação (ensino médio ou técnico)' },
  { value: 'bachelor', label: 'Graduação: bacharelado' },
  { value: 'licentiate', label: 'Graduação: licenciatura' },
  { value: 'technologist', label: 'Graduação: tecnólogo' },
  { value: 'masters', label: 'Mestrado' },
  { value: 'doctorate', label: 'Doutorado' },
];

export const EDUCATION_STATUSES: { value: EducationStatus; label: string }[] = [
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
];

export const isEducationLevel = (value: unknown): value is EducationLevel =>
  EDUCATION_LEVELS.some((level) => level.value === value);
export const isEducationStatus = (value: unknown): value is EducationStatus =>
  EDUCATION_STATUSES.some((status) => status.value === value);

/** How the "Período" question is asked for a level and status. */
export type PeriodKind = 'semester' | 'entryYear' | 'completionYear' | 'none';

export interface EducationQuestions {
  /** Status is not asked without a degree. */
  askStatus: boolean;
  institutionLabel: string;
  institutionPlaceholder: string;
  institutionRequired: boolean;
  courseLabel: string;
  coursePlaceholder: string;
  courseRequired: boolean;
  periodKind: PeriodKind;
  periodLabel: string;
}

/** The questions to ask once the level (and status) are known. */
export function educationQuestions(level: EducationLevel | '', status: EducationStatus | ''): EducationQuestions {
  const graduate = level === 'masters' || level === 'doctorate';
  if (level === 'none') {
    return {
      askStatus: false,
      institutionLabel: 'Escola ou instituição',
      institutionPlaceholder: 'Onde você estuda ou estudou',
      institutionRequired: false,
      courseLabel: 'Área de interesse',
      coursePlaceholder: 'Ex: Computação, Arquitetura',
      courseRequired: false,
      periodKind: 'none',
      periodLabel: '',
    };
  }
  const completed = status === 'completed';
  return {
    askStatus: true,
    institutionLabel: 'Instituição de ensino',
    institutionPlaceholder: 'Nome da universidade e a sigla, ex.: (UFF)',
    institutionRequired: true,
    courseLabel: graduate ? 'Programa de pós-graduação' : 'Curso',
    coursePlaceholder: graduate ? 'Ex: Ciência da Computação' : 'Seu curso de graduação',
    courseRequired: true,
    periodKind: completed ? 'completionYear' : graduate ? 'entryYear' : 'semester',
    periodLabel: completed ? 'Ano de conclusão' : graduate ? 'Ano de ingresso' : 'Período',
  };
}

/** The last `count` years, newest first. */
export const recentYears = (count = 50, now: Date = new Date()): number[] =>
  Array.from({ length: count }, (_, index) => now.getFullYear() - index);

/** Options for the period select, stored as readable text ("3º Período", "Concluído em 2023"). */
export function periodOptions(kind: PeriodKind, now: Date = new Date()): string[] {
  if (kind === 'semester') return [...PERIODS];
  if (kind === 'entryYear') return recentYears(15, now).map((year) => `Ingresso em ${year}`);
  if (kind === 'completionYear') return recentYears(50, now).map((year) => `Concluído em ${year}`);
  return [];
}

/** Short pt-BR label for profile cards, e.g. "Mestrado em andamento". Empty when unknown. */
export function educationSummary(level?: string | null, status?: string | null): string {
  const levelLabel = EDUCATION_LEVELS.find((entry) => entry.value === level)?.label;
  if (!levelLabel || level === 'none') return levelLabel ? 'Sem graduação' : '';
  const statusLabel = EDUCATION_STATUSES.find((entry) => entry.value === status)?.label.toLowerCase();
  const short = levelLabel.replace(/^Graduação: /, '');
  const name = short.charAt(0).toUpperCase() + short.slice(1);
  return statusLabel ? `${name} ${statusLabel}` : name;
}

/** Hosts each profile link must point at. */
export const LINK_HOSTS = {
  github: ['github.com'],
  linkedin: ['linkedin.com'],
  lattes: ['lattes.cnpq.br'],
} as const;
