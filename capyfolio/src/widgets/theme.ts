import type { WidgetAccent, WidgetBg, WidgetTheme } from '../types';

/*
 * Colour choices a student can make for a widget. Everything here comes from the
 * CapyFolio tokens (design-system/tokens.json). The 2px ink outline is fixed and
 * is not a choice; text colour is derived from the background, never picked.
 *
 * Class strings are written out in full so Tailwind can find them.
 */

export const WIDGET_BGS: { value: WidgetBg; label: string; swatch: string }[] = [
  { value: 'surface', label: 'Branco', swatch: '#FFFFFF' },
  { value: 'paper', label: 'Papel', swatch: '#FAF7F2' },
  { value: 'navyTint', label: 'Azul claro', swatch: '#EAF0F5' },
  { value: 'greenTint', label: 'Verde claro', swatch: '#EAF5EE' },
  { value: 'goldTint', label: 'Dourado claro', swatch: '#FFF4D6' },
  { value: 'navy', label: 'Azul-marinho', swatch: '#1E3C61' },
];

export const WIDGET_ACCENTS: { value: WidgetAccent; label: string; swatch: string }[] = [
  { value: 'navy', label: 'Azul-marinho', swatch: '#1E3C61' },
  { value: 'green', label: 'Verde', swatch: '#1B8243' },
  { value: 'gold', label: 'Dourado', swatch: '#FEA402' },
  { value: 'ink', label: 'Tinta', swatch: '#182536' },
];

/** The hero is navy, so a hero widget must sit on a light background. */
export const HERO_BGS: WidgetBg[] = ['surface', 'paper', 'navyTint', 'greenTint', 'goldTint'];

/** More than this many navy widgets would compete with the navy hero. */
export const MAX_NAVY_WIDGETS = 2;

export const DEFAULT_THEME: WidgetTheme = { bg: 'surface', accent: 'navy' };

const BG_VALUES = WIDGET_BGS.map((entry) => entry.value);
const ACCENT_VALUES = WIDGET_ACCENTS.map((entry) => entry.value);

export const isWidgetBg = (value: unknown): value is WidgetBg =>
  typeof value === 'string' && (BG_VALUES as string[]).includes(value);

export const isWidgetAccent = (value: unknown): value is WidgetAccent =>
  typeof value === 'string' && (ACCENT_VALUES as string[]).includes(value);

const BG_CLASS: Record<WidgetBg, string> = {
  surface: 'bg-surface',
  paper: 'bg-paper',
  navyTint: 'bg-navy-tint',
  greenTint: 'bg-green-tint',
  goldTint: 'bg-gold-tint',
  navy: 'bg-navy',
};

export const bgClass = (bg: WidgetBg): string => BG_CLASS[bg];

/** Hard offset shadow in the accent colour: 8px for widgets, 4px for small tiles inside them. */
const SHADOW_CLASS: Record<WidgetAccent, { card: string; tile: string }> = {
  navy: { card: 'shadow-[8px_8px_0_#1E3C61]', tile: 'shadow-[4px_4px_0_#1E3C61]' },
  green: { card: 'shadow-[8px_8px_0_#1B8243]', tile: 'shadow-[4px_4px_0_#1B8243]' },
  gold: { card: 'shadow-[8px_8px_0_#FEA402]', tile: 'shadow-[4px_4px_0_#FEA402]' },
  ink: { card: 'shadow-[8px_8px_0_#182536]', tile: 'shadow-[4px_4px_0_#182536]' },
};

export const accentShadowClass = (accent: WidgetAccent, scale: 'card' | 'tile' = 'card'): string =>
  SHADOW_CLASS[accent][scale];

export interface TextColors {
  /** Body text. */
  text: string;
  /** Metadata and secondary text. */
  muted: string;
  /** Widget headings. */
  heading: string;
  /** Inline text links. */
  link: string;
}

/**
 * Text colours that pass 4.5:1 on each background (contrast ratios are in tokens.json).
 * Gold is never used as text on a light ground; green-ink is used instead of green
 * because green fails on green-tint.
 */
const TEXT_ON: Record<WidgetBg, TextColors> = {
  surface: { text: 'text-ink', muted: 'text-ink-muted', heading: 'text-navy', link: 'text-green-ink' },
  paper: { text: 'text-ink', muted: 'text-ink-muted', heading: 'text-navy', link: 'text-green-ink' },
  navyTint: { text: 'text-ink', muted: 'text-ink-muted', heading: 'text-navy', link: 'text-green-ink' },
  greenTint: { text: 'text-ink', muted: 'text-ink-muted', heading: 'text-green-ink', link: 'text-green-ink' },
  goldTint: { text: 'text-ink', muted: 'text-ink-muted', heading: 'text-navy', link: 'text-green-ink' },
  navy: { text: 'text-on-navy', muted: 'text-on-navy-muted', heading: 'text-on-navy', link: 'text-gold-light' },
};

export const textOn = (bg: WidgetBg): TextColors => TEXT_ON[bg];
