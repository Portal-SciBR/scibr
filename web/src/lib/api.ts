import { supabase } from './supabase'
import {
  PAGE_SIZE,
  type AdminCard,
  type Card,
  type Filters,
  type Status,
} from './types'
import type { EnviadorInput, SubmissionInput } from './schemas'
import { PRIVACY_VERSION } from './privacy'

export interface RevealedContact {
  email: string | null
  telefone: string | null
}

export async function revealContact(id: string): Promise<RevealedContact> {
  const { data, error } = await supabase.rpc('reveal_contact', { p_id: id })
  if (error) {
    if (error.message.includes('rate_limited'))
      throw new Error('Muitas consultas seguidas. Tente novamente mais tarde.')
    throw new Error('Não foi possível obter o contato agora.')
  }
  const row = (data as RevealedContact[] | null)?.[0]
  return { email: row?.email ?? null, telefone: row?.telefone ?? null }
}

export async function clearSubmitterData(id: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({
      enviador_nome: null,
      enviador_email: null,
      enviador_telefone: null,
      enviador_instagram: null,
      enviador_x: null,
      enviador_youtube: null,
      enviador_linkedin: null,
      enviador_site: null,
      enviador_relacao: null,
    })
    .eq('id', id)
  if (error) throw error
}

export interface SearchResult {
  items: Card[]
  total: number
}

export async function searchCards(f: Filters): Promise<SearchResult> {
  const { data, error } = await supabase.rpc('search_cards', {
    q: f.q || null,
    p_area: f.area || null,
    p_formato: f.formato || null,
    p_tags: f.tags.length ? f.tags : null,
    p_idioma: f.idioma || null,
    p_sort: f.sort,
    p_limit: PAGE_SIZE,
    p_offset: (f.page - 1) * PAGE_SIZE,
  })
  if (error) throw error
  const rows = (data ?? []) as (Card & { total: number })[]
  return {
    total: rows.length ? Number(rows[0].total) : 0,
    items: rows.map(({ total: _total, ...card }) => card),
  }
}

export async function fetchTags(): Promise<string[]> {
  const { data, error } = await supabase.rpc('card_tags')
  if (error) throw error
  return ((data ?? []) as { tag: string }[]).map((r) => r.tag)
}

export async function submitCard(
  input: SubmissionInput & EnviadorInput,
): Promise<void> {
  const nul = (v: string) => v || null
  const { error } = await supabase.from('cards').insert({
    titulo: input.titulo,
    descricao: input.descricao,
    area: input.area,
    formato: input.formato,
    instituicao_autor: input.instituicao_autor || null,
    tags: input.tags,
    link_original: input.link_original,
    idioma: input.idioma,
    enviador_nome: input.enviador_nome,
    enviador_email: input.enviador_email,
    enviador_relacao: input.enviador_relacao,
    enviador_telefone: nul(input.enviador_telefone),
    enviador_instagram: nul(input.enviador_instagram),
    enviador_x: nul(input.enviador_x),
    enviador_youtube: nul(input.enviador_youtube),
    enviador_linkedin: nul(input.enviador_linkedin),
    enviador_site: nul(input.enviador_site),
    consentimento_versao: PRIVACY_VERSION,
    status: 'pending',
  })
  if (error) {
    if (error.code === '23505')
      throw new Error('Este link já foi enviado ao portal.')
    throw new Error(
      'Não foi possível enviar agora. Tente novamente em instantes.',
    )
  }
}

export async function listAdminCards(
  status: Status | 'all',
  q: string,
): Promise<AdminCard[]> {
  const { data, error } = await supabase.rpc('admin_cards', {
    p_status: status === 'all' ? null : status,
    p_q: q.trim() || null,
  })
  if (error) throw error
  return (data ?? []) as AdminCard[]
}

export async function setCardStatus(
  id: string,
  status: Status,
  reviewer: string,
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({
      status,
      reviewed_by: reviewer,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function updateCard(
  id: string,
  patch: Partial<SubmissionInput>,
): Promise<void> {
  const { error } = await supabase.from('cards').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}

export async function isCurrentUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}
