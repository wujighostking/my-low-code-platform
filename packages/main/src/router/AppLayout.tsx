import { Outlet } from 'react-router-dom'
import { useHeartbeat } from '@/hooks/useHeartbeat'

export function AppLayout() {
  useHeartbeat()
  return <Outlet />
}
