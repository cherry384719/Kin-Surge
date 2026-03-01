import hanMountain from '../../assets/dynasties/han-mountain.png'
import hanFigure from '../../assets/dynasties/han-figure.png'
import hanClothing from '../../assets/dynasties/han-clothing.png'
import tangPalace from '../../assets/dynasties/tang-palace.png'
import wudaiMountain1 from '../../assets/dynasties/wudai-mountain-1.png'
import wudaiMountain2 from '../../assets/dynasties/wudai-mountain-2.png'
import tangQingSoundscape from '../../assets/dynasties/tang-qing-soundscape.png'
import mingqingGo from '../../assets/dynasties/mingqing-go.png'
import mingArt from '../../assets/dynasties/ming-art.png'

export interface DynastyTextures {
  background: string
  overlay?: string
  accent?: string
}

export const DYNASTY_TEXTURES: Record<string, DynastyTextures> = {
  han: { background: hanMountain, overlay: hanFigure, accent: hanClothing },
  weijin: { background: wudaiMountain1, overlay: wudaiMountain2 },
  tang: { background: tangPalace, overlay: tangQingSoundscape },
  song: { background: tangQingSoundscape, overlay: tangPalace },
  yuan: { background: wudaiMountain2, overlay: tangQingSoundscape },
  mingqing: { background: mingqingGo, overlay: mingArt },
}
