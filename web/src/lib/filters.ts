import { AREAS, FORMATOS, type Filters, type Sort } from './types'

export const DEFAULT_FILTERS: Filters = {
  q: '',
  area: '',
  formato: '',
  idioma: '',
  tags: [],
  sort: 'relevance',
  page: 1,
}

export function parseFilters(params: URLSearchParams): Filters {
  const area = params.get('area') ?? ''
  const formato = params.get('formato') ?? ''
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  return {
    q: params.get('q') ?? '',
    area: (AREAS as readonly string[]).includes(area)
      ? (area as Filters['area'])
      : '',
    formato: (FORMATOS as readonly string[]).includes(formato)
      ? (formato as Filters['formato'])
      : '',
    idioma: params.get('idioma') ?? '',
    tags: params.getAll('tag'),
    sort: (params.get('sort') === 'recent' ? 'recent' : 'relevance') as Sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function serializeFilters(f: Filters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.area) p.set('area', f.area)
  if (f.formato) p.set('formato', f.formato)
  if (f.idioma) p.set('idioma', f.idioma)
  f.tags.forEach((t) => p.append('tag', t))
  if (f.sort !== 'relevance') p.set('sort', f.sort)
  if (f.page > 1) p.set('page', String(f.page))
  return p
}

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.q || f.area || f.formato || f.idioma || f.tags.length)
}
