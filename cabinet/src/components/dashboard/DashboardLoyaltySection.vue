<template>
  <section class="cab-section dashboard-loyalty">
    <div class="dashboard-loyalty__card">
      <div class="dashboard-loyalty__head">
        <div class="dashboard-loyalty__meta">{{ loyaltyName }} клиент</div>
        <div class="dashboard-loyalty__value">кешбэк {{ tierCashback }}%</div>
      </div>
      <div class="dashboard-loyalty__body">
        <div class="dashboard-loyalty__progress">
          <progress class="dashboard-loyalty__progress-fill" :value="progressPct" max="100"></progress>
        </div>
        <p v-if="isMaxLevel" class="dashboard-loyalty__summary">Максимальный статус достигнут</p>
        <p v-else class="dashboard-loyalty__summary">
          <span class="dashboard-loyalty__summary-meta">{{ totalSpent.toLocaleString('ru-RU') }} ₽ из {{ nextThreshold.toLocaleString('ru-RU') }} ₽</span>
          <span class="dashboard-loyalty__summary-separator">·</span>
          <span class="dashboard-loyalty__summary-next">осталось {{ remainingToNext.toLocaleString('ru-RU') }} ₽ до {{ nextTierName }}</span>
        </p>
      </div>
      <RouterLink to="/bonus" class="dashboard-loyalty__link">Подробнее о программе →</RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  loyaltyName: string
  tierCashback: number
  progressPct: number
  isMaxLevel: boolean
  totalSpent: number
  nextThreshold: number
  remainingToNext: number
  nextTierName: string
}>()
</script>
