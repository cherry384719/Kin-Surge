import { isDynastyUnlocked, isPoetUnlocked, calculateStars } from './unlockLogic'
import type { DynastyWithProgress, PoetWithProgress } from './unlockLogic'

test('first dynasty is always unlocked', () => {
  const dynasty: DynastyWithProgress = {
    id: 1, sort_order: 1, unlock_requirement: 0,
    completedPoets: 0, totalPoets: 3,
  }
  expect(isDynastyUnlocked(dynasty, null)).toBe(true)
})

test('dynasty is locked if previous dynasty boss not completed', () => {
  const dynasty: DynastyWithProgress = {
    id: 2, sort_order: 2, unlock_requirement: 3,
    completedPoets: 0, totalPoets: 3,
  }
  const prev: DynastyWithProgress = {
    id: 1, sort_order: 1, unlock_requirement: 0,
    completedPoets: 2, totalPoets: 3, bossCompleted: false,
  }
  expect(isDynastyUnlocked(dynasty, prev)).toBe(false)
})

test('dynasty is unlocked if previous dynasty boss completed', () => {
  const dynasty: DynastyWithProgress = {
    id: 2, sort_order: 2, unlock_requirement: 3,
    completedPoets: 0, totalPoets: 3,
  }
  const prev: DynastyWithProgress = {
    id: 1, sort_order: 1, unlock_requirement: 0,
    completedPoets: 3, totalPoets: 3, bossCompleted: true,
  }
  expect(isDynastyUnlocked(dynasty, prev)).toBe(true)
})

test('first poet in dynasty is always unlocked', () => {
  const poet: PoetWithProgress = { id: 1, sort_order: 1, is_boss: false, completed: false, stars: 0 }
  expect(isPoetUnlocked(poet, null, false)).toBe(true)
})

test('poet is locked if previous poet not completed', () => {
  const poet: PoetWithProgress = { id: 2, sort_order: 2, is_boss: false, completed: false, stars: 0 }
  const prev: PoetWithProgress = { id: 1, sort_order: 1, is_boss: false, completed: false, stars: 0 }
  expect(isPoetUnlocked(poet, prev, false)).toBe(false)
})

test('poet is unlocked if previous poet completed', () => {
  const poet: PoetWithProgress = { id: 2, sort_order: 2, is_boss: false, completed: false, stars: 0 }
  const prev: PoetWithProgress = { id: 1, sort_order: 1, is_boss: false, completed: true, stars: 2 }
  expect(isPoetUnlocked(poet, prev, false)).toBe(true)
})

test('boss is locked until all regular poets completed', () => {
  const boss: PoetWithProgress = { id: 99, sort_order: 99, is_boss: true, completed: false, stars: 0 }
  expect(isPoetUnlocked(boss, null, false)).toBe(false)
})

test('boss is unlocked when all regular poets completed', () => {
  const boss: PoetWithProgress = { id: 99, sort_order: 99, is_boss: true, completed: false, stars: 0 }
  expect(isPoetUnlocked(boss, null, true)).toBe(true)
})

test('3 stars when no mistakes and no reveals', () => {
  expect(calculateStars(0, false)).toBe(3)
})

test('2 stars when 1-2 mistakes', () => {
  expect(calculateStars(1, false)).toBe(2)
  expect(calculateStars(2, false)).toBe(2)
})

test('1 star when used reveal', () => {
  expect(calculateStars(0, true)).toBe(1)
})
