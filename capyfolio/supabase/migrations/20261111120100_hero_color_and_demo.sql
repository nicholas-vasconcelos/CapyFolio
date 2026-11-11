-- 1. Profile hero colour: the owner picks the hero background from the design palette.
--    null = navy (the default). Keys match HERO_COLORS in src/lib/heroColors.ts.

alter table public.profiles
  add column if not exists hero_color text;

alter table public.profiles drop constraint if exists profiles_hero_color_check;
alter table public.profiles add constraint profiles_hero_color_check
  check (hero_color is null or hero_color in ('navy', 'green', 'ink', 'gold', 'green-tint', 'gold-tint'));

grant select (hero_color), update (hero_color) on public.profiles to authenticated;

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
    education_status,
    hero_color
   from public.profiles p;

-- 2. Demo account: a shared login shown on the login page. Its password ships in the app,
--    so the database refuses every write it makes. The app simulates writes in memory instead.
--    The account is marked with app_metadata.demo = true, which users cannot change.

create or replace function private.is_demo()
returns boolean
language sql
stable
set search_path to ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'demo')::boolean, false);
$$;

grant execute on function private.is_demo() to authenticated, anon;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'projects', 'project_authors', 'project_favorites', 'posts', 'post_likes',
    'comments', 'events', 'event_registrations', 'connections', 'profile_claims'
  ] loop
    execute format('drop policy if exists demo_no_insert on public.%I', t);
    execute format('drop policy if exists demo_no_update on public.%I', t);
    execute format('drop policy if exists demo_no_delete on public.%I', t);
    execute format('create policy demo_no_insert on public.%I as restrictive for insert to authenticated with check (not private.is_demo())', t);
    execute format('create policy demo_no_update on public.%I as restrictive for update to authenticated using (not private.is_demo())', t);
    execute format('create policy demo_no_delete on public.%I as restrictive for delete to authenticated using (not private.is_demo())', t);
  end loop;
end;
$$;

drop policy if exists capyfolio_demo_no_insert on storage.objects;
drop policy if exists capyfolio_demo_no_update on storage.objects;
drop policy if exists capyfolio_demo_no_delete on storage.objects;
create policy capyfolio_demo_no_insert on storage.objects as restrictive for insert to authenticated with check (not private.is_demo());
create policy capyfolio_demo_no_update on storage.objects as restrictive for update to authenticated using (not private.is_demo());
create policy capyfolio_demo_no_delete on storage.objects as restrictive for delete to authenticated using (not private.is_demo());

-- Anyone signed in as the demo can call auth.updateUser; keep its email, password and flags fixed
-- so nobody can lock the shared account.
create or replace function private.keep_demo_credentials()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if coalesce((old.raw_app_meta_data ->> 'demo')::boolean, false) then
    new.email := old.email;
    new.phone := old.phone;
    new.encrypted_password := old.encrypted_password;
    new.raw_app_meta_data := old.raw_app_meta_data;
    new.email_change := old.email_change;
    new.email_change_token_new := old.email_change_token_new;
    new.email_change_token_current := old.email_change_token_current;
    new.raw_user_meta_data := old.raw_user_meta_data;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_keep_demo on auth.users;
create trigger on_auth_user_keep_demo
  before update on auth.users
  for each row execute function private.keep_demo_credentials();
