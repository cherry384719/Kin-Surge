export interface DynastyWithProgress {
  id: number
  sort_order: number
  unlock_requirement: number
  completedPoets: number
  totalPoets: number
  bossCompleted?: boolean
}

export interface PoetWithProgress {
  id: number
  sort_order: number
  is_boss: boolean
  completed: boolean
  stars: number
}

export function isDynastyUnlocked(
  dynasty: DynastyWithProgress,
  previousDynasty: DynastyWithProgress | null,
): boolean {
  if (dynasty.sort_order === 1) return true
  if (!previousDynasty) return false
  return previousDynasty.bossCompleted === true
}

export function isPoetUnlocked(
  poet: PoetWithProgress,
  previousPoet: PoetWithProgress | null,
  allRegularCompleted: boolean,
): boolean {
  if (poet.is_boss) return allRegularCompleted
  if (poet.sort_order === 1) return true
  if (!previousPoet) return false
  return previousPoet.completed
}

export function calculateStars(mistakes: number, usedReveal: boolean): number {
  if (usedReveal) return 1
  if (mistakes === 0) return 3
  if (mistakes <= 2) return 2
  return 1
}
