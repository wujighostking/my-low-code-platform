import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { toRouteElement } from './RouteElements'

describe('toRouteElement', () => {
  it('renders lazy component with fallback first', async () => {
    const routeElement = toRouteElement(async () => ({
      default: () => <div>Lazy page content</div>,
    }))

    render(routeElement)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(await screen.findByText('Lazy page content')).toBeInTheDocument()
  })
})
