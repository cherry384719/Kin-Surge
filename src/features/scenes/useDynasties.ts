import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Dynasty {
  id: number
  name: string
  display_name: string
  sort_order: number
}

export function useDynasties() {
  const [dynasties, setDynasties] = useState<Dynasty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('dynasties')
      .select('*')
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setDynasties(data ?? [])
        setLoading(false)
      })
  }, [])

  return { dynasties, loading, error }
}
