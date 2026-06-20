<template>
  <div class="cab-section">
    <CabSectionHeader title="Уведомления" />
    <div class="cab-card">
      <div class="toggle-row">
        <div>
          <b>Статус заказов</b>
          <div class="muted-note">Уведомления о доставке</div>
        </div>
        <button
          type="button"
          class="toggle-pill"
          :class="{ on: notifications.orderStatus }"
          @click="emit('toggle', 'orderStatus')"
        ></button>
      </div>
      <div class="toggle-row">
        <div>
          <b>Новости и акции</b>
          <div class="muted-note">Скидки и сезонные предложения</div>
        </div>
        <button
          type="button"
          class="toggle-pill"
          :class="{ on: notifications.news }"
          @click="emit('toggle', 'news')"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabSectionHeader from '@/components/CabSectionHeader.vue'
import type { ProfileNotifications } from '@/components/profile/types'

defineProps<{
  notifications: ProfileNotifications
}>()

const emit = defineEmits<{
  (e: 'toggle', key: keyof ProfileNotifications): void
}>()
</script>
