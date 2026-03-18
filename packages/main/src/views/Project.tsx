import type { Project as ProjectType } from '@/api/projects'
import { LogoutOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Empty, Input, message, Modal, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject, deleteProject, getProjects } from '@/api/projects'
import ProjectCard from '@/components/project/ProjectCard'

function Project() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const fetchProjects = () => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(fetchProjects, [])

  const handleView = (project: ProjectType) => {
    navigate('/', { state: { projectId: project.id, projectName: project.projectName } })
  }

  const handleDelete = (project: ProjectType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目「${project.projectName}」吗？`,
      okText: '删除',
      okType: 'danger',
      zIndex: 1000,
      onOk: async () => {
        setDeleting(true)
        try {
          await deleteProject(project.id)
          message.success('删除成功')
          fetchProjects()
        }
        catch { /* request 拦截器已处理错误提示 */ }
        finally {
          setDeleting(false)
        }
      },
    })
  }

  const handleCreate = async () => {
    if (!projectName.trim()) {
      message.warning('请输入项目名称')
      return
    }
    setCreating(true)
    try {
      const newProject = await createProject({ projectName: projectName.trim(), description: projectDesc.trim() || undefined })
      message.success('创建成功')
      setModalOpen(false)
      setProjectName('')
      setProjectDesc('')
      navigate('/', { state: { projectId: newProject.id, projectName: newProject.projectName } })
    }
    catch { /* request 拦截器已处理错误提示 */ }
    finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-#f5f7fa p-8">
      <Spin spinning={deleting || creating} fullscreen style={{ zIndex: 2000 }} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6 font-600 color-#1a1a2e m-0">我的项目</h1>
        <div className="flex items-center gap-3">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新建项目
          </Button>
          <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }] }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-2 hover:bg-white transition-colors">
              <Avatar size="small" icon={<UserOutlined />} className="bg-#667eea" />
              <span className="text-3.5 color-#333">{username}</span>
            </div>
          </Dropdown>
        </div>
      </div>
      {
        projects.length === 0
          ? <Empty description="暂无项目" />
          : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                { projects.map(project => (<ProjectCard key={project.id} project={project} onView={handleView} onDelete={handleDelete} />)) }
              </div>
            )
      }
      <Modal
        title="新建项目"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false)
          setProjectName('')
          setProjectDesc('')
        }}
        confirmLoading={creating}
        okText="创建"
      >
        <Input
          placeholder="请输入项目名称"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          onPressEnter={handleCreate}
        />
        <Input.TextArea
          className="mt-3"
          placeholder="请输入项目描述（选填）"
          value={projectDesc}
          onChange={e => setProjectDesc(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  )
}

export default Project
