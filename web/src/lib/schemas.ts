import { z } from 'zod'
import { AREAS, FORMATOS } from './types'

export const submissionSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, 'Mínimo de 3 caracteres')
    .max(120, 'Máximo de 120 caracteres'),
  descricao: z
    .string()
    .trim()
    .min(10, 'Escreva ao menos 10 caracteres')
    .max(500, 'Máximo de 500 caracteres'),
  area: z.enum(AREAS, { error: 'Selecione uma área' }),
  formato: z.enum(FORMATOS, { error: 'Selecione um formato' }),
  instituicao_autor: z.string().trim().max(120, 'Máximo de 120 caracteres'),
  tags: z.array(z.string().trim().min(1).max(30)).max(8, 'Máximo de 8 tags'),
  link_original: z
    .string()
    .trim()
    .max(500)
    .regex(
      /^https?:\/\/[^\s]+$/i,
      'Informe um link válido começando com http:// ou https://',
    ),
  idioma: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Idioma inválido'),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

export const RELACOES = [
  { value: 'autor', label: 'Sou o autor/criador' },
  { value: 'instituicao', label: 'Represento a instituição' },
  { value: 'indicacao', label: 'Estou indicando (fã/leitor)' },
] as const

const optional = (re: RegExp, message: string) =>
  z.union([z.literal(''), z.string().trim().regex(re, message)])

export const enviadorSchema = z.object({
  enviador_nome: z
    .string()
    .trim()
    .min(2, 'Informe seu nome')
    .max(100, 'Máximo de 100 caracteres'),
  enviador_email: z
    .string()
    .trim()
    .max(150)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Informe um e-mail válido'),
  enviador_relacao: z.enum(['autor', 'instituicao', 'indicacao'], {
    error: 'Selecione sua relação com o conteúdo',
  }),
  enviador_telefone: optional(/^\+?[0-9 ()-]{8,20}$/, 'Telefone inválido'),
  enviador_instagram: optional(/^[A-Za-z0-9._]{1,30}$/, 'Usuário inválido'),
  enviador_x: optional(/^[A-Za-z0-9_]{1,15}$/, 'Usuário inválido'),
  enviador_youtube: optional(/^https:\/\/[^\s]+$/i, 'Link https inválido'),
  enviador_linkedin: optional(/^https:\/\/[^\s]+$/i, 'Link https inválido'),
  enviador_site: optional(/^https?:\/\/[^\s]+$/i, 'Link inválido'),
})

export type EnviadorInput = z.infer<typeof enviadorSchema>

export const stripAt = (v: string) => v.trim().replace(/^@/, '')

export const withHttps = (v: string) => {
  const t = v.trim()
  return t && !/^[a-z][a-z0-9+.-]*:/i.test(t) ? `https://${t}` : t
}

export function parseTags(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
}
