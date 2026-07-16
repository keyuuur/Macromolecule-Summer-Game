export function seededChoiceOrder<T>(choices: readonly T[], seed: number, salt: string): T[] {
  const ordered = [...choices]
  let state = mixSeed(seed, salt)

  for (let index = ordered.length - 1; index > 0; index -= 1) {
    state = nextRandom(state)
    const swapIndex = Math.floor((state / 0x1_0000_0000) * (index + 1))
    ;[ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]]
  }

  return ordered
}

function mixSeed(seed: number, salt: string): number {
  let mixed = seed >>> 0
  for (let index = 0; index < salt.length; index += 1) {
    mixed = Math.imul(mixed ^ salt.charCodeAt(index), 16777619) >>> 0
  }
  return mixed || 0x6d2b79f5
}

function nextRandom(value: number): number {
  let state = (value + 0x6d2b79f5) >>> 0
  state = Math.imul(state ^ (state >>> 15), state | 1)
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61)
  return (state ^ (state >>> 14)) >>> 0
}
