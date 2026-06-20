# refactor.md — что ещё осталось рефакторить в `cabinet`

> **СТАТУС 2026-06-13: все рекомендованные срезы выполнены.** Сделано: 1.1/1.2/1.4 (chat → `features/chat/*` + `stores/chat.ts` + `useVoiceRecorder`), 2.1+2.2 (API client + domain modules), 3.1–3.3 (Dashboard/Profile/OrderDetail `createX(deps)` factories), 4.1–4.3 (CSS split: `features-dashboard/auth/chat.css`), 5.1 (`useDatePickerPopover`), 6.1–6.3 (удалены `IOrder*` алиасы и compatibility type-exports из `@/api`). Пропущены как несрочные/опциональные: 1.3 (connection factory), 5.2 (вынос `.adp*` CSS). Финальная проверка: `vitest 50/202`, `vue-tsc`, `vite build` — зелёные. Детали в `agent.md`. Документ ниже сохранён как историческая справка по плану.

> Снимок на 2026-06-13. `cabinet` уже прошёл основной route-view refactor: `src/views` стали container/shell-слоем, а сценарии вынесены в composables/stores/components. Этот документ — про оставшиеся хвосты: shared-state, API facade, legacy type boundary, CSS и несколько крупных UI/composable узлов.

## TL;DR приоритеты

1. **Chat boundary** — самый важный оставшийся архитектурный хвост: `useChat.ts` всё ещё держит module-level singleton state/socket/pending queue.
2. **API facade split** — `src/api/index.ts` ещё смешивает axios client, domain API, constants, asset helper и compatibility type exports.
3. **CSS slicing** — `features.css` уже большой глобальный файл (~1060 строк); нужно резать по доменам, не возвращая стили в SFC.
4. **Testable view-model factories** — крупные composables (`useDashboardViewModel`, `useProfileViewModel`, `useOrderDetailViewModel`, chat) лучше постепенно переводить на `createX(deps)` + тонкий runtime `useX()`.
5. **Legacy type cleanup** — `IOrder*`/compatibility aliases оставить как boundary, но новый код вести через `CabinetOrder*` и доменные `src/types/*`.

---

## 1. Текущее состояние

### Views

`src/views` сейчас суммарно ~890 строк. Локальной orchestration-логики во view почти нет: поиск по `ref/reactive/computed/watch/onMounted/function` в `src/views` ничего не находит, кроме template bindings и уже вынесенных composables.

| View | Строк | Состояние |
|------|------:|-----------|
| `DashboardView.vue` | 134 | composer: `useDashboardViewModel` + dashboard widgets |
| `OrderDetailView.vue` | 105 | composer: `useOrderDetailViewModel` + order-detail components |
| `OrdersView.vue` | 85 | composer: `useOrdersViewModel` + list/table/pagination |
| `AddressesView.vue` | 79 | composer: `useAddressesViewModel` + address components |
| `WishlistView.vue` | 76 | composer: `useWishlistViewModel` |
| `ProfileView.vue` | 73 | composer: `useProfileViewModel` + profile sections |
| `ResetPasswordView.vue` | 61 | composer: `usePasswordRecoveryFlow('reset')` |
| `RegisterView.vue` | 58 | composer: `useAuthEntryFlow('register')` |
| `ReviewsView.vue` | 53 | composer: `useReviewsViewModel` |
| `LoginView.vue` | 48 | composer: `useAuthEntryFlow('login')` |
| `ForgotPasswordView.vue` | 48 | composer: `usePasswordRecoveryFlow('forgot')` |
| `BonusView.vue` | 45 | composer: `useBonusViewModel` |
| `SecurityView.vue` | 25 | composer: `useSecurityViewModel` |

**Вывод:** новые refactor-срезы больше не начинать с views. Views трогать только если переносится разметка в widgets или меняется shell.

### Крупные TS/Vue файлы

| Файл | Строк | Что внутри / риск |
|------|------:|-------------------|
| `src/composables/useChat.ts` | 281 | socket lifecycle, singleton state, storage/session id, queue, upload, push sync |
| `src/constants/cabinetNavigation.ts` | 261 | navigation config + labels/icons/badges; нормально, не срочно |
| `src/api/index.ts` | 226 | axios clients, domain API, constants, type compatibility exports |
| `src/api/errors.ts` | 220 | error-message rules; длинный, но cohesive |
| `src/components/AppDatePicker.vue` | 217 | UI + outside click + popup style; calendar math уже вынесена |
| `src/composables/useChatComposer.ts` | 210 | text/files/voice recording/typing debounce/disposal |
| `src/composables/useProfileViewModel.ts` | 182 | profile form sync, avatar upload, notifications |
| `src/types/order.ts` | 173 | normalized order DTO + API DTO + compatibility aliases |
| `src/composables/useOrderDetailViewModel.ts` | 151 | detail flow, cancel/repeat/review |
| `src/composables/useDashboardViewModel.ts` | 150 | dashboard orchestration, router/window/navigator/API side effects |

### CSS

| CSS | Строк | Комментарий |
|-----|------:|-------------|
| `src/assets/features.css` | 1063 | основной кандидат на domain-split |
| `src/assets/features-account.css` | 519 | profile/bonus/security/account; можно резать позже |
| `src/assets/components.css` | 467 | primitives/shared components; держать только общие правила |
| `src/assets/layout.css` | 302 | app shell/sidebar/header/bottom nav |
| `src/assets/features-orders.css` | 182 | orders/detail-specific уже выделен |
| `src/assets/tokens.css` | 81 | tokens/reset/theme |
| `src/assets/responsive.css` | 8 | почти пустой |

### Проверки

Команды проекта:

```bash
cd cabinet
./node_modules/.bin/vitest run
./node_modules/.bin/vue-tsc --noEmit
./node_modules/.bin/vite build
```

В `cabinet/tests` сейчас 43 test-файла. Последняя памятка `cabinet/agent.md` фиксирует зелёные `vitest`, `vue-tsc --noEmit`, `vite build` после route-composer срезов.

---

## 2. Главный оставшийся срез: Chat boundary

### Проблема

`src/composables/useChat.ts` хранит состояние на module level:

- `messages`
- `chatId`
- `isOpen`
- `unread`
- `isConnected`
- `adminTyping`
- `isClosed`
- `lastError`
- `socket`
- `pendingMessages`
- `typingTimer`
- `memoryStorage`

Это работает, но противоречит текущему правилу `cabinet`: не плодить скрытые singleton-состояния вне Pinia/store boundary. При следующем изменении чата лучше не докручивать этот файл, а постепенно выносить границы.

### План среза

#### Task 1.1 — Pure helpers для chat session/message/upload

**Файлы:**

- Create: `src/features/chat/session.ts`
- Create: `src/features/chat/messages.ts`
- Create: `src/features/chat/upload-response.ts`
- Test: `tests/features/chat/session.spec.ts`
- Test: `tests/features/chat/messages.spec.ts`
- Test: `tests/features/chat/upload-response.spec.ts`
- Modify: `src/composables/useChat.ts`

**Что вынести:**

- `getSessionId` с инъекцией storage/random id:
  - вход: `{ getItem, setItem, randomId }`
  - выход: stable `chat_sid`
- `normalizeIncomingMessage`
- `readResponsePayload`

**Проверка:**

```bash
cd cabinet
./node_modules/.bin/vitest run tests/features/chat/session.spec.ts tests/features/chat/messages.spec.ts tests/features/chat/upload-response.spec.ts tests/composables/useChat.spec.ts
./node_modules/.bin/vue-tsc --noEmit
```

#### Task 1.2 — Pinia store для chat state

**Файлы:**

- Create: `src/stores/chat.ts`
- Test: `tests/stores/chat.spec.ts`
- Modify: `src/composables/useChat.ts`
- Keep public API: `useChat()` должен возвращать те же поля и методы, чтобы `ChatWidget.vue` не переписывать в этом срезе.

**Store ownership:**

- messages/chatId/open/unread/connection/typing/closed/error state
- mutations:
  - `openChat`
  - `closeChat`
  - `setReady`
  - `appendMessage`
  - `setConnected`
  - `setError`
  - `markClosed`
  - `clearUnread`
  - `resetChat`

**Важно:** socket object и dynamic import `socket.io-client` лучше оставить вне Pinia state, но reactive state должен жить в store. Если socket остаётся в composable, он должен быть implementation detail, а не источник UI-state.

**Проверка:**

```bash
cd cabinet
./node_modules/.bin/vitest run tests/stores/chat.spec.ts tests/composables/useChat.spec.ts tests/composables/useChatWidget.spec.ts
./node_modules/.bin/vue-tsc --noEmit
```

#### Task 1.3 — Connection client factory

**Файлы:**

- Create: `src/composables/chat/createChatConnection.ts`
- Test: `tests/composables/chat/createChatConnection.spec.ts`
- Modify: `src/composables/useChat.ts`

**Цель:** runtime-зависимости передавать явно:

- `loadSocketIo`
- `getSessionId`
- `getPushSubscription`
- `logger`
- `createSocketUrl`

`useChat.ts` после этого должен стать runtime wrapper: собирает deps, store и connection.

**Проверка:**

```bash
cd cabinet
./node_modules/.bin/vitest run tests/composables/chat/createChatConnection.spec.ts tests/composables/useChat.spec.ts
./node_modules/.bin/vue-tsc --noEmit
```

#### Task 1.4 — Voice recorder split

**Файлы:**

- Create: `src/composables/chat/useVoiceRecorder.ts`
- Test: `tests/composables/chat/useVoiceRecorder.spec.ts`
- Modify: `src/composables/useChatComposer.ts`

**Цель:** `useChatComposer.ts` оставить про text/files/submit/typing debounce, а MediaRecorder lifecycle вынести отдельно.

**Риск:** `MediaRecorder`, `navigator.mediaDevices`, `URL.createObjectURL`, `onUnmounted` требуют аккуратного тестового окружения. Сначала покрыть:

- start recording
- stop recording creates `File`
- disposal stops tracks
- denied microphone maps to readable error

---

## 3. API facade split

### Проблема

`src/api/index.ts` сейчас одновременно:

- создаёт axios clients;
- нормализует ошибки через interceptor;
- экспортирует `SHOP_URL` и `assetUrl`;
- содержит все domain API groups;
- держит compatibility type exports.

Файл не огромный, но стал точкой смешения responsibilities. Следующий рост API лучше делать уже через доменные модули.

### План среза

#### Task 2.1 — Shared client module

**Файлы:**

- Create: `src/api/client.ts`
- Modify: `src/api/index.ts`
- Test: `tests/api.spec.ts`

**Вынести:**

- `BASE`
- `createClient`
- `unwrap`
- `logApiError`
- `http`
- `pub`

**Сохранить публичный API:** `import { api, SHOP_URL, assetUrl } from '@/api'` должен продолжать работать.

#### Task 2.2 — Domain API modules

**Файлы:**

- Create: `src/api/auth.ts`
- Create: `src/api/profile.ts`
- Create: `src/api/addresses.ts`
- Create: `src/api/wishlist.ts`
- Create: `src/api/orders.ts`
- Create: `src/api/reviews.ts`
- Create: `src/api/bonus.ts`
- Create: `src/api/products.ts`
- Modify: `src/api/index.ts`
- Test: `tests/api.spec.ts`

**Правило:** `index.ts` только собирает:

```ts
export const api = {
  ...authApi,
  ...profileApi,
  ...addressApi,
  ...wishlistApi,
  ...orderApi,
  ...reviewApi,
  ...bonusApi,
  ...publicApi,
}
```

#### Task 2.3 — Compatibility type exports cleanup

**Файлы:**

- Modify: `src/api/index.ts`
- Modify: `src/types/api.ts`
- Possible tests: `tests/api.spec.ts`, typecheck

**Порядок:**

1. Проверить `rg "import type .*@/api|from '@/api'" src tests`.
2. Если типы из `@/api` больше не используются, убрать compatibility type exports из `src/api/index.ts`.
3. `src/types/api.ts` оставить как barrel, но новый код должен импортировать из доменных `src/types/*`.
4. `IOrder*` aliases в `src/types/order.ts` удалять только после отдельного прохода по всем imports.

**Проверка:**

```bash
cd cabinet
rg "import type .*@/api|from '@/api'" src tests
./node_modules/.bin/vue-tsc --noEmit
./node_modules/.bin/vitest run tests/api.spec.ts
```

---

## 4. Testable view-model factories

### Проблема

Многие composables уже покрыты тестами, но часть runtime-зависимостей захардкожена внутри:

- `useDashboardViewModel.ts`: `api`, `router`, `window.open`, `navigator.clipboard`, toast, auth store.
- `useProfileViewModel.ts`: `api`, `assetUrl`, toast, auth store, `URL.createObjectURL`.
- `useOrderDetailViewModel.ts`: `api`, router/route, repeat bridge, toast.

Тесты сейчас работают через module mocks, но следующий стабильный паттерн лучше сделать как в admin: `createX(deps)` + thin `useX()` wrapper.

### План среза

#### Task 3.1 — Dashboard factory

**Файлы:**

- Modify: `src/composables/useDashboardViewModel.ts`
- Test: `tests/composables/useDashboardViewModel.spec.ts`

**Сделать:**

- Export `createDashboardViewModel(deps)`.
- `useDashboardViewModel()` только собирает реальные deps и вызывает factory.
- В deps передать:
  - auth user ref/getter
  - orders resource
  - promo/recommendation loaders
  - duplicateOrder
  - repeatOrder
  - navigate
  - openExternal
  - copyText
  - showToast

**Проверка:**

```bash
cd cabinet
./node_modules/.bin/vitest run tests/composables/useDashboardViewModel.spec.ts tests/views/dashboard.view.spec.ts
./node_modules/.bin/vue-tsc --noEmit
```

#### Task 3.2 — Profile factory

**Файлы:**

- Modify: `src/composables/useProfileViewModel.ts`
- Test: `tests/composables/useProfileViewModel.spec.ts`

**Сделать:**

- Export `createProfileViewModel(deps)`.
- В deps передать:
  - user ref/getter
  - updateUser
  - updateProfile
  - uploadAvatar
  - assetUrl
  - createObjectUrl/revokeObjectUrl
  - showToast

**Дополнительно:** проверить, что object URL старого preview не течёт при повторном выборе/ошибке/unmount, если это сейчас не покрыто.

#### Task 3.3 — Order detail factory

**Файлы:**

- Modify: `src/composables/useOrderDetailViewModel.ts`
- Test: `tests/composables/useOrderDetailViewModel.spec.ts`

**Сделать:**

- Export `createOrderDetailViewModel(deps)`.
- Отвязать core от `useRoute/useRouter` через deps:
  - `orderId`
  - `navigate`
  - `cancelOrder`
  - `createReview`
  - `repeatOrder`
  - `ordersResource`
  - `showToast`

---

## 5. CSS slicing

### Проблема

Глобальный CSS уже лучше прежнего, но `features.css` снова стал универсальным складом. CSS-регрессии `vitest/vue-tsc` не ловят, поэтому срезы должны быть маленькими.

### План среза

#### Task 4.1 — Dashboard CSS

**Файлы:**

- Create: `src/assets/features-dashboard.css`
- Modify: `src/assets/features.css`
- Modify: `src/main.ts`

**Перенести:** `.dashboard-*`, `.dash-*`, dashboard recommendation/promo/recent-orders/loyalty/action card правила.

**Проверка:**

```bash
cd cabinet
./node_modules/.bin/vue-tsc --noEmit
./node_modules/.bin/vite build
```

**Ручная проверка:** `/dashboard` desktop/mobile, light/dark если включается тема.

#### Task 4.2 — Auth CSS

**Файлы:**

- Create: `src/assets/features-auth.css`
- Modify: `src/assets/features.css`
- Modify: `src/main.ts`

**Перенести:** `.auth-*`, recovery blocks, auth bloom/card/form/fineprint rules.

**Ручная проверка:** `/login`, `/register`, `/forgot-password`, `/reset-password?...` mobile/desktop.

#### Task 4.3 — Chat CSS

**Файлы:**

- Create: `src/assets/features-chat.css`
- Modify: `src/assets/features.css`
- Modify: `src/main.ts`

**Перенести:** `.chat-*`, `.chat-box*`, composer/offline/messages attachment/audio/image rules.

**Ручная проверка:** widget closed/open, unread badge, offline form, upload preview, mobile.

#### Task 4.4 — Account CSS

**Файлы:**

- Optional create: `src/assets/features-profile.css`
- Optional create: `src/assets/features-bonus.css`
- Modify: `src/assets/features-account.css`
- Modify: `src/main.ts`

**Правило:** не дробить ради дробления. Если `features-account.css` остаётся читаемым, оставить. Если добавляется новый account UI — сначала вынести соответствующий доменный CSS.

---

## 6. AppDatePicker shell

### Состояние

Calendar math уже в `src/composables/useAppDatePickerCalendar.ts`, тесты есть. В `AppDatePicker.vue` остались:

- open/close state;
- outside click listener;
- display value;
- popup template;
- scoped styles.

### План среза

#### Task 5.1 — Popover composable

**Файлы:**

- Create: `src/composables/useDatePickerPopover.ts`
- Test: `tests/composables/useDatePickerPopover.spec.ts`
- Modify: `src/components/AppDatePicker.vue`

**Вынести:**

- `open`
- `rootRef`
- `toggleOpen`
- `close`
- `onDocClick`
- lifecycle listener registration

**Проверка:**

```bash
cd cabinet
./node_modules/.bin/vitest run tests/composables/useDatePickerPopover.spec.ts tests/composables/useAppDatePickerCalendar.spec.ts
./node_modules/.bin/vue-tsc --noEmit
```

#### Task 5.2 — Style decision

Если `AppDatePicker.vue` продолжит расти, перенести `.adp*` стили в `components.css` или новый `components-date-picker.css`. Если не растёт — scoped style можно оставить, потому что компонент самодостаточный.

---

## 7. Legacy type cleanup

### Что transitional

- `src/types/user.ts` — barrel поверх user contracts.
- `src/types/api.ts` — compatibility barrel.
- `src/types/order.ts` — `IOrder*` aliases поверх `CabinetOrder*`.
- `src/api/index.ts` — compatibility type exports.

### План среза

#### Task 6.1 — Order aliases migration

**Файлы:**

- Modify import sites from `IOrder*` to `CabinetOrder*`.
- Likely targets:
  - tests and components using `IOrder`
  - any order UI still importing compatibility aliases

**Command to drive the slice:**

```bash
cd cabinet
rg "IOrder|IOrderItem|IOrderDelivery|IOrderRecipient|IOrderStatusHistoryEntry" src tests
```

**Правило:** менять только type names, не менять runtime DTO shape.

#### Task 6.2 — API type export removal

Удалять compatibility exports from `src/api/index.ts` только когда:

```bash
cd cabinet
rg "import type .*@/api|from '@/api'" src tests
```

показывает, что `@/api` используется только для runtime `api`, `SHOP_URL`, `assetUrl`.

#### Task 6.3 — Naming policy

Новый код:

- normalized orders: `CabinetOrder*`
- API raw DTOs: `ApiOrder*`
- user/profile/auth: `src/types/user-profile-auth.ts`
- addresses: `src/types/user-address.ts`
- notifications: `src/types/user-notifications.ts`
- wishlist: `src/types/wishlist.ts`
- reviews/products/bonus: доменные файлы, не `types/api.ts`

---

## 8. Components cleanup backlog

Не срочно, но хорошие маленькие срезы:

| Компонент | Что сделать |
|-----------|-------------|
| `ChatMessages.vue` | вынести `isImage/isAudio/formatTime` в `src/features/chat/message-format.ts` + тест |
| `BonusHistoryFaqSection.vue` | если будет расти, вынести `txnFilter/openFaq/faqs/cashbackSummary` в `useBonusHistoryFaq.ts` |
| `ProfileAvatarCard.vue` | оставить local file input state; переносить только если появится crop/upload preview logic |
| `DashboardRecentOrdersSection.vue` | вынести inline `order.items.map(...).join(', ')` в `components/orders/orderPreviewMeta.ts`, если появятся ещё card previews |
| `PasswordField.vue` | оставить local `visible`; это UI-only state |
| `CabReferralCard.vue` | оставить copy action здесь, если используется как self-contained widget |

---

## 9. Как продолжать

1. Один refactor-срез за заход.
2. Сначала тест на новое pure/composable поведение, потом перенос.
3. Public API компонента/composable не ломать без отдельного среза.
4. После каждого среза:

```bash
cd cabinet
./node_modules/.bin/vitest run
./node_modules/.bin/vue-tsc --noEmit
./node_modules/.bin/vite build
```

5. Для CSS-срезов обязательно ручная проверка desktop/mobile. Автотесты CSS-регрессии не поймают.
6. Не трогать `admin` параллельно с cabinet-срезом: там может работать отдельный агент.
7. `api` остаётся источником истины. В `cabinet` только нормализация client DTO и UX-состояния.

## Рекомендуемый порядок

1. `useChat.ts` pure helpers (`features/chat/*`) + tests.
2. `src/stores/chat.ts` и compatibility wrapper `useChat()`.
3. `useChatComposer.ts` voice recorder split.
4. `src/api/client.ts` + domain API modules.
5. `useDashboardViewModel` / `useProfileViewModel` / `useOrderDetailViewModel` factories.
6. CSS split: dashboard → auth → chat.
7. AppDatePicker popover composable.
8. Legacy type cleanup.
