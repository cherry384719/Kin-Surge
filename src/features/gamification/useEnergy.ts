import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kin-energy'
const MAX_ENERGY = 5
const REFILL_INTERVAL_MIN = 20

interface EnergyState {
  energy: number
  lastRefill: number
}

export function useEnergy() {
  const [state, setState] = useState<EnergyState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { energy: MAX_ENERGY, lastRefill: Date.now() }
  })

  useEffect(() => {
    const id = window.setInterval(() => tick(), 60 * 1000)
    return () => window.clearInterval(id)
  }, [state.lastRefill, state.energy])

  function tick(now: number = Date.now()) {
    if (state.energy >= MAX_ENERGY) return
    const elapsedMin = (now - state.lastRefill) / (60 * 1000)
    if (elapsedMin >= REFILL_INTERVAL_MIN) {
      const gained = Math.floor(elapsedMin / REFILL_INTERVAL_MIN)
      const nextEnergy = Math.min(MAX_ENERGY, state.energy + gained)
      const nextState = { energy: nextEnergy, lastRefill: now }
      setState(nextState)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
    }
  }

  function consume(amount = 1) {
    if (state.energy < amount) return false
    const nextState = { energy: state.energy - amount, lastRefill: Date.now() }
    setState(nextState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
    return true
  }

  function refillAll() {
    const nextState = { energy: MAX_ENERGY, lastRefill: Date.now() }
    setState(nextState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  }

  return { energy: state.energy, consume, refillAll, tick }
}
