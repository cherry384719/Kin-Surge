export type MatchResult = 'correct' | 'close' | 'wrong'

// Common traditional → simplified mappings for characters found in classic poetry
const tradToSimp: Record<string, string> = {
  '鄉': '乡', '頭': '头', '舉': '举', '書': '书', '學': '学',
  '風': '风', '雲': '云', '龍': '龙', '鳳': '凤', '聲': '声',
  '國': '国', '門': '门', '開': '开', '關': '关', '東': '东',
  '長': '长', '萬': '万', '無': '无', '來': '来', '飛': '飞',
}

function normalize(s: string): string {
  return [...s.trim()].map(ch => tradToSimp[ch] ?? ch).join('')
}

function charSimilarity(a: string, b: string): number {
  const charsA = [...a]
  const charsB = [...b]
  const maxLen = Math.max(charsA.length, charsB.length)
  if (maxLen === 0) return 1
  let matches = 0
  for (let i = 0; i < Math.min(charsA.length, charsB.length); i++) {
    if (charsA[i] === charsB[i]) matches++
  }
  return matches / maxLen
}

/**
 * Compare a player's answer against the correct poem line.
 * Uses character-level similarity with traditional/simplified normalization.
 * Returns 'correct' (>= 0.8), 'close' (>= 0.5), or 'wrong'.
 */
export function matchAnswer(correct: string, playerInput: string): MatchResult {
  const normCorrect = normalize(correct)
  const normInput = normalize(playerInput)

  // Exact match after normalization
  if (normCorrect === normInput) return 'correct'

  const similarity = charSimilarity(normCorrect, normInput)

  if (similarity >= 0.85) return 'correct'
  if (similarity >= 0.5) return 'close'
  return 'wrong'
}
