import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react'

/** How long a finger must stay down before the tooltip shows, and how long it stays after lifting (D-51). */
const LONG_PRESS_MS = 500
const SHOWN_AFTER_RELEASE_MS = 1500
/** A finger that moves further than this is scrolling, not pressing. */
const MOVE_TOLERANCE_PX = 10

interface TooltipProps {
  /** The tooltip's text: the button's own label, so each button has one name (D-51). */
  readonly label: string
  /** Which edge the tooltip lines up with, so it never runs off the screen: `end` for buttons at the right. */
  readonly align?: 'start' | 'center' | 'end'
  /** For layout only: where the wrapped button sits. */
  readonly className?: string
  /** One icon button or link. */
  readonly children: ReactNode
}

/**
 * A tooltip under an icon button: shown on mouse hover and keyboard focus, and
 * on a touch screen by a long press, which then doesn't press the button
 * (D-51). It is decorative: the button's `aria-label` already says the same
 * words to screen readers, so the tooltip is hidden from them.
 *
 * The press is watched from this wrapper rather than the button, because
 * pointer and click events bubble up from the button through it.
 */
export function Tooltip({ label, align = 'center', className, children }: TooltipProps) {
  const [pressed, setPressed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  /** Set once a long press has shown the tooltip, so the click that follows the release is dropped. */
  const longPressed = useRef(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'touch') return // a mouse hovers, and a pen too
    clearTimeout(timer.current)
    longPressed.current = false
    start.current = { x: event.clientX, y: event.clientY }
    timer.current = setTimeout(() => {
      longPressed.current = true
      setPressed(true)
    }, LONG_PRESS_MS)
  }

  function onPointerMove(event: PointerEvent) {
    if (!start.current || longPressed.current) return
    if (Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > MOVE_TOLERANCE_PX) cancel()
  }

  function onPointerEnd() {
    start.current = null
    clearTimeout(timer.current)
    if (longPressed.current) timer.current = setTimeout(() => setPressed(false), SHOWN_AFTER_RELEASE_MS)
  }

  function cancel() {
    start.current = null
    clearTimeout(timer.current)
  }

  /*
   * The capture phase runs on the way down to the button, before the button's own click
   * handler, so stopping the click here means a long press never toggles the theme or
   * follows the back link.
   */
  function onClickCapture(event: MouseEvent) {
    if (!longPressed.current) return
    longPressed.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <span
      className={`group/tip relative inline-flex select-none [-webkit-touch-callout:none] ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={cancel}
      onClickCapture={onClickCapture}
      // A long press would otherwise open the browser's own menu for the link or button.
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
      <span
        aria-hidden="true"
        data-shown={pressed || undefined}
        className={`pointer-events-none absolute top-full z-20 mt-1.5 rounded-lg bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-page normal-case opacity-0 group-hover/tip:opacity-100 group-hover/tip:delay-400 group-has-focus-visible/tip:opacity-100 data-shown:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 dark:tracking-normal ${ALIGN[align]}`}
      >
        {label}
      </span>
    </span>
  )
}

const ALIGN = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
} as const
