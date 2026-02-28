import { renderHook, waitFor } from '@testing-library/react'
import { useProgress } from './useProgress'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { poet_id: 1, stars: 3, completed: true, mistakes: 0, used_reveal: false },
          ],
          error: null,
        }),
      }),
    }),
  },
}))

test('fetches progress for a user', async () => {
  const { result } = renderHook(() => useProgress('user-123'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.progressMap).toEqual({
    1: { poet_id: 1, stars: 3, completed: true, mistakes: 0, used_reveal: false },
  })
})
