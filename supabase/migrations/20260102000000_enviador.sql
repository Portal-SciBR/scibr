-- Dados públicos de identificação/contato de quem enviou o card

alter table public.cards
  add column enviador_nome text check (char_length(enviador_nome) between 2 and 100),
  add column enviador_email text check (enviador_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(enviador_email) <= 150),
  add column enviador_telefone text check (enviador_telefone ~ '^\+?[0-9 ()-]{8,20}$'),
  add column enviador_instagram text check (enviador_instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  add column enviador_x text check (enviador_x ~ '^[A-Za-z0-9_]{1,15}$'),
  add column enviador_youtube text check (enviador_youtube ~* '^https://[^\s]+$' and char_length(enviador_youtube) <= 300),
  add column enviador_linkedin text check (enviador_linkedin ~* '^https://[^\s]+$' and char_length(enviador_linkedin) <= 300),
  add column enviador_site text check (enviador_site ~* '^https?://[^\s]+$' and char_length(enviador_site) <= 300),
  add column enviador_relacao text check (enviador_relacao in ('autor', 'instituicao', 'indicacao'));

-- Novos envios exigem nome e e-mail; cards antigos (seed) continuam editáveis.
create function public.cards_require_enviador() returns trigger
language plpgsql as $$
begin
  if new.enviador_nome is null or new.enviador_email is null then
    raise exception 'enviador_nome e enviador_email são obrigatórios';
  end if;
  return new;
end;
$$;

create trigger cards_require_enviador_trg
before insert on public.cards
for each row execute function public.cards_require_enviador();

drop function if exists public.search_cards(text, public.card_area, public.card_formato, text[], text, text, int, int);

create function public.search_cards(
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
  created_at timestamptz,
  enviador_nome text, enviador_email text, enviador_telefone text,
  enviador_instagram text, enviador_x text, enviador_youtube text,
  enviador_linkedin text, enviador_site text, enviador_relacao text,
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
         c.enviador_nome, c.enviador_email, c.enviador_telefone,
         c.enviador_instagram, c.enviador_x, c.enviador_youtube,
         c.enviador_linkedin, c.enviador_site, c.enviador_relacao,
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

grant execute on function public.search_cards to anon, authenticated;
