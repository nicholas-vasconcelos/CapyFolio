import { supabase } from './supabase';
import { imagePath, validateImage, type ImageBucket } from './imageRules';

export type { ImageBucket } from './imageRules';

/** Uploads an image to a public bucket (`avatars` or `project-media`) and returns its public URL. */
export async function uploadImage(bucket: ImageBucket, file: File): Promise<string> {
  validateImage(file);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Entre na sua conta para enviar imagens.');

  const path = imagePath(auth.user.id, file.type);
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error('Não foi possível enviar a imagem.');

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
