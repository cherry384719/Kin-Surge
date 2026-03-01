import { useState } from 'react'
import type { MultipleChoiceQuestion } from './challengeTypes'

interface Props {
  questions: MultipleChoiceQuestion[]
  onComplete: (result: { correct: number; total: number; mistakes: number }) => void
}

export function MultipleChoiceRound({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const q = questions[index]
  if (!q) return null

  const isCorrect = selected === q.correctAnswer
  const answered = selected !== null
  const isLast = index === questions.length - 1

  function handleSelect(option: string) {
    if (answered) return
    setSelected(option)
    if (option === q.correctAnswer) {
      setCorrect(prev => prev + 1)
    } else {
      setMistakes(prev => prev + 1)
    }
  }

  function handleNext() {
    if (isLast) {
      onComplete({ correct, total: questions.length, mistakes })
    } else {
      setIndex(prev => prev + 1)
      setSelected(null)
    }
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">第 {index + 1} / {questions.length} 题 · 选择题</p>
      <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light">
        <p className="text-xs text-text-muted mb-2">诗人说：</p>
        <p className="font-kai text-2xl text-text-primary leading-relaxed">{q.prompt}</p>
      </div>
      {!answered && (
        <div className="grid grid-cols-1 gap-3 mb-4">
          {q.options.map(option => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-3 rounded-xl border transition-colors font-kai text-lg border-border-light bg-bg-primary hover:border-[var(--dynasty-primary)] text-text-primary"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {answered && (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '正确！' : `答案是：${q.correctAnswer}`}
          </p>
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
