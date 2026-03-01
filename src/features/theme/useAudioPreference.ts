import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kin-audio-enabled'

export function useAudioPreference() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) return saved === 'true'
    }
    return true
  })

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(audioEnabled))
    }
  }, [audioEnabled])

  const toggleAudio = () => setAudioEnabled(prev => !prev)

  return { audioEnabled, toggleAudio }
}
