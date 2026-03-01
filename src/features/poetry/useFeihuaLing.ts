import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PoemLine } from './useChallenge'

export function findLinesContaining(
  lines: PoemLine[],
  keyword: string,
  usedIds?: Set<number>,
): PoemLine[] {
  return lines.filter(l => {
    if (usedIds && usedIds.has(l.id)) return false
    return l.text.includes(keyword)
  })
}

const KEYWORDS = ['花', '月', '春', '风', '雪', '山', '水', '云', '日', '人', '心', '夜']

export function useFeihuaLing() {
  const [allLines, setAllLines] = useState<PoemLine[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('poem_lines')
        .select('id, poem_id, line_number, text')
      setAllLines(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  function startRound() {
    const k = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
    setKeyword(k)
    return k
  }

  function getAiResponse(usedIds: Set<number>): PoemLine | null {
    const candidates = findLinesContaining(allLines, keyword, usedIds)
    if (candidates.length === 0) return null
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  function validatePlayerInput(input: string): boolean {
    return input.includes(keyword)
  }

  return { allLines, loading, keyword, startRound, getAiResponse, validatePlayerInput }
}
