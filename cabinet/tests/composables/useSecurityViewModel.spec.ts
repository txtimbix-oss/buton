import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSecurityViewModel } from '@/composables/useSecurityViewModel'

const { auth, changePassword } = vi.hoisted(() => ({
  auth: {
    logout: vi.fn(),
  },
  changePassword: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    changePassword,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => auth,
}))

describe('useSecurityViewModel', () => {
  beforeEach(() => {
    auth.logout.mockClear()
    changePassword.mockReset().mockResolvedValue(undefined)
  })

  it('does not submit when new password confirmation does not match', async () => {
    const vm = useSecurityViewModel()
    vm.form.value = { old: 'old-password', new: 'new-password', confirm: 'different' }

    await vm.save()

    expect(changePassword).not.toHaveBeenCalled()
    expect(vm.saving.value).toBe(false)
  })

  it('changes password, shows success, and resets form', async () => {
    const vm = useSecurityViewModel()
    vm.form.value = { old: 'old-password', new: 'new-password', confirm: 'new-password' }

    await vm.save()

    expect(changePassword).toHaveBeenCalledWith('old-password', 'new-password')
    expect(vm.success.value).toBe('Пароль успешно изменён')
    expect(vm.error.value).toBe('')
    expect(vm.form.value).toEqual({ old: '', new: '', confirm: '' })
  })

  it('maps password change failures and delegates logout to auth store', async () => {
    changePassword.mockRejectedValueOnce(new Error('wrong old password'))
    const vm = useSecurityViewModel()
    vm.form.value = { old: 'old-password', new: 'new-password', confirm: 'new-password' }

    await vm.save()

    expect(vm.error.value).toBe('Проверьте пароль и попробуйте ещё раз.')
    expect(vm.success.value).toBe('')
    expect(vm.saving.value).toBe(false)

    vm.logout()
    expect(auth.logout).toHaveBeenCalledOnce()
  })
})
