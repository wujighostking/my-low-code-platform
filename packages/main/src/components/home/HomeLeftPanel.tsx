import type { InputRef } from 'antd'
import type { DragEvent, KeyboardEvent } from 'react'
import { LeftOutlined } from '@ant-design/icons'
import { Input, Layout, message } from 'antd'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProjectName } from '@/api/projects'
import { registerConfig } from '@/utils/editorConfig'

const { Sider } = Layout

interface HomeLeftPanelProps {
  projectId?: number
  projectName?: string
  onProjectNameChange: (name: string) => void
}

function HomeLeftPanel({ projectId, projectName, onProjectNameChange }: HomeLeftPanelProps) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<InputRef>(null)

  const startEdit = () => {
    setEditValue(projectName || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select())
  }

  const confirmEdit = async () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === projectName) {
      setEditing(false)
      return
    }
    if (!projectId) {
      setEditing(false)
      return
    }
    try {
      await updateProjectName(projectId, trimmed)
      onProjectNameChange(trimmed)
      message.success('项目名称已更新')
    }
    catch { /* request 拦截器已处理错误提示 */ }
    finally {
      setEditing(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter')
      confirmEdit()
    if (e.key === 'Escape')
      setEditing(false)
  }

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
      className="border-r border-[#f0f0f0] bg-white overflow-y-auto"
    >
      <div className="h-[64px] flex items-center gap-2 px-4 border-b border-[#f0f0f0]">
        <LeftOutlined className="shrink-0 cursor-pointer text-4 color-#666 hover:color-#333" onClick={() => navigate('/project')} />
        {editing
          ? (
              <Input
                ref={inputRef}
                size="small"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={confirmEdit}
                onKeyDown={handleKeyDown}
              />
            )
          : <span className="text-3.5 font-500 truncate cursor-pointer" onDoubleClick={startEdit}>{projectName || '未命名项目'}</span>}
      </div>
      <div className="space-y-3 p-4 pt-0">
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
