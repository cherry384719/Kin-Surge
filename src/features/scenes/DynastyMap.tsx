import { Link } from 'react-router-dom'
import { useDynasties } from './useDynasties'
import { useUser } from '../auth/AuthProvider'
import { useProgress } from '../progress/useProgress'
import { isDynastyUnlocked } from '../progress/unlockLogic'
import type { DynastyWithProgress } from '../progress/unlockLogic'

const DYNASTY_STYLES: Record<string, string> = {
  han: 'dynasty-han',
  weijin: 'dynasty-weijin',
  tang: 'dynasty-tang',
  song: 'dynasty-song',
  yuan: 'dynasty-yuan',
  mingqing: 'dynasty-mingqing',
}

export function DynastyMap() {
  const { dynasties, loading } = useDynasties()
  const { user } = useUser()
  const { loading: progressLoading } = useProgress(user?.id ?? '')

  if (loading || progressLoading) {
    return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  }

  const dynastyProgressList: DynastyWithProgress[] = dynasties.map(d => ({
    id: d.id,
    sort_order: d.sort_order,
    unlock_requirement: d.unlock_requirement,
    completedPoets: 0,
    totalPoets: 0,
    bossCompleted: false,
  }))

  return (
    <div className="py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-accent">诗词闯关</h1>
        <p className="text-text-muted text-sm mt-1 font-kai">穿越千年，与诗人对话</p>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-4 px-4 max-w-5xl mx-auto snap-x snap-mandatory">
        {dynasties.map((d, i) => {
          const dp = dynastyProgressList[i]
          const prevDp = i > 0 ? dynastyProgressList[i - 1] : null
          const unlocked = isDynastyUnlocked(dp, prevDp)
          const styleClass = DYNASTY_STYLES[d.name] ?? ''

          if (!unlocked) {
            return (
              <div
                key={d.id}
                data-locked
                className="flex-shrink-0 w-40 snap-center opacity-50"
              >
                <div className="bg-bg-card rounded-2xl border-2 border-border-light p-6 text-center h-48 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-3 text-text-muted">🔒</div>
                  <span className="font-serif text-lg text-text-muted">{d.display_name}</span>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={d.id}
              to={`/app/dynasty/${d.id}`}
              className={`flex-shrink-0 w-40 snap-center ${styleClass}`}
            >
              <div className="bg-bg-card rounded-2xl border-2 border-[var(--dynasty-primary)] p-6 text-center h-48 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-[var(--dynasty-primary)]/10 flex items-center justify-center mb-3">
                  <span className="font-serif text-2xl font-bold text-[var(--dynasty-primary)]">
                    {d.display_name.charAt(0)}
                  </span>
                </div>
                <span className="font-serif text-lg font-bold text-[var(--dynasty-primary)]">
                  {d.display_name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
