import { useState, useEffect } from 'react'
import type { OrderingQuestion } from './challengeTypes'

interface Props {
  questions: OrderingQuestion[]
  onComplete: (result: { correct: number; total: number; mistakes: number }) => void
}

export function OrderingRound({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [placed, setPlaced] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const q = questions[index]
  if (!q) return null

  const available = q.shuffledLines.filter(line => !placed.includes(line))
  const isCorrect = checked && placed.every((line, i) => line === q.correctOrder[i])
  const isLast = index === questions.length - 1

  // Auto-check when all lines are placed
  useEffect(() => {
    if (placed.length === q.shuffledLines.length && !checked) {
      const allCorrect = placed.every((line, i) => line === q.correctOrder[i])
      setChecked(true)
      if (allCorrect) {
        setCorrect(prev => prev + 1)
      } else {
        setMistakes(prev => prev + 1)
      }
    }
  }, [placed, q, checked])

  function handleSelect(line: string) {
    if (checked) return
    setPlaced(prev => [...prev, line])
  }

  function handleNext() {
    if (isLast) {
      onComplete({ correct, total: questions.length, mistakes })
    } else {
      setIndex(prev => prev + 1)
      setPlaced([])
      setChecked(false)
    }
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">第 {index + 1} / {questions.length} 题 · 排序题</p>

      {/* Placed lines area */}
      <div className="bg-bg-secondary rounded-xl p-4 mb-4 border border-border-light min-h-[60px]">
        <p className="text-xs text-text-muted mb-2">你的排列：</p>
        {placed.length === 0 && (
          <p className="text-text-muted text-sm">点击下方诗句，按正确顺序排列</p>
        )}
        <div className="space-y-2">
          {placed.map((line, i) => {
            let colorClass = 'text-text-primary'
            if (checked) {
              colorClass = line === q.correctOrder[i] ? 'text-success' : 'text-error'
            }
            return (
              <p key={`${line}-${i}`} className={`font-kai text-lg ${colorClass}`}>
                {line}
              </p>
            )
          })}
        </div>
      </div>

      {/* Available lines */}
      {!checked && available.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mb-4">
          {available.map(line => (
            <button
              key={line}
              onClick={() => handleSelect(line)}
              className="w-full text-left px-4 py-3 rounded-xl border transition-colors font-kai text-lg border-border-light bg-bg-primary hover:border-[var(--dynasty-primary)] text-text-primary"
            >
              {line}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '排列正确！' : '顺序不对，再接再厉！'}
          </p>
          {!isCorrect && (
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <p className="text-xs text-text-muted mb-2">正确顺序：</p>
              {q.correctOrder.map((line, i) => (
                <p key={`correct-${i}`} className="font-kai text-lg text-text-primary">{line}</p>
              ))}
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl text-white transition-colors"
            style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
          >
            {isLast ? '查看结果' : '下一题'}
          </button>
        </div>
      )}
    </div>
  )
}
