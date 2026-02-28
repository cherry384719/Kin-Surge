import { renderHook, act } from '@testing-library/react'
import { useCoins } from './useCoins'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({}),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: 20, error: null }),
  },
}))

test('awards coins and updates state correctly', async () => {
  const { result } = renderHook(() => useCoins('user-123'))
  expect(result.current.coins).toBe(0)

  await act(async () => {
    await result.current.awardCoins(10)
  })
  expect(result.current.coins).toBe(10)

  await act(async () => {
    await result.current.awardCoins(10)
  })
  expect(result.current.coins).toBe(20)
})
