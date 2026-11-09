import { describe, expect, it } from 'vitest';
import { educationQuestions, educationSummary, periodOptions } from './profileOptions';

describe('educationQuestions', () => {
  it('asks no status, period or required course without a degree', () => {
    const q = educationQuestions('none', '');
    expect(q.askStatus).toBe(false);
    expect(q.courseRequired).toBe(false);
    expect(q.periodKind).toBe('none');
  });

  it('asks the semester for an undergraduate course in progress', () => {
    expect(educationQuestions('bachelor', 'in_progress').periodKind).toBe('semester');
  });

  it('asks the entry year for graduate programs and the completion year when finished', () => {
    expect(educationQuestions('masters', 'in_progress').periodKind).toBe('entryYear');
    expect(educationQuestions('masters', 'in_progress').courseLabel).toBe('Programa de pós-graduação');
    expect(educationQuestions('doctorate', 'completed').periodKind).toBe('completionYear');
  });
});

describe('period options and summary', () => {
  it('lists readable options', () => {
    const now = new Date(2026, 0, 1);
    expect(periodOptions('semester')[0]).toBe('1º Período');
    expect(periodOptions('entryYear', now)[0]).toBe('Ingresso em 2026');
    expect(periodOptions('completionYear', now)[1]).toBe('Concluído em 2025');
    expect(periodOptions('none')).toEqual([]);
  });

  it('summarises level and status', () => {
    expect(educationSummary('masters', 'in_progress')).toBe('Mestrado em andamento');
    expect(educationSummary('bachelor', 'completed')).toBe('Bacharelado concluído');
    expect(educationSummary('none', null)).toBe('Sem graduação');
    expect(educationSummary(undefined, undefined)).toBe('');
  });
});
