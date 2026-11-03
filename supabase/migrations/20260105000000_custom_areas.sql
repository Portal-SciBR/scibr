drop function public.search_cards(
  text,
  public.card_area,
  public.card_formato,
  text[],
  text,
  text,
  integer,
  integer
);

alter table public.cards
  alter column area type text using area::text,
  add constraint cards_area_length_check
    check (char_length(btrim(area)) between 2 and 80);

create function public.search_cards(
  q text default null,
  p_area text default null,
  p_formato public.card_formato default null,
  p_tags text[] default null,
  p_idioma text default null,
  p_sort text default 'relevance',
  p_limit int default 12,
  p_offset int default 0
) returns table (
  id uuid,
  titulo text,
  descricao text,
  area text,
  formato public.card_formato,
  instituicao_autor text,
  tags text[],
  link_original text,
  idioma text,
  created_at timestamptz,
  enviador_nome text,
  enviador_instagram text,
  enviador_x text,
  enviador_youtube text,
  enviador_linkedin text,
  enviador_site text,
  enviador_relacao text,
  total bigint
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
         c.link_original, c.idioma, c.created_at,
         c.enviador_nome, c.enviador_instagram, c.enviador_x,
         c.enviador_youtube, c.enviador_linkedin, c.enviador_site,
         c.enviador_relacao,
         count(*) over () as total
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

grant execute on function public.search_cards(
  text,
  text,
  public.card_formato,
  text[],
  text,
  text,
  integer,
  integer
) to anon, authenticated;

create function public.card_areas()
returns table (area text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct btrim(c.area) as area
  from public.cards c
  where nullif(btrim(c.area), '') is not null
  order by btrim(c.area);
$$;

revoke execute on function public.card_areas from public;
grant execute on function public.card_areas to anon, authenticated;
