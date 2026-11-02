-- LGPD: minimização, consentimento registrado e contato revelado só sob demanda

alter table public.cards
  add column consentimento_em timestamptz,
  add column consentimento_versao text;

-- Novos envios exigem nome, e-mail e consentimento; o servidor carimba a data.
create or replace function public.cards_require_enviador() returns trigger
language plpgsql as $$
begin
  if new.enviador_nome is null or new.enviador_email is null then
    raise exception 'enviador_nome e enviador_email são obrigatórios';
  end if;
  if new.consentimento_versao is null then
    raise exception 'consentimento é obrigatório';
  end if;
  new.consentimento_em := now();
  return new;
end;
$$;

-- E-mail e telefone deixam de ser legíveis pelas roles de API.
revoke select on public.cards from anon, authenticated;
grant select (
  id, titulo, descricao, area, formato, instituicao_autor, tags, link_original,
  idioma, status, created_at, search,
  enviador_nome, enviador_instagram, enviador_x, enviador_youtube,
  enviador_linkedin, enviador_site, enviador_relacao
) on public.cards to anon, authenticated;

-- Busca pública sem e-mail/telefone.
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
  enviador_nome text, enviador_instagram text, enviador_x text,
  enviador_youtube text, enviador_linkedin text, enviador_site text,
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

grant execute on function public.search_cards to anon, authenticated;

-- Listagem do painel: única via de leitura dos dados completos (só admins).
create function public.admin_cards(
  p_status public.card_status default null,
  p_q text default null
) returns setof public.cards
language sql
stable
security definer
set search_path = public
as $$
  select c.*
  from public.cards c
  where public.is_admin()
    and (p_status is null or c.status = p_status)
    and (
      nullif(btrim(p_q), '') is null
      or c.titulo ilike '%' || replace(replace(replace(btrim(p_q), '\', '\\'), '%', '\%'), '_', '\_') || '%'
      or c.link_original ilike '%' || replace(replace(replace(btrim(p_q), '\', '\\'), '%', '\%'), '_', '\_') || '%'
    )
  order by c.created_at desc
  limit 200
$$;

revoke execute on function public.admin_cards from public, anon;
grant execute on function public.admin_cards to authenticated;

-- Revelação de contato sob demanda, com limite por IP (hash, apagado em 24h).
create table public.contact_reveals (
  ip_hash bytea not null,
  at timestamptz not null default now()
);
create index contact_reveals_idx on public.contact_reveals (ip_hash, at);
alter table public.contact_reveals enable row level security;

create function public.reveal_contact(p_id uuid)
returns table (email text, telefone text)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  hdr json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  h bytea := sha256(convert_to(coalesce(hdr->>'cf-connecting-ip', hdr->>'x-forwarded-for', 'unknown'), 'utf8'));
begin
  delete from public.contact_reveals where at < now() - interval '1 day';
  if (select count(*) from public.contact_reveals where ip_hash = h and at > now() - interval '1 hour') >= 30 then
    raise exception 'rate_limited';
  end if;
  insert into public.contact_reveals (ip_hash) values (h);
  return query
    select c.enviador_email, c.enviador_telefone
    from public.cards c
    where c.id = p_id and c.status = 'approved';
end;
$$;

revoke execute on function public.reveal_contact from public;
grant execute on function public.reveal_contact to anon, authenticated;
