import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { buildRounds } from './challengeTypes'
import { ChallengeEngine } from './ChallengeEngine'
import { PoetIntro } from './PoetIntro'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'
import { useProgress } from '../progress/useProgress'
import { useDynastyInfo } from '../scenes/useDynastyInfo'
import { useStreak } from '../gamification/useStreak'
import { HUDBar } from '../layout/HUDBar'
import { BackgroundFX } from '../layout/BackgroundFX'
import { useMotionPreference } from '../theme/useMotionPreference'
import { useReducedData } from '../theme/useReducedData'
import { useAudioPreference } from '../theme/useAudioPreference'
import { useDynastyTextures } from '../theme/useDynastyTextures'
import { supabase } from '../../lib/supabase'

type Phase = 'intro' | 'challenge' | 'results'

export function ChallengePage() {
  const { poetId, dynastyId } = useParams<{ poetId: string; dynastyId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lines, poet, loading } = useChallenge(Number(poetId))
  const { user } = useUser()
  const userId = user?.id
  const { coins, awardCoins } = useCoins(userId)
  const { saveProgress } = useProgress(userId ?? '')
  const { dynasty, styleClass, bgClass } = useDynastyInfo(Number(dynastyId))
  const { streak, markPlayed } = useStreak()
  const { motionEnabled } = useMotionPreference()
  const { reducedData } = useReducedData()
  const { audioEnabled, toggleAudio } = useAudioPreference()
  const textures = useDynastyTextures(dynasty?.name, { reducedData })
  const isDaily = Boolean((location.state as any)?.daily)
  const isEndless = Boolean((location.state as any)?.endless)
  const [dailyBonusAwarded, setDailyBonusAwarded] = useState(false)
  const [nextEndless, setNextEndless] = useState<{ poetId: number; dynastyId: number } | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [roundResults, setRoundResults] = useState<{ type: string; correct: number; total: number; mistakes: number }[]>([])
  const savedRef = useRef(false)

  useEffect(() => {
    if (!isDaily) return
    const todayStr = new Date().toISOString().slice(0, 10)
    const last = localStorage.getItem('kin-daily-bonus')
    setDailyBonusAwarded(last === todayStr)
  }, [isDaily])

  useEffect(() => {
    if (!isEndless || phase !== 'results') return
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
  }, [isEndless, phase, dynastyId, poetId])

  if (!userId || loading) return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  if (lines.length < 2) return <div className="flex items-center justify-center py-20 text-text-muted">暂无题目</div>

  const rounds = buildRounds(lines)

  function handleAllComplete(results: typeof roundResults) {
    setRoundResults(results)
    markPlayed()
    setPhase('results')
  }

  // --- RESULTS PHASE ---
  if (phase === 'results') {
    const totalCorrect = roundResults.reduce((sum, r) => sum + r.correct, 0)
    const totalMistakes = roundResults.reduce((sum, r) => sum + r.mistakes, 0)
    const passed = totalCorrect > 0
    const stars = !passed ? 0 : totalMistakes === 0 ? 3 : totalMistakes <= 2 ? 2 : 1
    const earnedCoins = passed ? totalCorrect * 10 : 0
    const dailyBonus = passed && isDaily && !dailyBonusAwarded ? 50 : 0

    if (passed && !savedRef.current) {
      savedRef.current = true
      saveProgress(Number(poetId), stars, totalMistakes, false)
      awardCoins(earnedCoins + dailyBonus)
      if (dailyBonus > 0) {
        localStorage.setItem('kin-daily-bonus', new Date().toISOString().slice(0, 10))
        setDailyBonusAwarded(true)
      }
    }

    return (
      <div className={`${styleClass} ${bgClass} min-h-screen relative overflow-hidden`}>
        <BackgroundFX tone="warm" intensity="med" motionEnabled={motionEnabled && !reducedData} textureUrl={textures?.background} overlayUrl={textures?.overlay} />
        <div className="relative z-10">
          <HUDBar dynastyName={dynasty?.display_name} coins={coins} streak={streak} onHome={() => navigate('/app/home')} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
          <div className="flex items-center justify-center py-10 px-4">
            <div className="relative bg-bg-card rounded-2xl border border-[var(--dynasty-primary,var(--border))] p-8 text-center max-w-sm w-full shadow-xl overflow-hidden">
              <div className="sparkle-layer" aria-hidden>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} style={{ left: `${10 + i * 8}%`, animationDelay: `${i * 40}ms` }} />
                ))}
              </div>
              {dynasty && <p className="text-xs text-text-muted mb-2 font-kai">{dynasty.display_name}</p>}
              {isDaily && <p className="text-[10px] text-success mb-2">每日挑战</p>}
              {isEndless && <p className="text-[10px] text-warning mb-2">无尽模式</p>}
              <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
                {passed ? '闯关完成！' : '未通过，需至少答对一题'}
              </h2>
              {passed && (
                <>
                  <div className="text-4xl mb-4">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
                  <div className="text-left bg-bg-secondary rounded-xl p-4 mb-4">
                    {roundResults.map((r, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-text-muted">{r.type === 'multiple-choice' ? '选择题' : r.type === 'fill-blank' ? '填空题' : '排序题'}</span>
                        <span className="text-text-primary">{r.correct}/{r.total} 正确</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-text-secondary mb-2">
                    获得 <span className="text-gold font-bold">{earnedCoins}</span> 金币
                    {dailyBonus > 0 ? ` + 日常奖励 ${dailyBonus}` : ''}
                  </p>
                  <p className="text-text-muted text-sm mb-6">
                    {totalMistakes === 0 ? '完美通关！' : `答错 ${totalMistakes} 次`}
                  </p>
                </>
              )}
              {!passed && <p className="text-text-muted text-sm mb-6">请至少答对一题后再试。</p>}
              <div className="space-y-2">
                <button onClick={() => navigate(-1)} className="w-full py-2.5 rounded-xl text-white transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
                  返回
                </button>
                {passed && isEndless && nextEndless && (
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

  // --- INTRO + CHALLENGE PHASES ---
  return (
    <div className={`${styleClass} ${bgClass} min-h-screen dynasty-accent-bar relative overflow-hidden`}>
      <BackgroundFX tone="royal" intensity="high" motionEnabled={motionEnabled && !reducedData} textureUrl={textures?.background} overlayUrl={textures?.overlay} />
      <div className="relative z-10">
        <HUDBar dynastyName={dynasty?.display_name} coins={coins} streak={streak} onHome={() => navigate('/app/home')} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
        <div className="flex items-start justify-center py-10 px-4">
          <div className="bg-bg-card/95 backdrop-blur rounded-2xl border border-[var(--dynasty-primary,var(--border))] p-8 w-full max-w-2xl shadow-2xl">
            {phase === 'intro' && (
              <PoetIntro
                poetName={poet?.name ?? '诗人'}
                intro={poet?.challenge_intro ?? ''}
                dynastyName={dynasty?.display_name ?? ''}
                onStart={() => setPhase('challenge')}
              />
            )}
            {phase === 'challenge' && (
              <ChallengeEngine rounds={rounds} onAllComplete={handleAllComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
