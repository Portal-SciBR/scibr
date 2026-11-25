import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { insert, sendMail, createTransport } = vi.hoisted(() => ({
  insert: vi.fn(),
  sendMail: vi.fn(),
  createTransport: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert })),
  })),
}))

vi.mock('nodemailer', () => ({
  default: { createTransport },
}))

import handler from '../api/submit'

const validSubmission = {
  titulo: 'Astronomia para todos',
  descricao: 'Um resumo sobre divulgação de astronomia.',
  area: 'Exatas & Terra',
  formato: 'Artigo',
  instituicao_autor: '',
  tags: ['astronomia'],
  link_original: 'https://example.org/astronomia',
  idioma: 'pt-BR',
  enviador_nome: 'Ana Silva',
  enviador_email: 'ana@example.org',
  enviador_relacao: 'indicacao',
  enviador_telefone: '',
  enviador_instagram: '',
  enviador_x: '',
  enviador_youtube: '',
  enviador_linkedin: '',
  enviador_site: '',
  consentimento: true,
}

function post(body: unknown) {
  return handler.fetch(
    new Request('https://scibr.example/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

describe('POST /api/submit', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    vi.stubEnv('VITE_PRIVACY_EMAIL', 'contato.scibr@gmail.com')
    vi.stubEnv('GMAIL_USER', 'sender@gmail.com')
    vi.stubEnv('GMAIL_APP_PASSWORD', 'test-app-password')
    insert.mockResolvedValue({ error: null })
    sendMail.mockResolvedValue({ messageId: 'test-message-id' })
    createTransport.mockReturnValue({ sendMail })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('stores the pending post and emails the review contact', async () => {
    const response = await post(validSubmission)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ notificationSent: true })
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pending',
        consentimento_versao: expect.any(String),
        instituicao_autor: null,
        enviador_telefone: null,
      }),
    )
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
      }),
    )
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'contato.scibr@gmail.com',
        subject: '[Portal SciBR] Novo envio para revisão',
        text: expect.stringContaining('aguarda revisão'),
      }),
    )
  })

  it('does not send email when the post link is a duplicate', async () => {
    insert.mockResolvedValueOnce({ error: { code: '23505' } })

    const response = await post(validSubmission)

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({ error: 'duplicateLink' })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('rejects invalid submissions without inserting or sending email', async () => {
    const response = await post({ ...validSubmission, consentimento: false })

    expect(response.status).toBe(400)
    expect(insert).not.toHaveBeenCalled()
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('keeps the saved submission and reports when email delivery fails', async () => {
    sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await post(validSubmission)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ notificationSent: false })
    expect(insert).toHaveBeenCalledOnce()
    expect(console.error).toHaveBeenCalledWith(
      'Review notification failed',
      'Error',
    )
  })
})
