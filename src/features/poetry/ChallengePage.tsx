import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { matchAnswer } from './matchAnswer'
import type { MatchResult } from './matchAnswer'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'

export function ChallengePage() {
  const { poetId } = useParams<{ poetId: string }>()
  const navigate = useNavigate()
  const { lines, poems, loading } = useChallenge(Number(poetId))
  const { user } = useUser()
  const { coins, awardCoins } = useCoins(user?.id ?? '')

  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [usedReveal, setUsedReveal] = useState(false)
  const [showResults, setShowResults] = useState(false)

  if (loading) return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  if (lines.length < 2) return <div className="flex items-center justify-center py-20 text-text-muted">暂无题目</div>

  const totalPairs = Math.floor(lines.length / 2)
  const poetLine = lines[currentPairIndex * 2]
  const answerLine = lines[currentPairIndex * 2 + 1]
  const currentPoemTitle = poems.find(p => p.id === poetLine?.poem_id)?.title ?? ''

  function handleSubmit() {
    if (!answerLine) return
    const result = matchAnswer(answerLine.text, input)
    setFeedback(result)
    if (result === 'correct') {
      awardCoins(10)
    } else if (result === 'wrong') {
      setMistakes(prev => prev + 1)
    }
  }

  function handleReveal() {
    setUsedReveal(true)
    setFeedback('wrong')
  }

  function handleNext() {
    const nextIndex = currentPairIndex + 1
    if (nextIndex < totalPairs) {
      setCurrentPairIndex(nextIndex)
      setInput('')
      setFeedback(null)
    } else {
      setShowResults(true)
    }
  }

  if (showResults) {
    const stars = usedReveal ? 1 : mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
    const earnedCoins = totalPairs * 10

    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="bg-bg-card rounded-2xl border border-border p-8 text-center max-w-sm w-full">
          <h2 className="font-serif text-2xl font-bold text-accent mb-4">闯关完成！</h2>
          <div className="text-4xl mb-4">
            {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <p className="text-text-secondary mb-2">获得 <span className="text-gold font-bold">{earnedCoins}</span> 金币</p>
          <p className="text-text-muted text-sm mb-6">
            {mistakes === 0 ? '完美通关！' : `答错 ${mistakes} 次`}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    )
  }

  const feedbackConfig: Record<MatchResult, { text: string; color: string }> = {
    correct: { text: '正确！', color: 'text-success' },
    close: { text: '接近了，再试试！', color: 'text-warning' },
    wrong: { text: `答案是：${answerLine?.text}`, color: 'text-error' },
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="bg-bg-card rounded-2xl border border-border p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-text-muted font-kai">{currentPoemTitle}</span>
          <span className="text-sm text-gold font-bold">💰 {coins}</span>
        </div>

        <div className="w-full bg-bg-secondary rounded-full h-2 mb-6">
          <div
            className="bg-accent h-2 rounded-full transition-all"
            style={{ width: `${((currentPairIndex + 1) / totalPairs) * 100}%` }}
          />
        </div>
        <p className="text-xs text-text-muted text-right mb-4">
          第 {currentPairIndex + 1} / {totalPairs} 题
        </p>

        <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light">
          <p className="text-xs text-text-muted mb-2">诗人说：</p>
          <p className="font-kai text-2xl text-text-primary leading-relaxed">{poetLine?.text}</p>
        </div>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
          placeholder="请填写下一句…"
          disabled={feedback === 'correct' || feedback === 'wrong'}
          className="w-full border border-border-light rounded-xl px-4 py-3 mb-4 text-lg font-kai bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
        />

        {feedback ? (
          <div className="space-y-3">
            <p className={`text-lg font-bold ${feedbackConfig[feedback].color}`}>
              {feedbackConfig[feedback].text}
            </p>
            {feedback === 'close' ? (
              <button
                onClick={() => { setFeedback(null); setInput(''); setMistakes(prev => prev + 1); }}
                className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
              >
                再试一次
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
              >
                {currentPairIndex + 1 < totalPairs ? '下一题' : '查看结果'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              className="w-full bg-accent text-white py-2.5 rounded-xl hover:bg-accent-hover transition-colors font-medium"
            >
              提交
            </button>
            <button
              onClick={handleReveal}
              className="w-full text-text-muted text-sm py-1 hover:text-text-secondary transition-colors"
            >
              看答案
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
