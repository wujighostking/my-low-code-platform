import type { Project as ProjectType } from '@/api/projects'
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Input, message, Modal, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { createProject, getProjects } from '@/api/projects'

function ProjectCard({ project }: { project: ProjectType }) {
  return (
    <Card
      key={project.id}
      hoverable
      className="rounded-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-#667eea to-#764ba2 center">
          <AppstoreOutlined className="color-white text-5" />
        </div>
        <h3 className="text-4 font-500 m-0 truncate">{project.projectName}</h3>
      </div>
      <p className="color-#999 text-3.5 m-0">
        项目 ID:
        {' '}
        {project.id}
      </p>
    </Card>
  )
}

function Project() {
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchProjects = () => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(fetchProjects, [])

  const handleCreate = async () => {
    if (!projectName.trim()) {
      message.warning('请输入项目名称')
      return
    }
    setCreating(true)
    try {
      await createProject({ projectName: projectName.trim() })
      message.success('创建成功')
      setModalOpen(false)
      setProjectName('')
      fetchProjects()
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
                { projects.map(project => (<ProjectCard key={project.id} project={project} />)) }
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
