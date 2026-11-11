// Background colours a person can pick for the hero of their portfolio. Palette only (DESIGN.md):
// three dark grounds that keep the light hero text, three light grounds that switch it to ink.
// Keys match the profiles_hero_color_check constraint in the database.

export type HeroColor = 'navy' | 'green' | 'ink' | 'gold' | 'green-tint' | 'gold-tint';

export interface HeroColorOption {
  value: HeroColor;
  label: string;
  /** CSS colour for the swatch. */
  swatch: string;
  /** Light ground: text and outlines in the hero turn ink. */
  light: boolean;
}

export const HERO_COLORS: readonly HeroColorOption[] = [
  { value: 'navy', label: 'Azul', swatch: 'var(--navy)', light: false },
  { value: 'green', label: 'Verde', swatch: 'var(--green)', light: false },
  { value: 'ink', label: 'Grafite', swatch: 'var(--ink)', light: false },
  { value: 'gold', label: 'Dourado', swatch: 'var(--gold)', light: true },
  { value: 'green-tint', label: 'Menta', swatch: 'var(--green-tint)', light: true },
  { value: 'gold-tint', label: 'Areia', swatch: 'var(--gold-tint)', light: true },
];

export const DEFAULT_HERO_COLOR: HeroColor = 'navy';

export const heroColorOf = (value: string | undefined | null): HeroColorOption =>
  HERO_COLORS.find((option) => option.value === value) ?? HERO_COLORS[0];

/** Classes for the hero section (see .capy-hero-shell in index.css). */
export const heroColorClass = (value: string | undefined | null): string => {
  const option = heroColorOf(value);
  if (option.value === DEFAULT_HERO_COLOR) return '';
  return `hero-${option.value}${option.light ? ' hero-light' : ''}`;
};
