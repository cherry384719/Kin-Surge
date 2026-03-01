import { useMemo } from 'react'

interface BackgroundFXProps {
  tone?: 'warm' | 'cool' | 'royal'
  intensity?: 'low' | 'med' | 'high'
  motionEnabled?: boolean
  textureUrl?: string
  overlayUrl?: string
}

const toneMap: Record<NonNullable<BackgroundFXProps['tone']>, { gradient: string; motif: string }> = {
  warm: { gradient: 'bg-gradient-warm', motif: 'bg-motif-ink' },
  cool: { gradient: 'bg-gradient-cool', motif: 'bg-motif-clouds' },
  royal: { gradient: 'bg-gradient-royal', motif: 'bg-motif-silk' },
}

const intensityMap: Record<NonNullable<BackgroundFXProps['intensity']>, string> = {
  low: 'fx-opacity-30',
  med: 'fx-opacity-60',
  high: 'fx-opacity-100',
}

export function BackgroundFX({ tone = 'warm', intensity = 'med', motionEnabled = true, textureUrl, overlayUrl }: BackgroundFXProps) {
  const classes = useMemo(() => {
    const toneClasses = toneMap[tone]
    const intensityClass = intensityMap[intensity]
    return `${toneClasses.gradient} ${toneClasses.motif} ${intensityClass}`
  }, [tone, intensity])

  return (
    <div className={`background-fx ${classes}`} data-motion={motionEnabled ? 'on' : 'off'} aria-hidden>
      {textureUrl && <div className="texture-layer" style={{ backgroundImage: `url(${textureUrl})` }} />}
      {overlayUrl && <div className="texture-overlay" style={{ backgroundImage: `url(${overlayUrl})` }} />}
      {motionEnabled && <div className="particle-layer" />}
    </div>
  )
}
