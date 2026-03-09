import { createBrowserRouter } from 'react-router-dom'
import { toRouteElement } from '@/router/RouteElements.tsx'

const homeRouteElement = toRouteElement(() => import('@/views/Home.tsx'))
const aboutRouteElement = toRouteElement(() => import('@/views/About.tsx'))
const notFoundRouteElement = toRouteElement(() => import('@/views/NotFound.tsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: homeRouteElement,
  },
  {
    path: '/about',
    element: aboutRouteElement,
  },
  {
    path: '*',
    element: notFoundRouteElement,
  },
])

export default router
