import { z } from 'zod'
import { AREAS, FORMATOS } from './types'

type Translate = (key: string) => string

export const submissionSchemaFor = (t: Translate) =>
  z.object({
    titulo: z
      .string()
      .trim()
      .min(3, t('validation.min3'))
      .max(120, t('validation.max120')),
    descricao: z
      .string()
      .trim()
      .min(10, t('validation.min10'))
      .max(500, t('validation.max500')),
    area: z.enum(AREAS, { error: t('validation.selectArea') }),
    formato: z.enum(FORMATOS, { error: t('validation.selectFormat') }),
    instituicao_autor: z.string().trim().max(120, t('validation.max120')),
    tags: z
      .array(z.string().trim().min(1).max(30))
      .max(8, t('validation.max8')),
    link_original: z
      .string()
      .trim()
      .max(500)
      .regex(/^https?:\/\/[^\s]+$/i, t('validation.validLink')),
    idioma: z
      .string()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/, t('validation.invalidLanguage')),
  })

export const submissionSchema = submissionSchemaFor((key) => key)

export type SubmissionInput = z.infer<typeof submissionSchema>

export const RELACOES = [
  { value: 'autor', label: 'Sou o autor/criador' },
  { value: 'instituicao', label: 'Represento a instituição' },
  { value: 'indicacao', label: 'Estou indicando (fã/leitor)' },
] as const

const optional = (re: RegExp, message: string) =>
  z.union([z.literal(''), z.string().trim().regex(re, message)])

export const enviadorSchemaFor = (t: Translate) =>
  z.object({
    enviador_nome: z
      .string()
      .trim()
      .min(2, t('validation.yourName'))
      .max(100, t('validation.max100')),
    enviador_email: z
      .string()
      .trim()
      .max(150)
      .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, t('validation.validEmail')),
    enviador_relacao: z.enum(['autor', 'instituicao', 'indicacao'], {
      error: t('validation.selectRelationship'),
    }),
    enviador_telefone: optional(
      /^\+?[0-9 ()-]{8,20}$/,
      t('validation.invalidPhone'),
    ),
    enviador_instagram: optional(
      /^[A-Za-z0-9._]{1,30}$/,
      t('validation.invalidUsername'),
    ),
    enviador_x: optional(
      /^[A-Za-z0-9_]{1,15}$/,
      t('validation.invalidUsername'),
    ),
    enviador_youtube: optional(
      /^https:\/\/[^\s]+$/i,
      t('validation.httpsLink'),
    ),
    enviador_linkedin: optional(
      /^https:\/\/[^\s]+$/i,
      t('validation.httpsLink'),
    ),
    enviador_site: optional(
      /^https?:\/\/[^\s]+$/i,
      t('validation.invalidLink'),
    ),
  })

export const enviadorSchema = enviadorSchemaFor((key) => key)

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
