import type { Ref } from 'vue'
import { api } from '@/api'
import router from '@/router'
import type { IUser, RegisterPayload } from '@/types/user-profile-auth'

function clearBrowserCookie(name: string): void {
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT'
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  const domains = new Set<string | null>([null])

  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    domains.add(hostname)
    for (let i = 0; i < parts.length - 1; i += 1) {
      domains.add(`.${parts.slice(i).join('.')}`)
    }
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  for (const domain of domains) {
    const domainAttr = domain ? `; Domain=${domain}` : ''
    document.cookie = `${name}=; Expires=${expires}; Max-Age=0; Path=/${domainAttr}; SameSite=Lax${secure}`
  }
}

interface AuthSessionBoundaryOptions {
  user: Ref<IUser | null>
  resetWishlist: () => void
}

export function createAuthSessionBoundary({ user, resetWishlist }: AuthSessionBoundaryOptions) {
  function replaceUser(nextUser: IUser | null) {
    const prevUserId = user.value?._id ?? null
    const nextUserId = nextUser?._id ?? null

    user.value = nextUser

    if (prevUserId !== nextUserId) {
      resetWishlist()
    }
  }

  function mergeUserPatch(patch: Partial<IUser>) {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
  }

  function syncWishlist(nextWishlist: IUser['wishlist']) {
    mergeUserPatch({ wishlist: nextWishlist })
  }

  async function fetchMe() {
    const { user: nextUser } = await api.me()
    replaceUser(nextUser)
  }

  async function login(email: string, password: string) {
    const { user: nextUser } = await api.login(email, password)
    replaceUser(nextUser)
  }

  async function register(data: RegisterPayload) {
    const { user: nextUser } = await api.register(data)
    replaceUser(nextUser)
  }

  async function logout() {
    await api.logout()
    clearBrowserCookie('user_token')
    replaceUser(null)
    router.push('/login')
  }

  return {
    mergeUserPatch,
    syncWishlist,
    fetchMe,
    login,
    register,
    logout,
  }
}
