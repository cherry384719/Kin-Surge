import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { StickerCard } from '../components/ui/StickerCard'
import { StatusPill } from '../components/ui/StatusPill'
import { apiRequest } from '../lib/api'
import { useSession } from '../providers/session'
import { buildChallengeDeck } from '../features/challenge/buildChallengeDeck'
import { matchAnswer } from '../features/challenge/matchAnswer'
import type { ChallengeQuestion, OrderingQuestion } from '../features/challenge/types'

interface ChallengePayload {
  user: {
    id: string
    display_name: string
    coins: number
  }
  dynasty: {
    id: number
    name: string
    display_name: string
  }
  poet: {
    id: number
    name: string
    challenge_intro: string
    is_boss: boolean
  }
  poems: Array<{
    id: number
    title: string
    curriculum_grade: string
  }>
  lines: Array<{
    id: number
    poem_id: number
    line_number: number
    text: string
  }>
}

interface CompletionPayload {
  passed: boolean
  stars: number
  coins_earned: number
  first_clear_bonus: number
  user: {
    id: string
    username: string
    display_name: string
    coins: number
    is_guest: boolean
  }
}

type Phase = 'intro' | 'quiz' | 'result'

export function ChallengePage() {
  const { poetId } = useParams<{ poetId: string }>()
  const navigate = useNavigate()
  const { user, logout, syncUser } = useSession()
  const [data, setData] = useState<ChallengePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<Phase>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [completion, setCompletion] = useState<CompletionPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!poetId) {
      return
    }

    apiRequest<ChallengePayload>(`/challenges/poets/${poetId}`)
      .then(setData)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [poetId])

  const deck = useMemo(() => (data ? buildChallengeDeck(data.lines) : []), [data])
  const currentQuestion = deck[questionIndex]

  if (!user) {
    return <Navigate to="/" replace />
  }

  async function finishChallenge(nextCorrectCount: number, nextMistakes: number) {
    if (!poetId) {
      return
    }

    const result = await apiRequest<CompletionPayload>(`/challenges/poets/${poetId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        correct_answers: nextCorrectCount,
        total_questions: deck.length,
        mistakes: nextMistakes,
      }),
    })

    syncUser(result.user)
    setCompletion(result)
    setPhase('result')
  }

  function advanceQuestion(nextCorrect = correctCount, nextMistakes = mistakes) {
    setFeedback(null)
    setInputValue('')
    setSelectedOrder([])

    if (questionIndex + 1 >= deck.length) {
      void finishChallenge(nextCorrect, nextMistakes)
      return
    }

    setQuestionIndex(previous => previous + 1)
  }

  function submitChoice(answer: string) {
    if (!currentQuestion || currentQuestion.type !== 'multiple-choice') {
      return
    }

    if (answer === currentQuestion.correctAnswer) {
      const nextCorrect = correctCount + 1
      setCorrectCount(nextCorrect)
      setFeedback('回答正确，继续向前。')
      window.setTimeout(() => advanceQuestion(nextCorrect, mistakes), 360)
      return
    }

    const nextMistakes = mistakes + 1
    setMistakes(nextMistakes)
    setFeedback(`正确答案：${currentQuestion.correctAnswer}`)
    window.setTimeout(() => advanceQuestion(correctCount, nextMistakes), 850)
  }

  function submitInput() {
    if (!currentQuestion || currentQuestion.type !== 'fill-blank') {
      return
    }

    const result = matchAnswer(currentQuestion.answer, inputValue)
    if (result === 'correct') {
      const nextCorrect = correctCount + 1
      setCorrectCount(nextCorrect)
      setFeedback('回答正确，继续向前。')
      window.setTimeout(() => advanceQuestion(nextCorrect, mistakes), 360)
      return
    }

    const nextMistakes = mistakes + 1
    setMistakes(nextMistakes)
    setFeedback(result === 'close' ? '很接近，但还不够准确。' : `正确答案：${currentQuestion.answer}`)
    window.setTimeout(() => advanceQuestion(correctCount, nextMistakes), 850)
  }

  function toggleOrder(line: string) {
    if (selectedOrder.includes(line)) {
      setSelectedOrder(previous => previous.filter(item => item !== line))
      return
    }
    setSelectedOrder(previous => [...previous, line])
  }

  function submitOrdering() {
    if (!currentQuestion || currentQuestion.type !== 'ordering') {
      return
    }

    const isCorrect = selectedOrder.join('') === currentQuestion.correctOrder.join('')
    if (isCorrect) {
      const nextCorrect = correctCount + 1
      setCorrectCount(nextCorrect)
      setFeedback('排序准确，节奏不错。')
      window.setTimeout(() => advanceQuestion(nextCorrect, mistakes), 360)
      return
    }

    const nextMistakes = mistakes + 1
    setMistakes(nextMistakes)
    setFeedback('排序有误，已记一次失误。')
    window.setTimeout(() => advanceQuestion(correctCount, nextMistakes), 850)
  }

  return (
    <AppShell
      title={data ? `${data.dynasty.display_name} · ${data.poet.name}` : '闯关中'}
      eyebrow="Challenge Run"
      user={user}
      onLogout={logout}
    >
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-64 animate-pulse rounded-[var(--radius-lg)] border-2 border-slate-200 bg-white/70" />
          <div className="h-96 animate-pulse rounded-[var(--radius-lg)] border-2 border-slate-200 bg-white/70" />
        </div>
      ) : error ? (
        <StickerCard tone="pink">
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <div className="mt-4">
            <Link to="/play" className="text-sm font-bold text-slate-600">返回首页</Link>
          </div>
        </StickerCard>
      ) : data && deck.length === 0 ? (
        <StickerCard tone="pink">
          <p className="text-sm font-semibold text-slate-700">当前诗人的题目还不足以生成挑战，请先补充更多诗句种子内容。</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/play')}>返回首页</Button>
          </div>
        </StickerCard>
      ) : data && currentQuestion ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <StickerCard tone="yellow" className="relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-2 border-slate-800 bg-[var(--secondary)]" aria-hidden />
            <div className="relative">
              <StatusPill tone={data.poet.is_boss ? 'yellow' : 'violet'}>{data.poet.is_boss ? 'Boss 关卡' : '普通关卡'}</StatusPill>
              <h2 className="mt-5 font-display text-4xl font-extrabold text-slate-900">{data.poet.name}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{data.poet.challenge_intro || '开卷有声，开始作答。'}</p>
              <div className="mt-8 space-y-4">
                <div className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">挑战进度</p>
                  <p className="mt-3 text-sm font-bold text-slate-700">第 {questionIndex + 1} / {deck.length} 题</p>
                  <div className="mt-4 h-4 rounded-full border-2 border-slate-800 bg-slate-100 p-1">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${((questionIndex + (phase === 'result' ? 1 : 0)) / deck.length) * 100}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">答对</p>
                    <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{correctCount}</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">失误</p>
                    <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{mistakes}</p>
                  </div>
                </div>
              </div>
            </div>
          </StickerCard>

          {phase === 'intro' ? (
            <StickerCard tone="white">
              <StatusPill tone="pink">开始前</StatusPill>
              <h3 className="mt-5 font-display text-4xl font-extrabold text-slate-900">这不是背诵页面，是一条有节奏的战线。</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                当前版本采用三段式挑战：选择题稳住节奏，填空题逼近记忆，排序题检查结构。答对率达到 60% 视为通关。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => setPhase('quiz')}>开始闯关</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>稍后再来</Button>
              </div>
            </StickerCard>
          ) : phase === 'quiz' ? (
            <StickerCard tone="pink">
              <QuestionCard
                question={currentQuestion}
                inputValue={inputValue}
                selectedOrder={selectedOrder}
                feedback={feedback}
                onInputChange={setInputValue}
                onChoice={submitChoice}
                onSubmitInput={submitInput}
                onToggleOrder={toggleOrder}
                onSubmitOrdering={submitOrdering}
              />
            </StickerCard>
          ) : completion ? (
            <StickerCard tone={completion.passed ? 'mint' : 'pink'}>
              <StatusPill tone={completion.passed ? 'mint' : 'pink'}>{completion.passed ? '挑战成功' : '挑战未过'}</StatusPill>
              <h3 className="mt-5 font-display text-4xl font-extrabold text-slate-900">
                {completion.passed ? '这轮已经拿下。' : '还差一点，继续磨。'}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {completion.passed
                  ? `本轮获得 ${completion.coins_earned} 金币${completion.first_clear_bonus > 0 ? `，其中包含 ${completion.first_clear_bonus} 首通奖励` : ''}。`
                  : '答对率未达到 60%，本轮不会写入通关记录。'}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ResultBox label="答对题数" value={`${correctCount}/${deck.length}`} />
                <ResultBox label="星级" value={completion.passed ? `${'★'.repeat(completion.stars)}${'☆'.repeat(3 - completion.stars)}` : '---'} />
                <ResultBox label="失误次数" value={`${mistakes}`} />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => navigate('/play')}>返回首页</Button>
                <Button variant="secondary" onClick={() => window.location.reload()}>再来一次</Button>
              </div>
            </StickerCard>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  )
}

function QuestionCard({
  question,
  inputValue,
  selectedOrder,
  feedback,
  onInputChange,
  onChoice,
  onSubmitInput,
  onToggleOrder,
  onSubmitOrdering,
}: {
  question: ChallengeQuestion
  inputValue: string
  selectedOrder: string[]
  feedback: string | null
  onInputChange: (value: string) => void
  onChoice: (answer: string) => void
  onSubmitInput: () => void
  onToggleOrder: (line: string) => void
  onSubmitOrdering: () => void
}) {
  return (
    <div>
      <StatusPill tone="violet">{question.promptLabel}</StatusPill>
      <h3 className="mt-5 font-display text-3xl font-extrabold text-slate-900">题面</h3>
      {question.type === 'ordering' ? (
        <OrderingQuestionPanel question={question} selectedOrder={selectedOrder} onToggleOrder={onToggleOrder} onSubmit={onSubmitOrdering} />
      ) : (
        <>
          <div className="mt-4 rounded-[var(--radius-lg)] border-2 border-slate-800 bg-white p-5 text-xl font-bold leading-9 text-slate-900">
            {question.prompt}
          </div>
          {question.type === 'multiple-choice' ? (
            <div className="mt-6 grid gap-3">
              {question.options.map(option => (
                <button key={option} className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4 text-left text-sm font-bold text-slate-700 transition-all hover:-translate-y-1 hover:bg-[var(--tertiary)]" onClick={() => onChoice(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <textarea
                value={inputValue}
                onChange={event => onInputChange(event.target.value)}
                className="min-h-36 w-full rounded-[var(--radius-lg)] border-2 border-slate-300 bg-white px-4 py-4 text-base font-medium leading-7 text-slate-800 focus:border-[var(--accent)] focus:outline-none focus:shadow-[4px_4px_0_0_var(--accent)]"
                placeholder="输入你记得的下一句"
              />
              <div className="mt-4">
                <Button onClick={onSubmitInput}>提交答案</Button>
              </div>
            </div>
          )}
        </>
      )}
      {feedback && <p className="mt-5 rounded-[var(--radius-md)] border-2 border-slate-800 bg-[var(--muted)] px-4 py-3 text-sm font-semibold text-slate-700">{feedback}</p>}
    </div>
  )
}

function OrderingQuestionPanel({
  question,
  selectedOrder,
  onToggleOrder,
  onSubmit,
}: {
  question: OrderingQuestion
  selectedOrder: string[]
  onToggleOrder: (line: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="mt-4">
      <p className="text-base leading-7 text-slate-600">点击下方诗句，按正确顺序拼出完整内容。</p>
      <div className="mt-4 min-h-24 rounded-[var(--radius-lg)] border-2 border-dashed border-slate-800 bg-white p-4">
        {selectedOrder.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {selectedOrder.map(item => (
              <button key={item} className="rounded-full border-2 border-slate-800 bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white" onClick={() => onToggleOrder(item)}>
                {item}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-400">你的排序会显示在这里</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {question.shuffledLines.map(item => (
          <button
            key={item}
            className={`rounded-[var(--radius-md)] border-2 border-slate-800 px-4 py-3 text-sm font-bold transition-all ${selectedOrder.includes(item) ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-[var(--quaternary)]'}`}
            onClick={() => onToggleOrder(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Button onClick={onSubmit}>提交排序</Button>
      </div>
    </div>
  )
}

function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border-2 border-slate-800 bg-white px-4 py-4 shadow-[4px_4px_0_0_var(--border)]">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  )
}
