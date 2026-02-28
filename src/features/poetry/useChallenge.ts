import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoemLine {
  id: number
  poem_id: number
  line_number: number
  text: string
}

export function useChallenge(poetId: number) {
  const [lines, setLines] = useState<PoemLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch lines for a random poem by this poet (limit 1 poem = 4 lines)
    supabase
      .from('poem_lines')
      .select('id, poem_id, line_number, text')
      .eq('poem_id', poetId)   // simplified for MVP: poetId doubles as poemId in seed data
      .order('line_number')
      .limit(8)
      .then(({ data }) => {
        setLines(data ?? [])
        setLoading(false)
      })
  }, [poetId])

  return { lines, loading }
}
