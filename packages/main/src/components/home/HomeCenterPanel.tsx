import { Layout } from 'antd'

const { Header, Content } = Layout

function HomeCenterPanel() {
  return (
    <Layout>
      <Header className="bg-white border-b border-[#f0f0f0] px-4" />

      <Content className="p-4 overflow-auto">
        <div className="max-w-[860px] mx-auto min-h-[calc(100vh-120px)] rounded-xl border border-dashed border-[#d9d9d9] bg-white p-6">
        </div>
      </Content>
    </Layout>
  )
}

export default HomeCenterPanel
