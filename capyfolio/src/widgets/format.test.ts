import { describe, expect, it } from 'vitest';
import { displayUrl, externalUrl, keyResultHighlight, projectCountLabel } from './format';

describe('keyResultHighlight', () => {
  it('pulls out a percentage, wherever it is', () => {
    expect(keyResultHighlight('Redução de 40% no tempo de processamento de dados acadêmicos.')).toBe('40%');
    expect(keyResultHighlight('−40% no custo de infraestrutura')).toBe('−40%');
    expect(keyResultHighlight('Acurácia de 92,5 % no conjunto de teste')).toBe('92,5%');
  });

  it('prefers the target of "de X para Y"', () => {
    expect(keyResultHighlight('Redução do tempo de inferência visual de 14.2ms para 3.8ms por quadro.')).toBe('3.8ms');
  });

  it('falls back to the first number, keeping pt-BR thousands', () => {
    expect(keyResultHighlight('Indexação vetorial de mais de 12.500 dissertações.')).toBe('12.500');
    expect(keyResultHighlight('Adotado por 6 ligas acadêmicas.')).toBe('6');
    expect(keyResultHighlight('Consultas 3x mais rápidas')).toBe('3x');
  });

  it('ignores bare years and sentences without numbers', () => {
    expect(keyResultHighlight('Publicado em 2025 com 300 downloads')).toBe('300');
    expect(keyResultHighlight('Publicado em 2025')).toBeNull();
    expect(keyResultHighlight('Repositório público com documentação completa.')).toBeNull();
  });
});

describe('externalUrl and displayUrl', () => {
  it('adds https only when the protocol is missing', () => {
    expect(externalUrl('github.com/arthur')).toBe('https://github.com/arthur');
    expect(externalUrl(' http://lattes.cnpq.br/1 ')).toBe('http://lattes.cnpq.br/1');
  });

  it('never yields a non-http link', () => {
    expect(externalUrl('javascript:alert(1)').startsWith('https://')).toBe(true);
  });

  it('shows links without protocol, www or trailing slash', () => {
    expect(displayUrl('https://www.linkedin.com/in/arthur/')).toBe('linkedin.com/in/arthur');
  });
});

describe('projectCountLabel', () => {
  it('uses singular and plural', () => {
    expect(projectCountLabel(1)).toBe('1 projeto publicado');
    expect(projectCountLabel(3)).toBe('3 projetos publicados');
  });
});
