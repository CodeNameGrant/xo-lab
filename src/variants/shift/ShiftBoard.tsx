import { useRef, useState, type PointerEvent } from 'react'
import type { Player } from '../../game/rules.ts'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { ShiftMove, ShiftSelectors, ShiftState } from './rules.ts'

/** The gap between tiles: `gap-2`, 8 px. The drag maths needs it in pixels. */
const GAP = 8
/** How far a press on a tile may move before it stops counting as a tap. */
const TAP_SLOP = 10

/** The window's grid lines, in the colour of the player to move (+ glow in dark). */
const LINE_COLOUR: Record<Player, string> = {
  X: 'bg-player-x dark:shadow-glow-x',
  O: 'bg-player-o dark:shadow-glow-o',
}

/** One grid line of the window: drawn in a gap between tiles, and the only place the window can be grabbed. */
const gridLine = 'pointer-events-auto absolute cursor-grab rounded-full'

interface Drag {
  readonly pointer: number
  readonly startX: number
  readonly startY: number
  /** One tile plus one gap, in pixels: how far the window moves per step. */
  readonly step: number
  readonly dx: number
  readonly dy: number
}

/**
 * Shift's board: a 5×5 field of tiles with the 3×3 window drawn over it as
 * its four inner grid lines, a `#` with no outer border.
 *
 * Tapping an empty tile inside the window places a mark. Dragging a grid line
 * moves the window: it follows the pointer, at most one step each way, and
 * on release snaps to the nearest position; letting go where it started is
 * not a move. A press on a tile that moves more than a few pixels places
 * nothing, so a missed grab can't spend the turn on a mark.
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
  const [drag, setDragState] = useState<Drag | null>(null)
  // The same drag, readable at once: pointer events can arrive faster than React re-renders,
  // so the handlers read this ref rather than the `drag` of the last render.
  const live = useRef<Drag | null>(null)
  const setDrag = (next: Drag | null) => {
    live.current = next
    setDragState(next)
  }
  // Where the last press on a tile started, and whether it has since moved too far to be a tap.
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  // While dragging, the window position the pointer is nearest to, kept to one step and on the field.
  const nearest = (current: Drag | null) => {
    const steps = (offset: number) => (current ? Math.round(offset / current.step) : 0)
    return { row: at.row + steps(current?.dy ?? 0), column: at.column + steps(current?.dx ?? 0) }
  }
  const shown = nearest(drag)
  const inside = (tile: number) => {
    const row = Math.floor(tile / 5)
    const column = tile % 5
    return row >= shown.row && row < shown.row + 3 && column >= shown.column && column < shown.column + 3
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (over || !board.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const width = board.current.getBoundingClientRect().width
    setDrag({
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      step: (width + GAP) / 5,
      dx: 0,
      dy: 0,
    })
  }

  /** The drag with the window moved to follow `event`'s pointer: at most one step each way, never off the field. */
  function follow(current: Drag, event: PointerEvent<HTMLDivElement>): Drag {
    const limit = (offset: number, from: number) =>
      Math.max(-Math.min(1, from) * current.step, Math.min(Math.min(1, 2 - from) * current.step, offset))
    return {
      ...current,
      dx: limit(event.clientX - current.startX, at.column),
      dy: limit(event.clientY - current.startY, at.row),
    }
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = live.current
    if (current && event.pointerId === current.pointer) setDrag(follow(current, event))
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const current = live.current
    if (!current || event.pointerId !== current.pointer) return
    setDrag(null)
    // Where the pointer is let go counts, even if no move event arrived before it.
    const target = nearest(follow(current, event))
    const to = target.row * 3 + target.column
    const move = legal.find((candidate) => candidate.kind === 'window' && candidate.to === to)
    if (move) onMove(move)
  }

  return (
    <div
      ref={board}
      className="relative grid aspect-square w-[min(342px,100%)] touch-none grid-cols-5 grid-rows-5 gap-2 select-none"
      role="group"
      aria-label="Board"
      onPointerDown={(event) => (press.current = { x: event.clientX, y: event.clientY, moved: false })}
      onPointerMove={(event) => {
        const start = press.current
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) start.moved = true
      }}
    >
      {tiles.map((cell, tile) => {
        const playable = legal.some((move) => move.kind === 'place' && move.tile === tile)
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
              const moved = event.detail > 0 && press.current?.moved
              press.current = null
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
          transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
        }}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => setDrag(null)}
      >
        {[
          'inset-y-0 left-[calc((100%-16px)/3)] w-2',
          'inset-y-0 left-[calc((100%-16px)*2/3+8px)] w-2',
          'inset-x-0 top-[calc((100%-16px)/3)] h-2',
          'inset-x-0 top-[calc((100%-16px)*2/3+8px)] h-2',
        ].map((place) => (
          <div
            key={place}
            className={`${gridLine} ${place} ${over ? 'pointer-events-none cursor-default bg-line' : LINE_COLOUR[state.turn]} ${drag ? 'cursor-grabbing opacity-90' : 'opacity-60'}`}
            onPointerDown={startDrag}
          />
        ))}
      </div>
    </div>
  )
}
