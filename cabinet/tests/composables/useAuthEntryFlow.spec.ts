import { beforeEach, describe, expect, it, vi } from 'vitest'

const routerMock = {
  push: vi.fn(),
}

const routeMock = {
  query: {} as Record<string, unknown>,
}

const authMock = {
  login: vi.fn(),
  register: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
  useRoute: () => routeMock,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authMock,
}))

import { useAuthEntryFlow } from '@/composables/useAuthEntryFlow'

describe('useAuthEntryFlow', () => {
  beforeEach(() => {
    routeMock.query = {}
    vi.clearAllMocks()
  })

  it('логинит пользователя и редиректит на query redirect', async () => {
    routeMock.query = { redirect: '/orders?tab=active' }
    authMock.login.mockResolvedValue(undefined)

    const flow = useAuthEntryFlow('login')
    flow.form.email = 'user@example.com'
    flow.form.password = 'secret'

    const submitPromise = flow.submit()
    expect(flow.loading.value).toBe(true)

    await submitPromise

    expect(authMock.login).toHaveBeenCalledWith('user@example.com', 'secret')
    expect(routerMock.push).toHaveBeenCalledWith('/orders?tab=active')
    expect(flow.loading.value).toBe(false)
    expect(flow.error.value).toBe('')
  })

  it('не отправляет register при несовпадении паролей и прокидывает referral code', async () => {
    routeMock.query = { ref: ['REF-42'] }
    authMock.register.mockResolvedValue(undefined)

    const flow = useAuthEntryFlow('register')
    flow.form.firstName = 'John'
    flow.form.lastName = 'Doe'
    flow.form.email = 'user@example.com'
    flow.form.phone = ''
    flow.form.password = 'Password1!'
    flow.form.confirm = 'Password1'

    expect(flow.hasPasswordMismatch.value).toBe(true)
    await flow.submit()
    expect(authMock.register).not.toHaveBeenCalled()

    flow.form.confirm = 'Password1!'
    expect(flow.hasPasswordMismatch.value).toBe(false)

    await flow.submit()

    expect(authMock.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password1!',
      firstName: 'John',
      lastName: 'Doe',
      phone: undefined,
      referralCode: 'REF-42',
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard')
  })

  it('сохраняет текст ошибки и не редиректит при неуспешном login', async () => {
    authMock.login.mockRejectedValue(new Error('Неверный пароль'))

    const flow = useAuthEntryFlow('login')
    flow.form.email = 'user@example.com'
    flow.form.password = 'bad-secret'

    await flow.submit()

    expect(flow.error.value).toBe('Неверный пароль')
    expect(flow.loading.value).toBe(false)
    expect(routerMock.push).not.toHaveBeenCalled()
  })

  it('не переводит в loading при несовпадении паролей при register', async () => {
    routeMock.query = { ref: 'REF-NEW' }

    const flow = useAuthEntryFlow('register')
    flow.form.firstName = 'Анна'
    flow.form.lastName = 'Петрова'
    flow.form.email = 'user@example.com'
    flow.form.password = 'Password1!'
    flow.form.confirm = 'Password2!'

    const submitResult = flow.submit()
    expect(flow.loading.value).toBe(false)
    await submitResult

    expect(authMock.register).not.toHaveBeenCalled()
    expect(routerMock.push).not.toHaveBeenCalled()
    expect(flow.error.value).toBe('')
  })

  it('сохраняет сообщение ошибки из response-like объекта', async () => {
    authMock.login.mockRejectedValue({ message: 'Неверный формат токена' })

    const flow = useAuthEntryFlow('login')
    flow.form.email = 'user@example.com'
    flow.form.password = 'wrong'

    await flow.submit()

    expect(flow.error.value).toBe('Неверный формат токена')
    expect(flow.loading.value).toBe(false)
  })
})
