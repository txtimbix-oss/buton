import { http, unwrap } from './client'
import type { AuthResponse, UpdateProfilePayload, UploadAvatarResponse } from '@/types/api'

export const profileApi = {
  updateProfile: (data: UpdateProfilePayload) =>
    unwrap(http.put<AuthResponse>('/profile', data)),

  changePassword: (oldPassword: string, newPassword: string) =>
    unwrap(http.put('/profile/password', { oldPassword, newPassword })),

  // Avatar upload (multipart) — использует /api/user/upload (requireUserAuth)
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('files', file)

    return unwrap(
      http.post<UploadAvatarResponse>('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ).then(({ urls }) => urls[0])
  },
}
