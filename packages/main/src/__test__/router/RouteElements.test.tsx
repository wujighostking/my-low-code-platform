import type { ComponentType } from 'react'
import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { toRouteElement } from '../../router/RouteElements'

describe('toRouteElement', () => {
  it('renders lazy component with fallback first', async () => {
    interface LazyModule { default: ComponentType }
    let resolveLazy: ((module: LazyModule) => void) | undefined
    const lazyModule = new Promise<LazyModule>((resolve) => {
      resolveLazy = resolve
    })
    const routeElement = toRouteElement(() => lazyModule)

    render(routeElement)

    await expect.element(page.getByText('Loading...')).toBeInTheDocument()

    await act(async () => {
      resolveLazy?.({
        default: () => <div>Lazy page content</div>,
      })
      await lazyModule
    })
    await expect.element(page.getByText('Lazy page content')).toBeInTheDocument()
  })
})
