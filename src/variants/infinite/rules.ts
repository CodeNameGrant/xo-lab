import { findLine, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type Player,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Infinite tic-tac-toe: each player keeps at most three marks on the board.
 * Placing a fourth removes that player's oldest mark, unless the move wins.
 * The board never fills, so there is no draw.
 */
export interface InfiniteState {
  /** Each player's marks on the board, as square indexes (0–8), oldest first. */
  readonly marks: { readonly X: readonly number[]; readonly O: readonly number[] }
  readonly turn: Player
}

/** The index (0–8) of the square to mark. */
export type InfiniteMove = number

export interface InfiniteSelectors {
  cells(state: InfiniteState): readonly Cell[]
  /**
   * The square whose mark will be removed if the player to move doesn't win:
   * their oldest mark, once they have three on the board. Null otherwise,
   * and once the game is over.
   */
  disappearsNext(state: InfiniteState): number | null
}

/** Most marks a player keeps on the board. */
const MAX_MARKS = 3

function cells(state: InfiniteState): readonly Cell[] {
  const result = Array<Cell>(9).fill(null)
  for (const square of state.marks.X) result[square] = 'X'
  for (const square of state.marks.O) result[square] = 'O'
  return result
}

function outcome(state: InfiniteState): Outcome {
  const found = findLine(cells(state))
  return found ? { kind: 'won', winner: found.winner, highlight: found.line } : IN_PROGRESS
}

export const infiniteRules: VariantRules<InfiniteState, InfiniteMove, InfiniteSelectors> = {
  initialState: (firstPlayer) => ({ marks: { X: [], O: [] }, turn: firstPlayer }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return cells(state).flatMap((cell, index) => (cell === null ? [index] : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move > 8) throw new IllegalMoveError(`No square ${move}`)
    if (cells(state)[move] !== null) throw new IllegalMoveError(`Square ${move} is taken`)

    const mover = state.turn
    const placed = [...state.marks[mover], move]
    const next: InfiniteState = { marks: { ...state.marks, [mover]: placed }, turn: otherPlayer(mover) }

    // The win check runs first: a winning move removes nothing, even when the oldest mark is in the line.
    if (outcome(next).kind === 'won' || placed.length <= MAX_MARKS) return next
    return { ...next, marks: { ...next.marks, [mover]: placed.slice(1) } }
  },

  outcome,

  selectors: {
    cells,
    disappearsNext(state) {
      if (outcome(state).kind !== 'in-progress') return null
      const own = state.marks[state.turn]
      return own.length === MAX_MARKS ? own[0] : null
    },
  },
}
