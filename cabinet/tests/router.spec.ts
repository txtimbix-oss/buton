import { beforeEach, describe, expect, it, vi } from 'vitest'
import router from '@/router'

const authMock = {
  user: null as any,
  fetchMe: vi.fn(),
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authMock,
}))

describe('router guards', () => {
  beforeEach(async () => {
    authMock.user = null
    authMock.fetchMe.mockReset()
    await router.push('/register')
  })

  it('redirects protected routes to login when user is absent', async () => {
    authMock.fetchMe.mockRejectedValue(new Error('unauth'))

    await router.push('/orders')

    expect(authMock.fetchMe).toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe('/login?redirect=/orders')
  })

  it('allows protected route when session exists', async () => {
    authMock.fetchMe.mockResolvedValue(undefined)
    authMock.user = { _id: 'u1' }

    await router.push('/orders')

    expect(router.currentRoute.value.path).toBe('/orders')
  })

  it('redirects public routes to orders when already authenticated', async () => {
    authMock.fetchMe.mockResolvedValue(undefined)
    authMock.user = { _id: 'u1' }

    await router.push('/register')
    await router.push('/login')

    expect(router.currentRoute.value.path).toBe('/orders')
  })

  it('root route always redirects to dashboard/auth flow', async () => {
    authMock.fetchMe.mockResolvedValue(undefined)
    authMock.user = { _id: 'u1' }

    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('подтягивает сессию через fetchMe и позволяет перейти в защищённый маршрут', async () => {
    authMock.fetchMe.mockImplementation(async () => {
      authMock.user = { _id: 'u2' }
      return Promise.resolve(undefined)
    })

    await router.push('/orders')

    expect(authMock.fetchMe).toHaveBeenCalledTimes(1)
    expect(authMock.user).toHaveProperty('_id', 'u2')
    expect(router.currentRoute.value.path).toBe('/orders')
  })
})
