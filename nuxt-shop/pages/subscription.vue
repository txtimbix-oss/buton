<template>
  <main class="page">

    <!-- ГЕРОЙ ПОДПИСКИ -->
    <section class="sec">
      <div class="container sub-hero">
        <div>
          <span class="eyebrow">Цветочная подписка</span>
          <h1 class="h-hero">
            Свежие цветы<br>
            <em class="sub-hero__accent">по вашему ритму</em>
          </h1>
          <p class="lead sub-hero__lead">
            Выберите удобную частоту: 1, 2 или 4 букета в месяц. Фото букета перед отправкой, доставка в выбранный день и служба поддержки всегда на связи.
          </p>
          <div class="hero__stats sub-hero__stats">
            <div class="hero__stat"><b>2 900+</b><span>активных подписчиков</span></div>
            <div class="hero__stat"><b>7 лет</b><span>дарим эмоции</span></div>
            <div class="hero__stat"><b>4.9 ★</b><span>средняя оценка</span></div>
          </div>
        </div>
        <div class="sub-hero__media">
          <BloomImg kind="peach" label="подписка — свежесть каждую неделю" />
        </div>
      </div>
    </section>

    <!-- КАК ЭТО РАБОТАЕТ -->
    <section class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">Как это работает</span>
        <h2 class="h-section sub-steps__title">Три шага до подписки</h2>
        <div class="grid-cards cols-3">
          <div v-for="step in steps" :key="step.n">
            <div class="how-num">{{ step.n }}</div>
            <h3 class="sub-step__title">{{ step.title }}</h3>
            <p class="body-md">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ТАРИФЫ -->
    <section class="sec sub-plans">
      <div class="container">
      <span class="eyebrow eyebrow--center">Тарифы</span>
      <h2 class="h-section text-center sub-plans__title">Выберите свой план</h2>
      <div class="plans-grid">
        <div v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ 'plan-card--pop': plan.popular }">
          <div v-if="plan.popular" class="plan-badge">Популярный</div>
          <div class="eyebrow sub-plans__label">{{ plan.title }}</div>
          <div class="sub-plan__price">
            {{ plan.price.toLocaleString('ru-RU') }} ₽
          </div>
            <div class="sub-plan__period">{{ plan.period }}</div>
            <ul class="plan-features">
              <li v-for="f in plan.features" :key="f">
                <span class="sub-plan__tick">✓</span> {{ f }}
              </li>
            </ul>
          <button
            class="btn btn--block sub-plan__btn"
            :class="plan.popular ? 'btn--ink' : 'btn--ghost'"
            @click="selectPlan(plan)"
          >
            Оформить <span class="arr">→</span>
          </button>
        </div>
      </div>
      </div>
    </section>

    <!-- ФОРМА ОФОРМЛЕНИЯ -->
    <section v-if="selectedPlan" class="sec sub-form-section" ref="formRef">
      <div class="container">
      <h2 class="sub-form__title">Оформление подписки</h2>
      <p class="sub-form__lead">План: <b>{{ selectedPlan.title }}</b> · {{ selectedPlan.price.toLocaleString('ru-RU') }} ₽ {{ selectedPlan.period }}</p>

      <form class="sub-form" @submit.prevent="submit">
        <div class="field">
          <label>Имя *</label>
          <input v-model="subForm.name" class="input" type="text" placeholder="Ваше имя" required />
        </div>
        <div class="field">
          <label>Телефон *</label>
          <input v-model="subForm.phone" class="input" type="tel" placeholder="+7 (___) ___-__-__" required />
        </div>
        <div class="field">
          <label>Email *</label>
          <input v-model="subForm.email" class="input" type="email" placeholder="your@email.ru" required />
        </div>
        <div class="field">
          <label>Адрес доставки *</label>
          <div class="addr-suggest">
            <input
              v-model="subForm.address" class="input" type="text"
              :placeholder="`${settings.storeCity}, улица, дом, квартира`"
              autocomplete="off"
              required
              @input="subAddrSuggest.suggest(subForm.address)"
              @blur="subAddrSuggest.clear()"
            />
            <ul v-if="subAddrSuggest.suggestions.value.length" class="addr-suggest__list">
              <li
                v-for="s in subAddrSuggest.suggestions.value"
                :key="s"
                class="addr-suggest__item"
                @mousedown.prevent="subForm.address = s; subAddrSuggest.clear()"
              >{{ s }}</li>
            </ul>
          </div>
        </div>
        <div class="field">
          <label>День доставки</label>
          <select v-model="subForm.day" class="input">
            <option v-for="d in weekDays" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div class="field">
          <label>Время доставки</label>
          <select v-model="subForm.time" class="input">
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time.replace('-', ' – ') }}</option>
          </select>
        </div>
        <div class="field sub-form__full">
          <label>Пожелания по составу <span class="sub-form__optional">(необязательно)</span></label>
          <textarea v-model="subForm.notes" class="input area" placeholder="Люблю пионы и лаванду, без лилий…" />
        </div>
        <div class="sub-form__actions">
          <button type="submit" class="btn btn--ink" :disabled="subSubmitting">
            <template v-if="subSubmitting">Оформляем…</template>
            <template v-else>Оформить подписку <span class="arr">→</span></template>
          </button>
          <button type="button" class="btn btn--ghost" @click="selectedPlan = null">Отмена</button>
          <span v-if="subError" class="sub-form__error">{{ subError }}</span>
        </div>
      </form>
      </div>
    </section>

    <!-- УСПЕХ -->
    <Transition name="overlay-fade">
      <div v-if="subSuccess" class="sub-success-overlay" @click.self="subSuccess = false">
        <div class="sub-success">
          <div class="sub-success__icon">🌷</div>
          <h2 class="sub-success__title">Подписка оформлена!</h2>
          <p class="sub-success__text">
            Свяжемся с вами в течение часа для подтверждения первой доставки.
          </p>
          <NuxtLink to="/" class="btn btn--ink" @click="subSuccess = false">На главную</NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- ОТЗЫВЫ О ПОДПИСКЕ -->
    <section class="sec sec--notop">
      <div class="container">
      <span class="eyebrow">Говорят подписчики</span>
      <h2 class="h-section sub-reviews-title">Их уже 2 400 человек</h2>
      <div class="sub-reviews">
        <div v-for="r in subReviews" :key="r.name" class="sub-review">
          <div class="stars-row sub-review__stars">
            <span v-for="n in 5" :key="n" class="star star--fill">★</span>
          </div>
          <p class="sub-review__text">{{ r.text }}</p>
          <div class="sub-review__name">{{ r.name }}</div>
          <div class="sub-review__since">подписчик {{ r.since }}</div>
        </div>
      </div>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical } = useSeo()
const { submitInquiry: submitSubscription } = usePublicInquirySubmitter({ endpoint: '/api/subscriptions' })
useSeoMeta(() => ({
  title:         `Подписка на цветы — ${settings.value.storeName}`,
  description:   settings.value.metaDescSub,
  ogTitle:       `Подписка на цветы — ${settings.value.storeName}`,
  ogDescription: settings.value.metaDescSub,
}))
setCanonical('/subscription')

const subAddrSuggest = useDadata()
const {
  steps,
  plans,
  weekDays,
  timeOptions,
  reviews: subReviews,
  selectedPlan,
  formRef,
  subForm,
  subSubmitting,
  subSuccess,
  subError,
  selectPlan,
  submit,
} = useSubscriptionPageState({}, {
  submitSubscription,
})
</script>

<style scoped>
.sub-hero { display:grid;gap:28px;align-items:center; }
.sub-hero__accent { font-style: italic; color: var(--clay); }
.sub-hero__lead { max-width: 480px; }
.sub-hero__stats { margin-top: 28px; }
.sub-hero__media { height: clamp(260px, 50vw, 480px); border-radius: var(--r-lg); overflow: hidden; }
.how-num { font-family:var(--serif);font-size:40px;color:var(--clay);line-height:1;margin-bottom:10px; }
.sub-steps__title { margin: 0 0 30px; }
.sub-step__title { font-family: var(--serif); font-size: 24px; margin: 10px 0 8px; }
.sub-plans { padding-top: 0; background: var(--paper-2); }
.sub-plans__title { margin-bottom: 48px; }
.sub-plans__label { margin-bottom: 10px; }
.sub-plan__price { font-family: var(--serif); font-size: 48px; line-height: 1; margin-bottom: 6px; }
.sub-plan__period { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
.sub-plan__tick { color: var(--green); }
.sub-plan__btn { margin-top: 24px; }
.sub-form-section { padding-top: 0; border-top: 1px solid var(--line); }
.sub-form__title { font-size: 38px; margin-bottom: 8px; }
.sub-form__lead { color: var(--muted); margin-bottom: 32px; }
.sub-form__full { grid-column: 1 / -1; }
.sub-form__actions { grid-column: 1 / -1; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.sub-form__optional { color: var(--muted); font-weight: 400; }
.sub-form__error { font-size: 14px; color: var(--clay); }
.sub-success__icon { font-size: 56px; margin-bottom: 16px; }
.sub-success__title { font-size: 34px; margin-bottom: 12px; }
.sub-success__text { color: var(--muted); font-size: 16px; max-width: 400px; margin: 0 auto 28px; }
.plans-grid { display:grid;grid-template-columns:1fr;gap:20px;max-width:960px;margin-inline:auto; }
.eyebrow--center { padding-top: 50px; }
.eyebrow { padding-top: 50px; }
.sub-reviews-title { margin-bottom: 32px; }
.plan-card { background:var(--white);border-radius:var(--r-md);padding:28px;position:relative;border:1.5px solid var(--line); }
.plan-card--pop { border-color:var(--green);box-shadow:var(--sh-md); }
.plan-badge { position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--green);color:var(--blush);padding:4px 14px;border-radius:var(--r-pill);font-size:12px;font-weight:600;white-space:nowrap; }
.plan-features { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;font-size:14px; }
.plan-features li { display:flex;gap:8px;align-items:baseline; }
.sub-form { display:grid;grid-template-columns:1fr;gap:14px; }
.sub-reviews { display:grid;grid-template-columns:1fr;gap:20px; }
.sub-review { background:var(--white);border-radius:var(--r-md);padding:24px;border:1px solid var(--line); }
.stars-row { display:inline-flex;gap:2px; }
.sub-review__stars { margin-bottom: 10px; }
.star { color:var(--line);font-size:16px; }
.star--fill { color:#D4960A; }
.sub-review__text { font-size: 15px; line-height: 1.65; margin-bottom: 12px; }
.sub-review__name { font-size: 13px; font-weight: 600; }
.sub-review__since { font-size: 12px; color: var(--muted); }
.sub-success-overlay { position:fixed;inset:0;z-index:200;background:rgba(20,28,22,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center; }
.sub-success { background:var(--white);border-radius:var(--r-lg);padding:clamp(28px,6vw,48px);text-align:center;max-width:480px;width:90%; }
.overlay-fade-enter-active,.overlay-fade-leave-active { transition:opacity .25s; }
.overlay-fade-enter-from,.overlay-fade-leave-to { opacity:0; }
@media (min-width: 700px) {
  .sub-reviews { grid-template-columns:repeat(3,1fr); }
  .sub-form { grid-template-columns:1fr 1fr; }
  .plans-grid { grid-template-columns:repeat(3,1fr); }
}
@media (min-width: 1101px) {
  .sub-hero { grid-template-columns:1fr 0.85fr;gap:60px; }
}
</style>
