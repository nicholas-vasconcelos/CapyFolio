-- Server-side content check for text other people see. Mirrors src/lib/contentRules.ts
-- (keep the two word lists in sync). The browser check gives instant feedback; this one
-- makes sure it cannot be skipped by calling the API directly.
--
-- Refused writes raise 'blocked_content' (SQLSTATE 23514); the app maps that message
-- to a pt-BR toast (isBlockedContentError).
--
-- Only values that change are checked, so existing rows can still be updated
-- (likes, featured project…) without re-checking old text.

create or replace function private.normalize_for_matching(input text)
returns text
language sql
immutable
set search_path to ''
as $$
  select trim(regexp_replace(
    translate(
      lower(coalesce(input, '')),
      'áàâãäåéèêëíìîïóòôõöúùûüçñ013457@$',
      'aaaaaaeeeeiiiiooooouuuucnoieastas'
    ),
    '[^a-z]+', ' ', 'g'
  ));
$$;

create or replace function private.contains_blocked_term(input text)
returns boolean
language plpgsql
immutable
set search_path to ''
as $$
declare
  -- Same lists as BLOCKED_WORDS / BLOCKED_PHRASES in src/lib/contentRules.ts.
  blocked_words text[] := array[
    'porra','caralho','karalho','krl','crl','merda','bosta','foda','fodase','foder','fuder',
    'fodido','fodida','fudido','fudida','puta','puto','putas','putaria','cu','cuzao','cuzinho',
    'buceta','boceta','xoxota','xereca','piroca','punheta','boquete','siririca','arrombado',
    'arrombada','caceta','escroto','escrota',
    'fdp','pqp','vsf','vtnc','tnc','tmnc',
    'otario','otaria','babaca','imbecil','idiota','cretino','cretina','retardado','retardada',
    'mongoloide','corno','vagabundo','vagabunda','viado','viadinho','bicha','bichinha',
    'sapatao','traveco','baitola','boiola','macumbeiro','favelado',
    'fuck','fucking','fucker','motherfucker','shit','bullshit','bitch','asshole','cunt',
    'whore','slut','retard','faggot','fag','nigger','nigga'
  ];
  blocked_phrases text[] := array[
    'filho da puta','vai se foder','vai tomar no cu','tomar no cu','vai se fuder','puta que pariu',
    'son of a bitch'
  ];
  collapsed text;
begin
  if input is null or input = '' then
    return false;
  end if;

  -- Collapse runs of the same letter on both sides: "porraaa" and "porra" both become "pora".
  select string_agg(regexp_replace(w, '(.)\1+', '\1', 'g'), ' ')
    into collapsed
    from regexp_split_to_table(private.normalize_for_matching(input), ' ') as w
   where w <> '';

  if collapsed is null then
    return false;
  end if;

  if exists (
    select 1
      from unnest(string_to_array(collapsed, ' ')) as word
      join unnest(blocked_words) as b on word = regexp_replace(b, '(.)\1+', '\1', 'g')
  ) then
    return true;
  end if;

  return exists (
    select 1
      from unnest(blocked_phrases) as phrase
     where (' ' || collapsed || ' ') like
           ('% ' || (select string_agg(regexp_replace(p, '(.)\1+', '\1', 'g'), ' ')
                       from regexp_split_to_table(phrase, ' ') as p) || ' %')
  );
end;
$$;

-- Raises when any of the given texts is blocked.
create or replace function private.assert_clean(variadic texts text[])
returns void
language plpgsql
immutable
set search_path to ''
as $$
declare
  t text;
begin
  foreach t in array texts loop
    if private.contains_blocked_term(t) then
      raise exception 'blocked_content' using errcode = 'check_violation';
    end if;
  end loop;
end;
$$;

-- String values inside a jsonb document (profile_layout: "Texto livre" titles and bodies).
create or replace function private.jsonb_strings(doc jsonb)
returns text
language sql
immutable
set search_path to ''
as $$
  select coalesce(string_agg(v #>> '{}', ' '), '')
    from jsonb_path_query(coalesce(doc, 'null'::jsonb), 'strict $.**') as v
   where jsonb_typeof(v) = 'string';
$$;

-- posts.content
create or replace function private.check_post_content()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if tg_op = 'INSERT' or new.content is distinct from old.content then
    perform private.assert_clean(new.content);
  end if;
  return new;
end;
$$;

drop trigger if exists posts_check_content on public.posts;
create trigger posts_check_content
  before insert or update on public.posts
  for each row execute function private.check_post_content();

-- comments.text
create or replace function private.check_comment_content()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if tg_op = 'INSERT' or new.text is distinct from old.text then
    perform private.assert_clean(new.text);
  end if;
  return new;
end;
$$;

drop trigger if exists comments_check_content on public.comments;
create trigger comments_check_content
  before insert or update on public.comments
  for each row execute function private.check_comment_content();

-- projects: every free-text column
create or replace function private.check_project_content()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if tg_op = 'INSERT'
     or new.title is distinct from old.title
     or new.short_description is distinct from old.short_description
     or new.summary is distinct from old.summary
     or new.methodology is distinct from old.methodology
     or new.area is distinct from old.area
     or new.type is distinct from old.type
     or new.period is distinct from old.period
     or new.key_results is distinct from old.key_results
     or new.tags is distinct from old.tags then
    perform private.assert_clean(
      new.title, new.short_description, new.summary, new.methodology, new.area, new.type, new.period,
      array_to_string(new.key_results, ' '), array_to_string(new.tags, ' ')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists projects_check_content on public.projects;
create trigger projects_check_content
  before insert or update on public.projects
  for each row execute function private.check_project_content();

-- profiles: the fields shown on the profile and cards, plus "Texto livre" in profile_layout
create or replace function private.check_profile_content()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if tg_op = 'INSERT'
     or new.name is distinct from old.name
     or new.focus is distinct from old.focus
     or new.institution is distinct from old.institution
     or new.short_institution is distinct from old.short_institution
     or new.course is distinct from old.course
     or new.location is distinct from old.location
     or new.bio is distinct from old.bio
     or new.tags is distinct from old.tags
     or new.profile_layout is distinct from old.profile_layout then
    perform private.assert_clean(
      new.name, new.focus, new.institution, new.short_institution, new.course, new.location, new.bio,
      array_to_string(new.tags, ' '), private.jsonb_strings(new.profile_layout)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_check_content on public.profiles;
create trigger profiles_check_content
  before insert or update on public.profiles
  for each row execute function private.check_profile_content();

-- Length caps for posts and comments (the forms enforce the same limits).
-- NOT VALID: existing rows are not re-checked, new writes are.
alter table public.posts drop constraint if exists posts_content_length;
alter table public.posts add constraint posts_content_length check (char_length(content) <= 2000) not valid;

alter table public.comments drop constraint if exists comments_text_length;
alter table public.comments add constraint comments_text_length check (char_length(text) <= 500) not valid;
