import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useCoins(userId: string) {
  const [coins, setCoins] = useState(0)

  const awardCoins = useCallback(async (amount: number) => {
    setCoins(prev => {
      const newTotal = prev + amount
      supabase
        .from('user_profiles')
        .update({ coins: newTotal })
        .eq('user_id', userId)
      return newTotal
    })
  }, [userId])

  return { coins, awardCoins }
}
