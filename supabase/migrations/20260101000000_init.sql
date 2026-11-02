-- Portal SciBR: schema inicial

create extension if not exists unaccent with schema extensions;

create type public.card_area as enum (
  'Biológicas & Saúde',
  'Exatas & Terra',
  'Humanas & Sociais',
  'Engenharias & Tecnologia',
  'Multidisciplinar'
);

create type public.card_formato as enum (
  'Artigo',
  'Podcast',
  'Canal no YouTube',
  'Portal',
  'Newsletter',
  'Perfil em rede social',
  'Outro'
);

create type public.card_status as enum ('pending', 'approved', 'rejected');

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 3 and 120),
  descricao text not null check (char_length(descricao) between 10 and 500),
  area public.card_area not null,
  formato public.card_formato not null,
  instituicao_autor text check (char_length(instituicao_autor) <= 120),
  tags text[] not null default '{}' check (cardinality(tags) <= 8),
  link_original text not null check (link_original ~* '^https?://[^\s]+$' and char_length(link_original) <= 500),
  idioma text not null default 'pt-BR' check (idioma ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  status public.card_status not null default 'pending',
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  search tsvector
);

create unique index cards_link_original_key on public.cards (lower(link_original));
create index cards_search_idx on public.cards using gin (search);
create index cards_tags_idx on public.cards using gin (tags);
create index cards_status_created_idx on public.cards (status, created_at desc);

create or replace function public.cards_set_search() returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  new.search :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.titulo, ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(array_to_string(new.tags, ' '))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.instituicao_autor, ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.descricao, ''))), 'C');
  return new;
end;
$$;

create trigger cards_search_trg
before insert or update on public.cards
for each row execute function public.cards_set_search();

create or replace function public.is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.cards enable row level security;
alter table public.admins enable row level security;

create policy "public reads approved" on public.cards
  for select using (status = 'approved');

create policy "anyone submits pending" on public.cards
  for insert to anon, authenticated
  with check (status = 'pending' and reviewed_by is null and reviewed_at is null);

create policy "admins read all" on public.cards
  for select to authenticated using (public.is_admin());

create policy "admins update" on public.cards
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins delete" on public.cards
  for delete to authenticated using (public.is_admin());

create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Busca pública: texto livre + filtros. Retorna o total em cada linha.
create or replace function public.search_cards(
  q text default null,
  p_area public.card_area default null,
  p_formato public.card_formato default null,
  p_tags text[] default null,
  p_idioma text default null,
  p_sort text default 'relevance',
  p_limit int default 12,
  p_offset int default 0
) returns table (
  id uuid, titulo text, descricao text, area public.card_area, formato public.card_formato,
  instituicao_autor text, tags text[], link_original text, idioma text,
  created_at timestamptz, total bigint
)
language sql
stable
set search_path = public, extensions
as $$
  with params as (
    select
      nullif(btrim(q), '') as raw,
      case when nullif(btrim(q), '') is null then null
           else websearch_to_tsquery('portuguese', unaccent(btrim(q))) end as tsq
  )
  select c.id, c.titulo, c.descricao, c.area, c.formato, c.instituicao_autor, c.tags,
         c.link_original, c.idioma, c.created_at, count(*) over () as total
  from public.cards c, params p
  where c.status = 'approved'
    and (p.raw is null or c.search @@ p.tsq
         or unaccent(c.titulo) ilike '%' || unaccent(replace(replace(p.raw, '%', ''), '_', '')) || '%')
    and (p_area is null or c.area = p_area)
    and (p_formato is null or c.formato = p_formato)
    and (p_idioma is null or c.idioma = p_idioma)
    and (p_tags is null or cardinality(p_tags) = 0 or c.tags @> p_tags)
  order by
    case when p_sort = 'relevance' and p.tsq is not null then ts_rank(c.search, p.tsq) end desc nulls last,
    c.created_at desc
  limit least(greatest(p_limit, 1), 48)
  offset greatest(p_offset, 0)
$$;

grant execute on function public.search_cards to anon, authenticated;

-- Facetas para os filtros
create or replace function public.card_tags() returns table (tag text, uses bigint)
language sql stable as $$
  select t as tag, count(*) as uses
  from public.cards, unnest(tags) t
  where status = 'approved'
  group by t order by uses desc, t limit 60
$$;

grant execute on function public.card_tags to anon, authenticated;
