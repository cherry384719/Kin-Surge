import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DynastyMap } from './DynastyMap'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'han', display_name: '汉朝', sort_order: 1, unlock_requirement: 0 },
            { id: 2, name: 'tang', display_name: '唐朝', sort_order: 2, unlock_requirement: 3 },
          ],
          error: null,
        }),
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../progress/useProgress', () => ({
  useProgress: () => ({
    progressMap: {},
    loading: false,
  }),
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: { display_name: '诗童' } }, loading: false }),
}))

test('renders dynasty names', async () => {
  render(<MemoryRouter><DynastyMap /></MemoryRouter>)
  expect(await screen.findByText('汉朝')).toBeInTheDocument()
  expect(await screen.findByText('唐朝')).toBeInTheDocument()
})

test('shows locked state for locked dynasties', async () => {
  render(<MemoryRouter><DynastyMap /></MemoryRouter>)
  const tang = await screen.findByText('唐朝')
  expect(tang.closest('[data-locked]')).toBeInTheDocument()
})
