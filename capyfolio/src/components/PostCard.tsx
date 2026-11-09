import { Heart, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { TEXT_LIMITS } from '../lib/contentRules';
import { Avatar } from './Avatar';

/** Comments shown on a post in the feed; the rest are on the post's own page. */
export const FEED_COMMENT_LIMIT = 3;

export const postPath = (postId: string) => `/post/${postId}`;

/**
 * A post with its comments and reply box, used by the feed and the post page.
 * With `commentLimit`, only the first comments show and the counter and a
 * "ver todos" link lead to the post's own page.
 */
export function PostCard({
  post,
  currentUserName,
  commentLimit,
  onToggleLike,
  onAddComment,
}: {
  post: Post;
  currentUserName?: string;
  commentLimit?: number;
  onToggleLike: () => void;
  /** False when the comment was refused (the box keeps the text). */
  onAddComment: (text: string) => boolean;
}) {
  const replyLabel = currentUserName ? `Responder como ${currentUserName}` : 'Escreva um comentário';
  const total = post.comments.length;
  const shown = commentLimit === undefined ? post.comments : post.comments.slice(0, commentLimit);
  const hidden = total - shown.length;
  const commentsLabel = `${total} ${total === 1 ? 'comentário' : 'comentários'}`;

  return (
    <article className="rounded-2xl border-2 border-ink bg-surface p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Avatar name={post.authorName} src={post.authorAvatar} size="md" tone="navy" />
        <div className="min-w-0 flex-[1_1_200px]">
          <strong className="block font-display text-[21px] font-bold leading-[1.2] text-ink">{post.authorName}</strong>
          <span className="text-[15px] text-ink-muted">{[post.authorRole, post.authorInstitution].filter(Boolean).join(' • ')}</span>
        </div>
        <span className="cf-tag topic flex-none">{post.category}</span>
      </div>

      <p className="mt-5 whitespace-pre-line text-[19px] leading-[1.6] text-ink [overflow-wrap:anywhere]">{post.content}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onToggleLike} aria-pressed={!!post.likedByMe} aria-label={`Curtir (${post.likes})`} className={`cf-counter ${post.likedByMe ? 'liked' : ''}`}>
          <Heart className={`h-5 w-5 ${post.likedByMe ? 'fill-current' : ''}`} aria-hidden="true" /> {post.likes}
        </button>
        {commentLimit === undefined ? (
          <span className="cf-counter cursor-default" aria-label={commentsLabel}>
            <MessageSquare className="h-5 w-5" aria-hidden="true" /> {total}
          </span>
        ) : (
          <Link to={postPath(post.id)} className="cf-counter no-underline" aria-label={`Ver ${commentsLabel}`}>
            <MessageSquare className="h-5 w-5" aria-hidden="true" /> {total}
          </Link>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-ink-muted"><Sparkles className="h-4 w-4" aria-hidden="true" /> {post.timestamp}</span>
      </div>

      {shown.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {shown.map((comment) => (
            <div key={comment.id} className="cf-comment">
              <Avatar name={comment.authorName} size="xs" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3">
                  <strong>{comment.authorName}</strong>
                  <span className="text-sm text-ink-muted">{comment.timestamp}</span>
                </div>
                <p className="text-base leading-[1.5] text-ink [overflow-wrap:anywhere]">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {hidden > 0 && (
        <Link to={postPath(post.id)} className="cf-link mt-4 inline-flex min-h-[44px] items-center text-[15px] hover:underline">
          Ver todos os {total} comentários
        </Link>
      )}

      <form
        className="mt-5 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const input = event.currentTarget.elements.namedItem('comment') as HTMLInputElement | null;
          if (input && input.value.trim() && onAddComment(input.value)) input.value = '';
        }}
      >
        <input
          name="comment"
          type="text"
          maxLength={TEXT_LIMITS.comment.maxChars}
          aria-label={replyLabel}
          placeholder={replyLabel}
          className="cf-input h-12 min-w-[200px] flex-1"
        />
        <button type="submit" className="cf-btn primary">Enviar</button>
      </form>
    </article>
  );
}
