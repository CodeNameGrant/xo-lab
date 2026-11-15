import { afterEach, describe, expect, it } from 'vitest'
import { playAddress, PLAYER_TWO_STORAGE_KEY, rememberedPlayerTwo, rememberPlayerTwo } from './remembered.ts'

afterEach(() => localStorage.clear())

describe('who plays Player 2, remembered on the device (D-49)', () => {
  it('is a person until something is chosen', () => {
    expect(rememberedPlayerTwo()).toBeNull()
    expect(playAddress('classic', 2)).toBe('/play/classic')
  })

  it('remembers the AI and its level', () => {
    rememberPlayerTwo('hard')
    expect(rememberedPlayerTwo()).toBe('hard')
    expect(playAddress('infinite', 2)).toBe('/play/infinite?ai=hard')
  })

  it('remembers choosing a person again after the AI', () => {
    rememberPlayerTwo('easy')
    rememberPlayerTwo(null)
    expect(rememberedPlayerTwo()).toBeNull()
    expect(playAddress('classic', 2)).toBe('/play/classic')
  })

  it('never puts the AI into a three-player address', () => {
    rememberPlayerTwo('medium')
    expect(playAddress('trio', 3)).toBe('/play/trio')
  })

  it('reads anything unknown in storage as a person', () => {
    localStorage.setItem(PLAYER_TWO_STORAGE_KEY, 'impossible')
    expect(rememberedPlayerTwo()).toBeNull()
  })
})
