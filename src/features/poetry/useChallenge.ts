import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoemLine {
  id: number
  poem_id: number
  line_number: number
  text: string
}

export interface PoemInfo {
  id: number
  title: string
}

export function useChallenge(poetId: number) {
  const [lines, setLines] = useState<PoemLine[]>([])
  const [poems, setPoems] = useState<PoemInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const cacheKey = `kin-challenge-${poetId}`
      const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { poems: PoemInfo[]; lines: PoemLine[] }
          setPoems(parsed.poems)
          setLines(parsed.lines)
          setLoading(false)
          return
        } catch {
          /* ignore cache parse errors */
        }
      }

      const { data: poemData } = await supabase
        .from('poems')
        .select('id, title')
        .eq('poet_id', poetId)
        .order('id')

      if (poemData && poemData.length > 0) {
        setPoems(poemData)
        const poemIds = poemData.map(p => p.id)
        const { data: lineData } = await supabase
          .from('poem_lines')
          .select('id, poem_id, line_number, text')
          .in('poem_id', poemIds)
          .order('poem_id')
          .order('line_number')

        setLines(lineData ?? [])
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(cacheKey, JSON.stringify({ poems: poemData, lines: lineData ?? [] }))
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [poetId])

  return { lines, poems, loading }
}
