create function public.pending_cards_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.cards c
  where c.status = 'pending'
    and public.is_admin();
$$;

revoke execute on function public.pending_cards_count from public, anon;
grant execute on function public.pending_cards_count to authenticated;
