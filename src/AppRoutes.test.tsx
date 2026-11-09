import { render, screen } from '@testing-library/react'
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

  it('sends an unknown variant address back to the hub', () => {
    renderAt('/play/not-a-variant')
    expect(screen.getByRole('heading', { name: 'XO Lab' })).toBeInTheDocument()
  })
})
