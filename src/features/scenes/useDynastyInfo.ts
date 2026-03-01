import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface DynastyInfo {
  id: number
  name: string
  display_name: string
}

const DYNASTY_STYLE_MAP: Record<string, string> = {
  han: 'dynasty-han',
  weijin: 'dynasty-weijin',
  tang: 'dynasty-tang',
  song: 'dynasty-song',
  yuan: 'dynasty-yuan',
  mingqing: 'dynasty-mingqing',
}

const DYNASTY_BG_MAP: Record<string, string> = {
  han: 'dynasty-bg-han',
  weijin: 'dynasty-bg-weijin',
  tang: 'dynasty-bg-tang',
  song: 'dynasty-bg-song',
  yuan: 'dynasty-bg-yuan',
  mingqing: 'dynasty-bg-mingqing',
}

export function useDynastyInfo(dynastyId: number) {
  const [dynasty, setDynasty] = useState<DynastyInfo | null>(null)

  useEffect(() => {
    supabase
      .from('dynasties')
      .select('id, name, display_name')
      .eq('id', dynastyId)
      .single()
      .then(({ data }) => {
        setDynasty(data ?? null)
      })
  }, [dynastyId])

  const styleClass = dynasty ? DYNASTY_STYLE_MAP[dynasty.name] ?? '' : ''
  const bgClass = dynasty ? DYNASTY_BG_MAP[dynasty.name] ?? '' : ''
  return { dynasty, styleClass, bgClass }
}
