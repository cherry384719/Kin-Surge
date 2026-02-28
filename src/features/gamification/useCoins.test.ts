import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCoins } from './useCoins'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { coins: 10 },
            error: null,
          }),
        }),
      }),
    }),
  },
}))

describe('useCoins', () => {
  it('starts at 0 before fetch', () => {
    const { result } = renderHook(() => useCoins('user-123'))
    expect(result.current.coins).toBe(0)
  })

  it('awards coins and updates local state', async () => {
    const { result } = renderHook(() => useCoins('user-123'))
    await act(async () => {
      await result.current.awardCoins(5)
    })
    expect(result.current.coins).toBe(5)
  })
})
