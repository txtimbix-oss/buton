<template>
  <div class="wrap">
    <div class="crumbs">
      <NuxtLink to="/">Главная</NuxtLink><span class="sep">/</span><span>Личный кабинет</span>
    </div>

    <!-- НЕ АВТОРИЗОВАН -->
    <div v-if="ready && !user" class="acc-guest">
      <div class="acc-guest__ic">🌿</div>
      <h1 class="serif">Войдите в личный кабинет</h1>
      <p>Заказы, бонусы, достижения и персональные предложения — в одном месте.</p>
      <div class="acc-guest__btns">
        <a class="btn-primary" :href="loginUrl">Войти</a>
        <a class="ghost-btn" :href="registerUrl">Создать аккаунт</a>
      </div>
    </div>

    <!-- ЗАГРУЗКА -->
    <div v-else-if="!ready" class="acc-skel">
      <div class="acc-skel__banner" />
      <div class="acc-skel__row" />
    </div>

    <!-- КАБИНЕТ -->
    <div v-else class="acc">
      <!-- LEFT NAV -->
      <aside class="acc-nav">
        <button :class="['acc-nav__i', { on: tab === 'profile' }]" @click="go('profile')"><span>👤</span> Профиль</button>
        <button :class="['acc-nav__i', { on: tab === 'orders' }]" @click="go('orders')"><span>📦</span> Мои заказы</button>
        <button :class="['acc-nav__i', { on: tab === 'bonus' }]" @click="go('bonus')"><span>🎁</span> Бонусы и клуб</button>
        <button :class="['acc-nav__i', { on: tab === 'wishlist' }]" @click="go('wishlist')"><span>♡</span> Избранное</button>
        <div class="acc-nav__sep" />
        <button class="acc-nav__i acc-nav__exit" @click="logout"><span>↪</span> Выйти</button>
      </aside>

      <!-- MAIN -->
      <main class="acc-main">
        <!-- BANNER (всегда) -->
        <section class="pf-banner">
          <div class="pf-ava">
            <img v-if="avatarSrc" :src="avatarSrc" alt="" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="pf-info">
            <div class="pf-name">{{ fullName }} <span class="pf-vip">{{ currentLevel.name }}</span></div>
            <div v-if="sinceText" class="pf-since">{{ sinceText }}</div>
          </div>
          <div class="pf-bonus">
            <div class="pf-bonus-v">{{ fmt(user.bonusBalance) }}</div>
            <div class="pf-bonus-l">бонусов на счету</div>
            <div class="pf-bonus-c">{{ currentLevel.name }} · кэшбэк {{ currentLevel.cashback }}%</div>
          </div>
        </section>

        <!-- ===== TAB: ПРОФИЛЬ ===== -->
        <template v-if="tab === 'profile'">
          <section v-if="nextLevel" class="pf-level">
            <div class="pf-level-t">
              <span><b>{{ currentLevel.name }}</b> → <span class="clay">{{ nextLevel.name }}</span></span>
              <span>{{ fmt(totalSpent) }} / {{ fmt(nextLevel.min) }} ₽</span>
            </div>
            <div class="pf-track"><div class="pf-fill" :style="{ width: progressPct + '%' }" /></div>
            <div class="pf-level-h">До уровня «{{ nextLevel.name }}» и кэшбэка {{ nextLevel.cashback }}% осталось заказов на <b>{{ fmt(remainingToNext) }} ₽</b>.</div>
          </section>

          <div class="pf-two">
            <section class="pf-card">
              <h3>Личные данные</h3>
              <form @submit.prevent="save">
                <div class="pf-fld"><label>Имя <span class="req">*</span></label><input class="pf-inp" v-model="form.firstName" required /></div>
                <div class="pf-fld"><label>Фамилия <span class="req">*</span></label><input class="pf-inp" v-model="form.lastName" required /></div>
                <div class="pf-fld"><label>Телефон</label><input class="pf-inp" v-model="form.phone" inputmode="tel" placeholder="+7 999 000-00-00" /></div>
                <div class="pf-fld"><label>Email</label><input class="pf-inp" :value="user.email" disabled /><div class="pf-hint">Email изменить нельзя — обратитесь в поддержку</div></div>
                <div v-if="saveOk" class="pf-ok">{{ saveOk }}</div>
                <div v-if="saveErr" class="pf-err">{{ saveErr }}</div>
                <div class="pf-btns">
                  <button class="pf-save" :disabled="saving">{{ saving ? 'Сохраняем…' : 'Сохранить изменения' }}</button>
                  <button type="button" class="pf-ghost" @click="resetForm">Отмена</button>
                </div>
              </form>
            </section>

            <div class="pf-col">
              <section class="pf-card">
                <h3>Уведомления</h3>
                <div class="pf-toggle-row">
                  <div class="pf-tt"><div class="n">Статус заказов</div><div class="d">Уведомления о сборке и доставке</div></div>
                  <button type="button" class="pf-toggle" :class="{ on: notif.orderStatus }" aria-label="Статус заказов" @click="toggleNotif('orderStatus')" />
                </div>
                <div class="pf-toggle-row">
                  <div class="pf-tt"><div class="n">Новости и акции</div><div class="d">Скидки и сезонные предложения</div></div>
                  <button type="button" class="pf-toggle" :class="{ on: notif.news }" aria-label="Новости и акции" @click="toggleNotif('news')" />
                </div>
              </section>

              <section class="pf-ref">
                <h3>Пригласите друга — получите 500 бонусов</h3>
                <div class="pf-ref-code">
                  <span class="code">{{ user.referralCode || '—' }}</span>
                  <button type="button" :class="{ copied: refCopied }" @click="copyRef">{{ refCopied ? 'Ссылка скопирована' : 'Копировать ссылку' }}</button>
                </div>
                <div class="pf-rnote">Другу — <b>200 бонусов</b> за первый заказ.</div>
              </section>
            </div>
          </div>

          <div class="pf-ach-h">Достижения <span>· {{ achEarned }} из {{ achTotal }} открыто</span></div>
          <div class="pf-medals">
            <div v-for="m in medals" :key="m.key" class="pf-medal" :class="m.cls">
              <div class="pf-mc"><span class="pf-mc-ic">{{ m.icon }}</span><span v-if="m.done" class="pf-mok">✓</span></div>
              <div class="pf-mt">{{ m.name }}</div>
              <div class="pf-md">{{ m.desc }}</div>
              <div v-if="m.cls === 'current'" class="pf-mbar"><i :style="{ width: m.pct + '%' }" /></div>
              <div class="pf-mstat">{{ m.stat }}</div>
            </div>
          </div>
        </template>

        <!-- ===== TAB: ЗАКАЗЫ ===== -->
        <template v-else-if="tab === 'orders'">
          <h2 class="acc-pane-h">Мои заказы</h2>
          <div v-if="!loaded.orders" class="acc-empty">Загружаем…</div>
          <div v-else-if="!orders.length" class="acc-empty">Заказов пока нет. <NuxtLink to="/catalog">Перейти в каталог →</NuxtLink></div>
          <div v-else class="acc-orders">
            <div v-for="o in orders" :key="o._id || o.orderNumber" class="acc-order">
              <div class="acc-order-top">
                <span class="acc-order-n">№ {{ o.orderNumber }}</span>
                <span class="acc-order-st" :class="statusCls(o.status)">{{ statusLabel(o.status) }}</span>
              </div>
              <div class="acc-order-meta">{{ dateRu(o.createdAt) }} · {{ (o.items || []).length }} {{ plural((o.items || []).length, ['позиция','позиции','позиций']) }}</div>
              <div v-if="(o.items || []).length" class="acc-order-items">{{ (o.items || []).map(i => i.name).slice(0, 3).join(', ') }}<template v-if="(o.items || []).length > 3"> …</template></div>
              <div class="acc-order-bottom"><span>Итого</span><b>{{ fmt(num(o.total)) }} ₽</b></div>
            </div>
          </div>
        </template>

        <!-- ===== TAB: БОНУСЫ ===== -->
        <template v-else-if="tab === 'bonus'">
          <h2 class="acc-pane-h">Бонусы и клуб</h2>
          <div class="acc-bonus-bal">
            <div>
              <div class="acc-bonus-v">{{ fmt(bonus?.availableBalance ?? user.bonusBalance) }}</div>
              <div class="acc-bonus-l">доступно баллов · уровень «{{ currentLevel.name }}» · кэшбэк {{ currentLevel.cashback }}%</div>
            </div>
            <NuxtLink to="/loyalty" class="acc-bonus-link">Об уровнях клуба →</NuxtLink>
          </div>
          <div v-if="!loaded.bonus" class="acc-empty">Загружаем…</div>
          <div v-else-if="bonus?.transactions?.length" class="acc-tx">
            <div v-for="t in bonus.transactions" :key="t._id" class="acc-tx-row">
              <div class="acc-tx-l"><div class="acc-tx-d">{{ t.description || txReason(t) }}</div><div class="acc-tx-m">{{ dateRu(t.createdAt) }}</div></div>
              <div class="acc-tx-a" :class="num(t.amount) >= 0 ? 'plus' : 'minus'">{{ num(t.amount) >= 0 ? '+' : '' }}{{ fmt(num(t.amount)) }}</div>
            </div>
          </div>
          <div v-else class="acc-empty">Пока нет операций с баллами — они начисляются за заказы.</div>
        </template>

        <!-- ===== TAB: ИЗБРАННОЕ ===== -->
        <template v-else-if="tab === 'wishlist'">
          <h2 class="acc-pane-h">Избранное</h2>
          <div v-if="!loaded.wishlist" class="acc-empty">Загружаем…</div>
          <div v-else-if="!wishlist.length" class="acc-empty">В избранном пусто. <NuxtLink to="/catalog">В каталог →</NuxtLink></div>
          <div v-else class="acc-wish">
            <NuxtLink v-for="p in wishlist" :key="p.slug" :to="'/product/' + p.slug" class="acc-wish-card">
              <span class="acc-wish-media">
                <img v-if="p.images && p.images[0]" :src="p.images[0]" :alt="p.name" />
                <span v-else class="acc-wish-ph" />
              </span>
              <span class="acc-wish-n">{{ p.name }}</span>
              <span class="acc-wish-p">{{ fmt(num(p.price)) }} ₽</span>
            </NuxtLink>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Личный кабинет — Бутон' })

const { public: { cabinetUrl } } = useRuntimeConfig()
const cabBase = String(cabinetUrl || 'https://user.butonshop.ru').replace(/\/+$/, '')
const loginUrl = `${cabBase}/login`
const registerUrl = `${cabBase}/register`

const fmt = (n: number) => Number(n || 0).toLocaleString('ru-RU')
const num = (v: any) => Number(v || 0)
const plural = (n: number, [one, few, many]: string[]) => {
  const a = Math.abs(n) % 100, b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}
const dateRu = (d?: string) => {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '' }
}

/* ---- data ---- */
const user = ref<any>(null)
const ready = ref(false)
const achData = ref<any>(null)
const levels = ref<any[]>([])
const tab = ref<'profile' | 'orders' | 'bonus' | 'wishlist'>('profile')

const orders = ref<any[]>([])
const bonus = ref<any>(null)
const wishlist = ref<any[]>([])
const loaded = reactive({ orders: false, bonus: false, wishlist: false })

async function loadUser() {
  try {
    const me: any = await $fetch('/api/user/auth/me', { credentials: 'include' })
    user.value = me?.user || null
  } catch { user.value = null }
  if (user.value) {
    try { achData.value = await $fetch('/api/user/achievements', { credentials: 'include' }) } catch { /* noop */ }
    try { levels.value = await $fetch('/api/bonus/loyalty-levels') } catch { /* noop */ }
  }
  ready.value = true
}
onMounted(loadUser)

async function go(t: typeof tab.value) {
  tab.value = t
  if (t === 'orders' && !loaded.orders) {
    try { const r: any = await $fetch('/api/user/orders', { credentials: 'include' }); orders.value = Array.isArray(r) ? r : (r?.orders || []) } catch { /* noop */ }
    loaded.orders = true
  }
  if (t === 'bonus' && !loaded.bonus) {
    try { bonus.value = await $fetch('/api/user/bonus', { credentials: 'include' }) } catch { /* noop */ }
    loaded.bonus = true
  }
  if (t === 'wishlist' && !loaded.wishlist) {
    try { const w: any = await $fetch('/api/user/wishlist', { credentials: 'include' }); wishlist.value = w?.products || [] } catch { /* noop */ }
    loaded.wishlist = true
  }
}

/* ---- derived ---- */
const fullName = computed(() => `${user.value?.firstName ?? ''} ${user.value?.lastName ?? ''}`.trim() || 'Профиль')
const initials = computed(() => ((user.value?.firstName?.[0] ?? '') + (user.value?.lastName?.[0] ?? '')) || '?')
const avatarSrc = computed(() => user.value?.avatar || null)
const totalSpent = computed(() => user.value?.totalSpent ?? 0)
const sinceText = computed(() => {
  const d = user.value?.createdAt
  if (!d) return ''
  try { return `В клубе с ${new Date(d).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}` } catch { return '' }
})

/* ---- loyalty tiers ---- */
const DEFAULT_LEVELS = [
  { key: 'novice', name: 'Новичок', min: 0, cashback: 3 },
  { key: 'regular', name: 'Постоянный', min: 1000, cashback: 5 },
  { key: 'vip', name: 'Премиум', min: 5000, cashback: 7 },
]
const sortedLevels = computed(() => {
  const src = levels.value?.length ? levels.value : DEFAULT_LEVELS
  return [...src].sort((a, b) => (a.min || 0) - (b.min || 0))
})
const currentLevel = computed(() => [...sortedLevels.value].reverse().find(l => totalSpent.value >= (l.min || 0)) || sortedLevels.value[0])
const nextLevel = computed(() => {
  const i = sortedLevels.value.findIndex(l => l.key === currentLevel.value.key)
  return i >= 0 && i < sortedLevels.value.length - 1 ? sortedLevels.value[i + 1] : null
})
const progressPct = computed(() => {
  if (!nextLevel.value) return 100
  const range = (nextLevel.value.min || 0) - (currentLevel.value.min || 0)
  if (range <= 0) return 100
  return Math.min(100, Math.max(0, Math.floor(((totalSpent.value - (currentLevel.value.min || 0)) / range) * 100)))
})
const remainingToNext = computed(() => nextLevel.value ? Math.max((nextLevel.value.min || 0) - totalSpent.value, 0) : 0)

/* ---- editable form ---- */
const form = reactive({ firstName: '', lastName: '', phone: '' })
const notif = reactive({ orderStatus: true, news: false })
watch(user, (u) => {
  if (!u) return
  form.firstName = u.firstName ?? ''
  form.lastName = u.lastName ?? ''
  form.phone = u.phone ?? ''
  notif.orderStatus = u.notifications?.orderStatus ?? true
  notif.news = u.notifications?.news ?? false
}, { immediate: true })

const saving = ref(false)
const saveOk = ref('')
const saveErr = ref('')
function resetForm() {
  if (!user.value) return
  form.firstName = user.value.firstName ?? ''
  form.lastName = user.value.lastName ?? ''
  form.phone = user.value.phone ?? ''
  saveOk.value = ''; saveErr.value = ''
}
async function save() {
  saving.value = true; saveOk.value = ''; saveErr.value = ''
  try {
    const res: any = await $fetch('/api/user/profile', { method: 'PUT', credentials: 'include', body: { firstName: form.firstName, lastName: form.lastName, phone: form.phone, notifications: { ...notif } } })
    if (res?.user) user.value = res.user
    saveOk.value = 'Изменения сохранены'
  } catch { saveErr.value = 'Не удалось сохранить, попробуйте ещё раз' }
  saving.value = false
}
async function toggleNotif(key: 'orderStatus' | 'news') {
  notif[key] = !notif[key]
  try {
    const res: any = await $fetch('/api/user/profile', { method: 'PUT', credentials: 'include', body: { notifications: { ...notif } } })
    if (res?.user) user.value = res.user
  } catch { notif[key] = !notif[key] }
}

/* ---- referral ---- */
const refCopied = ref(false)
async function copyRef() {
  const link = `${import.meta.client ? location.origin : ''}/?ref=${user.value?.referralCode ?? ''}`
  try { await navigator.clipboard?.writeText(link) } catch { /* noop */ }
  refCopied.value = true
  setTimeout(() => { refCopied.value = false }, 1600)
}

/* ---- logout ---- */
async function logout() {
  try { await $fetch('/api/user/auth/logout', { method: 'POST', credentials: 'include' }) } catch { /* noop */ }
  user.value = null
  tab.value = 'profile'
}

/* ---- orders status ---- */
const STATUS: Record<string, string> = {
  pending: 'Ожидает', new: 'Новый', created: 'Создан', confirmed: 'Подтверждён', paid: 'Оплачен',
  assembling: 'Собираем', assembled: 'Собран', delivering: 'В доставке', shipping: 'В доставке',
  delivered: 'Доставлен', completed: 'Выполнен', cancelled: 'Отменён', canceled: 'Отменён', refunded: 'Возврат',
}
const statusLabel = (s?: string) => (s && STATUS[s]) || s || '—'
const statusCls = (s?: string) => ['delivered', 'completed'].includes(s || '') ? 'ok' : ['cancelled', 'canceled', 'refunded'].includes(s || '') ? 'bad' : 'mid'
const txReason = (t: any) => (num(t.amount) >= 0 ? 'Начисление баллов' : 'Списание баллов')

/* ---- achievements ---- */
const ACH_EMOJI: Record<string, string> = { first_order: '🛍️', regular: '🌸', generous: '💎', critic: '⭐', legend: '👑' }
const DEFAULT_ACH = [
  { key: 'first_order', name: 'Первый заказ', description: 'Первый доставленный заказ' },
  { key: 'regular', name: 'Завсегдатай', description: '5 доставленных заказов' },
  { key: 'generous', name: 'Щедрый', description: 'Заказ от 5 000 ₽' },
  { key: 'critic', name: 'Критик', description: '3 одобренных отзыва' },
]
const earnedKeys = computed<string[]>(() => achData.value?.earnedKeys || user.value?.achievements || [])
const medals = computed(() => {
  const items = achData.value?.items?.length
    ? achData.value.items
    : DEFAULT_ACH.map(a => ({ ...a, earned: earnedKeys.value.includes(a.key), progressPct: 0, current: 0, target: 0 }))
  return items.map((a: any) => {
    const done = !!a.earned
    const inProgress = !done && (a.progressPct ?? 0) > 0
    return {
      key: a.key, name: a.name, desc: a.description,
      icon: ACH_EMOJI[a.key] || '🏅',
      done, cls: done ? 'done' : inProgress ? 'current' : 'lock',
      pct: a.progressPct ?? 0,
      stat: done ? 'Открыто' : inProgress ? `В процессе · ${a.current ?? 0}/${a.target ?? 0}` : 'Закрыто',
    }
  })
})
const achEarned = computed(() => achData.value?.summary?.earned ?? medals.value.filter((m: any) => m.done).length)
const achTotal = computed(() => achData.value?.summary?.total ?? medals.value.length)
</script>

<style scoped>
.wrap {
  --pf-dark: oklch(0.31 0.025 150);
  --pf-green-wash: oklch(0.95 0.03 150);
  --pf-clay-wash: oklch(0.95 0.035 60);
  --pf-line-strong: oklch(0.86 0 0);
  max-width: 1180px; margin: 0 auto; padding: 22px 24px 90px;
}
.wrap * { box-sizing: border-box; }
.serif { font-family: var(--serif); }
.crumbs { font-size: 13px; color: var(--muted); margin-bottom: 18px; }
.crumbs a { color: var(--muted); text-decoration: none; }
.crumbs a:hover { color: var(--ink); }
.crumbs .sep { margin: 0 8px; }

/* guest / skeleton */
.acc-guest { text-align: center; padding: 60px 20px; max-width: 460px; margin: 0 auto; }
.acc-guest__ic { font-size: 40px; }
.acc-guest h1 { font-family: var(--serif); font-size: 30px; font-weight: 600; margin: 14px 0 8px; color: var(--ink); }
.acc-guest p { color: var(--muted); font-size: 15px; line-height: 1.55; margin-bottom: 24px; }
.acc-guest__btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.acc-skel__banner { height: 140px; border-radius: var(--r-md); background: var(--paper-2); margin-bottom: 22px; }
.acc-skel__row { height: 80px; border-radius: var(--r-md); background: var(--paper-2); }

/* ===== layout: sidebar + main ===== */
.acc { display: grid; grid-template-columns: 232px minmax(0, 1fr); gap: 28px; align-items: start; }
@media (max-width: 900px) { .acc { grid-template-columns: 1fr; gap: 16px; } }

.acc-nav {
  position: sticky; top: 90px;
  background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md);
  box-shadow: var(--sh-sm); padding: 10px; display: flex; flex-direction: column; gap: 4px;
}
@media (max-width: 900px) { .acc-nav { position: static; flex-direction: row; overflow-x: auto; padding: 8px; } }
.acc-nav__i {
  display: flex; align-items: center; gap: 11px; padding: 11px 13px; border-radius: 10px;
  font-family: inherit; font-size: 14.5px; font-weight: 500; color: var(--ink-2);
  background: none; border: none; cursor: pointer; text-decoration: none; white-space: nowrap; text-align: left; transition: .14s;
}
.acc-nav__i span { font-size: 16px; width: 20px; text-align: center; flex: none; }
.acc-nav__i:hover { background: var(--paper-2); color: var(--ink); }
.acc-nav__i.on { background: var(--pf-green-wash); color: var(--green); font-weight: 600; }
.acc-nav__sep { height: 1px; background: var(--line); margin: 8px 6px; }
@media (max-width: 900px) { .acc-nav__sep { display: none; } }
.acc-nav__exit { color: var(--muted); }
.acc-nav__exit:hover { color: #c0392b; background: oklch(0.95 0.04 25); }

.acc-main { display: flex; flex-direction: column; gap: 22px; min-width: 0; }

/* ===== banner ===== */
.pf-banner { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; background: var(--pf-dark); color: #fff; border-radius: var(--r-md); padding: 26px 28px; }
.pf-ava { width: 84px; height: 84px; border-radius: 50%; flex: none; background: var(--pf-green-wash); color: var(--green); display: grid; place-items: center; overflow: hidden; font-family: var(--serif); font-size: 34px; font-weight: 600; border: 3px solid oklch(1 0 0 / .15); }
.pf-ava img { width: 100%; height: 100%; object-fit: cover; }
.pf-info { flex: 1; min-width: 180px; }
.pf-name { font-family: var(--serif); font-size: 26px; font-weight: 600; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pf-vip { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; background: var(--clay); color: #fff; padding: 4px 11px; border-radius: 20px; }
.pf-since { font-size: 13px; color: oklch(0.82 0.015 150); margin-top: 6px; }
.pf-bonus { text-align: right; }
.pf-bonus-v { font-family: var(--serif); font-size: 34px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.pf-bonus-l { font-size: 12px; color: oklch(0.82 0.015 150); margin-top: 3px; }
.pf-bonus-c { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 600; color: var(--clay); background: oklch(0.62 0.11 47 / .2); padding: 4px 11px; border-radius: 20px; }

/* ===== level ===== */
.pf-level { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--sh-sm); padding: 20px 24px; }
.pf-level-t { display: flex; justify-content: space-between; align-items: baseline; font-size: 14px; margin-bottom: 11px; gap: 12px; flex-wrap: wrap; }
.pf-level-t b { font-weight: 600; }
.pf-level-t .clay { color: var(--clay); font-weight: 600; }
.pf-level-t > span:last-child { color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.pf-track { height: 9px; border-radius: 9px; background: var(--paper-2); overflow: hidden; }
.pf-fill { height: 100%; border-radius: 9px; background: linear-gradient(90deg, var(--clay), oklch(0.7 0.12 55)); transition: width .4s ease; }
.pf-level-h { font-size: 12.5px; color: var(--muted); margin-top: 10px; }
.pf-level-h b { color: var(--ink); }

/* ===== two col ===== */
.pf-two { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: start; }
@media (max-width: 760px) { .pf-two { grid-template-columns: 1fr; } }
.pf-col { display: flex; flex-direction: column; gap: 22px; }
.pf-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--sh-sm); padding: 24px; }
.pf-card > h3 { font-family: var(--serif); font-size: 20px; font-weight: 600; margin: 0 0 18px; }
.pf-fld { margin-bottom: 15px; }
.pf-fld label { display: block; font-size: 13px; font-weight: 500; color: var(--ink-2); margin-bottom: 6px; }
.pf-fld label .req { color: var(--clay); }
.pf-inp { width: 100%; height: 46px; border: 1px solid var(--pf-line-strong); border-radius: 10px; padding: 0 13px; font-size: 14.5px; font-family: inherit; color: var(--ink); background: var(--card); }
.pf-inp:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px var(--pf-green-wash); }
.pf-inp:disabled { background: var(--paper-2); color: var(--muted); cursor: not-allowed; }
.pf-hint { font-size: 12px; color: var(--muted); margin-top: 6px; }
.pf-ok { font-size: 13px; color: var(--green); margin-top: 4px; }
.pf-err { font-size: 13px; color: #c0392b; margin-top: 4px; }
.pf-btns { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.pf-save { height: 46px; padding: 0 20px; border: none; border-radius: 10px; cursor: pointer; background: var(--green); color: #fff; font-family: inherit; font-weight: 600; font-size: 14.5px; transition: background .15s, opacity .15s; }
.pf-save:hover { background: var(--green-2); }
.pf-save:disabled { opacity: .6; cursor: default; }
.pf-ghost { height: 46px; padding: 0 18px; border: 1px solid var(--pf-line-strong); border-radius: 10px; cursor: pointer; background: var(--card); color: var(--ink); font-family: inherit; font-weight: 600; font-size: 14.5px; transition: border-color .15s; }
.pf-ghost:hover { border-color: var(--green); color: var(--green); }

.pf-toggle-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.pf-toggle-row:first-of-type { padding-top: 0; }
.pf-toggle-row:last-of-type { border-bottom: none; padding-bottom: 0; }
.pf-tt { flex: 1; }
.pf-tt .n { font-weight: 600; font-size: 14.5px; }
.pf-tt .d { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
.pf-toggle { width: 46px; height: 27px; border-radius: 30px; background: var(--pf-line-strong); position: relative; flex: none; cursor: pointer; border: none; padding: 0; transition: background .18s; }
.pf-toggle::after { content: ""; position: absolute; top: 3px; left: 3px; width: 21px; height: 21px; border-radius: 50%; background: #fff; transition: transform .18s; box-shadow: 0 1px 3px oklch(0 0 0 / .25); }
.pf-toggle.on { background: var(--green); }
.pf-toggle.on::after { transform: translateX(19px); }

.pf-ref { background: var(--pf-dark); color: #fff; border-radius: var(--r-md); padding: 24px; }
.pf-ref h3 { font-family: var(--serif); font-size: 19px; font-weight: 600; margin: 0 0 16px; color: #fff; }
.pf-ref-code { display: flex; gap: 10px; flex-wrap: wrap; }
.pf-ref-code .code { flex: 1; min-width: 140px; display: flex; align-items: center; font-weight: 700; letter-spacing: .06em; font-size: 15px; background: oklch(1 0 0 / .12); border: 1px dashed oklch(1 0 0 / .4); border-radius: 9px; padding: 11px 16px; }
.pf-ref-code button { padding: 0 16px; border-radius: 9px; cursor: pointer; border: 1px solid oklch(1 0 0 / .3); color: #fff; background: oklch(1 0 0 / .08); font-family: inherit; font-weight: 600; font-size: 13.5px; transition: background .15s, border-color .15s; }
.pf-ref-code button:hover { background: oklch(1 0 0 / .16); }
.pf-ref-code button.copied { background: var(--green); border-color: var(--green); }
.pf-rnote { font-size: 13px; color: oklch(0.84 0.015 150); margin-top: 14px; }
.pf-rnote b { color: #fff; }

/* ===== achievements ===== */
.pf-ach-h { font-family: var(--serif); font-weight: 500; font-size: 24px; letter-spacing: -.01em; margin: 6px 0 2px; }
.pf-ach-h span { font-size: 14px; color: var(--muted); font-weight: 400; font-family: var(--sans); }
.pf-medals { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
@media (max-width: 1040px) { .pf-medals { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 560px) { .pf-medals { grid-template-columns: repeat(2, 1fr); } }
.pf-medal { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--sh-sm); padding: 22px 14px 18px; text-align: center; }
.pf-medal.current { border-color: oklch(0.72 0.08 47); }
.pf-medal.lock { opacity: .6; }
.pf-mc { width: 62px; height: 62px; border-radius: 50%; margin: 0 auto 13px; display: grid; place-items: center; background: var(--paper-2); position: relative; font-size: 28px; }
.pf-medal.done .pf-mc { background: var(--pf-green-wash); box-shadow: 0 0 0 4px var(--card), 0 0 0 5px var(--green); }
.pf-medal.current .pf-mc { background: var(--pf-clay-wash); box-shadow: 0 0 0 4px var(--card), 0 0 0 5px var(--clay); }
.pf-medal.lock .pf-mc { filter: grayscale(1); }
.pf-mok { position: absolute; right: -3px; bottom: -3px; width: 23px; height: 23px; border-radius: 50%; background: var(--green); color: #fff; display: grid; place-items: center; border: 2px solid var(--card); font-size: 12px; }
.pf-mt { font-weight: 600; font-size: 14.5px; }
.pf-md { font-size: 12px; color: var(--muted); margin-top: 3px; line-height: 1.4; min-height: 32px; }
.pf-mbar { height: 5px; border-radius: 5px; background: var(--paper-2); margin: 11px 8px 0; overflow: hidden; }
.pf-mbar i { display: block; height: 100%; background: var(--clay); border-radius: 5px; }
.pf-mstat { margin-top: 10px; font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; padding: 4px 11px; border-radius: 20px; display: inline-block; }
.pf-medal.done .pf-mstat { background: var(--pf-green-wash); color: var(--green); }
.pf-medal.current .pf-mstat { background: var(--pf-clay-wash); color: var(--clay); }
.pf-medal.lock .pf-mstat { background: var(--paper-2); color: var(--muted); }

/* ===== panes (orders/bonus/wishlist) ===== */
.acc-pane-h { font-family: var(--serif); font-size: 24px; font-weight: 600; margin: 4px 0 4px; }
.acc-empty { color: var(--muted); font-size: 14.5px; padding: 18px 0; }
.acc-empty a { color: var(--green); font-weight: 600; text-decoration: none; }

/* orders */
.acc-orders { display: flex; flex-direction: column; gap: 14px; }
.acc-order { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--sh-sm); padding: 18px 20px; }
.acc-order-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.acc-order-n { font-weight: 700; font-size: 15px; }
.acc-order-st { font-size: 11.5px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; padding: 4px 11px; border-radius: 20px; }
.acc-order-st.ok { background: var(--pf-green-wash); color: var(--green); }
.acc-order-st.mid { background: var(--pf-clay-wash); color: var(--clay); }
.acc-order-st.bad { background: oklch(0.95 0.04 25); color: #c0392b; }
.acc-order-meta { font-size: 12.5px; color: var(--muted); margin-top: 6px; }
.acc-order-items { font-size: 13.5px; color: var(--ink-2); margin-top: 8px; line-height: 1.4; }
.acc-order-bottom { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--muted); }
.acc-order-bottom b { font-size: 17px; color: var(--ink); font-variant-numeric: tabular-nums; }

/* bonus */
.acc-bonus-bal { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; background: var(--pf-dark); color: #fff; border-radius: var(--r-md); padding: 22px 24px; }
.acc-bonus-v { font-family: var(--serif); font-size: 36px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.acc-bonus-l { font-size: 12.5px; color: oklch(0.82 0.015 150); margin-top: 5px; }
.acc-bonus-link { color: #fff; font-weight: 600; font-size: 13.5px; text-decoration: none; border: 1px solid oklch(1 0 0 / .3); border-radius: 9px; padding: 9px 14px; background: oklch(1 0 0 / .08); white-space: nowrap; }
.acc-bonus-link:hover { background: oklch(1 0 0 / .16); }
.acc-tx { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--sh-sm); overflow: hidden; }
.acc-tx-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--line); }
.acc-tx-row:last-child { border-bottom: none; }
.acc-tx-d { font-weight: 500; font-size: 14px; }
.acc-tx-m { font-size: 12px; color: var(--muted); margin-top: 2px; }
.acc-tx-a { font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums; }
.acc-tx-a.plus { color: var(--green); }
.acc-tx-a.minus { color: var(--clay); }

/* wishlist */
.acc-wish { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
@media (max-width: 760px) { .acc-wish { grid-template-columns: repeat(2, 1fr); } }
.acc-wish-card { display: flex; flex-direction: column; text-decoration: none; color: inherit; }
.acc-wish-media { position: relative; aspect-ratio: 1 / 1; border-radius: var(--r-md); overflow: hidden; background: var(--paper-2); margin-bottom: 8px; }
.acc-wish-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.acc-wish-n { font-size: 13.5px; font-weight: 600; line-height: 1.3; }
.acc-wish-p { font-size: 14px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }

/* guest buttons */
.btn-primary { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border-radius: 12px; background: var(--green); color: #fff; font-weight: 600; font-size: 15px; text-decoration: none; border: none; cursor: pointer; }
.btn-primary:hover { background: var(--green-2); }
.ghost-btn { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 20px; border-radius: 12px; border: 1px solid var(--line-2); background: var(--card); color: var(--ink); font-weight: 600; font-size: 15px; text-decoration: none; }
.ghost-btn:hover { border-color: var(--green); color: var(--green); }
</style>
