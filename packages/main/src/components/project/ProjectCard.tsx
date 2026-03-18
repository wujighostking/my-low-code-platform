import type { Project } from '@/api/projects'
import { AppstoreOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Card, Tooltip } from 'antd'

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectCard({ project, onView, onDelete }: ProjectCardProps) {
  return (
    <Card
      hoverable
      className="rounded-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-#667eea to-#764ba2 center">
          <AppstoreOutlined className="color-white text-5" />
        </div>
        <h3 className="text-4 font-500 m-0 truncate flex-1">{project.projectName}</h3>
        <EyeOutlined className="text-4 color-#999 hover:color-#667eea" />
        <EditOutlined className="text-4 color-#999 hover:color-#667eea" onClick={() => onView(project)} />
        <DeleteOutlined className="text-4 color-#999 hover:color-red" onClick={() => onDelete(project)} />
      </div>
      <Tooltip title={project.description}>
        <p className="color-#999 text-3.5 m-0 line-clamp-2">
          {project.description || '暂无描述'}
        </p>
      </Tooltip>
    </Card>
  )
}

export default ProjectCard
