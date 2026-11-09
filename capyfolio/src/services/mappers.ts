// Pure conversions between Supabase rows (views) and the app's existing types, plus pt-BR display formatting.
// No Supabase client import here, so this file is unit-testable without env vars.
import type { Database, Json } from '../lib/database.types';
import type { Comment, Event, Post, ProfileLayout, Project, ProjectFile, ScheduleItem, Speaker, User } from '../types';

type Views = Database['public']['Views'];
export type ProfileRow = Views['profiles_view']['Row'];
export type ProjectRow = Views['projects_view']['Row'];
export type EventRow = Views['events_view']['Row'];
export type PostRow = Views['posts_view']['Row'];
export type CommentRow = Views['comments_view']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const TIME_ZONE = 'America/Sao_Paulo';

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const partsOf = (date: Date, options: Intl.DateTimeFormatOptions) => {
  const parts = new Intl.DateTimeFormat('pt-BR', options).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return get;
};

/** "28 abr. 2025" (the style the mock data used). */
const formatDay = (date: Date, timeZone: string) => {
  const get = partsOf(date, { day: '2-digit', month: 'short', year: 'numeric', timeZone });
  return `${get('day')} ${get('month')} ${get('year')}`;
};

const formatTime = (date: Date) => {
  const get = partsOf(date, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
  return `${get('hour')}:${get('minute')}`;
};

/** "15 mai. 2025, 14:00 - 18:00" in São Paulo time. Unknown start -> "[Data a definir]". */
export function formatEventDate(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt) return '[Data a definir]';
  const start = new Date(startsAt);
  const day = formatDay(start, TIME_ZONE);
  if (!endsAt) return `${day}, ${formatTime(start)}`;
  const end = new Date(endsAt);
  const endDay = formatDay(end, TIME_ZONE);
  return endDay === day
    ? `${day}, ${formatTime(start)} - ${formatTime(end)}`
    : `${day}, ${formatTime(start)} - ${endDay}, ${formatTime(end)}`;
}

/** Postgres `date` ("2025-04-28") -> "28 abr. 2025". */
export function formatProjectDate(date: string | null): string {
  if (!date) return '';
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return date;
  return formatDay(new Date(Date.UTC(year, month - 1, day, 12)), 'UTC');
}

const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Agora mesmo", "Há 5 minutos", "Há 3 horas", "Ontem", "Há 3 dias", "Há 2 semanas", ... */
export function formatRelativeTime(iso: string | null, now: Date = new Date()): string {
  if (!iso) return '';
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Agora mesmo';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return capitalize(relative.format(-minutes, 'minute'));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return capitalize(relative.format(-hours, 'hour'));
  const days = Math.floor(hours / 24);
  if (days < 7) return capitalize(relative.format(-days, 'day'));
  if (days < 30) return capitalize(relative.format(-Math.floor(days / 7), 'week'));
  if (days < 365) return capitalize(relative.format(-Math.floor(days / 30), 'month'));
  return capitalize(relative.format(-Math.floor(days / 365), 'year'));
}

/* ------------------------------------------------------------------ */
/* Row -> app type                                                     */
/* ------------------------------------------------------------------ */

const str = (value: string | null | undefined) => value ?? undefined;
const list = <T>(value: Json | null | undefined): T[] => (Array.isArray(value) ? (value as unknown as T[]) : []);

export function toUser(row: ProfileRow, email?: string): User {
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    role: str(row.role),
    focus: row.focus ?? '',
    institution: row.institution ?? '',
    shortInstitution: str(row.short_institution),
    educationLevel: str(row.education_level),
    educationStatus: str(row.education_status),
    course: str(row.course),
    period: str(row.period),
    location: str(row.location),
    bio: str(row.bio),
    tags: row.tags ?? [],
    badges: row.badges ?? [],
    avatar: str(row.avatar_url),
    featuredProjectId: row.featured_project_id ?? null,
    email,
    github: row.github ?? '',
    linkedin: row.linkedin ?? '',
    lattes: row.lattes ?? '',
    connections: row.connections ?? 0,
    profileLayout: (row.profile_layout as unknown as ProfileLayout | null) ?? undefined,
  };
}

/** Only the columns a user may change on their own profile (the rest are protected by column grants). */
export function toProfileUpdate(user: User): ProfileUpdate {
  return {
    name: user.name,
    role: user.role ?? null,
    focus: user.focus,
    institution: user.institution,
    short_institution: user.shortInstitution ?? null,
    // Only sent when known, so profiles without an answer never touch these columns.
    ...(user.educationLevel !== undefined ? { education_level: user.educationLevel || null, education_status: user.educationStatus || null } : {}),
    course: user.course ?? null,
    period: user.period ?? null,
    location: user.location ?? null,
    bio: user.bio ?? null,
    tags: user.tags,
    avatar_url: user.avatar ?? null,
    github: user.github ?? null,
    linkedin: user.linkedin ?? null,
    lattes: user.lattes ?? null,
    featured_project_id: user.featuredProjectId ?? null,
    profile_layout: (user.profileLayout ?? null) as unknown as Json,
  };
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id ?? '',
    title: row.title ?? '',
    shortDescription: row.short_description ?? '',
    summary: row.summary ?? '',
    keyResults: row.key_results ?? [],
    methodology: row.methodology ?? '',
    files: list<ProjectFile>(row.files),
    authorIds: row.author_ids ?? [],
    authorNames: row.author_names ?? '',
    institution: row.institution ?? '',
    area: row.area ?? '',
    type: row.type ?? '',
    status: row.status ?? '',
    date: formatProjectDate(row.project_date),
    period: row.period ?? '',
    tags: row.tags ?? [],
    url: str(row.url),
    visualType: row.visual_type ?? 'standard',
    media: str(row.media_url),
    favorites: row.favorites ?? 0,
  };
}

export function toEvent(row: EventRow): Event {
  return {
    id: row.id ?? '',
    title: row.title ?? '',
    category: row.category ?? '',
    status: row.status ?? '',
    date: formatEventDate(row.starts_at, row.ends_at),
    location: row.location ?? '',
    city: row.city ?? '',
    organizer: row.organizer ?? '',
    modality: row.modality ?? '',
    tags: row.tags ?? [],
    shortDescription: row.short_description ?? '',
    aboutText: row.about_text ?? '',
    speakers: list<Speaker>(row.speakers),
    schedule: list<ScheduleItem>(row.schedule),
    attendeesCount: row.attendees_count ?? 0,
  };
}

export function toComment(row: CommentRow, now?: Date): Comment {
  return {
    id: row.id ?? '',
    authorId: row.author_id,
    authorName: row.author_name ?? '[Autor]',
    authorInstitution: row.author_institution ?? '',
    text: row.text ?? '',
    timestamp: formatRelativeTime(row.created_at, now),
  };
}

export function toPost(row: PostRow, comments: CommentRow[] = [], now?: Date): Post {
  return {
    id: row.id ?? '',
    authorId: row.author_id ?? '',
    authorName: row.author_name ?? '[Autor]',
    authorRole: row.author_role ?? '',
    authorInstitution: row.author_institution ?? '',
    authorAvatar: row.author_avatar ?? '',
    isOrganization: Boolean(row.is_organization),
    category: row.category ?? '',
    timestamp: formatRelativeTime(row.created_at, now),
    content: row.content ?? '',
    relatedProjectId: row.related_project_id,
    relatedEventId: row.related_event_id,
    likes: row.likes ?? 0,
    likedByMe: Boolean(row.liked_by_me),
    comments: comments.filter((comment) => comment.post_id === row.id).map((comment) => toComment(comment, now)),
  };
}
