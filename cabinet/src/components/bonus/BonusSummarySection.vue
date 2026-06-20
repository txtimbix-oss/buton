<template>
  <div>
    <div class="bonus-hero-dk bonus-hero-dk--mb">
      <div class="bonus-hero-dk__ico bonus-hero-dk__ico--mb">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20C4 11 10 5 20 5c0 9-6 15-15 15z"/><path d="M4 20C8 16 13 12 18 9"/></svg>
      </div>
      <b>{{ balance }} бонусов</b>
      <div class="eq bonus-hero-dk__eq">= {{ balance }} рублей к оплате</div>
      <div v-if="expireDays" class="burn bonus-hero-dk__burn">Сгорают через {{ expireDays }} дней</div>
    </div>

    <div class="cab-section">
      <h2 class="sec-title">Программа лояльности</h2>
      <div class="tiers">
        <div v-for="lvl in levels" :key="lvl.key" class="tier" :class="{ on: currentLevel.key === lvl.key }">
          <div v-if="currentLevel.key === lvl.key" class="tier__marker">▶ ваш уровень</div>
          <b>{{ lvl.name }}</b>
          <div class="range">{{ levelRange(lvl) }}</div>
          <div class="cb">{{ lvl.cashback }}% кешбэк</div>
        </div>
      </div>
      <div class="loyalty loyalty--mt">
        <div class="loyalty__top">До уровня {{ nextLevel?.name ?? 'VIP' }} осталось {{ nextLevel ? formatPrice(remainingToNext) : '—' }}</div>
        <div class="progress"><progress class="progress__fill" :value="progressPct" max="100"></progress></div>
        <p>{{ formatPrice(totalSpent) }} из {{ formatPrice(nextLevel?.min ?? currentLevel.min) }} · потратьте ещё {{ nextLevel ? formatPrice(remainingToNext) : '0' }} и получите {{ nextLevel?.cashback ?? currentLevel.cashback }}% кешбэка</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCabinetTier } from '@/composables/useCabinetTier'
import type { LoyaltyLevel } from '@/types/bonus'
import { formatPrice } from '@/utils/formatters'

const props = defineProps<{
  balance: number
  expireDays?: number | null
  levels: LoyaltyLevel[]
  totalSpent: number
}>()

const totalSpent = computed(() => props.totalSpent)
const levels = computed(() => props.levels)
const { currentLevel, nextLevel, progressPct, levelRange, remainingToNext } = useCabinetTier(totalSpent, levels)
</script>
