import type { DragEvent } from 'react'
import { Layout } from 'antd'
import { registerConfig } from '@/utils/editorConfig'

const { Sider } = Layout

function HomeLeftPanel() {
  const materials = [...registerConfig.componentList]
  type Material = (typeof materials)[number]
  function handleMaterialDragStart(event: DragEvent<HTMLDivElement>, material: Material) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('key', material.key)
  }

  return (
    <Sider
      width={260}
      theme="light"
      className="border-r border-[#f0f0f0] bg-white p-4 overflow-y-auto"
    >
      <div className="space-y-3">
        {
          materials.map(material => (
            <div
              key={material.key}
              draggable
              tabIndex={-1}
              data-material-key={material.key}
              onDragStart={event => handleMaterialDragStart(event, material)}
              className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-3 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="mb-2 text-xs text-[#8c8c8c]">{material.label}</div>
              <div
                inert
                aria-hidden
                className="center"
              >
                {material.preview()}
              </div>
            </div>
          ))
        }
      </div>
    </Sider>
  )
}

export default HomeLeftPanel
