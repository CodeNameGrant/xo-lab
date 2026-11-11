import { anyLineOpen, LINES, linesOfThree, type Cell, type Line } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type Player,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Shift: a 3×3 window over a 5×5 field of tiles. Each turn the player either
 * places a mark inside the window or moves the window one step in any of the
 * eight directions. Marks stay on their tiles; only marks inside the window
 * count. Three in a row inside the window wins, whether a placement or a move
 * of the window made it. A window move that makes a line for both players is
 * a draw, and so is a field where no line can ever be completed.
 */
export interface ShiftState {
  /** The 25 tiles, numbered 0–24 left to right, top to bottom. */
  readonly tiles: readonly Cell[]
  /** Where the window's top-left tile is, as a window position 0–8 (row × 3 + column, rows and columns 0–2). */
  readonly window: number
  readonly turn: Player
}

export type ShiftMove =
  /** Place a mark on an empty tile (0–24) inside the window. */
  | { readonly kind: 'place'; readonly tile: number }
  /** Move the window to a position (0–8) one step from where it is. */
  | { readonly kind: 'window'; readonly to: number }

export interface ShiftSelectors {
  tiles(state: ShiftState): readonly Cell[]
  /** The row and column (0–2) of the window's top-left tile. */
  window(state: ShiftState): { readonly row: number; readonly column: number }
  /** Whether a tile (0–24) is inside the window. */
  inWindow(state: ShiftState, tile: number): boolean
}

/** Tiles across the field. */
const FIELD = 5
/** The window starts in the centre, covering rows and columns 2–4. */
const CENTRE = 4
/** Every line of three on the field, for the "can anyone still win" check. */
const FIELD_LINES = linesOfThree(FIELD)

function windowAt(position: number) {
  return { row: Math.floor(position / 3), column: position % 3 }
}

/** The field tile under square `square` (0–8) of a window at `position`. */
function tileUnder(position: number, square: number): number {
  const { row, column } = windowAt(position)
  return (row + Math.floor(square / 3)) * FIELD + column + (square % 3)
}

function inWindow(state: ShiftState, tile: number): boolean {
  const { row, column } = windowAt(state.window)
  const tileRow = Math.floor(tile / FIELD)
  const tileColumn = tile % FIELD
  return tileRow >= row && tileRow < row + 3 && tileColumn >= column && tileColumn < column + 3
}

/** Whether two window positions are one step apart, straight or diagonally. */
function oneStep(from: number, to: number): boolean {
  const a = windowAt(from)
  const b = windowAt(to)
  return from !== to && Math.abs(a.row - b.row) <= 1 && Math.abs(a.column - b.column) <= 1
}

function outcome(state: ShiftState): Outcome {
  const under = (square: number) => tileUnder(state.window, square)
  const lines = LINES.map(([a, b, c]): Line => [under(a), under(b), under(c)])
  const won = new Map<Player, Set<number>>()
  for (const line of lines) {
    const mark = state.tiles[line[0]]
    if (mark && line.every((tile) => state.tiles[tile] === mark)) {
      const tiles = won.get(mark) ?? new Set<number>()
      for (const tile of line) tiles.add(tile)
      won.set(mark, tiles)
    }
  }
  // Only a window move can line up both players at once: a placement adds one mark of the mover's.
  if (won.size > 1) return { kind: 'draw' }
  for (const [winner, tiles] of won) {
    return { kind: 'won', winner, highlight: [...tiles].sort((a, b) => a - b) }
  }
  return anyLineOpen(state.tiles, FIELD_LINES) ? IN_PROGRESS : { kind: 'draw' }
}

function isTile(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) < FIELD * FIELD
}

export const shiftRules: VariantRules<ShiftState, ShiftMove, ShiftSelectors> = {
  initialState: (firstPlayer) => ({ tiles: Array<Cell>(FIELD * FIELD).fill(null), window: CENTRE, turn: firstPlayer }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    const places: ShiftMove[] = state.tiles.flatMap((cell, tile) =>
      cell === null && inWindow(state, tile) ? [{ kind: 'place', tile }] : [],
    )
    const windows: ShiftMove[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]
      .filter((to) => oneStep(state.window, to))
      .map((to) => ({ kind: 'window', to }))
    return [...places, ...windows]
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    const next = { turn: otherPlayer(state.turn) }

    if (move.kind === 'place') {
      if (!isTile(move.tile)) throw new IllegalMoveError(`No tile ${move.tile}`)
      if (!inWindow(state, move.tile)) throw new IllegalMoveError(`Tile ${move.tile} is outside the window`)
      if (state.tiles[move.tile] !== null) throw new IllegalMoveError(`Tile ${move.tile} is taken`)
      const tiles = state.tiles.with(move.tile, state.turn)
      return { ...state, ...next, tiles }
    }

    if (move.kind === 'window') {
      if (!Number.isInteger(move.to) || move.to < 0 || move.to > 8) {
        throw new IllegalMoveError(`No window position ${move.to}`)
      }
      if (!oneStep(state.window, move.to)) {
        throw new IllegalMoveError(`The window can only move one step, not from ${state.window} to ${move.to}`)
      }
      return { ...state, ...next, window: move.to }
    }

    throw new IllegalMoveError('Unknown move')
  },

  outcome,

  selectors: {
    tiles: (state) => state.tiles,
    window: (state) => windowAt(state.window),
    inWindow,
  },
}
