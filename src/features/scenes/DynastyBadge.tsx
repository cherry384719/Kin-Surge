interface DynastyBadgeProps {
  name: string
  styleClass?: string
}

export function DynastyBadge({ name, styleClass = '' }: DynastyBadgeProps) {
  return (
    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${styleClass}`}>
      <div className="absolute inset-0 rounded-full bg-[var(--dynasty-primary,var(--accent))]/15 blur-[10px]" aria-hidden />
      <div className="relative w-full h-full rounded-full bg-[var(--dynasty-primary,var(--accent))]/10 border-2 border-[var(--dynasty-primary,var(--accent))] flex items-center justify-center shadow-inner">
        <span className="font-serif text-2xl font-bold text-[var(--dynasty-primary,var(--accent))]">{name.charAt(0)}</span>
      </div>
    </div>
  )
}
