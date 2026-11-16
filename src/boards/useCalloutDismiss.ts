import { useEffect, type RefObject } from 'react'

/**
 * Closes a board's callout (Wild's X-or-O, Numerical's numbers) when the player presses
 * anywhere outside the board or presses Escape, and moves focus to its first button when it
 * opens, so it works from a keyboard. Presses on the board itself are left to the board.
 *
 * `useEffect` adds the listeners only while the callout is open, and the function it returns
 * removes them again when it closes, so they never pile up.
 */
export function useCalloutDismiss(
  open: boolean,
  board: RefObject<HTMLElement | null>,
  firstButton: RefObject<HTMLElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return
    firstButton.current?.focus({ preventScroll: true })
    function outside(event: PointerEvent) {
      if (!board.current?.contains(event.target as Node)) close()
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open, board, firstButton, close])
}
