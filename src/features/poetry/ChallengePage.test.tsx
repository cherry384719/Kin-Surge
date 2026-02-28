import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ChallengePage } from './ChallengePage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
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
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}))

// Mock AuthProvider's useUser
vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user-123' }, loading: false }),
}))

function renderChallenge(poetId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/app/challenge/${poetId}`]}>
      <Routes>
        <Route path="/app/challenge/:poetId" element={<ChallengePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ChallengePage', () => {
  it('shows the poet line prompt after loading', async () => {
    renderChallenge()
    await waitFor(() => {
      expect(screen.getByText('床前明月光')).toBeInTheDocument()
    })
  })

  it('shows a text input for the player', async () => {
    renderChallenge()
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('shows 正确 feedback on correct answer', async () => {
    renderChallenge()
    await waitFor(() => screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), '疑是地上霜')
    await userEvent.click(screen.getByRole('button', { name: /提交/i }))
    await waitFor(() => {
      expect(screen.getByText(/正确/i)).toBeInTheDocument()
    })
  })
})
