import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes.tsx'

function renderAt(address: string) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('app routes', () => {
  // Who plays Player 2 is remembered on the device (D-49): start every test with nothing saved.
  afterEach(() => localStorage.clear())

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

  it('the hub switches to a grid of pictures and names, and remembers it (D-50)', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: /^Classic.+/ })).toBeInTheDocument() // the list shows taglines
    fireEvent.click(screen.getByRole('button', { name: 'Show as grid' }))
    expect(screen.getByRole('link', { name: 'Classic' })).toHaveAttribute('href', '/play/classic')
    cleanup()
    renderAt('/')
    expect(screen.getByRole('button', { name: 'Show as list' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Classic' })).toBeInTheDocument()
  })

  it('sends an unknown variant address back to the hub', () => {
    renderAt('/play/not-a-variant')
    expect(screen.getByRole('heading', { name: 'XO Lab' })).toBeInTheDocument()
  })

  describe('the AI as Player 2 (D-46)', () => {
    it('?ai=hard gives Player 2 to the AI, and its card opens the menu', async () => {
      await act(async () => renderAt('/play/classic?ai=hard'))
      const card = await screen.findByRole('button', { name: /^AI.*Hard.*Change who plays Player 2$/ })
      fireEvent.click(card)
      expect(screen.getByRole('menuitemradio', { name: 'AI · Hard' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('menuitemradio', { name: 'A person' })).toHaveAttribute('aria-checked', 'false')
    })

    it('an unknown level gives a person', async () => {
      await act(async () => renderAt('/play/classic?ai=impossible'))
      expect(await screen.findByRole('button', { name: /^Player 2.*Change who plays Player 2$/ })).toBeInTheDocument()
    })

    it('Trio has no AI, and no menu on its cards', async () => {
      await act(async () => renderAt('/play/trio?ai=hard'))
      await screen.findByRole('heading', { name: 'Trio' })
      expect(screen.queryByRole('button', { name: /Change who plays Player 2/ })).not.toBeInTheDocument()
    })

    it('the AI answers a move: after Player 1 plays, it is Player 1 to move again', async () => {
      await act(async () => renderAt('/play/classic?ai=medium'))
      fireEvent.click(await screen.findByRole('button', { name: 'Row 2, column 2, empty' }))
      expect(screen.getByText('AI is thinking')).toBeInTheDocument()
      expect(await screen.findByText('Player 1 to move', {}, { timeout: 3000 })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /^Row \d, column \d, O$/ })).toHaveLength(1)
    })

    it('remembers the choice: the hub then opens two-player variants against the AI, but not Trio', async () => {
      await act(async () => renderAt('/play/classic'))
      fireEvent.click(await screen.findByRole('button', { name: /Change who plays Player 2$/ }))
      fireEvent.click(screen.getByRole('menuitemradio', { name: 'AI · Hard' }))
      cleanup()
      renderAt('/')
      expect(screen.getByRole('link', { name: /^Infinite/ })).toHaveAttribute('href', '/play/infinite?ai=hard')
      expect(screen.getByRole('link', { name: /^Trio/ })).toHaveAttribute('href', '/play/trio')
    })
  })
})
