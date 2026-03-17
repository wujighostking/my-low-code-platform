import type { GetCanvasDataRef } from '@/views/Home'
import { LogoutOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, message, Spin } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProject } from '@/api/projects'

const { Sider } = Layout

interface HomeRightPanelProps {
  projectId?: number
  getCanvasDataRef: GetCanvasDataRef
}

function HomeRightPanel({ projectId, getCanvasDataRef }: HomeRightPanelProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [username] = useState(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token)
        return ''
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.username ?? ''
    }
    catch { return '' }
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleSave = useCallback(async () => {
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
  }, [projectId, getCanvasDataRef])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <>
      <Spin spinning={saving} fullscreen />
      <Sider
        width={320}
        theme="light"
        className="border-l border-[#f0f0f0] bg-white pb-4 overflow-y-auto"
      >
        <div className="h-[64px] flex items-center justify-end gap-2 px-4 border-b border-[#f0f0f0]">
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>保存</Button>
          <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }] }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-2 hover:bg-#f5f5f5 transition-colors">
              <Avatar size="small" icon={<UserOutlined />} className="bg-#667eea" />
              <span className="text-3.5 color-#333">{username}</span>
            </div>
          </Dropdown>
        </div>
        <div className="h-[calc(100%-64px)] p-4 pt-0">
          <div className="h-full rounded-lg border border-dashed border-[#e5e7eb] bg-[#fafafa]" />
        </div>
      </Sider>
    </>
  )
}

export default HomeRightPanel
