<template>
  <div class="cab-sidebar-overlay" :class="{ open }" @click="emit('close-menu')"></div>

  <aside class="cab-sidebar" :class="{ 'is-open': open }" @click.self="emit('close-menu')">
    <button class="cab-sidebar__close" type="button" @click="emit('close-menu')" aria-label="Закрыть меню">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 20L4 4m16 0L4 20" />
      </svg>
    </button>
    <div class="side-user">
      <CabAvatar
        class="side-user__ava"
        :src="avatarUrl"
        :initials="initial"
        size="md"
        serif
        alt="Аватар"
      />
      <div class="side-user__name">{{ fullName }}</div>
      <div class="side-user__mail">{{ email }}</div>
      <span class="side-user__tier">{{ tierName }} · {{ tierCashback }}%</span>
    </div>

    <nav class="side-nav">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.key"
        :to="item.to"
        active-class="is-on"
        @click="emit('close-menu')"
      >
        <CabNavIcon :icon="item.icon" />
        {{ item.desktopLabel }}
        <span v-if="item.sidebarBadgeValue" class="sub">{{ item.sidebarBadgeValue }}</span>
      </RouterLink>
    </nav>

    <div class="side-foot">
      <a :href="shopUrl" class="btn btn--ghost btn--sm">На сайт</a>
      <button class="logout" @click="emit('logout')">Выйти</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CabAvatar from '@/components/CabAvatar.vue'
import CabNavIcon from '@/components/layout/CabNavIcon.vue'
import { resolveCabinetSidebarNavigation } from '@/constants/cabinetNavigation'

const props = defineProps<{
  open: boolean
  fullName: string
  email?: string
  initial: string
  avatarUrl?: string | null
  tierName: string
  tierCashback: number
  bonusBalance?: number | null
  wishlistCount?: number | null
  shopUrl: string
}>()

const emit = defineEmits<{
  (e: 'close-menu'): void
  (e: 'logout'): void
}>()

const navigationItems = computed(() =>
  resolveCabinetSidebarNavigation({
    bonusBalance: props.bonusBalance,
    wishlistCount: props.wishlistCount,
  }),
)
</script>
