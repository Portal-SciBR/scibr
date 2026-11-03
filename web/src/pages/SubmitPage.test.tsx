import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SubmitPage } from './SubmitPage'

describe('SubmitPage', () => {
  it('updates the summary character count while typing', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SubmitPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByText('0 / 500 caracteres')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Resumo' }), 'abc123')
    expect(screen.getByText('6 / 500 caracteres')).toBeInTheDocument()
  })
})
