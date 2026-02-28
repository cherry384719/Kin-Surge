import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Poet {
  id: number
  name: string
  bio_short: string | null
  avatar_url: string | null
  sort_order: number
  is_boss: boolean
}

export function usePoets(dynastyId: number) {
  const [poets, setPoets] = useState<Poet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('poets')
      .select('id, name, bio_short, avatar_url, sort_order, is_boss')
      .eq('dynasty_id', dynastyId)
      .order('sort_order')
      .then(({ data }) => {
        setPoets(data ?? [])
        setLoading(false)
      })
  }, [dynastyId])

  return { poets, loading }
}
