import { cn } from '../../lib/cn'

export function StatusPill({
  children,
  tone = 'violet',
  className,
}: {
  children: React.ReactNode
  tone?: 'violet' | 'pink' | 'yellow' | 'mint' | 'slate'
  className?: string
}) {
  const styles = {
    violet: 'bg-[var(--accent)] text-white',
    pink: 'bg-[var(--secondary)] text-white',
    yellow: 'bg-[var(--tertiary)] text-slate-900',
    mint: 'bg-[var(--quaternary)] text-slate-900',
    slate: 'bg-slate-100 text-slate-700',
  }[tone]

  return <span className={cn('inline-flex items-center rounded-full border-2 border-slate-800 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em]', styles, className)}>{children}</span>
}
