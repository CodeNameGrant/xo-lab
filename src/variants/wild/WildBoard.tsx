import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { GridBoard } from '../../boards/GridBoard.tsx'
import { useCalloutDismiss } from '../../boards/useCalloutDismiss.ts'
import { callout, calloutButton, calloutPointer } from '../../ui/classes.ts'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { WildMove, WildSelectors, WildState } from './rules.ts'

/** Squares across: Wild is played on 4×4 (D-45). */
const SIZE = 4

/**
 * Wild's board: the shared grid at 4×4 with neutral marks, plus the callout that
 * asks which mark to place (D-45). Tapping an empty square opens a small
 * callout above it (below it on the top row) with an X and an O button;
 * tapping one places that mark. Tapping another empty square moves the
 * callout there; tapping anywhere else, or pressing Escape, closes it.
 */
export function WildBoard({ state, rules, onMove }: BoardProps<WildState, WildMove, WildSelectors>) {
  const cells = rules.selectors.cells(state)
  const outcome = rules.outcome(state)
  const turn = rules.currentPlayer(state)
  const legal = rules.legalMoves(state)

  // The square the player is choosing a mark for. It belongs to this screen only, not to the game.
  const [chosen, setChosen] = useState<number | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const firstPick = useRef<HTMLButtonElement>(null)

  // A choice left open can't outlive the position it was made in: a new game or a move clears it.
  // Updating state during render when a prop changes is React's pattern for this; it re-renders at once.
  const [shownFor, setShownFor] = useState(state)
  if (shownFor !== state) {
    setShownFor(state)
    setChosen(null)
  }

  // A press anywhere outside the board, or Escape, closes the callout; presses on the board handle themselves.
  useCalloutDismiss(
    chosen !== null,
    wrapper,
    firstPick,
    useCallback(() => setChosen(null), []),
  )

  const row = chosen === null ? 0 : Math.floor(chosen / SIZE)
  const column = chosen === null ? 0 : chosen % SIZE
  const above = row > 0
  // Where the callout points: the middle of the chosen square, measured in board widths. Squares are a
  // quarter of the board less its three 8 px gaps; each step to the next square adds one square and one gap.
  const step = 'calc((100% - 24px) / 4 + 8px)'
  const position: CSSProperties = {
    left: `calc(${column} * ${step} + (100% - 24px) / 8)`,
    top: above ? `calc(${row} * ${step} - 8px)` : `calc(${row + 1} * ${step})`,
  }

  return (
    <div
      ref={wrapper}
      className="relative w-[min(342px,100%)]"
      // A tap on the board that isn't on an empty square (a gap, a taken square) closes the callout.
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (!target.closest('[data-callout]') && !target.closest('[aria-disabled="false"]')) setChosen(null)
      }}
    >
      <GridBoard
        size={SIZE}
        cells={cells}
        highlight={outcome.kind === 'won' ? outcome.highlight : []}
        lineOwner={outcome.kind === 'won' ? outcome.winner : undefined}
        neutral
        chosen={chosen}
        chosenBy={turn}
        isPlayable={(square) => legal.some((move) => move.square === square)}
        // Tapping the chosen square again closes the callout; any other empty square moves it there.
        onPlay={(square) => setChosen((current) => (current === square ? null : square))}
      />

      {chosen !== null && (
        <div
          data-callout
          role="group"
          aria-label={`Choose a mark for row ${row + 1}, column ${column + 1}`}
          className={`${callout} -translate-x-1/2 ${above ? '-translate-y-full' : ''}`}
          style={position}
        >
          {/* The callout's pointer: a small square turned 45°, half hidden behind the callout. */}
          <span
            aria-hidden="true"
            className={`${calloutPointer} left-1/2 ${above ? '-bottom-1.5 border-r border-b' : '-top-1.5 border-t border-l'}`}
          />
          {(['X', 'O'] as const).map((mark) => (
            <button
              key={mark}
              ref={mark === 'X' ? firstPick : undefined}
              type="button"
              className={`${calloutButton} size-13`}
              aria-label={`Place ${mark}`}
              onClick={() => {
                setChosen(null)
                onMove({ square: chosen, mark })
              }}
            >
              <Mark player={mark} tone="neutral" size={30} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
