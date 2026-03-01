import { useNavigate } from 'react-router-dom'
import { FeihuaLing } from './FeihuaLing'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'
import { HUDBar } from '../layout/HUDBar'
import { BackgroundFX } from '../layout/BackgroundFX'
import { useMotionPreference } from '../theme/useMotionPreference'
import { useReducedData } from '../theme/useReducedData'
import { useAudioPreference } from '../theme/useAudioPreference'
import { useStreak } from '../gamification/useStreak'

export function FeihuaLingPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { coins, awardCoins } = useCoins(user?.id)
  const { streak } = useStreak()
  const { motionEnabled } = useMotionPreference()
  const { reducedData } = useReducedData()
  const { audioEnabled, toggleAudio } = useAudioPreference()

  function handleComplete(score: number) {
    if (score > 0) awardCoins(score * 10)
    navigate('/app/home')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundFX tone="royal" intensity="high" motionEnabled={motionEnabled && !reducedData} />
      <div className="relative z-10">
        <HUDBar dynastyName="飞花令" coins={coins} streak={streak} onHome={() => navigate('/app/home')} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
        <div className="flex items-start justify-center py-10 px-4">
          <div className="bg-bg-card/95 backdrop-blur rounded-2xl border border-border p-8 w-full max-w-2xl shadow-2xl">
            <FeihuaLing onComplete={handleComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}
