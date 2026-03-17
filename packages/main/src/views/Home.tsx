import type { RefObject } from 'react'
import { Layout } from 'antd'
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
  const getCanvasDataRef: GetCanvasDataRef = useRef(null)

  return (
    <Layout className="min-h-screen bg-[#f5f7fa]">
      {!isPreviewing && <HomeLeftPanel projectId={projectId} projectName={currentProjectName} onProjectNameChange={setCurrentProjectName} />}
      <HomeCenterPanel isPreviewing={isPreviewing} setIsPreviewing={setIsPreviewing} getCanvasDataRef={getCanvasDataRef} />
      {!isPreviewing && <HomeRightPanel projectId={projectId} getCanvasDataRef={getCanvasDataRef} />}
    </Layout>
  )
}

export default Home
