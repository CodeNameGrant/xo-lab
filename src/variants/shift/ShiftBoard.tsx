import { useRef, useState, type PointerEvent } from 'react'
import type { Player } from '../../game/rules.ts'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { ShiftMove, ShiftSelectors, ShiftState } from './rules.ts'

/** The gap between tiles: `gap-2`, 8 px. The drag maths needs it in pixels. */
const GAP = 8
/** How far a press may move before it is a drag rather than a tap. */
const TAP_SLOP = 10

/** The window's grid lines, in the colour of the player to move (+ glow in dark). */
const LINE_COLOUR: Record<Player, string> = {
  X: 'bg-player-x dark:shadow-glow-x',
  O: 'bg-player-o dark:shadow-glow-o',
}

/** A press on the board, from pointer down until the tap or drag it turns into is over. */
interface Press {
  readonly pointer: number
  readonly startX: number
  readonly startY: number
  /** One tile plus one gap, in pixels: how far the window moves per step. */
  readonly step: number
  /** Whether it started inside the window, so moving it drags the window. */
  readonly onWindow: boolean
  /** Whether it has moved further than a tap may. */
  readonly moved: boolean
}

/** Where the window has been dragged to, in pixels from where it sits. */
interface Offset {
  readonly dx: number
  readonly dy: number
  /** One tile plus one gap, in pixels. */
  readonly step: number
}

/**
 * Shift's board: a 5×5 field of tiles with the 3×3 window drawn over it as
 * its four inner grid lines, a `#` with no outer border.
 *
 * Every press inside the window is a tap or a drag, told apart by how far it
 * moves. A tap on an empty tile places a mark. A press that moves more than
 * a few pixels drags the window instead and places nothing: the window
 * follows the pointer, at most one step each way, and on release snaps to the
 * nearest position; letting go where it started is not a move.
 *
 * Moving the window works only by dragging for now: there is no keyboard or
 * screen-reader way to do it yet (see docs/01-decisions.md, D-34).
 */
export function ShiftBoard({ state, rules, onMove }: BoardProps<ShiftState, ShiftMove, ShiftSelectors>) {
  const tiles = rules.selectors.tiles(state)
  const at = rules.selectors.window(state)
  const legal = rules.legalMoves(state)
  const outcome = rules.outcome(state)
  const over = outcome.kind !== 'in-progress'
  const highlight = outcome.kind === 'won' ? outcome.highlight : []

  const board = useRef<HTMLDivElement>(null)
  // The press is read and updated by every pointer event, which can arrive faster than React
  // re-renders, so it lives in a ref. Only the drag offset is state, because it is drawn.
  const press = useRef<Press | null>(null)
  // Whether the press that just ended moved. The click that follows a pointer-up comes after the
  // press has ended, so it reads this to tell a tap (place a mark) from a drag (place nothing).
  const lastMoved = useRef(false)
  const [offset, setOffset] = useState<Offset | null>(null)

  // The window position nearest to where it has been dragged.
  const nearest = (dragged: Offset | null) => {
    const steps = (pixels: number) => (dragged ? Math.round(pixels / dragged.step) : 0)
    return { row: at.row + steps(dragged?.dy ?? 0), column: at.column + steps(dragged?.dx ?? 0) }
  }
  const shown = nearest(offset)
  const inside = (tile: number) => {
    const row = Math.floor(tile / 5)
    const column = tile % 5
    return row >= shown.row && row < shown.row + 3 && column >= shown.column && column < shown.column + 3
  }

  /** How far the pointer has dragged the window: at most one step each way, never off the field. */
  function follow(current: Press, event: PointerEvent<HTMLDivElement>): Offset {
    const limit = (pixels: number, from: number) =>
      Math.max(-Math.min(1, from) * current.step, Math.min(Math.min(1, 2 - from) * current.step, pixels))
    return {
      dx: limit(event.clientX - current.startX, at.column),
      dy: limit(event.clientY - current.startY, at.row),
      step: current.step,
    }
  }

  function down(event: PointerEvent<HTMLDivElement>) {
    if (!board.current) return
    const box = board.current.getBoundingClientRect()
    const step = (box.width + GAP) / 5
    // Inside the window's square, gaps included, measured from its top-left corner.
    const x = event.clientX - box.left - at.column * step
    const y = event.clientY - box.top - at.row * step
    const span = 3 * step - GAP
    lastMoved.current = false
    press.current = {
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      step,
      onWindow: !over && x >= 0 && x <= span && y >= 0 && y <= span,
      moved: false,
    }
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = press.current
    if (!current || event.pointerId !== current.pointer) return
    // A mouse released off the board sends its pointer-up elsewhere; with no button held, the press is over.
    if (event.buttons === 0) {
      press.current = null
      setOffset(null)
      return
    }
    if (!current.moved && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > TAP_SLOP) {
      press.current = { ...current, moved: true }
      // From here the drag keeps every pointer event, even off the board; the tile pressed gets no click.
      if (current.onWindow) board.current?.setPointerCapture(event.pointerId)
    }
    if (press.current?.moved && current.onWindow) setOffset(follow(current, event))
  }

  function up(event: PointerEvent<HTMLDivElement>) {
    const current = press.current
    if (!current || event.pointerId !== current.pointer) return
    // Every pointer-up ends the press, so a mouse moving afterwards, with no button held, drags nothing.
    press.current = null
    lastMoved.current = current.moved
    if (!current.moved || !current.onWindow) return
    setOffset(null)
    // Where the pointer is let go counts, even if no move event arrived just before it.
    const target = nearest(follow(current, event))
    const to = target.row * 3 + target.column
    const windowMove = legal.find((candidate) => candidate.kind === 'window' && candidate.to === to)
    if (windowMove) onMove(windowMove)
  }

  return (
    <div
      ref={board}
      className="relative grid aspect-square w-[min(342px,100%)] touch-none grid-cols-5 grid-rows-5 gap-2 select-none"
      role="group"
      aria-label="Board"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => {
        press.current = null
        setOffset(null)
      }}
    >
      {tiles.map((cell, tile) => {
        const playable = legal.some((candidate) => candidate.kind === 'place' && candidate.tile === tile)
        const outside = !inside(tile)
        return (
          <button
            key={tile}
            type="button"
            // The tile shape of the 3×3 board (D-28). Tiles look the same inside and outside the window; only the marks outside it fade.
            className="flex min-h-11 min-w-11 items-center justify-center rounded-tile border border-grid bg-surface data-[win=O]:border-player-o data-[win=X]:border-player-x motion-safe:transition-colors motion-safe:duration-200 dark:data-win:bg-win light:data-[win=O]:bg-tint-o light:data-[win=X]:bg-tint-x"
            data-win={(highlight.includes(tile) && cell) || undefined}
            aria-label={`Row ${Math.floor(tile / 5) + 1}, column ${(tile % 5) + 1}, ${cell ?? 'empty'}${outside ? ', outside the board' : ''}`}
            // aria-disabled (not disabled) keeps every tile reachable for screen readers.
            aria-disabled={!playable}
            onClick={(event) => {
              // detail is 0 for a keyboard press, which has no pointer to have moved.
              const moved = event.detail > 0 && lastMoved.current
              lastMoved.current = false
              if (playable && !moved) onMove({ kind: 'place', tile })
            }}
          >
            {cell && (
              <Mark
                player={cell}
                size={40}
                // A mark outside the window is inactive: it stays on its tile at 40 %.
                className={`motion-safe:animate-place ${outside ? 'opacity-40' : ''}`}
              />
            )}
          </button>
        )
      })}

      {/* The window: four grid lines laid over the 3×3 tiles it covers, following the pointer while dragged. */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          gridRow: `${at.row + 1} / span 3`,
          gridColumn: `${at.column + 1} / span 3`,
          transform: offset ? `translate(${offset.dx}px, ${offset.dy}px)` : undefined,
        }}
      >
        {[
          'inset-y-0 left-[calc((100%-16px)/3)] w-2',
          'inset-y-0 left-[calc((100%-16px)*2/3+8px)] w-2',
          'inset-x-0 top-[calc((100%-16px)/3)] h-2',
          'inset-x-0 top-[calc((100%-16px)*2/3+8px)] h-2',
        ].map((place) => (
          <div
            key={place}
            className={`absolute rounded-full ${place} ${over ? 'bg-line' : LINE_COLOUR[state.turn]} ${offset ? 'opacity-90' : 'opacity-60'}`}
          />
        ))}
      </div>
    </div>
  )
}
