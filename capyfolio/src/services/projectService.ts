import { supabase } from '../lib/supabase';
import type { Json } from '../lib/database.types';
import type { Project, ProjectFile } from '../types';
import { check } from './errors';
import { toProject } from './mappers';

export type NewProject = {
  title: string;
  shortDescription: string;
  summary: string;
  keyResults: string[];
  methodology: string;
  institution: string;
  area: string;
  type: string;
  status: string;
  period: string;
  tags: string[];
  url?: string;
  mediaUrl?: string | null;
  /** Attachments: uploaded files and links (max 3). */
  files?: ProjectFile[];
};

export const projectService = {
  async list(): Promise<Project[]> {
    const rows = check(
      await supabase
        .from('projects_view')
        .select('*')
        .order('created_at', { ascending: false })
        .order('project_date', { ascending: false }),
      'projectService.list',
    );
    return rows.map(toProject);
  },

  async getById(id: string): Promise<Project | undefined> {
    const row = check(await supabase.from('projects_view').select('*').eq('id', id).maybeSingle(), 'projectService.getById');
    return row ? toProject(row) : undefined;
  },

  /** Creates a project owned by `authorId` (the signed-in profile) and lists them as its first author. */
  async create(input: NewProject, authorId: string): Promise<Project> {
    const created = check(
      await supabase
        .from('projects')
        .insert({
          created_by: authorId,
          title: input.title,
          short_description: input.shortDescription,
          summary: input.summary,
          key_results: input.keyResults,
          methodology: input.methodology,
          institution: input.institution,
          area: input.area,
          type: input.type,
          status: input.status,
          period: input.period,
          tags: input.tags,
          url: input.url || null,
          media_url: input.mediaUrl ?? null,
          files: (input.files ?? []) as unknown as Json,
        })
        .select('id')
        .single(),
      'projectService.create',
    );
    check(
      await supabase.from('project_authors').insert({ project_id: created.id, profile_id: authorId, position: 0 }),
      'projectService.create(authors)',
    );
    const saved = await projectService.getById(created.id);
    if (!saved) throw new Error('projectService.create: project not readable after insert');
    return saved;
  },

  async update(project: Project): Promise<Project> {
    check(
      await supabase
        .from('projects')
        .update({
          title: project.title,
          short_description: project.shortDescription,
          summary: project.summary,
          key_results: project.keyResults,
          methodology: project.methodology,
          institution: project.institution,
          area: project.area,
          type: project.type,
          status: project.status,
          period: project.period,
          tags: project.tags,
          url: project.url || null,
          media_url: project.media ?? null,
        })
        .eq('id', project.id)
        .select('id')
        .single(),
      'projectService.update',
    );
    return (await projectService.getById(project.id)) ?? project;
  },

  async remove(id: string): Promise<void> {
    check(await supabase.from('projects').delete().eq('id', id), 'projectService.remove');
  },
};
