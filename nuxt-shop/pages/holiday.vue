<template>
  <main class="page">
    <!-- Герой -->
    <section class="sec">
      <div class="container holiday-hero">
        <div>
          <div class="breadcrumb holiday-breadcrumb">
            <NuxtLink to="/">Главная</NuxtLink> · <span>Праздники</span>
          </div>
          <div class="eyebrow holiday-eyebrow">Идеи для особых дат</div>
          <h1 class="h-hero holiday-hero__title">
            Идеальный букет<br>для каждого праздника
          </h1>
          <p class="lead holiday-hero__lead">
            Подбираем композиции под эмоцию: тёплые тона для юбилея, нежные оттенки для дня рождения и праздничную флористику для «большого дня».
          </p>
          <div class="holiday-hero__actions">
            <NuxtLink to="/catalog" class="btn btn--ink">Смотреть каталог</NuxtLink>
            <NuxtLink to="/gift-cards" class="btn btn--ghost">Подарочные решения</NuxtLink>
            <NuxtLink to="/subscription" class="btn btn--ghost">Подписка на подарок</NuxtLink>
          </div>
        </div>
        <div class="holiday-hero__visual">
          <BloomImg kind="peach" label="Праздничная флористика" />
        </div>
      </div>
    </section>

    <!-- Подборы -->
    <section class="sec sec--notop">
        <div class="container">
          <span class="eyebrow">Подборки</span>
          <h2 class="h-section holiday-section-title">Праздничные подборки</h2>
        <div class="grid-cards cols-3">
            <article v-for="item in holidayCards" :key="item.title" class="holiday-card">
            <BloomImg :kind="item.kind" class="holiday-card__media" :label="item.kindLabel" />
            <div class="holiday-card__body">
              <h3 class="holiday-card__title">{{ item.title }}</h3>
              <p class="body-sm holiday-card__text">{{ item.text }}</p>
              <NuxtLink class="link-underline" :to="item.link">Подобрать букеты →</NuxtLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Подарки к букету -->
    <section class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">Сервисы рядом</span>
        <h2 class="h-section holiday-section-title">Праздничные идеи комплектов</h2>
        <div class="grid-cards">
          <div v-for="pack in comboPacks" :key="pack.title" class="combo-card">
            <div class="combo-card__title">{{ pack.title }}</div>
            <p class="combo-card__text">{{ pack.text }}</p>
            <NuxtLink to="/gift-cards" class="btn btn--ghost btn--sm">Собрать подарок</NuxtLink>
          </div>
          <div class="combo-card combo-card--accent">
            <div class="combo-card__title combo-card__title--big">Быстрая доставка</div>
            <p class="combo-card__text">
              Выберите любой букет с вкладки каталога и получите фото перед отправкой до передачи курьеру.
            </p>
            <NuxtLink to="/delivery" class="btn btn--ink btn--sm">Подробнее о доставке</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">Частые вопросы</span>
        <h2 class="h-section holiday-section-title">Подготовка и сроки для праздников</h2>
        <div class="faq-list">
          <div v-for="faq in faqItems" :key="faq.q" class="faq-item">
            <button class="faq-q" :class="{ open: openFaq === faq.q }" @click="openFaq = openFaq === faq.q ? '' : faq.q">
              {{ faq.q }}
              <span>{{ openFaq === faq.q ? '−' : '+' }}</span>
            </button>
            <Transition name="faq-ans">
              <div v-if="openFaq === faq.q" class="faq-a">{{ faq.a }}</div>
            </Transition>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical, jsonLd } = useSeo()
const { holidayCards, comboPacks, faqItems } = useHolidayPageContent({
  settings,
}, {
  jsonLd,
})

useSeoMeta(() => ({
  title:       `Праздничные букеты — ${settings.value.storeName}`,
  description: `Подборки букетов к праздникам: День рождения, годовщины, юбилеи, торжества. Фото перед отправкой, быстрая доставка и идеи подарков.`,
  ogTitle:       `Праздничные букеты — ${settings.value.storeName}`,
  ogDescription: `Подборки букетов к праздникам в Санкт-Петербурге: от поздравительных композиций до свадебных и юбилейных.`,
}))
setCanonical('/holiday')
const openFaq = ref('')
</script>

<style scoped>
.holiday-hero {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 46px;
  align-items: center;
}
.holiday-hero__visual {
  border-radius: var(--r-lg);
  overflow: hidden;
  min-height: 380px;
}
.holiday-breadcrumb { margin-bottom: 16px; }
.holiday-eyebrow { margin-bottom: 14px; }
.holiday-hero__title { margin-bottom: 16px; }
.holiday-hero__lead { max-width: 540px; }
.holiday-hero__actions {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.holiday-section-title { margin-bottom: 30px; }

.holiday-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
}
.holiday-card__media { height: 190px; }
.holiday-card__body { padding: 20px; }
.holiday-card__title {
  font-family: var(--serif);
  font-size: 28px;
  margin-bottom: 12px;
}
.holiday-card__text { margin-bottom: 18px; line-height: 1.6; }

.combo-card {
  background: var(--paper-2);
  border-radius: var(--r-md);
  padding: 20px 20px 18px;
}
.combo-card__title {
  font-size: 22px;
  margin-bottom: 6px;
  font-weight: 600;
}
.combo-card__title--big {
  font-family: var(--serif);
  font-size: 30px;
  margin-bottom: 6px;
}
.combo-card__text {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 14px;
  line-height: 1.55;
}
.combo-card--accent {
  border: 1px solid var(--line);
  background: linear-gradient(150deg, var(--paper-2), #fff7eb);
}

@media (max-width: 1100px) {
  .holiday-hero {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 0 12px;
  }
  .holiday-hero__visual { min-height: 300px; }
  .grid-cards { grid-template-columns: 1fr; }
}

@media (max-width: 700px) {
  .holiday-hero h1 { font-size: 38px !important; }
}

.faq-list { max-width: none; }
.faq-item { border-bottom: 1px solid var(--line); }
.faq-q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  background: none;
  border: none;
  font-family: var(--sans);
  font-size: clamp(16px, 2.5vw, 20px);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  color: var(--ink);
  transition: color .15s;
  gap: 20px;
}
.faq-q:hover,
.faq-q.open { color: var(--clay); }
.faq-q span {
  font-size: 22px;
  flex: 0 0 auto;
  color: var(--muted);
}
.faq-a {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.75;
  padding-bottom: 20px;
}
.faq-ans-enter-active, .faq-ans-leave-active { transition: all .2s; }
.faq-ans-enter-from, .faq-ans-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
