import type { GetCanvasDataRef } from '@/views/Home'
import { SaveOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Layout, message } from 'antd'
import { useState } from 'react'
import { updateProject } from '@/api/projects'

const { Sider } = Layout

interface HomeRightPanelProps {
  projectId?: number
  getCanvasDataRef: GetCanvasDataRef
}

function HomeRightPanel({ projectId, getCanvasDataRef }: HomeRightPanelProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!projectId) {
      message.warning('未关联项目，无法保存')
      return
    }
    const content = getCanvasDataRef.current?.()
    if (!content)
      return

    setSaving(true)
    try {
      await updateProject(projectId, { content })
      message.success('保存成功')
    }
    catch { /* request 拦截器已处理错误提示 */ }
    finally {
      setSaving(false)
    }
  }

  return (
    <Sider
      width={320}
      theme="light"
      className="border-l border-[#f0f0f0] bg-white pb-4 overflow-y-auto"
    >
      <div className="h-[64px] flex items-center justify-end gap-2 px-4 border-b border-[#f0f0f0]">
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>保存</Button>
        <Button icon={<UserOutlined />} />
      </div>
      <div className="h-[calc(100%-64px)] p-4 pt-0">
        <div className="h-full rounded-lg border border-dashed border-[#e5e7eb] bg-[#fafafa]" />
      </div>
    </Sider>
  )
}

export default HomeRightPanel
