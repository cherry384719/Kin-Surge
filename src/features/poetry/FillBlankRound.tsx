import { useState } from 'react'
import { matchAnswer } from './matchAnswer'
import type { MatchResult } from './matchAnswer'
import type { FillBlankQuestion } from './challengeTypes'

interface Props {
  questions: FillBlankQuestion[]
  onComplete: (result: { correct: number; total: number; mistakes: number }) => void
}

export function FillBlankRound({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const q = questions[index]
  if (!q) return null

  const isLast = index === questions.length - 1

  function handleSubmit() {
    const result = matchAnswer(q.answer, input)
    setFeedback(result)
    if (result === 'correct') {
      setCorrect(prev => prev + 1)
    } else if (result === 'wrong') {
      setMistakes(prev => prev + 1)
    }
  }

  function handleRetry() {
    setFeedback(null)
    setInput('')
    setMistakes(prev => prev + 1)
  }

  function handleNext() {
    if (isLast) {
      onComplete({ correct, total: questions.length, mistakes })
    } else {
      setIndex(prev => prev + 1)
      setInput('')
      setFeedback(null)
    }
  }

  const feedbackConfig: Record<MatchResult, { text: string; color: string }> = {
    correct: { text: '正确！', color: 'text-success' },
    close: { text: '接近了，再试试！', color: 'text-warning' },
    wrong: { text: `答案是：${q.answer}`, color: 'text-error' },
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">第 {index + 1} / {questions.length} 题 · 填空题</p>
      <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light">
        <p className="text-xs text-text-muted mb-2">诗人说：</p>
        <p className="font-kai text-2xl text-text-primary leading-relaxed">{q.prompt}</p>
      </div>

      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
        placeholder="请填写下一句…"
        disabled={feedback === 'correct' || feedback === 'wrong'}
        className="w-full border border-border-light rounded-xl px-4 py-3 mb-4 text-lg font-kai bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--dynasty-primary)]/50 disabled:opacity-50"
      />

      {feedback ? (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${feedbackConfig[feedback].color}`}>
            {feedbackConfig[feedback].text}
          </p>
          {feedback === 'close' ? (
            <button onClick={handleRetry} className="w-full py-2.5 rounded-xl text-white transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
              再试一次
            </button>
          ) : (
            <button onClick={handleNext} className="w-full py-2.5 rounded-xl text-white transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
              {isLast ? '查看结果' : '下一题'}
            </button>
          )}
        </div>
      ) : (
        <button onClick={handleSubmit} className="w-full py-2.5 rounded-xl text-white font-medium transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          提交
        </button>
      )}
    </div>
  )
}
