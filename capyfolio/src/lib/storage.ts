import { supabase } from './supabase';
import { imagePath, validateImage, type ImageBucket } from './imageRules';
import { checkProjectFile, formatFileSize, projectFileType, PROJECT_FILE_TYPES } from './projectRules';
import type { ProjectFile } from '../types';

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

const FILE_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'text/csv': 'csv',
};

/**
 * Uploads a project attachment (max 10 MB, PDF/image/ZIP/CSV) to the public `project-files`
 * bucket. The URL downloads the file under its original name.
 */
export async function uploadProjectFile(file: File): Promise<ProjectFile> {
  const problem = checkProjectFile(file);
  if (problem) throw new Error(problem);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Entre na sua conta para enviar arquivos.');

  const type = projectFileType(file)!;
  const path = `${auth.user.id}/${crypto.randomUUID()}.${FILE_EXTENSIONS[type] ?? 'bin'}`;
  const { error } = await supabase.storage.from('project-files').upload(path, file, { contentType: type, upsert: false });
  if (error) throw new Error(`Não foi possível enviar o arquivo "${file.name}".`);

  const url = supabase.storage.from('project-files').getPublicUrl(path, { download: file.name }).data.publicUrl;
  return { kind: 'file', name: file.name, size: formatFileSize(file.size), type: PROJECT_FILE_TYPES[type], url };
}
