import { describe, expect, it } from 'vitest';
import { checkText, containsBlockedTerm, countWords, isBlockedContentError, validateText } from './contentRules';

describe('containsBlockedTerm', () => {
  it('finds blocked words despite case, accents, leetspeak and stretching', () => {
    expect(containsBlockedTerm('Que P0RRAAA é essa')).toBe(true);
    expect(containsBlockedTerm('pórra')).toBe(true);
    expect(containsBlockedTerm('FDP!')).toBe(true);
    expect(containsBlockedTerm('vai tomar no cu')).toBe(true);
    expect(containsBlockedTerm('This is bullshit')).toBe(true);
  });

  it('leaves normal words that contain a blocked word alone', () => {
    expect(containsBlockedTerm('Meu computador quebrou')).toBe(false);
    expect(containsBlockedTerm('Estudo sobre viadutos e a cúpula do Congresso')).toBe(false);
    expect(containsBlockedTerm('Projeto de Iniciação Científica em dados')).toBe(false);
    expect(containsBlockedTerm('Disputa entre grupos de pesquisa')).toBe(false);
  });
});

describe('checkText', () => {
  it('passes empty optional text and flags empty required text', () => {
    expect(checkText('   ')).toBeNull();
    expect(checkText('   ', { required: true })).toBe('required');
  });

  it('applies length and word limits', () => {
    expect(checkText('abc', { minChars: 5 })).toBe('tooShort');
    expect(checkText('a'.repeat(6), { maxChars: 5 })).toBe('tooLong');
    expect(checkText('um dois três', { maxWords: 2 })).toBe('tooManyWords');
  });

  it('blocks links unless allowed', () => {
    expect(checkText('veja www.exemplo.com')).toBe('link');
    expect(checkText('veja https://exemplo.com', { allowLinks: true })).toBeNull();
  });

  it('flags keyboard mashing and shouting', () => {
    expect(checkText('asdfghjkl')).toBe('spam');
    expect(checkText('kkkkkkkkkkkk')).toBe('spam');
    expect(checkText('ESTE PROJETO É O MELHOR DE TODOS')).toBe('spam');
    expect(checkText('Análise de dados com Python e SQL na UFPE')).toBeNull();
  });
});

describe('helpers', () => {
  it('counts words', () => {
    expect(countWords('  um  dois\ntrês ')).toBe(3);
    expect(countWords('')).toBe(0);
  });

  it('names the field in the message', () => {
    expect(validateText('merda', 'Comentário')).toMatch(/^Comentário:/);
  });

  it('recognises the database refusal', () => {
    expect(isBlockedContentError(new Error('postService.create: blocked_content'))).toBe(true);
    expect(isBlockedContentError(new Error('network'))).toBe(false);
  });
});
