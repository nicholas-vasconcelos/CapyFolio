import { supabase } from '../lib/supabase';
import type { Comment, Post } from '../types';
import { check } from './errors';
import { toComment, toPost, type PostRow } from './mappers';
import { isDemoMode } from '../lib/demo';
import { userService } from './userService';

export type NewPost = {
  category: string;
  content: string;
  relatedProjectId?: string | null;
  relatedEventId?: string | null;
  /** Public URLs of photos already uploaded (max 4). */
  images?: string[];
};

export const postService = {
  /** Feed, newest first, with comments oldest first. Posts and comments load in parallel. */
  async list(): Promise<Post[]> {
    const [posts, comments] = await Promise.all([
      supabase.from('posts_view').select('*').order('created_at', { ascending: false }),
      supabase.from('comments_view').select('*').order('created_at', { ascending: true }),
    ]);
    const postRows = check(posts, 'postService.list');
    const commentRows = check(comments, 'postService.list(comments)');
    return postRows.map((row) => toPost(row, commentRows));
  },

  async getById(id: string): Promise<Post | undefined> {
    const [post, comments] = await Promise.all([
      supabase.from('posts_view').select('*').eq('id', id).maybeSingle(),
      supabase.from('comments_view').select('*').eq('post_id', id).order('created_at', { ascending: true }),
    ]);
    const row = check(post, 'postService.getById');
    return row ? toPost(row, check(comments, 'postService.getById(comments)')) : undefined;
  },

  async create(input: NewPost, authorId: string): Promise<Post> {
    if (isDemoMode()) return demoPost(input, authorId);
    const created = check(
      await supabase
        .from('posts')
        .insert({
          author_id: authorId,
          category: input.category,
          content: input.content,
          related_project_id: input.relatedProjectId ?? null,
          related_event_id: input.relatedEventId ?? null,
          images: input.images ?? [],
        })
        .select('id')
        .single(),
      'postService.create',
    );
    const saved = await postService.getById(created.id);
    if (!saved) throw new Error('postService.create: post not readable after insert');
    return saved;
  },

  /** Adds or removes the signed-in profile's like. Idempotent in both directions. */
  async toggleLike(postId: string, profileId: string, liked: boolean): Promise<void> {
    if (isDemoMode()) return;
    if (liked) {
      check(
        await supabase
          .from('post_likes')
          .upsert({ post_id: postId, profile_id: profileId }, { onConflict: 'post_id,profile_id', ignoreDuplicates: true }),
        'postService.like',
      );
    } else {
      check(await supabase.from('post_likes').delete().eq('post_id', postId).eq('profile_id', profileId), 'postService.unlike');
    }
  },

  async addComment(postId: string, authorId: string, text: string): Promise<Comment> {
    if (isDemoMode()) {
      const author = await userService.getById(authorId);
      return { id: crypto.randomUUID(), authorId, authorName: author?.name ?? '', authorInstitution: author?.shortInstitution || author?.institution || '', text, timestamp: 'Agora mesmo' };
    }
    const created = check(
      await supabase.from('comments').insert({ post_id: postId, author_id: authorId, text }).select('id').single(),
      'postService.addComment',
    );
    const row = check(await supabase.from('comments_view').select('*').eq('id', created.id).single(), 'postService.addComment(read)');
    return toComment(row);
  },
};

/** Demo account: the post exists only in the app's state. */
async function demoPost(input: NewPost, authorId: string): Promise<Post> {
  const author = await userService.getById(authorId);
  const row: PostRow = {
    id: crypto.randomUUID(),
    author_id: authorId,
    category: input.category,
    content: input.content,
    related_project_id: input.relatedProjectId ?? null,
    related_event_id: input.relatedEventId ?? null,
    is_sample: false,
    created_at: new Date().toISOString(),
    author_name: author?.name ?? null,
    author_role: author?.role ?? ([author?.course, author?.period].filter(Boolean).join(' • ') || null),
    author_institution: author?.shortInstitution || author?.institution || null,
    author_avatar: author?.avatar ?? null,
    is_organization: false,
    likes: 0,
    liked_by_me: false,
    images: input.images ?? [],
  };
  return toPost(row);
}
