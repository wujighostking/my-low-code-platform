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

export function updateProject(id: number, data: { content?: string, projectName?: string }) {
  return request.patch<unknown, Project>(`/projects/${id}`, data)
}

export function updateProjectName(id: number, projectName: string) {
  return request.patch<unknown, Project>(`/projects/${id}/name`, { projectName })
}

export function deleteProject(id: number) {
  return request.delete(`/projects/${id}`)
}
