<template>
  <main class="page">
    <section class="sec wed-hero">
      <BloomImg kind="cream" class="wed-hero__bg" />
      <div class="wed-hero__overlay" />
      <div class="container wed-hero__content">
        <div class="breadcrumb">
          <NuxtLink to="/">Главная</NuxtLink>
          <span class="sep">·</span>
          <span>Свадьбы</span>
        </div>
        <div class="eyebrow wed-hero__eyebrow">{{ pageContent.heroEyebrow }}</div>
        <h1 class="h-page wed-hero__title">
          {{ pageContent.heroTitleLines[0] }}<br>{{ pageContent.heroTitleLines[1] }}
        </h1>
        <p class="lead wed-hero__lead">
          От букета невесты до оформления зала. Разработаем флористическую концепцию вашей свадьбы и реализуем её до последнего лепестка.
        </p>
        <div class="wed-hero__cta">
          <button class="btn btn--ink" @click="scrollToForm">
            Записаться на консультацию
          </button>
        </div>
      </div>
    </section>

    <section class="sec sec--bg2 wed-portfolio">
      <div class="container">
        <div class="sec__head">
          <div>
            <div class="eyebrow">Портфолио</div>
            <h2 class="h-section">Наши работы</h2>
          </div>
          <NuxtLink to="/catalog" class="sec__link">Смотреть все <span>→</span></NuxtLink>
        </div>
        <div class="wed-gallery">
          <div
            v-for="(item, i) in gallery"
            :key="i"
            class="wed-gallery__item"
          >
            <BloomImg :kind="item.kind" class="wed-gallery__bloom" :class="`wed-gallery__bloom--h-${item.h}`" />
          </div>
        </div>
      </div>
    </section>

    <section class="sec wed-packages">
      <div class="container">
        <div class="sec__head">
          <div>
            <div class="eyebrow">Пакеты оформления</div>
            <h2 class="h-section">Выберите формат</h2>
          </div>
        </div>
        <div class="grid-cards cols-3 wed-pack-grid">
          <article
            v-for="pkg in packages"
            :key="pkg.title"
            class="wed-pack"
            :class="{ popular: pkg.popular }"
          >
            <div class="eyebrow">{{ pkg.title }}</div>
            <div class="wed-pack__price">{{ pkg.price }} ₽</div>
            <p class="wed-pack__desc">{{ pkg.desc }}</p>
            <button
              class="btn btn--block"
              :class="pkg.popular ? 'btn--clay' : 'btn--ghost'"
              @click="scrollToForm"
            >
              {{ pkg.popular ? 'Самый востребованный' : 'Обсудить формат' }}
            </button>
          </article>
        </div>
      </div>
    </section>

    <section id="wed-form" class="sec sec--bg2">
      <div class="container">
        <div class="wed-consult">
          <div>
            <div class="eyebrow wed-consult__eyebrow">Консультация</div>
            <h2 class="h-section wed-consult__title">Расскажите о вашем дне</h2>
            <p class="lead wed-consult__lead">
              Оставьте детали — флорист-декоратор свяжется, чтобы обсудить концепцию и смету. Это бесплатно и ни к чему не обязывает.
            </p>
          </div>
          <div class="wed-form-card">
            <Transition name="fade" mode="out-in">
              <div v-if="sent" class="wed-form__success">
                <div class="wed-form__success-emoji">💐</div>
                <h2 class="h-block wed-form__success-title">Заявка принята!</h2>
                <p class="wed-form__success-text">Свяжемся с вами в течение рабочего дня для обсуждения вашей свадьбы.</p>
              </div>
              <div v-else>
                <div class="wed-form-grid">
                  <div class="field"><label>Имя *</label><input v-model="form.name" class="input" type="text" placeholder="Анна" :class="{'is-active':errors.name}" /></div>
                  <div class="field"><label>Телефон *</label><input v-model="form.phone" class="input" type="tel" placeholder="+7 921 ···" :class="{'is-active':errors.phone}" /></div>
                  <div class="field"><label>Дата события</label><input v-model="form.date" class="input" type="date" /></div>
                  <div class="field"><label>Формат</label><input v-model="form.format" class="input" type="text" placeholder="Выездная церемония" /></div>
                  <div class="field wed-form-grid__field--full"><label>Примерный бюджет</label><input v-model="form.budget" class="input" type="text" placeholder="90 000 — 150 000 ₽" /></div>
                </div>
                <p v-if="apiError" class="wed-form__error">{{ apiError }}</p>
                <button class="btn btn--ink btn--block wed-form__submit" :disabled="loading" @click="submit">
                  {{ loading ? pageContent.submitPendingLabel : 'Записаться на консультацию' }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { weddingPageContent } from '~/lib/wedding/content'

const settings = useSettings()
const { setCanonical } = useSeo()
const { submitInquiry } = usePublicInquirySubmitter()

useSeoMeta(() => ({
  title:       `Свадебная флористика — ${settings.value.storeName}`,
  description: `Свадебные букеты и оформление в СПб. Букет невесты, арки, залы — от 35 000 ₽. Бесплатная консультация.`,
}))
setCanonical('/wedding')

const weddingPageState = useWeddingPageState({}, {
  submitInquiry,
  scrollToId: (id: string) => {
    if (typeof document === 'undefined') return
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  },
})

const pageContent = computed(() => weddingPageState.pageContent ?? weddingPageContent)
const {
  gallery,
  packages,
  form,
  errors,
  loading,
  sent,
  apiError,
  scrollToForm,
  submit,
} = weddingPageState
</script>

<style scoped>
.wed-hero {
  position: relative;
  overflow: hidden;
  min-height: 460px;
  display: flex;
  align-items: flex-end;
  padding: 0;
}
.wed-hero__bg {
  position: absolute;
  inset: 0;
}
.wed-hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(100deg, rgba(244,238,226,.92) 0%, rgba(244,238,226,.6) 46%, rgba(244,238,226,.1) 100%);
}
.wed-hero__content {
  position: relative;
  z-index: 2;
  padding: clamp(28px, 6vw, 60px);
}

.wed-portfolio { min-height: 620px; }
.wed-gallery { column-count: 3; column-gap: 24px; }
.wed-gallery__item { break-inside: avoid; margin-bottom: 24px; }
.wed-gallery__bloom { border-radius: 4px; }
.wed-gallery__bloom--h-240 { height: 240px; }
.wed-gallery__bloom--h-250 { height: 250px; }
.wed-gallery__bloom--h-260 { height: 260px; }
.wed-gallery__bloom--h-290 { height: 290px; }
.wed-gallery__bloom--h-300 { height: 300px; }
.wed-gallery__bloom--h-320 { height: 320px; }

.wed-pack-grid { align-items: stretch; }
.wed-pack { background: var(--paper-3); border-radius: var(--r-md); padding: 28px; display: flex; flex-direction: column; }
.wed-pack.popular { background: var(--green); color: #EFE7D2; }
.wed-pack.popular .eyebrow { color: #f7e8dd; }
.wed-pack.popular p { color: #efe7d2; }
.wed-pack__price { font-family: var(--serif); font-size: 42px; margin: 14px 0 6px; line-height: 1; color: var(--ink); }
.wed-pack.popular .wed-pack__price { color: #efe7d2; }

.wed-consult { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.wed-form-card { background: var(--paper-3); border-radius: var(--r-md); padding: 32px; box-shadow: var(--sh-sm); }
.wed-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.wed-hero__eyebrow {
  margin-bottom: 14px;
}
.wed-hero__title {
  margin-bottom: 18px;
  font-weight: 600;
  max-width: 680px;
}
.wed-hero__lead {
  max-width: 460px;
}
.wed-hero__cta {
  margin-top: 30px;
}

.wed-pack__desc {
  line-height: 1.6;
  opacity: .85;
  margin-bottom: 24px;
}

.wed-consult__eyebrow {
  margin-bottom: 12px;
}
.wed-consult__title {
  margin-bottom: 16px;
}
.wed-consult__lead {
  max-width: 420px;
}

.wed-form__success {
  text-align: center;
  padding: 20px 0;
}
.wed-form__success-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}
.wed-form__success-title {
  margin-bottom: 12px;
}
.wed-form__success-text {
  color: var(--muted);
}
.wed-form-grid__field--full {
  grid-column: 1 / -1;
}
.wed-form__error {
  font-size: 13px;
  color: var(--clay);
  margin-bottom: 10px;
}
.wed-form__submit {
  margin-top: 22px;
}

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1100px) {
  .wed-gallery { column-count: 2; }
  .wed-consult { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .wed-gallery { column-count: 2; column-gap: 12px; }
  .wed-pack-grid { grid-template-columns: 1fr; }
  .wed-form-grid { grid-template-columns: 1fr; }
}
</style>
