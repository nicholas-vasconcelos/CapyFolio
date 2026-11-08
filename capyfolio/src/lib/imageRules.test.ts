import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, imagePath, validateImage } from './imageRules';

describe('validateImage', () => {
  it('accepts PNG, JPEG and WebP up to 5 MB', () => {
    expect(() => validateImage({ type: 'image/png', size: 1000 })).not.toThrow();
    expect(() => validateImage({ type: 'image/jpeg', size: MAX_IMAGE_BYTES })).not.toThrow();
    expect(() => validateImage({ type: 'image/webp', size: 10 })).not.toThrow();
  });

  it('rejects other types and files over 5 MB with pt-BR messages', () => {
    expect(() => validateImage({ type: 'image/gif', size: 10 })).toThrow('Envie uma imagem PNG, JPEG ou WebP.');
    expect(() => validateImage({ type: 'image/svg+xml', size: 10 })).toThrow('Envie uma imagem PNG, JPEG ou WebP.');
    expect(() => validateImage({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })).toThrow('A imagem deve ter no máximo 5 MB.');
  });
});

describe('imagePath', () => {
  it("puts the file in the user's own folder, as the storage policies require", () => {
    expect(imagePath('user-1', 'image/jpeg', 'abc')).toBe('user-1/abc.jpg');
    expect(imagePath('user-1', 'image/webp', 'abc')).toBe('user-1/abc.webp');
    expect(imagePath('user-1', 'image/png').startsWith('user-1/')).toBe(true);
  });
});
