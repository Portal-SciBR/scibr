export const AREAS = [
  'Biológicas & Saúde',
  'Exatas & Terra',
  'Humanas & Sociais',
  'Engenharias & Tecnologia',
  'Multidisciplinar',
] as const

export const FORMATOS = [
  'Artigo',
  'Podcast',
  'Canal no YouTube',
  'Portal',
  'Newsletter',
  'Perfil em rede social',
  'Outro',
] as const

export const IDIOMAS = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
] as const

export type Area = (typeof AREAS)[number]
export type Formato = (typeof FORMATOS)[number]
export type Status = 'pending' | 'approved' | 'rejected'
export type Sort = 'relevance' | 'recent'

export interface PublicEnviador {
  enviador_nome: string | null
  enviador_instagram: string | null
  enviador_x: string | null
  enviador_youtube: string | null
  enviador_linkedin: string | null
  enviador_site: string | null
  enviador_relacao: 'autor' | 'instituicao' | 'indicacao' | null
}

export interface Card extends PublicEnviador {
  id: string
  titulo: string
  descricao: string
  area: Area
  formato: Formato
  instituicao_autor: string | null
  tags: string[]
  link_original: string
  idioma: string
  created_at: string
}

export interface AdminCard extends Card {
  status: Status
  enviador_email: string | null
  enviador_telefone: string | null
  consentimento_em: string | null
  consentimento_versao: string | null
}

export interface Filters {
  q: string
  area: Area | ''
  formato: Formato | ''
  idioma: string
  tags: string[]
  sort: Sort
  page: number
}

export const PAGE_SIZE = 12
