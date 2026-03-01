import { Link } from 'react-router-dom'
import { ThemeToggle } from '../theme/ThemeToggle'

interface HUDBarProps {
  dynastyName?: string
  coins?: number
  streak?: number
  energy?: number
  onHome?: () => void
  audioEnabled?: boolean
  onToggleAudio?: () => void
}

export function HUDBar({
  dynastyName,
  coins = 0,
  streak = 0,
  energy = 5,
  onHome,
  audioEnabled = true,
  onToggleAudio,
}: HUDBarProps) {
  const handleHome = () => {
    if (onHome) onHome()
  }

  return (
    <header className="hud sticky top-0 z-50 bg-bg-card/85 backdrop-blur border-b border-border-light">
      <div className="max-w-5xl mx-auto px-4 h-14 grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <button
          onClick={handleHome}
          className="flex items-center gap-2 text-sm font-serif text-accent hover:text-accent-hover transition-colors"
          aria-label="返回地图"
        >
          <span className="text-lg">⤶</span>
          <span>地图</span>
        </button>

        <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border-light shadow-sm">
            <span className="text-xs text-text-muted">朝代</span>
            <span className="font-serif text-base" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
              {dynastyName ?? '未知'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border-light shadow-sm">
            <span className="text-lg">💰</span>
            <span className="font-bold text-text-primary">{coins}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border-light shadow-sm">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-text-primary">{streak} 天</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onToggleAudio}
            aria-label={audioEnabled ? '关闭音效' : '开启动效'}
            className="p-2 rounded-lg border border-border-light hover:bg-bg-secondary transition-colors text-text-primary"
          >
            {audioEnabled ? '🔊' : '🔈'}
          </button>
          <ThemeToggle />
          <Link to="/app/home" className="text-sm text-text-muted hover:text-text-primary">首页</Link>
        </div>
      </div>
    </header>
  )
}
