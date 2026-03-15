import { cn } from '../../lib/cn'

export function StickerCard({
  children,
  className,
  tone = 'white',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'white' | 'pink' | 'mint' | 'yellow'
}) {
  const shadowClass = {
    white: 'shadow-[8px_8px_0_0_var(--border)]',
    pink: 'shadow-[8px_8px_0_0_var(--secondary)]',
    mint: 'shadow-[8px_8px_0_0_var(--quaternary)]',
    yellow: 'shadow-[8px_8px_0_0_var(--tertiary)]',
  }[tone]

  return (
    <div className={cn('sticker-card rounded-[var(--radius-lg)] border-2 border-slate-800 bg-white p-6 transition-all duration-300', shadowClass, className)}>
      {children}
    </div>
  )
}
