import { describe, expect, it } from 'vitest';
import {
  formatEventDate,
  formatProjectDate,
  formatRelativeTime,
  toComment,
  toEvent,
  toPost,
  toProfileUpdate,
  toProject,
  toUser,
  type CommentRow,
  type EventRow,
  type PostRow,
  type ProfileRow,
  type ProjectRow,
} from './mappers';

const NOW = new Date('2026-11-06T15:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
  it('uses "Agora mesmo" under a minute', () => {
    expect(formatRelativeTime(ago(0), NOW)).toBe('Agora mesmo');
    expect(formatRelativeTime(ago(59_000), NOW)).toBe('Agora mesmo');
  });

  it('formats minutes, hours and yesterday in pt-BR', () => {
    expect(formatRelativeTime(ago(MIN), NOW)).toBe('Há 1 minuto');
    expect(formatRelativeTime(ago(5 * MIN), NOW)).toBe('Há 5 minutos');
    expect(formatRelativeTime(ago(HOUR), NOW)).toBe('Há 1 hora');
    expect(formatRelativeTime(ago(3 * HOUR), NOW)).toBe('Há 3 horas');
    expect(formatRelativeTime(ago(DAY + 2 * HOUR), NOW)).toBe('Ontem');
  });

  it('formats days, weeks, months and years', () => {
    expect(formatRelativeTime(ago(3 * DAY), NOW)).toBe('Há 3 dias');
    expect(formatRelativeTime(ago(14 * DAY), NOW)).toBe('Há 2 semanas');
    expect(formatRelativeTime(ago(60 * DAY), NOW)).toBe('Há 2 meses');
    expect(formatRelativeTime(ago(800 * DAY), NOW)).toBe('Há 2 anos');
  });

  it('treats future or missing timestamps safely', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + 5000).toISOString(), NOW)).toBe('Agora mesmo');
    expect(formatRelativeTime(null, NOW)).toBe('');
  });
});

describe('formatEventDate', () => {
  it('matches the existing display style in São Paulo time', () => {
    // 14:00-18:00 BRT (UTC-3) on 15 May 2025.
    expect(formatEventDate('2025-05-15T17:00:00+00:00', '2025-05-15T21:00:00+00:00')).toBe('15 mai. 2025, 14:00 - 18:00');
    expect(formatEventDate('2025-06-22T12:00:00+00:00', '2025-06-22T20:00:00+00:00')).toBe('22 jun. 2025, 09:00 - 17:00');
  });

  it('handles a missing end, multi-day ranges and a missing start', () => {
    expect(formatEventDate('2025-05-15T17:00:00+00:00', null)).toBe('15 mai. 2025, 14:00');
    expect(formatEventDate('2025-05-15T17:00:00+00:00', '2025-05-16T20:00:00+00:00')).toBe('15 mai. 2025, 14:00 - 16 mai. 2025, 17:00');
    expect(formatEventDate(null, null)).toBe('[Data a definir]');
  });
});

describe('formatProjectDate', () => {
  it('formats a Postgres date without shifting the day', () => {
    expect(formatProjectDate('2025-04-28')).toBe('28 abr. 2025');
    expect(formatProjectDate('2025-12-01')).toBe('01 dez. 2025');
    expect(formatProjectDate(null)).toBe('');
  });
});

const profileRow: ProfileRow = {
  id: 'p-1',
  name: 'Gabriel Costa',
  role: null,
  focus: 'Dados',
  institution: 'Universidade Federal Fluminense (UFF)',
  short_institution: 'UFF',
  course: 'Ciência da Computação',
  education_level: 'bachelor',
  education_status: 'in_progress',
  period: '7º Período',
  location: 'Niterói, RJ',
  bio: 'Bio',
  tags: ['Python'],
  badges: [],
  avatar_url: 'https://example.com/a.png',
  github: '',
  linkedin: '',
  lattes: '',
  featured_project_id: 'proj-1',
  profile_layout: { version: 1, hero: null, widgets: [] },
  is_organization: false,
  is_sample: true,
  created_at: '2026-11-06T00:00:00Z',
  connections: 185,
  is_me: false,
};

describe('profile mappers', () => {
  it('maps a profile row to a User without exposing an email', () => {
    const user = toUser(profileRow);
    expect(user).toMatchObject({
      id: 'p-1',
      name: 'Gabriel Costa',
      shortInstitution: 'UFF',
      avatar: 'https://example.com/a.png',
      featuredProjectId: 'proj-1',
      connections: 185,
      profileLayout: { version: 1, hero: null, widgets: [] },
    });
    expect(user.email).toBeUndefined();
    expect(toUser(profileRow, 'me@uff.br').email).toBe('me@uff.br');
  });

  it('round-trips editable fields and never includes protected columns', () => {
    const update = toProfileUpdate(toUser(profileRow));
    expect(update).toMatchObject({ name: 'Gabriel Costa', avatar_url: 'https://example.com/a.png', featured_project_id: 'proj-1' });
    for (const key of ['user_id', 'claimed', 'is_sample', 'is_organization', 'connections_base', 'badges', 'id']) {
      expect(update).not.toHaveProperty(key);
    }
  });
});

describe('content mappers', () => {
  it('maps a project row', () => {
    const row: ProjectRow = {
      id: 'proj-1', created_by: 'p-1', title: 'T', short_description: 'S', summary: 'Sum', key_results: ['K'],
      methodology: 'M', files: [{ name: 'a.pdf', size: '1 MB', type: 'PDF' }], institution: 'UFF', area: 'Dados',
      type: 'Pesquisa', status: 'Em andamento', project_date: '2025-04-28', period: 'jan. 2024 - dez. 2025', tags: ['Python'],
      url: null, visual_type: 'spatial-map', media_url: null, is_sample: true, created_at: '2026-11-06T00:00:00Z',
      author_ids: ['p-1', 'p-2'], author_names: 'Gabriel Costa, Mariana Alves', favorites: 43,
    };
    expect(toProject(row)).toMatchObject({
      id: 'proj-1', date: '28 abr. 2025', authorIds: ['p-1', 'p-2'], authorNames: 'Gabriel Costa, Mariana Alves',
      favorites: 43, visualType: 'spatial-map', files: [{ name: 'a.pdf', size: '1 MB', type: 'PDF' }], url: undefined,
    });
  });

  it('maps an event row with a formatted date and live attendee count', () => {
    const row: EventRow = {
      id: 'e-1', title: 'Palestra', category: 'Palestra', status: 'Inscrições abertas',
      starts_at: '2025-05-15T17:00:00+00:00', ends_at: '2025-05-15T21:00:00+00:00', location: 'Auditório', city: 'Niterói, RJ',
      organizer: 'UFF', modality: 'Presencial', tags: [], short_description: '', about_text: '',
      speakers: [{ id: 'sp1', name: 'Ana', role: 'Pesquisadora' }], schedule: null, is_sample: true,
      created_at: '2026-11-06T00:00:00Z', attendees_count: 149,
    };
    const event = toEvent(row);
    expect(event.date).toBe('15 mai. 2025, 14:00 - 18:00');
    expect(event.attendeesCount).toBe(149);
    expect(event.speakers).toHaveLength(1);
    expect(event.schedule).toEqual([]);
  });

  it('maps posts with their own comments only, using snapshot names for sample comments', () => {
    const post: PostRow = {
      id: 'post-1', author_id: 'p-1', category: 'Dados', content: 'Oi', related_project_id: 'proj-1', related_event_id: null,
      is_sample: true, created_at: ago(3 * HOUR), author_name: 'Gabriel Costa', author_role: 'Ciência da Computação • 7º Período',
      author_institution: 'UFF', author_avatar: null, is_organization: false, likes: 55, liked_by_me: true,
    };
    const comments: CommentRow[] = [
      { id: 'c-1', post_id: 'post-1', author_id: null, author_name: 'Ana Clara Souza', author_institution: 'UFRJ', text: 'Ótimo', created_at: ago(HOUR) },
      { id: 'c-2', post_id: 'other', author_id: 'p-2', author_name: 'X', author_institution: '', text: 'Outro', created_at: ago(HOUR) },
    ];
    const mapped = toPost(post, comments, NOW);
    expect(mapped).toMatchObject({ id: 'post-1', timestamp: 'Há 3 horas', likes: 55, likedByMe: true, authorAvatar: '', isOrganization: false });
    expect(mapped.comments).toEqual([
      { id: 'c-1', authorId: null, authorName: 'Ana Clara Souza', authorInstitution: 'UFRJ', text: 'Ótimo', timestamp: 'Há 1 hora' },
    ]);
    expect(toComment({ ...comments[0], author_name: null }, NOW).authorName).toBe('[Autor]');
  });
});
