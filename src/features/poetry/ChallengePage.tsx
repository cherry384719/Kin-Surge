import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { matchAnswer } from './matchAnswer'
import type { MatchResult } from './matchAnswer'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'
import { useProgress } from '../progress/useProgress'
import { useDynastyInfo } from '../scenes/useDynastyInfo'
import { useStreak } from '../gamification/useStreak'
import { useEnergy } from '../gamification/useEnergy'
import { HUDBar } from '../layout/HUDBar'
import { BackgroundFX } from '../layout/BackgroundFX'
import { useMotionPreference } from '../theme/useMotionPreference'
import { useReducedData } from '../theme/useReducedData'
import { useAudioPreference } from '../theme/useAudioPreference'
import { useDynastyTextures } from '../theme/useDynastyTextures'
import { useSfx } from '../audio/useSfx'
import { supabase } from '../../lib/supabase'

export function ChallengePage() {
  const { poetId, dynastyId } = useParams<{ poetId: string; dynastyId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lines, poems, loading } = useChallenge(Number(poetId))
  const { user } = useUser()
  const { coins, awardCoins } = useCoins(user?.id ?? '')
  const { saveProgress } = useProgress(user?.id ?? '')
  const { dynasty, styleClass, bgClass } = useDynastyInfo(Number(dynastyId))
  const { streak, markPlayed } = useStreak()
  const { energy, consume } = useEnergy()
  const { motionEnabled } = useMotionPreference()
  const { reducedData } = useReducedData()
  const { audioEnabled, toggleAudio } = useAudioPreference()
  const textures = useDynastyTextures(dynasty?.name, { reducedData })
  const { playCorrect, playWrong, playUi } = useSfx({ enabled: audioEnabled })
  const isDaily = Boolean((location.state as any)?.daily)
  const isEndless = Boolean((location.state as any)?.endless)
  const [dailyBonusAwarded, setDailyBonusAwarded] = useState(false)
  const [nextEndless, setNextEndless] = useState<{ poetId: number; dynastyId: number } | null>(null)
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [usedReveal, setUsedReveal] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const savedRef = useRef(false)

  useEffect(() => {
    if (!isDaily) return
    const todayStr = new Date().toISOString().slice(0, 10)
    const last = localStorage.getItem('kin-daily-bonus')
    setDailyBonusAwarded(last === todayStr)
  }, [isDaily])

  useEffect(() => {
    if (!isEndless || !showResults) return
    async function fetchNext() {
      const { data } = await supabase
        .from('poets')
        .select('id, dynasty_id')
        .eq('dynasty_id', Number(dynastyId))
      if (!data || data.length === 0) return
      const others = data.filter(p => p.id !== Number(poetId))
      const pool = others.length > 0 ? others : data
      const choice = pool[Math.floor(Math.random() * pool.length)]
      setNextEndless({ poetId: choice.id, dynastyId: choice.dynasty_id })
    }
    fetchNext()
  }, [isEndless, showResults, dynastyId, poetId])

  if (loading) return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  if (lines.length < 2) return <div className="flex items-center justify-center py-20 text-text-muted">暂无题目</div>

  const totalPairs = Math.floor(lines.length / 2)
  const poetLine = lines[currentPairIndex * 2]
  const answerLine = lines[currentPairIndex * 2 + 1]
  const currentPoemTitle = poems.find(p => p.id === poetLine?.poem_id)?.title ?? ''

  function handleSubmit() {
    if (!answerLine) return
    if (energy <= 0) return
    consume(1)
    const result = matchAnswer(answerLine.text, input)
    setFeedback(result)
    if (result === 'correct') {
      awardCoins(10)
      markPlayed()
      playCorrect()
    } else if (result === 'wrong') {
      setMistakes(prev => prev + 1)
      playWrong()
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
    const dailyBonus = isDaily && !dailyBonusAwarded ? 50 : 0

    // Save progress once when results are shown
    if (!savedRef.current) {
      savedRef.current = true
      saveProgress(Number(poetId), stars, mistakes, usedReveal)
      if (dailyBonus > 0) {
        awardCoins(dailyBonus)
        localStorage.setItem('kin-daily-bonus', new Date().toISOString().slice(0, 10))
        setDailyBonusAwarded(true)
      }
    }

    return (
      <div className={`${styleClass} ${bgClass} min-h-screen relative overflow-hidden`}>
        <BackgroundFX
          tone="warm"
          intensity="med"
          motionEnabled={motionEnabled && !reducedData}
          textureUrl={textures?.background}
          overlayUrl={textures?.overlay}
        />
        <div className="relative z-10">
          <HUDBar
            dynastyName={dynasty?.display_name}
            coins={coins}
            streak={streak}
            energy={energy}
            onHome={() => navigate('/app/home')}
            audioEnabled={audioEnabled}
            onToggleAudio={toggleAudio}
          />
          <div className="flex items-center justify-center py-20 px-4">
            <div className="relative bg-bg-card rounded-2xl border border-[var(--dynasty-primary,var(--border))] p-8 text-center max-w-sm w-full shadow-xl overflow-hidden">
              <div className="sparkle-layer" aria-hidden>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} style={{ left: `${10 + i * 8}%`, animationDelay: `${i * 40}ms` }} />
                ))}
              </div>
              {dynasty && (
                <p className="text-xs text-text-muted mb-2 font-kai">{dynasty.display_name}</p>
              )}
              {isDaily && <p className="text-[10px] text-success mb-2">每日挑战</p>}
              {isEndless && <p className="text-[10px] text-warning mb-2">无尽模式</p>}
              <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>闯关完成！</h2>
              <div className="text-4xl mb-4">
                {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
              </div>
              <p className="text-text-secondary mb-2">获得 <span className="text-gold font-bold">{earnedCoins}</span> 金币{dailyBonus > 0 ? ` + 日常奖励 ${dailyBonus}` : ''}</p>
              <p className="text-text-muted text-sm mb-6">
                {mistakes === 0 ? '完美通关！' : `答错 ${mistakes} 次`}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full py-2.5 rounded-xl text-white transition-colors"
                  style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
                >
                  返回
                </button>
                {isEndless && nextEndless && (
                  <button
                    onClick={() => navigate(`/app/dynasty/${nextEndless.dynastyId}/challenge/${nextEndless.poetId}`, { state: { endless: true } })}
                    className="w-full py-2.5 rounded-xl border border-[var(--dynasty-primary)] text-[var(--dynasty-primary)] transition-colors bg-bg-primary"
                  >
                    继续无尽
                  </button>
                )}
              </div>
            </div>
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
    <div className={`${styleClass} ${bgClass} min-h-screen dynasty-accent-bar relative overflow-hidden`}>
      <BackgroundFX
        tone="royal"
        intensity="high"
        motionEnabled={motionEnabled && !reducedData}
        textureUrl={textures?.background}
        overlayUrl={textures?.overlay}
      />
      <div className="relative z-10">
        <HUDBar
          dynastyName={dynasty?.display_name}
          coins={coins}
          streak={streak}
          energy={energy}
          onHome={() => navigate('/app/home')}
          audioEnabled={audioEnabled}
          onToggleAudio={toggleAudio}
        />
        <div className="flex items-start justify-center py-10 px-4">
          <div className="bg-bg-card/95 backdrop-blur rounded-2xl border border-[var(--dynasty-primary,var(--border))] p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                {dynasty && (
                  <span className="text-xs text-text-muted font-kai block">{dynasty.display_name}</span>
                )}
                <span className="text-sm font-kai" style={{ color: 'var(--dynasty-primary, var(--text-muted))' }}>{currentPoemTitle}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gold font-bold">💰 {coins}</span>
                <span className="text-text-secondary">🔥 {streak} 天</span>
                <span className="text-text-secondary">⚡ {energy}/5</span>
              </div>
            </div>

            <div className="w-full bg-bg-secondary rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${((currentPairIndex + 1) / totalPairs) * 100}%`, backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
              />
            </div>
            <p className="text-xs text-text-muted text-right mb-4">
              第 {currentPairIndex + 1} / {totalPairs} 题
            </p>

            <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light shadow-inner">
              <p className="text-xs text-text-muted mb-2">诗人说：</p>
              <p className="font-kai text-2xl text-text-primary leading-relaxed">{poetLine?.text}</p>
            </div>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
              placeholder={energy > 0 ? '请填写下一句…' : '⚡ 体力不足，稍后再试'}
              disabled={feedback === 'correct' || feedback === 'wrong' || energy <= 0}
              className="w-full border border-border-light rounded-xl px-4 py-3 mb-4 text-lg font-kai bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--dynasty-primary)]/50 disabled:opacity-50"
            />

            {feedback ? (
              <div className="space-y-3">
                <p className={`text-lg font-bold ${feedbackConfig[feedback].color}`}>
                  {feedbackConfig[feedback].text}
                </p>
                {feedback === 'close' ? (
                  <button
                    onClick={() => { setFeedback(null); setInput(''); setMistakes(prev => prev + 1); }}
                    className="w-full py-2.5 rounded-xl text-white transition-colors"
                    style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
                  >
                    再试一次
                  </button>
                ) : (
                <button
                  onClick={() => { playUi(); handleNext() }}
                  className="w-full py-2.5 rounded-xl text-white transition-colors"
                  style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
                >
                  {currentPairIndex + 1 < totalPairs ? '下一题' : '查看结果'}
                </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { playUi(); handleSubmit() }}
                  className="w-full py-2.5 rounded-xl text-white font-medium transition-colors disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
                  disabled={energy <= 0}
                >
                  {energy > 0 ? '提交' : '体力恢复中…'}
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
      </div>
    </div>
  )
}
