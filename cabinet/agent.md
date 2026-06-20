# Cabinet agent context

## Актуальное состояние

`cabinet` уже прошёл большой рефактор не только по экранам, но и по внутренним границам:
- крупные `view`-файлы разложены на локальные секции и маленькие компоненты;
- часть orchestration-логики вынесена в composables;
- API/contracts разделены понятнее;
- скрытые shared-state точки вынесены в явные stores;
- тесты и build на текущем состоянии проходят.

Проверено на текущем состоянии:
- `cd cabinet && npm run build`
- `cd cabinet && npm test`

Обновление 2026-06-08:
- для `cabinet` устранены inline-стили масштабирования root в runtime-логику:
  - `src/composables/useRootViewportScale.ts` перешёл на class-based управление (без `root.style.*`),
  - добавлены классы в `src/assets/components.css` (`cb-root-scale*`) и класс `cb-root-scale-probe`,
  - соответствующие тесты в `tests/composables/useRootViewportScale.spec.ts` переведены на проверки классов.

Статус последней проверки:
- build: `ok`
- tests: `43 files / 141 tests passed` (`npm test`)

## Ключевые архитектурные границы

### 1. View-слой
- `src/views/*` теперь должны оставаться container-слоем.
- Новую бизнес-логику не возвращать в страницы без крайней причины.
- Для экранных доработок предпочитать:
  - локальные section-components
  - узкие composables уровня сценария

### 2. Stores
- [auth.ts](/home/sega/Documents/buton/cabinet/src/stores/auth.ts):
  - основной store для `user/session`
  - адресная логика уже частично вынесена в helper-слой
  - wishlist здесь оставлен только как transitional delegation
- [wishlist.ts](/home/sega/Documents/buton/cabinet/src/stores/wishlist.ts):
  - владеет wishlist state/API flow
- [cabinetOrders.ts](/home/sega/Documents/buton/cabinet/src/stores/cabinetOrders.ts):
  - владеет shared orders resource
  - заменяет старый скрытый module-level singleton

### 3. API и контракты
- [src/api/index.ts](/home/sega/Documents/buton/cabinet/src/api/index.ts):
  - основной клиентский API entry point
- [src/api/order.ts](/home/sega/Documents/buton/cabinet/src/api/order.ts):
  - нормализация order DTO
- [src/types/api.ts](/home/sega/Documents/buton/cabinet/src/types/api.ts):
  - совместимый barrel для типов
- `src/types/*`:
  - типы уже разнесены по доменам
  - при новых изменениях лучше добавлять/править доменный файл, а не снова раздувать один общий типовой узел

### 4. Auth / recovery / password flows
- [useAuthEntryFlow.ts](/home/sega/Documents/buton/cabinet/src/composables/useAuthEntryFlow.ts)
- [usePasswordRecoveryFlow.ts](/home/sega/Documents/buton/cabinet/src/composables/usePasswordRecoveryFlow.ts)
- [usePasswordPolicy.ts](/home/sega/Documents/buton/cabinet/src/composables/usePasswordPolicy.ts)

Если меняется логика логина, регистрации, reset или password-policy, сначала смотри сюда, а не в сами `view`.

### 5. Profile / persisted state
- [useProfileNotifications.ts](/home/sega/Documents/buton/cabinet/src/composables/useProfileNotifications.ts)
- [usePersistedResource.ts](/home/sega/Documents/buton/cabinet/src/composables/usePersistedResource.ts)

Если появится ещё один похожий persisted-resource сценарий, расширять лучше этот pattern, а не копировать async queue/rollback заново.

### 6. Address flow
- [AddressFormModal.vue](/home/sega/Documents/buton/cabinet/src/components/addresses/AddressFormModal.vue)
- [useAddressFormOrchestration.ts](/home/sega/Documents/buton/cabinet/src/components/addresses/useAddressFormOrchestration.ts)
- [useDadata.ts](/home/sega/Documents/buton/cabinet/src/composables/useDadata.ts)

Адресную оркестрацию держать отдельно от `template`; `useDadata` уже содержит debounce/cancel/env-backed config.

### 7. Date picker
- [AppDatePicker.vue](/home/sega/Documents/buton/cabinet/src/components/AppDatePicker.vue)
- [useAppDatePickerCalendar.ts](/home/sega/Documents/buton/cabinet/src/composables/useAppDatePickerCalendar.ts)

Чистую календарную математику добавлять в composable, а не обратно в SFC.

### 8. Repeat order bridge
- [useRepeatOrder.ts](/home/sega/Documents/buton/cabinet/src/composables/useRepeatOrder.ts)
- [repeatOrderBridge.ts](/home/sega/Documents/buton/cabinet/src/composables/repeatOrderBridge.ts)

Payload между `cabinet` и shop уже выделен отдельно. Если меняется формат repeat-order, менять bridge явно, а не собирать payload inline в composable.

## CSS-слой

Глобальные стили уже разделены:
- [components.css](/home/sega/Documents/buton/cabinet/src/assets/components.css)
- [features.css](/home/sega/Documents/buton/cabinet/src/assets/features.css)
- [features-dashboard.css](/home/sega/Documents/buton/cabinet/src/assets/features-dashboard.css)
- [features-orders.css](/home/sega/Documents/buton/cabinet/src/assets/features-orders.css)
- [features-account.css](/home/sega/Documents/buton/cabinet/src/assets/features-account.css)
- [features-auth.css](/home/sega/Documents/buton/cabinet/src/assets/features-auth.css)
- [features-chat.css](/home/sega/Documents/buton/cabinet/src/assets/features-chat.css)

Порядок импорта в `src/main.ts` важен для каскада (см. срез ниже): domain-файлы грузятся после `features.css`, мобильные override — последними.

Правило:
- общие primitives/helpers держать в `components.css`
- экранные и доменные правила не складывать обратно в один общий файл

## Тестовое покрытие

Ключевые тесты уже есть для:
- API client
- `auth` store
- router guards
- `useCabinetOrdersResource`
- `useCabinetOrders`
- `useCabinetTier`
- `useDashboardPromos`
- `useDashboardNextDelivery`
- `useDashboardRecommendations`
- `useReferralLinkAndRepeatOrder`
- `useChatOfflineSupport`
- `useDadata`

Если меняется логика в этих зонах, сначала обновлять существующий test suite, а не писать параллельный дубликат.

## Что ещё остаётся transitional

- `src/types/user.ts` остаётся barrel-слоем поверх более узких user contracts
- `src/types/order.ts` и `src/types/api.ts` ещё держат `IOrder*` aliases как type-only compatibility layer; новый код должен использовать `CabinetOrder*`
- `src/api/index.ts` ещё держит часть compatibility type exports, но новый cabinet-код должен брать доменные типы из `src/types/*`

Это не срочные проблемы, но новые изменения лучше строить уже на новых границах, а не усиливать legacy-слой.

## Практические правила для следующего агента

- Не возвращать бизнес-логику в большие `view`.
- Не расширять `auth.ts`, если логика относится к отдельному домену.
- Не плодить новые глобальные singleton-состояния вне Pinia/store boundary.
- Не смешивать UI constants и API contracts в одном типовом файле.
- Не складывать новый feature-CSS обратно в один общий stylesheet.
- При изменении сценариев сначала искать уже существующий composable/store/helper, а потом добавлять новый слой.

## Команды

```bash
cd cabinet
npm run build
npm test
```

## 2026-06-12 cabinet API error UX/security notes
- Cabinet API errors are normalized through `src/api/errors.ts`; new axios/fetch flows should use `normalizeCabinetApiError`, `toCabinetApiError`, or `getErrorMessage` instead of rendering raw `e.message`.
- Chat uploads must surface user-readable 413/415/429/file-count errors in the widget; do not silently swallow upload failures in composer/offline flows.
- User-facing cabinet screens should avoid leaking raw ObjectId/Mongo/validation internals; map API limits and validation failures to plain Russian messages.
- Current XSS scan of `cabinet/src` did not find `v-html`, `innerHTML`, `insertAdjacentHTML`, or `dangerously` usage; keep rendering escaped by default.
- Cabinet API interceptor logs failed requests in dev mode only (`method`, `url`, `status`, normalized `message`); do not log request/response payloads or personal data.

## 2026-06-12 cabinet refactor next wave
- `auth` no longer exposes wishlist state/actions; wishlist behavior lives in `src/stores/wishlist.ts`, while auth only resets/syncs user wishlist slugs through explicit boundaries.
- New cabinet code should import domain types from `src/types/*`; `@/api` remains the runtime API facade and only keeps compatibility type exports for incremental migration.
- `ProfileView.vue` and `OrderDetailView.vue` are route composers; scenario logic lives in `useProfileViewModel.ts` and `useOrderDetailViewModel.ts`.
- Latest verification: `./node_modules/.bin/vitest run`, `./node_modules/.bin/vue-tsc`, and `./node_modules/.bin/vite build` passed.

## 2026-06-13 cabinet orders view-model follow-up
- `OrdersView.vue` is now a route composer: filter/search/pagination/open-order orchestration lives in `src/composables/useOrdersViewModel.ts`.
- Keep order list behavior changes covered in `tests/composables/useOrdersViewModel.spec.ts`; the view-level SSR test should stay focused on shell/empty-state rendering.
- Latest verification after this slice: `./node_modules/.bin/vitest run` passed (`38/38` files, `127/127` tests) and `./node_modules/.bin/vue-tsc --noEmit` passed.

## 2026-06-13 cabinet addresses view-model follow-up
- `AddressesView.vue` is now a route composer: modal/delete/default/save orchestration lives in `src/composables/useAddressesViewModel.ts`.
- Keep address screen behavior covered in `tests/composables/useAddressesViewModel.spec.ts`; `AddressFormModal` still owns field-level form orchestration and Dadata suggestion wiring.
- Latest verification after this slice: `./node_modules/.bin/vitest run` passed (`39/39` files, `131/131` tests) and `./node_modules/.bin/vue-tsc --noEmit` passed.

## 2026-06-13 cabinet route-composer follow-up
- `ReviewsView.vue`, `WishlistView.vue`, `SecurityView.vue`, and `BonusView.vue` now delegate scenario logic to `useReviewsViewModel.ts`, `useWishlistViewModel.ts`, `useSecurityViewModel.ts`, and `useBonusViewModel.ts`.
- `src/views` currently has no local `ref`/`computed`/`onMounted`/function orchestration matches from `rg`; keep it that way unless a view-only concern really belongs in the SFC.
- Behavior coverage lives in the matching `tests/composables/use*ViewModel.spec.ts` suites; view tests should stay shell/rendering oriented.

## 2026-06-13 npm verification follow-up
- В non-interactive shell `npm` поднимается через `source "$HOME/.nvm/nvm.sh"`; проверенная версия: Node `v22.17.0`, npm `11.4.2`.
- Свежая проверка через npm-скрипты:
  - `npm test` — passed (`43/43` test files, `141/141` tests).
  - `npm run build` — passed (`vue-tsc && vite build`).

## 2026-06-13 refactor.md wave (chat / API / view-model / CSS)
Проработан `cabinet/refactor.md` по рекомендованному порядку, по одному срезу за раз.

### Chat boundary
- Чистые хелперы вынесены в `src/features/chat/`: [session.ts](/home/sega/Documents/buton/cabinet/src/features/chat/session.ts) (`getSessionId(deps)`), [messages.ts](/home/sega/Documents/buton/cabinet/src/features/chat/messages.ts) (`normalizeIncomingMessage` + типы `ChatMessage/ChatAttachment`), [upload-response.ts](/home/sega/Documents/buton/cabinet/src/features/chat/upload-response.ts) (`readResponsePayload`).
- Реактивное состояние чата теперь в Pinia: [src/stores/chat.ts](/home/sega/Documents/buton/cabinet/src/stores/chat.ts). [useChat.ts](/home/sega/Documents/buton/cabinet/src/composables/useChat.ts) — runtime wrapper над store; socket/`socket.io-client` остаются implementation detail. Публичный API `useChat()` не менялся.
- MediaRecorder lifecycle вынесен в [chat/useVoiceRecorder.ts](/home/sega/Documents/buton/cabinet/src/composables/chat/useVoiceRecorder.ts); `useChatComposer.ts` — только text/files/submit/typing + делегирование записи.

### API facade split
- Shared axios-слой: [src/api/client.ts](/home/sega/Documents/buton/cabinet/src/api/client.ts) (`BASE/createClient/unwrap/http/pub`). Порядок создания клиентов (`http`→`pub`) важен для `tests/api.spec.ts`.
- Domain API по модулям: `src/api/{auth,profile,addresses,wishlist,orders,reviews,bonus,products}.ts`. [src/api/index.ts](/home/sega/Documents/buton/cabinet/src/api/index.ts) — тонкий barrel (`api` спредом + `SHOP_URL/assetUrl/normalizeOrder` + compatibility type-exports). Публичный `import { api, SHOP_URL, assetUrl } from '@/api'` сохранён.

### Testable view-model factories (DI pattern)
- `createX(deps)` core + тонкий `useX()` wrapper в одном файле: [useDashboardViewModel.ts](/home/sega/Documents/buton/cabinet/src/composables/useDashboardViewModel.ts), [useProfileViewModel.ts](/home/sega/Documents/buton/cabinet/src/composables/useProfileViewModel.ts), [useOrderDetailViewModel.ts](/home/sega/Documents/buton/cabinet/src/composables/useOrderDetailViewModel.ts).
- Чистые reactive-композаблы (`useCabinetTier/useCabinetOrders/useDashboardNextDelivery`) вызываются внутри core из инъектированных refs (без pinia/router).
- Wrapper'ы инъектят `user` как `computed(() => auth.user)` (НЕ `storeToRefs`), чтобы view-тесты с plain-mock auth работали.
- Profile-фабрика дополнительно чинит утечку blob-URL превью аватара (ревок при повторном выборе/ошибке/`dispose` на unmount).

### CSS slicing
- Вынесены доменные файлы: `features-dashboard.css` (из `features.css`), `features-auth.css` (auth был разбросан по `layout.css`/`features-account.css`/`responsive.css`), `features-chat.css` (из `features-account.css`). Порядок правил сохранён для каскада; импорты добавлены в `src/main.ts`.
- Намеренно оставлены на месте: `.btn--auth` в `components.css` (группа `.btn--*`), `.link-clay` в `layout.css`, легаси-`.dash-*`/`.greet`/`.bday-banner` (мёртвый CSS — отдельная задача).
- ⚠️ CSS-регрессии не ловятся `vitest`/`vue-tsc` — после CSS-срезов нужна ручная проверка desktop/mobile.

### DatePicker popover (Task 5.1)
- Open/close + outside-click + lifecycle listener вынесены в [useDatePickerPopover.ts](/home/sega/Documents/buton/cabinet/src/composables/useDatePickerPopover.ts); [AppDatePicker.vue](/home/sega/Documents/buton/cabinet/src/components/AppDatePicker.vue) берёт `{ open, rootRef, toggleOpen }` оттуда. Календарная математика остаётся в `useAppDatePickerCalendar`, scoped-стили `.adp*` оставлены в SFC (компонент не растёт — Task 5.2 не понадобился).

### Legacy type cleanup (Task 6) — завершён
- `IOrder*` алиасы удалены из `src/types/order.ts` и `src/types/api.ts` (consumer-кода на них уже не было). Новый код: нормализованные заказы — `CabinetOrder*`, сырые API DTO — `ApiOrder*`.
- `@/api` теперь **только runtime-facade**: `api`, `SHOP_URL`, `assetUrl`, `normalizeOrder`. Compatibility type-export блок убран — доменные типы берутся из `src/types/*`. `src/types/api.ts` остаётся barrel для остальных типов.

### refactor.md — все рекомендованные срезы выполнены
Срезы 1.1/1.2/1.4 (chat), 2.1+2.2 (API), 3.1–3.3 (view-model factories), 4.1–4.3 (CSS), 5.1 (datepicker), 6.1–6.3 (types). Опциональные 1.3 (connection factory) и 5.2 (вынос `.adp*` CSS) пропущены как несрочные.

### Verification (финальная, после всей волны)
- `./node_modules/.bin/vitest run` — `50/50` files, `202/202` tests passed.
- `./node_modules/.bin/vue-tsc --noEmit` — passed.
- `./node_modules/.bin/vite build` — passed.
- ⚠️ CSS-срезы (dashboard/auth/chat) требуют ручной проверки desktop/mobile — автотесты их не покрывают.
