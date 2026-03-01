import { useState, useRef } from 'react'
import { useFeihuaLing } from './useFeihuaLing'

interface Props {
  onComplete: (score: number) => void
}

interface Turn {
  speaker: 'player' | 'ai'
  text: string
}

export function FeihuaLing({ onComplete }: Props) {
  const { loading, startRound, getAiResponse, validatePlayerInput } = useFeihuaLing()
  const [started, setStarted] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const usedIds = useRef(new Set<number>())
  const score = useRef(0)
  const [displayKeyword, setDisplayKeyword] = useState('')

  function handleStart() {
    const k = startRound()
    setDisplayKeyword(k)
    setStarted(true)
    const aiLine = getAiResponse(usedIds.current)
    if (aiLine) {
      usedIds.current.add(aiLine.id)
      setTurns([{ speaker: 'ai', text: aiLine.text }])
    }
  }

  function handleSubmit() {
    if (!input.trim()) return
    setError('')
    if (!validatePlayerInput(input.trim())) {
      setError(`诗句中必须包含"${displayKeyword}"字`)
      return
    }
    const playerTurn: Turn = { speaker: 'player', text: input.trim() }
    score.current += 1
    setInput('')
    const aiLine = getAiResponse(usedIds.current)
    if (!aiLine) {
      setTurns(prev => [...prev, playerTurn, { speaker: 'ai', text: '（AI词穷了！你赢了！）' }])
      setGameOver(true)
      return
    }
    usedIds.current.add(aiLine.id)
    setTurns(prev => [...prev, playerTurn, { speaker: 'ai', text: aiLine.text }])
  }

  function handleGiveUp() {
    setGameOver(true)
  }

  if (loading) return <div className="text-text-muted text-center py-10">加载诗句库…</div>

  if (!started) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>飞花令</h2>
        <p className="text-text-secondary mb-6">轮流说出包含指定关键字的诗句</p>
        <button onClick={handleStart} className="px-8 py-3 rounded-xl text-white text-lg" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          开始
        </button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>飞花令结束</h2>
        <p className="text-text-secondary mb-2">关键字：{displayKeyword}</p>
        <p className="text-gold text-xl font-bold mb-6">你答出了 {score.current} 句</p>
        <button onClick={() => onComplete(score.current)} className="px-8 py-3 rounded-xl text-white" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          返回
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
          飞花令 · "{displayKeyword}"
        </h3>
        <span className="text-sm text-text-muted">已答 {score.current} 句</span>
      </div>
      <div className="bg-bg-secondary rounded-xl p-4 mb-4 max-h-60 overflow-y-auto space-y-2">
        {turns.map((turn, i) => (
          <div key={i} className={`flex ${turn.speaker === 'player' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-xl max-w-[80%] font-kai text-lg ${
              turn.speaker === 'player'
                ? 'bg-[var(--dynasty-primary,var(--accent))] text-white'
                : 'bg-bg-card text-text-primary border border-border-light'
            }`}>
              {turn.text}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-error text-sm mb-2">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={`输入包含"${displayKeyword}"的诗句…`}
          className="flex-1 border border-border-light rounded-xl px-4 py-3 font-kai text-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--dynasty-primary)]/50"
        />
        <button onClick={handleSubmit} className="px-6 py-3 rounded-xl text-white" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          出句
        </button>
      </div>
      <button onClick={handleGiveUp} className="w-full text-text-muted text-sm py-2 mt-2 hover:text-text-secondary">
        认输
      </button>
    </div>
  )
}
