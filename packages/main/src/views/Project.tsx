import type { Project as ProjectType } from '@/api/projects'
import { AppstoreOutlined } from '@ant-design/icons'
import { Card, Empty, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { getProjects } from '@/api/projects'

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

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen center">
        <Spin size="large" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen center">
        <Empty description="暂无项目" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-#f5f7fa p-8">
      <h1 className="text-6 font-600 color-#1a1a2e mb-6">我的项目</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        { projects.map(project => (<ProjectCard key={project.id} project={project} />)) }
      </div>
    </div>
  )
}

export default Project
