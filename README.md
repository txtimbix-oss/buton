# Бутон — цветочный магазин (production)

Монорепозиторий из двух фронтенд-приложений + инструкция по деплою.

## Состав

| Папка | Что это | Стек |
|-------|---------|------|
| `nuxt-shop/` | Витрина магазина (каталог, карточка, корзина, оформление, трекинг, чат) | Nuxt 3 + TypeScript |
| `cabinet/` | Личный кабинет (профиль, заказы, избранное, бонусы, адреса) | Vue 3 + Vite + TypeScript |
| `Ruben.txt` | Инструкция: как направить cabinet и nuxt-shop на PROD API | — |

Backend (PROD API) — внешний: `https://api.spbapp.ru`. Домены фронта:
`front.spbapp.ru` (магазин) и `cabinet.spbapp.ru` (кабинет).

## Запуск локально

Нужны Node.js и npm. Зависимости в git не хранятся — ставятся отдельно.

```bash
# магазин
cd nuxt-shop
npm install
npm run dev

# кабинет (в отдельном терминале)
cd cabinet
npm install
npm run dev
```

## Сборка / прод

См. подробности в `Ruben.txt`. Кратко:

```bash
cd nuxt-shop && npm install && npm run build   # Nuxt → .output
cd cabinet   && npm install && npm run build   # Vite → dist
```

Адреса API задаются через env-переменные (`NUXT_API_BASE`, `VITE_API_BASE` и
др.) — см. `.env`, `.env.production`, `.env.example` в каждом подпроекте и
раздел в `Ruben.txt`.

## Что не в git

`node_modules/`, сборка (`.nuxt/`, `.output/`, `dist/`), логи — см. `.gitignore`.
После клонирования выполните `npm install` в каждом подпроекте.
