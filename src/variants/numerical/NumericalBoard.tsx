import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { useCalloutDismiss } from '../../boards/useCalloutDismiss.ts'
import type { TwoPlayer } from '../../game/rules.ts'
import { boardTile, callout, calloutButton, calloutPointer } from '../../ui/classes.ts'
import { NumberPiece } from '../../ui/NumberPiece.tsx'
import type { BoardProps } from '../types.ts'
import type { NumericalMove, NumericalSelectors, NumericalState } from './rules.ts'

/** The square being chosen for, outlined in the player to move's colour. */
const CHOSEN = { X: 'border-2 border-player-x', O: 'border-2 border-player-o' } as const

/** A number still to play, on its owner's tint, and in their colour. */
const LEFT = { X: 'bg-tint-x', O: 'bg-tint-o' } as const

/**
 * Where the callout sits. The board is three squares and two 10 px gaps across; each step to the next
 * square is one square and one gap. Its buttons are 44 px, 8 px apart, inside 8 px of padding and a
 * 1 px border, so its half-width is known from how many numbers it holds, and it is kept within 8 px of
 * the board's edges. The pointer is placed apart from the callout, so it always points at the square.
 */
function place(square: number, count: number) {
  const row = Math.floor(square / 3)
  const column = square % 3
  const above = row > 0
  const step = 'calc((100% - 20px) / 3 + 10px)'
  const centre = `calc(${column} * ${step} + (100% - 20px) / 6)`
  const half = (count * 44 + (count - 1) * 8 + 18) / 2
  const edge = above ? `calc(${row} * ${step} - 8px)` : `calc(${row + 1} * ${step} - 2px)`
  const panel: CSSProperties = {
    left: `clamp(${half - 8}px, ${centre}, calc(100% - ${half - 8}px))`,
    top: edge,
  }
  const pointer: CSSProperties = { left: centre, top: `calc(${edge} - 6px)` }
  return { row, column, above, panel, pointer }
}

/**
 * Numerical's board (D-57): the 3×3 tile board with numbers for pieces, each in the colour of
 * the player who owns it this game, and a row of each player's numbers left above it. Tapping an
 * empty square opens a callout with the numbers the player to move has left; tapping one places
 * it. Tapping another empty square moves the callout there; tapping anywhere else, or Escape,
 * closes it. A completed line of 15 takes the colour of the player who completed it.
 */
export function NumericalBoard({
  state,
  rules,
  onMove,
}: BoardProps<NumericalState, NumericalMove, NumericalSelectors>) {
  const cells = rules.selectors.cells(state)
  // The board is the variant's own, so it reads its own two-player turn rather than the contract's wider Player.
  const turn = state.turn
  const legal = rules.legalMoves(state)
  const outcome = rules.outcome(state)
  const owner = (number: number) => rules.selectors.owner(state, number)

  // The square the player is choosing a number for. It belongs to this screen only, not to the game.
  const [chosen, setChosen] = useState<number | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const firstPick = useRef<HTMLButtonElement>(null)

  // A choice left open can't outlive the position it was made in: a move or a new game clears it.
  const [shownFor, setShownFor] = useState(state)
  if (shownFor !== state) {
    setShownFor(state)
    setChosen(null)
  }
  useCalloutDismiss(
    chosen !== null,
    wrapper,
    firstPick,
    useCallback(() => setChosen(null), []),
  )

  const numbers = rules.selectors.numbersLeft(state, turn)
  const spot = chosen === null ? null : place(chosen, numbers.length)

  /** One player's numbers for this game, the used ones struck through, and the same in words. */
  function numbersRow(player: TwoPlayer) {
    const all = rules.selectors.numbersOf(state, player)
    const left = rules.selectors.numbersLeft(state, player)
    const name = player === 'X' ? 'Player 1' : 'Player 2'
    return (
      <div className="flex items-center gap-1.5 text-[13px] text-ink-muted">
        <span className="w-16 shrink-0" aria-hidden="true">
          {name}
        </span>
        {all.map((number) => {
          const used = !left.includes(number)
          return (
            <span
              key={number}
              aria-hidden="true"
              className={`flex size-6.5 items-center justify-center rounded-score ${used ? 'line-through opacity-40' : LEFT[player]}`}
            >
              <NumberPiece value={number} tone={used ? 'neutral' : player} size={15} />
            </span>
          )
        })}
        <span className="sr-only">
          {left.length === 0 ? `${name} has no numbers left` : `${name} has ${listOf(left)} left`}
        </span>
      </div>
    )
  }

  return (
    <div className="flex w-[min(342px,100%)] flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {numbersRow('X')}
        {numbersRow('O')}
      </div>

      <div
        ref={wrapper}
        className="relative"
        // A tap on the board that isn't on an empty square (a gap, a taken square) closes the callout.
        onClick={(event) => {
          const target = event.target as HTMLElement
          if (!target.closest('[data-callout]') && !target.closest('[aria-disabled="false"]')) setChosen(null)
        }}
      >
        <div className="grid aspect-square grid-cols-3 grid-rows-3 gap-2.5" role="group" aria-label="Board">
          {cells.map((number, square) => {
            const playable = legal.some((move) => move.square === square)
            const won = outcome.kind === 'won' && outcome.highlight.includes(square)
            return (
              <button
                key={square}
                type="button"
                className={`${boardTile} ${square === chosen ? CHOSEN[turn] : ''}`}
                // The completed line takes the colour of the player who completed it (D-45, D-57).
                data-win={(won && outcome.kind === 'won' && outcome.winner) || undefined}
                aria-label={`Row ${Math.floor(square / 3) + 1}, column ${(square % 3) + 1}, ${number ?? 'empty'}`}
                // aria-disabled (not disabled) keeps every square reachable for screen readers.
                aria-disabled={!playable}
                // Tapping the chosen square again closes the callout; any other empty square moves it there.
                onClick={() => playable && setChosen((current) => (current === square ? null : square))}
              >
                {number !== null && (
                  <NumberPiece value={number} tone={owner(number)} size={60} className="motion-safe:animate-place" />
                )}
              </button>
            )
          })}
        </div>

        {chosen !== null && spot && (
          <>
            <span
              aria-hidden="true"
              className={`${calloutPointer} z-10 ${spot.above ? 'border-r border-b' : 'border-t border-l'}`}
              style={spot.pointer}
            />
            <div
              data-callout
              role="group"
              aria-label={`Choose a number for row ${spot.row + 1}, column ${spot.column + 1}`}
              className={`${callout} -translate-x-1/2 ${spot.above ? '-translate-y-full' : ''}`}
              style={spot.panel}
            >
              {numbers.map((number, i) => (
                <button
                  key={number}
                  ref={i === 0 ? firstPick : undefined}
                  type="button"
                  className={`${calloutButton} size-11`}
                  aria-label={`Place ${number}`}
                  onClick={() => {
                    setChosen(null)
                    onMove({ square: chosen, number })
                  }}
                >
                  <NumberPiece value={number} tone={turn} size={22} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** "3", "3 and 7", "3, 7 and 9". */
function listOf(numbers: readonly number[]): string {
  return numbers.length > 1 ? `${numbers.slice(0, -1).join(', ')} and ${numbers[numbers.length - 1]}` : `${numbers[0]}`
}
