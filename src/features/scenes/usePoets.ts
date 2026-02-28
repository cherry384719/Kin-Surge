import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Poet {
  id: number
  name: string
  bio_short: string | null
  avatar_url: string | null
}

export function usePoets(dynastyId: number) {
  const [poets, setPoets] = useState<Poet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('poets')
      .select('id, name, bio_short, avatar_url')
      .eq('dynasty_id', dynastyId)
      .then(({ data }) => {
        setPoets(data ?? [])
        setLoading(false)
      })
  }, [dynastyId])

  return { poets, loading }
}
