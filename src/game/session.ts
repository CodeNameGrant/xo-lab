import { nextPlayer, type Player, type VariantRules } from './rules.ts'

/**
 * One game of any variant, stored as who started plus the moves played.
 *
 * The current state is never stored: it is rebuilt by replaying the moves
 * from the initial state. That keeps saved games tiny and means a saved
 * game can be checked by replaying it through the rules.
 */
export interface Game<Move> {
  readonly firstPlayer: Player
  readonly moves: readonly Move[]
}

/** The very first game of a variant starts with Player 1 (X). */
export function startGame<Move>(firstPlayer: Player = 'X'): Game<Move> {
  return { firstPlayer, moves: [] }
}

export function currentState<State, Move>(rules: VariantRules<State, Move>, game: Game<Move>): State {
  return game.moves.reduce(rules.applyMove, rules.initialState(game.firstPlayer))
}

/**
 * The game with `move` added, or the same game object if the move is
 * illegal or the game is already over.
 */
export function playMove<State, Move>(rules: VariantRules<State, Move>, game: Game<Move>, move: Move): Game<Move> {
  const state = currentState(rules, game)
  if (rules.outcome(state).kind !== 'in-progress') return game
  try {
    rules.applyMove(state, move)
  } catch {
    return game
  }
  return { ...game, moves: [...game.moves, move] }
}

/**
 * A fresh game of the same variant, started by the next player along: the
 * first move passes one place along the turn order with each new game, so
 * with two players it alternates and with three it goes 1 → 2 → 3 → 1.
 * `players` is the variant's player count, from its `VariantInfo`.
 */
export function newGame<Move>(game: Game<Move>, players: number): Game<Move> {
  return startGame(nextPlayer(game.firstPlayer, players))
}
