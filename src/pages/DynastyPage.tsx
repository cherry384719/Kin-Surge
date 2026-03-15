import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { StickerCard } from '../components/ui/StickerCard'
import { StatusPill } from '../components/ui/StatusPill'
import { apiRequest } from '../lib/api'
import { useSession } from '../providers/session'
import { getDynastyVisual } from '../features/content/dynastyArt'

interface DynastyPayload {
  user: {
    id: string
    display_name: string
    coins: number
  }
  dynasty: {
    id: number
    name: string
    display_name: string
  }
  poets: Array<{
    id: number
    name: string
    bio_short: string
    sort_order: number
    is_boss: boolean
    unlocked: boolean
    completed: boolean
    stars: number
  }>
}

export function DynastyPage() {
  const { dynastyId } = useParams<{ dynastyId: string }>()
  const { user, logout } = useSession()
  const [data, setData] = useState<DynastyPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!dynastyId) {
      return
    }

    apiRequest<DynastyPayload>(`/dynasties/${dynastyId}`)
      .then(setData)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [dynastyId])

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell title={data?.dynasty.display_name ?? '朝代详情'} eyebrow="Poet Select" user={user} onLogout={logout}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/play" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">← 返回朝代总览</Link>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-slate-900">
            {data?.dynasty.display_name ?? '加载中'}
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            普通诗人按顺序解锁，Boss 关卡在全部普通诗人通关后开放。点击进入后会立刻进入多轮挑战。
          </p>
        </div>
        {data?.dynasty && (
          <div className="hidden h-32 w-48 overflow-hidden rounded-[var(--radius-lg)] border-2 border-slate-800 bg-white shadow-[6px_6px_0_0_var(--border)] lg:block">
            <DynastyHeaderArt name={data.dynasty.name} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-[var(--radius-lg)] border-2 border-slate-200 bg-white/70" />
          ))}
        </div>
      ) : error ? (
        <StickerCard tone="pink">
          <p className="text-sm font-semibold text-slate-700">{error}</p>
        </StickerCard>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.poets.map((poet, index) => (
            <Link key={poet.id} to={poet.unlocked ? `/challenge/${poet.id}` : '#'} className={poet.unlocked ? '' : 'pointer-events-none'}>
              <StickerCard tone={poet.is_boss ? 'yellow' : index % 2 === 0 ? 'white' : 'mint'} className={`relative h-full overflow-hidden ${poet.unlocked ? 'hover:rotate-[-1deg] hover:scale-[1.02]' : 'opacity-55'}`}>
                <div className={`absolute right-5 top-5 h-12 w-12 rounded-full border-2 border-slate-800 ${poet.is_boss ? 'bg-[var(--tertiary)]' : poet.completed ? 'bg-[var(--quaternary)]' : 'bg-[var(--secondary)]'}`} />
                <div className="relative flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={poet.is_boss ? 'yellow' : poet.completed ? 'mint' : poet.unlocked ? 'violet' : 'slate'}>
                      {poet.is_boss ? 'Boss' : poet.completed ? '已通关' : poet.unlocked ? '可挑战' : '未解锁'}
                    </StatusPill>
                    {!poet.is_boss && poet.completed && <StatusPill tone="slate">{'★'.repeat(poet.stars)}{'☆'.repeat(3 - poet.stars)}</StatusPill>}
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-extrabold text-slate-900">{poet.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{poet.bio_short || '进入挑战查看诗人开场对白。'}</p>
                  <div className="mt-auto pt-6 text-sm font-bold text-slate-700">
                    {poet.unlocked ? '点击进入闯关 →' : '先通关前置诗人'}
                  </div>
                </div>
              </StickerCard>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}

function DynastyHeaderArt({ name }: { name: string }) {
  const visual = getDynastyVisual(name)

  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${visual.patternClass}`}>
      <div className={`absolute left-4 top-4 h-16 w-16 rounded-full border-2 border-slate-800 ${visual.orbClass}`} />
      <div className={`absolute right-4 top-5 h-10 w-20 rounded-full border-2 border-dashed border-slate-800 ${visual.accentClass} opacity-70`} />
      <div className="absolute bottom-2 right-3 text-7xl font-black text-slate-900/15">{visual.symbol}</div>
      <div className="absolute bottom-3 left-4 rounded-full border-2 border-slate-800 bg-white px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-slate-600">
        {visual.label}
      </div>
    </div>
  )
}
