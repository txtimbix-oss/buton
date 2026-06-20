<template>
  <main class="page">

    <div class="container">
      <nav class="breadcrumb">
        <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span><span>{{ settings.deliveryPageTitle }}</span>
      </nav>
      <div class="del-hero">
        <span class="eyebrow">Информация</span>
        <h1 class="h-page">{{ settings.deliveryPageTitle }}</h1>
        <p class="del-hero__text">{{ settings.deliveryPageSubtitle }}</p>
      </div>
    </div>

    <!-- СПОСОБЫ ДОСТАВКИ -->
    <section class="sec">
      <div class="container">
        <span class="eyebrow">Как мы доставляем</span>
        <h2 class="h-section del-section-title del-section-title--32">Способы доставки</h2>
        <div class="delivery-cards">
          <div v-for="d in deliveryOptions" :key="d.title" class="del-card">
            <div class="del-card__icon"><AppIcon :name="d.icon" /></div>
            <h3 class="del-card__title">{{ d.title }}</h3>
            <div class="del-card__price">{{ d.price }}</div>
            <p class="del-card__desc">{{ d.desc }}</p>
          </div>
        </div>
        <div class="free-note">
          <AppIcon name="truck" />
          <span>Бесплатная доставка при заказе от <b>{{ settings.deliveryFreeThreshold }} ₽</b></span>
        </div>
      </div>
    </section>

    <!-- ЗОНЫ -->
    <section v-if="deliveryZones.length" class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">Где доставляем</span>
        <h2 class="h-section del-section-title del-section-title--8">Зоны доставки</h2>
        <p class="del-zone-note">{{ settings.storeCity }} и ближайшие пригороды</p>
        <div class="zone-grid">
          <div v-for="zone in deliveryZones" :key="zone.name" class="zone-card">
            <div class="zone-card__header">
              <div class="zone-card__name">{{ zone.name }}</div>
              <div class="zone-card__price">{{ zone.price }}</div>
            </div>
            <div class="zone-card__areas">{{ zone.areas }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- СРОКИ И ОПЛАТА -->
    <section class="sec sec--notop">
      <div class="container">
        <div class="timing-grid">
          <div>
            <span class="eyebrow">Сроки</span>
            <h2 class="h-block del-section-title del-section-title--24">Когда ждать</h2>
            <div v-for="t in deliveryTiming" :key="t.title" class="timing-row">
              <div class="timing-row__title">{{ t.title }}</div>
              <div class="timing-row__text">{{ t.desc }}</div>
            </div>
            <div v-if="settings.deliveryPhotoText" class="info-block">
              <AppIcon name="clock" />
              <p class="info-block__text">{{ settings.deliveryPhotoText }}</p>
            </div>
          </div>
          <div>
            <span class="eyebrow">Оплата</span>
            <h2 class="h-block del-section-title del-section-title--24">Способы оплаты</h2>
            <div v-for="p in paymentMethods" :key="p.title" class="timing-row">
              <div class="timing-row__title">{{ p.title }}</div>
              <div class="timing-row__text">{{ p.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section v-if="faqItems.length" id="faq" class="sec sec--notop">
      <div class="container">
        <span class="eyebrow eyebrow--center">Частые вопросы</span>
        <h2 class="h-section text-center del-section-title del-section-title--40">FAQ</h2>
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
const {
  deliveryOptions,
  deliveryZones,
  deliveryTiming,
  paymentMethods,
  faqItems,
} = useDeliveryPageContent({
  settings,
}, {
  jsonLd,
})

useSeoMeta(() => ({
  title:         `${settings.value.deliveryPageTitle} — ${settings.value.storeName}`,
  description:   settings.value.metaDescDelivery,
  ogTitle:       settings.value.deliveryPageTitle,
  ogDescription: settings.value.metaDescDelivery,
}))

setCanonical('/delivery')

const openFaq = ref('')
</script>

<style scoped>
.del-hero { padding-block: 28px 0; }
.del-hero h1 { margin-bottom: 12px; }
.del-hero p  { margin-top: 0; }
.del-hero__text { color: var(--muted); max-width: 56ch; margin-top: 0; }
.del-section-title--32 { margin-bottom: 32px; }
.del-section-title--8 { margin-bottom: 8px; }
.del-section-title--24 { margin-bottom: 24px; }
.del-section-title--40 { margin-bottom: 40px; }
.delivery-cards { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px; }
.del-card { padding:24px;background:var(--white);border-radius:var(--r-md);border:1px solid var(--line); }
.del-card__icon { width:46px;height:46px;border-radius:50%;background:var(--paper-3);display:flex;align-items:center;justify-content:center;color:var(--green);margin-bottom:14px; }
.del-card__title { font-size: 19px; margin: 14px 0 8px; }
.del-card__price { display:inline-block;font-weight:700;font-size:17px;color:var(--green);margin-top:4px; }
.del-card__desc { font-size: 14px; color: var(--muted); line-height: 1.65; margin-top: 8px; }
.free-note { display:flex;align-items:center;gap:10px;background:var(--paper-2);padding:16px 20px;border-radius:var(--r-md);font-size:15px; }
.zone-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
.zone-card { background:var(--paper-2);border-radius:var(--r-md);padding:20px; }
.del-zone-note { color: var(--muted); margin-bottom: 32px; }
.zone-card__header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.zone-card__name { font-weight: 600; font-size: 16px; }
.zone-card__price { font-size: 15px; font-weight: 600; color: var(--clay); }
.zone-card__areas { font-size: 13px; color: var(--muted); }
.timing-grid { display:grid;gap:40px; }
.timing-row { padding:14px 0;border-bottom:1px solid var(--line); }
.timing-row:last-of-type { border-bottom:none; }
.timing-row__title { font-weight: 600; font-size: 15px; margin-bottom: 3px; }
.timing-row__text { font-size: 14px; color: var(--muted); }
.info-block { display:flex;gap:12px;align-items:flex-start;background:var(--paper-2);padding:16px;border-radius:var(--r-md);margin-top:20px; }
.info-block__text { font-size: 14px; line-height: 1.65; }
.faq-list { max-width: none; }
.faq-item { border-bottom:1px solid var(--line); }
.faq-q { display:flex;justify-content:space-between;align-items:center;width:100%;padding:20px 0;background:none;border:none;font-family:var(--sans);font-size:clamp(16px,2.5vw,20px);font-weight:600;text-align:left;cursor:pointer;color:var(--ink);transition:color .15s;gap:20px; }
.faq-q:hover,.faq-q.open { color:var(--clay); }
.faq-q span { font-size:22px;flex:0 0 auto;color:var(--muted); }
.faq-a { font-size:14px;color:var(--muted);line-height:1.75;padding-bottom:20px; }
.faq-ans-enter-active,.faq-ans-leave-active { transition:all .2s; }
.faq-ans-enter-from,.faq-ans-leave-to { opacity:0;transform:translateY(-6px); }
@media (min-width: 700px) {
  .zone-grid { grid-template-columns:repeat(4,1fr); }
  .timing-grid { grid-template-columns:1fr 1fr;gap:60px; }
}
@media (max-width: 700px) {
  .delivery-cards { grid-template-columns:1fr; }
}
</style>
