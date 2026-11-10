import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** jsdom has no matchMedia: stand in a device whose setting is `dark`. */
function deviceIsDark(dark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark && query === '(prefers-color-scheme: dark)',
    addEventListener: () => {},
  }))
}

/** A fresh copy of the module each test, so no choice leaks between tests. */
async function loadTheme() {
  vi.resetModules()
  return import('./theme.ts')
}

describe('theme', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('follows the device when nothing is saved', async () => {
    deviceIsDark(true)
    expect((await loadTheme()).resolveTheme()).toBe('dark')
    deviceIsDark(false)
    expect((await loadTheme()).resolveTheme()).toBe('light')
  })

  it('a saved choice beats the device setting and is shown on the page', async () => {
    deviceIsDark(true)
    const theme = await loadTheme()
    theme.chooseTheme('light')
    expect(theme.resolveTheme()).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem(theme.THEME_STORAGE_KEY)).toBe('light')
  })

  it('ignores a saved value that is not a theme', async () => {
    deviceIsDark(true)
    const theme = await loadTheme()
    localStorage.setItem(theme.THEME_STORAGE_KEY, 'purple')
    expect(theme.resolveTheme()).toBe('dark')
  })

  it('follows the device setting when it changes, until a choice is made', async () => {
    let dark = false
    let onChange = () => {}
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return dark
      },
      addEventListener: (_: string, listener: () => void) => (onChange = listener),
    }))
    const theme = await loadTheme()
    theme.startThemeSync()
    expect(document.documentElement.dataset.theme).toBe('light')

    dark = true
    onChange()
    expect(document.documentElement.dataset.theme).toBe('dark')

    theme.chooseTheme('light')
    onChange()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('keeps the choice for the session when storage is unavailable', async () => {
    deviceIsDark(false)
    const theme = await loadTheme()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    theme.chooseTheme('dark')
    expect(theme.resolveTheme()).toBe('dark')
    vi.restoreAllMocks()
  })
})
