import { useCallback, useMemo } from 'react'

interface UseSfxOptions {
  enabled: boolean
}

export function useSfx({ enabled }: UseSfxOptions) {
  const context = useMemo(() => {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return null
    return new AudioContext()
  }, [])

  const playTone = useCallback(
    (frequency: number, durationMs: number, type: OscillatorType = 'sine') => {
      if (!enabled || !context) return
      const now = context.currentTime
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = type
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000)
      osc.connect(gain).connect(context.destination)
      osc.start(now)
      osc.stop(now + durationMs / 1000)
    },
    [context, enabled],
  )

  const playCorrect = useCallback(() => playTone(880, 180, 'triangle'), [playTone])
  const playWrong = useCallback(() => playTone(220, 200, 'sawtooth'), [playTone])
  const playUi = useCallback(() => playTone(660, 120, 'square'), [playTone])

  return { playCorrect, playWrong, playUi }
}
