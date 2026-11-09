import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import type { Post, User } from '../types';

/**
 * One post with all its comments (the feed shows only the first few).
 * Reads from the app's post list, so likes and new comments stay in sync with the feed.
 */
export function PostPage({ currentUser, posts, loading, onToggleLike, onAddComment }: {
  currentUser: User;
  posts: Post[];
  loading: boolean;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => boolean;
}) {
  const { id } = useParams();
  const post = posts.find((item) => item.id === id);

  return (
    <main className="mx-auto flex max-w-[860px] flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 md:pt-12">
      <Link to="/feed" className="cf-link inline-flex min-h-[44px] items-center gap-2 self-start text-[15px] hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar ao feed
      </Link>

      {post ? (
        <>
          <h1 className="sr-only">Publicação de {post.authorName}</h1>
          <PostCard
            post={post}
            currentUserName={currentUser.name}
            onToggleLike={() => onToggleLike(post.id)}
            onAddComment={(text) => onAddComment(post.id, text)}
          />
        </>
      ) : loading ? (
        <p role="status" className="text-ink-muted">Carregando publicação...</p>
      ) : (
        <div className="cf-empty">
          <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy">Publicação não encontrada</h1>
          <p>Ela pode ter sido removida pelo autor.</p>
          <Link to="/feed" className="cf-btn primary">Voltar ao feed</Link>
        </div>
      )}
    </main>
  );
}
