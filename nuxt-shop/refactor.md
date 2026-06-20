# Nuxt Shop Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** довести `nuxt-shop` до состояния, где страницы и крупные компоненты являются тонкими shell-слоями, а бизнес-логика, API-запросы, SEO, виджеты и повторяемые UI-сценарии живут в маленьких проверяемых файлах.

**Architecture:** сохраняем текущую Nuxt 3 архитектуру: `pages/**` собирают страницу, `composables/**` оркестрируют реактивное состояние, `lib/**` содержит чистые функции и типы, `components/**` содержит UI. Новый код должен продолжать использовать уже вынесенные границы: `useSettings`, `useStorefrontProductsQuery`, `useCartPageState`, `useProductPageState`, `lib/cart/*`, `lib/checkout/*`, `lib/product/*`, `lib/catalog/*`, `lib/chat/*`.

**Tech Stack:** Nuxt 3, Vue Composition API, TypeScript, Vitest, Nitro server routes, `socket.io-client`, Yandex Maps JS API, CSS modules-by-file through global imports in `nuxt.config.ts`.

---

## Жесткие Правила

- Работать только внутри `nuxt-shop/**`, кроме случая, когда тест/тип прямо докажет необходимость правки общего корня. `admin/**` и `cabinet/**` не трогать.
- Не менять поведение магазина в одном коммите с декомпозицией. Сначала characterization-тест или существующий зеленый тест, потом перенос кода, потом тот же тест.
- Не тащить данные напрямую с продового API в компоненты. Данные магазина идут через существующие `/api/**` маршруты и query-composables. Настройка продового API описана отдельно в корневом `Ruben.txt`.
- Тексты, настройки витрины, ссылки и SEO-шаблоны брать через `useSettings()` или через доменные content/selectors-файлы. Не добавлять новые строковые настройки прямо в страницы.
- `pages/**` после рефактора должны содержать маршрут, SEO/canonical, подключение query/state composables и сборку компонентов. Целевая длина для новых/переписанных страниц: до 180-220 строк.
- `components/**` не должны делать `$fetch`, напрямую мутировать глобальное состояние или содержать транспортные детали. Для этого есть composables/lib.
- После каждого самостоятельного среза запускать узкие тесты, затем общий `vitest run`. Перед финалом запускать `nuxt build`.

## Текущая Карта Рисков

Крупные файлы, которые сейчас мешают безопасному сопровождению:

| Файл | Примерный размер | Главная проблема |
| --- | ---: | --- |
| `pages/product/[slug].vue` | 1017 строк | Огромная PDP-страница: галерея, покупка, быстрый заказ, рекомендации, отзывы, SEO и lightbox в одном файле. |
| `pages/cart.vue` | 880 строк | Корзина смешивает список товаров, доставку, промокоды, бонусы, итог, датепикер и scoped CSS. |
| `pages/custom.vue` | 566 строк | Конструктор букета остается большой страницей, часть submit/API wiring находится в странице. |
| `components/ChatWidget.vue` | 499 строк | UI, offline form, attachments, voice recording, scroll, rating и submit собраны в одном компоненте. |
| `useCartCheckoutFlow.ts` | 453 строки | Критичная checkout-логика; менять только малыми срезами с тестами. |
| `pages/catalog/index.vue` | 433 строки | Каталог уже имеет state composable, но template/SEO/schema все еще перегружены. |
| `pages/catalog/[collectionSlug].vue` | 439 строк | Страница коллекции смешивает shell, SEO и hero/product sections. |
| `useCatalogPageState.ts` | 401 строк | Пока допустимо, но дальнейшие правки лучше выносить в `lib/catalog/*`. |
| `assets/css/home.css` | 867 строк | Стили главной слишком широкие; проверить, нет ли чужих page/component стилей. |
| `assets/css/app.css` | 758 строк | Shared CSS содержит остаточные page-specific правила. |
| `assets/css/main.css` | 835 строк | Файл есть, но не подключен в `nuxt.config.ts`; вероятно старый дубль дизайн-системы. Нужен аудит перед удалением. |

## Целевая Структура

Новые/уточненные границы:

- `components/product/*` — UI-секции PDP без `$fetch` и без глобальных mutations.
- `components/cart/*` — UI-секции корзины: строки, доставка, summary, success, mobile bar.
- `components/chat/*` — маленькие части чата: launcher, window, messages, composer, offline form, rating.
- `components/common/*` — повторяемые мелкие блоки, если один и тот же UI реально нужен минимум в двух доменах.
- `composables/usePublicInquirySubmitter.ts` — единый клиентский submitter для публичных заявок в `/api/inquiries`.
- `composables/useHeaderUiState.ts` — меню, поиск, sticky-header, cart bump.
- `composables/useProductCardState.ts` — избранное, quick view, add-to-cart для карточки товара.
- `composables/useChatComposer.ts` — текст, файлы, voice recording, pending uploads.
- `composables/useChatOfflineForm.ts` — offline-заявка и bot guard.
- `composables/useYandexMapPicker.ts` — состояние карты и выбор адреса.
- `lib/maps/yandexLoader.ts` — загрузка Yandex Maps script и typed wrapper над `window.ymaps`.
- `assets/css/product.css`, `assets/css/cart.css`, `assets/css/forms.css` — вынести page-specific стили из `app.css` и scoped mega-pages, если компонентный scoped CSS становится повторяемым.

## Task 0: Baseline Перед Любым Рефактором

**Files:**
- Read: `nuxt-shop/agent.md`
- Read: `nuxt-shop/package.json`
- Read: `nuxt-shop/nuxt.config.ts`
- No code changes.

- [ ] **Step 1: Проверить рабочее дерево**

Run:

```bash
git status --short
```

Expected: либо пусто, либо есть чужие изменения. Чужие изменения не откатывать; если они внутри `nuxt-shop/**`, учитывать их как текущую правду.

- [ ] **Step 2: Зафиксировать текущую тестовую базу**

Run from `nuxt-shop`:

```bash
./node_modules/.bin/vitest run
```

Expected: все unit/server tests проходят. Если падает тест, записать имя теста и причину в рабочие заметки, чинить только если падение блокирует текущий срез.

- [ ] **Step 3: Проверить production build до рефактора**

Run from `nuxt-shop`:

```bash
./node_modules/.bin/nuxt build
```

Expected: build завершается без TypeScript/Nuxt ошибок. Если build красный до изменений, не смешивать исправление build с первым refactor-срезом.

## Task 1: Разобрать Product Page На PDP-Секции

**Files:**
- Modify: `pages/product/[slug].vue`
- Create: `components/product/ProductPageSkeleton.vue`
- Create: `components/product/ProductBreadcrumbs.vue`
- Create: `components/product/ProductGallery.vue`
- Create: `components/product/ProductPurchasePanel.vue`
- Create: `components/product/ProductDetailsGrid.vue`
- Create: `components/product/ProductReviewsSection.vue`
- Create: `components/product/ProductRecommendationsSection.vue`
- Create: `components/product/ProductSeoSection.vue`
- Create: `components/product/ProductLightbox.vue`
- Modify only if repeated styles are needed: `assets/css/product.css`
- Modify if a new global CSS file is created: `nuxt.config.ts`
- Existing tests to run: `tests/unit/useProductPageState.spec.ts`, `tests/unit/useProductGalleryState.spec.ts`, `tests/unit/useProductConfigurator.spec.ts`, `tests/unit/useProductPurchaseActions.spec.ts`, `tests/unit/useProductPageContent.spec.ts`, `tests/unit/product.seo.spec.ts`, `tests/unit/product.presentation.spec.ts`

- [ ] **Step 1: Убедиться, что вся логика страницы уже приходит из composables**

Run:

```bash
rg -n "const |function |computed\\(|watch\\(|\\$fetch|useSeoMeta|jsonLd" pages/product/[slug].vue composables/useProductPageState.ts composables/useProductPageContent.ts lib/product
```

Expected: `$fetch` находится в query boundary (`useProductPageQueries`) или server proxy, а не в новых product-компонентах.

- [ ] **Step 2: Вынести skeleton**

Move the existing `v-if="pending"` skeleton block from `pages/product/[slug].vue` into `components/product/ProductPageSkeleton.vue`.

Component contract:

```vue
<template>
  <div class="container product-skeleton product-skeleton--pending">
    <div class="skeleton product-skeleton__hero" />
    <div>
      <div class="skeleton product-skeleton__line product-skeleton__line--title" />
      <div class="skeleton product-skeleton__line product-skeleton__line--lead" />
      <div class="skeleton product-skeleton__line product-skeleton__line--small" />
      <div class="skeleton product-skeleton__line product-skeleton__line--tiny" />
    </div>
  </div>
</template>
```

Page replacement:

```vue
<ProductPageSkeleton v-if="pending" />
```

- [ ] **Step 3: Вынести breadcrumbs**

Create `components/product/ProductBreadcrumbs.vue` with props:

```ts
const props = defineProps<{
  productName: string
}>()
```

Template keeps only the current `Главная · Каталог · product.name` navigation. No route or store access inside component.

- [ ] **Step 4: Вынести gallery**

Create `components/product/ProductGallery.vue` with props/events:

```ts
import type { Product } from '~/lib/storefront/types'

defineProps<{
  product: Product
  thumbs: string[]
  activeThumb: number
  imgError: boolean
  discountPct: number
  isThumbBroken: (index: number) => boolean
}>()

defineEmits<{
  selectImageThumb: [index: number]
  selectFallbackThumb: [index: number]
  markThumbError: [index: number]
  mainImageError: []
  openLightbox: [index: number]
}>()
```

Move only the current gallery template block. Keep `ShopImg`, `BloomImg`, product tag and zoom hint behavior identical.

- [ ] **Step 5: Вынести purchase panel**

Create `components/product/ProductPurchasePanel.vue` with the current right-column content: rating row, trust strip, title, description, targets, size select, addon groups, bundle cards, qty row, favorite button, quick order, delivery note and quick specs.

Required event names:

```ts
defineEmits<{
  toggleAddon: [index: number]
  addBundleToCart: [bundle: BundleOption]
  addToCart: []
  placeQuickOrder: []
  toggleWishlist: []
  updateActiveSize: [index: number]
  updateQty: [qty: number]
  updateQuickDeliveryTime: [value: string]
}>()
```

Keep all computed values in `useProductPageState` or page-level destructuring for this pass. The component receives values and emits user intent.

- [ ] **Step 6: Вынести нижние PDP-секции**

Move these template regions into separate components:

- `ProductDetailsGrid.vue`: composition, care, delivery/payment facts.
- `ProductReviewsSection.vue`: reviews list and review form props/events.
- `ProductRecommendationsSection.vue`: related products grid.
- `ProductSeoSection.vue`: sanitized SEO HTML via `v-html`.
- `ProductLightbox.vue`: current lightbox markup and navigation events.

Do not move SEO meta setup from the page. `useSeoMeta`, `setCanonical`, `jsonLd` stay in `pages/product/[slug].vue`.

- [ ] **Step 7: Сжать page shell**

After extraction `pages/product/[slug].vue` should look structurally like:

```vue
<template>
  <main class="page">
    <ProductPageSkeleton v-if="pending" />
    <template v-else-if="product">
      <ProductBreadcrumbs :product-name="product.name" />
      <section class="container product-grid">
        <ProductGallery ... />
        <ProductPurchasePanel ... />
      </section>
      <ProductDetailsGrid ... />
      <ProductReviewsSection ... />
      <ProductRecommendationsSection ... />
      <ProductSeoSection ... />
      <ProductLightbox ... />
    </template>
    <ProductNotFound v-else />
  </main>
</template>
```

If `ProductNotFound` does not already exist, create `components/product/ProductNotFound.vue` from the current not-found block.

- [ ] **Step 8: Run product tests**

Run from `nuxt-shop`:

```bash
./node_modules/.bin/vitest run tests/unit/useProductPageState.spec.ts tests/unit/useProductGalleryState.spec.ts tests/unit/useProductConfigurator.spec.ts tests/unit/useProductPurchaseActions.spec.ts tests/unit/useProductPageContent.spec.ts tests/unit/product.seo.spec.ts tests/unit/product.presentation.spec.ts
```

Expected: all selected tests pass.

- [ ] **Step 9: Commit**

```bash
git add pages/product/[slug].vue components/product nuxt.config.ts assets/css/product.css
git commit -m "refactor(nuxt-shop): split product page sections"
```

If `assets/css/product.css` was not created, omit it from `git add`.

## Task 2: Разобрать Cart Page На Checkout-Секции

**Files:**
- Modify: `pages/cart.vue`
- Modify: `composables/useCart.ts`
- Modify: `composables/useCartPageState.ts`
- Create: `components/cart/CartDeliveryProgress.vue`
- Create: `components/cart/CartEmptyState.vue`
- Create: `components/cart/CartOrderSuccess.vue`
- Create: `components/cart/CartLineList.vue`
- Create: `components/cart/CartDeliveryMethodPicker.vue`
- Create: `components/cart/CartDeliveryForm.vue`
- Create: `components/cart/CartDatePicker.vue`
- Create: `components/cart/CartSummary.vue`
- Create: `components/cart/CartMobileCheckoutBar.vue`
- Modify or create: `assets/css/cart.css`
- Tests: `tests/unit/useCart.spec.ts`, `tests/unit/useCartPageState.spec.ts`, `tests/unit/useCartDeliveryForm.spec.ts`, `tests/unit/useCartQuote.spec.ts`, `tests/unit/useCartCheckoutFlow.spec.ts`, `tests/unit/cart.page.spec.ts`

- [ ] **Step 1: Добавить clearCart в cart boundary**

Current `pages/cart.vue` passes an inline dependency:

```ts
clearCart: () => {
  items.value.splice(0)
}
```

Move this into `useCart.ts`:

```ts
function clearCart() {
  items.value.splice(0)
}
```

Return `clearCart` from `useCart()`. Add a test in `tests/unit/useCart.spec.ts` that creates two lines, calls `clearCart()`, and expects `items.value` and `cartCount.value` to be zero.

- [ ] **Step 2: Move free delivery progress width into state**

Move page-only computed:

```ts
const freeDeliveryProgressWidth = computed(() => `${Math.min(Math.max(freeDeliveryPct.value, 0), 100)}%`)
```

into `useCartPageState.ts` return value. Add a test in `tests/unit/useCartPageState.spec.ts` with `freeDeliveryPct` below `0`, inside range, and above `100`; expected widths: `0%`, actual percent, `100%`.

- [ ] **Step 3: Вынести progress, empty, success**

Create:

- `CartDeliveryProgress.vue` with props `freeDeliveryLeft: number`, `progressWidth: string`.
- `CartEmptyState.vue` with the current empty basket markup.
- `CartOrderSuccess.vue` with prop `orderResult` and the current success markup.

These components must not import `useCart`, `useSettings`, `useRouter`, or call APIs.

- [ ] **Step 4: Вынести список строк корзины**

Create `CartLineList.vue`.

Contract:

```ts
import type { CartLine } from '~/lib/cart/types'

defineProps<{
  items: CartLine[]
  imgErrors: Record<string, boolean>
  cartItemImage: (item: CartLine) => string | undefined
  volumeDiscountItems: number[]
  getVolumeDiscountPct: (index: number) => number
}>()

defineEmits<{
  removeLine: [lineId: string]
  setLineQty: [lineId: string, qty: number]
  imageError: [lineId: string]
}>()
```

The page handles `imageError` with `imgErrors[lineId] = true`.

- [ ] **Step 5: Вынести delivery method picker и form**

Create:

- `CartDeliveryMethodPicker.vue`: delivery cards, selected index and `update:activeDelivery`.
- `CartDatePicker.vue`: current datepicker markup and events.
- `CartDeliveryForm.vue`: recipient fields, address suggestions, `YandexMapPicker`, date/time/card/anonymous controls.

Keep `addrSuggest` in `pages/cart.vue` for the first pass, pass `suggestions`, `suggest`, `clear` down as props/functions. After the page split is green, consider a second pass that wraps Dadata in `useCartAddressSuggest`.

- [ ] **Step 6: Вынести summary и mobile bar**

Create:

- `CartSummary.vue`: all summary rows, promo fields, trigger hint, bonus toggle, submit button and note rows.
- `CartMobileCheckoutBar.vue`: current mobile checkout strip.

`CartSummary.vue` emits:

```ts
defineEmits<{
  applyPromo: []
  applyPromo2: []
  clearPromo: []
  clearPromo2: []
  acceptCartTriggerPromo: []
  toggleBonus: []
  submitOrder: []
  updatePromo: [value: string]
  updatePromo2: [value: string]
}>()
```

- [ ] **Step 7: Move cart styles out of page scoped block**

For CSS that belongs to extracted components, prefer component `<style scoped>`. For shared checkout classes used by multiple cart components, create `assets/css/cart.css` and add it in `nuxt.config.ts` after `catalog.css` and before `mobile.css`:

```ts
css: [
  '~/assets/css/tokens.css',
  '~/assets/css/bloom.css',
  '~/assets/css/layout.css',
  '~/assets/css/ui.css',
  '~/assets/css/catalog.css',
  '~/assets/css/cart.css',
  '~/assets/css/mobile.css',
  '~/assets/css/shell.css',
  '~/assets/css/home.css',
  '~/assets/css/app.css',
],
```

- [ ] **Step 8: Run cart tests**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/useCart.spec.ts tests/unit/useCartPageState.spec.ts tests/unit/useCartDeliveryForm.spec.ts tests/unit/useCartQuote.spec.ts tests/unit/useCartCheckoutFlow.spec.ts tests/unit/cart.page.spec.ts
```

Expected: all selected tests pass.

- [ ] **Step 9: Commit**

```bash
git add pages/cart.vue components/cart composables/useCart.ts composables/useCartPageState.ts tests/unit/useCart.spec.ts tests/unit/useCartPageState.spec.ts assets/css/cart.css nuxt.config.ts
git commit -m "refactor(nuxt-shop): split cart checkout page"
```

## Task 3: Единый Submitter Для Публичных Заявок

**Files:**
- Create: `composables/usePublicInquirySubmitter.ts`
- Create: `tests/unit/usePublicInquirySubmitter.spec.ts`
- Modify: `pages/custom.vue`
- Modify: `pages/wedding.vue`
- Modify: `pages/corporate.vue`
- Modify: `pages/gift-cards.vue`
- Modify: `pages/subscription.vue`
- Existing page-state tests: `tests/unit/useCustomPageState.spec.ts`, `tests/unit/useWeddingPageState.spec.ts`, `tests/unit/useCorporatePageState.spec.ts`, `tests/unit/useGiftCardsPageState.spec.ts`, `tests/unit/useSubscriptionPageState.spec.ts`

- [ ] **Step 1: Создать composable**

Create `usePublicInquirySubmitter.ts` with this public API:

```ts
type PublicBotGuardBody = ReturnType<ReturnType<typeof usePublicBotGuard>['payload']>

export interface PublicInquirySubmitterDeps<TPayload extends Record<string, unknown>> {
  endpoint?: string
  botGuard?: ReturnType<typeof usePublicBotGuard>
  fetcher?: (
    url: string,
    options: {
      method: 'POST'
      headers: Record<string, string>
      body: TPayload & { _botGuard: PublicBotGuardBody }
    },
  ) => Promise<unknown>
}

export function usePublicInquirySubmitter<TPayload extends Record<string, unknown>>(
  deps: PublicInquirySubmitterDeps<TPayload> = {},
) {
  const botGuard = deps.botGuard ?? usePublicBotGuard()
  const endpoint = deps.endpoint ?? '/api/inquiries'
  const fetcher = deps.fetcher ?? $fetch

  async function submitInquiry(payload: TPayload) {
    return await fetcher(endpoint, {
      method: 'POST',
      headers: botGuard.headers(),
      body: botGuard.withBody(payload),
    })
  }

  return {
    botGuard,
    submitInquiry,
  }
}
```

Use the current `usePublicBotGuard()` contract: `headers()`, `payload()`, `withBody(body)`. Do not add an `assertHuman` method.

- [ ] **Step 2: Test success and bot guard**

In `tests/unit/usePublicInquirySubmitter.spec.ts`, cover:

- `submitInquiry(payload)` posts to `/api/inquiries` with method `POST`.
- custom `endpoint` is respected.
- `headers()` result is passed to fetcher.
- `withBody(payload)` result is passed as request body and contains `_botGuard`.
- `withBody(payload)` is called before fetcher receives the request.

- [ ] **Step 3: Replace inline `$fetch('/api/inquiries')` in pages**

Current inline submitters are in:

- `pages/custom.vue`
- `pages/wedding.vue`
- `pages/corporate.vue`
- `pages/gift-cards.vue`
- `pages/subscription.vue`

For each page:

```ts
const { botGuard: publicBotGuard, submitInquiry } = usePublicInquirySubmitter<PayloadType>()
```

Then pass `submitInquiry` into the existing `useXPageState` dependency. Keep existing template bot guard field names if they are used in hidden inputs.

- [ ] **Step 4: Run inquiry tests**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/usePublicInquirySubmitter.spec.ts tests/unit/useCustomPageState.spec.ts tests/unit/useWeddingPageState.spec.ts tests/unit/useCorporatePageState.spec.ts tests/unit/useGiftCardsPageState.spec.ts tests/unit/useSubscriptionPageState.spec.ts
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit**

```bash
git add composables/usePublicInquirySubmitter.ts tests/unit/usePublicInquirySubmitter.spec.ts pages/custom.vue pages/wedding.vue pages/corporate.vue pages/gift-cards.vue pages/subscription.vue
git commit -m "refactor(nuxt-shop): centralize public inquiry submitter"
```

## Task 4: Разобрать ChatWidget

**Files:**
- Modify: `components/ChatWidget.vue`
- Create: `components/chat/ChatLauncher.vue`
- Create: `components/chat/ChatWindow.vue`
- Create: `components/chat/ChatHeader.vue`
- Create: `components/chat/ChatMessages.vue`
- Create: `components/chat/ChatComposer.vue`
- Create: `components/chat/ChatOfflineForm.vue`
- Create: `components/chat/ChatRating.vue`
- Create: `composables/useChatComposer.ts`
- Create: `composables/useChatOfflineForm.ts`
- Modify only if useful: `lib/chat/attachments.ts`
- Modify only if useful: `lib/chat/store.ts`
- Tests: `tests/unit/useChat.spec.ts`, `tests/unit/chat.transport.spec.ts`, `tests/unit/chat.attachments.spec.ts`
- Create: `tests/unit/useChatComposer.spec.ts`
- Create: `tests/unit/useChatOfflineForm.spec.ts`

- [ ] **Step 1: Preserve existing transport boundary**

Do not move socket code back into UI. `lib/chat/transport.ts`, `lib/chat/store.ts`, `lib/chat/attachments.ts`, and `useChat.ts` stay the transport/state core.

Run:

```bash
./node_modules/.bin/vitest run tests/unit/useChat.spec.ts tests/unit/chat.transport.spec.ts tests/unit/chat.attachments.spec.ts
```

Expected: existing chat core is green before UI split.

- [ ] **Step 2: Extract offline form**

Create `useChatOfflineForm.ts`.

Public API:

```ts
type ChatOfflineInquiryPayload = {
  type: 'custom'
  name: string
  email: string
  message: string
  source: 'chat_offline'
  _botGuard: ReturnType<ReturnType<typeof usePublicBotGuard>['payload']>
}

export interface UseChatOfflineFormDeps {
  submit?: (payload: ChatOfflineInquiryPayload) => Promise<unknown>
  botGuard?: ReturnType<typeof usePublicBotGuard>
}

export function useChatOfflineForm(deps: UseChatOfflineFormDeps = {}) {
  const name = ref('')
  const email = ref('')
  const message = ref('')
  const sending = ref(false)
  const sent = ref(false)
  const botGuard = deps.botGuard ?? usePublicBotGuard()

  async function submit() {
    const trimmedName = name.value.trim()
    const trimmedMessage = message.value.trim()
    if (sending.value || sent.value || !trimmedName || !trimmedMessage) return
    sending.value = true
    try {
      await (deps.submit ?? defaultSubmit)(botGuard.withBody({
        type: 'custom',
        name: trimmedName,
        email: email.value.trim(),
        message: trimmedMessage,
        source: 'chat_offline',
      }))
      sent.value = true
    } finally {
      sending.value = false
    }
  }

  return { name, email, message, sending, sent, botGuard, submit }
}
```

`defaultSubmit` should keep the current endpoint from `ChatWidget.vue`: `fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', ...botGuard.headers() }, body: JSON.stringify(guardedBody) })`.

- [ ] **Step 3: Extract composer**

Create `useChatComposer.ts` for:

- `inputText`
- `pendingFiles`
- file input handling
- `removePending`
- `isImage`
- `isAudio`
- voice recording state and `toggleRecording`
- `submit` guard against empty text/no files

The composable receives deps:

```ts
export interface UseChatComposerDeps {
  sendMessage: (text: string, attachments?: ChatAttachment[]) => boolean | Promise<boolean>
  uploadFiles: (files: File[]) => Promise<ChatAttachment[]>
  getUserMedia?: typeof navigator.mediaDevices.getUserMedia
  createObjectURL?: typeof URL.createObjectURL
  revokeObjectURL?: typeof URL.revokeObjectURL
  MediaRecorderCtor?: typeof MediaRecorder
}
```

This makes voice/file tests possible without browser globals.

- [ ] **Step 4: Split ChatWidget template**

`ChatWidget.vue` should become an orchestrator:

```vue
<template>
  <ChatLauncher ... />
  <ChatWindow v-if="isOpen" ...>
    <ChatHeader ... />
    <ChatMessages ... />
    <ChatOfflineForm v-if="showOfflineForm" ... />
    <ChatComposer v-else ... />
    <ChatRating ... />
  </ChatWindow>
</template>
```

Keep visual class names initially so CSS does not become a second problem.

- [ ] **Step 5: Test composer and offline form**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/useChatComposer.spec.ts tests/unit/useChatOfflineForm.spec.ts tests/unit/useChat.spec.ts tests/unit/chat.transport.spec.ts tests/unit/chat.attachments.spec.ts
```

Expected: selected chat tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/ChatWidget.vue components/chat composables/useChatComposer.ts composables/useChatOfflineForm.ts tests/unit/useChatComposer.spec.ts tests/unit/useChatOfflineForm.spec.ts
git commit -m "refactor(nuxt-shop): split chat widget ui"
```

## Task 5: Вынести Yandex Map Picker Логику

**Files:**
- Modify: `components/YandexMapPicker.vue`
- Create: `lib/maps/yandexLoader.ts`
- Create: `composables/useYandexMapPicker.ts`
- Create: `tests/unit/yandexLoader.spec.ts`
- Create: `tests/unit/useYandexMapPicker.spec.ts`

- [ ] **Step 1: Move script loader to lib**

Create `lib/maps/yandexLoader.ts`:

```ts
export const YANDEX_MAPS_KEY = '9d926c01-d55b-4362-99f0-9461dfe2ccae'

export interface YandexMapsWindow extends Window {
  ymaps?: {
    ready: (callback: () => void) => void
    Map: new (...args: any[]) => any
    Placemark: new (...args: any[]) => any
    geocode: (coords: [number, number]) => Promise<any>
  }
}

export function ensureYmapsLoaded(doc: Document = document, win: YandexMapsWindow = window as YandexMapsWindow): Promise<void> {
  if (win.ymaps) {
    return new Promise((resolve) => win.ymaps!.ready(resolve))
  }

  return new Promise((resolve, reject) => {
    const script = doc.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_KEY}&lang=ru_RU`
    script.async = true
    script.onload = () => win.ymaps?.ready(resolve)
    script.onerror = () => reject(new Error('Failed to load Yandex Maps'))
    doc.head.appendChild(script)
  })
}
```

If the current URL has extra query params, preserve them exactly.

- [ ] **Step 2: Move map state to composable**

Create `useYandexMapPicker.ts` for:

- `isOpen`
- `mapEl`
- `mapLoading`
- `geocoding`
- `pickedAddress`
- `toggle`
- `initMap`
- `placeMarker`
- `doGeocode`
- `confirm`

Component should only render button/modal and emit selected address.

- [ ] **Step 3: Test with mocked ymaps**

`useYandexMapPicker.spec.ts` should mock:

- `ymaps.Map`
- `ymaps.Placemark`
- `ymaps.geocode`
- map click event callback
- placemark drag callback

Expected behavior:

- first `toggle()` opens modal and initializes map once.
- click coordinates call geocode.
- geocode result strips leading `Россия, `.
- `confirm()` emits the picked address and closes modal.

- [ ] **Step 4: Run map tests**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/yandexLoader.spec.ts tests/unit/useYandexMapPicker.spec.ts
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/YandexMapPicker.vue lib/maps/yandexLoader.ts composables/useYandexMapPicker.ts tests/unit/yandexLoader.spec.ts tests/unit/useYandexMapPicker.spec.ts
git commit -m "refactor(nuxt-shop): isolate yandex map picker logic"
```

## Task 6: Упростить Header И ProductCard

**Files:**
- Modify: `components/AppHeader.vue`
- Create: `composables/useHeaderUiState.ts`
- Create: `tests/unit/useHeaderUiState.spec.ts`
- Modify: `components/ProductCard.vue`
- Create: `components/product/ProductQuickView.vue`
- Create: `composables/useProductCardState.ts`
- Create: `tests/unit/useProductCardState.spec.ts`

- [ ] **Step 1: Header UI state**

Move these from `AppHeader.vue` to `useHeaderUiState.ts`:

- `menuOpen`
- `showSearch`
- `searchQ`
- `cartBump`
- `isStuck`
- cart-count watcher
- scroll handler
- `openSearch`
- `closeSearch`
- `goSearch`

Public API:

```ts
export interface UseHeaderUiStateDeps {
  cartCount: Ref<number>
  navigate: (path: string) => Promise<void> | void
  getScrollY?: () => number
}
```

`AppHeader.vue` keeps only template, user/cabinet URL, settings hints and wiring.

- [ ] **Step 2: ProductCard state**

Move these from `ProductCard.vue` to `useProductCardState.ts`:

- `imgError`
- `justAdded`
- `qvOpen`
- `qvSize`
- `qvPrice`
- `serviceBadges`
- `tagClass`
- `add`
- `addFromQv`

Keep `buildProductPresentation(props.p)` in the composable so the card template receives ready fields.

- [ ] **Step 3: Quick view component**

Create `ProductQuickView.vue` from the current quick-view modal block. It receives product/presentation/selected size and emits close/add/update size. No cart mutation inside the component.

- [ ] **Step 4: Run focused tests**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/useHeaderUiState.spec.ts tests/unit/useProductCardState.spec.ts tests/unit/product.presentation.spec.ts tests/unit/useCart.spec.ts
```

Expected: selected tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/AppHeader.vue composables/useHeaderUiState.ts tests/unit/useHeaderUiState.spec.ts components/ProductCard.vue components/product/ProductQuickView.vue composables/useProductCardState.ts tests/unit/useProductCardState.spec.ts
git commit -m "refactor(nuxt-shop): extract header and product card state"
```

## Task 7: Catalog Pages And Filters Cleanup

**Files:**
- Modify: `pages/catalog/index.vue`
- Modify: `pages/catalog/[collectionSlug].vue`
- Modify: `components/FiltersPanel.vue`
- Create: `components/catalog/CatalogPageHero.vue`
- Create: `components/catalog/CatalogToolbar.vue`
- Create: `components/catalog/CatalogProductGrid.vue`
- Create: `components/catalog/CollectionHero.vue`
- Create: `components/catalog/CollectionSeoBlock.vue`
- Create if needed: `composables/useCatalogSeoState.ts`
- Tests: `tests/unit/useCatalogPageState.spec.ts`, `tests/unit/useCatalogCollectionPage.spec.ts`, `tests/unit/catalog.collectionSeo.spec.ts`, `tests/unit/catalog.filtering.spec.ts`, `tests/unit/catalog.filterState.spec.ts`

- [ ] **Step 1: Keep filtering logic where it is**

Do not rewrite `lib/catalog/filtering.ts` or `useCatalogPageState.ts` unless a test proves the page split needs a new return field.

- [ ] **Step 2: Extract catalog index sections**

From `pages/catalog/index.vue`, move:

- hero/header block into `CatalogPageHero.vue`
- sort/search/count controls into `CatalogToolbar.vue`
- product loop and pagination block into `CatalogProductGrid.vue`

The page keeps `useCatalogPageQueries`, `useCatalogPageState`, `useSeoMeta`, canonical and schema wiring.

- [ ] **Step 3: Extract collection page sections**

From `pages/catalog/[collectionSlug].vue`, move:

- collection hero into `CollectionHero.vue`
- product grid into shared `CatalogProductGrid.vue`
- sanitized SEO/content block into `CollectionSeoBlock.vue`

- [ ] **Step 4: Simplify FiltersPanel only after pages are green**

If `FiltersPanel.vue` remains over 220 lines, extract pure option builders to `lib/catalog/filterOptions.ts`:

```ts
export function buildCompositionOptions(compositions: string[]) {
  return compositions.map((value) => ({ value, label: value }))
}
```

Add tests in `tests/unit/catalog.filterOptions.spec.ts` only for pure transformations that were moved.

- [ ] **Step 5: Run catalog tests**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/useCatalogPageState.spec.ts tests/unit/useCatalogCollectionPage.spec.ts tests/unit/catalog.collectionSeo.spec.ts tests/unit/catalog.filtering.spec.ts tests/unit/catalog.filterState.spec.ts
```

Expected: selected tests pass.

- [ ] **Step 6: Commit**

```bash
git add pages/catalog components/catalog components/FiltersPanel.vue composables/useCatalogSeoState.ts lib/catalog/filterOptions.ts tests/unit/catalog.filterOptions.spec.ts
git commit -m "refactor(nuxt-shop): split catalog page sections"
```

Only include files that were actually created or modified.

## Task 8: CSS Audit And Page-Specific Style Split

**Files:**
- Read: `assets/css/main.css`
- Modify: `assets/css/app.css`
- Modify: `assets/css/home.css`
- Modify: `assets/css/catalog.css`
- Create if used: `assets/css/product.css`
- Create if used: `assets/css/cart.css`
- Create if used: `assets/css/forms.css`
- Modify if new global CSS files are used: `nuxt.config.ts`

- [ ] **Step 1: Confirm `main.css` import status**

Run:

```bash
rg -n "main\\.css" .
```

Expected in current repo: no import from `nuxt.config.ts`. If still unimported and all styles are duplicated in connected CSS files, delete `assets/css/main.css` in its own commit. If it is imported later, do not delete it.

- [ ] **Step 2: Map CSS ownership**

Run:

```bash
rg -n "^\\.|^#|^body|^html|^:root" assets/css
```

Classify rules:

- `tokens.css`: variables only.
- `layout.css`: `.container`, `.sec`, grid and layout primitives.
- `ui.css`: reusable buttons, tags, forms, shared controls.
- `shell.css`: header, topbar, footer, cookie, mobile nav.
- `home.css`: only homepage and `components/home/*`.
- `catalog.css`: catalog, collection, filters.
- `product.css`: PDP classes only.
- `cart.css`: cart/checkout classes only.
- `forms.css`: reusable public inquiry form patterns only if used by at least two pages.
- `app.css`: fallback shared styles that do not belong to a domain file.

- [ ] **Step 3: Move rules in small batches**

Move one domain at a time:

1. Product rules from `app.css` or page scoped CSS to `product.css`.
2. Cart rules from `pages/cart.vue` scoped block or `app.css` to `cart.css`.
3. Reusable inquiry form rules to `forms.css` only when two pages use the exact class family.

After each move run:

```bash
./node_modules/.bin/nuxt build
```

Expected: build succeeds; no missing CSS import.

- [ ] **Step 4: Commit CSS cleanup**

```bash
git add assets/css nuxt.config.ts pages/product/[slug].vue pages/cart.vue components
git commit -m "refactor(nuxt-shop): split storefront css by domain"
```

## Task 9: Static/Marketing Pages Shell Pass

**Files:**
- Modify: `pages/custom.vue`
- Modify: `pages/wedding.vue`
- Modify: `pages/corporate.vue`
- Modify: `pages/gift-cards.vue`
- Modify: `pages/subscription.vue`
- Modify if repeated: `components/forms/PublicInquiryForm.vue`
- Modify if repeated: `components/forms/FormSuccessState.vue`
- Tests: existing page-state and content specs for those pages.

- [ ] **Step 1: Do not rewrite content files**

Content already lives in `lib/custom/*`, `lib/wedding/content.ts`, `lib/corporate/content.ts`, `lib/gift-cards/content.ts`, `lib/subscription/*`. Keep content there unless the page still contains hardcoded text that belongs in settings/content.

- [ ] **Step 2: Extract repeated success/form primitives**

Create shared form components only for repeated structure:

- `FormSuccessState.vue`: icon/title/body/action slot.
- `PublicInquiryForm.vue`: only if at least two pages can use the same fields without condition-heavy props.

If a page form has unique fields, create page-domain components instead, for example `components/wedding/WeddingInquiryForm.vue`.

- [ ] **Step 3: Keep page-state tests as behavior contract**

Run:

```bash
./node_modules/.bin/vitest run tests/unit/useCustomPageState.spec.ts tests/unit/useWeddingPageState.spec.ts tests/unit/useCorporatePageState.spec.ts tests/unit/useGiftCardsPageState.spec.ts tests/unit/useSubscriptionPageState.spec.ts tests/unit/custom.validation.spec.ts tests/unit/custom.payloads.spec.ts tests/unit/custom.pricing.spec.ts
```

Expected: selected tests pass.

- [ ] **Step 4: Commit**

```bash
git add pages/custom.vue pages/wedding.vue pages/corporate.vue pages/gift-cards.vue pages/subscription.vue components/forms components/wedding components/custom components/corporate
git commit -m "refactor(nuxt-shop): slim public landing pages"
```

Only include component folders that were actually created.

## Task 10: Final Verification

**Files:**
- No planned code changes.

- [ ] **Step 1: Full unit/server test run**

Run from `nuxt-shop`:

```bash
./node_modules/.bin/vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Production build**

Run:

```bash
./node_modules/.bin/nuxt build
```

Expected: Nuxt build succeeds.

- [ ] **Step 3: Manual smoke with dev server**

Run:

```bash
./node_modules/.bin/nuxt dev --host 127.0.0.1 --port 3004
```

Open/check:

- `/`
- `/catalog`
- `/catalog/<existing-collection-slug>`
- `/product/<existing-product-slug>`
- `/cart`
- `/custom`
- `/wedding`

Expected:

- no hydration errors in console.
- header search opens/closes and navigates.
- product add-to-cart still adds a line.
- quick order still routes to `/cart`.
- cart delivery form still changes address/date/time.
- chat opens, sends text, handles offline form when disconnected.
- mobile checkout bar does not overlap bottom nav.

- [ ] **Step 4: Final grep for forbidden drift**

Run:

```bash
rg -n "\\$fetch\\('/api/inquiries|\\$fetch\\(\\\"/api/inquiries|window\\.ymaps|new MediaRecorder|navigator\\.mediaDevices|getUserMedia" pages components
```

Expected:

- no direct `/api/inquiries` submitters in pages.
- `window.ymaps` appears only in `lib/maps/yandexLoader.ts` or the map composable.
- `MediaRecorder` and `getUserMedia` appear only in `useChatComposer.ts`.

- [ ] **Step 5: Final commit**

```bash
git status --short
git add nuxt-shop
git commit -m "refactor(nuxt-shop): finish storefront decomposition"
```

If every previous task was already committed and `git status --short` is empty, skip this commit.

## Completion Criteria

- `pages/product/[slug].vue` and `pages/cart.vue` are shell pages, not mega-components.
- `ChatWidget.vue`, `YandexMapPicker.vue`, `AppHeader.vue`, and `ProductCard.vue` no longer own transport/browser-heavy logic directly.
- Public inquiry submit to `/api/inquiries` is centralized.
- CSS files have clear ownership; `main.css` is either intentionally connected or removed after import audit.
- Full `./node_modules/.bin/vitest run` passes.
- `./node_modules/.bin/nuxt build` passes.
- No changes were made in `admin/**` or `cabinet/**`.
