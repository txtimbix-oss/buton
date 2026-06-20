<template>
  <nav class="cab-bottomnav">
    <RouterLink v-for="item in bottomNavigationItems" :key="item.key" :to="item.to" active-class="is-on">
      <CabNavIcon :icon="item.icon" />
      <span class="cab-bottomnav__label">{{ item.mobileLabel }}</span>
      <span v-if="item.bottomBadgeValue" class="cab-badge">{{ item.bottomBadgeValue }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CabNavIcon from '@/components/layout/CabNavIcon.vue'
import { resolveCabinetBottomNavigation } from '@/constants/cabinetNavigation'

const props = defineProps<{
  activeOrdersCount: number
  wishlistCount?: number | null
}>()

const bottomNavigationItems = computed(() =>
  resolveCabinetBottomNavigation({
    activeOrdersCount: props.activeOrdersCount,
    wishlistCount: props.wishlistCount,
  }),
)
</script>
