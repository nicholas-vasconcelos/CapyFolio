import { ptBR } from './pt-BR';

/** The active strings. Only pt-BR exists for now. */
export const t = ptBR;

/** Fills {name} placeholders: fmt('{n} conexões', { n: 3 }). Numbers use pt-BR formatting. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    if (value === undefined) return match;
    return typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
  });
}

/** Picks the singular or plural template for n and fills {n}. */
export const plural = (n: number, one: string, other: string): string => fmt(n === 1 ? one : other, { n });
