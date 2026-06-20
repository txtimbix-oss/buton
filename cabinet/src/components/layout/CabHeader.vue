<template>
  <header class="cab-header">
    <div class="cab-header__inner">
      <button class="cab-menu cab-iconbtn" type="button" aria-label="Открыть меню" @click="emit('open-menu')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <RouterLink to="/dashboard" class="cab-header__logo">spb<b>shop</b></RouterLink>
      <span class="cab-header__sub">/ Личный кабинет</span>
      <span class="cab-header__spacer"></span>
      <a :href="shopUrl" class="btn btn--ghost cab-tosite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        На сайт
      </a>
      <span class="cab-header__spacer"></span>
      <RouterLink to="/profile" class="cab-ava-wrap" :title="title">
        <CabAvatar :src="avatarUrl" :initials="initial" size="sm" alt="Аватар" />
        <span class="cab-ava-name">{{ firstName }}</span>
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import CabAvatar from '@/components/CabAvatar.vue'

defineProps<{
  title: string
  firstName?: string
  initial: string
  avatarUrl?: string | null
  shopUrl: string
}>()

const emit = defineEmits<{
  (e: 'open-menu'): void
}>()
</script>
