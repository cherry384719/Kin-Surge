import { Link } from 'react-router-dom'
import { ThemeToggle } from '../theme/ThemeToggle'
import { useUser } from '../auth/AuthProvider'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-50 bg-bg-card/80 backdrop-blur border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/app/home" className="font-serif text-xl font-bold text-accent">
            通天路
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">
              {user?.user_metadata?.display_name ?? '旅人'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
