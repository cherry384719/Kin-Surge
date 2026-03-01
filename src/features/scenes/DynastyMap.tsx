import { Link, useNavigate } from 'react-router-dom'
import { useDynasties } from './useDynasties'
import { useUser } from '../auth/AuthProvider'
import { useProgress } from '../progress/useProgress'
import { isDynastyUnlocked } from '../progress/unlockLogic'
import type { DynastyWithProgress } from '../progress/unlockLogic'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DynastyBadge } from './DynastyBadge'
import { useDynastyTextures } from '../theme/useDynastyTextures'
import { useReducedData } from '../theme/useReducedData'

const DYNASTY_STYLES: Record<string, string> = {
  han: 'dynasty-han',
  weijin: 'dynasty-weijin',
  tang: 'dynasty-tang',
  song: 'dynasty-song',
  yuan: 'dynasty-yuan',
  mingqing: 'dynasty-mingqing',
}

interface PoetBasic {
  id: number
  dynasty_id: number
  is_boss: boolean
}

export function DynastyMap() {
  const { dynasties, loading } = useDynasties()
  const { user } = useUser()
  const userId = user?.id ?? ''
  const { progressMap, loading: progressLoading } = useProgress(userId)
  const [allPoets, setAllPoets] = useState<PoetBasic[]>([])
  const [poetsLoading, setPoetsLoading] = useState(true)
  const { reducedData } = useReducedData()
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('poets')
      .select('id, dynasty_id, is_boss')
      .then(({ data }) => {
        setAllPoets(data ?? [])
        setPoetsLoading(false)
      })
  }, [])

  if (loading || progressLoading || poetsLoading) {
    return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  }

  const dynastyProgressList: DynastyWithProgress[] = dynasties.map(d => {
    const dynastyPoets = allPoets.filter(p => p.dynasty_id === d.id)
    const regularPoets = dynastyPoets.filter(p => !p.is_boss)
    const bossPoet = dynastyPoets.find(p => p.is_boss)
    const completedPoets = regularPoets.filter(p => progressMap[p.id]?.completed).length
    const bossCompleted = bossPoet ? (progressMap[bossPoet.id]?.completed ?? false) : false

    return {
      id: d.id,
      sort_order: d.sort_order,
      unlock_requirement: d.unlock_requirement,
      completedPoets,
      totalPoets: regularPoets.length,
      bossCompleted,
    }
  })

  const unlockedDynastyIds = dynastyProgressList
    .map((dp, i) => ({ dp, prev: i > 0 ? dynastyProgressList[i - 1] : null, id: dynasties[i].id }))
    .filter(item => isDynastyUnlocked(item.dp, item.prev))
    .map(item => item.id)

  function startDailyChallenge(opts: { endless?: boolean } = {}) {
    const candidates = allPoets.filter(p => unlockedDynastyIds.includes(p.dynasty_id))
    if (candidates.length === 0) return
    const choice = candidates[Math.floor(Math.random() * candidates.length)]
    navigate(`/app/dynasty/${choice.dynasty_id}/challenge/${choice.id}`, { state: { daily: !opts.endless, endless: !!opts.endless } })
  }

  return (
    <div className="py-10 px-4 dynasty-accent-bar relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/70 dark:from-bg-primary/60 dark:to-bg-primary/80 pointer-events-none" aria-hidden />
      <div className="text-center mb-10 relative">
        <h1 className="font-serif text-4xl font-bold text-accent drop-shadow-sm">诗词天梯</h1>
        <p className="text-text-muted text-sm mt-2 font-kai">穿越千年，与诗人对话</p>
        <div className="absolute right-4 top-0 flex gap-3 text-sm">
          <button
            onClick={() => startDailyChallenge()}
            className="px-4 py-2 rounded-full bg-[var(--accent)] text-white shadow hover:shadow-lg transition-all active:translate-y-[1px]"
            aria-label="开始每日挑战"
          >
            每日挑战
          </button>
          <button
            onClick={() => startDailyChallenge({ endless: true })}
            className="px-4 py-2 rounded-full bg-[var(--dynasty-primary,var(--accent))] text-white shadow hover:shadow-lg transition-all active:translate-y-[1px]"
            aria-label="开启无尽模式"
          >
            无尽模式
          </button>
          <button
            onClick={() => navigate('/app/feihualing')}
            className="px-4 py-2 rounded-full bg-gold text-white shadow hover:shadow-lg transition-all active:translate-y-[1px]"
            aria-label="飞花令模式"
          >
            飞花令
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-6 px-4 max-w-5xl mx-auto snap-x snap-mandatory relative z-10">
        {dynasties.map((d, i) => {
          const dp = dynastyProgressList[i]
          const prevDp = i > 0 ? dynastyProgressList[i - 1] : null
          const unlocked = isDynastyUnlocked(dp, prevDp)
          const styleClass = DYNASTY_STYLES[d.name] ?? ''
          return (
            <DynastyCard
              key={d.id}
              dynasty={d}
              dp={dp}
              unlocked={unlocked}
              styleClass={styleClass}
              reducedData={reducedData}
            />
          )
        })}
      </div>
    </div>
  )
}

function DynastyCard({
  dynasty,
  dp,
  unlocked,
  styleClass,
  reducedData,
}: {
  dynasty: { id: number; display_name: string; name: string }
  dp: DynastyWithProgress
  unlocked: boolean
  styleClass: string
  reducedData: boolean
}) {
  const textures = useDynastyTextures(dynasty.name, { reducedData })
  const cardBgStyle = textures?.background
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.72) 100%), url(${textures.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  if (!unlocked) {
    return (
      <div data-locked className="flex-shrink-0 w-40 snap-center opacity-55">
        <div className="bg-bg-card rounded-2xl border-2 border-border-light p-6 text-center h-48 flex flex-col items-center justify-center backdrop-blur-sm" style={cardBgStyle}>
          <div className="text-4xl mb-3 text-text-muted">🔒</div>
          <span className="font-serif text-lg text-text-muted">{dynasty.display_name}</span>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/app/dynasty/${dynasty.id}`} className={`flex-shrink-0 w-44 snap-center ${styleClass}`}>
      <div
        className="relative bg-bg-card rounded-3xl border-2 border-[var(--dynasty-primary)] p-6 text-center h-56 flex flex-col items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
        style={cardBgStyle}
      >
        <div className="absolute inset-0 bg-white/65 dark:bg-bg-card/70 pointer-events-none" aria-hidden />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <DynastyBadge name={dynasty.display_name} />
          <div>
            <span className="font-serif text-lg font-bold text-[var(--dynasty-primary)] block">{dynasty.display_name}</span>
            <span className="text-xs text-text-muted font-kai">{dp.totalPoets} 首诗 • {dp.bossCompleted ? 'Boss已破' : 'Boss待挑战'}</span>
          </div>
          <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{ width: `${dp.totalPoets ? (dp.completedPoets / dp.totalPoets) * 100 : 0}%`, backgroundColor: 'var(--dynasty-primary)' }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
