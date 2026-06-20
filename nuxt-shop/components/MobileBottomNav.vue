<template>
  <nav class="botnav" aria-label="Навигация">
    <NuxtLink to="/" :class="['', route.path === '/' ? 'is-active' : '']">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></svg>
      Главная
    </NuxtLink>
    <NuxtLink :to="catalogNav.to" :class="['', route.path.startsWith(catalogNav.to) ? 'is-active' : '']">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>
      {{ catalogNav.label }}
    </NuxtLink>
    <NuxtLink to="/cart" :class="['', route.path === '/cart' ? 'is-active' : '']">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>
      <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
      Корзина
    </NuxtLink>
    <NuxtLink to="/wishlist" :class="['', route.path === '/wishlist' ? 'is-active' : '']">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
      <span v-if="wishCount > 0" class="badge">{{ wishCount }}</span>
      Избранное
    </NuxtLink>
    <a :href="userLink">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>
      Кабинет
    </a>
  </nav>
</template>

<script setup lang="ts">
import { catalogNav } from '~/constants/shopNav'

const route = useRoute()
const { cartCount } = useCart()
const { count: wishCount } = useWishlist()
const { public: { cabinetUrl } } = useRuntimeConfig()
const { user: shopUser } = useShopUser()

const userLink = computed(() =>
  shopUser.value ? `${cabinetUrl}/dashboard` : `${cabinetUrl}/login?redirect=/dashboard`
)
</script>
