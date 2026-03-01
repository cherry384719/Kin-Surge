import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useCoins(userId?: string) {
  const [coins, setCoins] = useState(0)

  useEffect(() => {
    if (!userId) return
    if (typeof supabase.from !== 'function') return
    const query = supabase.from('user_profiles')
    if (!query || typeof query.select !== 'function') return
    query
      .select('coins')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.coins != null) setCoins(data.coins)
      })
  }, [userId])

  const awardCoins = useCallback(async (amount: number) => {
    if (!userId) return
    setCoins(prev => {
      const newTotal = prev + amount
      if (typeof supabase.from === 'function') {
        const query = supabase.from('user_profiles')
        if (query && typeof query.upsert === 'function') {
          query.upsert({ user_id: userId, coins: newTotal })
        }
      }
      return newTotal
    })
  }, [userId])

  return { coins, awardCoins }
}
