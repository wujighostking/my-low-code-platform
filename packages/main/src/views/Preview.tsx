import { EditOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerConfig } from '@/utils/editorConfig'

interface Block {
  top: number
  left: number
  zIndex: number
  key: string
}

interface PreviewData {
  container: { width: number, height: number }
  blocks: Block[]
}

function Preview() {
  const navigate = useNavigate()
  const [data] = useState<PreviewData | null>(() => {
    const raw = sessionStorage.getItem('preview-data')
    if (!raw)
      return null
    try {
      return JSON.parse(raw)
    }
    catch {
      return null
    }
  })

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        暂无预览数据，请从编辑器中点击预览按钮
      </div>
    )
  }

  const { container, blocks } = data

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center p-4">
      <div className="w-full flex justify-end mb-4" style={{ maxWidth: container.width }}>
        <Button onClick={() => navigate('/')}>
          <EditOutlined />
          返回编辑
        </Button>
      </div>
      <div
        className="bg-white rounded-xl shadow-lg"
        style={{
          width: container.width,
          height: container.height,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {blocks.map((block) => {
          const config = registerConfig.componentMap.get(block.key as Parameters<typeof registerConfig.componentMap.get>[0])
          if (!config)
            return null

          return (
            <div
              key={`${block.key}-${block.top}-${block.left}`}
              style={{
                position: 'absolute',
                top: block.top,
                left: block.left,
                zIndex: block.zIndex,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {config.render()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Preview
