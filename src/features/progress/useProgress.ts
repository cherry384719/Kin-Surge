import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoetProgress {
  poet_id: number
  stars: number
  completed: boolean
  mistakes: number
  used_reveal: boolean
}

export function useProgress(userId: string) {
  const [progressMap, setProgressMap] = useState<Record<number, PoetProgress>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    supabase
      .from('poet_progress')
      .select('poet_id, stars, completed, mistakes, used_reveal')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (!error && data) {
          const map: Record<number, PoetProgress> = {}
          for (const row of data) {
            map[row.poet_id] = row
          }
          setProgressMap(map)
        }
        setLoading(false)
      })
  }, [userId])

  async function saveProgress(poetId: number, stars: number, mistakes: number, usedReveal: boolean) {
    const entry = { user_id: userId, poet_id: poetId, stars, completed: true, mistakes, used_reveal: usedReveal }
    await supabase.from('poet_progress').upsert(entry, { onConflict: 'user_id,poet_id' })
    setProgressMap(prev => ({ ...prev, [poetId]: { poet_id: poetId, stars, completed: true, mistakes, used_reveal: usedReveal } }))
  }

  return { progressMap, loading, saveProgress }
}
