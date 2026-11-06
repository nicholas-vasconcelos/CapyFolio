export interface User {
  id: string;
  name: string;
  role?: string;
  focus: string;
  institution: string;
  shortInstitution?: string;
  course?: string;
  period?: string;
  location?: string;
  bio?: string;
  tags: string[];
  badges?: string[];
  avatar?: string;
  featuredProjectId?: string | null;
  email: string;
  password?: string;
  github?: string;
  linkedin?: string;
  lattes?: string;
  connections?: number;
  profileLayout?: ProfileLayout;
}

export interface ProjectFile {
  name: string;
  size: string;
  type: string;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  topic?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  speaker?: string;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  summary: string;
  keyResults: string[];
  methodology: string;
  files: ProjectFile[];
  authorIds: string[];
  authorNames: string;
  institution: string;
  area: string;
  type: string;
  status: string;
  date: string;
  period: string;
  tags: string[];
  url?: string;
  visualType?: string;
  media?: string;
  favorites?: number;
}

export interface Event {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  location: string;
  city: string;
  organizer: string;
  modality: string;
  tags: string[];
  shortDescription: string;
  aboutText: string;
  speakers: Speaker[];
  schedule: ScheduleItem[];
  attendeesCount: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorInstitution: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorInstitution: string;
  authorAvatar: string;
  isOrganization: boolean;
  category: string;
  timestamp: string;
  content: string;
  relatedProjectId?: string | null;
  relatedEventId?: string | null;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
}

export type AuthRegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  institution: string;
  course: string;
  period: string;
  focus: string;
  tags: string[];
  bio: string;
};

/* Profile widgets */

export type WidgetType = 'pinnedProject' | 'projectGallery' | 'keyResult' | 'links' | 'badges' | 'freeText';
/** P = 1×1, M = 2×1, G = 2×2, Faixa = full width of the grid. */
export type WidgetSize = 'P' | 'M' | 'G' | 'Faixa';
export type WidgetBg = 'surface' | 'paper' | 'navyTint' | 'greenTint' | 'goldTint' | 'navy';
export type WidgetAccent = 'navy' | 'green' | 'gold' | 'ink';

export interface WidgetTheme {
  bg: WidgetBg;
  accent: WidgetAccent;
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  theme: WidgetTheme;
  /** Validated per widget type by sanitizeLayout. */
  config: Record<string, unknown>;
}

export interface ProfileLayout {
  version: 1;
  /** Top-right slot of the profile hero. null = empty, which is allowed. */
  hero: WidgetInstance | null;
  /** Body grid, in display order. */
  widgets: WidgetInstance[];
}
