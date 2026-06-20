<template>
  <div class="cab-section">
    <CabSectionHeader title="Достижения" />
    <div class="achievement-grid">
      <div
        v-for="achievement in ACHIEVEMENTS"
        :key="achievement.key"
        class="achievement-badge"
        :class="earnedKeys.includes(achievement.key) ? 'earned' : 'locked'"
      >
        <span class="achievement-badge__icon">{{ achievement.icon }}</span>
        <div>
          <div class="achievement-badge__name">{{ achievement.name }}</div>
          <div class="achievement-badge__desc">{{ achievement.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabSectionHeader from '@/components/CabSectionHeader.vue'

defineProps<{
  earnedKeys: string[]
}>()

const ACHIEVEMENTS = [
  { key: 'first_order', icon: '🛍️', name: 'Первый заказ', desc: 'Оформите первый доставленный заказ' },
  { key: 'regular', icon: '🌸', name: 'Завсегдатай', desc: '5 доставленных заказов' },
  { key: 'generous', icon: '💎', name: 'Щедрый', desc: 'Заказ на сумму от 5 000 ₽' },
  { key: 'critic', icon: '⭐', name: 'Критик', desc: '3 одобренных отзыва' },
]
</script>
