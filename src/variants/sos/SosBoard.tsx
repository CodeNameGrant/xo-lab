import { useState, type CSSProperties } from 'react'
import { PieceTray } from '../../boards/PieceTray.tsx'
import { boardTile } from '../../ui/classes.ts'
import { GlyphPiece } from '../../ui/GlyphPiece.tsx'
import type { BoardProps } from '../types.ts'
import type { Letter, Sos, SosMove, SosSelectors, SosState } from './rules.ts'

/** Squares across. */
const SIZE = 6

/**
 * While a letter is picked up, the empty squares are outlined, dashed, in the player's colour. Set on
 * `data-ready`, as on the shared grid board, so it outranks the tile's own border colour.
 */
const READY = 'data-ready:border-dashed data-[ready=O]:border-player-o data-[ready=X]:border-player-x'

/** A stroke takes the colour of the player who made its SOS (+ glow in dark). */
const STROKE = { X: 'bg-player-x dark:shadow-glow-x', O: 'bg-player-o dark:shadow-glow-o' } as const

/**
 * Where a stroke runs: from the centre of the first square of an SOS to the centre of its last.
 * Squares are a sixth of the board less its five 6 px gaps; a step to the next square is one square
 * and one gap. The board is square, so a step is the same across and down. The stroke starts at the
 * first centre and is turned about its left end: 0° across, 90° down, 45° or 135° diagonally, where it
 * is √2 times as long.
 */
function strokeStyle({ line }: Sos): CSSProperties {
  const [first, middle] = line
  const row = Math.floor(first / SIZE)
  const column = first % SIZE
  const down = Math.floor(middle / SIZE) - row
  const across = (middle % SIZE) - column
  const step = 'calc((100% - 30px) / 6 + 6px)'
  const centre = (n: number) => `calc(${n} * ${step} + (100% - 30px) / 12)`
  const angle = Math.atan2(down, across) * (180 / Math.PI)
  const length = down !== 0 && across !== 0 ? Math.SQRT2 * 2 : 2
  return {
    left: centre(column),
    top: centre(row),
    width: `calc(${length} * ${step})`,
    transform: `translateY(-50%) rotate(${angle}deg)`,
  }
}

/**
 * SOS's board (D-59): a 6×6 board of neutral letters with a tray of S and O above it, tinted in the
 * colour of the player to move, and the running count of each player's SOSs. Each SOS is struck
 * through in the colour of the player who made it. Pick a letter up, then tap an empty square; the
 * pick clears after every move, and a square tapped with nothing picked up shakes the tray.
 */
export function SosBoard({ state, rules, onMove }: BoardProps<SosState, SosMove, SosSelectors>) {
  const cells = rules.selectors.cells(state)
  const made = rules.selectors.made(state)
  const counts = rules.selectors.counts(state)
  const legal = rules.legalMoves(state)
  const over = rules.outcome(state).kind !== 'in-progress'
  // The board is the variant's own, so it reads its own two-player turn rather than the contract's wider Player.
  const turn = state.turn

  // The letter picked up, and how many times an empty board was tapped. Both belong to this screen only,
  // not to the game, and a move or a new game clears them. Updating state during render when a prop
  // changes is React's pattern for this; it re-renders at once.
  const [picked, setPicked] = useState<Letter | null>(null)
  const [nudges, setNudges] = useState(0)
  const [shownFor, setShownFor] = useState(state)
  if (shownFor !== state) {
    setShownFor(state)
    setPicked(null)
    setNudges(0)
  }

  const count = (n: number) => `${n} SOS`

  return (
    <div className="flex w-[min(342px,100%)] flex-col gap-3">
      {/* Polite, and always on the page, so screen readers hear each new SOS as it's made. */}
      <p className="flex items-center justify-center gap-4 text-[15px] font-semibold tabular-nums" aria-live="polite">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-player-x" aria-hidden="true" />
          <span className="sr-only">Player 1: </span>
          {count(counts.X)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-player-o" aria-hidden="true" />
          <span className="sr-only">Player 2: </span>
          {count(counts.O)}
        </span>
      </p>

      <PieceTray
        label="Letter to write"
        player={turn}
        live={!over}
        tone="neutral"
        tinted
        picked={picked}
        onPick={(letter) => {
          setPicked(letter)
          setNudges(0)
        }}
        nudges={nudges}
        pieces={(['S', 'O'] as const).map((letter) => ({
          key: letter,
          label: letter,
          piece: <GlyphPiece value={letter} tone="inherit" size={22} />,
        }))}
      />

      <div className="relative">
        <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-1.5" role="group" aria-label="Board">
          {cells.map((letter, square) => {
            const playable = legal.some((move) => move.square === square)
            return (
              <button
                key={square}
                type="button"
                className={`${boardTile} rounded-tile-sm ${READY}`}
                data-ready={(playable && picked !== null && turn) || undefined}
                aria-label={`Row ${Math.floor(square / SIZE) + 1}, column ${(square % SIZE) + 1}, ${letter ?? 'empty'}${
                  playable && picked !== null ? `, place ${picked} here` : ''
                }`}
                // aria-disabled (not disabled) keeps every square reachable for screen readers.
                aria-disabled={!playable}
                onClick={() => {
                  if (!playable) return
                  if (picked === null) setNudges((n) => n + 1)
                  else onMove({ square, letter: picked })
                }}
              >
                {letter && <GlyphPiece value={letter} tone="neutral" size={30} className="motion-safe:animate-place" />}
              </button>
            )
          })}
        </div>

        {/* A stroke through each SOS, in the colour of the player who made it. Strokes may cross. */}
        {made.map((sos) => (
          <span
            key={sos.line.join('-')}
            aria-hidden="true"
            className={`pointer-events-none absolute h-1 origin-left rounded-full opacity-80 motion-safe:animate-place ${STROKE[sos.by]}`}
            style={strokeStyle(sos)}
          />
        ))}
      </div>
    </div>
  )
}
