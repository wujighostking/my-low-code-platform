import { createElement, lazy, Suspense } from 'react'

const fallbackNode = createElement('div', { className: 'min-h-screen center' }, 'Loading...')
type LazyLoader = Parameters<typeof lazy>[0]

export function toRouteElement(loader: LazyLoader) {
  const Component = lazy(loader)
  return createElement(
    Suspense,
    { fallback: fallbackNode },
    createElement(Component, null),
  )
}
