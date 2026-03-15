export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[var(--tertiary)] opacity-70 blur-[2px]" />
      <div className="absolute right-8 top-12 h-40 w-40 rounded-[40%] border-2 border-slate-800 bg-[var(--secondary)] opacity-80" />
      <div className="absolute bottom-24 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full border-2 border-dashed border-slate-800 bg-white/40" />
      <div className="absolute bottom-12 right-20 h-28 w-28 rounded-[2rem_2rem_2rem_0] bg-[var(--quaternary)]" />
      <div className="dot-grid absolute inset-x-0 top-0 h-80 opacity-50" />
      <div className="stripe-surface absolute right-0 top-1/3 h-56 w-56 rounded-full opacity-30" />
    </div>
  )
}
