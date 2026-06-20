<template>
  <CabHeader
    :title="userTitle"
    :first-name="firstName"
    :initial="initial"
    :avatar-url="avatarUrl"
    :shop-url="SHOP_URL"
    @open-menu="openMenu"
  />

  <div class="cab-shell">
    <CabSidebar
      :open="menuOpen"
      :full-name="userTitle"
      :email="email"
      :initial="initial"
      :avatar-url="avatarUrl"
      :tier-name="tierName"
      :tier-cashback="tierCashback"
      :bonus-balance="bonusBalance"
      :wishlist-count="wishlistCount"
      :shop-url="SHOP_URL"
      @close-menu="closeMenu"
      @logout="logout"
    />

    <main class="cab-main">
      <slot />
    </main>
  </div>

  <CabBottomNav
    :active-orders-count="activeOrdersCount"
    :wishlist-count="wishlistCount"
  />
</template>

<script setup lang="ts">
import CabHeader from '@/components/layout/CabHeader.vue'
import CabSidebar from '@/components/layout/CabSidebar.vue'
import CabBottomNav from '@/components/layout/CabBottomNav.vue'
import { useAppLayoutState } from '@/composables/useAppLayoutState'

const {
  SHOP_URL,
  activeOrdersCount,
  avatarUrl,
  bonusBalance,
  closeMenu,
  email,
  firstName,
  initial,
  logout,
  menuOpen,
  openMenu,
  tierCashback,
  tierName,
  userTitle,
  wishlistCount,
} = useAppLayoutState()
</script>
