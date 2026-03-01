import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ChallengePage } from './ChallengePage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'poems') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ id: 1, title: '静夜思' }],
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'poem_lines') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
                    { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
                    { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
                    { id: 4, poem_id: 1, line_number: 4, text: '低头思故乡' },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'poets') {
        return {
          select: vi.fn().mockImplementation((cols: string) => {
            if (cols.includes('challenge_intro')) {
              return {
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 1, name: '李白', bio_short: '诗仙', challenge_intro: '吾乃诗仙李白！' },
                    error: null,
                  }),
                }),
              }
            }
            return {
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }
          }),
        }
      }
      if (table === 'user_profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { coins: 100 }, error: null }),
            }),
          }),
          upsert: vi.fn().mockResolvedValue({}),
        }
      }
      if (table === 'poet_progress') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          upsert: vi.fn().mockResolvedValue({}),
        }
      }
      if (table === 'dynasties') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 3, name: 'tang', display_name: '唐朝' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: {} }, loading: false }),
}))

function renderChallenge() {
  return render(
    <MemoryRouter initialEntries={['/app/dynasty/3/challenge/1']}>
      <Routes>
        <Route path="/app/dynasty/:dynastyId/challenge/:poetId" element={<ChallengePage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows poet intro screen first', async () => {
  renderChallenge()
  expect(await screen.findByText('李白')).toBeInTheDocument()
  expect(screen.getByText(/诗仙李白/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '开始挑战' })).toBeInTheDocument()
})

test('clicking start shows challenge round', async () => {
  renderChallenge()
  await screen.findByText('李白')
  await userEvent.click(screen.getByRole('button', { name: '开始挑战' }))
  expect(await screen.findByText(/选择题/)).toBeInTheDocument()
})
