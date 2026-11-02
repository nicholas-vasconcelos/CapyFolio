import { Heart, MessageSquare, Sparkles } from 'lucide-react';
import type { Post } from '../types';
import { Avatar } from './Avatar';

export function PostCard({
  post,
  currentUserName,
  onToggleLike,
  onAddComment,
}: {
  post: Post;
  currentUserName?: string;
  onToggleLike: () => void;
  onAddComment: (text: string) => void;
}) {
  const replyLabel = currentUserName ? `Responder como ${currentUserName}...` : 'Escreva um comentário...';

  return (
    <article className="rounded-2xl border-2 border-ink bg-surface p-6 shadow-card md:p-7">
      <div className="flex items-start gap-4">
        <Avatar name={post.authorName} src={post.authorAvatar} size="md" tone="navy" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0 flex-[1_1_200px]">
              <p className="font-display text-[21px] font-bold leading-[1.2] text-ink">{post.authorName}</p>
              <p className="text-[15px] text-ink-muted">{post.authorRole} • {post.authorInstitution}</p>
            </div>
            <span className="cf-tag topic flex-none">{post.category}</span>
          </div>

          <p className="mt-4 whitespace-pre-line text-[19px] leading-[1.6] text-ink">{post.content}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onToggleLike} aria-pressed={!!post.likedByMe} className={`cf-counter ${post.likedByMe ? 'liked' : ''}`}>
              <Heart className={`h-5 w-5 ${post.likedByMe ? 'fill-ink' : ''}`} aria-hidden="true" /> {post.likes}
            </button>
            <span className="cf-counter cursor-default"><MessageSquare className="h-5 w-5" aria-hidden="true" /> {post.comments.length}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-ink-muted"><Sparkles className="h-4 w-4" aria-hidden="true" /> {post.timestamp}</span>
          </div>

          {post.comments.length > 0 && (
            <div className="mt-5 flex flex-col gap-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="cf-comment">
                  <Avatar name={comment.authorName} size="xs" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{comment.authorName}</strong>
                      <span className="text-sm text-ink-muted">{comment.timestamp}</span>
                    </div>
                    <p className="text-base leading-[1.5] text-ink">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            className="mt-5 flex flex-wrap gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget as HTMLFormElement;
              const input = form.elements.namedItem('comment') as HTMLInputElement | null;
              if (input && input.value.trim()) {
                onAddComment(input.value.trim());
                input.value = '';
              }
            }}
          >
            <input
              name="comment"
              type="text"
              aria-label={replyLabel}
              placeholder={replyLabel}
              className="cf-input h-12 min-w-[200px] flex-1"
            />
            <button type="submit" className="cf-btn primary">Enviar</button>
          </form>
        </div>
      </div>
    </article>
  );
}
