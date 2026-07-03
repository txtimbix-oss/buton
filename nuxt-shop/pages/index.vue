<template>
  <div class="wrap">

    <!-- COLLECTIONS -->
    <section>
      <div class="collgrid">
        <NuxtLink v-for="(c, i) in COLLS" :key="i" class="collcard" :to="c.to" :style="{ background: c.bg }">
          <h3>{{ c.n }}</h3>
          <div class="coll-feat"><span v-for="(t, j) in c.f" :key="j">{{ t }}</span></div>
          <img :src="c.img" :alt="c.n" :class="['cimg', 'cimg--' + c.k]" />
        </NuxtLink>
      </div>
    </section>

    <!-- HITS -->
    <section class="s-block">
      <div class="sec-h">
        <div><div class="eyebrow">Выбор покупателей</div><h2>Хиты недели</h2></div>
        <NuxtLink class="more" to="/catalog">Смотреть все <span v-html="I.arrow"></span></NuxtLink>
      </div>
      <div class="cards">
        <NuxtLink v-for="(p, i) in HITS" :key="i" class="pcard" :to="p.slug ? ('/product/' + p.slug) : '/product/test'" @click.capture="e => onCardClick(e, p)">
          <div class="pm">
            <img v-if="p.img" :src="p.img" :alt="p.n" class="media-img" />
            <div v-else class="ph" :style="{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${p.m}, oklch(0.92 0.02 80))` }">
              <span class="lbl">фото букета</span>
            </div>
            <span v-if="p.tag" :class="'tag ' + p.tag[0]">{{ p.tag[1] }}</span>
            <button :class="'like' + (likes[p.n] ? ' on' : '')" @click.prevent="toggleLike(p.n)"><span v-html="I.heart"></span></button>
            <button class="quick" @click.prevent><span v-html="I.eye"></span> Смотреть товар</button>
          </div>
          <div class="pb">
            <div class="pn">{{ p.n }}</div>
            <div class="pc">{{ p.c }}</div>
            <div class="pp">
              <span class="prate"><span v-html="I.star"></span><b>{{ p.r.toFixed(1) }}</b></span>
              <span class="pprice"><span class="n">{{ fmt(p.p) }} ₽</span><span v-if="p.o > 0" class="o">{{ fmt(p.o) }} ₽</span></span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- CONSTRUCTOR PROMO -->
    <section class="s-block">
      <div class="promo">
        <div class="pr-txt">
          <div class="eyebrow">Соберём за вас или соберите сами</div>
          <h3 class="serif">Конструктор букета</h3>
          <p>Выбирайте цветы поштучно, зелень, упаковку и ленту — цена пересчитывается вживую. Или начните с готовой основы.</p>
          <div><NuxtLink class="btn-primary" to="/custom">Собрать букет <span v-html="I.arrow"></span></NuxtLink></div>
        </div>
        <div class="pr-media">
          <div class="cnstr" aria-hidden="true">
            <div class="cnstr-head">
              <span class="cnstr-title">Ваш букет</span>
              <span class="cnstr-live">пересчёт вживую</span>
            </div>
            <ul class="cnstr-rows">
              <li v-for="(it, i) in CONSTRUCT" :key="i" class="cnstr-row">
                <span class="cnstr-dot" :style="{ background: it.c }"></span>
                <span class="cnstr-name">{{ it.n }}</span>
                <span class="cnstr-step"><span>−</span><b>{{ it.q }}</b><span>+</span></span>
                <span class="cnstr-price">{{ it.p }} ₽</span>
              </li>
            </ul>
            <div class="cnstr-total">
              <span>Итого</span>
              <b>3&thinsp;240&nbsp;₽</b>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW -->
    <section class="s-block">
      <div class="sec-h">
        <div><div class="eyebrow">Только собрали</div><h2>Новинки</h2></div>
        <NuxtLink class="more" to="/catalog">Смотреть все <span v-html="I.arrow"></span></NuxtLink>
      </div>
      <div class="cards">
        <NuxtLink v-for="(p, i) in NEW" :key="i" class="pcard" :to="p.slug ? ('/product/' + p.slug) : '/product/test'" @click.capture="e => onCardClick(e, p)">
          <div class="pm">
            <img v-if="p.img" :src="p.img" :alt="p.n" class="media-img" />
            <div v-else class="ph" :style="{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${p.m}, oklch(0.92 0.02 80))` }">
              <span class="lbl">фото букета</span>
            </div>
            <span v-if="p.tag" :class="'tag ' + p.tag[0]">{{ p.tag[1] }}</span>
            <button :class="'like' + (likes[p.n] ? ' on' : '')" @click.prevent="toggleLike(p.n)"><span v-html="I.heart"></span></button>
            <button class="quick" @click.prevent><span v-html="I.eye"></span> Смотреть товар</button>
          </div>
          <div class="pb">
            <div class="pn">{{ p.n }}</div>
            <div class="pc">{{ p.c }}</div>
            <div class="pp">
              <span class="prate"><span v-html="I.star"></span><b>{{ p.r.toFixed(1) }}</b></span>
              <span class="pprice"><span class="n">{{ fmt(p.p) }} ₽</span><span v-if="p.o > 0" class="o">{{ fmt(p.o) }} ₽</span></span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- LOYALTY -->
    <section class="s-block">
      <div class="loyal-block">
        <div class="lb-top">
          <div><h2 class="serif">Клуб «Бутон»</h2><p>Каждый заказ копит баллы. Оплачивайте ими до 30% следующего букета и поднимайтесь по уровням.</p></div>
          <NuxtLink class="btn-primary" to="/loyalty" :style="{ background: 'var(--clay)' }">Вступить — бесплатно <span v-html="I.arrow"></span></NuxtLink>
        </div>
        <div class="tiers">
          <div v-for="(t, i) in TIERS" :key="i" :class="'tier' + (t.gold ? ' gold' : '')">
            <div class="tr-n">{{ t.n }}</div>
            <div class="tr-c">{{ t.c }}</div>
            <div class="tr-d">{{ t.d }}</div>
            <div class="tr-th">Порог: {{ t.th }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- REVIEWS MARQUEE -->
    <section class="s-block">
      <div class="sec-h">
        <div><div class="eyebrow">Отзывы с фото реальных букетов</div><h2>Нам доверяют</h2></div>
      </div>
    </section>
    <div class="marq">
      <div class="marq-track">
        <div v-for="(r, i) in marqReviews" :key="i" class="rcard">
          <div class="rh">
            <div class="av">{{ r.n[0] }}</div>
            <div class="rn">{{ r.n }}</div>
            <span class="rs">
              <span :style="{ display: 'inline-flex', gap: '1px', color: 'var(--clay)' }">
                <span v-for="j in 5" :key="j" :style="{ opacity: (j - 1) < r.s ? 1 : 0.25 }" v-html="I.star"></span>
              </span>
            </span>
          </div>
          <p>{{ r.t }}</p>
          <div v-if="r.p > 0" class="rp">
            <div v-for="j in r.p" :key="j" class="rphoto">
              <div class="ph" :style="{ position: 'absolute', inset: 0 }"><span class="lbl">фото</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUBSCRIPTION CTA -->
    <section class="s-block">
      <div class="subcta">
        <div class="sc-t">
          <h3 class="serif">Свежие цветы — по подписке</h3>
          <p>Букет к вашему дню недели со скидкой 15%. Меняйте, ставьте на паузу или отменяйте в один клик.</p>
          <NuxtLink class="btn-primary" to="/subscription">Оформить подписку <span v-html="I.arrow"></span></NuxtLink>
        </div>
        <div class="sc-media">
          <span class="sc-badge">−15%</span>
          <img v-if="subImg" :src="subImg" alt="" class="media-img" />
          <div v-else class="ph" :style="{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, oklch(0.8 0.07 30), oklch(0.85 0.04 60))' }">
            <span class="lbl">фото · букет недели</span>
          </div>
        </div>
      </div>

      <!-- TRUST ROW -->
      <div class="trust-row">
        <div class="tr"><span class="ic" v-html="I.camera"></span><div><div class="tt">Фото перед доставкой</div><div class="td">Покажем букет до отправки</div></div></div>
        <div class="tr"><span class="ic" v-html="I.truck"></span><div><div class="tt">Доставка за 2 часа</div><div class="td">По слотам, без опозданий</div></div></div>
        <div class="tr"><span class="ic" v-html="I.leaf"></span><div><div class="tt">Свежесть 7 дней</div><div class="td">Или заменим букет</div></div></div>
        <div class="tr"><span class="ic" v-html="I.shield"></span><div><div class="tt">Гарантия качества</div><div class="td">2 400 отзывов · 4.9★</div></div></div>
      </div>
    </section>

    <CatalogQuickView :card="quickCard" @close="quickCard = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

useSeoMeta({ title: 'Бутон — цветочная мастерская · СПб' })

const fmt = n => n.toLocaleString('ru-RU')

/* ── живые данные с бэка: баннеры из админки «Баннеры и акции» ── */
const { data: bannersRaw } = await useFetch('/api/banners/active', { default: () => [] })
const banners = computed(() => Array.isArray(bannersRaw.value) ? bannersRaw.value : [])
const bannerImg = (pos, idx = 0) => {
  const list = banners.value.filter(b => b && b.position === pos && b.imageUrl)
  return list[idx] ? list[idx].imageUrl : ''
}
const heroImg = computed(() => bannerImg('hero'))
const constructorImg = computed(() => bannerImg('editorial', 0) || bannerImg('promo', 0))
/* демо-состав для превью «Конструктора букета» */
const CONSTRUCT = [
  { n: 'Пионовидные розы', q: 7, p: '1 750', c: 'oklch(0.74 0.13 8)' },
  { n: 'Кустовая роза', q: 5, p: '900', c: 'oklch(0.83 0.1 48)' },
  { n: 'Эвкалипт', q: 3, p: '360', c: 'oklch(0.66 0.09 150)' },
  { n: 'Атласная лента', q: 1, p: '230', c: 'oklch(0.66 0.13 30)' },
]
const subImg = computed(() => bannerImg('promo', 1) || bannerImg('editorial', 1) || bannerImg('promo', 0))

/* ── живые данные с бэка: товары для секций «Хиты недели» и «Новинки» ── */
const { data: prodRaw } = await useFetch('/api/products', { query: { limit: 8 }, default: () => ({ items: [] }) })
const apiProducts = computed(() => (prodRaw.value && prodRaw.value.items) ? prodRaw.value.items : [])
const TAGc = { 'Хит': 'hit', 'Новинка': 'new', 'Скидка': 'sale' }
const toCard = p => ({ n: p.name, c: p.meta || '', p: p.price || 0, o: p.oldPrice || (p.tag ? Math.round((p.price || 0) * 1.18 / 50) * 50 : 0), r: p.rating || 4.9, tag: p.tag ? [TAGc[p.tag] || 'hit', p.tag] : null, img: (p.images && p.images[0]) || '', m: 'oklch(0.85 0.06 20)', slug: p.slug })

/* inline SVG icons (kept as raw strings, rendered with v-html) */
const I = {
  heart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>',
  camera: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>',
  truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
  leaf: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
}

/* data */
const COLLS = [
  { k: 'mono', n: 'Монобукеты', f: ['Премиальные сорта', 'Без лишних деталей', 'Всегда актуальны'], img: '/home/collection-mono.png', bg: 'oklch(0.94 0.024 18)', to: '/catalog?coll=mono' },
  { k: 'box', n: 'В коробке', f: ['Без вазы', 'Подарочный формат', 'Удобно дарить'], img: '/home/collection-box.png', bg: 'oklch(0.935 0.027 152)', to: '/catalog?coll=box' },
  { k: 'author', n: 'Авторские', f: ['Ручная работа', 'Сезонные цветы', 'Собраны флористом'], img: '/home/collection-author.png', bg: 'oklch(0.945 0.03 64)', to: '/catalog?coll=author' },
  { k: 'wedding', n: 'Свадебные', f: ['Букет невесты', 'Для фотосессий', 'Индивидуальный заказ'], img: '/home/collection-wedding.png', bg: 'oklch(0.93 0.034 198)', to: '/catalog?coll=wed' },
]
const FALLBACK_HITS = [
  { n: 'Белые ночи', c: 'Пионы, ранункулюс, эвкалипт', p: 5200, o: 6100, r: 4.9, tag: ['hit', 'Хит недели'], m: 'oklch(0.85 0.06 20)' },
  { n: 'Невский букет', c: 'Кустовые розы, фрезия', p: 4200, o: 0, r: 4.8, tag: ['new', 'Новинка'], m: 'oklch(0.72 0.06 350)' },
  { n: 'Нежность в коробке', c: 'Пионовидные розы', p: 5800, o: 6900, r: 5.0, tag: ['sale', '−16%'], m: 'oklch(0.8 0.05 30)' },
  { n: 'Летнее поле', c: 'Сезонный микс', p: 3400, o: 0, r: 4.7, tag: null, m: 'oklch(0.78 0.08 110)' },
]
const FALLBACK_NEW = [
  { n: 'Тихий вечер', c: 'Гортензия, эустома', p: 4600, o: 0, r: 4.9, tag: ['new', 'Новинка'], m: 'oklch(0.74 0.06 270)' },
  { n: 'Карамель', c: 'Розы кустовые, статица', p: 3900, o: 0, r: 4.8, tag: ['new', 'Новинка'], m: 'oklch(0.76 0.08 50)' },
  { n: 'Первый снег', c: 'Маттиола, лизиантус', p: 4300, o: 5100, r: 5.0, tag: ['sale', '−15%'], m: 'oklch(0.9 0.02 300)' },
  { n: 'Гранат', c: 'Пионы, гвоздика', p: 5100, o: 0, r: 4.9, tag: null, m: 'oklch(0.62 0.12 25)' },
]
const HITS = computed(() => apiProducts.value.length ? apiProducts.value.slice(0, 4).map(toCard) : FALLBACK_HITS)
const NEW = computed(() => apiProducts.value.length >= 8 ? apiProducts.value.slice(4, 8).map(toCard) : (apiProducts.value.length ? apiProducts.value.slice(0, 4).map(toCard) : FALLBACK_NEW))
/* ── уровни клуба «Бутон» с бэка ── */
const FALLBACK_TIERS = [
  { n: 'Новичок', c: '3%', d: 'кэшбэк баллами с каждого заказа', th: 'Доступен сразу', gold: false },
  { n: 'Постоянный', c: '5%', d: 'кэшбэк + ранний доступ к новинкам', th: 'от 1 000 баллов', gold: false },
  { n: 'Премиум', c: '7%', d: 'кэшбэк + бесплатная доставка', th: 'от 5 000 баллов', gold: true },
]
const TIER_DESC = { novice: 'кэшбэк баллами с каждого заказа', regular: 'кэшбэк + ранний доступ к новинкам', vip: 'кэшбэк + бесплатная доставка' }
const { data: levelsRaw } = await useFetch('/api/bonus/loyalty-levels', { default: () => [] })
const TIERS = computed(() => {
  const lv = Array.isArray(levelsRaw.value) ? [...levelsRaw.value].sort((a, b) => (a.min || 0) - (b.min || 0)) : []
  if (!lv.length) return FALLBACK_TIERS
  const topKey = lv[lv.length - 1]?.key
  return lv.map(t => ({
    n: t.name,
    c: `${t.cashback || 0}%`,
    d: TIER_DESC[t.key] || 'кэшбэк баллами с каждого заказа',
    th: (t.min || 0) === 0 ? 'Доступен сразу' : `от ${fmt(t.min)} баллов`,
    gold: t.key === topKey,
  }))
})

/* ── отзывы с бэка ── */
const FALLBACK_REVIEWS = [
  { n: 'Мария С.', s: 5, t: 'Прислали фото перед доставкой — букет ещё пышнее, чем на сайте. Стоял 9 дней!', p: 0 },
  { n: 'Дмитрий К.', s: 5, t: 'Собрал за час, привезли точно в слот. Пионы свежие, жена в восторге.', p: 0 },
  { n: 'Анна В.', s: 5, t: 'Открытка от руки — приятная мелочь. Заказываю уже третий раз.', p: 0 },
]
const { data: reviewsRaw } = await useFetch('/api/reviews/public', { query: { limit: 10 }, default: () => [] })
const REVIEWS = computed(() => {
  const list = Array.isArray(reviewsRaw.value) ? reviewsRaw.value.filter(r => r && r.text) : []
  if (!list.length) return FALLBACK_REVIEWS
  return list.map(r => ({ n: r.name || 'Гость', s: r.rating || 5, t: r.text, p: 0 }))
})
const marqReviews = computed(() => {
  const base = REVIEWS.value
  return base.length ? [...base, ...base] : []
})

/* likes state */
const likes = ref({ 'Белые ночи': true, 'Тихий вечер': true })
const toggleLike = n => { likes.value = { ...likes.value, [n]: !likes.value[n] } }

/* быстрый просмотр (поп-ап вместо перехода на полную страницу) */
const quickCard = ref(null)
const onCardClick = (e, p) => {
  if (e.target.closest('.like')) { e.preventDefault(); return }            // лайк сам по себе
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return       // открыть в новой вкладке — отдаём браузеру
  e.preventDefault()
  quickCard.value = p
}

/* cart state (local only) */
const cart = ref([
  { id: 'belyenochi', n: 'Белые ночи', c: 'Размер M · открытка', p: 5200, qty: 1, m: 'oklch(0.85 0.06 20)' },
  { id: 'nevsky', n: 'Невский букет', c: 'Размер S', p: 4200, qty: 1, m: 'oklch(0.72 0.06 350)' },
])
const add = p => {
  const key = p.n
  const list = cart.value
  const i = list.findIndex(x => x.id === key)
  if (i >= 0) {
    const next = [...list]
    next[i] = { ...next[i], qty: next[i].qty + 1 }
    cart.value = next
  } else {
    cart.value = [...list, { id: key, n: p.n, c: p.c, p: p.p, qty: 1, m: p.m }]
  }
}

/* countdown to 16:00 */
const left = ref(0)
let timerId = null
const p2 = x => String(x).padStart(2, '0')
const h = computed(() => p2(Math.floor(left.value / 3600)))
const m = computed(() => p2(Math.floor((left.value % 3600) / 60)))
const s = computed(() => p2(left.value % 60))
onMounted(() => {
  const tick = () => {
    const now = new Date()
    const end = new Date(now)
    end.setHours(16, 0, 0, 0)
    if (end < now) end.setDate(end.getDate() + 1)
    left.value = Math.floor((end - now) / 1000)
  }
  tick()
  timerId = setInterval(tick, 1000)
})
onUnmounted(() => { if (timerId) clearInterval(timerId) })
</script>

<style scoped>
/* ===== old design-system tokens (from buton.css :root, oklch) scoped to this page =====
   The app shell may define different global tokens, so we re-declare the OLD values
   on the page wrapper to reproduce the original design exactly. ===== */
.wrap{
  --paper:oklch(1 0 0);
  --paper-2:oklch(0.955 0 0);
  --card:oklch(1 0 0);
  --ink:oklch(0.255 0.018 64);
  --ink-soft:oklch(0.46 0.018 64);
  --ink-faint:oklch(0.62 0.014 70);
  --green:oklch(0.62 0.15 148);
  --green-soft:oklch(0.58 0.1 150);
  --green-wash:oklch(0.95 0.03 150);
  --clay:oklch(0.72 0.15 52);
  --clay-wash:oklch(0.95 0.035 60);
  --blush:oklch(0.8 0.055 24);
  --blush-wash:oklch(0.95 0.022 24);
  --line:oklch(0.912 0 0);
  --line-strong:oklch(0.86 0 0);
  --shadow:0 1px 2px oklch(0.4 0.03 70 / .05), 0 8px 24px oklch(0.4 0.03 70 / .06);
  --shadow-lg:0 2px 6px oklch(0.4 0.03 70 / .07), 0 24px 60px oklch(0.4 0.03 70 / .12);
  --r:14px;
  --r-sm:10px;
  color:var(--ink);
  font-family:'Inter',system-ui,sans-serif;
}

/* ===== shared design-system tokens & classes used by this page (from buton.css) ===== */
.serif{font-family:'Montserrat',Georgia,serif;}
.tnum{font-variant-numeric:tabular-nums;}

/* buttons */
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}
.ghost-btn{text-decoration:none;height:52px;padding:0 18px;border-radius:12px;border:1px solid var(--line-strong);font-weight:600;font-size:15px;color:var(--ink);background:var(--card);display:inline-flex;align-items:center;justify-content:center;gap:9px;transition:.16s;}
.ghost-btn:hover{background:var(--paper-2);border-color:var(--green-soft);}

/* generic chips/badges */
.tag{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;padding:4px 9px;border-radius:6px;}
.tag.hit{background:var(--clay);color:#fff;}
.tag.new{background:var(--green);color:#fff;}
.tag.sale{background:var(--blush);color:oklch(0.32 0.06 24);}
.tag.soft{background:var(--green-wash);color:var(--green);}

/* media placeholder */
.ph{position:relative;background:
  repeating-linear-gradient(135deg, oklch(0.9 0.014 80) 0 11px, oklch(0.93 0.012 82) 11px 22px);
  display:grid;place-items:center;overflow:hidden;}
.ph .lbl{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11.5px;letter-spacing:.04em;color:oklch(0.5 0.02 70);background:oklch(0.98 0.008 84 / .82);padding:5px 10px;border-radius:6px;border:1px solid var(--line);}

/* product card */
.pcard{position:relative;background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--shadow);transition:.16s;cursor:pointer;display:flex;flex-direction:column;text-decoration:none;color:inherit;}
.pcard:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--line-strong);}
.pcard .pm{position:relative;aspect-ratio:4/5;overflow:hidden;}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
.pcard .pm .tag{position:absolute;top:12px;left:12px;}
.pcard .pm .like{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:oklch(1 0 0 / .85);backdrop-filter:blur(5px);display:grid;place-items:center;color:var(--ink-soft);border:1px solid oklch(1 0 0 / .4);transition:transform .14s, color .14s;}
.pcard .pm .like:hover{color:var(--clay);transform:scale(1.08);}
.pcard .pm .like:active{transform:scale(.86);}
.pcard .pm .like.on{color:var(--clay);}
.pcard .pm .like.on :deep(svg){fill:var(--clay);stroke:var(--clay);animation:likepop .32s ease;}
@keyframes likepop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
.pcard .pm .quick{position:absolute;left:50%;top:auto;bottom:16px;transform:translate(-50%,12px);height:42px;padding:0 20px;border-radius:30px;background:oklch(0.99 0.006 84 / .94);backdrop-filter:blur(6px);border:1px solid var(--line);font-weight:600;font-size:13.5px;color:var(--green);display:inline-flex;align-items:center;justify-content:center;gap:7px;white-space:nowrap;opacity:0;transition:.2s;z-index:3;box-shadow:0 8px 20px oklch(0.2 0.02 60 / .2);}
.pcard:hover .pm .quick{opacity:1;transform:translate(-50%,0);}
.pcard .pb{position:absolute;left:10px;right:10px;bottom:10px;padding:13px 14px;display:flex;flex-direction:column;background:var(--card);border-radius:16px;box-shadow:0 10px 26px oklch(0.2 0.02 60 / .18);z-index:2;transition:opacity .22s ease,transform .22s ease;}
.pcard:hover .pb{opacity:0;transform:translateY(10px);pointer-events:none;}
.pcard .prate{font-size:12.5px;color:var(--ink-faint);display:inline-flex;align-items:center;gap:4px;flex:none;}
.pcard .prate>span{color:var(--clay);}
.pcard .prate b{color:var(--ink-soft);}
.pcard .pn{font-weight:600;font-size:15.5px;letter-spacing:-.01em;}
.pcard .pc{font-size:12.5px;color:var(--ink-faint);margin:3px 0 12px;}
.pcard .pp{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;}
.pcard .pp .pprice{display:inline-flex;align-items:baseline;gap:7px;}
.pcard .pp .n{font-weight:700;font-size:17px;font-variant-numeric:tabular-nums;}
.pcard .pp .o{font-size:13px;color:var(--ink-faint);text-decoration:line-through;font-variant-numeric:tabular-nums;}

/* product grid */
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
@media(max-width:980px){.cards{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){
  .cards{display:flex;grid-template-columns:none;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin-inline:-24px;padding-inline:24px;scroll-padding-left:24px;}
  .cards::-webkit-scrollbar{display:none;}
  .cards .pcard{flex:0 0 70%;scroll-snap-align:start;}
}

/* section head */
.sec-h{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap;}
.sec-h h2{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(26px,3vw,34px);letter-spacing:-.015em;line-height:1.05;}
.sec-h .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:8px;}
.sec-h .more{color:var(--green);font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;}
.sec-h .more:hover{gap:9px;}

/* ===== page frame & sections (from Витрина.html <style>) ===== */
.wrap{max-width:1320px;margin:0 auto;padding:30px 24px 140px;}
/* мобиль: 140px снизу — слишком большой провал до футера */
@media(max-width:520px){.wrap{padding:20px 16px 44px;}}

/* hero */
.hero{display:block;margin:8px 0 22px;}
.hero-l{display:flex;flex-direction:column;justify-content:center;max-width:760px;}
.hero .eyebrow{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:18px;}
.hero h1{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(40px,5vw,62px);line-height:1.02;letter-spacing:-.02em;}
.hero h1 em{font-style:italic;color:var(--clay);}
.hero .lead{color:var(--ink-soft);font-size:17px;margin-top:18px;max-width:42ch;line-height:1.5;}
.hero .cta{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap;}
.hero .stats{display:flex;gap:30px;margin-top:34px;flex-wrap:wrap;}
.hero .stats .s .v{font-family:'Montserrat',serif;font-size:28px;font-weight:600;}
.hero .stats .s .k{font-size:12.5px;color:var(--ink-faint);margin-top:1px;}
.hero .stats .s .v .star{color:var(--clay);font-size:20px;}
/* hero media card */
.hero-r{position:relative;}
.hero-media{position:relative;height:100%;min-height:440px;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow-lg);}
.hero-badge{position:absolute;top:18px;left:18px;display:inline-flex;align-items:center;gap:8px;background:oklch(1 0 0 / .9);backdrop-filter:blur(6px);border:1px solid var(--line);border-radius:30px;padding:8px 14px;font-size:13px;font-weight:600;z-index:2;}
.hero-badge .dotpulse{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 0 var(--green);animation:pulse 2s infinite;}
@keyframes pulse{0%{box-shadow:0 0 0 0 oklch(0.62 0.15 148 / .5)}70%{box-shadow:0 0 0 9px oklch(0.62 0.15 148 / 0)}100%{box-shadow:0 0 0 0 oklch(0.62 0.15 148 / 0)}}
.hero-mini{position:absolute;left:16px;right:16px;bottom:16px;background:oklch(0.99 0.006 84 / .94);backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:12px;padding:13px;display:flex;align-items:center;gap:13px;z-index:2;box-shadow:var(--shadow);}
.hero-mini .hm-t{flex:1;}
.hero-mini .hm-t .tag{margin-bottom:5px;}
.hero-mini .hm-t .nm{font-weight:600;font-size:15px;}
.hero-mini .hm-t .cm{font-size:12px;color:var(--ink-faint);}
.hero-mini .hm-p{text-align:right;}
.hero-mini .hm-p .pp{font-weight:700;font-size:17px;}
.hero-mini .hm-add{width:42px;height:42px;border-radius:10px;background:var(--green);color:#fff;display:grid;place-items:center;flex:none;}
.hero-mini .hm-add:hover{background:oklch(0.55 0.15 148);}

/* timer strip */
.timer{display:flex;align-items:center;justify-content:center;gap:14px 18px;background:linear-gradient(100deg, oklch(0.95 0.035 55), oklch(0.93 0.045 30));color:oklch(0.42 0.08 40);border:1px solid oklch(0.85 0.06 45);border-left:4px solid var(--clay);border-radius:var(--r);padding:15px 22px;margin:30px 0;flex-wrap:wrap;text-align:center;}
.timer .tt{font-size:15px;font-weight:500;color:oklch(0.5 0.07 45);}
.timer .tt b{color:var(--clay);font-weight:700;}
.timer .tclock{display:inline-flex;gap:5px;align-items:center;font-variant-numeric:tabular-nums;}
.timer .seg{background:var(--clay);color:#fff;border-radius:7px;padding:5px 9px;font-weight:700;font-size:16px;min-width:38px;display:inline-block;text-align:center;}

/* occasions */
.collgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:40px;}
@media(max-width:560px){.collgrid{grid-template-columns:1fr;}}
.collcard{position:relative;overflow:hidden;border-radius:20px;padding:28px 30px;min-height:236px;display:flex;flex-direction:column;justify-content:center;text-decoration:none;color:var(--ink);transition:transform .18s,box-shadow .18s;}
.collcard:hover{transform:translateY(-3px);box-shadow:0 18px 42px oklch(0.4 0.03 70 / .16);}
.collcard h3{position:relative;z-index:2;font-family:'Inter',system-ui,sans-serif;font-weight:700;font-size:27px;letter-spacing:-.015em;color:oklch(0.3 0.012 280);margin-bottom:18px;}
.collcard .coll-feat{position:relative;z-index:2;display:flex;flex-direction:column;gap:11px;max-width:50%;border:none;}
.collcard .coll-feat span{font-size:16.5px;line-height:1.3;color:oklch(0.48 0.012 285);}
.collcard .cimg{position:absolute;right:14px;bottom:8px;width:54%;height:92%;object-fit:contain;object-position:right bottom;pointer-events:none;filter:drop-shadow(0 10px 20px oklch(0.3 0.03 60 / .12));}
/* коробка и свадебный — крупнее и на самом дне (как в макете) */
.collcard .cimg--mono{bottom:-4px;}
.collcard .cimg--box{width:48%;height:96%;right:18px;bottom:0;}
.collcard .cimg--wedding{width:50%;height:104%;right:44px;bottom:-4px;}
@media(max-width:560px){.collcard{min-height:200px;}.collcard .cimg{width:48%;right:10px;}}

/* section block spacing */
.s-block{margin-top:64px;}

/* constructor promo */
.promo{display:grid;grid-template-columns:1fr 1fr;border-radius:28px;overflow:hidden;background:linear-gradient(150deg, oklch(0.95 0.032 150), oklch(0.93 0.035 122));min-height:300px;}
@media(max-width:760px){.promo{grid-template-columns:1fr;}}
.promo .pr-txt{padding:44px;display:flex;flex-direction:column;justify-content:center;}
.promo .pr-txt .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:14px;}
.promo .pr-txt h3{font-family:'Montserrat',serif;font-weight:500;font-size:32px;letter-spacing:-.01em;line-height:1.08;}
.promo .pr-txt p{color:var(--ink-soft);margin:14px 0 24px;max-width:none;}
.promo .pr-media{position:relative;min-height:280px;display:flex;align-items:center;justify-content:flex-end;padding:36px 44px;}
.promo .pr-media::after{content:'';position:absolute;top:-30%;right:-12%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle, oklch(0.78 0.13 145 / .3), transparent 70%);pointer-events:none;}
.cnstr{position:relative;width:100%;max-width:470px;background:var(--card);border-radius:20px;box-shadow:0 18px 44px oklch(0.3 0.04 150 / .16);padding:22px 26px 20px;}
.cnstr-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cnstr-title{font-weight:700;font-size:15px;color:var(--ink);}
.cnstr-live{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--green);}
.cnstr-live::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--green);animation:cpulse 1.8s infinite;}
@keyframes cpulse{0%{box-shadow:0 0 0 0 oklch(0.62 0.15 148 / .5);}70%{box-shadow:0 0 0 7px oklch(0.62 0.15 148 / 0);}100%{box-shadow:0 0 0 0 oklch(0.62 0.15 148 / 0);}}
.cnstr-rows{list-style:none;margin:0;padding:0;}
.cnstr-row{display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid var(--line);}
.cnstr-row:last-child{border-bottom:none;}
.cnstr-dot{width:12px;height:12px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 2px oklch(1 0 0 / .5);}
.cnstr-name{font-size:13.5px;color:var(--ink);font-weight:500;}
.cnstr-step{display:inline-flex;align-items:center;gap:8px;}
.cnstr-step span{display:grid;place-items:center;width:20px;height:20px;border-radius:6px;background:var(--paper-2);font-size:14px;font-weight:700;color:var(--ink-soft);line-height:1;}
.cnstr-step b{font-size:13px;min-width:12px;text-align:center;font-variant-numeric:tabular-nums;color:var(--ink);}
.cnstr-price{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink);min-width:54px;text-align:right;}
.cnstr-total{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1.5px dashed var(--line);}
.cnstr-total span{font-size:13.5px;color:var(--ink-soft);font-weight:500;}
.cnstr-total b{font-family:'Montserrat',serif;font-size:24px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;}
@media(max-width:760px){.promo .pr-media{min-height:auto;padding:24px;}}

/* loyalty — зелёная панель «Клуб Бутон» */
.loyal-block{position:relative;overflow:hidden;border:none;border-radius:28px;padding:46px 48px;color:#fff;background:linear-gradient(135deg, oklch(0.46 0.1 152), oklch(0.33 0.07 158));}
.loyal-block::before{content:'';position:absolute;top:-45%;right:-8%;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle, oklch(0.72 0.16 150 / .32), transparent 70%);pointer-events:none;}
.loyal-block .lb-top{position:relative;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:28px;}
.loyal-block h2{font-family:'Montserrat',serif;font-weight:600;font-size:32px;color:#fff;letter-spacing:-.01em;}
.loyal-block .lb-top p{color:oklch(0.91 0.03 150);margin-top:8px;max-width:46ch;font-size:14.5px;line-height:1.5;}
.tiers{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.tier{background:oklch(1 0 0 / .08);border:1px solid oklch(1 0 0 / .15);border-radius:18px;padding:22px;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}
.tier.gold{background:oklch(1 0 0 / .15);border-color:var(--clay);box-shadow:inset 0 0 0 1px var(--clay);}
.tier .tr-n{font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:oklch(0.87 0.05 150);}
.tier.gold .tr-n{color:var(--clay);}
.tier .tr-c{font-family:'Montserrat',serif;font-size:38px;font-weight:700;color:#fff;margin:6px 0 2px;line-height:1;}
.tier .tr-d{font-size:13px;color:oklch(0.9 0.02 150);line-height:1.45;}
.tier .tr-th{font-size:12px;color:oklch(0.82 0.03 150);margin-top:14px;padding-top:12px;border-top:1px solid oklch(1 0 0 / .15);}
@media(max-width:760px){
  .loyal-block{padding:30px 22px;border-radius:22px;}
  .loyal-block::before{width:300px;height:300px;}
  .loyal-block h2{font-size:25px;}
  .loyal-block .lb-top{margin-bottom:20px;}
  .tiers{grid-template-columns:1fr;gap:10px;}
  .tier{padding:15px 18px;display:grid;grid-template-columns:auto 1fr;grid-template-areas:"pct name" "pct desc" "th th";align-items:center;column-gap:18px;}
  .tier .tr-c{grid-area:pct;font-size:34px;margin:0;align-self:center;}
  .tier .tr-n{grid-area:name;}
  .tier .tr-d{grid-area:desc;}
  .tier .tr-th{grid-area:th;margin-top:12px;padding-top:10px;}
}

/* reviews marquee */
.marq{overflow:hidden;position:relative;}
.marq::before,.marq::after{content:"";position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none;}
.marq::before{left:0;background:linear-gradient(90deg,var(--paper),transparent);}
.marq::after{right:0;background:linear-gradient(270deg,var(--paper),transparent);}
.marq-track{display:flex;gap:16px;width:max-content;animation:scroll 46s linear infinite;}
.marq:hover .marq-track{animation-play-state:paused;}
@keyframes scroll{to{transform:translateX(-50%);}}
.rcard{width:340px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;flex:none;}
.rcard .rh{display:flex;align-items:center;gap:11px;margin-bottom:10px;}
.rcard .av{width:36px;height:36px;border-radius:50%;background:var(--green-wash);color:var(--green);display:grid;place-items:center;font-weight:700;}
.rcard .rn{font-weight:600;font-size:13.5px;}
.rcard .rs{margin-left:auto;color:var(--clay);font-size:11px;}
.rcard p{font-size:13.5px;color:var(--ink-soft);line-height:1.5;}
.rcard .rp{display:flex;gap:7px;margin-top:11px;}
.rcard .rp .rphoto{position:relative;width:54px;height:54px;border-radius:8px;border:1px solid var(--line);overflow:hidden;}
.rcard .rp .rphoto .lbl{font-size:8px;padding:2px 4px;}

/* subscription cta */
.subcta{display:grid;grid-template-columns:1.2fr 1fr;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:var(--clay-wash);}
.subcta .sc-t{padding:40px;}
.subcta .sc-t h3{font-family:'Montserrat',serif;font-weight:500;font-size:30px;letter-spacing:-.01em;}
.subcta .sc-t p{color:oklch(0.42 0.05 47);margin:12px 0 22px;max-width:38ch;}
.subcta .sc-media{position:relative;min-height:220px;}
.subcta .sc-badge{display:none;position:absolute;top:14px;left:14px;z-index:3;padding:7px 13px;border-radius:999px;background:var(--clay);color:#fff;font-weight:700;font-size:13px;box-shadow:0 4px 14px oklch(0.2 0.02 50 / .32);}
/* мобиль: вместо «текст-сверху + пустая полоса с фото снизу» — единый баннер,
   фото на всю площадь, тёплый скрим снизу, текст и бейдж поверх */
@media(max-width:760px){
  .subcta{display:block;position:relative;min-height:430px;border-color:transparent;}
  .subcta .sc-media{position:absolute;inset:0;min-height:0;}
  .subcta .sc-media::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,oklch(0.2 0.02 50 / .93) 6%,oklch(0.2 0.02 50 / .6) 40%,oklch(0.2 0.02 50 / .1) 74%);}
  .subcta .sc-badge{display:inline-flex;}
  .subcta .sc-t{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:0 22px 26px;}
  .subcta .sc-t h3{color:#fff;font-size:25px;line-height:1.14;text-wrap:balance;}
  .subcta .sc-t p{color:oklch(1 0 0 / .86);margin:10px 0 18px;max-width:32ch;}
}

/* trust strip row */
.trust-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px;}
@media(max-width:760px){.trust-row{grid-template-columns:repeat(2,1fr);}}
.trust-row .tr{display:flex;gap:12px;align-items:flex-start;padding:18px;background:var(--card);border:1px solid var(--line);border-radius:12px;}
.trust-row .tr .ic{width:38px;height:38px;border-radius:10px;background:var(--green-wash);color:var(--green);display:grid;place-items:center;flex:none;}
.trust-row .tr .tt{font-weight:600;font-size:14px;}
.trust-row .tr .td{font-size:12.5px;color:var(--ink-faint);margin-top:2px;}
/* мобиль: на узкой карточке горизонтальная раскладка ломает заголовок по слову —
   ставим иконку сверху, текст получает всю ширину карточки */
@media(max-width:520px){
  .trust-row{gap:10px;margin-top:22px;}
  .trust-row .tr{flex-direction:column;align-items:flex-start;gap:10px;padding:15px 14px;}
  .trust-row .tr .ic{width:34px;height:34px;border-radius:9px;}
  .trust-row .tr .tt{font-size:13.5px;line-height:1.25;text-wrap:balance;}
  .trust-row .tr .td{font-size:12px;line-height:1.35;text-wrap:pretty;}
}
</style>
