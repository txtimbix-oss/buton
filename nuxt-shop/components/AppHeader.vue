<template>
  <!-- обёртка topbar + header удалена: topbar рендерится отдельным AppTopBar в каждой странице -->
  <header class="header" :class="{ 'is-stuck': isStuck }">
    <div class="container header__row">
      <!-- бургер (мобиль) -->
      <button class="iconbtn header__burger" aria-label="Меню" @click="menuOpen = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>

      <!-- логотип: центр на мобиле, лево на десктопе -->
      <NuxtLink to="/" class="header__logo">{{ settings.storeName }}<b>.</b></NuxtLink>

      <!-- десктопная навигация -->
      <nav class="header__nav">
        <NuxtLink v-for="link in desktopNav" :key="link.to" :to="link.to">
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- иконки-действия -->
      <div class="header__actions">
        <button class="iconbtn" title="Поиск" @click="openSearch">
            <svg class="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
        <NuxtLink to="/wishlist" class="iconbtn" title="Избранное">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
          <span v-if="wishCount > 0" class="dot" />
        </NuxtLink>
        <a :href="userLink" class="iconbtn header__account" :title="shopUser ? shopUser.firstName : 'Личный кабинет'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>
        </a>
        <!-- корзина: открывает drawer -->
        <button class="iconbtn" :class="{ 'cart-bump': cartBump }" title="Корзина" @click="cartDrawer.open">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </button>
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
          <a :href="userLink"          @click="menuOpen = false">Личный кабинет <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></a>
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

    <!-- Поиск оверлей -->
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
import { desktopNav, mainNav } from '~/constants/shopNav'

const router     = useRouter()
const { cartCount } = useCart()
const { count: wishCount } = useWishlist()
const settings   = useSettings()
const { user: shopUser } = useShopUser()
const { public: { cabinetUrl } } = useRuntimeConfig()
const cartDrawer = useCartDrawer()

const userLink = computed(() =>
  shopUser.value ? `${cabinetUrl}/dashboard` : `${cabinetUrl}/login?redirect=/dashboard`
)

const searchInputEl = ref<HTMLInputElement | null>(null)

const hints = computed(() => settings.value.search.hints)

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
/* bump-анимация на корзине */
.cart-bump {
  animation: bump .4s ease;
}
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

/* поиск */
.search-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(20,28,22,.5); backdrop-filter: blur(4px);
  display: flex; align-items: flex-start; justify-content: center;
  padding: clamp(76px, 12vw, 100px) 14px 18px;
  overflow-y: auto;
}
.search-wrap {
  width: min(640px, 92vw); background: var(--white);
  border-radius: var(--r-md); padding: 24px;
  box-shadow: var(--sh-pop);
  max-height: calc(100dvh - 28px);
  overflow-y: auto;
}
.header__search-icon { flex: none; color: var(--muted); }
.header__search-box-icon { flex: none; color: var(--muted); }
.header__search-clear { width: 32px; height: 32px; }
.header__account { display: none; }
.search-box {
  display: flex; align-items: center; gap: 12px;
  border-bottom: 2px solid var(--green);
  padding-bottom: 12px; margin-bottom: 20px;
}
.search-box__input {
  flex: 1; background: none; border: none; outline: none;
  font-family: var(--sans); font-size: 20px; color: var(--ink);
}
.search-box__input::placeholder { color: var(--muted); }
.search-hints { }

@media (min-width: 480px) {
  .header__account { display: inline-flex; }
}

@media (min-width: 700px) and (max-width: 1100px) {
  .header__account { display: none; }
}

@media (max-width: 699px) {
  .search-wrap {
    width: min(100%, 560px);
    padding: 18px;
  }
  .search-box__input { font-size: 18px; }
}

@media (min-width: 1101px) {
  .header__account { display: inline-flex; }
}
</style>
