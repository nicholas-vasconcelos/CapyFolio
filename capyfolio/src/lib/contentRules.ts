import { fmt, t } from '../i18n';

/*
 * Checks for any text a user writes that other people will see: posts, comments,
 * profile fields, project fields and the "Texto livre" widget.
 *
 * This is a first line of defence that gives instant feedback in the form. The same
 * blocklist is enforced in the database (supabase/migrations), because a check that
 * only runs in the browser can be skipped.
 *
 * Matching works on whole words after normalising: lower case, no accents, common
 * character swaps undone (0→o, 4→a, @→a…) and repeated letters collapsed, so
 * "P0RRAAA" and "pórra" both match "porra" but "computador" never matches "puta".
 */

/**
 * Words blocked wherever they appear as a whole word. Kept to words that are offensive
 * in almost any context. Ambiguous words with a normal meaning (pau, rola, pinto,
 * macaco, piranha…) and terms that serious research may need (estupro, nazismo…) are
 * left out on purpose. Keep in sync with public.blocked_terms in the migration.
 */
export const BLOCKED_WORDS: readonly string[] = [
  // pt-BR profanity
  'porra', 'caralho', 'karalho', 'krl', 'crl', 'merda', 'bosta', 'foda', 'fodase', 'foder', 'fuder',
  'fodido', 'fodida', 'fudido', 'fudida', 'puta', 'puto', 'putas', 'putaria', 'cu', 'cuzao', 'cuzinho',
  'buceta', 'boceta', 'xoxota', 'xereca', 'piroca', 'punheta', 'boquete', 'siririca', 'arrombado',
  'arrombada', 'caceta', 'escroto', 'escrota',
  // pt-BR abbreviations
  'fdp', 'pqp', 'vsf', 'vtnc', 'tnc', 'tmnc',
  // pt-BR insults and slurs
  'otario', 'otaria', 'babaca', 'imbecil', 'idiota', 'cretino', 'cretina', 'retardado', 'retardada',
  'mongoloide', 'corno', 'vagabundo', 'vagabunda', 'viado', 'viadinho', 'bicha', 'bichinha',
  'sapatao', 'traveco', 'baitola', 'boiola', 'macumbeiro', 'favelado',
  // English
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit', 'bitch', 'asshole', 'cunt',
  'whore', 'slut', 'retard', 'faggot', 'fag', 'nigger', 'nigga',
];

/** Phrases blocked as a whole (words separated by spaces after normalising). */
export const BLOCKED_PHRASES: readonly string[] = [
  'filho da puta', 'vai se foder', 'vai tomar no cu', 'tomar no cu', 'vai se fuder', 'puta que pariu',
  'son of a bitch',
];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

/** Lower case, accents removed, leetspeak undone; everything else that is not a letter becomes a space. */
export function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[013457@$]/g, (char) => LEET[char] ?? char)
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

/** "porraaa" → "pora": runs of the same letter become one, on both sides of the comparison. */
const collapse = (word: string) => word.replace(/(.)\1+/g, '$1');

const BLOCKED_SET = new Set(BLOCKED_WORDS.map(collapse));
const BLOCKED_PHRASE_LIST = BLOCKED_PHRASES.map((phrase) => phrase.split(' ').map(collapse).join(' '));

/** True when the text contains a blocked word or phrase. */
export function containsBlockedTerm(text: string): boolean {
  const words = normalizeForMatching(text).split(' ').filter(Boolean).map(collapse);
  if (words.some((word) => BLOCKED_SET.has(word))) return true;
  const joined = ` ${words.join(' ')} `;
  return BLOCKED_PHRASE_LIST.some((phrase) => joined.includes(` ${phrase} `));
}

export const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

const URL_PATTERN = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|net|org|io|br|xyz|ly|me|info|site|online)(\/\S*)?\b/i;
const REPEATED_CHAR = /(.)\1{7,}/u;
const CONSONANT_RUN = /[bcdfghjklmnpqrstvwxz]{6,}/;

/** Keyboard mashing ("asdfghjkl", "kkkkkkkkkk") or shouting in capitals. */
function looksLikeSpam(text: string): boolean {
  if (REPEATED_CHAR.test(text)) return true;
  const words = normalizeForMatching(text).split(' ');
  if (words.some((word) => CONSONANT_RUN.test(word))) return true;
  const letters = text.replace(/[^\p{L}]/gu, '');
  if (letters.length >= 20) {
    const upper = letters.replace(/[^\p{Lu}]/gu, '').length;
    if (upper / letters.length > 0.7) return true;
  }
  return false;
}

export interface TextRules {
  /** Empty is an error. Default false: an empty optional field always passes. */
  required?: boolean;
  minChars?: number;
  maxChars?: number;
  maxWords?: number;
  /** Allow web addresses in the text. Default false; link fields have their own check. */
  allowLinks?: boolean;
}

export type TextIssue = 'required' | 'tooShort' | 'tooLong' | 'tooManyWords' | 'offensive' | 'link' | 'spam';

/** The first problem with the text, or null when it is fine. */
export function checkText(value: string, rules: TextRules = {}): TextIssue | null {
  const text = value.trim();
  if (!text) return rules.required ? 'required' : null;
  if (rules.minChars && text.length < rules.minChars) return 'tooShort';
  if (rules.maxChars && text.length > rules.maxChars) return 'tooLong';
  if (rules.maxWords && countWords(text) > rules.maxWords) return 'tooManyWords';
  if (containsBlockedTerm(text)) return 'offensive';
  if (!rules.allowLinks && URL_PATTERN.test(text)) return 'link';
  if (looksLikeSpam(text)) return 'spam';
  return null;
}

/** pt-BR message for an issue, naming the field ("O título…"). */
export function textIssueMessage(issue: TextIssue, field: string, rules: TextRules = {}): string {
  const v = t.validation;
  switch (issue) {
    case 'required': return fmt(v.required, { field });
    case 'tooShort': return fmt(v.tooShort, { field, n: rules.minChars ?? 0 });
    case 'tooLong': return fmt(v.tooLong, { field, n: rules.maxChars ?? 0 });
    case 'tooManyWords': return fmt(v.tooManyWords, { field, n: rules.maxWords ?? 0 });
    case 'offensive': return fmt(v.offensive, { field });
    case 'link': return fmt(v.link, { field });
    case 'spam': return fmt(v.spam, { field });
  }
}

/** checkText + textIssueMessage: the message to show, or null. */
export function validateText(value: string, field: string, rules: TextRules = {}): string | null {
  const issue = checkText(value, rules);
  return issue ? textIssueMessage(issue, field, rules) : null;
}

/** Limits shared by the forms and the database checks. */
export const TEXT_LIMITS = {
  name: { required: true, minChars: 3, maxChars: 80 },
  institution: { required: true, minChars: 2, maxChars: 120 },
  shortInstitution: { maxChars: 20 },
  course: { required: true, minChars: 2, maxChars: 100 },
  focus: { maxChars: 100 },
  location: { maxChars: 80 },
  bio: { maxChars: 600 },
  post: { required: true, minChars: 10, maxChars: 2000, allowLinks: true },
  comment: { required: true, minChars: 2, maxChars: 500 },
  projectTitle: { required: true, minChars: 5, maxChars: 120 },
  projectShortDescription: { required: true, minChars: 20, maxChars: 200 },
  projectSummary: { maxWords: 400, maxChars: 4000, allowLinks: true },
  projectShortField: { maxChars: 60 },
  keyResult: { maxChars: 160 },
  freeTextTitle: { maxChars: 60 },
  freeTextBody: { maxChars: 600 },
} satisfies Record<string, TextRules>;

/** The database raises this (see supabase/migrations) when it refuses blocked text. */
export const BLOCKED_CONTENT_MARKER = 'blocked_content';

/** True when a save failed because the server's content check refused the text. */
export const isBlockedContentError = (cause: unknown): boolean =>
  cause instanceof Error && cause.message.includes(BLOCKED_CONTENT_MARKER);
