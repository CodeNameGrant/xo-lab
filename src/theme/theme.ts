/**
 * Which theme is showing: light (A · Clean minimal) or dark (B · Neon arcade).
 *
 * The answer lives on the page as `<html data-theme="light|dark">`, which
 * the `light:` and `dark:` variants and the dark token values in tokens.css
 * key off. An inline script in index.html sets it before the page first
 * draws (so dark mode never flashes light); this module keeps it right after
 * that, when the toggle is used or the device's setting changes.
 *
 * With no saved choice the theme follows the device. Choosing one with the toggle
 * saves it on the device. Storage can be unavailable (private browsing,
 * blocked site data): then the choice lasts until the page is closed.
 */
import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

/** Also read by the inline script in index.html: change both together. */
export const THEME_STORAGE_KEY = 'xo-lab:theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** The choice made this session, used when storage can't be written. */
let unsavedChoice: Theme | null = null

function savedChoice(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // Storage unavailable: fall through to the session choice or the device setting.
  }
  return unsavedChoice
}

function deviceTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

/** The saved choice if there is one, otherwise the device's setting. */
export function resolveTheme(): Theme {
  return savedChoice() ?? deviceTheme()
}

const listeners = new Set<() => void>()

function apply() {
  document.documentElement.dataset.theme = resolveTheme()
  listeners.forEach((listener) => listener())
}

/** Saves `theme` as the player's choice and shows it. */
export function chooseTheme(theme: Theme) {
  unsavedChoice = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Not saved, but `unsavedChoice` keeps it for this session.
  }
  apply()
}

/** Call once at start-up: applies the theme and follows the device setting when it changes. */
export function startThemeSync() {
  apply()
  window.matchMedia?.(DARK_QUERY).addEventListener('change', apply)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** The theme on screen now; re-renders the component when it changes. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme)
}
