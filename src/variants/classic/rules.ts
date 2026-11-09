import { findLine, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type Player,
  type VariantRules,
} from '../../game/rules.ts'

export interface ClassicState {
  readonly cells: readonly Cell[]
  readonly turn: Player
}

/** The index (0–8) of the square to mark. */
export type ClassicMove = number

export interface ClassicSelectors {
  cells(state: ClassicState): readonly Cell[]
}

function outcome(state: ClassicState): Outcome {
  const found = findLine(state.cells)
  if (found) return { kind: 'won', winner: found.winner, highlight: found.line }
  if (state.cells.every((cell) => cell !== null)) return { kind: 'draw' }
  return IN_PROGRESS
}

export const classicRules: VariantRules<ClassicState, ClassicMove, ClassicSelectors> = {
  initialState: (firstPlayer) => ({ cells: Array<Cell>(9).fill(null), turn: firstPlayer }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, index) => (cell === null ? [index] : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move > 8) throw new IllegalMoveError(`No square ${move}`)
    if (state.cells[move] !== null) throw new IllegalMoveError(`Square ${move} is taken`)
    const cells = state.cells.slice()
    cells[move] = state.turn
    return { cells, turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
  },
}
