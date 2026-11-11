import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { TEXT_LIMITS, validateText } from '../lib/contentRules';
import { PhotoPicker, usePickedPhotos } from './PhotoPicker';

/** Up to four photos per post (posts_images_max in the database). */
export const POST_MAX_PHOTOS = 4;

export type NewPostSubmission = {
  category: string;
  content: string;
  relatedProjectId?: string | null;
  /** Picked photos; the caller uploads them before saving the post. */
  photos?: File[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-ink">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      {message}
    </span>
  );
}

/**
 * "Publicar" popup. Posts are written here; projects have their own step-by-step page
 * (/projeto/novo), so the Projeto tab only leads there.
 */
export function CreateContentModal({
  defaultTab,
  onClose,
  onSubmitPost,
  onStartProject,
}: {
  defaultTab: 'project' | 'post';
  onClose: () => void;
  /** Resolves true when the post was published (the caller closes the popup). */
  onSubmitPost: (data: NewPostSubmission) => Promise<boolean>;
  /** Closes the popup and opens the new-project page. */
  onStartProject: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'project' | 'post'>(defaultTab || 'post');
  const [postDraft, setPostDraft] = useState({ category: 'Pesquisa Acadêmica', content: '' });
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = usePickedPhotos();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPost = async () => {
    const message = validateText(postDraft.content, 'Conteúdo', TEXT_LIMITS.post);
    setError(message);
    if (message) return;
    setIsSubmitting(true);
    await onSubmitPost({ category: postDraft.category, content: postDraft.content.trim(), photos: photos.map((photo) => photo.file) });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-3 backdrop-blur-[2px] sm:p-4">
      <div className="max-h-[calc(100dvh-24px)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-navy">Publicar conteúdo</h3>
            <p className="text-xs text-gray-500">Compartilhe uma atualização ou um novo projeto acadêmico.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-line px-4 pt-3 sm:px-6">
          <button type="button" onClick={() => setActiveTab('project')} className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 ${activeTab === 'project' ? 'border-navy text-navy' : 'border-transparent text-gray-500'}`}>
            Projeto
          </button>
          <button type="button" onClick={() => setActiveTab('post')} className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 ${activeTab === 'post' ? 'border-navy text-navy' : 'border-transparent text-gray-500'}`}>
            Postagem
          </button>
        </div>

        {activeTab === 'project' ? (
          <div className="flex flex-col items-start gap-4 p-4 sm:p-6">
            <p className="m-0 text-[15px] leading-[1.5] text-ink">
              Projetos são publicados em uma página com etapas: informações básicas, resumo e metodologia, período e resultados, tags e anexos.
            </p>
            <div className="flex w-full flex-wrap justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="cf-btn">Cancelar</button>
              <button type="button" onClick={onStartProject} className="cf-btn primary">
                Começar projeto
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            <div>
              <label htmlFor="post-category" className="block text-xs font-semibold text-ink mb-1.5">Categoria</label>
              <select id="post-category" value={postDraft.category} onChange={(event) => setPostDraft((current) => ({ ...current, category: event.target.value }))} className="min-h-[44px] w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-sm focus:border-navy focus:outline-none">
                <option>Palestra Oficial</option>
                <option>Pesquisa Acadêmica</option>
                <option>Dados e Análise</option>
                <option>Visão Computacional</option>
                <option>Engenharia de Software</option>
              </select>
            </div>
            <div>
              <label htmlFor="post-content" className="block text-xs font-semibold text-ink mb-1.5">Conteúdo</label>
              <textarea id="post-content" value={postDraft.content} onChange={(event) => setPostDraft((current) => ({ ...current, content: event.target.value }))} rows={6} maxLength={TEXT_LIMITS.post.maxChars} className="min-h-[44px] w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-sm focus:border-navy focus:outline-none" placeholder="Compartilhe uma atualização, resultado ou oportunidade acadêmica..." />
              <FieldError message={error ?? undefined} />
            </div>
            <PhotoPicker photos={photos} onChange={setPhotos} max={POST_MAX_PHOTOS} label="Fotos" hint="PNG, JPEG ou WebP, até 5 MB cada." />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-line-strong text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Cancelar</button>
              <button type="button" onClick={() => void submitPost()} disabled={isSubmitting} className="cf-btn primary disabled:opacity-70">{isSubmitting ? 'Publicando...' : 'Publicar atualização'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
