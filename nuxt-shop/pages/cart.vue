<template>
  <main class="page cart-page">

    <div class="container">
      <nav class="breadcrumb">
        <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span><span>Оформление заказа</span>
      </nav>
      <h1 class="cart-page-title">Оформление заказа</h1>
    </div>

    <!-- ТЕЛО -->
    <section class="container cart-layout">
      <!-- ЛЕВАЯ КОЛОНКА -->
      <div>
        <CartDeliveryProgress
          :free-delivery-left="freeDeliveryLeft"
          :progress-width="freeDeliveryProgressWidth"
        />

        <CartEmptyState v-if="items.length === 0" />

        <CartOrderSuccess v-else-if="orderResult" :order-result="orderResult" />

        <template v-else>
          <h3 class="cart-section-title">
            Ваш заказ · {{ items.length }} {{ itemWord }}
          </h3>

          <CartLineList
            :items="items"
            :img-errors="imgErrors"
            :cart-item-image="cartItemImage"
            :volume-discount-items="volumeDiscountItems"
            :get-volume-discount-pct="getVolumeDiscountPct"
            @remove-line="removeLine"
            @set-line-qty="setLineQty"
            @image-error="imgErrors[$event] = true"
          />

          <!-- ДОСТАВКА -->
          <h3 class="cart-section-title">Доставка</h3>
          <CartDeliveryMethodPicker
            :deliveries="deliveries"
            :active-delivery="activeDelivery"
            :delivery-preview-is-free="deliveryPreviewIsFree"
            :zone-delivery-cost="zoneDeliveryCost"
            @update:active-delivery="activeDelivery = $event"
          />

          <CartDeliveryForm
            :form="form"
            :form-errors="formErrors"
            :shop-user="shopUser"
            :active-delivery="activeDelivery"
            :has-profile-address="hasProfileAddress"
            :detected-zone="detectedZone"
            :delivery-zones="deliveryZones"
            :default-delivery-cost="DEFAULT_DELIVERY_COST"
            :suggestions="addrSuggest.suggestions.value"
            :suggest="addrSuggest.suggest"
            :clear="addrSuggest.clear"
            :time-slots="timeSlots"
            :dp-open="dpOpen"
            :today-str="todayStr"
            :dp-month-label="dpMonthLabel"
            :dp-cells="dpCells"
            :fmt-date-ru="fmtDateRu"
            :set-dp-field-ref="setDpFieldRef"
            @toggle-date-picker="dpOpen = !dpOpen"
            @prev-month="dpPrevMonth"
            @next-month="dpNextMonth"
            @select-date="selectDate"
          />
        </template>
      </div>

      <!-- ПРАВАЯ КОЛОНКА — ИТОГ -->
      <CartSummary
        v-if="items.length > 0 && !orderResult"
        :items-count="items.length"
        :subtotal="subtotal"
        :volume-discount="volumeDiscount"
        :active-delivery-label="deliveries[activeDelivery].label"
        :delivery-cost="deliveryCost"
        :promo-applied="promoApplied"
        :promo2-applied="promo2Applied"
        :discount="discount"
        :cart-trigger-result="cartTriggerResult"
        :promo="promo"
        :promo-checking="promoChecking"
        :promo-error="promoError"
        :promo-discount-type="promoDiscountType"
        :discount-pct="discountPct"
        :promo-max-discount="promoMaxDiscount"
        :promo-stackable="promoStackable"
        :promo2="promo2"
        :promo2-checking="promo2Checking"
        :promo2-error="promo2Error"
        :promo2-type="promo2Type"
        :discount-pct2="discountPct2"
        :can-use-bonuses="canUseBonuses"
        :bonus-enabled="bonusEnabled"
        :bonus-balance="shopUser?.bonusBalance ?? 0"
        :bonus-max-spend-percent="bonusMaxSpendPercent"
        :bonus-to-use="bonusToUse"
        :total-with-bonus="totalWithBonus"
        :submitting="submitting"
        :submit-error="submitError"
        :bonus-earned="bonusEarned"
        @apply-promo="applyPromo"
        @apply-promo2="applyPromo2"
        @clear-promo="clearPromo"
        @clear-promo2="clearPromo2"
        @accept-cart-trigger-promo="acceptCartTriggerPromo"
        @toggle-bonus="bonusEnabled = !bonusEnabled"
        @submit-order="submitOrder"
        @update-promo="promo = $event"
        @update-promo2="promo2 = $event"
      />
    </section>

    <!-- Мобильная полоса оформления (над botnav) -->
    <CartMobileCheckoutBar
      v-if="items.length > 0 && !orderResult"
      :total-with-bonus="totalWithBonus"
      :submitting="submitting"
      @submit-order="submitOrder"
    />

  </main>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical } = useSeo()
useSeoMeta(() => ({ title: `Оформление заказа — ${settings.value.storeName}`, robots: 'noindex,follow' }))
setCanonical('/cart')

const { user: shopUser, updateBalance } = useShopUser()
const { items, subtotal, removeLine, setLineQty, clearCart } = useCart()
const { utm } = useUtm()

const addrSuggest = useDadata()
const { productSnapshots, deliveryZones, loyaltyLevels } = useCartPageQueries()

const {
  imgErrors,
  itemWord,
  cartItemImage,
  deliveryPreviewIsFree,
  DEFAULT_DELIVERY_COST,
  form,
  formErrors,
  hasProfileAddress,
  timeSlots,
  deliveries,
  activeDelivery,
  activeDeliveryType,
  detectedZone,
  todayStr,
  dpOpen,
  dpFieldRef,
  dpMonthLabel,
  dpCells,
  dpPrevMonth,
  dpNextMonth,
  selectDate,
  fmtDateRu,
  bonusEnabled,
  promo,
  promoApplied,
  promoError,
  promoChecking,
  discountPct,
  promoDiscountType,
  promoMaxDiscount,
  promoStackable,
  promo2,
  promo2Applied,
  promo2Error,
  promo2Checking,
  discountPct2,
  promo2Type,
  applyPromo,
  applyPromo2,
  clearPromo,
  clearPromo2,
  cartTriggerResult,
  acceptCartTriggerPromo,
  submitting,
  submitError,
  orderResult,
  submitOrder,
  bonusMaxSpendPercent,
  canUseBonuses,
  bonusToUse,
  total,
  totalWithBonus,
  bonusEarned,
  discount,
  deliveryCost,
  zoneDeliveryCost,
  effectiveSubtotal,
  freeDeliveryLeft,
  freeDeliveryProgressWidth,
  volumeDiscount,
  volumeDiscountItems,
  getVolumeDiscountPct,
} = useCartPageState({
  settings,
  shopUser,
  items,
  subtotal,
  utm,
  updateBalance,
  productSnapshots,
  deliveryZones,
  loyaltyLevels,
  clearCart,
})

function setDpFieldRef(el: Element | null) {
  dpFieldRef.value = (el as HTMLElement | null)
}
</script>

