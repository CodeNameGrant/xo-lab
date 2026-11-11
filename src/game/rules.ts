/**
 * The variant rules contract: the one seam the whole app is built around.
 *
 * Every variant (Classic, Infinite, Ultimate, …) implements `VariantRules`
 * for its own state and move types. Rules are pure TypeScript: no React, no
 * browser APIs, no hidden state. That keeps them easy to test and lets a
 * future computer opponent drive any variant through the same interface.
 */

/**
 * Player 1 always plays X, Player 2 always plays O, and Player 3, in a
 * three-player variant, always plays S, a star. How many players a variant
 * has is fixed: `players` in its `VariantInfo`.
 */
export type Player = 'X' | 'O' | 'S'

/** A player of a two-player variant. */
export type TwoPlayer = 'X' | 'O'

/** Every player, in turn order: Player 1, then Player 2, then Player 3. */
export const PLAYERS: readonly Player[] = ['X', 'O', 'S']

/** The players of a variant with `count` players, in turn order. */
export function playersOf(count: number): readonly Player[] {
  return PLAYERS.slice(0, count)
}

/** The player after `player` in a variant with `count` players: 1 → 2 → 3 → 1, or 1 → 2 → 1. */
export function nextPlayer(player: Player, count: number): Player {
  const order = playersOf(count)
  return order[(order.indexOf(player) + 1) % order.length]
}

/** In a two-player variant, the player who isn't `player`. */
export function otherPlayer(player: Player): TwoPlayer {
  return player === 'X' ? 'O' : 'X'
}

export function playerName(player: Player): string {
  return `Player ${PLAYERS.indexOf(player) + 1}`
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
  /** A fresh game in which `firstPlayer` moves first: one of the variant's own players. */
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
