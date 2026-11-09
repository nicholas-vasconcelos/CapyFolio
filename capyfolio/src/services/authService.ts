import type { AuthError, User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../lib/storage';
import type { User } from '../types';
import { userService } from './userService';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  /** EducationLevel / EducationStatus keys from lib/profileOptions. */
  educationLevel: string;
  educationStatus: string | null;
  institution: string;
  course: string;
  period: string;
  focus: string;
  tags: string[];
  bio: string;
  /** One of the bundled default silhouettes (see lib/defaultAvatars). */
  defaultAvatarUrl: string;
  /** Optional photo chosen during sign-up; uploaded once a session exists. */
  photo?: File | null;
};

/**
 * `confirm_email`: the account exists but Supabase requires email confirmation before a session starts
 * (a chosen photo cannot be uploaded yet). `photoFailed`: signed in, but the photo upload failed.
 */
export type RegisterResult =
  | { status: 'signed_in'; user: User; photoFailed: boolean }
  | { status: 'confirm_email' };

const isDuplicateEmail = (error: AuthError) =>
  error.code === 'user_already_exists' || error.code === 'email_exists' || /already registered/i.test(error.message);

const redirectUrl = (path: string) => (typeof window === 'undefined' ? undefined : `${window.location.origin}${path}`);

export const authService = {
  /** Returns null on wrong email or password. Throws `EMAIL_NOT_CONFIRMED` when the address is not confirmed yet. */
  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === 'email_not_confirmed') throw new Error('EMAIL_NOT_CONFIRMED');
      if (error.code === 'invalid_credentials' || error.status === 400) return null;
      throw error;
    }
    return authService.profileFor(data.user);
  },

  /** Signs up with profile metadata; the database trigger creates (or claims) the profile row. */
  async register(data: RegisterInput): Promise<RegisterResult> {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl('/login'),
        data: {
          name: data.name,
          education_level: data.educationLevel,
          education_status: data.educationStatus,
          institution: data.institution,
          course: data.course,
          period: data.period,
          focus: data.focus,
          tags: data.tags,
          bio: data.bio,
          avatar_url: data.defaultAvatarUrl,
        },
      },
    });

    if (error) {
      if (isDuplicateEmail(error)) throw new Error('EMAIL_TAKEN');
      throw error;
    }
    // With email confirmation on, Supabase hides duplicates: it returns a user with no identities and no session.
    if (result.user && result.user.identities?.length === 0) throw new Error('EMAIL_TAKEN');
    if (!result.session || !result.user) return { status: 'confirm_email' };

    // Upload before returning, so the profile the app loads already has the photo.
    let photoFailed = false;
    if (data.photo) {
      try {
        const url = await uploadImage('avatars', data.photo);
        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: url }).eq('user_id', result.user.id);
        if (updateError) throw updateError;
      } catch (cause) {
        console.error(cause);
        photoFailed = true;
      }
    }

    const user = await authService.profileFor(result.user);
    if (!user) throw new Error('PROFILE_MISSING');
    return { status: 'signed_in', user, photoFailed };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** Sends the "redefinir senha" email; the link opens /redefinir-senha with a recovery session. */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl('/redefinir-senha') });
    if (error) throw error;
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  /** Profile of the current session, or null. Nothing is cached in localStorage beyond Supabase's own session. */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getSession();
    return data.session ? authService.profileFor(data.session.user) : null;
  },

  async profileFor(authUser: AuthUser): Promise<User | null> {
    return (await userService.getCurrent(authUser.email ?? undefined)) ?? null;
  },
};
