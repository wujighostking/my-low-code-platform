import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/router/AppLayout'
import { toRouteElement } from '@/router/RouteElements.tsx'

type ViewLoader = Parameters<typeof toRouteElement>[0]
// 自动扫描 views 目录下的页面组件（懒加载）
const viewModules = import.meta.glob('../views/*.tsx')
// 从文件路径中提取页面名，如 ../views/About.tsx -> About
const viewNameRegex = /\/([^/]+)\.tsx$/
// 将大驼峰页面名转成 kebab-case 路径片段
const kebabRegex = /([a-z0-9])([A-Z])/g

function toRoutePath(filePath: string) {
  const fileName = filePath.match(viewNameRegex)?.[1] ?? ''
  // Home / Index 约定为根路由
  if (fileName === 'Home' || fileName === 'Index') {
    return '/'
  }
  const kebabName = fileName.replace(kebabRegex, '$1-$2').toLowerCase()
  return `/${kebabName}`
}

// 生成页面路由（排除 NotFound 和 Login）
const pageRoutes = Object.entries(viewModules)
  .filter(([filePath]) => !filePath.endsWith('/NotFound.tsx') && !filePath.endsWith('/Login.tsx'))
  .map(([filePath, loader]) => ({
    path: toRoutePath(filePath),
    element: toRouteElement(loader as ViewLoader),
  }))
  // 将根路由固定放在第一位，其余按字典序稳定排序
  .sort((a, b) => {
    if (a.path === '/') {
      return -1
    }
    if (b.path === '/') {
      return 1
    }
    return a.path.localeCompare(b.path)
  })

// Login 路由放在 layout 外（不需要心跳检测）
const loginLoader = viewModules['../views/Login.tsx']
const loginRoute = loginLoader
  ? [{ path: '/login', element: toRouteElement(loginLoader as ViewLoader) }]
  : []

// 单独挂载 404 兜底路由
const notFoundLoader = viewModules['../views/NotFound.tsx']
const fallbackRoutes = notFoundLoader
  ? [{ path: '*', element: toRouteElement(notFoundLoader as ViewLoader) }]
  : []

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: pageRoutes,
  },
  ...loginRoute,
  ...fallbackRoutes,
])

export default router
