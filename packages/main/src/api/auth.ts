import request from '@/utils/request'

export function login(data: { username: string, password: string }) {
  return request.post<unknown, { access_token: string }>('/auth/login', data)
}

export function checkToken() {
  return request.get('/auth/check')
}
