<template>
  <aside class="summary">
    <h3>Итого</h3>

    <div class="sum-row2">
      <span class="cart-sum-label">Букеты ({{ itemsCount }})</span>
      <span>{{ subtotal.toLocaleString('ru-RU') }} ₽</span>
    </div>
    <div v-if="volumeDiscount > 0" class="sum-row2">
      <span class="cart-sum-label">Скидка за объём</span>
      <span class="cart-sum-value-clay">−{{ volumeDiscount.toLocaleString('ru-RU') }} ₽</span>
    </div>
    <div class="sum-row2">
      <span class="cart-sum-label">{{ activeDeliveryLabel }}</span>
      <span class="cart-sum-value-clay" :class="{ 'cart-sum-value--green': deliveryCost === 0 }">
        {{ deliveryCost === 0 ? 'Бесплатно' : deliveryCost.toLocaleString('ru-RU') + ' ₽' }}
      </span>
    </div>
    <div v-if="promoApplied" class="sum-row2">
      <span class="cart-sum-label">Скидка по промокод{{ promo2Applied ? 'ам' : 'у' }}</span>
      <span class="cart-sum-value-clay">−{{ discount.toLocaleString('ru-RU') }} ₽</span>
    </div>
    <!-- Корзинный триггер — подсказка -->
    <div
      v-if="cartTriggerResult && !promoApplied"
      class="cart-trigger-hint"
      :class="`cart-trigger-hint--${cartTriggerResult.type}`"
    >
      <template v-if="cartTriggerResult.type === 'approaching'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Добавьте ещё {{ cartTriggerResult.remaining!.toLocaleString('ru-RU') }} ₽ — и получите промокод
        <strong>{{ cartTriggerResult.trigger.promoCode }}</strong>
      </template>
      <template v-else>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        {{ cartTriggerResult.trigger.message || 'Ваш промокод:' }}
        <button
          class="cart-trigger-code"
          @click="emit('acceptCartTriggerPromo')"
        >{{ cartTriggerResult.trigger.promoCode }}</button>
      </template>
    </div>

    <!-- Промокод -->
    <div class="cart-promo-row">
      <input
        :value="promo" class="input cart-promo-input" type="text" placeholder="Промокод"
        :class="{ 'is-active': promoApplied }"
        :disabled="promoApplied"
        @input="emit('updatePromo', ($event.target as HTMLInputElement).value)"
        @keydown.enter="emit('applyPromo')"
      />
      <button class="btn btn--ghost cart-promo-btn" :disabled="promoChecking" @click="promoApplied ? emit('clearPromo') : emit('applyPromo')">
        {{ promoApplied ? 'Убрать' : promoChecking ? '…' : 'Применить' }}
      </button>
    </div>
    <p v-if="promoError" class="cart-note cart-note--clay">{{ promoError }}</p>
    <p v-if="promoApplied" class="cart-note cart-note--green">
      ✓ {{
        promoDiscountType === 'free_shipping' ? 'Бесплатная доставка применена'
        : promoDiscountType === 'percent_capped' ? `Скидка ${discountPct}% (макс. ${promoMaxDiscount.toLocaleString('ru-RU')} ₽) применена`
        : promoDiscountType === 'percent' ? `Скидка ${discountPct}% применена`
        : `Скидка ${discountPct} ₽ применена`
      }}
    </p>
    <!-- Второй промокод (только если первый stackable) -->
    <template v-if="promoApplied && promoStackable">
      <div class="cart-promo-row">
        <input
          :value="promo2" class="input cart-promo-input" type="text" placeholder="Ещё один промокод"
          :class="{ 'is-active': promo2Applied }"
          :disabled="promo2Applied"
          @input="emit('updatePromo2', ($event.target as HTMLInputElement).value)"
          @keydown.enter="emit('applyPromo2')"
        />
        <button class="btn btn--ghost cart-promo-btn" :disabled="promo2Checking" @click="promo2Applied ? emit('clearPromo2') : emit('applyPromo2')">
          {{ promo2Applied ? 'Убрать' : promo2Checking ? '…' : 'Применить' }}
        </button>
      </div>
      <p v-if="promo2Error" class="cart-note cart-note--clay">{{ promo2Error }}</p>
      <p v-if="promo2Applied" class="cart-note cart-note--green">
        ✓ {{ promo2Type === 'percent' ? `+${discountPct2}% дополнительно` : `+${discountPct2} ₽ дополнительно` }}
      </p>
    </template>

    <!-- Бонусные баллы — toggle по макету -->
    <div
      v-if="canUseBonuses"
      class="bonus-toggle-row"
      @click="emit('toggleBonus')"
    >
        <div>
        <div class="cart-bonus-title">Списать баллы {{ settings.storeName }}</div>
        <div class="cart-bonus-desc">
          Доступно {{ bonusBalance }}
          <template v-if="bonusMaxSpendPercent < 100"> · до {{ bonusMaxSpendPercent }}% суммы заказа</template>
          · 1 балл = 1 ₽
        </div>
      </div>
      <span class="switch" :class="{ on: bonusEnabled }" />
    </div>
    <div v-if="bonusToUse > 0" class="sum-row2">
      <span class="cart-sum-label">Списано баллами</span>
      <span class="cart-sum-value-clay">−{{ bonusToUse.toLocaleString('ru-RU') }} ₽</span>
    </div>

    <div class="sum-row2 total cart-total-row">
      <span>К оплате</span>
      <span>{{ totalWithBonus.toLocaleString('ru-RU') }} ₽</span>
    </div>

    <button
      class="btn btn--ink btn--block cart-submit-btn"
      :disabled="submitting"
      @click="emit('submitOrder')"
    >
      <template v-if="submitting">Отправляем заказ…</template>
      <template v-else>Оформить заказ <span class="arr">→</span></template>
    </button>
    <p v-if="submitError" class="cart-submit-error">{{ submitError }}</p>

    <div v-if="bonusEarned > 0" class="cart-note-row">
      <AppIcon name="gift" /> Вернём {{ bonusEarned.toLocaleString('ru-RU') }} баллов после доставки
    </div>
    <div class="cart-note-row cart-note-row--small">
      <AppIcon name="leaf" /> Покажем фото букета перед доставкой
    </div>
    <div class="cart-note-row cart-note-row--small">
      <AppIcon name="clock" /> Гарантия свежести 7 дней
    </div>
  </aside>
</template>

<script setup lang="ts">
interface CartTriggerResult {
  type: 'approaching' | 'reached'
  remaining?: number
  trigger: { promoCode: string; message?: string }
}

defineProps<{
  itemsCount: number
  subtotal: number
  volumeDiscount: number
  activeDeliveryLabel: string
  deliveryCost: number
  promoApplied: boolean
  promo2Applied: boolean
  discount: number
  cartTriggerResult: CartTriggerResult | null
  promo: string
  promoChecking: boolean
  promoError: string
  promoDiscountType: string
  discountPct: number
  promoMaxDiscount: number
  promoStackable: boolean
  promo2: string
  promo2Checking: boolean
  promo2Error: string
  promo2Type: string
  discountPct2: number
  canUseBonuses: boolean
  bonusEnabled: boolean
  bonusBalance: number
  bonusMaxSpendPercent: number
  bonusToUse: number
  totalWithBonus: number
  submitting: boolean
  submitError: string
  bonusEarned: number
}>()

const emit = defineEmits<{
  applyPromo: []
  applyPromo2: []
  clearPromo: []
  clearPromo2: []
  acceptCartTriggerPromo: []
  toggleBonus: []
  submitOrder: []
  updatePromo: [value: string]
  updatePromo2: [value: string]
}>()

const settings = useSettings()
</script>
