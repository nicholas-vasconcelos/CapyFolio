// Upload rules shared by the storage helper and its tests. Mirrors the bucket settings in Supabase
// (5 MB, PNG/JPEG/WebP) so users get a pt-BR message before the request is sent.
export type ImageBucket = 'avatars' | 'project-media';

export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/** Throws a pt-BR message when the file cannot be uploaded. */
export function validateImage(file: { type: string; size: number }): void {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('Envie uma imagem PNG, JPEG ou WebP.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }
}

/** `<auth uid>/<random>.<ext>`: storage policies only allow writes inside the user's own folder. */
export function imagePath(userId: string, mimeType: string, id: string = crypto.randomUUID()): string {
  return `${userId}/${id}.${EXTENSIONS[mimeType] ?? 'img'}`;
}
