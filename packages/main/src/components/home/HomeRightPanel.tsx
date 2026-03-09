import { Layout } from 'antd'

const { Sider } = Layout

function HomeRightPanel() {
  return (
    <Sider
      width={320}
      theme="light"
      className="border-l border-[#f0f0f0] bg-white p-4 overflow-y-auto"
    >
      <div className="h-full rounded-lg border border-dashed border-[#e5e7eb] bg-[#fafafa]" />
    </Sider>
  )
}

export default HomeRightPanel
