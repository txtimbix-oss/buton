<template>
  <main class="page">
    <!-- Герой -->
    <section class="sec">
      <div class="container care-hero">
        <div>
          <div class="breadcrumb care-hero__crumbs">
            <NuxtLink to="/">Главная</NuxtLink> · <span>Уход за цветами</span>
          </div>
          <div class="eyebrow care-hero__eyebrow">Практичные советы</div>
          <h1 class="h-hero care-hero__title">Как сохранить свежесть букета<br>до 7 дней</h1>
          <p class="lead care-hero__lead">
            Несколько простых шагов после получения подарка — и цветы выглядят живо дольше. Проверенные практики для дома и офиса.
          </p>
          <ul class="care-highlights">
            <li><span>•</span> Промывка и аккуратная обрезка стеблей</li>
            <li><span>•</span> Правильная температура воды и чистая ваза</li>
            <li><span>•</span> Избегать сквозняков и прямого солнца</li>
          </ul>
        </div>
        <div class="care-hero__media">
          <BloomImg kind="green" label="Уход за цветами" />
        </div>
      </div>
    </section>

    <section class="sec sec--notop">
      <div class="container">
        <div class="eyebrow">Типы цветов</div>
        <h2 class="h-section care-section-title care-section-title--20">Какой букет держит свежесть дольше</h2>
        <div class="care-flower-grid">
          <article v-for="flower in careFlowerTypes" :key="flower.name" class="care-flower-card">
            <div class="care-flower-card__name">{{ flower.name }}</div>
            <p class="care-flower-card__use">{{ flower.use }}</p>
            <p>{{ flower.care }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Пошаговый уход -->
    <section class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">Пошагово</span>
        <h2 class="h-section care-section-title care-section-title--28">Инструкция на 7 дней</h2>
        <div class="care-grid">
          <article v-for="step in careSteps" :key="step.day" class="care-card">
            <div class="care-card__day">День {{ step.day }}</div>
            <h3 class="care-card__title">{{ step.title }}</h3>
            <p class="care-card__text">{{ step.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Что важно -->
    <section class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">Важно знать</span>
        <h2 class="h-section care-section-title care-section-title--20">Частые вопросы по уходу</h2>
        <div class="faq-list">
          <div v-for="faq in careFaq" :key="faq.q" class="faq-item">
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

    <!-- Коммерческий блок -->
    <section class="sec sec--notop">
      <div class="container care-note">
        <div class="care-note__text">
          <div class="eyebrow">Сервис</div>
          <h2 class="care-note__title">В каждом букете — фото перед отправкой</h2>
          <p class="care-note__desc">
            Перед отправкой флорист согласует букет в чате. Если что-то не подходит вашему формату — меняем до доставки и контролируем свежесть до 7 дней.
          </p>
          <NuxtLink to="/catalog" class="btn btn--ink care-note__btn">Выбрать букет</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical, jsonLd } = useSeo()
const { careSteps, careFlowerTypes, careFaq } = useCareTipsPageContent({
  careTips: computed(() => settings.value.careTips),
  flowerTypes: computed(() => settings.value.flowerTypes),
  faqItems: computed(() => settings.value.faqItems),
}, {
  jsonLd,
})

useSeoMeta(() => ({
  title:       `Как ухаживать за цветами — ${settings.value.storeName}`,
  description: `Подробные советы по продлению свежести букетов: обрезка стеблей, вода, удобрение, режим хранения. Фото перед отправкой и гарантия свежести от spbshop.`,
  ogTitle:       `Уход за цветами и флористическими подарками`,
  ogDescription: `Как дольше сохранить букет и подготовиться к правильной доставке. Короткие инструкции, ошибки и рекомендации на каждый день.`,
}))
setCanonical('/care-tips')
const openFaq = ref('')
</script>

<style scoped>
.care-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 34px;
  align-items: center;
}

.care-hero__crumbs { margin-bottom: 16px; }
.care-hero__eyebrow { margin-bottom: 14px; }
.care-hero__title { margin-bottom: 16px; }
.care-hero__lead { max-width: 520px; }
.care-hero__media { height: 320px; border-radius: var(--r-lg); overflow: hidden; }

.care-highlights {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.care-highlights li {
  display: flex;
  gap: 10px;
  color: var(--muted);
}

.care-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.care-flower-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.care-card {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 22px;
}
.care-flower-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 22px;
}
.care-flower-card__name {
  font-family: var(--serif);
  font-size: 24px;
  line-height: 1.1;
}
.care-flower-card__use {
  color: var(--clay);
  margin: 8px 0 10px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.care-card__day {
  display: inline-block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 10px;
  color: var(--clay);
  font-weight: 700;
}

.care-card__title {
  margin-bottom: 10px;
  font-family: var(--serif);
  font-size: 30px;
}
.care-card__text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
}
.care-section-title--20 { margin-bottom: 20px; }
.care-section-title--28 { margin-bottom: 28px; }

.care-note {
  background: var(--paper);
  border-radius: var(--r-md);
  padding: 56px 56px 52px;
}
.care-note__text {
  max-width: 700px;
}
.care-note__title { font-size: 38px; margin-bottom: 12px; }
.care-note__desc { color: var(--muted); line-height: 1.65; max-width: 560px; }
.care-note__btn { margin-top: 20px; }

@media (max-width: 1000px) {
  .care-hero {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .care-grid,
  .care-flower-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px) {
  .care-grid,
  .care-flower-grid { grid-template-columns: 1fr; }
  .care-note { padding: 32px 22px 36px; }
  .care-hero h1 { font-size: 38px !important; }
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
