import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useCoins(userId: string) {
  const [coins, setCoins] = useState(0)

  async function awardCoins(amount: number) {
    setCoins(prev => prev + amount)
    await supabase
      .from('user_profiles')
      .update({ coins: coins + amount })
      .eq('user_id', userId)
  }

  return { coins, awardCoins }
}
