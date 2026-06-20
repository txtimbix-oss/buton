import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, RouteLocationRaw, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type AuthStore = ReturnType<typeof useAuthStore>
type RouteComponent = () => Promise<unknown>

const createPublicRoute = (path: string, name: string, component: RouteComponent): RouteRecordRaw => ({
  path,
  name,
  component,
  meta: { public: true },
})

const createProtectedRoute = (path: string, name: string, component: RouteComponent): RouteRecordRaw => ({
  path,
  name,
  component,
  meta: { requiresAuth: true },
})

const publicRoutes: RouteRecordRaw[] = [
  createPublicRoute('/login', 'login', () => import('@/views/auth/LoginView.vue')),
  createPublicRoute('/register', 'register', () => import('@/views/auth/RegisterView.vue')),
  createPublicRoute('/forgot-password', 'forgot-password', () => import('@/views/auth/ForgotPasswordView.vue')),
  createPublicRoute('/reset-password', 'reset-password', () => import('@/views/auth/ResetPasswordView.vue')),
]

const protectedRoutes: RouteRecordRaw[] = [
  createProtectedRoute('/dashboard', 'dashboard', () => import('@/views/DashboardView.vue')),
  createProtectedRoute('/profile', 'profile', () => import('@/views/ProfileView.vue')),
  createProtectedRoute('/addresses', 'addresses', () => import('@/views/AddressesView.vue')),
  createProtectedRoute('/orders', 'orders', () => import('@/views/OrdersView.vue')),
  createProtectedRoute('/orders/:id', 'order-detail', () => import('@/views/OrderDetailView.vue')),
  createProtectedRoute('/wishlist', 'wishlist', () => import('@/views/WishlistView.vue')),
  createProtectedRoute('/security', 'security', () => import('@/views/SecurityView.vue')),
  createProtectedRoute('/bonus', 'bonus', () => import('@/views/BonusView.vue')),
  createProtectedRoute('/reviews', 'reviews', () => import('@/views/ReviewsView.vue')),
]

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  {
    path: '/',
    redirect: '/dashboard',
  },
  ...protectedRoutes,
]

async function getProtectedRouteRedirect(
  to: RouteLocationNormalized,
  auth: AuthStore,
): Promise<RouteLocationRaw | undefined> {
  if (!to.meta.requiresAuth) return undefined

  if (!auth.user) {
    await auth.fetchMe().catch(() => {})
  }

  if (auth.user) return undefined

  return { name: 'login', query: { redirect: to.fullPath } }
}

function getPublicRouteRedirect(
  to: RouteLocationNormalized,
  auth: AuthStore,
): RouteLocationRaw | undefined {
  if (to.meta.public && auth.user) {
    return { name: 'orders' }
  }

  return undefined
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const protectedRouteRedirect = await getProtectedRouteRedirect(to, auth)
  if (protectedRouteRedirect) return protectedRouteRedirect
  return getPublicRouteRedirect(to, auth)
})

export default router
