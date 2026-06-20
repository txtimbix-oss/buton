import { beforeEach, describe, expect, it, vi } from 'vitest'

const { routeMock, apiMock } = vi.hoisted(() => ({
  routeMock: {
    query: {} as Record<string, unknown>,
  },
  apiMock: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/api', () => ({
  api: apiMock,
}))

import { usePasswordRecoveryFlow } from '@/composables/usePasswordRecoveryFlow'

describe('usePasswordRecoveryFlow', () => {
  beforeEach(() => {
    routeMock.query = {}
    vi.clearAllMocks()
  })

  it('отправляет forgot password и сохраняет sentEmail/success', async () => {
    apiMock.forgotPassword.mockResolvedValue(undefined)

    const flow = usePasswordRecoveryFlow('forgot')
    flow.updateEmail('user@example.com')

    const submitPromise = flow.submit()
    expect(flow.loading.value).toBe(true)

    await submitPromise

    expect(apiMock.forgotPassword).toHaveBeenCalledWith('user@example.com')
    expect(flow.sentEmail.value).toBe('user@example.com')
    expect(flow.success.value).toBe(true)
    expect(flow.error.value).toBe('')
    expect(flow.loading.value).toBe(false)
  })

  it('сохраняет ошибку при неуспешном forgot password', async () => {
    apiMock.forgotPassword.mockRejectedValue(new Error('Пользователь не найден'))

    const flow = usePasswordRecoveryFlow('forgot')
    flow.updateEmail('missing@example.com')

    await flow.submit()

    expect(flow.error.value).toBe('Пользователь не найден')
    expect(flow.success.value).toBe(false)
    expect(flow.loading.value).toBe(false)
  })

  it('не вызывает resetPassword без токена или при несовпадении паролей', async () => {
    const noTokenFlow = usePasswordRecoveryFlow('reset')
    noTokenFlow.updatePassword('Password1!')
    noTokenFlow.updateConfirm('Password1!')

    expect(noTokenFlow.hasToken.value).toBe(false)
    await noTokenFlow.submit()
    expect(apiMock.resetPassword).not.toHaveBeenCalled()

    routeMock.query = { token: 'TOKEN-1' }
    const mismatchFlow = usePasswordRecoveryFlow('reset')
    mismatchFlow.updatePassword('Password1!')
    mismatchFlow.updateConfirm('Password2!')

    expect(mismatchFlow.hasToken.value).toBe(true)
    await mismatchFlow.submit()
    expect(apiMock.resetPassword).not.toHaveBeenCalled()
  })

  it('сбрасывает пароль по token из query и выставляет success message', async () => {
    routeMock.query = { token: ['TOKEN-2'] }
    apiMock.resetPassword.mockResolvedValue(undefined)

    const flow = usePasswordRecoveryFlow('reset')
    flow.updatePassword('Password1!')
    flow.updateConfirm('Password1!')

    const submitPromise = flow.submit()
    expect(flow.loading.value).toBe(true)

    await submitPromise

    expect(apiMock.resetPassword).toHaveBeenCalledWith('TOKEN-2', 'Password1!')
    expect(flow.successMessage.value).toContain('Пароль успешно изменён')
    expect(flow.error.value).toBe('')
    expect(flow.loading.value).toBe(false)
  })
})
