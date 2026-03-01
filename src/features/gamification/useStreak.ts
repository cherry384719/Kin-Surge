import { useEffect, useState } from 'react'

interface StreakState {
  streak: number
  lastPlayed: string | null
}

const STORAGE_KEY = 'kin-streak'

export function useStreak() {
  const [state, setState] = useState<StreakState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { streak: 0, lastPlayed: null }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  function markPlayed(today: Date = new Date()) {
    const todayStr = today.toISOString().slice(0, 10)
    if (state.lastPlayed === todayStr) return state

    const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const nextStreak = state.lastPlayed === yesterdayStr ? state.streak + 1 : 1
    const next = { streak: nextStreak, lastPlayed: todayStr }
    setState(next)
    return next
  }

  return { streak: state.streak, lastPlayed: state.lastPlayed, markPlayed }
}
