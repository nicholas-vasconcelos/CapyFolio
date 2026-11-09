-- Education level and status for the sign-up "Formação" step: the level (and status) is asked
-- first and the other questions follow from it. Keys match lib/profileOptions.ts.

alter table public.profiles
  add column if not exists education_level text,
  add column if not exists education_status text;

alter table public.profiles drop constraint if exists profiles_education_level_check;
alter table public.profiles add constraint profiles_education_level_check
  check (education_level is null or education_level in ('none', 'bachelor', 'licentiate', 'technologist', 'masters', 'doctorate'));

alter table public.profiles drop constraint if exists profiles_education_status_check;
alter table public.profiles add constraint profiles_education_status_check
  check (education_status is null or education_status in ('in_progress', 'completed'));

-- Users edit their own education in the account settings dialog (column-level grants).
grant update (education_level, education_status) on public.profiles to authenticated;

-- Expose the new columns (appended at the end, as create or replace view requires).
create or replace view public.profiles_view with (security_invoker = true) as
select id,
    name,
    role,
    focus,
    institution,
    short_institution,
    course,
    period,
    location,
    bio,
    tags,
    badges,
    avatar_url,
    github,
    linkedin,
    lattes,
    featured_project_id,
    profile_layout,
    is_organization,
    is_sample,
    created_at,
    connections_base + private.profile_connection_count(id) as connections,
    user_id is not null and user_id = (select auth.uid() as uid) as is_me,
    education_level,
    education_status
   from public.profiles p;

-- Sign-up: same as before, plus education_level / education_status from the metadata.
create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  claimed_id uuid;
  v_institution text := nullif(trim(meta->>'institution'), '');
  v_short text;
  v_avatar text := meta->>'avatar_url';
  v_tags text[] := '{}';
  v_level text := meta->>'education_level';
  v_status text := meta->>'education_status';
begin
  -- 1. Attach to an imported, unclaimed profile with the same email.
  if new.email is not null then
    update public.profiles p
       set user_id = new.id, claimed = true
      from public.profile_claims c
     where c.profile_id = p.id
       and c.email = lower(new.email)
       and p.claimed = false
       and p.user_id is null
    returning p.id into claimed_id;
  end if;

  if claimed_id is not null then
    return new;
  end if;

  -- 2. Otherwise create a fresh profile from sign-up metadata. Nothing is invented: empty stays empty.
  if jsonb_typeof(meta->'tags') = 'array' then
    select coalesce(array_agg(left(trim(t), 32)), '{}')
      into v_tags
      from (select t from jsonb_array_elements_text(meta->'tags') as t where trim(t) <> '' limit 12) s;
  end if;

  -- Only the bundled default silhouettes are accepted here; uploaded photos are set after sign-up.
  if v_avatar is null or v_avatar !~ '^/default-avatars/(navy|green|gold|navy-tint|green-tint|gold-tint)\.svg$' then
    v_avatar := null;
  end if;

  -- Unknown values are dropped instead of failing the sign-up.
  if v_level is null or v_level not in ('none', 'bachelor', 'licentiate', 'technologist', 'masters', 'doctorate') then
    v_level := null;
  end if;
  if v_status is null or v_status not in ('in_progress', 'completed') or v_level = 'none' then
    v_status := null;
  end if;

  -- "Universidade Federal Fluminense (UFF)" -> "UFF"; otherwise the first word ("Ibmec Rio" -> "Ibmec").
  v_short := coalesce(substring(v_institution from '\(([^)]{1,20})\)\s*$'), split_part(v_institution, ' ', 1), '');

  insert into public.profiles (
    user_id, claimed, name, focus, institution, short_institution, course, period,
    bio, tags, avatar_url, github, linkedin, lattes, connections_base, education_level, education_status
  ) values (
    new.id,
    true,
    coalesce(nullif(trim(meta->>'name'), ''), split_part(coalesce(new.email, 'Estudante'), '@', 1)),
    coalesce(trim(meta->>'focus'), ''),
    coalesce(v_institution, ''),
    v_short,
    nullif(trim(meta->>'course'), ''),
    nullif(trim(meta->>'period'), ''),
    nullif(trim(meta->>'bio'), ''),
    v_tags,
    v_avatar,
    '', '', '',
    0,
    v_level,
    v_status
  );
  return new;
end;
$function$;
