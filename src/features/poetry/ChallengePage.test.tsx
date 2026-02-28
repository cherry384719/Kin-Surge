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
      if (table === 'user_profiles') {
        return { update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }) }
      }
      if (table === 'poet_progress') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          upsert: vi.fn().mockResolvedValue({}),
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
    <MemoryRouter initialEntries={['/app/challenge/1']}>
      <Routes>
        <Route path="/app/challenge/:poetId" element={<ChallengePage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows poet line as prompt', async () => {
  renderChallenge()
  expect(await screen.findByText('床前明月光')).toBeInTheDocument()
})

test('shows correct feedback on right answer', async () => {
  renderChallenge()
  await screen.findByText('床前明月光')
  const input = screen.getByPlaceholderText('请填写下一句…')
  await userEvent.type(input, '疑是地上霜')
  await userEvent.click(screen.getByRole('button', { name: '提交' }))
  expect(await screen.findByText('正确！')).toBeInTheDocument()
})
