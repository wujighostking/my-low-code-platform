import { Layout } from 'antd'
import { useState } from 'react'
import HomeCenterPanel from '@/components/home/HomeCenterPanel'
import HomeLeftPanel from '@/components/home/HomeLeftPanel'
import HomeRightPanel from '@/components/home/HomeRightPanel'

function Home() {
  const [isPreviewing, setIsPreviewing] = useState(false)

  return (
    <Layout className="min-h-screen bg-[#f5f7fa]">
      {!isPreviewing && <HomeLeftPanel />}
      <HomeCenterPanel isPreviewing={isPreviewing} setIsPreviewing={setIsPreviewing} />
      {!isPreviewing && <HomeRightPanel />}
    </Layout>
  )
}

export default Home
