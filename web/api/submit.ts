import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { enviadorSchema, submissionSchema } from '../src/lib/schemas.js'
import { PRIVACY_VERSION } from '../src/lib/privacy.js'

const requestSchema = submissionSchema
  .merge(enviadorSchema)
  .extend({ consentimento: z.literal(true) })

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined

function getTransporter() {
  const user = process.env.GMAIL_USER
  const password = process.env.GMAIL_APP_PASSWORD
  if (!user || !password) throw new Error('Gmail SMTP is not configured')

  transporter ??= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: password.replace(/\s/g, '') },
  })

  return transporter
}

async function sendReviewNotification() {
  const recipient = process.env.VITE_PRIVACY_EMAIL
  const sender = process.env.GMAIL_USER
  if (!recipient || !sender) {
    throw new Error('Review notification address is not configured')
  }

  await getTransporter().sendMail({
    from: sender,
    to: recipient,
    subject: '[Portal SciBR] Novo envio para revisão',
    text: 'Uma nova divulgação aguarda revisão. Acesse a página de moderação do Portal SciBR para analisá-la.',
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return Response.json(
        { error: 'methodNotAllowed' },
        { status: 405, headers: { Allow: 'POST' } },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'invalidRequest' }, { status: 400 })
    }

    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'invalidRequest' }, { status: 400 })
    }

    const url = process.env.VITE_SUPABASE_URL
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      console.error('Submission API is missing Supabase configuration')
      return Response.json({ error: 'submitFailed' }, { status: 500 })
    }

    const {
      consentimento: _consentimento,
      instituicao_autor,
      enviador_telefone,
      enviador_instagram,
      enviador_x,
      enviador_youtube,
      enviador_linkedin,
      enviador_site,
      ...submission
    } = parsed.data

    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    })
    const { error } = await supabase.from('cards').insert({
      ...submission,
      instituicao_autor: instituicao_autor || null,
      enviador_telefone: enviador_telefone || null,
      enviador_instagram: enviador_instagram || null,
      enviador_x: enviador_x || null,
      enviador_youtube: enviador_youtube || null,
      enviador_linkedin: enviador_linkedin || null,
      enviador_site: enviador_site || null,
      consentimento_versao: PRIVACY_VERSION,
      status: 'pending',
    })

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'duplicateLink' }, { status: 409 })
      }
      console.error('Submission insert failed', error.code ?? 'unknown')
      return Response.json({ error: 'submitFailed' }, { status: 500 })
    }

    let notificationSent = false
    try {
      await sendReviewNotification()
      notificationSent = true
    } catch (error) {
      console.error(
        'Review notification failed',
        error instanceof Error ? error.name : 'UnknownError',
      )
    }

    return Response.json({ notificationSent })
  },
}
