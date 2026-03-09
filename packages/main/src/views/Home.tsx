import { Layout } from 'antd'
import HomeCenterPanel from '@/components/home/HomeCenterPanel'
import HomeLeftPanel from '@/components/home/HomeLeftPanel'
import HomeRightPanel from '@/components/home/HomeRightPanel'

function Home() {
  return (
    <Layout className="min-h-screen bg-[#f5f7fa]">
      <HomeLeftPanel />
      <HomeCenterPanel />
      <HomeRightPanel />
    </Layout>
  )
}

export default Home
