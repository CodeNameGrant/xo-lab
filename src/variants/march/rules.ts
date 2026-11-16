import { linesOfThree, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * March: a 4×4 board where each player starts with four pieces and nothing
 * is ever placed. On a turn, a player moves one of their own pieces one
 * square up, down, left or right into an empty square: no diagonal moves, no
 * jumping. The first to get three of their pieces in a row, across, down or
 * diagonally, wins. A player with no legal move ends the game in a draw.
 * There is no repetition rule (D-56).
 */
export interface MarchState {
  /** The 16 squares, numbered 0–15 left to right, top to bottom. */
  readonly cells: readonly Cell[]
  readonly turn: TwoPlayer
}

/** Move the piece on `from` one step to `to` (both 0–15). */
export interface MarchMove {
  readonly from: number
  readonly to: number
}

export interface MarchSelectors {
  cells(state: MarchState): readonly Cell[]
}

const SIZE = 4
/** Every line of three on the board: 8 across, 8 down and 8 diagonal. */
const LINES = linesOfThree(SIZE)

/**
 * Where the pieces start: each colour faces the other, two pieces at each end.
 *   X O X O
 *   . . . .
 *   . . . .
 *   O X O X
 */
const START: readonly Cell[] = ['X', 'O', 'X', 'O', ...Array<Cell>(8).fill(null), 'O', 'X', 'O', 'X']

/** The squares one step up, down, left and right of `square`, inside the board. */
function steps(square: number): number[] {
  const row = Math.floor(square / SIZE)
  const column = square % SIZE
  return [
    row > 0 ? square - SIZE : -1,
    row < SIZE - 1 ? square + SIZE : -1,
    column > 0 ? square - 1 : -1,
    column < SIZE - 1 ? square + 1 : -1,
  ].filter((next) => next >= 0)
}

/** Every move the player to move could make, ignoring whether the game is over. */
function moves(state: MarchState): MarchMove[] {
  return state.cells.flatMap((cell, from) =>
    cell === state.turn ? steps(from).flatMap((to) => (state.cells[to] === null ? [{ from, to }] : [])) : [],
  )
}

function outcome(state: MarchState): Outcome {
  const line = LINES.find(
    ([a, b, c]) => state.cells[a] !== null && state.cells[a] === state.cells[b] && state.cells[a] === state.cells[c],
  )
  if (line) {
    const winner = state.cells[line[0]]
    if (winner) return { kind: 'won', winner, highlight: line }
  }
  // A player who can't move ends the game: nobody wins (D-56).
  return moves(state).length === 0 ? { kind: 'draw' } : IN_PROGRESS
}

export const marchRules: VariantRules<MarchState, MarchMove, MarchSelectors> = {
  // A two-player variant is only ever started by X or O.
  initialState: (firstPlayer) => ({ cells: START, turn: firstPlayer === 'O' ? 'O' : 'X' }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    return outcome(state).kind === 'in-progress' ? moves(state) : []
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    const { from, to } = move
    const onBoard = (square: number) => Number.isInteger(square) && square >= 0 && square < SIZE * SIZE
    if (!onBoard(from) || !onBoard(to)) throw new IllegalMoveError(`No move from ${from} to ${to}`)
    if (state.cells[from] !== state.turn)
      throw new IllegalMoveError(`Square ${from} holds no piece of the player to move`)
    if (!steps(from).includes(to))
      throw new IllegalMoveError(`${to} is not one step up, down, left or right of ${from}`)
    if (state.cells[to] !== null) throw new IllegalMoveError(`Square ${to} is taken`)
    return { cells: state.cells.with(from, null).with(to, state.turn), turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
  },
}
