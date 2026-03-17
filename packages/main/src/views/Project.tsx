import type { Project as ProjectType } from '@/api/projects'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Input, message, Modal, Spin } from 'antd'
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
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = () => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(fetchProjects, [])

  const handleView = (project: ProjectType) => {
    navigate('/', { state: { projectId: project.id } })
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
      const newProject = await createProject({ projectName: projectName.trim() })
      message.success('创建成功')
      setModalOpen(false)
      setProjectName('')
      navigate('/', { state: { projectId: newProject.id } })
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建项目
        </Button>
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
      </Modal>
    </div>
  )
}

export default Project
