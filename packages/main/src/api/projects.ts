import request from '@/utils/request'

export interface Project {
  id: number
  projectName: string
  content: string | null
  userId: number
}

export function getProjects() {
  return request.get<unknown, Project[]>('/projects')
}

export function createProject(data: { projectName: string }) {
  return request.post<unknown, Project>('/projects', data)
}

export function deleteProject(id: number) {
  return request.delete(`/projects/${id}`)
}
