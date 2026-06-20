<template>
  <div class="page-wrap">
    <section class="custom-hero">
      <div>
        <div class="breadcrumb custom-hero__breadcrumb">
          <NuxtLink to="/">Главная</NuxtLink> · <span>Собрать свой букет</span>
        </div>
        <div class="eyebrow custom-hero__eyebrow">Персональная сборка</div>
        <h1 class="custom-hero__title">Соберите букет под себя</h1>
        <p class="lead custom-hero__lead">
          Выберите формат, цветовую гамму и нюансы — и получите авторскую идею сразу в корзине, или отправьте заявку флористу на точный эскиз.
        </p>
        <div class="custom-trust custom-hero__trust">
          <span class="tag tag--clay">Фото перед отправкой</span>
          <span class="tag tag--green">Сборка вручную</span>
          <span class="tag tag--blush">Гарантия свежести 7 дней</span>
        </div>
      </div>
      <div class="custom-hero__media">
        <BloomImg class="custom-hero__image" :kind="selectedPalette.kind" :cap="selectedPalette.name" />
      </div>
    </section>

    <section class="custom-body">
      <div class="custom-form-card">
        <Transition name="fade" mode="out-in">
          <div v-if="quoteSent" class="custom-success">
            <div class="custom-success__icon">🌷</div>
            <h2 class="custom-success__title">Заявка отправлена</h2>
            <p class="custom-success__description">
              Флорист свяжется с вами в ближайшее время и пришлёт визуальный вариант букета.
            </p>
            <NuxtLink to="/catalog" class="btn btn--ink">Смотреть каталог</NuxtLink>
          </div>
          <div v-else>
            <div class="custom-field">
              <div class="custom-label">Для какого повода</div>
              <div class="chips-row">
                <button
                  v-for="option in occasions"
                  :key="option"
                  class="tag chip-btn"
                  :class="selectedOccasion === option ? 'tag--green' : 'chip-btn--card'"
                  @click="selectedOccasion = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <div class="custom-field">
              <div class="custom-label">Размер букета</div>
              <div class="size-grid">
                <button
                  v-for="size in sizeOptions"
                  :key="size.id"
                  class="size-card"
                  :class="{ active: selectedSize.id === size.id }"
                  type="button"
                  @click="selectedSize = size"
                >
                  <span class="size-card__title">{{ size.label }} · {{ size.price.toLocaleString('ru-RU') }} ₽</span>
                  <span class="size-card__meta">{{ size.stems }} · {{ size.height }} · {{ size.weight }}</span>
                  <span class="size-card__desc">{{ size.note }}</span>
                </button>
              </div>
            </div>

            <div class="custom-grid-2">
              <div class="custom-field">
                <label for="flower-count">Количество стеблей</label>
                <select id="flower-count" v-model.number="flowerCount" class="selectbox">
                  <option v-for="count in flowerCountOptions" :key="count" :value="count">{{ count }} шт.</option>
                </select>
              </div>
              <div class="custom-field">
                <div class="custom-label">Тип цветка</div>
                <div class="chips-row">
                  <button
                    v-for="option in flowerTypes"
                    :key="option.id"
                    class="chip-btn"
                    :class="selectedFlowerType.id === option.id ? 'tag--green' : 'chip-btn--outlined'"
                    @click="selectedFlowerType = option"
                  >
                    {{ option.name }}
                  </button>
                </div>
              </div>
            </div>

            <div class="custom-field">
              <div class="custom-label">Цветовая гамма</div>
              <div class="palette-row">
                <button
                  v-for="item in paletteOptions"
                  :key="item.id"
                  class="palette-dot"
                  :class="['palette-dot', `palette-dot--${item.id}`, { active: selectedPalette.id === item.id }]"
                  :title="item.name"
                  @click="selectedPalette = item"
                >
                  <BloomImg :kind="item.kind" class="palette-dot__img" />
                </button>
              </div>
            </div>

            <div class="custom-field">
              <div class="custom-label">Стиль композиции</div>
              <div class="chips-row">
                <button
                  v-for="option in styleOptions"
                  :key="option.id"
                  class="chip-btn"
                  :class="selectedStyle.id === option.id ? 'tag--green' : 'chip-btn--outlined'"
                  @click="selectedStyle = option"
                >
                  {{ option.name }}
                </button>
              </div>
            </div>

            <div class="custom-field">
              <div class="custom-label">Упаковка</div>
              <select v-model="selectedPackagingId" class="selectbox">
                <option v-for="packagingOption in packagingOptions" :key="packagingOption.id" :value="packagingOption.id">
                  {{ packagingOption.name }} · +{{ packagingOption.price.toLocaleString('ru-RU') }} ₽
                </option>
              </select>
            </div>

            <div class="custom-field">
              <div class="custom-label">Аксессуары и бонусы</div>
              <div class="addons-grid">
                <label v-for="acc in accessoryOptions" :key="acc.id" class="addon-card" :class="{ active: selectedAddons.includes(acc.id) }">
                  <input
                    v-model="selectedAddons"
                    type="checkbox"
                    :value="acc.id"
                    class="addon-card__input"
                    @change="toggleAddon"
                  />
                  <span class="addon-card__name">{{ acc.name }}</span>
                  <span class="addon-card__price">+{{ acc.price.toLocaleString('ru-RU') }} ₽</span>
                </label>
              </div>
            </div>

            <div class="custom-grid-2">
              <div class="field">
                <label>Когда нужен</label>
                <input v-model="deliveryDate" class="input" type="date" :min="today" />
              </div>
              <div class="field">
                <label>Время</label>
                <select v-model="deliveryTime" class="selectbox">
                  <option v-for="time in deliveryTimes" :key="time" :value="time">{{ time }}</option>
                </select>
              </div>
            </div>

            <div class="custom-grid-2">
              <div class="field">
                <label>Ваше имя *</label>
                <input v-model="form.name" class="input" type="text" placeholder="Мария" :class="{ 'is-active': errors.name }" />
              </div>
              <div class="field">
                <label>Телефон *</label>
                <input v-model="form.phone" class="input" type="tel" placeholder="+7 921 ···" :class="{ 'is-active': errors.phone }" />
              </div>
            </div>

            <div class="custom-field">
              <label>Пожелания флористу</label>
              <textarea v-model="form.message" class="input area" rows="3" placeholder="Добавьте пожелания к вкусу: нежные оттенки, без пыльники и т.д." />
            </div>

            <p v-if="errors.name || errors.phone" class="custom-hint">Заполните имя и телефон для отправки заявки</p>
            <p v-if="apiError" class="custom-hint custom-hint--error">{{ apiError }}</p>

            <div class="custom-actions">
              <button
                class="btn btn--ink btn--lg"
                :disabled="addingToCart"
                @click="addCustomToCart"
              >
                Добавить в корзину · {{ estimatedTotal.toLocaleString('ru-RU') }} ₽
              </button>
              <button
                class="btn btn--ghost btn--lg"
                :disabled="quoteLoading"
                @click="submitQuote"
              >
                {{ quoteLoading ? 'Отправляем заявку…' : 'Получить точный эскиз у флориста' }}
              </button>
              <div class="quick-order-block">
                <div class="quick-order__title">Быстрый заказ</div>
                <div class="quick-order__row">
                  <label>Доставка сегодня</label>
                  <select v-model="quickDeliveryTime" class="selectbox">
                    <option v-for="time in deliveryTimes" :key="time" :value="time">{{ time }}</option>
                  </select>
                </div>
                <label class="quick-order__mandatory">
                  <input type="checkbox" checked disabled />
                  <span>Фото букета перед отправкой</span>
                </label>
            <button
              class="btn btn--clay btn--lg btn--full custom-quick-order__action"
              :disabled="quickOrderPending"
              @click="addCustomQuickOrder"
            >
                  {{ quickOrderPending ? 'Формируем быстрый заказ…' : `Заказать сегодня · ${quickDeliveryTime}` }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <aside class="custom-aside">
        <div class="custom-steps-card">
          <div class="eyebrow custom-aside__heading">Ваш сборочный лист</div>
          <div class="custom-summary-row"><span>Повод</span><strong>{{ selectedOccasion }}</strong></div>
          <div class="custom-summary-row"><span>Размер</span><strong>{{ selectedSize.label }} ({{ selectedSize.stems }})</strong></div>
          <div class="custom-summary-row"><span>Цветы</span><strong>{{ selectedFlowerType.name }} · {{ flowerCount }} шт.</strong></div>
          <div class="custom-summary-row"><span>Упаковка</span><strong>{{ selectedPackaging.name }}</strong></div>
          <div class="custom-summary-row"><span>Сумма</span><strong class="price">{{ estimatedTotal.toLocaleString('ru-RU') }} ₽</strong></div>
          <div class="custom-summary__addons">
            <span v-for="addon in selectedAddonList" :key="addon.id" class="tag tag--clay">{{ addon.name }}</span>
          </div>
          <button class="btn btn--block custom-steps-card__action" @click="addCustomToCart">
            Подобрать и добавить
          </button>
          <div class="custom-delivery-note">
            <AppIcon name="clock" />
            Доступен вариант «Доставка сегодня» до {{ deliveryTime }}.
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical } = useSeo()
const { addLine } = useCart()
const { show } = useToast()
const { submitInquiry } = usePublicInquirySubmitter()

useSeoMeta(() => ({
  title: `Собрать свой букет — ${settings.value.storeName}`,
  description: 'Выберите размер, цветовую гамму и аксессуары — флорист соберет для вас авторский букет и добавит его в корзину.',
}))
setCanonical('/custom')
const {
  today,
  occasions,
  flowerCountOptions,
  sizeOptions,
  flowerTypes,
  paletteOptions,
  styleOptions,
  packagingOptions,
  accessoryOptions,
  deliveryTimes,
  selectedOccasion,
  selectedSize,
  flowerCount,
  selectedFlowerType,
  selectedPalette,
  selectedStyle,
  selectedPackagingId,
  selectedAddons,
  form,
  deliveryDate,
  deliveryTime,
  quickDeliveryTime,
  quickOrderPending,
  errors,
  quoteLoading,
  addingToCart,
  quoteSent,
  apiError,
  selectedPackaging,
  selectedAddonList,
  estimatedTotal,
  toggleAddon,
  addCustomToCart,
  addCustomQuickOrder,
  submitQuote,
} = useCustomPageState({}, {
  addLine,
  showToast: show,
  navigate: navigateTo,
  submitInquiry,
})
</script>

<style scoped>
    .custom-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: stretch;
  padding: 0 60px;
  min-height: 420px;
}
.custom-hero__media {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  height: 430px;
}
.custom-trust { display:flex; gap:10px; flex-wrap:wrap; }

.custom-body {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 40px;
  align-items: start;
  background: var(--paper-2);
  padding: 56px 60px;
}
.custom-form-card {
  background: var(--card);
  border-radius: 4px;
  padding: 36px;
  box-shadow: var(--sh-soft);
}

.custom-label,
.custom-field .field label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
}
.custom-field { margin-bottom: 30px; }

.chips-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.chip-btn { transition: background .15s, color .15s; cursor: pointer; border: none; }
.chip-btn--card { background: var(--card); }
.chip-btn--outlined {
  border: 1px solid var(--line);
  background: var(--card);
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.size-card {
  border: 1.5px solid var(--line);
  border-radius: 4px;
  padding: 14px 16px;
  text-align: left;
  background: var(--card);
  cursor: pointer;
}
.size-card.active,
.size-card:hover { border-color: var(--green); }
.size-card__title { display:block; font-weight: 600; margin-bottom: 6px; }
.size-card__meta {
  display:block; color: var(--muted);
  font-size: 12px;
  margin-bottom: 8px;
}
.size-card__desc { font-size: 12px; color: var(--muted); }

.custom-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.palette-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.palette-dot {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.12);
  transition: box-shadow .15s;
}
.palette-dot--rose { background: #f7b6c9; }
.palette-dot--peach { background: #f5ba82; }
.palette-dot--cream { background: #f3e5ce; }
.palette-dot--green { background: #8ead84; }
.palette-dot--lav { background: #c4b0df; }
.palette-dot--red { background: #a23f4f; }
.palette-dot.active { box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--green); }
.palette-dot__img { position:absolute; inset:0; border-radius:50%; z-index:0; }

.addons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.addon-card {
  border: 1.5px solid var(--line);
  border-radius: 4px;
  padding: 11px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  background: var(--card);
}
.addon-card.active { border-color: var(--green); }
.addon-card__input { width: 18px; height: 18px; }
.addon-card__name { font-size: 14px; }
.addon-card__price { margin-left: auto; font-size: 12px; color: var(--clay); }

.custom-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 14px;
}
.custom-summary__addons {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.custom-summary-row .price { color: var(--clay); font-weight: 600; }
.custom-delivery-note {
  margin-top: 16px;
  font-size: 13px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-actions { display: grid; grid-template-columns: 1fr; gap: 10px; }
.quick-order-block { padding-top: 8px; }
.quick-order__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
}
.quick-order__row {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}
.quick-order__mandatory {
  margin-top: 2px;
  margin-bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}
.custom-hint {
  margin-top: 8px;
  margin-bottom: 2px;
  font-size: 13px;
  color: var(--muted);
}
.custom-hint--error { color: var(--clay); }

.custom-steps-card {
  background: var(--green);
  color: #EFE7D2;
  border-radius: 4px;
  padding: 28px;
  position: sticky;
  top: 100px;
}

.custom-success { text-align:center; padding:24px 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1100px) {
  .custom-hero {
    grid-template-columns: 1fr;
    padding: 40px 32px;
    min-height: auto;
  }
  .custom-hero__media { height: 280px; }
  .custom-body { grid-template-columns: 1fr; padding: 40px 32px; }
  .custom-steps-card { position: static; }
}

@media (max-width: 768px) {
  .custom-hero { padding: 28px 20px; }
  .custom-hero h1 { font-size: 34px !important; }
  .custom-body { padding: 28px 20px; }
  .custom-form-card { padding: 22px; }
  .custom-grid-2,
  .size-grid,
  .addons-grid { grid-template-columns: 1fr; }
}

.custom-hero__breadcrumb {
  margin-bottom: 16px;
}
.custom-hero__eyebrow {
  margin-bottom: 14px;
}
.custom-hero__title {
  font-size: 58px;
  margin-bottom: 18px;
}
.custom-hero__lead {
  max-width: 440px;
}
.custom-hero__trust {
  margin: 24px 0 6px;
}
.custom-hero__image {
  height: 100%;
  border-radius: 4px;
}

.custom-success__icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.custom-success__title {
  font-size: 32px;
  margin-bottom: 12px;
}
.custom-success__description {
  color: var(--muted);
  margin-bottom: 24px;
}

.custom-quick-order__action {
  width: 100%;
}

.custom-aside__heading {
  color: var(--blush);
  margin-bottom: 18px;
}

.custom-steps-card__action {
  margin-top: 16px;
}
</style>
