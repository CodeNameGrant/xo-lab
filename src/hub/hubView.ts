import { useState } from 'react'

/**
 * How the hub lays out its variants: a list (picture, name and tagline, one
 * per row) or a grid (picture and name, three across). The choice is saved
 * on the device, like the theme (D-50).
 *
 * Storage can be unavailable (private browsing, blocked site data): then the
 * choice lasts until the page is closed.
 */
export type HubView = 'list' | 'grid'

export const HUB_VIEW_STORAGE_KEY = 'xo-lab:hub-view'

/** The choice made this session, used when storage can't be read. */
let unsavedChoice: HubView = 'list'

function savedView(): HubView {
  try {
    return localStorage.getItem(HUB_VIEW_STORAGE_KEY) === 'grid' ? 'grid' : 'list'
  } catch {
    return unsavedChoice
  }
}

function saveView(view: HubView) {
  unsavedChoice = view
  try {
    localStorage.setItem(HUB_VIEW_STORAGE_KEY, view)
  } catch {
    // Not saved, but `unsavedChoice` keeps it for this session.
  }
}

/** The hub's view, starting from the saved one, and a function that changes and saves it. */
export function useHubView(): readonly [HubView, (view: HubView) => void] {
  // A function passed to useState runs only on the first render, so storage is read once.
  const [view, setView] = useState(savedView)
  return [
    view,
    (next) => {
      saveView(next)
      setView(next)
    },
  ]
}
