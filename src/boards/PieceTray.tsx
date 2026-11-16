import type { ReactNode } from 'react'
import type { TwoPlayer } from '../game/rules.ts'

/** One piece in a tray: a number, or a mark. */
export interface TrayPiece<Key extends string | number> {
  readonly key: Key
  /** What a screen reader says for it: "7", "X". */
  readonly label: string
  /** The piece, drawn with `tone="inherit"` so it takes the chip's colour. */
  readonly piece: ReactNode
  /** Already placed: shown struck through, and can't be picked. */
  readonly used?: boolean
}

interface PieceTrayProps<Key extends string | number> {
  readonly pieces: readonly TrayPiece<Key>[]
  /** The piece picked up, or null. */
  readonly picked: Key | null
  /** Whose tray it is, or whose turn it is for a shared tray: the picked chip fills with their colour. */
  readonly player: TwoPlayer
  /** A tray whose player isn't to move is dimmed and can't be used. */
  readonly live: boolean
  /** Pieces drawn in the player's colour (Numerical) or neutral, as on the board (Wild). */
  readonly tone: 'player' | 'neutral'
  /** Picks a piece up, or puts it down again (null). */
  readonly onPick: (key: Key | null) => void
  /** The tray's name for screen readers: "Player 1's numbers", "Mark to place". */
  readonly label: string
  /** A name shown before the pieces, such as "Player 1"; left out for a shared tray. */
  readonly title?: string
  /** Counts the times a square was tapped with nothing picked up; each new count shakes the tray. */
  readonly nudges: number
}

/** The picked chip: filled with its player's colour, lifted a little, its piece in the on-colour (D-58). */
const PICKED = {
  X: '-translate-y-1 scale-105 border-player-x bg-player-x text-on-player-x shadow-board dark:shadow-glow-x',
  O: '-translate-y-1 scale-105 border-player-o bg-player-o text-on-player-o shadow-board dark:shadow-glow-o',
} as const

/** A chip not picked: on the surface, its piece in the player's colour or neutral. */
const IDLE = { X: 'text-player-x', O: 'text-player-o', neutral: 'text-ink' } as const

/** With reduced motion, a nudged tray is outlined in the player's colour instead of shaking. */
const NUDGE_OUTLINE = {
  X: 'motion-reduce:outline-player-x',
  O: 'motion-reduce:outline-player-o',
} as const

/**
 * A row of pieces to pick up before tapping a square (D-58): Numerical's numbers, Wild's X and O.
 * Each chip is a 44 px toggle button. Tapping one picks it up, and the board's empty squares are
 * outlined for placing it; tapping it again puts it down. A tap on the board with nothing picked up
 * shakes the tray instead of placing anything.
 */
export function PieceTray<Key extends string | number>({
  pieces,
  picked,
  player,
  live,
  tone,
  onPick,
  label,
  title,
  nudges,
}: PieceTrayProps<Key>) {
  return (
    <div
      // A new key replays the shake for each nudge. Only the live tray shakes.
      key={live ? nudges : 0}
      role="group"
      aria-label={label}
      className={`flex items-center justify-center gap-1.5 rounded-xl ${live ? '' : 'opacity-40'} ${
        live && nudges > 0
          ? `motion-safe:animate-shake motion-reduce:outline-2 motion-reduce:outline-offset-4 ${NUDGE_OUTLINE[player]}`
          : ''
      }`}
    >
      {title && (
        <span className="mr-auto w-16 shrink-0 text-[13px] text-ink-muted" aria-hidden="true">
          {title}
        </span>
      )}
      {pieces.map(({ key, label: pieceLabel, piece, used }) => {
        const isPicked = live && picked === key
        return (
          <button
            key={key}
            type="button"
            // Each state sets its own background and border, so no two colour classes ever compete on one chip.
            className={`flex size-11 items-center justify-center rounded-xl border motion-safe:transition-[translate,scale,background-color,box-shadow] motion-safe:duration-150 ${
              used
                ? 'border-dashed border-line bg-surface text-ink-muted line-through'
                : isPicked
                  ? PICKED[player]
                  : `border-line bg-surface ${IDLE[tone === 'player' ? player : 'neutral']}`
            }`}
            aria-label={used ? `${pieceLabel}, used` : pieceLabel}
            aria-pressed={isPicked}
            // aria-disabled (not disabled) keeps the chip reachable for screen readers.
            aria-disabled={!live || used}
            onClick={() => live && !used && onPick(isPicked ? null : key)}
          >
            {piece}
          </button>
        )
      })}
    </div>
  )
}
