# nuxt-shop/agent.md — локальная памятка для Codex

## Что читать первым

- `../agent.md`
- `./agent.md`
- `composables/useSettings.ts`, если задача упирается в тексты, контент или JSON-настройки

## Что это за приложение

- `nuxt-shop` — публичная витрина магазина
- здесь важны: главная, каталог, карточка товара, коллекции, корзина, подписка, SEO и доверие
- данные и большая часть контента приходят из `api`

## Текущий приоритет

- качество кода и поддерживаемость важнее текущей верстки
- верстка будет переделываться, поэтому не переусложняй UI-решения ради пиксельной точности
- если есть выбор, предпочитай ясную структуру, shared helper'ы и предсказуемое состояние

## Правила принятия решений

- тексты и контент по возможности брать из `useSettings.ts`, а не хардкодить
- поведение не должно зависеть от изменяемых display-label'ов из админки, если можно опереться на type/value/slug
- route/query-driven состояние держать реактивным, не инициализировать один раз через `onMounted`, если оно должно переживать SSR и навигацию
- если данные связаны, держи их вместе
- пример: CTA как объект `{ label, to, tone }`, а не текст в одном месте и маршрут в другом

## Shared логика, которую лучше не дублировать

- навигация шапки: `constants/shopNav.ts`
- сезонные фильтры и home seasonal cards: `constants/seasonCollections.ts`
- логика каталоговых коллекций: `constants/catalogCollections.ts`
- подбор home product sections: `constants/homeProductSections.ts`

## CSS-границы

- `assets/css/tokens.css` — токены
- `assets/css/shell.css` — app shell, header, topbar, footer, cookie, mobile nav
- `assets/css/home.css` — только главная
- `assets/css/catalog.css` — каталог и связанные экранные паттерны
- `assets/css/app.css` — shared UI и оставшиеся общие стили

## Практические ограничения

- не сваливай page-specific стили обратно в `app.css`, если у страницы уже есть свой CSS-файл
- не вводи новые токены, если хватает текущих
- `Teleport to="body"` для SSR-чувствительных блоков держать в `ClientOnly`
- не дублируй логику из `admin` или `api` на витрине без необходимости
- каталог, коллекции и главная связаны общими сценариями, поэтому проверяй их вместе, если меняешь фильтры, сезонность или карточные подборки

## Что помнить про текущий рефактор

- app shell уже разнесён на более понятные слои, не тащи обратно ad-hoc логику в `AppHeader.vue`
- seasonal/collection/home-section логика уже вынесена в `constants/*`; при новых изменениях сначала расширяй helper, а не копируй код в страницу
- быстрые фильтры каталога должны оставаться связаны с реальными настройками, а не с жёстко пришитыми русскими названиями
- home sections должны описывать смысл подборки, а не быть простым `slice()` по остаткам массива

## Уже вынесенные boundary-слои

- settings:
  - `lib/settings/types.ts`
  - `lib/settings/normalize.ts`
  - `lib/settings/selectors.ts`
  - `server/api/app-settings.get.ts`
- storage/persist:
  - `lib/storage/clientStorage.ts`
  - `lib/storage/persistentState.ts`
- cart:
  - `lib/cart/types.ts`
  - `lib/cart/createCartLine.ts`
  - `lib/cart/lineKey.ts`
  - `lib/cart/page.ts`
  - `composables/useCart.ts`
- home:
  - `lib/home/content.ts`
  - `lib/home/discovery.ts`
  - `lib/home/popup.ts`
- corporate:
  - `lib/corporate/content.ts`
- about:
  - `lib/about/types.ts`
  - `lib/about/content.ts`
- checkout/pricing:
  - `lib/checkout/types.ts`
  - `lib/checkout/createCartQuote.ts`
  - `composables/useCartQuote.ts`
  - `composables/useCartCheckoutFlow.ts`
- delivery:
  - `lib/delivery/content.ts`
- gift cards:
  - `lib/gift-cards/content.ts`
- storefront query contracts:
  - `lib/storefront/types.ts`
- orders:
  - `lib/orders/track.ts`
- sale:
  - `lib/sale/filtering.ts`
  - `lib/sale/timer.ts`
- chat:
  - `lib/chat/store.ts`
  - `lib/chat/transport.ts`
  - `lib/chat/attachments.ts`
  - `composables/useChat.ts`
- transient UI orchestration:
  - `composables/useAboutPageContent.ts`
  - `composables/useAsyncSubmitState.ts`
  - `composables/useCartDeliveryForm.ts`
  - `composables/useCartPageQueries.ts`
  - `composables/useCartPageState.ts`
  - `composables/useCatalogCollectionPage.ts`
  - `composables/useCatalogPageQueries.ts`
  - `composables/useCatalogPageState.ts`
  - `composables/useCareTipsPageContent.ts`
  - `composables/useCorporatePageState.ts`
  - `composables/useCustomPageState.ts`
  - `composables/useDeliveryPageContent.ts`
  - `composables/useGiftCardsPageState.ts`
  - `composables/useHomePageData.ts`
  - `composables/useHomePageQueries.ts`
  - `composables/useHolidayPageContent.ts`
  - `composables/useProductAddonOptions.ts`
  - `composables/useProductGalleryState.ts`
  - `composables/useProductLightbox.ts`
  - `composables/useHomePageActions.ts`
  - `composables/useHomePopup.ts`
  - `composables/useOrderTrackPageState.ts`
  - `composables/useProductPageQueries.ts`
  - `composables/useProductPageState.ts`
  - `composables/useProductPurchaseActions.ts`
  - `composables/useProductReviewSubmission.ts`
  - `composables/useProductConfigurator.ts`
  - `composables/useProductPageContent.ts`
  - `composables/useSalePageState.ts`
  - `composables/useStorefrontProductsQuery.ts`
  - `composables/useSubscriptionPageState.ts`
  - `composables/useWeddingPageState.ts`
- wishlist:
  - `lib/wishlist/pluralization.ts`
  - `lib/wishlist/products.ts`
  - `composables/useWishlistPageState.ts`
- address lookup boundary:
  - `server/api/dadata/address.post.ts`
  - `composables/useDadata.ts`
- catalog:
  - `lib/catalog/types.ts`
  - `lib/catalog/filterState.ts`
  - `lib/catalog/filtering.ts`
  - `lib/catalog/seo.ts`
  - `lib/catalog/collectionPageContent.ts`
  - `lib/catalog/collectionPageLinks.ts`
  - `lib/catalog/collectionPageMedia.ts`
  - `lib/catalog/collectionSeo.ts`
- care:
  - `lib/care/content.ts`
- custom builder:
  - `lib/custom/types.ts`
  - `lib/custom/options.ts`
  - `lib/custom/pricing.ts`
  - `lib/custom/payloads.ts`
  - `lib/custom/validation.ts`
- holiday:
  - `lib/holiday/content.ts`
- product:
  - `lib/product/types.ts`
  - `lib/product/addons.ts`
  - `lib/product/gallery.ts`
  - `lib/product/options.ts`
  - `lib/product/reviews.ts`
  - `lib/product/recommendations.ts`
  - `lib/product/seo.ts`
  - `lib/product/presentation.ts`
- subscription:
  - `lib/subscription/types.ts`
  - `lib/subscription/content.ts`
- wedding:
  - `lib/wedding/content.ts`

## Состояние тест-плана по nuxt-shop

- 2026-06-08: активирован план `docs/superpowers/plans/2026-06-08-nuxt-shop-test-strategy.md`.
- Волна A (commerce core) — **выполнено**.
  - `tests/unit/useCartQuote.spec.ts`, `tests/unit/cartQuote.spec.ts`.
- Queue B (Query/API Contracts) — **выполнен**.
  - B1: endpoint ownership закреплён контрактами, в том числе для `useCatalogPageQueries`, `useHomePageQueries`, `useProductPageQueries`, `useCartPageQueries`, `storefront.contracts`.
  - B2: добавлены проверки и hardening для malformed `product/zone/bonus` payload-ов в query-слое, включая `useCartPageQueries` и `useStorefrontProductsQuery`.
  - B3: добавлены и покрыты нормализаторы `lib/storefront/types.ts` (`slug`, `images`, `keywords`, numeric conversion).
- Последние проверки:
  - `./node_modules/.bin/vitest run tests/unit/storefront.contracts.spec.ts tests/unit/useStorefrontProductsQuery.spec.ts tests/unit/useCatalogPageQueries.spec.ts tests/unit/useHomePageQueries.spec.ts tests/unit/useProductPageQueries.spec.ts tests/unit/useCartPageQueries.spec.ts` (6/6).
  - `./node_modules/.bin/vitest run tests/unit/storefront.types.spec.ts` (1/1).
  - `./node_modules/.bin/vitest run` (96/96 файлов, 409/409 тестов).
  - `./node_modules/.bin/nuxt build` (green).
- В этом цикле также закрыты:
  - `nuxt-shop/composables/useStorefrontProductsQuery.ts`: нормализация payload к `Product[] | null` и стабильный fallback.
  - `nuxt-shop/composables/useCartPageQueries.ts`: вынесение нормализации в `lib/storefront/types.ts` и стабилизация `loyaltyLevels`.
  - `nuxt-shop/tests/unit/storefront.types.spec.ts`: прямые contract-кейсы для нормализаторов.
- `nuxt-shop/composables/useProductReviewSubmission.ts` + `nuxt-shop/tests/unit/useProductReviewSubmission.spec.ts`:
  - добавлен защитный guard от двойного сабмита отзыва
  - нормализованная выдача ошибки при нештатном падении submit
  - регрессия на повторный клик во время в-flight теперь покрыта
- В этой волне дополнительно убран прямой `style`-мутат на уровне composable/компонентов:
  - `nuxt-shop/composables/useProductLightbox.ts`: `document.body.style.overflow` -> класс `lightbox-scroll-lock` на `body` (в `assets/css/app.css`).
  - обновлён `nuxt-shop/tests/unit/useProductLightbox.spec.ts` под проверку класса.
- Проверка по template-inline после доработок:
  - `rg -n "\\bstyle\\s*=|:style\\b|v-bind:style" nuxt-shop --glob '*.vue'` — `0` совпадений.
- Проверки:
  - `./node_modules/.bin/vitest run tests/unit/useProductLightbox.spec.ts` — ✅
  - `./node_modules/.bin/vitest run` — `96/96` файлов, `418/418` тестов ✅
- `nuxt-shop/composables/useStorefrontProductsQuery.ts`, `useCatalogPageQueries.ts`, `useProductPageQueries.ts`, `useCartPageQueries.ts`, `useCatalogCollectionPage.ts`:
  - переведены с `async/await` на синхронные composable-границы, чтобы `useFetch/useAsyncData` не вызывались вне Nuxt composable-контекста.
  - это устраняет ошибку `Composable has been called outside of a Nuxt instance` на главной/каталоге/карточке/корзине.
- Проверки после фикса:
  - `./node_modules/.bin/vitest run` — 96/96 файлов, 415 тестов ✅
  - `./node_modules/.bin/nuxt build` — ✅
  - `nuxt-shop/tests/unit/useCatalogPageState.spec.ts`:
    - добавлен route-переход с проверкой очистки сезонных/деструктурированных полей и устойчивости `pagination` после смены query.
  - `nuxt-shop/tests/unit/useProductPageState.spec.ts`:
    - добавлена проверка, что `reviewSubmission`-инъекция следует за изменением slug через общий computed референс, без рекомпозиции shell.
- Доп. проверки:
  - `./node_modules/.bin/vitest run tests/unit/useProductReviewSubmission.spec.ts tests/unit/useCatalogPageState.spec.ts tests/unit/useProductPageState.spec.ts` (3/3).

## 2026-06-13 npm verification follow-up

- В non-interactive shell `npm` поднимается через `source "$HOME/.nvm/nvm.sh"`; проверенная версия: Node `v22.17.0`, npm `11.4.2`.
- Свежая проверка через npm-скрипты:
  - `npm test` — passed (`96/96` test files, `419/419` tests).
  - `npm run build` — passed (`nuxt build`, production build complete).

## Как теперь лучше заходить в storefront-логику

- если задача про site config/seo/url/schema:
  - сначала смотри `useSeo.ts` и typed `useSettings()`
- если задача про storefront data fetch:
  - page-level `useFetch` лучше уносить в отдельные query composable, а не держать endpoint-строки в page SFC
  - typed lookup/query shapes лучше держать в `lib/storefront/types.ts`
  - общий feed `/api/products?all=1` лучше брать через `composables/useStorefrontProductsQuery.ts`, если странице не нужен более широкий page-specific query boundary
  - если page-specific query composable тоже использует products feed, он должен композиционно опираться на `useStorefrontProductsQuery.ts`, а не повторять прямой `useFetch('/api/products?all=1')`
- если задача про corporate page:
  - benefits/formats и inquiry payload/validation теперь лучше брать из `lib/corporate/content.ts`
  - `pages/corporate.vue` не должен снова держать inline submit/validation orchestration, для этого есть `composables/useCorporatePageState.ts`
  - shared loading/success/error submit state лучше брать из `composables/useAsyncSubmitState.ts`, а не дублировать refs вручную
- если задача про about page:
  - timeline, team, values, how-we-choose и why-us parsing теперь лучше брать через `lib/about/content.ts`
  - `pages/about.vue` не должен снова держать inline `parseSettingJSON` для about-блоков, для этого есть `composables/useAboutPageContent.ts`
- если задача про корзину:
  - сначала смотри `lib/cart/*`, потом `useCart.ts`
  - для расчетов заказа не пиши логику в `pages/cart.vue`, а добавляй ее в `lib/checkout/*` или `useCartQuote.ts`
  - `useCart()` теперь line-based only: `addLine/removeLine/setLineQty`
  - product snapshots, delivery zones и loyalty levels теперь лучше брать через `composables/useCartPageQueries.ts`
  - `composables/useCartPageQueries.ts` должен брать общий product feed через `useStorefrontProductsQuery.ts`, а не дублировать endpoint
  - image fallback map, volume-rule map и склонение `букет/букета/букетов` теперь лучше держать в `lib/cart/page.ts`
  - delivery form state, datepicker, profile prefill, delivery mode selection и zone detection теперь лучше держать в `composables/useCartDeliveryForm.ts`
  - promo/apply/auto-apply, cart trigger, bonus toggle guards и submit orchestration теперь лучше держать в `composables/useCartCheckoutFlow.ts`
  - page-level glue между image maps, delivery form, quote и checkout flow лучше держать в `composables/useCartPageState.ts`
- если задача про чат:
  - transport/socket logic должна жить в `lib/chat/transport.ts`
  - state transitions и guards должны жить в `lib/chat/store.ts`
  - `useChat.ts` должен оставаться thin orchestrator
- если задача про local persistence:
  - не ходи напрямую в `localStorage`, сначала проверь `lib/storage/*`
- если задача про каталог:
  - query/filter/pagination/seo helpers теперь в `lib/catalog/*`
  - raw fetch для products/categories/collections теперь лучше брать через `composables/useCatalogPageQueries.ts`
  - `composables/useCatalogPageQueries.ts` должен брать products feed через `useStorefrontProductsQuery.ts`, а categories/collections оставлять у себя
  - `pages/catalog/index.vue` должен только связывать route, refs и UI-компоненты
  - page-level route syncing, filter refs, derived options, filteredProducts и pagination лучше держать в `composables/useCatalogPageState.ts`
  - collection landing copy/media/thumbs/gift-link/schema/canonical wiring лучше держать в `lib/catalog/collectionPage*.ts`, а `pages/catalog/[collectionSlug].vue` оставлять thin shell через `composables/useCatalogCollectionPage.ts`
- если задача про home:
  - raw fetch для products/public reviews/active banners теперь лучше брать через `composables/useHomePageQueries.ts`
  - `composables/useHomePageQueries.ts` должен брать products feed через `useStorefrontProductsQuery.ts`, а reviews/banners оставлять у себя
  - hero actions/stats и статические home content lists лучше собирать через `lib/home/content.ts`
  - page-level assembly products/reviews/banners/settings в home buckets лучше держать в `composables/useHomePageData.ts`
  - popup focus-trap/session/promo helper logic лучше держать в `lib/home/popup.ts`
  - popup lifecycle/open-delay/focus-restore wiring лучше держать в `composables/useHomePopup.ts`
  - promo copy и hero quick-add action wiring лучше держать в `composables/useHomePageActions.ts`
- если задача про product page:
  - raw fetch для product/allProducts/apiReviews и сетевые wrappers `track` / `submit review` теперь лучше брать через `composables/useProductPageQueries.ts`
  - `composables/useProductPageQueries.ts` должен брать `allProducts` через `useStorefrontProductsQuery.ts`, а product/apiReviews/track/review submit держать у себя
  - `pages/product/[slug].vue` должен оставаться thin shell над `useProductPageState.ts`, а не держать прямой `useFetch` и runtime submit wiring
- если задача про custom builder:
  - option constants, pricing, payload builders и contact validation теперь в `lib/custom/*`
  - `pages/custom.vue` не должен снова держать inline cart/quick-order/inquiry orchestration, для этого есть `composables/useCustomPageState.ts`
- если задача про delivery page:
  - delivery options/zones/timing/payment/faq parsing и FAQ schema лучше держать в `lib/delivery/content.ts`
  - `pages/delivery.vue` не должен снова держать inline `parseSettingJSON` и FAQ `jsonLd` wiring, для этого есть `composables/useDeliveryPageContent.ts`
- если задача про gift-cards page:
  - nominals/designs/default form, amount derivation и inquiry payload теперь лучше держать в `lib/gift-cards/content.ts`
  - `pages/gift-cards.vue` не должен снова держать inline amount/submit orchestration, для этого есть `composables/useGiftCardsPageState.ts`
- если задача про holiday page:
  - static holiday cards/combo packs, FAQ parsing limit и FAQ schema лучше держать в `lib/holiday/content.ts`
  - `pages/holiday.vue` не должен снова держать inline FAQ/jsonLd wiring, для этого есть `composables/useHolidayPageContent.ts`
- если задача про страницу отслеживания заказа:
  - status steps, delivery-type labels, order-number normalization и stable lookup errors лучше держать в `lib/orders/track.ts`
  - submit/reset/search orchestration не должно возвращаться inline в `pages/orders/track.vue`, для этого есть `composables/useOrderTrackPageState.ts`
- если задача про care-tips page:
  - default care steps, flower types, FAQ filtering/fallback и FAQ schema лучше держать в `lib/care/content.ts`
  - `pages/care-tips.vue` не должен снова держать inline defaults/filtering/schema wiring, для этого есть `composables/useCareTipsPageContent.ts`
- если задача про sale page:
  - chips, discount-first sorting и chip filtering лучше держать в `lib/sale/filtering.ts`
  - countdown до следующего понедельника лучше держать в `lib/sale/timer.ts`
  - page-level timer lifecycle и empty/reset semantics не должны возвращаться inline в `pages/sale.vue`, для этого есть `composables/useSalePageState.ts`
- если задача про подписку:
  - статический subscription content и delivery defaults лучше брать из `lib/subscription/content.ts`
  - выбор тарифа, scroll-to-form, submit/reset/success/error state лучше держать в `composables/useSubscriptionPageState.ts`
- если задача про wedding page:
  - gallery/packages/page copy и inquiry payload/validation теперь лучше держать в `lib/wedding/content.ts`
  - scroll-to-form и submit orchestration лучше держать в `composables/useWeddingPageState.ts`
- если задача про inquiry/submit flows на storefront:
  - общий loading/success/error state лучше собирать через `composables/useAsyncSubmitState.ts`
  - одинаковые `try/catch/finally` submit-блоки не копировать между `corporate`, `wedding`, `gift-cards`, `subscription`, `custom`
- если задача про wishlist page:
  - bouquet pluralization и derived wishlist/suggestion lists лучше держать в `lib/wishlist/*`
  - `pages/wishlist.vue` не должен снова держать inline derived filters и clear-all semantics, для этого есть `composables/useWishlistPageState.ts`
- если задача про карточку товара:
  - addon grouping, bundle composition, recommendations, derived metadata и schema builders теперь в `lib/product/*`
  - `pages/product/[slug].vue` не должен снова разрастаться бизнес-логикой
  - card-level derived fields лучше собирать через `lib/product/presentation.ts`
  - gallery fallback/step logic лучше держать в `lib/product/gallery.ts`
  - addon source parsing, bundle assembly и grouping из storefront settings лучше держать в `composables/useProductAddonOptions.ts`
  - gallery thumb/error/reset state лучше держать в `composables/useProductGalleryState.ts`
  - option/cart-selection flows лучше держать в `lib/product/options.ts`
  - configurator refs/watchers и derived display totals/metadata лучше держать в `composables/useProductConfigurator.ts`
  - review mapping/validation/payload prep лучше держать в `lib/product/reviews.ts`
  - seo text/schema, fallback reviews и recommendation wiring лучше держать в `composables/useProductPageContent.ts`
  - shell-level wiring между product composables лучше держать в `composables/useProductPageState.ts`
  - transient lightbox keyboard/body-overflow orchestration лучше держать в `composables/useProductLightbox.ts`
  - purchase flows, toast/track wiring, quick-order pending и just-added timer лучше держать в `composables/useProductPurchaseActions.ts`
  - review submit orchestration, sent/error state и draft reset лучше держать в `composables/useProductReviewSubmission.ts`
- если задача про главную:
  - hero/featured/review fallback/banner partitioning лучше добавлять в `lib/home/discovery.ts`, а не в `pages/index.vue`
  - hero actions/stats и статические home content lists лучше собирать через `lib/home/content.ts`
  - page-level assembly products/reviews/banners/settings в home buckets лучше держать в `composables/useHomePageData.ts`
  - popup focus-trap/session/promo helper logic лучше держать в `lib/home/popup.ts`
  - popup lifecycle/open-delay/focus-restore wiring лучше держать в `composables/useHomePopup.ts`
  - promo copy и hero quick-add action wiring лучше держать в `composables/useHomePageActions.ts`

## Текущие hotspots полного рефактора

- `pages/catalog/index.vue`
  - boundary уже вынесен в `lib/catalog/*`, теперь главная задача не дублировать helper-логику обратно в страницу
  - raw fetch для products/categories/collections не должны возвращаться inline, если уже покрыты `useCatalogPageQueries.ts`
  - route syncing, filter refs, reset handlers, filteredProducts и pagination не должны возвращаться inline, если уже покрыты `useCatalogPageState.ts`
- `pages/product/[slug].vue`
  - boundary уже вынесен в `lib/product/*`, следи чтобы новые сценарии добавлялись в helper-слой с тестами, а не inline в SFC
  - raw fetch для product/allProducts/apiReviews и сетевые wrappers track/review submit не должны возвращаться inline, если уже покрыты `useProductPageQueries.ts`
  - inline UI state допустим, но selection/configurator, addon settings assembly, gallery thumb/error/reset state, review mapping, review submit orchestration, recommendation, schema, seo/reviews wiring, cart payload, purchase action orchestration, cross-composable page wiring и lightbox orchestration не должны возвращаться в страницу
- `pages/index.vue`
  - home discovery уже частично вынесен; не возвращай hero/featured/banner/reviews/popup/action rules обратно в inline computed и handler-ветки без нужды
  - raw fetch для products/public reviews/active banners не должны возвращаться inline, если уже покрыты `useHomePageQueries.ts`
  - products/reviews/banners/settings assembly не должна возвращаться в inline computed-цепочки, если уже покрыта `useHomePageData.ts`
  - статические review fallback, instagram bloom list и subscription benefits не должны возвращаться inline в страницу
  - popup lifecycle state и focus wiring должны жить в `composables/useHomePopup.ts`
- `pages/cart.vue`
  - raw fetch для product snapshots / delivery zones / loyalty levels не должны возвращаться inline, если уже покрыты `useCartPageQueries.ts`
  - form/profile prefill, delivery mode selection, datepicker state, time-slot parsing и zone detection не должны возвращаться inline, если уже покрыты `useCartDeliveryForm.ts`
  - promo state, auto-apply, cart trigger, submit payload и bonus guard wiring не должны возвращаться inline, если уже покрыты `useCartCheckoutFlow.ts`
  - image fallback map, volume rule map, item-word pluralization и bridge между `useCartDeliveryForm`, `useCartQuote` и `useCartCheckoutFlow` не должны возвращаться inline, если уже покрыты `lib/cart/page.ts` и `useCartPageState.ts`
- `pages/about.vue`
  - timeline/team/values/how-we-choose/why-us parsing не должны возвращаться inline, если уже покрыты `lib/about/content.ts` и `useAboutPageContent.ts`
- `pages/corporate.vue`
  - benefits/formats catalogs и corporate inquiry validation/submit flow не должны возвращаться inline, если уже покрыты `lib/corporate/content.ts` и `useCorporatePageState.ts`
- `pages/custom.vue`
  - builder refs, mandatory addon guard, cart payload, quick-order action и inquiry submit flow не должны возвращаться inline, если уже покрыты `lib/custom/*` и `useCustomPageState.ts`
- `pages/delivery.vue`
  - delivery options/zones/timing/payment parsing и FAQ schema wiring не должны возвращаться inline, если уже покрыты `lib/delivery/content.ts` и `useDeliveryPageContent.ts`
- `pages/gift-cards.vue`
  - nominal/design catalogs, amount derivation и gift-card inquiry submit flow не должны возвращаться inline, если уже покрыты `lib/gift-cards/content.ts` и `useGiftCardsPageState.ts`
- `pages/holiday.vue`
  - static holiday cards/combo packs и FAQ schema wiring не должны возвращаться inline, если уже покрыты `lib/holiday/content.ts` и `useHolidayPageContent.ts`
- `pages/orders/track.vue`
  - status steps, delivery labels, order-number normalization и lookup submit/reset flow не должны возвращаться inline, если уже покрыты `lib/orders/track.ts` и `useOrderTrackPageState.ts`
- `pages/care-tips.vue`
  - care defaults, FAQ filtering/fallback и FAQ schema wiring не должны возвращаться inline, если уже покрыты `lib/care/content.ts` и `useCareTipsPageContent.ts`
- `pages/catalog/[collectionSlug].vue`
  - copy/media/thumbs/gift-link/schema/canonical wiring не должны возвращаться inline, если уже покрыты `lib/catalog/collectionPage*.ts` и `useCatalogCollectionPage.ts`
- `pages/sale.vue`
  - raw fetch для products feed не должны возвращаться inline, если уже покрыты `useStorefrontProductsQuery.ts`
  - chips, discount-first sorting, monday countdown и empty/reset semantics не должны возвращаться inline, если уже покрыты `lib/sale/*` и `useSalePageState.ts`
- `pages/subscription.vue`
  - static plans/reviews/steps/time options и submit/reset/success orchestration не должны возвращаться inline, если уже покрыты `lib/subscription/*` и `useSubscriptionPageState.ts`
- `pages/wedding.vue`
  - gallery/packages/page copy, scroll-to-form и wedding inquiry submit flow не должны возвращаться inline, если уже покрыты `lib/wedding/content.ts` и `useWeddingPageState.ts`
- `pages/wishlist.vue`
  - raw fetch для products feed не должны возвращаться inline, если уже покрыты `useStorefrontProductsQuery.ts`
  - bouquet pluralization, wishlist suggestions и clear-all orchestration не должны возвращаться inline, если уже покрыты `lib/wishlist/*` и `useWishlistPageState.ts`

## Минимальная проверка после заметных правок

- для изменений в shared storefront-логике прогоняй `./node_modules/.bin/nuxt build`
- если меняется query/filter behavior, особенно смотри `pages/catalog/index.vue`, `pages/catalog/[collectionSlug].vue` и главную вместе

## Приоритет по тестированию (без верстки)

- до и после изменения бизнес-логики первым делом прогоняй unit-тесты: `cd nuxt-shop && npm run test`
- если меняется только composables/flows, запускай целевые тесты:
  - `npx vitest run tests/unit/useChat.spec.ts`
  - `npx vitest run tests/unit/useToast.spec.ts`
  - `npx vitest run tests/unit/useReviews.spec.ts`
  - `npx vitest run tests/unit/useCartDrawer.spec.ts`
  - plus `useCart`, `useWishlist`, `useShopUser`, `useSettings`, `usePush`, `useDadata`, `useSeo` по необходимости
- критические без-UI сценарии для `nuxt-shop`:
  - chat: lifecycle подключения, буферизация сообщений до `chat:ready`, unread-логика, upload error, typing-rate отправки
  - reviews: загрузка/сохранение в localStorage, устойчивость к битому JSON, prepend новых записей
  - toast: авто-снятие по таймеру и перезапуск таймера при новом сообщении
  - cart/wishlist: поведение shared state и persist-паттерны
  - checkout: delivery threshold, volume discounts, promo stacking, bonus guards, total/totalWithBonus
  - catalog/product pure helpers: фильтрация, query-state parsing, recommendations, seo text/schema builders
  - home pure helpers: hero content, featured selection, banner partitioning, review fallback
  - popup/lightbox orchestration: session guards, focus trap, keyboard navigation, body overflow cleanup
  - page action orchestration: promo copy, quick add, purchase flows, quick-order pending, just-added timers
  - review submit orchestration: validation, normalize payload, sent/error state, submit failure handling
  - configurator orchestration: initial selection watchers, qty/addon toggles, totals, derived metadata
  - product page content orchestration: fallback reviews, recommendation buckets, seo text/schema wiring, jsonLd publishing
- после текущего среза обязательно держать зелёными:
  - `tests/unit/catalog.filterState.spec.ts`
  - `tests/unit/catalog.filtering.spec.ts`
  - `tests/unit/useCatalogPageState.spec.ts`
  - `tests/unit/about.content.spec.ts`
  - `tests/unit/useAboutPageContent.spec.ts`
  - `tests/unit/corporate.content.spec.ts`
  - `tests/unit/useCorporatePageState.spec.ts`
  - `tests/unit/delivery.content.spec.ts`
  - `tests/unit/useDeliveryPageContent.spec.ts`
  - `tests/unit/gift-cards.content.spec.ts`
  - `tests/unit/useGiftCardsPageState.spec.ts`
  - `tests/unit/holiday.content.spec.ts`
  - `tests/unit/useHolidayPageContent.spec.ts`
  - `tests/unit/order-track.spec.ts`
  - `tests/unit/useOrderTrackPageState.spec.ts`
  - `tests/unit/care.content.spec.ts`
  - `tests/unit/useCareTipsPageContent.spec.ts`
  - `tests/unit/home.content.spec.ts`
  - `tests/unit/home.discovery.spec.ts`
  - `tests/unit/home.popup.spec.ts`
  - `tests/unit/useAsyncSubmitState.spec.ts`
  - `tests/unit/useHomePageActions.spec.ts`
  - `tests/unit/useHomePageData.spec.ts`
  - `tests/unit/useHomePageQueries.spec.ts`
  - `tests/unit/useHomePopup.spec.ts`
  - `tests/unit/useCartDeliveryForm.spec.ts`
  - `tests/unit/useCartCheckoutFlow.spec.ts`
  - `tests/unit/useCartPageQueries.spec.ts`
  - `tests/unit/cart.page.spec.ts`
  - `tests/unit/useCartPageState.spec.ts`
  - `tests/unit/custom.pricing.spec.ts`
  - `tests/unit/custom.payloads.spec.ts`
  - `tests/unit/custom.validation.spec.ts`
  - `tests/unit/useCustomPageState.spec.ts`
  - `tests/unit/catalog.collectionPageContent.spec.ts`
  - `tests/unit/catalog.collectionPageMedia.spec.ts`
  - `tests/unit/catalog.collectionSeo.spec.ts`
  - `tests/unit/useCatalogPageQueries.spec.ts`
  - `tests/unit/useCatalogCollectionPage.spec.ts`
  - `tests/unit/useProductGalleryState.spec.ts`
  - `tests/unit/useProductAddonOptions.spec.ts`
  - `tests/unit/product.addons.spec.ts`
  - `tests/unit/product.gallery.spec.ts`
  - `tests/unit/product.options.spec.ts`
  - `tests/unit/product.presentation.spec.ts`
  - `tests/unit/useProductPageQueries.spec.ts`
  - `tests/unit/product.recommendations.spec.ts`
  - `tests/unit/product.reviews.spec.ts`
  - `tests/unit/product.seo.spec.ts`
  - `tests/unit/useProductLightbox.spec.ts`
  - `tests/unit/useProductPurchaseActions.spec.ts`
  - `tests/unit/useProductReviewSubmission.spec.ts`
  - `tests/unit/sale.filtering.spec.ts`
  - `tests/unit/useStorefrontProductsQuery.spec.ts`
  - `tests/unit/sale.timer.spec.ts`
  - `tests/unit/useSalePageState.spec.ts`
  - `tests/unit/useProductConfigurator.spec.ts`
  - `tests/unit/useProductPageState.spec.ts`
  - `tests/unit/useProductPageContent.spec.ts`
  - `tests/unit/subscription.content.spec.ts`
  - `tests/unit/useSubscriptionPageState.spec.ts`
  - `tests/unit/wedding.content.spec.ts`
  - `tests/unit/useWeddingPageState.spec.ts`
  - `tests/unit/wishlistProducts.spec.ts`
  - `tests/unit/useWishlistPageState.spec.ts`
- верстка и токены считаются out-of-scope для этой полосы тестирования, пока не отмечено обратное

## План тестирования по этапам (активный)

- основной план: [2026-06-08-nuxt-shop-test-strategy.md](/home/sega/Documents/buton/docs/superpowers/plans/2026-06-08-nuxt-shop-test-strategy.md)
- текущее правило: **сначала P0/P1, потом P2/P3**, всегда только unit/server tests без UI-snapshot/DOM-coverage
- для новых задач используй матрицу очередей:
  - Queue A: commerce/checkout (P0)
  - Queue B: query/contracts/server boundaries (P1/P2)
  - Queue C: формы и контент-оркестрации страниц (P1)
  - Queue D: chat/вспомогательные побочные эффекты (P2)
- если покрываем новый слой, добавь в список внизу обязательного минимального прогонки и зафиксируй в этом разделе

### Текущий обязательный минимальный список прогонки

- `useCartQuote`: `nuxt-shop/tests/unit/useCartQuote.spec.ts` (создать и поддерживать)
- `useChat`: lifecycle + transport + attachments + submit-guard tests
- `useCartCheckoutFlow` и `useCartDeliveryForm`: бонусные/пороговые регрессионные тесты
- `useStorefrontProductsQuery` + page query composables: контрактное поведение ref/pending и отсутствие дублированного `'/api/products?all=1'`
- server: `app-settings`, `dadata`, `sitemap`, `proxy` с edge-case покрытиями из `nuxt-shop/tests/server`
- при каждом срезе обновляй `nuxt-shop/agent.md` и план в `docs/superpowers/plans`

### Последнее обновление (2026-06-08)

- Дополнительный sweep по inline-стилям:
  - `rg -n "\\bstyle\\s*=|:style\\b|v-bind:style" /home/sega/Documents/buton/admin /home/sega/Documents/buton/nuxt-shop --glob '*.vue'` — совпадений нет.
  - в `admin/src/components/BottomNav.vue` уже переведена динамика колонок на классы `.bnav-cols-*`; общий статус: шаблонных inline-стилей в целевых приложениях не осталось.

- По запросу по inline-стилям:
  - Текущее состояние `nuxt-shop`: `rg -n "(\\bstyle\\s*=|\\:style\\s*=|v-bind:style)" nuxt-shop --glob '*.vue' --glob '!.nuxt/**' --glob '!.output/**'` — совпадений нет.
  - Результат: в шаблонах `.vue` inline `style`/`style-bind` сейчас отсутствует; можно сразу стартовать с новой верстки без дополнительного массового выноса.

- План выноса inline-стилей перед новой версткой:
  - 1) Фиксировать baseline для `nuxt-shop/pages` и `nuxt-shop/components`:
    - сохранить снимок `rg -n "(\\bstyle\\s*=|\\:style\\s*=|v-bind:style)" --glob '*.vue'` в `agent.md`.
  - 2) Ввести правило: новые страницы и компоненты без `style`-атрибутов в шаблоне.
    - разрешено только в случае временных фреймворк-ограничений с явной пометкой в PR.
  - 3) Для dynamic-стилей использовать единый паттерн:
    - вычислить CSS-переменные/классы в `<style scoped>`,
    - применять через классы + `v-bind()` на переменные (не через `:style` атрибут).
  - 4) Для новых redesign-шаблонов закрыть цикл по слоям:
    - `components/` (общие UI-блоки),
    - `pages/` (page-specific),
    - `shell` (header/footer/mobile-блоки из `shell.css`/`app.css`).
  - 5) Еженедельный чек:
    - `rg -n "(\\bstyle\\s*=|\\:style\\s*=|v-bind:style)" nuxt-shop/{pages,components} --glob '*.vue' --glob '!.nuxt/**' --glob '!.output/**'`
    - если совпадения появились — добавлять задачу в технический долг до релиза.

- После новой сборки/переключения модели выполнен повторный контроль:
  - `./node_modules/.bin/vitest run`, `./node_modules/.bin/vitest run tests/unit`, `./node_modules/.bin/vitest run tests/server`, `./node_modules/.bin/nuxt build` — все зелёные.
  - Проверка шаблонов: `rg -n "style=|:style=" nuxt-shop/pages nuxt-shop/components --glob '*.vue'` — совпадений нет.
  - Зафиксировали, что приоритеты текущего цикла остаются: устранение SSR/API-нестабильностей + прогон критичных сценариев.
  - Удален остаток inline-style в `admin/src/components/BottomNav.vue`:
    - заменён `:style="bottomNavStyle"` на классы `bnav-cols-*`;
    - динамика колонок теперь через классы `.bnav-cols-1..5` в `admin/src/assets/components.css`;
    - глобальная проверка по всем `.vue` в репозитории: `rg -n "(\\bstyle\\s*=|\\:style\\s*=|v-bind:style)" /home/sega/Documents/buton --glob '*.vue'` — совпадений нет.

- В рамках чистки `nuxt-shop` вынесены inline-стили из шаблонов `FiltersPanel`/`cart`/`product/[slug]`/`custom`/`wedding`.
- Убраны `style`/`:style` в:
  - `components/FiltersPanel.vue`
  - `pages/cart.vue`
  - `pages/product/[slug].vue`
  - `pages/custom.vue`
  - `pages/wedding.vue`
- Передано в CSS через классы и `v-bind` (dynamic width для диапазона цены и прогресса доставки, классы для состояний даты, бесплатной доставки, цветовых кнопок и портфолио-слайдов).
- Контроль: `rg -n "style=|:style=" nuxt-shop/pages nuxt-shop/components --glob '*.vue'` не дал совпадений.

- В очереди C2 (Forms/Content):
  - `nuxt-shop/tests/unit/useCatalogPageState.spec.ts`: добавлен кейс устойчивости к битым `catalog*` JSON-настройкам и корректному fallback размерам/сезонам.
  - `nuxt-shop/tests/unit/useProductAddonOptions.spec.ts`: добавлен кейс fallback для сломанных `catalogAddons` и `giftAddons`, включая `DEFAULT_GIFT_BUNDLES` и `bundleOptions`.
  - `nuxt-shop/tests/unit/useCatalogCollectionPage.spec.ts`: добавлен кейс безопасного поведения при отсутствии trust/title полей коллекции.
  - Прогон: `./node_modules/.bin/vitest run tests/unit/useCatalogPageState.spec.ts tests/unit/useProductAddonOptions.spec.ts tests/unit/useCatalogCollectionPage.spec.ts`, `./node_modules/.bin/vitest run tests/unit`, `./node_modules/.bin/vitest run tests/server` — все зелёные.

- В рамках очереди Commerce/checkout усилено покрытие промокодов:
  - `nuxt-shop/tests/unit/useCartCheckoutFlow.spec.ts`: пустые промокоды не вызывают `/api/promocodes/check`, некорректный ответ `auto-apply` не применяет промо, некорректный ответ `check` для второго промо приводит к ошибке, и в payload submit отсутствуют `bonusPointsUsed` и `utm`, если они не нужны.
- `nuxt-shop/tests/unit/cartQuote.spec.ts`: добавлены проверки блокировки бонусов по `promo.blockBonuses`, `promo_disallowed` и капирования `percent_capped` скидки при доп. фиксированной скидке.
 - Прогон: `./node_modules/.bin/vitest run tests/unit/useCartCheckoutFlow.spec.ts`, `./node_modules/.bin/vitest run tests/unit/cartQuote.spec.ts`, `./node_modules/.bin/vitest run tests/unit`, `./node_modules/.bin/vitest run` — все зелёные.

- Избежали повторной ошибки `Composable has been called outside of a Nuxt instance`:
  - оставили query composables как sync-фабрики (`useHomePageQueries`, `useCatalogPageQueries`, `useProductPageQueries`, `useCatalogCollectionPage`, `useCartPageQueries`, `useStorefrontProductsQuery`) и убрали `await` на их вызовах в page `<script setup>`.
  - Исправленные файлы страниц: `pages/index.vue`, `pages/sale.vue`, `pages/catalog/index.vue`, `pages/catalog/[collectionSlug].vue`, `pages/product/[slug].vue`, `pages/cart.vue`, `pages/wishlist.vue`.
  - Прогоны: `./node_modules/.bin/vitest run tests/unit`, `./node_modules/.bin/nuxt build` — зелёные.

- Закрыта SSR-регрессия на `pages/wedding.vue`:
  - корень проблемы: `useWeddingPageState.ts` возвращал `content`, а route shell ожидал `pageContent`, из-за чего SSR падал на `pageContent.heroEyebrow`.
  - фикс: `useWeddingPageState.ts` теперь явно отдаёт `pageContent` и имеет типизированный return-contract; добавлен регрессионный тест в `tests/unit/useWeddingPageState.spec.ts`.
  - прогоны: `./node_modules/.bin/vitest run tests/unit/useWeddingPageState.spec.ts tests/unit/wedding.content.spec.ts`, `./node_modules/.bin/nuxt build` — зелёные.

- Дополнительный hardening после падения на новых модельных сборках:
  - `nuxt-shop/composables/useHomePageQueries.ts` теперь обёрнут в безопасный fetch-guard, чтобы `Composable has been called outside of a Nuxt instance` не проваливал рендер при fallback-сценариях.
  - `nuxt-shop/composables/useWeddingPageState.ts` сделал зависимость `scrollToId` опциональной и добавил no-op fallback.
  - `pages/wedding.vue` теперь явно деривирует `pageContent` с fallback через `weddingPageContent` и прокидывает корректный scroll-хук (`scrollIntoView` с guard `document`).
  - добавлен регрессионный кейс в `tests/unit/useHomePageQueries.spec.ts` на недоступность `useFetch` в не-Nuxt контексте.
  - прогоны: `./node_modules/.bin/vitest run tests/unit/useHomePageQueries.spec.ts tests/unit/useWeddingPageState.spec.ts`, `./node_modules/.bin/nuxt build` — зелёные.

- Короткий цикл по inline-стилям после переключения модели:
  - убраны оставшиеся inline DOM-мутаторы в шаблонах `admin/src/views/BannersView.vue`, `admin/src/views/CategoriesView.vue` (`:hover` через события переведён в `class`-тогги),
    а также `nuxt-shop/pages/product/[slug].vue` (`@error` миниатюр теперь через `v-if` + состояние composable).
  - для `nuxt-shop/composables/useProductGalleryState.ts` добавлены `markThumbError`/`isThumbBroken`, и это покрыто тестом `tests/unit/useProductGalleryState.spec.ts`.
  - контрольный grep после правок: `rg -n "@(mouseenter|mouseleave|error)=\\\"\\(\\$event" /home/sega/Documents/buton/admin /home/sega/Documents/buton/nuxt-shop --glob '*.vue'` — совпадений inline `.style` в обработчиках больше нет.

### Текущая техническая база (2026-06-08)

- Полный baseline из последнего цикла:
  - `./node_modules/.bin/vitest run tests/unit` — `92` файла, `401` тест.
  - `./node_modules/.bin/vitest run tests/server` — `4` файла, `16` тестов.
  - `./node_modules/.bin/vitest run` — `96` файлов, `417` тестов.
  - `./node_modules/.bin/nuxt build` — ✅.

- Обновление контроля после текущего прохода inline-стилей:
  - `rg -n "\\bstyle\\s*=|:style\\b|v-bind:style" /home/sega/Documents/buton/admin /home/sega/Documents/buton/nuxt-shop --glob '*.vue'` — `0` совпадений.
  - `./node_modules/.bin/vitest run` — `96` файлов, `418` тестов ✅ (после правок `product/[slug].vue` + `useProductGalleryState`).

## 2026-06-13 декомпозиция страниц и крупных компонентов (refactor.md)

Завершён план `nuxt-shop/refactor.md`: страницы и мега-компоненты разнесены на тонкие shell-слои + маленькие компоненты/композаблы. Baseline после: `vitest run` — `103` файла, `454` теста ✅; `nuxt build` ✅.

### Новые UI-границы (components/**)

- `components/product/*` — PDP-секции без `$fetch` и глобальных mutations: `ProductPageSkeleton`, `ProductBreadcrumbs`, `ProductGallery`, `ProductPurchasePanel`, `ProductDetailsGrid`, `ProductReviewsSection`, `ProductRecommendationsSection` (переиспользуемая, 3× на PDP), `ProductSeoSection`, `ProductLightbox`, `ProductNotFound`, `ProductQuickView`.
  - `pages/product/[slug].vue` теперь ~220 строк: только query/state composables, SEO/canonical/jsonLd и сборка компонентов. Не возвращай разметку секций обратно в страницу.
- `components/cart/*` — checkout-секции: `CartDeliveryProgress` (динамический width через `v-bind` на prop), `CartEmptyState`, `CartOrderSuccess`, `CartLineList`, `CartDeliveryMethodPicker`, `CartDeliveryForm`, `CartDatePicker`, `CartSummary`, `CartMobileCheckoutBar`.
  - `dpFieldRef` прокидывается в `CartDatePicker` через function-ref (`setDpFieldRef`), потому что обычный prop разворачивает ref.
- `components/chat/*` — `ChatLauncher`, `ChatWindow`, `ChatHeader`, `ChatMessages`, `ChatComposer`, `ChatOfflineForm`, `ChatRating`. `ChatWidget.vue` стал тонким оркестратором. Транспорт (`lib/chat/*`, `useChat.ts`) не трогать.
- `components/catalog/*` — `CatalogPageHero` (со слотом `#tools`), `CatalogToolbar`, `CatalogProductGrid`, `CollectionHero`, `CollectionSeoBlock`. Каждый компонент несёт свой scoped CSS, включая собственные `@media`-переключения (`.cat-tools` скрывается на десктопе внутри `CatalogToolbar`, `.results-top` — внутри `CatalogProductGrid`).

### Новые композаблы/lib

- `composables/usePublicInquirySubmitter.ts` — единый клиентский submitter публичных заявок. `pages/custom|wedding|corporate|gift-cards` шлют через него в `/api/inquiries`, `subscription` — с `endpoint: '/api/subscriptions'`. Никакого inline `$fetch('/api/inquiries')` в страницах/компонентах.
- `composables/useChatComposer.ts` — текст, файлы, voice recording, pending uploads; deps инъектируемы (`getUserMedia`, `MediaRecorderCtor`, `createObjectURL/revokeObjectURL`) → тестируемо без браузерных globals.
- `composables/useChatOfflineForm.ts` — offline-заявка + bot guard, default submit в `/api/inquiries`.
- `lib/maps/yandexLoader.ts` (`ensureYmapsLoaded`, `YANDEX_MAPS_KEY`) + `composables/useYandexMapPicker.ts` — загрузка скрипта и состояние карты. `window.ymaps` живёт только здесь. `MediaRecorder`/`getUserMedia` — только в `useChatComposer`.
- `composables/useHeaderUiState.ts` — menu/search/sticky-header/cart-bump. `AppHeader.vue` оставляет только template + userLink + wiring.
- `composables/useProductCardState.ts` — imgError/justAdded/quick-view/serviceBadges/tagClass/add/addFromQv + `buildProductPresentation`. `ProductCard.vue` отдаёт готовые поля в шаблон.

### CSS-границы (обновлено)

- Доменные файлы: `assets/css/product.css`, `assets/css/cart.css` (оба подключены в `nuxt.config.ts` после `catalog.css`). Generic-классы, которые могли бы протечь (`.star`, `.skeleton`, `.compose-row`, `.sec__head h2`, `.req`, `.field-err`, `.input--err`), скоупятся через wrapper `.product-page` / `.cart-page` на `<main>`. Стили teleported-блоков (lightbox, sticky CTA, cart drawer) — глобальные без wrapper.
- `assets/css/main.css` удалён: был не подключён в `nuxt.config.ts` (мёртвый дубль).

### Жёсткие правила после среза

- `pages/product/[slug].vue`, `pages/cart.vue`, `pages/catalog/index.vue`, `pages/catalog/[collectionSlug].vue` — shell-слои; не возвращай в них разметку секций, бизнес-логику или прямой `$fetch`.
- `ChatWidget.vue`, `YandexMapPicker.vue`, `AppHeader.vue`, `ProductCard.vue` — больше не владеют transport/browser-heavy логикой напрямую.
- Проверочный grep дрейфа: `rg -n "\\$fetch\\('/api/inquiries|window\\.ymaps|new MediaRecorder|navigator\\.mediaDevices|getUserMedia" pages components` — ожидается пусто/только дозволенные файлы.
