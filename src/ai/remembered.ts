import { parseAiLevel, type AiLevel } from '../game/ai.ts'

/**
 * Who last played Player 2 by choice: a person (null) or the AI at a level.
 * It is saved on the device, like the theme (D-49), so every two-player
 * variant opened from the hub starts with it. The address is still what a
 * game screen follows (D-46): the hub just puts the choice into its links.
 *
 * Storage can be unavailable (private browsing, blocked site data): then the
 * choice lasts until the page is closed.
 */

export const PLAYER_TWO_STORAGE_KEY = 'xo-lab:player-2'

/** Stored for a person, so "a person" is a choice too, not just nothing saved. */
const PERSON = 'person'

/** The choice made this session, used when storage can't be read or written. */
let unsavedChoice: AiLevel | null = null

export function rememberedPlayerTwo(): AiLevel | null {
  try {
    // Nothing saved, or anything unknown, is a person.
    return parseAiLevel(localStorage.getItem(PLAYER_TWO_STORAGE_KEY))
  } catch {
    // Storage unavailable: use the session's choice.
    return unsavedChoice
  }
}

/** Saves who plays Player 2: an AI level, or null for a person. */
export function rememberPlayerTwo(level: AiLevel | null) {
  unsavedChoice = level
  try {
    localStorage.setItem(PLAYER_TWO_STORAGE_KEY, level ?? PERSON)
  } catch {
    // Not saved, but `unsavedChoice` keeps it for this session.
  }
}

/** The address of a variant's game screen, with the remembered AI level if it has two players. */
export function playAddress(variantId: string, players: number): string {
  const level = players === 2 ? rememberedPlayerTwo() : null
  return level ? `/play/${variantId}?ai=${level}` : `/play/${variantId}`
}
