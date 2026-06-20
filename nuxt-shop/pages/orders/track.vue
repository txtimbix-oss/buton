<template>
  <main class="page">

    <section class="container track-page">
      <nav class="breadcrumb">
        <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span><span>Отслеживание заказа</span>
      </nav>
      <h1 class="h-page track-title">Отслеживание заказа</h1>
      <p class="text-muted track-subtitle">Введите номер заказа и телефон получателя</p>

      <!-- Форма поиска -->
      <div class="track-card" v-if="!order">
        <form @submit.prevent="search" class="track-form">
          <div class="field">
            <label>Номер заказа</label>
            <input
              v-model="form.number"
              class="input track-form-input"
              placeholder="SPB-01001"
              @input="updateOrderNumber(($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>Телефон получателя</label>
            <input
              v-model="form.phone"
              class="input"
              type="tel"
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          <div v-if="error" class="track-error">{{ error }}</div>
          <button class="btn btn--ink track-submit" type="submit" :disabled="loading">
            {{ loading ? 'Ищем…' : 'Найти заказ' }}
          </button>
        </form>
      </div>

      <!-- Результат -->
      <template v-else>
        <div class="track-card">
          <!-- Шапка -->
          <div class="track-header">
            <div>
              <div class="track-number__label">Номер заказа</div>
              <div class="track-number__value">{{ order.orderNumber }}</div>
            </div>
            <div class="track-total">
              <div class="track-total__label">Итого</div>
              <div class="track-total__value">{{ order.total.toLocaleString('ru-RU') }} ₽</div>
            </div>
          </div>

          <!-- Прогресс-бар статуса -->
          <div class="status-track">
            <div
              v-for="(step, i) in statusSteps"
              :key="step.key"
              class="status-track__step"
              :class="{
                done:   statusIndex >= i,
                active: statusIndex === i,
                cancelled: order.status === 'cancelled',
              }"
            >
              <div class="status-track__dot">
                <svg v-if="statusIndex > i" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <div class="status-track__connector" v-if="i < statusSteps.length - 1" />
              <div class="status-track__label">{{ step.label }}</div>
            </div>
          </div>

          <div v-if="order.status === 'cancelled'" class="track-cancelled">
            Заказ отменён. Свяжитесь с нами для уточнения деталей.
          </div>

          <!-- Детали -->
          <div class="track-details">
            <div>
              <div class="track-section-title">Состав заказа</div>
              <div v-for="item in order.items" :key="item.slug + item.sizeLabel" class="track-item">
                <div class="track-item__details">
                  <div class="track-item__name">{{ item.name }}</div>
                  <div class="track-item__meta">Размер {{ item.sizeLabel }} · {{ item.qty }} шт</div>
                </div>
                <div class="track-item__sum">{{ (item.price * item.qty).toLocaleString('ru-RU') }} ₽</div>
              </div>
            </div>
            <div>
              <div class="track-section-title">Доставка</div>
              <div class="track-delivery">
                <div>{{ deliveryTypeLabel }}</div>
                <div v-if="order.delivery.address">{{ order.delivery.address }}</div>
                <div>{{ order.delivery.date }} · {{ order.delivery.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn--ghost track-reset-btn" @click="reset">
          ← Найти другой заказ
        </button>
      </template>
    </section>

  </main>
</template>

<script setup lang="ts">
const settings = useSettings()
useHead(() => ({ title: `Отслеживание заказа — ${settings.value.storeName}` }))

const {
  form,
  order,
  loading,
  error,
  statusSteps,
  statusIndex,
  deliveryTypeLabel,
  updateOrderNumber,
  search,
  reset,
} = useOrderTrackPageState({}, {
  fetchOrder: (query) => $fetch('/api/orders/track', { query }),
})
</script>

<style scoped>
.track-page {
  max-width: 680px;
  padding: 24px 0 80px;
}
.track-title { margin-bottom: 8px; }
.track-subtitle { margin-bottom: 40px; }
.track-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: clamp(20px, 4vw, 32px);
}
.track-form { display: flex; flex-direction: column; gap: 18px; }
.track-form-input { text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
.track-submit { width: 100%; justify-content: center; padding: 14px; }
.track-error {
  background: #FEE8E7; color: #B42318;
  border-radius: 4px; padding: 10px 14px; font-size: 14px;
}

/* Прогресс статуса */
.status-track {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin: 28px 0;
  position: relative;
}
.status-track__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}
.status-track__dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid var(--line);
  background: var(--white);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--muted);
  position: relative; z-index: 1;
  transition: all .2s;
}
.status-track__step.done .status-track__dot  { background: var(--green); border-color: var(--green); color: #fff; }
.status-track__step.active .status-track__dot { background: var(--green); border-color: var(--green); color: #fff; box-shadow: 0 0 0 4px rgba(46,71,54,.15); }
.status-track__step.cancelled .status-track__dot { background: #FEE8E7; border-color: #B42318; color: #B42318; }
.status-track__connector {
  position: absolute;
  top: 16px; left: 50%; right: -50%;
  height: 2px;
  background: var(--line);
  z-index: 0;
}
.status-track__step.done .status-track__connector { background: var(--green); }
.status-track__label {
  font-size: 11px; font-weight: 600; color: var(--muted);
  margin-top: 8px; text-align: center; white-space: nowrap;
}
.status-track__step.done .status-track__label,
.status-track__step.active .status-track__label { color: var(--green); }

.track-cancelled {
  background: #FEE8E7; color: #B42318;
  border-radius: 4px; padding: 12px 16px; font-size: 14px; margin-bottom: 20px;
}

/* Детали заказа */
.track-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 4px;
}
.track-number__label { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
.track-number__value { font-family: var(--serif); font-size: 28px; font-weight: 600; color: var(--green); }
.track-total { text-align: right; }
.track-total__label { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
.track-total__value { font-size: 22px; font-weight: 700; }
.track-details {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  margin-top: 20px; padding-top: 20px;
  border-top: 1px solid var(--line);
}
.track-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--muted); margin-bottom: 12px;
}
.track-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--line);
}
.track-item:last-child { border-bottom: none; }
.track-item__details { flex: 1; }
.track-item__name { font-weight: 600; }
.track-item__meta { font-size: 13px; color: var(--muted); }
.track-item__sum { font-weight: 600; }
.track-delivery { font-size: 14px; color: var(--muted); line-height: 1.7; }
.track-reset-btn { margin-top: 20px; }

@media (max-width: 768px) {
  .track-page { padding: 24px 20px 60px; }
  .track-details { grid-template-columns: 1fr; }
  .status-track__label { font-size: 10px; }
}
</style>
