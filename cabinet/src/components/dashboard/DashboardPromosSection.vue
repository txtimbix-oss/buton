<template>
  <section class="dashboard-promos">
    <div
      v-if="birthdayPromo"
      class="dashboard-birthday-banner"
    >
      <svg
        width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
        class="dashboard-birthday-banner__icon"
      >
        <path d="M4 16v4h16v-4M4 16a3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 4 0M4 16v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
        <path d="M12 8V5M9 5h6" />
      </svg>
      <div class="dashboard-birthday-banner__content">
        <b class="dashboard-birthday-banner__title">С Днём рождения, {{ userFirstName }}!</b>
        <span class="dashboard-birthday-banner__desc">
          Ваша скидка:
          <code
            class="dashboard-birthday-banner__code"
            @click="emit('copy-code', birthdayPromo.code)"
          >{{ birthdayPromo.code }}</code>
        </span>
      </div>
    </div>

    <div class="cab-section dashboard-promos__section">
      <CabSectionHeader title="Активные промокоды" action-label="Смотреть все →" to="/bonus" />
      <div v-if="activePromos.length" class="dashboard-promos__list">
        <button
          v-for="promo in activePromos"
          :key="promo.code"
          type="button"
          class="dashboard-promo-chip"
          @click="emit('copy-code', promo.code)"
        >
          <span class="dashboard-promo-chip__code">{{ promo.code }}</span>
          <span class="dashboard-promo-chip__text">{{ promo.title }} · {{ promo.detail }}</span>
        </button>
      </div>
      <p v-else class="dashboard-promos__empty">Пока нет активных промокодов</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import CabSectionHeader from '@/components/CabSectionHeader.vue'
import type { ActivePromo, BirthdayPromo } from '@/composables/useDashboardPromos'

defineProps<{
  activePromos: ActivePromo[]
  birthdayPromo: BirthdayPromo | null
  userFirstName?: string
}>()

const emit = defineEmits<{
  'copy-code': [code: string]
}>()
</script>
