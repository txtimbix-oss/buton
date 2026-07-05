<template>
  <div class="lp">
    <div class="bwide">
      <!-- хлебные крошки -->
      <div class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink><span class="sep">/</span><span>Клуб «Бутон»</span>
      </div>

      <!-- HERO -->
      <section class="hero">
        <div class="hero__in">
          <div class="eyebrow">Программа лояльности</div>
          <h1 class="serif">Клуб «Бутон»</h1>
          <p class="hero__sub">
            Каждый заказ копит баллы. Оплачивайте ими следующие букеты, поднимайтесь
            по уровням и получайте до {{ maxCashback }}% кэшбэка.
          </p>

          <!-- залогинен: личный статус -->
          <div v-if="balance !== null" class="me">
            <div class="me__bal">
              <span class="me__lbl">Ваш баланс</span>
              <b class="me__num">{{ fmt(balance) }} <span>Б</span></b>
              <span v-if="currentTier" class="me__tier">{{ currentTier.icon }} {{ currentTier.name }} · {{ currentTier.cashback }}%</span>
            </div>
            <div v-if="nextTier" class="me__next">
              <div class="me__bar"><span :style="{ width: progress + '%' }" /></div>
              <span>До уровня «{{ nextTier.name }}» — ещё {{ fmt(nextTier.min - balance) }} Б</span>
            </div>
            <NuxtLink class="btn btn--ghost" to="/catalog">Потратить баллы на букет →</NuxtLink>
          </div>

          <!-- гость: вступить -->
          <div v-else class="cta">
            <a class="btn btn--clay" :href="joinUrl">Вступить — бесплатно <span v-html="ARROW" /></a>
            <a class="btn btn--ghost" :href="loginUrl">У меня уже есть аккаунт</a>
            <p v-if="welcome > 0" class="cta__hint">+{{ fmt(welcome) }} приветственных баллов за регистрацию</p>
          </div>
        </div>
      </section>

      <!-- КАК КОПЯТСЯ БАЛЛЫ -->
      <section class="block">
        <h2 class="serif h2">Как это работает</h2>
        <div class="grid4">
          <div class="fcard">
            <span class="fcard__ic" v-html="IC.coin" />
            <h3>Кэшбэк баллами</h3>
            <p>Возвращаем от {{ minCashback }}% с каждого заказа. С ростом уровня — до {{ maxCashback }}%.</p>
          </div>
          <div v-if="welcome > 0" class="fcard">
            <span class="fcard__ic" v-html="IC.gift" />
            <h3>Подарок новичку</h3>
            <p>{{ fmt(welcome) }} баллов сразу после регистрации — хватит на скидку к первому букету.</p>
          </div>
          <div class="fcard">
            <span class="fcard__ic" v-html="IC.flower" />
            <h3>Оплата баллами</h3>
            <p>1 балл = 1 ₽. Списывайте баллы в корзине и платите ими часть следующего заказа.</p>
          </div>
          <div v-if="expireDays > 0" class="fcard">
            <span class="fcard__ic" v-html="IC.clock" />
            <h3>Срок действия</h3>
            <p>Баллы активны {{ expireDays }} дней с момента начисления — заказывайте, пока свежие.</p>
          </div>
        </div>
      </section>

      <!-- УРОВНИ -->
      <section v-if="tiers.length" class="block">
        <h2 class="serif h2">Уровни клуба</h2>
        <div class="tiers">
          <div
            v-for="t in tiers"
            :key="t.key"
            class="tier"
            :class="{ on: currentTier && currentTier.key === t.key }"
          >
            <div class="tier__top">
              <span class="tier__ic">{{ t.icon }}</span>
              <span v-if="currentTier && currentTier.key === t.key" class="tier__badge">Ваш уровень</span>
            </div>
            <div class="tier__name">{{ t.name }}</div>
            <div class="tier__cb">{{ t.cashback }}%</div>
            <div class="tier__cbl">кэшбэк баллами</div>
            <div class="tier__th">{{ t.min === 0 ? 'Доступен сразу' : 'от ' + fmt(t.min) + ' баллов' }}</div>
          </div>
        </div>
      </section>

      <!-- РЕФЕРАЛКА -->
      <section v-if="referralOn && (refRefer > 0 || refReferee > 0)" class="block">
        <div class="ref">
          <div class="ref__txt">
            <div class="eyebrow">Приведи друга</div>
            <h2 class="serif h2" style="margin-top:6px">Дарите баллы — получайте баллы</h2>
            <p>
              Поделитесь ссылкой из личного кабинета. Друг получит
              <b>{{ fmt(refReferee) }} Б</b> на первый заказ, а вам начислим
              <b>{{ fmt(refRefer) }} Б</b>, когда он оформит букет.
            </p>
            <a class="btn btn--clay" :href="balance !== null ? cabinetHome : joinUrl">
              {{ balance !== null ? 'Моя реферальная ссылка' : 'Вступить и приглашать' }} <span v-html="ARROW" />
            </a>
          </div>
          <div class="ref__nums">
            <div class="ref__num"><b>{{ fmt(refReferee) }}</b><span>другу</span></div>
            <div class="ref__plus">+</div>
            <div class="ref__num"><b>{{ fmt(refRefer) }}</b><span>вам</span></div>
          </div>
        </div>
      </section>

      <!-- ИТОГОВЫЙ CTA (гостю) -->
      <section v-if="balance === null" class="block">
        <div class="final">
          <h2 class="serif">Готовы копить?</h2>
          <p>Регистрация бесплатна, баллы начинают копиться с первого заказа.</p>
          <a class="btn btn--clay btn--lg" :href="joinUrl">Вступить в клуб <span v-html="ARROW" /></a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Клуб «Бутон» — программа лояльности и кэшбэк баллами',
  description: 'Копите баллы с каждого заказа, оплачивайте ими букеты и поднимайтесь по уровням клуба «Бутон».',
})

const ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
const IC = {
  coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.2c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.6c0 2.4-5 1.3-5 3.6 0 1 1 1.8 2.5 1.8s2.5-.8 2.5-1.8"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11h16v9H4zM4 7h16v4H4zM12 7v13M12 7S10.5 3 8.5 4 10 7 12 7zM12 7s1.5-4 3.5-3S14 7 12 7z"/></svg>',
  flower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C12 6 13.5 4 15 4s1.4 3.6-.6 5.6M12 14.4c0 3.6 1.5 5.6 3 5.6s1.4-3.6-.6-5.6M9.6 12C6 12 4 10.5 4 9s3.6-1.4 5.6.6M14.4 12c3.6 0 5.6 1.5 5.6 3s-3.6 1.4-5.6-.6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
}

const fmt = n => Number(n || 0).toLocaleString('ru-RU')
const num = (v, d = 0) => { const n = parseInt(String(v ?? ''), 10); return Number.isNaN(n) ? d : n }

/* ── данные с бэка ── */
const { data: levels } = await useFetch('/api/bonus/loyalty-levels', { default: () => [] })
const { data: settings } = await useFetch('/api/settings/public', { default: () => ({}) })

const { user, fetchUser } = useShopUser()
onMounted(() => { fetchUser() })

// Вход/регистрация и кабинет — на основном сайте (не поддомен)
const joinUrl = '/register'
const loginUrl = '/login'
const cabinetHome = '/account'

/* ── настройки бонусов ── */
const referralOn = computed(() => String(settings.value?.referralEnabled) === 'true')
const basePct = computed(() => num(settings.value?.bonusPercentage, 3))
const welcome = computed(() => num(settings.value?.bonusWelcome, 0))
const expireDays = computed(() => num(settings.value?.bonusExpireDays, 0))
const refRefer = computed(() => num(settings.value?.referralRefererBonus, 0))
const refReferee = computed(() => num(settings.value?.referralRefereeBonus, 0))

/* ── уровни ── */
const tiers = computed(() => [...(levels.value || [])].sort((a, b) => (a.min || 0) - (b.min || 0)))
const maxCashback = computed(() => tiers.value.reduce((m, t) => Math.max(m, t.cashback || 0), basePct.value))
const minCashback = computed(() => (tiers.value.length ? Math.min(...tiers.value.map(t => t.cashback || 0)) : basePct.value))

/* ── личный статус (если залогинен) ── */
const balance = computed(() => (user.value ? (user.value.bonusBalance ?? 0) : null))
const currentTier = computed(() => {
  if (balance.value === null) return null
  let cur = null
  for (const t of tiers.value) if (balance.value >= (t.min || 0)) cur = t
  return cur
})
const nextTier = computed(() => (balance.value === null ? null : tiers.value.find(t => (t.min || 0) > balance.value) || null))
const progress = computed(() => {
  if (!nextTier.value || balance.value === null) return 100
  const lo = currentTier.value?.min || 0
  const hi = nextTier.value.min
  return Math.max(4, Math.min(100, Math.round(((balance.value - lo) / (hi - lo)) * 100)))
})
</script>

<style scoped>
.lp { background: var(--paper); color: var(--ink); padding: 24px 0 120px; font-family: var(--sans); }
.lp .serif { font-family: var(--serif); }
.crumbs { font-size: 13px; color: var(--muted); display: flex; gap: 8px; align-items: center; margin-bottom: 22px; }
.crumbs a { color: var(--muted); text-decoration: none; }
.crumbs a:hover { color: var(--ink); }
.crumbs .sep { opacity: .5; }
.eyebrow { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; color: var(--green); }

/* HERO */
.hero {
  position: relative; overflow: hidden; border-radius: 28px; padding: 54px 56px; color: #fff;
  background: linear-gradient(135deg, oklch(0.46 0.1 152), oklch(0.32 0.07 158));
}
.hero::before {
  content: ''; position: absolute; top: -45%; right: -8%; width: 460px; height: 460px; border-radius: 50%;
  background: radial-gradient(circle, oklch(0.72 0.16 150 / .34), transparent 70%); pointer-events: none;
}
.hero__in { position: relative; max-width: 640px; }
.hero .eyebrow { color: oklch(0.86 0.08 150); }
.hero h1 { font-size: clamp(30px, 4vw, 44px); font-weight: 600; letter-spacing: -.015em; margin: 10px 0 0; }
.hero__sub { color: oklch(0.92 0.03 150); font-size: 16px; line-height: 1.5; margin: 14px 0 26px; max-width: 52ch; }

.cta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.cta__hint { width: 100%; margin: 6px 0 0; font-size: 13.5px; color: oklch(0.86 0.05 150); }

.me { display: flex; flex-direction: column; gap: 16px; max-width: 460px; }
.me__bal { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
.me__lbl { font-size: 13px; color: oklch(0.86 0.05 150); }
.me__num { font-family: var(--serif); font-size: 38px; font-weight: 700; line-height: 1; }
.me__num span { font-size: 20px; font-weight: 600; opacity: .8; }
.me__tier { font-size: 13.5px; font-weight: 600; background: oklch(1 0 0 / .15); padding: 5px 11px; border-radius: 20px; }
.me__next { font-size: 13px; color: oklch(0.9 0.03 150); display: flex; flex-direction: column; gap: 7px; }
.me__bar { height: 8px; border-radius: 5px; background: oklch(1 0 0 / .18); overflow: hidden; }
.me__bar span { display: block; height: 100%; border-radius: 5px; background: var(--clay); transition: width .4s ease; }

/* кнопки */
.btn {
  display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 22px; border-radius: 13px;
  font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; transition: transform .14s, filter .14s, background .14s;
}
.btn:active { transform: scale(.98); }
.btn--clay { background: var(--clay); color: #fff; }
.btn--clay:hover { filter: brightness(1.05); }
.btn--ghost { background: oklch(1 0 0 / .12); color: #fff; border: 1px solid oklch(1 0 0 / .35); }
.btn--ghost:hover { background: oklch(1 0 0 / .2); }
.btn--lg { height: 56px; padding: 0 28px; font-size: 16px; }

/* секции */
.block { margin-top: 56px; }
.h2 { font-size: clamp(22px, 2.4vw, 30px); font-weight: 600; letter-spacing: -.01em; margin: 0 0 24px; }

.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.fcard { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 24px 22px; }
.fcard__ic { display: inline-flex; width: 46px; height: 46px; border-radius: 13px; align-items: center; justify-content: center; background: var(--green-wash, oklch(0.95 0.03 150)); color: var(--green); margin-bottom: 14px; }
.fcard__ic :deep(svg) { width: 24px; height: 24px; }
.fcard h3 { font-size: 16px; font-weight: 600; margin: 0 0 7px; }
.fcard p { font-size: 13.5px; line-height: 1.5; color: var(--ink-soft, var(--muted)); margin: 0; }

/* уровни */
.tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tier { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 26px; transition: border-color .15s, box-shadow .15s; }
.tier.on { border-color: var(--clay); box-shadow: inset 0 0 0 1px var(--clay); }
.tier__top { display: flex; align-items: center; justify-content: space-between; }
.tier__ic { font-size: 34px; line-height: 1; }
.tier__badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--clay); background: var(--clay-wash, oklch(0.95 0.035 60)); padding: 4px 9px; border-radius: 20px; }
.tier__name { font-size: 13px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; color: var(--muted); margin-top: 16px; }
.tier__cb { font-family: var(--serif); font-size: 44px; font-weight: 700; line-height: 1; margin-top: 6px; }
.tier__cbl { font-size: 13px; color: var(--ink-soft, var(--muted)); }
.tier__th { font-size: 13px; color: var(--muted); margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); }

/* реферал */
.ref { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: center; background: var(--card); border: 1px solid var(--line); border-radius: 24px; padding: 36px 40px; }
.ref__txt h2 { margin-bottom: 10px; }
.ref__txt p { font-size: 15px; line-height: 1.55; color: var(--ink-soft, var(--muted)); max-width: 48ch; margin: 0 0 22px; }
.ref__txt b { color: var(--ink); }
.ref__nums { display: flex; align-items: center; justify-content: center; gap: 18px; }
.ref__num { text-align: center; }
.ref__num b { display: block; font-family: var(--serif); font-size: 40px; font-weight: 700; color: var(--green); }
.ref__num span { font-size: 13px; color: var(--muted); }
.ref__plus { font-size: 30px; color: var(--line-strong, var(--line)); font-weight: 300; }

/* финальный CTA */
.final { text-align: center; background: linear-gradient(135deg, oklch(0.95 0.03 150), oklch(0.94 0.035 116)); border-radius: 24px; padding: 48px 24px; }
.final h2 { font-size: 28px; font-weight: 600; margin: 0 0 8px; }
.final p { color: var(--ink-soft, var(--muted)); margin: 0 0 22px; }
.final .btn { color: #fff; }

@media (max-width: 920px) { .grid4 { grid-template-columns: repeat(2, 1fr); } .ref { grid-template-columns: 1fr; } }
@media (max-width: 640px) {
  .hero { padding: 36px 24px; border-radius: 22px; }
  .tiers { grid-template-columns: 1fr; }
  .grid4 { grid-template-columns: 1fr; }
}
</style>
