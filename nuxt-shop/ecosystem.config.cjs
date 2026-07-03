module.exports = {
  apps: [
    {
      name: 'nuxt-shop',
      script: './.output/server/index.mjs',
      // Переопределяем переменные при запуске
      env_production: {
        NODE_ENV: 'production',
        HOST: '172.17.0.1',
        NITRO_HOST: '172.17.0.1',
        PORT: '3004',
        NUXT_API_BASE: 'https://api.butonshop.ru',
        NUXT_PUBLIC_SITE_URL: 'https://butonshop.ru',
        NUXT_PUBLIC_CABINET_URL: 'https://user.butonshop.ru',
        // API для браузера (прямые запросы с куками)
        NUXT_PUBLIC_API_BASE: 'https://api.butonshop.ru',
        // WebSocket для чата (socket.io) — браузер подключается к api.butonshop.ru
        NUXT_PUBLIC_WS_BASE: 'https://api.butonshop.ru'
      }
    }
  ]
};
