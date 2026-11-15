import { chooseMove, type AiLevel } from '../game/ai.ts'
import { seededRandom } from '../game/random.ts'
import { currentState, type Game } from '../game/session.ts'
import { findVariant } from '../variants/registry.ts'

/**
 * One question for the AI: the move to play in `game` of the variant `variantId`.
 * Plain data, so it can be posted to the worker as it is.
 */
export interface AiRequest {
  readonly id: number
  readonly variantId: string
  readonly game: Game<unknown>
  readonly level: AiLevel
  /** Seeds the search's randomness, so the same request always gets the same move. */
  readonly seed: number
}

export interface AiReply {
  readonly id: number
  readonly move: unknown
}

/** Answers a request: loads the variant's rules, rebuilds the state from the moves, and searches. */
export async function think(request: AiRequest): Promise<unknown> {
  const entry = findVariant(request.variantId)
  if (!entry) throw new Error(`No variant ${request.variantId}`)
  const rules = await entry.loadRules()
  return chooseMove(rules, currentState(rules, request.game), request.level, seededRandom(request.seed))
}
