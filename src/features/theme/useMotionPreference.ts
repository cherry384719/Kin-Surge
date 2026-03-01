import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kin-motion-enabled'

export function useMotionPreference() {
  const [motionEnabled, setMotionEnabled] = useState(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (saved !== null) return saved === 'true'
    const mqSupported = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    return mqSupported ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches : true
  })

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(motionEnabled))
    }
  }, [motionEnabled])

  const toggleMotion = () => setMotionEnabled(prev => !prev)

  return { motionEnabled, toggleMotion }
}
