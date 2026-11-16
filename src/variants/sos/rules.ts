import { linesOfThree, type Line } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * SOS: a 6×6 board where, on every turn, the player to move writes S or O in
 * any empty square. A move that spells S-O-S along a line of three, across,
 * down or diagonally, scores 1 for that player for each SOS it makes, and
 * they move again straight away. When the board is full, the most SOSs wins;
 * equal counts are a draw (D-59).
 */
export type Letter = 'S' | 'O'

/** One SOS: its three squares, in order along the line, and who made it. */
export interface Sos {
  readonly line: Line
  readonly by: TwoPlayer
}

export interface SosState {
  /** The letters on the 36 squares, numbered 0–35 left to right, top to bottom. */
  readonly cells: readonly (Letter | null)[]
  /** Every SOS made so far, in the order they were made. The letters alone can't say who made them. */
  readonly made: readonly Sos[]
  readonly turn: TwoPlayer
}

/** Which square (0–35) to write in, and which letter. */
export interface SosMove {
  readonly square: number
  readonly letter: Letter
}

export interface SosSelectors {
  cells(state: SosState): readonly (Letter | null)[]
  /** Every SOS made so far, and who made it. */
  made(state: SosState): readonly Sos[]
  /** How many SOSs each player has made. */
  counts(state: SosState): { readonly X: number; readonly O: number }
}

const SIZE = 6
const LETTERS = ['S', 'O'] as const
/** Every line of three on the board. */
const LINES = linesOfThree(SIZE)

function counts(state: SosState) {
  return {
    X: state.made.filter((sos) => sos.by === 'X').length,
    O: state.made.filter((sos) => sos.by === 'O').length,
  }
}

function outcome(state: SosState): Outcome {
  if (state.cells.some((cell) => cell === null)) return IN_PROGRESS
  const { X, O } = counts(state)
  if (X === O) return { kind: 'draw' }
  const squares = [...new Set(state.made.flatMap((sos) => sos.line))].sort((a, b) => a - b)
  return { kind: 'won', winner: X > O ? 'X' : 'O', highlight: squares }
}

export const sosRules: VariantRules<SosState, SosMove, SosSelectors> = {
  // A two-player variant is only ever started by X or O.
  initialState: (firstPlayer) => ({
    cells: Array<Letter | null>(SIZE * SIZE).fill(null),
    made: [],
    turn: firstPlayer === 'O' ? 'O' : 'X',
  }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, square) => (cell === null ? LETTERS.map((letter) => ({ square, letter })) : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    const { square, letter } = move
    if (!Number.isInteger(square) || square < 0 || square >= SIZE * SIZE)
      throw new IllegalMoveError(`No square ${square}`)
    if (letter !== 'S' && letter !== 'O') throw new IllegalMoveError(`No letter ${String(letter)}`)
    if (state.cells[square] !== null) throw new IllegalMoveError(`Square ${square} is taken`)

    const cells = state.cells.with(square, letter)
    // A line spells SOS only once, on the move that fills its last square: the squares never change after.
    const scored = LINES.filter(
      ([a, b, c]) => [a, b, c].includes(square) && cells[a] === 'S' && cells[b] === 'O' && cells[c] === 'S',
    ).map((line): Sos => ({ line, by: state.turn }))

    return {
      cells,
      made: [...state.made, ...scored],
      // Scoring earns another turn straight away; otherwise the turn passes (D-59).
      turn: scored.length > 0 ? state.turn : otherPlayer(state.turn),
    }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
    made: (state) => state.made,
    counts,
  },
}
