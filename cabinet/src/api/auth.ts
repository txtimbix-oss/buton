import { http, unwrap } from './client'
import type { AuthResponse, RegisterPayload } from '@/types/api'

export const authApi = {
  register: (data: RegisterPayload) =>
    unwrap(http.post<AuthResponse>('/auth/register', data)),

  login: (email: string, password: string) =>
    unwrap(http.post<AuthResponse>('/auth/login', { email, password })),

  logout: () =>
    unwrap(http.post('/auth/logout')),

  me: () =>
    unwrap(http.get<AuthResponse>('/auth/me')),

  forgotPassword: (email: string) =>
    unwrap(http.post('/auth/forgot-password', { email })),

  resetPassword: (token: string, password: string) =>
    unwrap(http.post('/auth/reset-password', { token, password })),
}
