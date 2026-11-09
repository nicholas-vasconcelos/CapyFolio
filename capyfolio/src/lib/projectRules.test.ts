import { describe, expect, it } from 'vitest';
import { checkPeriod, checkProjectFile, checkProjectLink, earliestStartMonth, formatFileSize, formatKeyResult, formatPeriod, hasNumber, isCatalogTag } from './projectRules';

const NOW = new Date(2026, 10, 8); // 8 Nov 2026

describe('checkPeriod', () => {
  it('accepts a start in the last 10 years', () => {
    expect(checkPeriod('2024-03', '', 'Em andamento', NOW)).toEqual({});
    expect(checkPeriod(earliestStartMonth(NOW), '2020-01', 'Concluído', NOW)).toEqual({});
  });

  it('refuses starts older than 10 years or in the future', () => {
    expect(checkPeriod('2016-10', '', 'Em andamento', NOW).start).toMatch(/últimos 10 anos/);
    expect(checkPeriod('2026-12', '', 'Em andamento', NOW).start).toMatch(/mês atual/);
  });

  it('needs an end for finished projects, after the start and not in the future', () => {
    expect(checkPeriod('2024-03', '', 'Concluído', NOW).end).toBeDefined();
    expect(checkPeriod('2024-03', '2023-01', 'Concluído', NOW).end).toMatch(/antes do início/);
    expect(checkPeriod('2024-03', '2027-01', 'Concluído', NOW).end).toMatch(/futuro/);
    expect(checkPeriod('2024-03', '2027-01', 'Em andamento', NOW)).toEqual({});
  });

  it('formats the period', () => {
    expect(formatPeriod('2024-01', '2025-12')).toBe('jan. 2024 - dez. 2025');
    expect(formatPeriod('2024-05', '')).toBe('maio 2024 - atual');
  });
});

describe('links and files', () => {
  it('accepts links on allowed sites only', () => {
    expect(checkProjectLink('github.com/x/y', 'Repositório')).toBeNull();
    expect(checkProjectLink('https://doi.org/10.1000/xyz', 'Repositório')).toBeNull();
    expect(checkProjectLink('www.exemplo-qualquer.com', 'Repositório')).toMatch(/use um link/);
    expect(checkProjectLink('javascript:alert(1)', 'Repositório')).toMatch(/endereço válido/);
  });

  it('accepts files up to 10 MB of the allowed types', () => {
    expect(checkProjectFile({ name: 'a.pdf', type: 'application/pdf', size: 1000 })).toBeNull();
    expect(checkProjectFile({ name: 'dados.csv', type: '', size: 1000 })).toBeNull();
    expect(checkProjectFile({ name: 'a.exe', type: 'application/x-msdownload', size: 1000 })).toMatch(/PDF/);
    expect(checkProjectFile({ name: 'a.pdf', type: 'application/pdf', size: 11 * 1024 * 1024 })).toMatch(/10 MB/);
  });

  it('formats sizes', () => {
    expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2,4 MB');
    expect(formatFileSize(840 * 1024)).toBe('840 KB');
  });
});

describe('tags and results', () => {
  it('only accepts catalog tags', () => {
    expect(isCatalogTag('Python')).toBe(true);
    expect(isCatalogTag('meme engraçado')).toBe(false);
  });

  it('needs a number in a result value', () => {
    expect(hasNumber('40%')).toBe(true);
    expect(hasNumber('muito')).toBe(false);
    expect(formatKeyResult(' Redução do tempo ', ' −40% ')).toBe('Redução do tempo: −40%');
  });
});
