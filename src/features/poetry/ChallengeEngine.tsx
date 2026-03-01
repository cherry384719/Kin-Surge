import { useState } from 'react'
import type { RoundConfig, FillBlankQuestion, MultipleChoiceQuestion, OrderingQuestion } from './challengeTypes'
import { MultipleChoiceRound } from './MultipleChoiceRound'
import { OrderingRound } from './OrderingRound'
import { FillBlankRound } from './FillBlankRound'

interface RoundResult {
  type: string
  correct: number
  total: number
  mistakes: number
}

interface Props {
  rounds: RoundConfig[]
  onAllComplete: (results: RoundResult[]) => void
}

export function ChallengeEngine({ rounds, onAllComplete }: Props) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [showRoundIntro, setShowRoundIntro] = useState(true)

  const currentRound = rounds[roundIndex]
  if (!currentRound) return null

  function handleRoundComplete(result: { correct: number; total: number; mistakes: number }) {
    const roundResult: RoundResult = { type: currentRound.type, ...result }
    const newResults = [...results, roundResult]
    setResults(newResults)

    if (roundIndex + 1 < rounds.length) {
      setRoundIndex(prev => prev + 1)
      setShowRoundIntro(true)
    } else {
      onAllComplete(newResults)
    }
  }

  if (showRoundIntro) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-text-muted mb-2">第 {roundIndex + 1} 轮 / 共 {rounds.length} 轮</p>
        <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
          {currentRound.label}
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          {currentRound.type === 'multiple-choice' && '选出正确的下一句'}
          {currentRound.type === 'fill-blank' && '填写正确的下一句'}
          {currentRound.type === 'ordering' && '将诗句排列成正确顺序'}
        </p>
        <button
          onClick={() => setShowRoundIntro(false)}
          className="px-8 py-2.5 rounded-xl text-white transition-colors"
          style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
        >
          开始
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-text-muted">第 {roundIndex + 1} 轮 · {currentRound.label}</p>
        <div className="flex gap-1">
          {rounds.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full ${
                i < roundIndex ? 'bg-success' :
                i === roundIndex ? 'bg-[var(--dynasty-primary,var(--accent))]' :
                'bg-bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      {currentRound.type === 'multiple-choice' && (
        <MultipleChoiceRound
          questions={currentRound.questions as MultipleChoiceQuestion[]}
          onComplete={handleRoundComplete}
        />
      )}
      {currentRound.type === 'fill-blank' && (
        <FillBlankRound
          questions={currentRound.questions as FillBlankQuestion[]}
          onComplete={handleRoundComplete}
        />
      )}
      {currentRound.type === 'ordering' && (
        <OrderingRound
          questions={currentRound.questions as OrderingQuestion[]}
          onComplete={handleRoundComplete}
        />
      )}
    </div>
  )
}
