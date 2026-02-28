import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { matchAnswer } from './matchAnswer'
import type { MatchResult } from './matchAnswer'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'

export function ChallengePage() {
  const { poetId } = useParams<{ poetId: string }>()
  const { lines, loading } = useChallenge(Number(poetId))
  const { user } = useUser()
  const { coins, awardCoins } = useCoins(user?.id ?? '')

  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)

  if (loading) return <div className="p-8 text-center">加载中…</div>
  if (lines.length < 2) return <div className="p-8 text-center">暂无题目</div>

  // Pairs: poet says even-indexed line, player answers with odd-indexed line
  const poetLine = lines[currentPairIndex * 2]
  const answerLine = lines[currentPairIndex * 2 + 1]

  function handleSubmit() {
    if (!answerLine) return
    const result = matchAnswer(answerLine.text, input)
    setFeedback(result)
    if (result === 'correct') awardCoins(10)
  }

  function handleNext() {
    const nextIndex = currentPairIndex + 1
    if (nextIndex * 2 + 1 < lines.length) {
      setCurrentPairIndex(nextIndex)
      setInput('')
      setFeedback(null)
    }
  }

  const feedbackLabels: Record<MatchResult, string> = {
    correct: '正确！',
    close: '接近了，再试试！',
    wrong: `答案是：${answerLine?.text}`,
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">
        <p className="text-sm text-right text-amber-700 mb-4">金币: {coins}</p>
        <p className="text-sm text-gray-500 mb-2">诗人说：</p>
        <p className="text-2xl font-bold text-amber-900 mb-6">{poetLine?.text}</p>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
          placeholder="请填写下一句…"
          disabled={!!feedback}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-lg"
        />

        {feedback ? (
          <div className="space-y-3">
            <p className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : feedback === 'close' ? 'text-yellow-600' : 'text-red-600'}`}>
              {feedbackLabels[feedback]}
            </p>
            <button
              onClick={handleNext}
              className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
            >
              下一句
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
          >
            提交
          </button>
        )}
      </div>
    </div>
  )
}
