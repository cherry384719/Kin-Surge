import { Link, useParams } from 'react-router-dom'
import { usePoets } from './usePoets'
import { useUser } from '../auth/AuthProvider'
import { useProgress } from '../progress/useProgress'
import { isPoetUnlocked } from '../progress/unlockLogic'
import type { PoetWithProgress } from '../progress/unlockLogic'

export function DynastyPage() {
  const { dynastyId } = useParams<{ dynastyId: string }>()
  const { poets, loading } = usePoets(Number(dynastyId))
  const { user } = useUser()
  const { progressMap, loading: progressLoading } = useProgress(user?.id ?? '')

  if (loading || progressLoading) {
    return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  }

  const regularPoets = poets.filter(p => !p.is_boss)
  const bossPoet = poets.find(p => p.is_boss)
  const allRegularCompleted = regularPoets.every(p => progressMap[p.id]?.completed)

  const poetsWithProgress: PoetWithProgress[] = poets.map(p => ({
    id: p.id,
    sort_order: p.sort_order,
    is_boss: p.is_boss,
    completed: progressMap[p.id]?.completed ?? false,
    stars: progressMap[p.id]?.stars ?? 0,
  }))

  function renderStars(stars: number) {
    return (
      <span className="text-gold text-sm">
        {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
      </span>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="text-center mb-8">
        <Link to="/app/home" className="text-text-muted text-sm hover:text-accent">← 返回朝代</Link>
        <h1 className="font-serif text-2xl font-bold text-accent mt-2">选择诗人</h1>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {regularPoets.map((p, i) => {
          const pw = poetsWithProgress.find(pw => pw.id === p.id)!
          const prevPw = i > 0 ? poetsWithProgress.find(pw => pw.id === regularPoets[i - 1].id)! : null
          const unlocked = isPoetUnlocked(pw, prevPw, false)

          if (!unlocked) {
            return (
              <div key={p.id} data-locked className="bg-bg-card rounded-xl border border-border-light p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-text-muted">🔒</span>
                  <div>
                    <p className="font-serif text-lg text-text-muted">{p.name}</p>
                    {p.bio_short && <p className="text-xs text-text-muted mt-0.5">{p.bio_short}</p>}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={p.id}
              to={`/app/challenge/${p.id}`}
              className="block bg-bg-card rounded-xl border border-border hover:border-accent p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-serif font-bold text-accent">{p.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-serif text-lg font-bold text-text-primary">{p.name}</p>
                    {p.bio_short && <p className="text-xs text-text-muted mt-0.5">{p.bio_short}</p>}
                  </div>
                </div>
                <div>
                  {pw.completed ? renderStars(pw.stars) : <span className="text-sm text-text-muted">未通关</span>}
                </div>
              </div>
            </Link>
          )
        })}

        {/* BOSS */}
        {bossPoet && (
          <div className="mt-6 pt-6 border-t border-border-light">
            {allRegularCompleted ? (
              <Link
                to={`/app/challenge/${bossPoet.id}?boss=true`}
                data-boss
                className="block bg-bg-card rounded-xl border-2 border-gold p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold text-xl">👑</span>
                    </div>
                    <div>
                      <p className="font-serif text-lg font-bold text-gold">{bossPoet.name}</p>
                      <p className="text-xs text-text-muted">综合挑战</p>
                    </div>
                  </div>
                  <span className="text-gold font-bold">BOSS</span>
                </div>
              </Link>
            ) : (
              <div data-boss data-locked className="bg-bg-card rounded-xl border-2 border-border-light p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-text-muted">🔒</span>
                  <div>
                    <p className="font-serif text-lg text-text-muted">{bossPoet.name}</p>
                    <p className="text-xs text-text-muted">通关所有诗人后解锁</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
