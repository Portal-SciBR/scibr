import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../i18n'
import { fetchPendingCardsCount } from '../lib/api'
import { Layout } from './Layout'

vi.mock('../lib/api', () => ({
  fetchPendingCardsCount: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderLayout = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('switches the interface language and persists the selection', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPendingCardsCount).mockResolvedValue(null)
    renderLayout()

    expect(i18n.t('home.title')).toBe('Ciência num só lugar')
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Click EN to switch to English',
    )

    await user.click(
      screen.getByRole('button', { name: 'Mudar idioma para inglês' }),
    )

    await waitForElementToBeRemoved(() => screen.getByRole('tooltip'))
    expect(
      screen.getByRole('button', { name: 'Switch language to Portuguese' }),
    ).toHaveTextContent('PT-BR')
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(i18n.t('home.title')).toBe('Science, all in one place')
    expect(localStorage.getItem('scibr:language-hint-dismissed')).toBe('true')
    expect(localStorage.getItem('scibr:language')).toBe('en')
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })

  it('shows the hint in Portuguese when the current language is English', async () => {
    vi.mocked(fetchPendingCardsCount).mockResolvedValue(null)
    await act(async () => {
      await i18n.changeLanguage('en')
    })
    renderLayout()

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Clique em PT-BR para mudar para português',
    )
  })

  it('shows pending moderation items in the navigation badge', async () => {
    vi.mocked(fetchPendingCardsCount).mockResolvedValue(3)
    renderLayout()

    expect(
      await screen.findByRole('link', {
        name: 'Moderação: 3 itens pendentes de revisão',
      }),
    ).toBeInTheDocument()
    expect(fetchPendingCardsCount).toHaveBeenCalledTimes(1)
  })
})
