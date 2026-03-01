import { Link } from 'react-router-dom'
import { ThemeToggle } from '../theme/ThemeToggle'
import { useUser } from '../auth/AuthProvider'
import { BackgroundFX } from './BackgroundFX'
import { useMotionPreference } from '../theme/useMotionPreference'
import { useAudioPreference } from '../theme/useAudioPreference'
import { useReducedData } from '../theme/useReducedData'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const { motionEnabled, toggleMotion } = useMotionPreference()
  const { audioEnabled, toggleAudio } = useAudioPreference()
  const { reducedData, toggleReducedData } = useReducedData()

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      <BackgroundFX tone="royal" intensity="med" motionEnabled={motionEnabled && !reducedData} />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-bg-card/80 backdrop-blur border-b border-border-light shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/app/home" className="font-serif text-xl font-bold text-accent hover:text-accent-hover transition-colors">
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

        <div className="max-w-5xl mx-auto px-4 py-2 flex justify-end gap-4 text-xs text-text-muted">
          <button onClick={toggleMotion} className="underline-offset-4 hover:underline">
            {motionEnabled ? '关闭动效' : '开启动效'}
          </button>
          <button onClick={toggleReducedData} className="underline-offset-4 hover:underline">
            {reducedData ? '关闭省流' : '开启省流'}
          </button>
          <button onClick={toggleAudio} className="underline-offset-4 hover:underline">
            {audioEnabled ? '关闭音效' : '开启音效'}
          </button>
        </div>
        <main className="pb-12">{children}</main>
      </div>
    </div>
  )
}
