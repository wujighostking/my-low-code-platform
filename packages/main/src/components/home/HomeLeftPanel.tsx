import { Layout } from 'antd'

const { Sider } = Layout

function HomeLeftPanel() {
  return (
    <Sider
      width={260}
      theme="light"
      className="border-r border-[#f0f0f0] bg-white p-4 overflow-y-auto"
    >
      <div className="h-full rounded-lg border border-dashed border-[#e5e7eb] bg-[#fafafa]" />
    </Sider>
  )
}

export default HomeLeftPanel
