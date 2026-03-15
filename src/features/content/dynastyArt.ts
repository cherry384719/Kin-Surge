export interface DynastyVisual {
  orbClass: string
  accentClass: string
  patternClass: string
  symbol: string
  label: string
}

const visualMap: Record<string, DynastyVisual> = {
  han: {
    orbClass: 'bg-[#fca5a5]',
    accentClass: 'bg-[#ef4444]',
    patternClass: 'from-[#fee2e2] via-[#fde68a] to-white',
    symbol: '汉',
    label: '赤旗初起',
  },
  weijin: {
    orbClass: 'bg-[#93c5fd]',
    accentClass: 'bg-[#0ea5e9]',
    patternClass: 'from-[#dbeafe] via-[#e0f2fe] to-white',
    symbol: '晋',
    label: '清谈山水',
  },
  tang: {
    orbClass: 'bg-[#f9a8d4]',
    accentClass: 'bg-[#ec4899]',
    patternClass: 'from-[#fae8ff] via-[#fce7f3] to-white',
    symbol: '唐',
    label: '盛世光华',
  },
  song: {
    orbClass: 'bg-[#86efac]',
    accentClass: 'bg-[#22c55e]',
    patternClass: 'from-[#dcfce7] via-[#ccfbf1] to-white',
    symbol: '宋',
    label: '风雅入卷',
  },
  yuan: {
    orbClass: 'bg-[#fcd34d]',
    accentClass: 'bg-[#f59e0b]',
    patternClass: 'from-[#fef3c7] via-[#fde68a] to-white',
    symbol: '元',
    label: '曲韵横生',
  },
  mingqing: {
    orbClass: 'bg-[#c4b5fd]',
    accentClass: 'bg-[#8b5cf6]',
    patternClass: 'from-[#ede9fe] via-[#fae8ff] to-white',
    symbol: '明',
    label: '余响新声',
  },
}

const fallbackVisual: DynastyVisual = {
  orbClass: 'bg-slate-200',
  accentClass: 'bg-slate-500',
  patternClass: 'from-slate-50 via-slate-100 to-white',
  symbol: '诗',
  label: '诗路',
}

export function getDynastyVisual(name: string) {
  return visualMap[name] ?? fallbackVisual
}
