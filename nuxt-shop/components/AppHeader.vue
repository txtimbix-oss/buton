<template>
  <header class="header" :class="{ 'is-stuck': isStuck }">
    <!-- ===== РЯД 1 ===== -->
    <div class="bwide hbar">
      <!-- бургер (мобиль) -->
      <button class="hburger" aria-label="Меню" @click="menuOpen = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>

      <!-- логотип -->
      <NuxtLink to="/" class="hlogo">
        <span class="hlogo__ic">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8"/></svg>
        </span>
        <span class="hlogo__txt">Бутон<b>.</b></span>
      </NuxtLink>

      <!-- кнопка «Каталог» -->
      <NuxtLink to="/catalog" class="hcat-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        Каталог
      </NuxtLink>

      <!-- поиск -->
      <form class="hsearch" @submit.prevent="goSearch">
        <input v-model="searchQ" class="hsearch__inp" :placeholder="settings.searchPlaceholder || 'Найти букеты и подарки'" />
        <button class="hsearch__btn" type="submit" aria-label="Найти">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
      </form>

      <!-- город / доставка -->
      <NuxtLink to="/delivery" class="hloc">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>
        <span class="hloc__city">Санкт-Петербург</span>
        <span class="hloc__div"></span>
        <span class="hloc__time">Как можно скорее</span>
      </NuxtLink>

      <!-- валюта -->
      <button class="hcur" type="button" aria-label="Валюта">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21M12 3C9.5 5.4 8.2 8.6 8.2 12S9.5 18.6 12 21"/></svg>
        RUB
      </button>

      <!-- иконки -->
      <div class="hicons">
        <!-- поиск (только мобиль): открывает оверлей-поиск -->
        <button class="hicon hicon--search" type="button" title="Поиск" aria-label="Поиск" @click="openSearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
        <NuxtLink to="/wishlist" class="hicon hicon--wish" title="Избранное">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
          <span v-if="wishCount > 0" class="dot" />
        </NuxtLink>
        <NuxtLink :to="userLink" class="hicon hicon--user" :title="shopUser ? shopUser.firstName : 'Личный кабинет'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>
        </NuxtLink>
        <button class="hicon" :class="{ 'cart-bump': cartBump }" title="Корзина" @click="cartDrawer.open">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </button>
      </div>
    </div>

    <!-- ===== РЯД 2: категории ===== -->
    <div class="hcats-wrap">
      <div class="bwide hcats-inner">
        <div class="hcats">
          <NuxtLink
            v-for="c in cats"
            :key="c.label"
            :to="c.to"
            class="hcat"
            :class="{ 'is-active': catActive(c) }"
          >
            {{ c.label }}
            <svg v-if="c.caret" class="hcat__car" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Левый drawer: мобильное меню -->
    <Teleport to="body">
      <Transition name="overlay-fade">
        <div v-if="menuOpen" class="overlay is-open" @click="menuOpen = false" />
      </Transition>
      <Transition name="drawer-left">
        <aside v-if="menuOpen" class="drawer drawer--left is-open">
      <div class="drawer__body">
        <div class="menu__list">
          <NuxtLink v-for="link in mainNav" :key="`m-${link.to}`" :to="link.to" @click="menuOpen = false">
            {{ link.label }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </NuxtLink>
          <NuxtLink to="/wishlist"     @click="menuOpen = false">Избранное <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></NuxtLink>
          <NuxtLink :to="userLink"     @click="menuOpen = false">Личный кабинет <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></NuxtLink>
        </div>
            <div class="menu__contact">
              <a :href="`tel:${settings.contactPhone}`">{{ settings.contactPhone }}</a>
              <a v-if="settings.socialTg" :href="settings.socialTg" target="_blank" rel="noopener">Telegram · @spbshop</a>
            </div>
          </div>
          <div class="drawer__foot">
            <NuxtLink to="/cart" class="btn btn--ink btn--block" @click="menuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="18" height="18"><path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>
              Корзина
              <span v-if="cartCount > 0" class="tag tag--clay tag--xs">{{ cartCount }}</span>
            </NuxtLink>
            <div class="drawer-contacts">
              <div>{{ settings.contactPhone }}</div>
              <div class="drawer-contacts__hours">{{ settings.contactHours }}</div>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Поиск оверлей (мобиль / запасной) -->
    <Teleport to="body">
      <Transition name="overlay-fade">
        <div v-if="showSearch" class="search-overlay" @click.self="closeSearch">
          <div class="search-wrap">
            <div class="search-box">
              <svg class="header__search-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="20" height="20"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                ref="searchInputEl"
                v-model="searchQ"
                class="search-box__input"
                :placeholder="settings.searchPlaceholder"
                @keydown.enter="goSearch"
                @keydown.escape="closeSearch"
              />
              <button v-if="searchQ" class="xbtn header__search-clear" @click="searchQ = ''">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" width="16" height="16"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div v-if="searchQ.length < 2" class="search-hints">
              <span class="eyebrow">Популярные запросы</span>
              <div class="search-hints__tags">
                <button
                  v-for="hint in hints" :key="hint"
                  class="tag tag--blush search-hint-btn"
                  @click="searchQ = hint; goSearch()"
                >{{ hint }}</button>
              </div>
            </div>
            <div v-else class="search-tip">
              Нажмите Enter чтобы найти «{{ searchQ }}» в каталоге
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { mainNav } from '~/constants/shopNav'

const router     = useRouter()
const { cartCount } = useCart()
const { count: wishCount } = useWishlist()
const settings   = useSettings()
const { user: shopUser } = useShopUser()
const cartDrawer = useCartDrawer()

// Профиль — внутренняя страница сайта /account (она же показывает вход для гостя).
// Раньше кнопка вела на отдельный поддомен кабинета.
const userLink = '/account'

const searchInputEl = ref<HTMLInputElement | null>(null)
const hints = computed(() => settings.value.search.hints)

/* категории второго ряда */
const cats = [
  { label: 'Тренды', to: '/catalog?quick=hit' },
  { label: 'Скидки', to: '/catalog?sale=1' },
  { label: 'Монобукеты', to: '/catalog?coll=mono' },
  { label: 'В коробке', to: '/catalog?coll=box' },
  { label: 'Авторские', to: '/catalog?coll=author' },
  { label: 'Свадебные', to: '/catalog?coll=wed' },
  { label: 'Подписка', to: '/subscription' },
  { label: 'Праздники', to: '/holiday' },
  { label: 'Подарочные сертификаты', to: '/gift-cards' },
  { label: 'Доставка', to: '/delivery' },
]

/* какая вкладка открыта сейчас — сверяем path + query с `to` каждой вкладки */
const route = useRoute()
function catActive(c: { to: string; caret?: boolean }) {
  if (c.caret) return false                       // «Праздники» — это дропдаун, не подсвечиваем
  const [path, qs] = c.to.split('?')
  if (route.path !== path) return false
  if (!qs) return path !== '/catalog'             // путь-вкладки (подписка/сертификаты/доставка); голый /catalog не активен
  const params = new URLSearchParams(qs)
  for (const [k, v] of params) {
    if (String(route.query[k] ?? '') !== v) return false
  }
  return true
}

const {
  menuOpen,
  showSearch,
  searchQ,
  cartBump,
  isStuck,
  openSearch,
  closeSearch,
  goSearch,
} = useHeaderUiState({
  cartCount,
  navigate: (path) => router.push(path),
  focusSearch: () => searchInputEl.value?.focus(),
})
</script>

<style scoped>
/* ====== РЯД 1 ====== */
.hbar {
  display: flex; align-items: center; gap: 14px;
  height: 68px;
}
.hburger {
  display: none; width: 42px; height: 42px; border-radius: 11px;
  align-items: center; justify-content: center;
  color: var(--ink); background: none; border: none; cursor: pointer; flex: none;
}
.hburger svg { width: 24px; height: 24px; }

.hlogo {
  display: inline-flex; align-items: center; gap: 8px; flex: none;
  font-family: var(--serif); font-size: 26px; font-weight: 700;
  letter-spacing: -.02em; color: var(--ink); text-decoration: none;
}
.hlogo b { color: var(--clay); }
.hlogo__ic { display: inline-flex; color: var(--clay); }
.hlogo__ic svg { width: 24px; height: 24px; }

.hcat-btn {
  display: inline-flex; align-items: center; gap: 9px; flex: none;
  height: 48px; padding: 0 20px; border-radius: 13px;
  background: var(--green); color: #fff; font-weight: 600; font-size: 15px;
  text-decoration: none; transition: background .15s, transform .12s;
}
.hcat-btn:hover { background: var(--green-2, #3b5a45); }
.hcat-btn:active { transform: scale(.98); }
.hcat-btn svg { width: 18px; height: 18px; }

.hsearch {
  flex: 1 1 auto; min-width: 120px; max-width: 560px;
  display: flex; align-items: center; height: 48px;
  background: var(--white); border: 1.5px solid var(--line); border-radius: 13px;
  padding: 0 6px 0 16px; transition: border-color .15s, box-shadow .15s;
}
.hsearch:focus-within {
  border-color: var(--green);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--green) 14%, transparent);
}
.hsearch__inp {
  flex: 1; border: none; background: none; outline: none;
  font-family: var(--sans); font-size: 15px; color: var(--ink);
}
.hsearch__inp::placeholder { color: var(--muted); }
.hsearch__btn {
  width: 38px; height: 38px; border-radius: 10px; flex: none;
  display: grid; place-items: center; border: none; background: none;
  color: var(--muted); cursor: pointer; transition: color .14s;
}
.hsearch__btn:hover { color: var(--green); }
.hsearch__btn svg { width: 20px; height: 20px; }

.hloc {
  display: inline-flex; align-items: center; gap: 9px; flex: none;
  height: 48px; padding: 0 15px; border-radius: 13px;
  border: 1.5px solid var(--line); background: var(--white);
  color: var(--ink); text-decoration: none; transition: border-color .15s;
}
.hloc:hover { border-color: var(--sand); }
.hloc > svg { width: 18px; height: 18px; color: var(--clay); flex: none; }
.hloc__city { font-size: 14px; font-weight: 600; white-space: nowrap; }
.hloc__div { width: 1px; height: 20px; background: var(--line); }
.hloc__time { font-size: 13px; color: var(--muted); white-space: nowrap; }

.hcur {
  display: inline-flex; align-items: center; gap: 7px; flex: none;
  height: 48px; padding: 0 10px; border: none; background: none;
  color: var(--ink); font-weight: 600; font-size: 14px;
  cursor: pointer; font-family: inherit;
}
.hcur svg { width: 18px; height: 18px; color: var(--muted); }

.hicons { display: flex; align-items: center; gap: 2px; flex: none; }
.hicon {
  position: relative; width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center; color: var(--ink);
  background: none; border: none; cursor: pointer; text-decoration: none;
  transition: background .14s, color .14s;
}
.hicon:hover { background: var(--paper-2); color: var(--green); }
.hicon svg { width: 23px; height: 23px; }
.hicon .badge {
  position: absolute; top: 5px; right: 5px;
  min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px;
  background: var(--clay); color: #fff; font-size: 11px; font-weight: 700;
  display: grid; place-items: center; line-height: 1;
}
.hicon .dot {
  position: absolute; top: 9px; right: 10px;
  width: 7px; height: 7px; border-radius: 50%; background: var(--clay);
}
/* поиск-иконка только на мобиле (показывается в медиазапросе ≤520) — правило ПОСЛЕ .hicon, чтобы перебить display:grid */
.hicon--search { display: none; }

/* ====== РЯД 2: категории ====== */
.hcats-wrap {
  position: relative;
  border-top: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
}
.hcats-inner { position: relative; }
.hcats {
  display: flex; align-items: center; gap: clamp(16px, 1.8vw, 28px);
  height: 50px; overflow-x: auto; scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.hcats::-webkit-scrollbar { display: none; }
.hcat {
  position: relative;
  display: inline-flex; align-items: center; gap: 4px; flex: none;
  height: 50px;
  font-size: 14px; font-weight: 500; color: var(--ink);
  white-space: nowrap; text-decoration: none; transition: color .14s;
}
/* индикатор активной/наведённой вкладки — полоска снизу */
.hcat::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0;
  height: 2.5px; border-radius: 2px 2px 0 0; background: var(--green);
  transform: scaleX(0); opacity: 0;
  transition: transform .18s cubic-bezier(.22, 1, .36, 1), opacity .18s;
}
.hcat:hover { color: var(--green); }
.hcat:hover::after { transform: scaleX(1); opacity: .4; }
.hcat.is-active { color: var(--green); font-weight: 700; }
.hcat.is-active::after { transform: scaleX(1); opacity: 1; }
.hcat__car { width: 14px; height: 14px; opacity: .6; }

/* ====== адаптив ====== */
@media (max-width: 1100px) {
  .hburger { display: inline-flex; }
  .hloc, .hcur { display: none; }
  .hbar { gap: 10px; height: 62px; }
}
@media (max-width: 760px) {
  .hcat-btn { padding: 0 13px; }
  .hcat-btn span, .hcat-btn { font-size: 14px; }
  .hlogo { font-size: 21px; }
  .hlogo__ic svg { width: 20px; height: 20px; }
  .hsearch { max-width: none; height: 44px; }
  .hicon { width: 40px; height: 40px; }
  .hcats { height: 46px; }
}
@media (max-width: 520px) {
  .hbar { gap: 8px; }
  .hcat-btn { display: none; }                 /* «Каталог» — в бургер-меню и нижней навигации */
  .hsearch { display: none; }                  /* инлайн-поиск прячем — вместо него иконка 🔍 */
  .hicons { margin-left: auto; }               /* прижимаем иконки вправо (поиск больше не растягивает шапку) */
  .hicon--wish, .hicon--user { display: none; }   /* избранное и кабинет — в нижней навигации */
  .hicon--search { display: grid; }            /* показываем иконку поиска (открывает оверлей) */
  .hicon { width: 38px; height: 38px; }
}

/* bump-анимация на корзине */
.cart-bump { animation: bump .4s ease; }
@keyframes bump {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.18); }
  70%  { transform: scale(.94); }
  100% { transform: scale(1); }
}

/* overlay + drawer transitions */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity .28s; }
.overlay-fade-enter-from,   .overlay-fade-leave-to     { opacity: 0; }
.drawer-left-enter-active { transition: transform .34s cubic-bezier(.22,1,.36,1); }
.drawer-left-leave-active { transition: transform .26s ease-in; }
.drawer-left-enter-from,
.drawer-left-leave-to     { transform: translateX(-101%); }

/* поиск-оверлей */
.search-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(20,28,22,.5); backdrop-filter: blur(4px);
  display: flex; align-items: flex-start; justify-content: center;
  padding: clamp(76px, 12vw, 100px) 14px 18px; overflow-y: auto;
}
.search-wrap {
  width: min(640px, 92vw); background: var(--white);
  border-radius: var(--r-md); padding: 24px; box-shadow: var(--sh-pop);
  max-height: calc(100dvh - 28px); overflow-y: auto;
}
.header__search-box-icon { flex: none; color: var(--muted); }
.header__search-clear { width: 32px; height: 32px; }
.search-box {
  display: flex; align-items: center; gap: 12px;
  border-bottom: 2px solid var(--green); padding-bottom: 12px; margin-bottom: 20px;
}
.search-box__input {
  flex: 1; background: none; border: none; outline: none;
  font-family: var(--sans); font-size: 20px; color: var(--ink);
}
.search-box__input::placeholder { color: var(--muted); }
@media (max-width: 699px) {
  .search-wrap { width: min(100%, 560px); padding: 18px; }
  .search-box__input { font-size: 18px; }
}
</style>
