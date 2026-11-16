import { useState } from 'react'
import { GridBoard } from '../../boards/GridBoard.tsx'
import { PieceTray } from '../../boards/PieceTray.tsx'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { WildMove, WildSelectors, WildState } from './rules.ts'

/** Squares across: Wild is played on 4×4 (D-45). */
const SIZE = 4

/**
 * Wild's board: the shared grid at 4×4 with neutral marks, and above it one X-and-O tray for the
 * player to move (D-58). The player picks X or O up from the tray, then taps an empty square to
 * place it; the pick clears after every move, so each turn starts with nothing picked. Tapping a
 * square with nothing picked up shakes the tray.
 */
export function WildBoard({ state, rules, onMove }: BoardProps<WildState, WildMove, WildSelectors>) {
  const cells = rules.selectors.cells(state)
  const outcome = rules.outcome(state)
  // The board is the variant's own, so it reads its own two-player turn rather than the contract's wider Player.
  const turn = state.turn
  const legal = rules.legalMoves(state)

  // The mark picked up, and how many times an empty board was tapped. Both belong to this screen only,
  // not to the game, and a move or a new game clears them. Updating state during render when a prop
  // changes is React's pattern for this; it re-renders at once.
  const [picked, setPicked] = useState<'X' | 'O' | null>(null)
  const [nudges, setNudges] = useState(0)
  const [shownFor, setShownFor] = useState(state)
  if (shownFor !== state) {
    setShownFor(state)
    setPicked(null)
    setNudges(0)
  }

  return (
    <div className="flex w-[min(342px,100%)] flex-col gap-3">
      <PieceTray
        label="Mark to place"
        player={turn}
        live={outcome.kind === 'in-progress'}
        tone="neutral"
        picked={picked}
        onPick={(mark) => {
          setPicked(mark)
          setNudges(0)
        }}
        nudges={nudges}
        pieces={(['X', 'O'] as const).map((mark) => ({
          key: mark,
          label: mark,
          piece: <Mark player={mark} tone="inherit" size={24} />,
        }))}
      />
      <GridBoard
        size={SIZE}
        cells={cells}
        highlight={outcome.kind === 'won' ? outcome.highlight : []}
        lineOwner={outcome.kind === 'won' ? outcome.winner : undefined}
        neutral
        ready={picked ? turn : undefined}
        isPlayable={(square) => legal.some((move) => move.square === square)}
        labelExtra={(square) => (picked && cells[square] === null ? `place ${picked} here` : null)}
        onPlay={(square) => {
          if (picked) onMove({ square, mark: picked })
          else setNudges((n) => n + 1)
        }}
      />
    </div>
  )
}
