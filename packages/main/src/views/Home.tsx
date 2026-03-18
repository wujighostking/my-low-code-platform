import type { RefObject } from 'react'
import { Layout, Spin } from 'antd'
import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import HomeCenterPanel from '@/components/home/HomeCenterPanel'
import HomeLeftPanel from '@/components/home/HomeLeftPanel'
import HomeRightPanel from '@/components/home/HomeRightPanel'

export type GetCanvasDataRef = RefObject<(() => string) | null>

function Home() {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const location = useLocation()
  const { projectId, projectName: initialName } = (location.state as { projectId?: number, projectName?: string }) ?? {}
  const [currentProjectName, setCurrentProjectName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const getCanvasDataRef: GetCanvasDataRef = useRef(null)

  return (
    <Layout className="min-h-screen bg-[#f5f7fa]">
      <Spin spinning={loading} fullscreen />
      {!isPreviewing && <HomeLeftPanel projectId={projectId} projectName={currentProjectName} onProjectNameChange={setCurrentProjectName} />}
      <HomeCenterPanel projectId={projectId} isPreviewing={isPreviewing} setIsPreviewing={setIsPreviewing} getCanvasDataRef={getCanvasDataRef} onLoadingChange={setLoading} />
      {!isPreviewing && <HomeRightPanel projectId={projectId} getCanvasDataRef={getCanvasDataRef} />}
    </Layout>
  )
}

export default Home
