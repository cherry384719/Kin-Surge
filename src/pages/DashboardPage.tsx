import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { StickerCard } from '../components/ui/StickerCard'
import { StatusPill } from '../components/ui/StatusPill'
import { apiRequest } from '../lib/api'
import { useSession } from '../providers/session'
import { getDynastyVisual } from '../features/content/dynastyArt'

interface DashboardData {
  user: {
    id: string
    display_name: string
    coins: number
  }
  summary: {
    completed_poets: number
    total_poets: number
  }
  dynasties: Array<{
    id: number
    name: string
    display_name: string
    sort_order: number
    unlocked: boolean
    completed_poets: number
    total_poets: number
    boss_completed: boolean
  }>
}

export function DashboardPage() {
  const { user, logout } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<DashboardData>('/dashboard')
      .then(setData)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell title="朝代总览" eyebrow="Stable Grid, Wild Decoration" user={user} onLogout={logout}>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <StickerCard tone="pink" className="relative overflow-hidden">
          <div className="absolute -right-8 top-10 h-40 w-40 rounded-full bg-[var(--tertiary)] opacity-80" aria-hidden />
          <div className="relative">
            <StatusPill tone="pink">主线主页</StatusPill>
            <h2 className="mt-5 max-w-2xl font-display text-4xl font-extrabold text-slate-900">从朝代走进诗词，把知识变成一路闯关的成就感。</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              每个朝代都有清晰的推进关系。先打通普通诗人，再解锁 Boss 综合关卡，整条成长线不再依赖第三方后端。
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MetricCard label="已通关诗人" value={`${data?.summary.completed_poets ?? 0}`} tone="yellow" />
              <MetricCard label="总诗人数量" value={`${data?.summary.total_poets ?? 0}`} tone="mint" />
              <MetricCard label="当前金币" value={`${data?.user.coins ?? user.coins}`} tone="violet" />
            </div>
          </div>
        </StickerCard>

        <StickerCard tone="yellow" className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500">当前节奏</p>
          <h3 className="mt-3 font-display text-3xl font-extrabold text-slate-900">把路径看得更直白。</h3>
          <ul className="mt-6 space-y-4 text-sm font-medium text-slate-700">
            <li className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4">1. 进入已解锁朝代，逐个击破常规诗人。</li>
            <li className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4">2. 通过 Boss 综合关后，下一朝代自动点亮。</li>
            <li className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4">3. 挑战结算即时写入本地 SQLite，Docker 部署不依赖外部服务。</li>
          </ul>
        </StickerCard>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500">Dynasty Ladder</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-900">选择一段历史，继续往前推。</h2>
          </div>
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-[var(--radius-lg)] border-2 border-slate-200 bg-white/70" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.dynasties.map((dynasty, index) => (
              <Link key={dynasty.id} to={dynasty.unlocked ? `/dynasties/${dynasty.id}` : '#'} className={dynasty.unlocked ? '' : 'pointer-events-none'}>
                <StickerCard tone={index % 3 === 0 ? 'pink' : index % 3 === 1 ? 'yellow' : 'mint'} className={`group relative h-full overflow-hidden ${dynasty.unlocked ? 'hover:-rotate-1 hover:scale-[1.02]' : 'opacity-60'}`}>
                  <DynastyCover name={dynasty.name} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <StatusPill tone={dynasty.boss_completed ? 'mint' : dynasty.unlocked ? 'violet' : 'slate'}>
                          {dynasty.boss_completed ? 'Boss 已破' : dynasty.unlocked ? '进行中' : '未解锁'}
                        </StatusPill>
                        <h3 className="mt-4 font-display text-3xl font-extrabold text-slate-900">{dynasty.display_name}</h3>
                      </div>
                      <div className="rounded-full border-2 border-slate-800 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 shadow-[4px_4px_0_0_var(--border)]">
                        #{dynasty.sort_order}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {dynasty.unlocked ? '已开放挑战，完成普通诗人后可进入 Boss 综合关。' : '需要先击败前一朝代 Boss，当前暂不可进入。'}
                    </p>
                    <div className="mt-auto pt-6">
                      <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-700">
                        <span>进度</span>
                        <span>{dynasty.completed_poets}/{dynasty.total_poets}</span>
                      </div>
                      <div className="h-4 rounded-full border-2 border-slate-800 bg-white p-1">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${dynasty.total_poets ? (dynasty.completed_poets / dynasty.total_poets) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </StickerCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

function DynastyCover({ name }: { name: string }) {
  const visual = getDynastyVisual(name)

  return (
    <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${visual.patternClass}`}>
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full border-2 border-slate-800 ${visual.orbClass} opacity-90`} />
      <div className={`absolute left-4 top-16 h-12 w-24 rounded-full border-2 border-dashed border-slate-800 ${visual.accentClass} opacity-55`} />
      <div className="absolute bottom-5 right-5 text-6xl font-black text-slate-900/10">{visual.symbol}</div>
      <div className="absolute inset-0 bg-white/70" />
    </div>
  )
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'yellow' | 'mint' | 'violet' }) {
  const bg = tone === 'yellow' ? 'bg-[var(--tertiary)]' : tone === 'mint' ? 'bg-[var(--quaternary)]' : 'bg-[var(--accent)] text-white'
  return (
    <div className={`rounded-[var(--radius-md)] border-2 border-slate-800 ${bg} px-4 py-4 shadow-[4px_4px_0_0_var(--shadow-ink)]`}>
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] opacity-75">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
    </div>
  )
}
