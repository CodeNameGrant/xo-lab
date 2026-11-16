import { useState } from 'react'
import { PieceTray } from '../../boards/PieceTray.tsx'
import type { TwoPlayer } from '../../game/rules.ts'
import { boardTile } from '../../ui/classes.ts'
import { NumberPiece } from '../../ui/NumberPiece.tsx'
import type { BoardProps } from '../types.ts'
import type { NumericalMove, NumericalSelectors, NumericalState } from './rules.ts'

/**
 * While a number is picked up, the empty squares are outlined, dashed, in the player's colour. Set on
 * `data-ready`, as on the shared grid board, so it outranks the tile's own border colour.
 */
const READY = 'data-ready:border-dashed data-[ready=O]:border-player-o data-[ready=X]:border-player-x'

/**
 * Numerical's board (D-57, D-58): the 3×3 tile board with numbers for pieces, each in the colour of
 * the player who owns it this game, and above it a tray per player holding their numbers. The
 * player to move picks a number up from their tray, then taps an empty square to place it; the
 * pick clears after every move. Tapping a square with nothing picked up shakes the tray. A
 * completed line of 15 takes the colour of the player who completed it.
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
  const over = outcome.kind !== 'in-progress'
  const owner = (number: number) => rules.selectors.owner(state, number)

  // The number picked up, and how many times an empty board was tapped. Both belong to this screen
  // only, not to the game, and a move or a new game clears them. Updating state during render when a
  // prop changes is React's pattern for this; it re-renders at once.
  const [picked, setPicked] = useState<number | null>(null)
  const [nudges, setNudges] = useState(0)
  const [shownFor, setShownFor] = useState(state)
  if (shownFor !== state) {
    setShownFor(state)
    setPicked(null)
    setNudges(0)
  }

  function tray(player: TwoPlayer) {
    const left = rules.selectors.numbersLeft(state, player)
    const name = player === 'X' ? 'Player 1' : 'Player 2'
    return (
      <PieceTray
        title={name}
        label={`${name}'s numbers`}
        player={player}
        live={!over && player === turn}
        tone="player"
        picked={picked}
        onPick={(number) => {
          setPicked(number)
          setNudges(0)
        }}
        nudges={nudges}
        pieces={rules.selectors.numbersOf(state, player).map((number) => ({
          key: number,
          label: String(number),
          used: !left.includes(number),
          piece: <NumberPiece value={number} tone="inherit" size={20} />,
        }))}
      />
    )
  }

  return (
    <div className="flex w-[min(342px,100%)] flex-col gap-3">
      <div className="flex flex-col gap-2">
        {tray('X')}
        {tray('O')}
      </div>

      <div className="grid aspect-square grid-cols-3 grid-rows-3 gap-2.5" role="group" aria-label="Board">
        {cells.map((number, square) => {
          const playable = legal.some((move) => move.square === square)
          const won = outcome.kind === 'won' && outcome.highlight.includes(square)
          return (
            <button
              key={square}
              type="button"
              className={`${boardTile} ${READY}`}
              data-ready={(playable && picked !== null && turn) || undefined}
              // The completed line takes the colour of the player who completed it (D-45, D-57).
              data-win={(won && outcome.kind === 'won' && outcome.winner) || undefined}
              aria-label={`Row ${Math.floor(square / 3) + 1}, column ${(square % 3) + 1}, ${number ?? 'empty'}${
                playable && picked !== null ? `, place ${picked} here` : ''
              }`}
              // aria-disabled (not disabled) keeps every square reachable for screen readers.
              aria-disabled={!playable}
              onClick={() => {
                if (!playable) return
                if (picked === null) setNudges((n) => n + 1)
                else onMove({ square, number: picked })
              }}
            >
              {number !== null && (
                <NumberPiece value={number} tone={owner(number)} size={60} className="motion-safe:animate-place" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
