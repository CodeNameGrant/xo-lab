import { useEffect, useId, useRef, type KeyboardEvent, type RefObject } from 'react'
import { AI_LEVEL_NAMES, AI_LEVELS, type AiLevel } from '../game/ai.ts'
import { Icon } from '../ui/icon.tsx'

interface PlayerTwoMenuProps {
  /** The current choice: an AI level, or null for a person. */
  readonly current: AiLevel | null
  /** Player 2's card, which opened the menu: a tap on it is left to the card, which toggles the menu. */
  readonly anchor: RefObject<HTMLElement | null>
  /** A row was chosen: a level, or null for a person. */
  readonly onChoose: (level: AiLevel | null) => void
  /** Closed without a choice; `returnFocus` after Escape, so the keyboard stays on the card. */
  readonly onClose: (returnFocus: boolean) => void
}

const CHOICES: readonly { level: AiLevel | null; label: string }[] = [
  { level: null, label: 'A person' },
  ...AI_LEVELS.map((level) => ({ level, label: `AI · ${AI_LEVEL_NAMES[level]}` })),
]

/**
 * The menu under Player 2's card that chooses who plays Player 2: a person, or
 * the AI at one of its levels (D-48). Its sizes and words are in
 * docs/02-game-screen.md → Player 2 played by the AI.
 */
export function PlayerTwoMenu({ current, anchor, onChoose, onClose }: PlayerTwoMenuProps) {
  const menu = useRef<HTMLDivElement>(null)
  const headingId = useId()
  const noteId = useId()

  // Focus the current row when the menu opens.
  useEffect(() => {
    menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus()
  }, [])

  // A tap anywhere outside the menu and the card closes it.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (!menu.current?.contains(target) && !anchor.current?.contains(target)) onClose(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [anchor, onClose])

  /** Escape closes; the arrow keys, Home and End move between rows, as in any menu. */
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose(true)
      return
    }
    const rows = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])]
    const at = rows.indexOf(document.activeElement as HTMLElement)
    const to =
      event.key === 'ArrowDown'
        ? (at + 1) % rows.length
        : event.key === 'ArrowUp'
          ? (at - 1 + rows.length) % rows.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? rows.length - 1
              : null
    if (to === null) return
    event.preventDefault()
    rows[to].focus()
  }

  return (
    <div
      ref={menu}
      role="menu"
      aria-labelledby={headingId}
      aria-describedby={noteId}
      onKeyDown={onKeyDown}
      // Tabbing out of the menu closes it.
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null
        if (next && !menu.current?.contains(next) && !anchor.current?.contains(next)) onClose(false)
      }}
      className="absolute top-full right-0 z-10 mt-2 flex w-57.5 flex-col gap-0.5 rounded-card border border-grid bg-surface p-1.5 text-ink shadow-board dark:border-line"
    >
      <span
        id={headingId}
        role="none"
        className="px-2.5 pt-2 pb-1 text-xs font-medium tracking-[0.08em] text-ink-muted uppercase dark:tracking-[0.2em]"
      >
        Player 2 is played by
      </span>
      {CHOICES.map(({ level, label }) => {
        const chosen = level === current
        return (
          <button
            key={label}
            type="button"
            role="menuitemradio"
            aria-checked={chosen}
            tabIndex={chosen ? 0 : -1}
            onClick={() => onChoose(level)}
            className={`flex h-11 items-center gap-2.5 rounded-board-sm px-2.5 text-left text-[15px] ${chosen ? 'bg-tint-o font-semibold' : ''}`}
          >
            {label}
            {chosen && <Icon name="chosen" size={18} className="ml-auto text-player-o" />}
          </button>
        )
      })}
      <span
        id={noteId}
        role="none"
        className="mt-1 border-t border-grid px-2.5 py-1.5 text-xs leading-snug text-ink-muted"
      >
        Changing this starts a new game and sets the score back to 0.
      </span>
    </div>
  )
}
