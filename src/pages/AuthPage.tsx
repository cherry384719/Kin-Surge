import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { StickerCard } from '../components/ui/StickerCard'
import { TextField } from '../components/ui/TextField'
import { StatusPill } from '../components/ui/StatusPill'
import { Backdrop } from '../components/layout/Backdrop'
import { useSession } from '../providers/session'

type AuthMode = 'login' | 'register'

export function AuthPage() {
  const { user, login, register, guestLogin, error } = useSession()
  const [mode, setMode] = useState<AuthMode>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/play" replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login({ identifier, password })
      } else {
        await register({ username, password, displayName, email })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGuest() {
    setSubmitting(true)
    try {
      await guestLogin()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="screen-shell relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <Backdrop />
      <div className="page-enter relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="relative">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <StatusPill tone="violet">Gin + SQLite</StatusPill>
            <StatusPill tone="yellow">重构版本</StatusPill>
            <StatusPill tone="mint">核心主线</StatusPill>
          </div>
          <h1 className="max-w-xl font-display text-5xl font-extrabold leading-[0.95] text-slate-900 sm:text-6xl">
            通天路，
            <span className="relative inline-block px-2 text-[var(--accent)]">
              在热闹的几何世界里
            </span>
            重新学诗。
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            从汉到明清，逐朝解锁诗人挑战。每一轮答题都会积累金币、推进进度，并把你的学习节奏收束成一条清晰的成长路径。
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StickerCard tone="yellow" className="rotate-[-2deg]">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">内容规模</p>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">50+</p>
              <p className="mt-2 text-sm text-slate-600">经典诗词种子数据直接入库，本地可扩展。</p>
            </StickerCard>
            <StickerCard tone="pink" className="translate-y-4 rotate-[2deg]">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">闯关结构</p>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">3 段</p>
              <p className="mt-2 text-sm text-slate-600">选择、填空、排序，逐层加压。</p>
            </StickerCard>
            <StickerCard tone="mint" className="rotate-[-1deg]">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">登录方式</p>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">2 + 1</p>
              <p className="mt-2 text-sm text-slate-600">用户名、邮箱、游客试玩。</p>
            </StickerCard>
          </div>
        </section>

        <section>
          <StickerCard tone="white" className="relative overflow-hidden">
            <div className="absolute right-4 top-4 h-16 w-16 rounded-full border-2 border-slate-800 bg-[var(--tertiary)]" aria-hidden />
            <div className="absolute bottom-4 left-4 h-12 w-24 rounded-full border-2 border-dashed border-slate-800 bg-[var(--quaternary)]/50" aria-hidden />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500">进入学习场</p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-900">{mode === 'login' ? '继续闯关' : '创建新身份'}</h2>
                </div>
                <div className="rounded-full border-2 border-slate-800 bg-slate-50 p-1">
                  <button className={`rounded-full px-4 py-2 text-sm font-bold ${mode === 'login' ? 'bg-[var(--accent)] text-white' : 'text-slate-500'}`} onClick={() => setMode('login')}>登录</button>
                  <button className={`rounded-full px-4 py-2 text-sm font-bold ${mode === 'register' ? 'bg-[var(--secondary)] text-white' : 'text-slate-500'}`} onClick={() => setMode('register')}>注册</button>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === 'register' ? (
                  <>
                    <TextField label="用户名" value={username} onChange={event => setUsername(event.target.value)} placeholder="qin_yun" autoComplete="username" />
                    <TextField label="显示名称" value={displayName} onChange={event => setDisplayName(event.target.value)} placeholder="青云" />
                    <TextField label="邮箱（可选）" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </>
                ) : (
                  <TextField label="用户名或邮箱" value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="qin_yun / you@example.com" autoComplete="username" />
                )}
                <TextField label="密码" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="至少 6 位" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                {error && <p className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-[var(--secondary)]/15 px-4 py-3 text-sm font-semibold text-slate-700">{error}</p>}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? '处理中...' : mode === 'login' ? '登录进入' : '创建账号'}</Button>
                  <Button type="button" variant="secondary" className="flex-1" disabled={submitting} onClick={() => void handleGuest()}>游客试玩</Button>
                </div>
              </form>
            </div>
          </StickerCard>
        </section>
      </div>
    </div>
  )
}
