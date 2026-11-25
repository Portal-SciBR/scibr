import { supabase } from './supabase'
import {
  PAGE_SIZE,
  type AdminCard,
  type Card,
  type Filters,
  type Status,
} from './types'
import type { EnviadorInput, SubmissionInput } from './schemas'

export interface RevealedContact {
  email: string | null
  telefone: string | null
}

export type ApiErrorCode =
  'contactRateLimited' | 'contactUnavailable' | 'duplicateLink' | 'submitFailed'

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode) {
    super(code)
    this.name = 'ApiError'
    this.code = code
  }
}

export async function revealContact(id: string): Promise<RevealedContact> {
  const { data, error } = await supabase.rpc('reveal_contact', { p_id: id })
  if (error) {
    if (error.message.includes('rate_limited'))
      throw new ApiError('contactRateLimited')
    throw new ApiError('contactUnavailable')
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

export async function fetchAreas(): Promise<string[]> {
  const { data, error } = await supabase.rpc('card_areas')
  if (error) throw error
  if (!Array.isArray(data)) throw new Error('Invalid area list')
  return data.map((row) => {
    if (
      typeof row !== 'object' ||
      row === null ||
      !('area' in row) ||
      typeof row.area !== 'string'
    ) {
      throw new Error('Invalid area list')
    }
    return row.area
  })
}

export async function submitCard(
  input: SubmissionInput & EnviadorInput & { consentimento: true },
): Promise<{ notificationSent: boolean }> {
  let response: Response
  try {
    response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new ApiError('submitFailed')
  }

  let result: unknown
  try {
    result = await response.json()
  } catch {
    throw new ApiError('submitFailed')
  }

  if (!response.ok) {
    const isDuplicate =
      typeof result === 'object' &&
      result !== null &&
      'error' in result &&
      result.error === 'duplicateLink'
    throw new ApiError(isDuplicate ? 'duplicateLink' : 'submitFailed')
  }

  if (
    typeof result !== 'object' ||
    result === null ||
    !('notificationSent' in result) ||
    typeof result.notificationSent !== 'boolean'
  ) {
    throw new ApiError('submitFailed')
  }

  return { notificationSent: result.notificationSent }
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

export async function fetchPendingCardsCount(): Promise<number | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session) return null
  if (!(await isCurrentUserAdmin(session.user.id))) return null

  const { data, error } = await supabase.rpc('pending_cards_count')
  if (error) throw error
  if (typeof data !== 'number' || !Number.isSafeInteger(data) || data < 0) {
    throw new Error('Invalid pending cards count')
  }
  return data
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
