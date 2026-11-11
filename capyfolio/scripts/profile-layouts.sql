-- Varied portfolio layouts for the sample profiles (is_sample, not organisations), so profiles
-- look personal in demos: a hero widget, several grid widgets in different colours, badges.
-- Run once against the Supabase project after demo-seed.sql (SQL editor or MCP execute_sql).
-- Safe to run again: it rebuilds the layouts from each person's current projects.
--
-- Four templates, picked by the profile's position in name order. The grid has 4 columns and no
-- dense packing, so every template is ordered to fill whole rows:
--   P = 1×1, M = 2×1, G = 2×2, Faixa = full width.
-- At most two navy widgets per grid and never navy in the hero (rules in src/widgets/theme.ts).

do $$
declare
  rec record;
  p1 uuid;
  p2 uuid;
  kr int;
  n_projects int;
  hero jsonb;
  grid jsonb;
  about_title text;
  about_text text;
  i int := 0;
begin
  for rec in
    select p.id, p.name, p.focus, p.tags, p.badges, p.bio
      from public.profiles p
     where p.is_sample and not p.is_organization
     order by p.name
  loop
    -- The person's projects, most favourited first.
    select count(*) into n_projects from public.project_authors where profile_id = rec.id;
    select pr.id, coalesce(array_length(pr.key_results, 1), 0)
      into p1, kr
      from public.project_authors pa join public.projects pr on pr.id = pa.project_id
     where pa.profile_id = rec.id
     order by pr.favorites_base desc, pr.created_at desc
     limit 1;
    select pr.id into p2
      from public.project_authors pa join public.projects pr on pr.id = pa.project_id
     where pa.profile_id = rec.id and pr.id <> p1
     order by pr.favorites_base desc
     limit 1;

    if p1 is null then
      continue;
    end if;

    -- Badges, so the badges widget has something to show. Only these four keys exist
    -- (BADGES in src/widgets/views/Badges.tsx); any other value is not shown.
    update public.profiles
       set badges = case i % 6
         when 0 then array['academic', 'tech', 'verified']
         when 1 then array['career', 'academic']
         when 2 then array['tech', 'career', 'verified']
         when 3 then array['academic', 'verified']
         when 4 then array['tech', 'academic', 'career', 'verified']
         else array['academic', 'career', 'tech'] end
     where id = rec.id;

    about_title := (array['O que estou buscando', 'Próximos passos', 'Sobre mim', 'Vamos conversar'])[1 + (i % 4)];
    about_text := case i % 4
      when 0 then 'Busco estágio e parcerias de pesquisa em ' || coalesce(rec.focus, 'projetos acadêmicos') || '. Gosto de projetos que saem do papel e chegam em quem precisa.'
      when 1 then 'Neste semestre quero publicar os resultados do meu projeto e abrir o código para outras universidades usarem.'
      when 2 then coalesce(rec.bio, 'Estudante apaixonado por pesquisa aplicada.')
      else 'Aberto a conversar sobre ' || array_to_string(rec.tags[1:3], ', ') || '. Me chama para trocar ideias ou montar uma equipe.'
    end;

    case i % 4
      when 0 then
        -- Hero: the main project with its photo. Grid: two results, about, links, badges.
        hero := jsonb_build_object('id', 'w-hero', 'type', 'pinnedProject', 'size', 'P',
          'theme', jsonb_build_object('bg', 'surface', 'accent', 'gold'), 'config', jsonb_build_object('projectId', p1));
        grid := jsonb_build_array(
          jsonb_build_object('id', 'w-1', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'greenTint', 'accent', 'green'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', 0)),
          jsonb_build_object('id', 'w-2', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'goldTint', 'accent', 'gold'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', least(1, kr - 1))),
          jsonb_build_object('id', 'w-3', 'type', 'freeText', 'size', 'M', 'theme', jsonb_build_object('bg', 'navy', 'accent', 'gold'),
            'config', jsonb_build_object('title', about_title, 'text', about_text)),
          jsonb_build_object('id', 'w-4', 'type', 'links', 'size', 'M', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'ink'),
            'config', jsonb_build_object('show', jsonb_build_array('github', 'linkedin', 'lattes'))),
          jsonb_build_object('id', 'w-5', 'type', 'badges', 'size', 'M', 'theme', jsonb_build_object('bg', 'paper', 'accent', 'green'),
            'config', '{}'::jsonb));
      when 1 then
        -- Hero: a headline result. Grid: big project with all photos, links and badges beside it, then about + result.
        hero := jsonb_build_object('id', 'w-hero', 'type', 'keyResult', 'size', 'P',
          'theme', jsonb_build_object('bg', 'greenTint', 'accent', 'green'), 'config', jsonb_build_object('projectId', p1, 'resultIndex', 0));
        grid := jsonb_build_array(
          jsonb_build_object('id', 'w-1', 'type', 'pinnedProject', 'size', 'G', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'navy'),
            'config', jsonb_build_object('projectId', p1)),
          jsonb_build_object('id', 'w-2', 'type', 'links', 'size', 'M', 'theme', jsonb_build_object('bg', 'navyTint', 'accent', 'navy'),
            'config', jsonb_build_object('show', jsonb_build_array('github', 'linkedin', 'lattes'))),
          jsonb_build_object('id', 'w-3', 'type', 'badges', 'size', 'M', 'theme', jsonb_build_object('bg', 'goldTint', 'accent', 'gold'),
            'config', '{}'::jsonb),
          jsonb_build_object('id', 'w-4', 'type', 'freeText', 'size', 'M', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'green'),
            'config', jsonb_build_object('title', about_title, 'text', about_text)),
          jsonb_build_object('id', 'w-5', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'navy', 'accent', 'gold'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', least(1, kr - 1))),
          jsonb_build_object('id', 'w-6', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'paper', 'accent', 'ink'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', kr - 1)));
      when 2 then
        -- Hero: badges. Grid: big project, about beside it, a result and links under that.
        hero := jsonb_build_object('id', 'w-hero', 'type', 'badges', 'size', 'M',
          'theme', jsonb_build_object('bg', 'goldTint', 'accent', 'gold'), 'config', '{}'::jsonb);
        grid := jsonb_build_array(
          jsonb_build_object('id', 'w-1', 'type', 'pinnedProject', 'size', 'G', 'theme', jsonb_build_object('bg', 'greenTint', 'accent', 'green'),
            'config', jsonb_build_object('projectId', p1)),
          jsonb_build_object('id', 'w-2', 'type', 'freeText', 'size', 'M', 'theme', jsonb_build_object('bg', 'navy', 'accent', 'gold'),
            'config', jsonb_build_object('title', about_title, 'text', about_text)),
          jsonb_build_object('id', 'w-3', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'navy'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', 0)),
          jsonb_build_object('id', 'w-4', 'type', 'links', 'size', 'P', 'theme', jsonb_build_object('bg', 'paper', 'accent', 'ink'),
            'config', jsonb_build_object('show', jsonb_build_array('github', 'linkedin'))));
      else
        -- Hero: the main project on a tint. Grid: a large "about", results and badges beside it.
        hero := jsonb_build_object('id', 'w-hero', 'type', 'pinnedProject', 'size', 'P',
          'theme', jsonb_build_object('bg', 'navyTint', 'accent', 'navy'), 'config', jsonb_build_object('projectId', p1));
        grid := jsonb_build_array(
          jsonb_build_object('id', 'w-1', 'type', 'freeText', 'size', 'G', 'theme', jsonb_build_object('bg', 'goldTint', 'accent', 'ink'),
            'config', jsonb_build_object('title', about_title, 'text', about_text)),
          jsonb_build_object('id', 'w-2', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'greenTint', 'accent', 'green'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', 0)),
          jsonb_build_object('id', 'w-3', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'navy', 'accent', 'gold'),
            'config', jsonb_build_object('projectId', p1, 'resultIndex', kr - 1)),
          jsonb_build_object('id', 'w-4', 'type', 'badges', 'size', 'M', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'gold'),
            'config', '{}'::jsonb),
          jsonb_build_object('id', 'w-5', 'type', 'links', 'size', 'M', 'theme', jsonb_build_object('bg', 'paper', 'accent', 'navy'),
            'config', jsonb_build_object('show', jsonb_build_array('github', 'linkedin', 'lattes'))));
    end case;

    -- A second project gets its own spot, plus the gallery for everything else.
    if p2 is not null then
      grid := grid || jsonb_build_array(
        jsonb_build_object('id', 'w-7', 'type', 'pinnedProject', 'size', 'M', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'green'),
          'config', jsonb_build_object('projectId', p2)));
      if n_projects >= 3 then
        grid := grid || jsonb_build_array(
          jsonb_build_object('id', 'w-8', 'type', 'projectGallery', 'size', 'Faixa', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'navy'),
            'config', jsonb_build_object('status', 'all')));
      end if;
    end if;

    update public.profiles
       set profile_layout = jsonb_build_object('version', 1, 'hero', hero, 'widgets', grid),
           featured_project_id = p1
     where id = rec.id;
    i := i + 1;
  end loop;
end;
$$;

-- The demo account gets a hand-made layout: its own project (with photo) in the hero.
update public.profiles
   set badges = array['academic', 'tech', 'career', 'verified'],
       featured_project_id = '91dd2365-3814-4314-b6e6-336d8260b6b9',
       profile_layout = jsonb_build_object('version', 1,
         'hero', jsonb_build_object('id', 'w-hero', 'type', 'pinnedProject', 'size', 'P', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'gold'),
           'config', jsonb_build_object('projectId', '91dd2365-3814-4314-b6e6-336d8260b6b9')),
         'widgets', jsonb_build_array(
           jsonb_build_object('id', 'w-1', 'type', 'pinnedProject', 'size', 'G', 'theme', jsonb_build_object('bg', 'greenTint', 'accent', 'green'),
             'config', jsonb_build_object('projectId', 'e635a45e-0413-4f28-9129-905a6cf1ff01')),
           jsonb_build_object('id', 'w-2', 'type', 'freeText', 'size', 'M', 'theme', jsonb_build_object('bg', 'navy', 'accent', 'gold'),
             'config', jsonb_build_object('title', 'O que estou buscando', 'text', 'Estágio em visão computacional ou design de produto a partir de 2027. Quero construir tecnologia que deixe a cidade mais acessível para todo mundo.')),
           jsonb_build_object('id', 'w-3', 'type', 'keyResult', 'size', 'P', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'navy'),
             'config', jsonb_build_object('projectId', '91dd2365-3814-4314-b6e6-336d8260b6b9', 'resultIndex', 0)),
           jsonb_build_object('id', 'w-4', 'type', 'links', 'size', 'P', 'theme', jsonb_build_object('bg', 'paper', 'accent', 'ink'),
             'config', jsonb_build_object('show', jsonb_build_array('github', 'linkedin'))),
           jsonb_build_object('id', 'w-5', 'type', 'pinnedProject', 'size', 'M', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'green'),
             'config', jsonb_build_object('projectId', 'a5a6f7c9-0e2e-4e0a-a14f-d52bbb1140f1')),
           jsonb_build_object('id', 'w-6', 'type', 'badges', 'size', 'M', 'theme', jsonb_build_object('bg', 'goldTint', 'accent', 'gold'), 'config', '{}'::jsonb),
           jsonb_build_object('id', 'w-7', 'type', 'projectGallery', 'size', 'Faixa', 'theme', jsonb_build_object('bg', 'surface', 'accent', 'navy'),
             'config', jsonb_build_object('status', 'all'))))
 where id = '2fac2abc-9a3b-46e4-a1e3-b464672e5edb';

update public.profiles set hero_color = 'green' where name = 'Arthur' and is_sample;
