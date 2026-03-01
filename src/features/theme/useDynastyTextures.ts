import { useEffect, useState } from 'react'
import type { DynastyTextures } from './dynastyAssets'
import { DYNASTY_TEXTURES } from './dynastyAssets'

interface Options {
  reducedData?: boolean
}

export function useDynastyTextures(dynastyName?: string, options?: Options) {
  const reducedData = options?.reducedData ?? false
  const [textures, setTextures] = useState<DynastyTextures | undefined>(undefined)

  useEffect(() => {
    if (!dynastyName) {
      setTextures(undefined)
      return
    }
    const mapping = DYNASTY_TEXTURES[dynastyName]
    if (!mapping) {
      setTextures(undefined)
      return
    }
    setTextures({
      background: mapping.background,
      overlay: reducedData ? undefined : mapping.overlay,
      accent: mapping.accent,
    })
  }, [dynastyName, reducedData])

  return textures
}
