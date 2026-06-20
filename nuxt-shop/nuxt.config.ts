export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  devServer: { host: process.env.NODE_ENV === 'production' ? (process.env.NUXT_DEV_HOST || '172.17.0.1') : '127.0.0.1', port: 3004 },
  modules: ['nuxt-yandex-metrika'],
  yandexMetrika: {
    id: '109657742',
    options: {
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      accurateTrackBounce: true,
      trackLinks: true,
    },
  },
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/bloom.css',
    '~/assets/css/layout.css',
    '~/assets/css/ui.css',
    '~/assets/css/catalog.css',
    '~/assets/css/product.css',
    '~/assets/css/cart.css',
    '~/assets/css/mobile.css',
    '~/assets/css/shell.css',
    '~/assets/css/home.css',
    '~/assets/css/app.css',
  ],

  runtimeConfig: {
    // Серверная переменная: URL API для server-side запросов (sitemap и т.д.)
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:3001',
    dadataToken: process.env.NUXT_DADATA_TOKEN || process.env.DADATA_TOKEN || '',
    public: {
      // URL сайта для canonical / sitemap
      siteUrl:    process.env.NUXT_PUBLIC_SITE_URL    || 'https://spbshop.ru',
      // URL лично го кабинета покупателей, NUXT_PUBLIC_CABINET_URL в prod process.env.NUXT_PUBLIC_CABINET_URL ||
      cabinetUrl:  'https://cabinet.spbapp.ru/',
      // WebSocket: прямой URL к API для socket.io (браузер не использует Nitro-прокси для WS)
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || '',
    },
  },

  app: {
    head: {
      title: 'spbshop — цветочная мастерская',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Авторские букеты с доставкой по Санкт-Петербургу за 2 часа' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Golos+Text:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
