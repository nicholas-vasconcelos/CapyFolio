-- Photos on posts (up to 4), projects (up to 3) and an optional cover photo on events.
-- Images are public URLs: uploads go to the existing public `project-media` bucket, sample rows
-- point at stock photos. projects.media_url stays as the cover and mirrors images[1].

alter table public.posts
  add column if not exists images text[] not null default '{}';
alter table public.posts drop constraint if exists posts_images_max;
alter table public.posts add constraint posts_images_max check (coalesce(array_length(images, 1), 0) <= 4);

alter table public.projects
  add column if not exists images text[] not null default '{}';
alter table public.projects drop constraint if exists projects_images_max;
alter table public.projects add constraint projects_images_max check (coalesce(array_length(images, 1), 0) <= 3);

alter table public.events
  add column if not exists cover_url text;

-- Existing projects with a cover get it as their first photo.
update public.projects
   set images = array[media_url]
 where media_url is not null and images = '{}';

-- Expose the new columns (appended at the end, as create or replace view requires).
create or replace view public.posts_view with (security_invoker = true) as
select po.id,
    po.author_id,
    po.category,
    po.content,
    po.related_project_id,
    po.related_event_id,
    po.is_sample,
    po.created_at,
    au.name as author_name,
    coalesce(au.role, nullif(concat_ws(' • ', au.course, au.period), '')) as author_role,
    coalesce(nullif(au.short_institution, ''), au.institution) as author_institution,
    au.avatar_url as author_avatar,
    au.is_organization,
    (po.likes_base + private.post_like_count(po.id)) as likes,
    (exists (select 1 from public.post_likes l
              where l.post_id = po.id and l.profile_id = (select public.current_profile_id()))) as liked_by_me,
    po.images
   from public.posts po
     join public.profiles au on au.id = po.author_id;

create or replace view public.projects_view with (security_invoker = true) as
select pr.id,
    pr.created_by,
    pr.title,
    pr.short_description,
    pr.summary,
    pr.key_results,
    pr.methodology,
    pr.files,
    pr.institution,
    pr.area,
    pr.type,
    pr.status,
    pr.project_date,
    pr.period,
    pr.tags,
    pr.url,
    pr.visual_type,
    pr.media_url,
    pr.is_sample,
    pr.created_at,
    coalesce(a.author_ids, '{}'::uuid[]) as author_ids,
    coalesce(a.author_names, '') as author_names,
    (pr.favorites_base + private.project_favorite_count(pr.id)) as favorites,
    pr.images
   from public.projects pr
     left join lateral (
       select array_agg(pa.profile_id order by pa."position", p.name) as author_ids,
              string_agg(p.name, ', ' order by pa."position", p.name) as author_names
         from public.project_authors pa
         join public.profiles p on p.id = pa.profile_id
        where pa.project_id = pr.id) a on true;

create or replace view public.events_view with (security_invoker = true) as
select id,
    title,
    category,
    status,
    starts_at,
    ends_at,
    location,
    city,
    organizer,
    modality,
    tags,
    short_description,
    about_text,
    speakers,
    schedule,
    is_sample,
    created_at,
    (attendees_base + private.event_registration_count(id)) as attendees_count,
    cover_url
   from public.events e;

-- Inserts and updates use column-level grants.
grant insert (images), update (images) on public.posts to authenticated;
grant insert (images), update (images) on public.projects to authenticated;
grant select (images) on public.posts to authenticated;
grant select (images) on public.projects to authenticated;
grant select (cover_url) on public.events to authenticated;
