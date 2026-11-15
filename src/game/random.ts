/**
 * A small seeded random number generator (mulberry32): the same seed always
 * gives the same numbers, so a game the AI played, or a random game in a
 * test, replays exactly. Returns numbers in [0, 1), like Math.random.
 */
export function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value + 0x6d2b79f5) >>> 0
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
