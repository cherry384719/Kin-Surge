import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Backdrop } from './Backdrop'

interface AppShellProps {
  children: React.ReactNode
  title: string
  eyebrow: string
  user: {
    display_name: string
    coins: number
  }
  onLogout: () => Promise<void> | void
  homeHref?: string
}

export function AppShell({ children, title, eyebrow, user, onLogout, homeHref = '/play' }: AppShellProps) {
  return (
    <div className="screen-shell relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <Backdrop />
      <div className="page-enter relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="paper-panel mb-6 flex flex-col gap-4 rounded-[var(--radius-lg)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to={homeHref} className="inline-flex h-12 w-12 items-center justify-center rounded-[1.25rem] border-2 border-slate-800 bg-[var(--accent)] text-lg font-extrabold text-white shadow-[4px_4px_0_0_var(--shadow-ink)]">
              诗
            </Link>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-slate-500">{eyebrow}</p>
              <h1 className="font-display text-3xl font-extrabold text-slate-900">{title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border-2 border-slate-800 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-[4px_4px_0_0_var(--border)]">
              {user.display_name}
            </div>
            <div className="rounded-full border-2 border-slate-800 bg-[var(--tertiary)] px-4 py-2 text-sm font-extrabold text-slate-900 shadow-[4px_4px_0_0_var(--shadow-ink)]">
              金币 {user.coins}
            </div>
            <Button variant="secondary" onClick={() => void onLogout()}>退出</Button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
