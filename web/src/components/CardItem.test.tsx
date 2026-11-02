import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Card } from '../lib/types'
import { CardItem } from './CardItem'

const base: Card = {
  id: '1',
  titulo: 'Astronomia em Ação',
  descricao: 'Podcast de astrofísica.',
  area: 'Exatas & Terra',
  formato: 'Podcast',
  instituicao_autor: 'USP',
  tags: ['espaço'],
  link_original: 'https://example.org',
  idioma: 'pt-BR',
  created_at: '2026-01-01',
  enviador_nome: null,
  enviador_instagram: null,
  enviador_x: null,
  enviador_youtube: null,
  enviador_linkedin: null,
  enviador_site: null,
  enviador_relacao: null,
}

describe('CardItem', () => {
  it('renders content and a safe external link', () => {
    render(<CardItem card={base} />)
    expect(
      screen.getByRole('heading', { name: 'Astronomia em Ação' }),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /acessar fonte/i })
    expect(link).toHaveAttribute('href', 'https://example.org')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(screen.queryByText(/enviado por/i)).not.toBeInTheDocument()
  })

  it('shows social links, hides e-mail/phone until the visitor asks, and drops unsafe URLs', () => {
    render(
      <CardItem
        card={{
          ...base,
          enviador_nome: 'Ana',
          enviador_relacao: 'autor',
          enviador_instagram: 'ana.ciencia',
          enviador_site: 'javascript:alert(1)',
        }}
      />,
    )
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /instagram de ana/i }),
    ).toHaveAttribute('href', 'https://instagram.com/ana.ciencia')
    expect(
      screen.queryByRole('link', { name: /site/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /e-mail/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /mostrar e-mail e telefone/i }),
    ).toBeInTheDocument()
  })
})
