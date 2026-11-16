import { useEffect, useRef, useState } from 'react'
import { GridBoard } from '../../boards/GridBoard.tsx'
import type { BoardProps } from '../types.ts'
import type { MarchMove, MarchSelectors, MarchState } from './rules.ts'

/**
 * March's board: the shared grid at 4×4, moved by tap-tap (D-56). Tap one of
 * your pieces that can move: it's outlined in your colour, and a dot marks
 * each empty square it can step to. Tap a dot to move there, tap another of
 * your pieces to switch to it, or tap anywhere else to cancel.
 */
export function MarchBoard({ state, rules, onMove }: BoardProps<MarchState, MarchMove, MarchSelectors>) {
  const cells = rules.selectors.cells(state)
  const turn = rules.currentPlayer(state)
  const legal = rules.legalMoves(state)
  const outcome = rules.outcome(state)

  // The piece the player has picked up. It belongs to this screen only, not to the game.
  const [chosen, setChosen] = useState<number | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)

  // A choice can't outlive the position it was made in: a move or a new game clears it.
  // Updating state during render when a prop changes is React's pattern for this; it re-renders at once.
  const [shownFor, setShownFor] = useState(state)
  if (shownFor !== state) {
    setShownFor(state)
    setChosen(null)
  }

  // A press anywhere outside the board cancels the choice; presses on the board handle themselves.
  useEffect(() => {
    if (chosen === null) return
    function outside(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setChosen(null)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [chosen])

  const movable = (square: number) => legal.some((move) => move.from === square)
  const targets = chosen === null ? [] : legal.filter((move) => move.from === chosen).map((move) => move.to)

  return (
    <div
      ref={wrapper}
      className="w-[min(342px,100%)]"
      // A tap on the board that isn't on a piece you can move or a dot (a gap, any other square) cancels.
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest('[aria-disabled="false"]')) setChosen(null)
      }}
    >
      <GridBoard
        size={4}
        cells={cells}
        highlight={outcome.kind === 'won' ? outcome.highlight : []}
        chosen={chosen}
        chosenBy={turn}
        targets={targets}
        isPlayable={(square) => movable(square) || targets.includes(square)}
        labelExtra={(square) => (targets.includes(square) ? 'move here' : movable(square) ? 'can move' : null)}
        onPlay={(square) => {
          if (chosen !== null && targets.includes(square)) {
            setChosen(null)
            onMove({ from: chosen, to: square })
          } else {
            // Tapping the chosen piece again puts it down; any other movable piece is picked up instead.
            setChosen((current) => (current === square ? null : square))
          }
        }}
      />
    </div>
  )
}
