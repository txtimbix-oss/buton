<template>
  <AppLayout>
    <section class="dashboard-hero cab-section">
      <div class="dashboard-hero__copy">
        <p class="dashboard-hero__eyebrow">Личный кабинет Buton</p>
        <h1 class="dashboard-hero__headline">
          {{ userFirstName }}, держим ваши заказы, бонусы и поводы рядом
        </h1>
        <p class="dashboard-hero__lead">
          Следите за ближайшей доставкой, сохраняйте любимые сценарии и быстро возвращайтесь к
          персональным предложениям.
        </p>
      </div>

      <div class="dashboard-hero__grid">
        <article class="dashboard-status-card dashboard-status-card--primary">
          <span class="dashboard-status-card__label">Бонусный баланс</span>
          <b class="dashboard-status-card__value">{{ bonusBalance }} ₽</b>
          <p class="dashboard-status-card__meta">Доступно для следующего заказа, подарка или приятного повтора</p>
        </article>

        <div class="dashboard-hero__metrics">
          <article class="dashboard-status-card">
            <span class="dashboard-status-card__label">Последний заказ</span>
            <b class="dashboard-status-card__value">{{ latestOrderStatus }}</b>
            <p class="dashboard-status-card__meta">{{ latestOrderSubline }}</p>
          </article>
          <article class="dashboard-status-card">
            <span class="dashboard-status-card__label">Активные предложения</span>
            <b class="dashboard-status-card__value">{{ activePromos.length }}</b>
            <p class="dashboard-status-card__meta">Персональные коды и поводы вернуться в магазин</p>
          </article>
          <article class="dashboard-status-card dashboard-status-card--soft">
            <span class="dashboard-status-card__label">Ближайшая доставка</span>
            <b class="dashboard-status-card__value">{{ nextDeliveryLabel }}</b>
            <p class="dashboard-status-card__meta">Следующий удобный слот для вашего сценария</p>
          </article>
        </div>
      </div>
    </section>

    <DashboardQuickActions
      :can-create-review="canCreateReview"
      :has-latest-order="hasLatestOrder"
      :repeating-order="repeatingOrder"
      @go-to-review="goToReview"
      @open-cart="openCart"
      @repeat-order="repeatLastOrder"
    />

    <DashboardPromosSection
      :active-promos="activePromos"
      :birthday-promo="birthdayPromo"
      :user-first-name="userFirstName"
      @copy-code="copyCode"
    />

    <div class="dash-2col">
      <div>
        <DashboardRecentOrdersSection
          :loading="loading"
          :recent-orders="recentOrders"
          :shop-url="SHOP_URL"
          @open-order="openOrder"
        />
      </div>

      <div>
        <DashboardLoyaltySection
          :is-max-level="isMaxLevel"
          :loyalty-name="loyaltyName"
          :next-threshold="nextThreshold"
          :next-tier-name="nextTierName"
          :progress-pct="progressPct"
          :remaining-to-next="remainingToNext"
          :tier-cashback="tierCashback"
          :total-spent="totalSpent"
        />

        <DashboardRecommendationsSection :products="recommendations" :shop-url="SHOP_URL" />
      </div>
    </div>

    <CabReferralCard
      root-class="referral dashboard-referral cab-section"
      :referral-code="referralCode"
      button-label="Скопировать"
      @copied="handleReferralCopied"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabReferralCard from '@/components/CabReferralCard.vue'
import DashboardLoyaltySection from '@/components/dashboard/DashboardLoyaltySection.vue'
import DashboardPromosSection from '@/components/dashboard/DashboardPromosSection.vue'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'
import DashboardRecentOrdersSection from '@/components/dashboard/DashboardRecentOrdersSection.vue'
import DashboardRecommendationsSection from '@/components/dashboard/DashboardRecommendationsSection.vue'
import { useDashboardViewModel } from '@/composables/useDashboardViewModel'

const {
  SHOP_URL,
  activePromos,
  birthdayPromo,
  bonusBalance,
  canCreateReview,
  copyCode,
  goToReview,
  handleReferralCopied,
  hasLatestOrder,
  isMaxLevel,
  latestOrderStatus,
  latestOrderSubline,
  loading,
  loyaltyName,
  nextDeliveryLabel,
  nextThreshold,
  nextTierName,
  openCart,
  openOrder,
  progressPct,
  recentOrders,
  recommendations,
  referralCode,
  remainingToNext,
  repeatLastOrder,
  repeatingOrder,
  tierCashback,
  totalSpent,
  userFirstName,
} = useDashboardViewModel()
</script>
