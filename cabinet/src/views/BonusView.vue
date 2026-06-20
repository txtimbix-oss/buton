<template>
  <AppLayout>
    <h1 class="page-title">Бонусы и лояльность</h1>
    <p class="page-sub">Баллы, уровни лояльности и история операций</p>

    <div v-if="loading" class="loading-inline"><span class="spinner"></span></div>

    <template v-else>
      <div class="bonus-2col">
        <div>
          <BonusSummarySection
            :balance="bonusBalance"
            :expire-days="settings.expireDays"
            :levels="levels"
            :total-spent="totalSpent"
          />
        </div>

        <div>
          <BonusHistoryFaqSection
            :transactions="transactions"
            :expire-days="settings.expireDays"
            :levels="levels"
          />
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import BonusHistoryFaqSection from '@/components/bonus/BonusHistoryFaqSection.vue'
import BonusSummarySection from '@/components/bonus/BonusSummarySection.vue'
import { useBonusViewModel } from '@/composables/useBonusViewModel'

const {
  bonusBalance,
  levels,
  loading,
  settings,
  totalSpent,
  transactions,
} = useBonusViewModel()
</script>
