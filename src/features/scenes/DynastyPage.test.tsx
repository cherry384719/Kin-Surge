import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DynastyPage } from './DynastyPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: '李白', bio_short: '浪漫主义诗人', avatar_url: null },
          ],
          error: null,
        }),
      }),
    }),
  },
}))

function renderWithRoute(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/dynasty/${id}`]}>
      <Routes>
        <Route path="/app/dynasty/:dynastyId" element={<DynastyPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('DynastyPage', () => {
  it('renders a list of poets for the dynasty', async () => {
    renderWithRoute('2')
    await waitFor(() => {
      expect(screen.getByText('李白')).toBeInTheDocument()
    })
  })

  it('each poet links to the challenge page', async () => {
    renderWithRoute('2')
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /李白/i })
      expect(link).toHaveAttribute('href', '/app/challenge/1')
    })
  })
})
