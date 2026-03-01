interface Props {
  poetName: string
  intro: string
  dynastyName: string
  onStart: () => void
}

export function PoetIntro({ poetName, intro, dynastyName, onStart }: Props) {
  const displayIntro = intro || `${poetName}向你发起挑战！你能接住几招？`

  return (
    <div className="text-center py-12 px-4">
      <p className="text-xs text-text-muted mb-4 font-kai">{dynastyName}</p>
      <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--dynasty-primary, var(--accent)) 15%, transparent)' }}>
        <span className="font-serif text-3xl font-bold" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
          {poetName.charAt(0)}
        </span>
      </div>
      <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
        {poetName}
      </h2>
      <div className="bg-bg-secondary rounded-xl p-6 mb-8 max-w-md mx-auto border border-border-light">
        <p className="font-kai text-lg text-text-primary leading-relaxed">"{displayIntro}"</p>
      </div>
      <button
        onClick={onStart}
        className="px-10 py-3 rounded-xl text-white font-medium transition-colors text-lg"
        style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
      >
        开始挑战
      </button>
    </div>
  )
}
