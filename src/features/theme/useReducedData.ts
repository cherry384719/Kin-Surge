import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kin-reduced-data'

export function useReducedData() {
  const [reducedData, setReducedData] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) return saved === 'true'
    }
    const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    return supported ? window.matchMedia('(prefers-reduced-data: reduce)').matches : false
  })

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(reducedData))
    }
  }, [reducedData])

  const toggleReducedData = () => setReducedData(prev => !prev)

  return { reducedData, toggleReducedData }
}
