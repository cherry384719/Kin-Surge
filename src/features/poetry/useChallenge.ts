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

export interface PoetInfo {
  id: number
  name: string
  bio_short: string
  challenge_intro: string
  is_boss: boolean
  dynasty_id: number
}

export function useChallenge(poetId: number) {
  const [lines, setLines] = useState<PoemLine[]>([])
  const [poems, setPoems] = useState<PoemInfo[]>([])
  const [poet, setPoet] = useState<PoetInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const cacheKey = `kin-challenge-${poetId}`
      const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { poems: PoemInfo[]; lines: PoemLine[]; poet: PoetInfo | null }
          setPoems(parsed.poems)
          setLines(parsed.lines)
          if (parsed.poet) setPoet(parsed.poet)
          setLoading(false)
          return
        } catch {
          /* ignore cache parse errors */
        }
      }

      const { data: poetData } = await supabase
        .from('poets')
        .select('id, name, bio_short, challenge_intro, is_boss, dynasty_id')
        .eq('id', poetId)
        .single()
      if (poetData) setPoet(poetData)

      let poemData: PoemInfo[] | null = null

      if (poetData?.is_boss) {
        // Boss poet: aggregate poems from all regular poets in the same dynasty
        const { data: dynastyPoets } = await supabase
          .from('poets')
          .select('id')
          .eq('dynasty_id', poetData.dynasty_id)
          .eq('is_boss', false)
        const poetIds = dynastyPoets?.map(p => p.id) ?? []
        if (poetIds.length > 0) {
          const { data } = await supabase
            .from('poems')
            .select('id, title')
            .in('poet_id', poetIds)
            .order('id')
          poemData = data
        }
      } else {
        const { data } = await supabase
          .from('poems')
          .select('id, title')
          .eq('poet_id', poetId)
          .order('id')
        poemData = data
      }

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
          sessionStorage.setItem(cacheKey, JSON.stringify({ poems: poemData, lines: lineData ?? [], poet: poetData }))
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [poetId])

  return { lines, poems, poet, loading }
}
