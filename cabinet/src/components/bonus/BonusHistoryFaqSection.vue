<template>
  <div>
    <div class="cab-section">
      <h2 class="sec-title">История операций</h2>
      <div class="chips-row">
        <button v-for="t in txnTabs" :key="t.value" class="fchip" :class="{ 'is-on': txnFilter === t.value }" @click="txnFilter = t.value">{{ t.label }}</button>
      </div>
      <div v-if="filteredTxn.length === 0" class="bonus-tx-empty">Операций нет</div>
      <div v-else>
        <div v-for="tx in filteredTxn" :key="tx._id" class="txn">
          <span class="txn__amt" :class="tx.type === 'credit' ? 'in' : 'out'">{{ tx.type === 'credit' ? '+' : '−' }}{{ tx.amount }} ₽</span>
          <div class="txn__text">{{ tx.description }}</div>
          <span class="txn__date2">{{ formatShortDate(tx.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="cab-section">
      <h2 class="sec-title">Вопросы о бонусах</h2>
      <div>
        <div v-for="(faq, i) in faqs" :key="i" class="faq-item" :class="{ open: openFaq === i }">
          <button class="faq-q" @click="openFaq = openFaq === i ? -1 : i">
            {{ faq.q }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="faq-a" :class="{ 'faq-a--open': openFaq === i }">
            <p>{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BonusTransaction, LoyaltyLevel } from '@/types/bonus'
import { formatShortDate } from '@/utils/formatters'

const props = defineProps<{
  transactions: BonusTransaction[]
  expireDays?: number | null
  levels: LoyaltyLevel[]
}>()

const txnFilter = ref<'all' | 'credit' | 'debit'>('all')
const openFaq = ref(-1)

const txnTabs: { label: string; value: 'all' | 'credit' | 'debit' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Начислено', value: 'credit' },
  { label: 'Списано', value: 'debit' },
]

const filteredTxn = computed(() =>
  txnFilter.value === 'all'
    ? props.transactions
    : props.transactions.filter((transaction) => transaction.type === txnFilter.value)
)

const cashbackSummary = computed(() => props.levels.map((level) => `${level.cashback}%`).join(', '))

const faqs = computed(() => [
  { q: 'Как начисляются бонусы?', a: `На каждый заказ начисляется кешбэк в процентах от суммы в зависимости от вашего уровня лояльности: ${cashbackSummary.value}.` },
  { q: 'Когда сгорают бонусы?', a: `Бонусы действуют ${props.expireDays || 90} дней с момента начисления. Мы заранее предупредим о сгорании.` },
  { q: 'Как потратить бонусы?', a: 'При оформлении заказа отметьте «Списать баллы». 1 бонус = 1 рубль, оплатить можно до 50% суммы заказа.' },
  { q: 'Можно совместить с промокодом?', a: 'Да, бонусы суммируются с промокодами, кроме акционных позиций со специальной отметкой.' },
])
</script>
