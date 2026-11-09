-- Project attachments: up to 3 per project, each a file of at most 10 MB in the
-- project-files bucket or a link to an allowed site (checked in the app, lib/projectRules.ts).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  true,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'text/csv'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Same rules as the image buckets: users write only inside their own folder (<auth uid>/...).
drop policy if exists capyfolio_media_insert_own_folder on storage.objects;
create policy capyfolio_media_insert_own_folder on storage.objects
  for insert to authenticated
  with check (
    bucket_id = any (array['avatars', 'project-media', 'project-files'])
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists capyfolio_media_update_own_folder on storage.objects;
create policy capyfolio_media_update_own_folder on storage.objects
  for update to authenticated
  using (
    bucket_id = any (array['avatars', 'project-media', 'project-files'])
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = any (array['avatars', 'project-media', 'project-files'])
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists capyfolio_media_delete_own_folder on storage.objects;
create policy capyfolio_media_delete_own_folder on storage.objects
  for delete to authenticated
  using (
    bucket_id = any (array['avatars', 'project-media', 'project-files'])
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists capyfolio_media_select_own_folder on storage.objects;
create policy capyfolio_media_select_own_folder on storage.objects
  for select to authenticated
  using (
    bucket_id = any (array['avatars', 'project-media', 'project-files'])
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Limits the new-project form enforces, also enforced here. NOT VALID: existing rows are not re-checked.
alter table public.projects drop constraint if exists projects_files_max;
alter table public.projects add constraint projects_files_max
  check (jsonb_typeof(files) = 'array' and jsonb_array_length(files) <= 3) not valid;

alter table public.projects drop constraint if exists projects_key_results_max;
alter table public.projects add constraint projects_key_results_max
  check (coalesce(array_length(key_results, 1), 0) <= 3) not valid;
