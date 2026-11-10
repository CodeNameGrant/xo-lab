import { useState } from 'react'
import { GridBoard, type LeavingMark } from '../../boards/GridBoard.tsx'
import type { Cell } from '../../game/lines.ts'
import type { BoardProps } from '../types.ts'
import type { InfiniteMove, InfiniteSelectors, InfiniteState } from './rules.ts'

/**
 * The shared 3×3 grid, plus Infinite's two extras: the mover's piece that
 * disappears next is drawn faded, and a removed piece fades out rather than
 * vanishing.
 */
export function InfiniteBoard({ state, rules, onMove }: BoardProps<InfiniteState, InfiniteMove, InfiniteSelectors>) {
  const cells = rules.selectors.cells(state)
  const legal = rules.legalMoves(state)
  const outcome = rules.outcome(state)

  // A removed piece is no longer in the state, so the board remembers the
  // previous state and works out what left. Updating state during render
  // when a prop changes is React's pattern for "information from the
  // previous render"; React re-renders straight away, before painting.
  const [previous, setPrevious] = useState(state)
  const [leaving, setLeaving] = useState<LeavingMark | null>(null)
  if (state !== previous) {
    setPrevious(state)
    const removed = removedMark(rules.selectors.cells(previous), cells)
    setLeaving(removed && { ...removed, key: (leaving?.key ?? 0) + 1 })
  }

  return (
    <GridBoard
      cells={cells}
      highlight={outcome.kind === 'won' ? outcome.highlight : []}
      isPlayable={(index) => legal.includes(index)}
      onPlay={onMove}
      disappearsNext={rules.selectors.disappearsNext(state)}
      leaving={leaving}
    />
  )
}

/**
 * The piece a single move took off the board: one square gained a piece and
 * another lost one. Anything else (New game clearing the board) fades nothing.
 */
function removedMark(before: readonly Cell[], after: readonly Cell[]) {
  const placed = after.filter((cell, square) => cell !== null && before[square] === null)
  const emptied = before.flatMap((cell, square) => (cell !== null && after[square] === null ? [square] : []))
  if (placed.length !== 1 || emptied.length !== 1) return null
  const square = emptied[0]
  const player = before[square]
  return player && { square, player }
}
