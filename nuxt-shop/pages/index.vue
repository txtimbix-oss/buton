<template>
  <main class="page">
    <HomeHero
      :eyebrow="settings.heroEyebrow"
      :title="settings.heroTitle"
      :title-em="settings.heroTitleEm"
      :subtitle="settings.heroSubtitle"
      :actions="heroActions"
      delivery-badge-prefix="Доставка сегодня"
      delivery-badge-value="2 часа"
      :stats="heroStats"
      :product="heroProduct"
      @quick-add="quickAdd"
    />

    <!-- ДОВЕРИЕ -->
    <div class="trust">
      <div class="container">
        <TrustStrip />
      </div>
    </div>

    <!-- ПРАКТИЧЕСКИЕ ШАБЛОНЫ -->
    <section class="sec sec--notop">
      <div class="container">
        <div class="hero-links">
          <NuxtLink to="/holiday" class="btn btn--clay btn--lg">Праздничные букеты</NuxtLink>
          <NuxtLink to="/care-tips" class="btn btn--ink btn--lg">Как ухаживать за цветами</NuxtLink>
          <NuxtLink to="/wedding" class="btn btn--ghost btn--lg">Свадебные букеты</NuxtLink>
        </div>
      </div>
    </section>

    <!-- БУКЕТ НЕДЕЛИ + НОВИНКА -->
    <HomeFeatureSection
      eyebrow="Избранный цветочный выбор"
      title="Букет недели · Новинка"
      link-text="В каталог"
      link-to="/catalog"
      section-class="sec"
      layout="featured"
      :products="featuredProducts"
      :pending="productsPending"
      :skeleton-count="2"
    />

    <HomeSeasonalCollections
      eyebrow="Подбираем сезонно"
      title="Сезонные подборки"
      link-text="Все букеты"
      link-to="/catalog"
      :collections="seasonalCollections"
    />

    <!-- HERO БАННЕРЫ -->
    <template v-for="b in heroBanners" :key="b._id">
      <section class="sec">
        <div class="container">
          <div class="bnr-hero" :class="{ 'bnr-hero--img': !!b.imageUrl }">
            <img v-if="b.imageUrl" :src="b.imageUrl" :alt="b.title" class="bnr-hero__bg" />
            <div class="bnr-hero__inner">
              <span v-if="b.subtitle" class="bnr-hero__eye">{{ b.subtitle }}</span>
              <h2 class="bnr-hero__title">{{ b.title }}</h2>
              <div class="bnr-hero__actions">
                <a v-if="b.buttonLink" :href="b.buttonLink" class="btn btn--light btn--lg">{{ b.buttonText || 'Подробнее' }} →</a>
                <button v-if="b.promoCode" class="bnr-code" @click="copyPromo(b.promoCode)">
                  <span>{{ b.promoCode }}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- СВЕЖИЕ СЕЗОННЫЕ ЦВЕТЫ -->
    <HomeFeatureSection
      eyebrow="Натуральные оттенки сезона"
      title="Свежие сезонные цветы"
      link-text="В каталог"
      link-to="/catalog"
      :products="seasonalFlowers"
      :pending="productsPending"
    />

    <HomeFeatureSection
      eyebrow="Ручная работа флористов"
      title="Авторские композиции"
      link-text="Смотреть все композиции"
      link-to="/catalog"
      :products="artisanCompositions"
      :pending="productsPending"
    />

    <HomeFeatureSection
      eyebrow="Идеальный комплект"
      title="Подарки к букету"
      link-text="Собрать подарок"
      link-to="/catalog"
      :products="giftWithBouquet"
      :pending="productsPending"
    />

    <!-- PROMO БАННЕРЫ -->
    <template v-for="b in promoBanners" :key="b._id">
      <section class="sec sec--notop">
        <div class="container">
          <div class="bnr-promo" :class="{ 'bnr-promo--has-img': !!b.imageUrl }">
            <div v-if="b.imageUrl" class="bnr-promo__media">
              <img :src="b.imageUrl" :alt="b.title" />
            </div>
            <div class="bnr-promo__body">
              <span v-if="b.subtitle" class="eyebrow">{{ b.subtitle }}</span>
              <h2>{{ b.title }}</h2>
              <div class="bnr-promo__actions">
                <a v-if="b.buttonLink" :href="b.buttonLink" class="btn btn--clay btn--lg">{{ b.buttonText || 'Подробнее' }} →</a>
                <button v-if="b.promoCode" class="bnr-code bnr-code--dark" @click="copyPromo(b.promoCode)">
                  <span>{{ b.promoCode }}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- РЕДАКЦИОННЫЕ БЛОКИ (из баннеров с позицией editorial) -->
    <template v-for="banner in editorialBanners" :key="banner._id">
      <section class="sec sec--notop">
        <div class="container">
          <div class="editorial">
            <div class="editorial__media">
              <img v-if="banner.imageUrl" :src="banner.imageUrl" :alt="banner.title" class="editorial__media-image" />
              <BloomImg v-else :kind="banner.bloomKind || 'green'" :label="banner.bloomTag || ''" />
            </div>
            <div class="editorial__body">
              <span v-if="banner.eyebrow" class="eyebrow">{{ banner.eyebrow }}</span>
              <h2>{{ banner.title }}</h2>
              <p v-if="banner.subtitle" class="editorial__sub">{{ banner.subtitle }}</p>
              <div v-for="feat in banner.features" :key="feat.title" class="feat">
                <span class="feat__ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20C4 11 10 5 20 5c0 9-6 15-15 15z"/><path d="M4 20C8 16 13 12 18 9"/></svg>
                </span>
                <div><b>{{ feat.title }}</b><p>{{ feat.text }}</p></div>
              </div>
              <div v-if="banner.buttonLink || banner.promoCode" class="editorial__cta">
                <a v-if="banner.buttonLink" :href="banner.buttonLink" class="btn btn--green">{{ banner.buttonText || 'Подробнее' }} →</a>
                <button v-if="banner.promoCode" class="bnr-code bnr-code--dark" @click="copyPromo(banner.promoCode)">
                  <span>{{ banner.promoCode }}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ОТЗЫВЫ — бегущая строка -->
    <section v-if="marqueeReviews.length" class="sec sec--notop">
      <div class="container">
        <div class="sec__head">
          <div>
            <span class="eyebrow">{{ settings.reviewsRating || '4.9' }} из 5 · {{ settings.reviewsCount || 'более 2 400' }} оценок</span>
            <h2>Что говорят клиенты</h2>
          </div>
        </div>
      </div>
      <div class="marquee">
        <div class="marquee__track">
          <div v-for="rev in marqueeReviews" :key="rev.key" class="rev">
            <div class="rev__stars stars">
              <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3z"/></svg>
            </div>
            <p>«{{ rev.text }}»</p>
            <div class="rev__who">
              <span class="rev__ava"><BloomImg :kind="'rose'" /></span>
              <div><b>{{ rev.name }}</b><br><span class="reviewer-meta">подтверждённый отзыв</span></div>
            </div>
          </div>
          <!-- Дублируем для бесшовного loop -->
          <div v-for="rev in marqueeReviews" :key="'dup-' + rev.key" class="rev" aria-hidden="true">
            <div class="rev__stars stars">
              <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3z"/></svg>
            </div>
            <p>«{{ rev.text }}»</p>
            <div class="rev__who">
              <span class="rev__ava"><BloomImg :kind="'peach'" /></span>
              <div><b>{{ rev.name }}</b><br><span class="reviewer-meta">подтверждённый отзыв</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ПОДПИСКА — CTA-баннер -->
    <section class="sec sec--notop">
      <div class="container">
        <div class="ctabanner">
          <span class="eyebrow">{{ settings.ctaEyebrow }}</span>
          <h2>{{ settings.ctaTitle }}</h2>
          <p>{{ settings.ctaText }}</p>
          <div class="subscription-hero">
            <div>
              <h3 class="bnr-feature-title">
                Подписка на цветы
              </h3>
              <p class="bnr-feature-text">
                Свежие букеты — 1, 2 или 4 варианта в месяц. Фото перед отправкой и возможность паузы без штрафов уже включены.
              </p>
            </div>
            <ul class="subscription-benefits">
              <li v-for="b in subscriptionBenefits" :key="b">
                <span class="bnr-feature-check">✓</span> {{ b }}
              </li>
            </ul>
          </div>
          <div class="bnr-feature-list">
            <NuxtLink to="/subscription" class="btn btn--clay btn--lg">{{ settings.ctaBtn }} →</NuxtLink>
            <NuxtLink to="/catalog" class="btn btn--ghost btn--lg">Посмотреть коллекции</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- INSTAGRAM -->
    <section class="sec sec--notop">
      <div class="container">
        <div class="sec__head">
          <div>
            <span class="eyebrow">Мы в соцсетях</span>
            <h2>@{{ settings.storeName?.toLowerCase() }} — подпишитесь</h2>
          </div>
          <a :href="settings.socialInst || '#'" class="sec__link" target="_blank" rel="noopener">
            Подписаться
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
        <div class="iggrid">
          <a
            v-for="(bloom, i) in igBlooms" :key="i"
            :href="settings.socialInst || '#'"
            class="ig"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
          >
            <BloomImg :kind="bloom" />
          </a>
        </div>
      </div>
    </section>

  </main>

  <!-- POPUP БАННЕР -->
  <ClientOnly>
    <Teleport to="body">
      <Transition name="page-fade">
        <div v-if="popupVisible && popupBanner" class="bnr-popup-overlay" @click.self="closePopup">
          <div
            ref="popupDialog"
            class="bnr-popup"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="popupTitleId"
            tabindex="-1"
            @keydown="handlePopupKeydown"
          >
            <button ref="popupCloseButton" class="bnr-popup__close" aria-label="Закрыть" @click="closePopup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div v-if="popupBanner.imageUrl" class="bnr-popup__media">
              <img :src="popupBanner.imageUrl" :alt="popupBanner.title" />
            </div>
            <div class="bnr-popup__body">
              <span v-if="popupBanner.subtitle" class="eyebrow">{{ popupBanner.subtitle }}</span>
              <h2 :id="popupTitleId">{{ popupBanner.title }}</h2>
              <div class="bnr-popup__actions">
                <a v-if="popupBanner.buttonLink" :href="popupBanner.buttonLink" class="btn btn--ink btn--lg" @click="closePopup">{{ popupBanner.buttonText || 'Подробнее' }} →</a>
                <button v-if="popupBanner.promoCode" class="bnr-code bnr-code--dark" @click="copyPromo(popupBanner.promoCode); closePopup()">
                  <span>{{ popupBanner.promoCode }}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHomePageData } from '~/composables/useHomePageData'
import { useHomePageQueries } from '~/composables/useHomePageQueries'
import { useHomePopup } from '~/composables/useHomePopup'

const settings = useSettings()
const { setCanonical, jsonLd, orgSchema } = useSeo()

useSeoMeta(() => ({
  title:       `${settings.value.storeName} — ${settings.value.storeTagline}`,
  description: settings.value.metaDescHome,
  ogTitle:     `${settings.value.storeName} — ${settings.value.storeTagline}`,
  ogDescription: settings.value.metaDescHome,
  ogType:      'website',
  twitterCard: 'summary_large_image',
}))

setCanonical('/')
jsonLd(orgSchema())

const { copyPromo, quickAdd } = useHomePageActions()

const { products, productsPending, apiReviews, bannersData } = useHomePageQueries()

const {
  heroProduct,
  heroStats,
  heroActions,
  featuredProducts,
  seasonalCollections,
  seasonalFlowers,
  artisanCompositions,
  giftWithBouquet,
  heroBanners,
  promoBanners,
  editorialBanners,
  popupBanner,
  marqueeReviews,
  subscriptionBenefits,
  igBlooms,
} = useHomePageData({
  settings,
  products,
  apiReviews,
  bannersData,
})

const {
  popupVisible,
  popupDialog,
  popupCloseButton,
  popupTitleId,
  closePopup,
  handlePopupKeydown,
} = useHomePopup({
  popupBanner,
})

</script>
