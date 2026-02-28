import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DynastyPage } from './DynastyPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 1, name: '李白', bio_short: '诗仙', avatar_url: null, sort_order: 1, is_boss: false },
              { id: 2, name: '杜甫', bio_short: '诗圣', avatar_url: null, sort_order: 2, is_boss: false },
              { id: 99, name: '唐朝综合', bio_short: null, avatar_url: null, sort_order: 99, is_boss: true },
            ],
            error: null,
          }),
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
    progressMap: { 1: { poet_id: 1, stars: 3, completed: true, mistakes: 0, used_reveal: false } },
    loading: false,
  }),
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: {} }, loading: false }),
}))

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/app/dynasty/3']}>
      <Routes>
        <Route path="/app/dynasty/:dynastyId" element={<DynastyPage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('renders poet names', async () => {
  renderWithRoute()
  expect(await screen.findByText('李白')).toBeInTheDocument()
  expect(await screen.findByText('杜甫')).toBeInTheDocument()
})

test('shows boss with special styling', async () => {
  renderWithRoute()
  const boss = await screen.findByText('唐朝综合')
  expect(boss.closest('[data-boss]')).toBeInTheDocument()
})
