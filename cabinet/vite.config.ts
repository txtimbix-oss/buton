import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Локального бэка на :3001 нет — в dev проксируем на рабочий прод-API,
// как это делает nuxt-shop. Куку авторизации (user_token) переписываем:
// снимаем Secure и SameSite=None, иначе браузер не сохранит её на http://localhost.
const API_TARGET = process.env.VITE_DEV_API_PROXY || 'https://api.butonshop.ru'

const apiProxy = {
  target: API_TARGET,
  changeOrigin: true,
  secure: true,
  cookieDomainRewrite: '' as const, // host-only → кука ставится на localhost
  configure: (proxy: any) => {
    // Бэк отдаёт 500 на незнакомом Origin (http://localhost:3003), а браузер шлёт его на любой POST.
    // Подменяем Origin/Referer на прод-origin кабинета, который бэк уже знает (CORS-whitelist).
    proxy.on('proxyReq', (proxyReq: any) => {
      // removeHeader обязателен — один setHeader не перетирает уже проброшенный Origin
      proxyReq.removeHeader('origin')
      proxyReq.removeHeader('referer')
      proxyReq.setHeader('origin', 'https://user.butonshop.ru')
      proxyReq.setHeader('referer', 'https://user.butonshop.ru/')
    })
    proxy.on('proxyRes', (proxyRes: any) => {
      const sc = proxyRes.headers['set-cookie']
      if (Array.isArray(sc)) {
        proxyRes.headers['set-cookie'] = sc.map((c: string) =>
          c
            .replace(/;\s*Secure/gi, '')
            .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
        )
      }
    })
  },
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('src', import.meta.url)) },
  },
  server: {
    host: true,
    port: 3003,
    proxy: {
      '/api': apiProxy,
      '/uploads': apiProxy,
    },
  },
})
