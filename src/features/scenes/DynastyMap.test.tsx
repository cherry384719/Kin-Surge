import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DynastyMap } from './DynastyMap'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'tang', display_name: '唐朝', sort_order: 1 },
            { id: 2, name: 'song', display_name: '宋朝', sort_order: 2 },
          ],
          error: null,
        }),
      }),
    }),
  },
}))

describe('DynastyMap', () => {
  it('renders a heading', async () => {
    render(<MemoryRouter><DynastyMap /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /选择朝代/i })).toBeInTheDocument()
  })

  it('renders dynasty cards from Supabase data', async () => {
    render(<MemoryRouter><DynastyMap /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('唐朝')).toBeInTheDocument()
      expect(screen.getByText('宋朝')).toBeInTheDocument()
    })
  })

  it('each dynasty card links to the dynasty page', async () => {
    render(<MemoryRouter><DynastyMap /></MemoryRouter>)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /唐朝/i })
      expect(link).toHaveAttribute('href', '/app/dynasty/1')
    })
  })
})
