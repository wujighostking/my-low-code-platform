import { Layout } from 'antd'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { registerConfig } from '@/utils/editorConfig'

const { Header, Content } = Layout

function HomeCenterPanel() {
  const {
    isDragOver,
    blocks,
    canvasRef,
    container: { width, height },
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
  } = useCanvasDrop()

  return (
    <Layout>
      <Header className="bg-white border-b border-[#f0f0f0] px-4 flex items-center justify-between" />

      <Content className="p-4 overflow-auto">
        <div
          ref={canvasRef}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          className={`mx-auto rounded-xl border border-dashed bg-white transition-colors ${
            isDragOver ? 'border-[#1677ff] bg-[#f0f7ff]' : 'border-[#d9d9d9]'
          }`}
          style={{ width, height, position: 'relative' }}
        >
          {blocks.map((block, index) => {
            const config = registerConfig.componentMap.get(block.key as Parameters<typeof registerConfig.componentMap.get>[0])
            if (!config)
              return null

            return (
              <div
                key={`${block.key}-${index}`}
                style={{
                  position: 'absolute',
                  top: block.top,
                  left: block.left,
                  zIndex: block.zIndex,
                }}
              >
                {config.render()}
              </div>
            )
          })}
        </div>
      </Content>
    </Layout>
  )
}

export default HomeCenterPanel
