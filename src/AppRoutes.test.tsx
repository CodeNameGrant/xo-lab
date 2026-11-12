import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes.tsx'

function renderAt(address: string) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('app routes', () => {
  it('shows the hub at the root address', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'XO Lab' })).toBeInTheDocument()
  })

  it('lists Classic on the hub', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: /^Classic/ })).toHaveAttribute('href', '/play/classic')
  })

  it('opens the Classic game at /play/classic', async () => {
    // The variant loads lazily; act() lets React finish rendering once the download resolves.
    await act(async () => renderAt('/play/classic'))
    expect(await screen.findByRole('heading', { name: 'Classic' })).toBeInTheDocument()
    expect(screen.getByText('Player 1 to move')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Row \d, column \d, empty$/ })).toHaveLength(9)
  })

  it('sends an unknown variant address back to the hub', () => {
    renderAt('/play/not-a-variant')
    expect(screen.getByRole('heading', { name: 'XO Lab' })).toBeInTheDocument()
  })
})
