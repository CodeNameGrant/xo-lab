/**
 * The variant rules contract: the one seam the whole app is built around.
 *
 * Every variant (Classic, Infinite, Ultimate, …) implements `VariantRules`
 * for its own state and move types. Rules are pure TypeScript: no React, no
 * browser APIs, no hidden state. That keeps them easy to test and lets a
 * future computer opponent drive any variant through the same interface.
 */

/** Player 1 always plays X; Player 2 always plays O. */
export type Player = 'X' | 'O'

export function otherPlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X'
}

export function playerName(player: Player): string {
  return player === 'X' ? 'Player 1' : 'Player 2'
}

export type Outcome =
  | { readonly kind: 'in-progress' }
  /** `highlight` lists what to light up: cells for Classic, small boards for Ultimate. */
  | { readonly kind: 'won'; readonly winner: Player; readonly highlight: readonly number[] }
  | { readonly kind: 'draw' }

export const IN_PROGRESS: Outcome = { kind: 'in-progress' }

/** Thrown by `applyMove` when a move breaks the rules. */
export class IllegalMoveError extends Error {
  override name = 'IllegalMoveError'
}

/**
 * @typeParam State     the variant's game state: plain JSON-serialisable data
 * @typeParam Move      one move: plain JSON-serialisable data
 * @typeParam Selectors read-only helpers only this variant's own board uses
 */
export interface VariantRules<State, Move, Selectors = unknown> {
  /** A fresh game in which `firstPlayer` moves first. */
  initialState(firstPlayer: Player): State
  /** Whose turn it is. Still answers after the game ends (the player who would move next). */
  currentPlayer(state: State): Player
  /** Every move the current player may make. Empty once the game is over. */
  legalMoves(state: State): readonly Move[]
  /** The state after `move`. Never modifies `state`. Throws `IllegalMoveError` for an illegal move. */
  applyMove(state: State, move: Move): State
  outcome(state: State): Outcome
  readonly selectors: Selectors
}
