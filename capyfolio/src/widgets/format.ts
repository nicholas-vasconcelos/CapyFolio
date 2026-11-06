import { plural, t } from '../i18n';

/*
 * Small pure helpers used by widget views. Kept apart from React so they can be tested.
 */

// A number with optional sign, pt-BR or en decimals/thousands, and an optional unit.
const NUMBER = String.raw`[−–+-]?\d+(?:[.,]\d+)*\s?(?:%|×|x\b|ms\b|s\b|h\b|mil\b|k\b)?`;
const PERCENT = new RegExp(String.raw`[−–+-]?\d+(?:[.,]\d+)?\s?%`);
const AFTER_PARA = new RegExp(String.raw`\bpara\s+(${NUMBER})`, 'i');
const ANY_NUMBER = new RegExp(NUMBER, 'g');

const isBareYear = (value: string) => /^(19|20)\d{2}$/.test(value);

/**
 * The figure worth showing large for a key result, or null when there is none.
 * Prefers a percentage, then the target of "de X para Y", then the first number
 * that is not a bare year. The full sentence is always shown next to it.
 */
export function keyResultHighlight(sentence: string): string | null {
  const percent = sentence.match(PERCENT);
  if (percent) return percent[0].replace(/\s/g, '');

  const target = sentence.match(AFTER_PARA);
  if (target) return target[1].trim();

  for (const match of sentence.matchAll(ANY_NUMBER)) {
    const value = match[0].trim();
    if (!isBareYear(value)) return value;
  }
  return null;
}

/** Turns a stored profile link ("github.com/x") into an absolute https URL. */
export function externalUrl(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** The link as people read it: no protocol, no "www.", no trailing slash. */
export function displayUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

export const projectCountLabel = (count: number): string => plural(count, t.views.projectsOne, t.views.projectsOther);
