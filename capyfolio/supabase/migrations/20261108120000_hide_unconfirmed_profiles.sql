-- Only people who confirmed their e-mail appear in Pessoas, search and anywhere else
-- profiles are listed. handle_new_user creates the profile at sign-up, before the
-- e-mail is confirmed, so visibility needs its own flag.
--
-- Visible: sample/imported profiles (user_id is null), confirmed accounts, and your own row.

alter table public.profiles
  add column if not exists email_confirmed boolean not null default false;

-- Backfill from auth.users.
update public.profiles p
   set email_confirmed = true
  from auth.users u
 where u.id = p.user_id
   and u.email_confirmed_at is not null
   and p.email_confirmed = false;

-- Keep the flag in sync with auth.users. Runs after on_auth_user_created (triggers fire
-- in name order), so the profile already exists on insert.
create or replace function private.sync_profile_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  update public.profiles
     set email_confirmed = (new.email_confirmed_at is not null)
   where user_id = new.id
     and email_confirmed is distinct from (new.email_confirmed_at is not null);
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after insert or update of email_confirmed_at on auth.users
  for each row execute function private.sync_profile_email_confirmed();

-- Users may update their own profile row (profiles_update_own), so stop them from
-- flipping the flag themselves. The sync trigger runs as the function owner, not as
-- authenticated/anon, so it is not affected.
create or replace function private.keep_email_confirmed()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.email_confirmed := old.email_confirmed;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_keep_email_confirmed on public.profiles;
create trigger profiles_keep_email_confirmed
  before update on public.profiles
  for each row execute function private.keep_email_confirmed();

-- profiles_view is security_invoker, so this policy also filters the view.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  using (
    user_id is null
    or email_confirmed
    or user_id = (select auth.uid())
  );
