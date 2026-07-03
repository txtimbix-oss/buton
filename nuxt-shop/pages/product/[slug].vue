<template>
  <div class="wrap">
    <!-- BREADCRUMBS -->
    <div class="crumbs">
      <NuxtLink to="/">Главная</NuxtLink><span class="sep">/</span>
      <NuxtLink to="/catalog">Каталог</NuxtLink><span class="sep">/</span>
      <NuxtLink to="/catalog">Авторские</NuxtLink><span class="sep">/</span><span>{{ title }}</span>
    </div>

    <div class="pdp">
      <!-- GALLERY -->
      <div class="gallery">
        <div class="ph gmain" style="position:relative">
          <img v-if="mainImage" :src="mainImage" :alt="title" class="media-img" />
          <span v-else class="lbl">ФОТО БУКЕТА · 4:5</span>
        </div>
        <div class="gthumbs">
          <div
            v-for="(t, i) in GALLERY_THUMBS"
            :key="i"
            :class="['gthumb', { on: thumb === i }]"
            @click="thumb = i"
          >
            <div class="ph" style="position:absolute;inset:0;border-radius:9px">
              <img v-if="hasImages" :src="t" :alt="title" class="media-img" />
              <span v-else class="lbl">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BUY -->
      <div class="buy">
        <div class="rating">
          <Stars :n="5" />
          <b style="color:var(--ink)">4.9</b>
          <a href="#reviews">213 отзывов</a>
          <span class="dot" style="color:var(--ink-faint)">·</span>
          <span style="color:var(--green-soft);font-weight:600">В наличии · соберём за 2 часа</span>
        </div>
        <h1 class="ptitle serif">{{ title }}</h1>
        <p class="psub">{{ subtitle }}</p>

        <div class="trust-strip">
          <span class="t"><span class="ic" v-html="I.camera"></span> Фото перед доставкой</span>
          <span class="t"><span class="ic" v-html="I.leaf"></span> Свежесть 7 дней</span>
          <span class="t"><span class="ic" v-html="I.shield"></span> Замена при браке</span>
        </div>

        <div class="pricerow">
          <span class="now serif tnum">{{ fmt(total) }} ₽</span>
          <span v-if="sizeObj.old > 0" class="old tnum">{{ fmt(oldTotal) }} ₽</span>
          <span v-if="save > 0" class="save">Выгода {{ fmt(save) }} ₽</span>
        </div>

        <!-- SIZE -->
        <div class="block">
          <div class="bh"><span class="bt">Размер букета</span><span class="bhint">влияет на пышность и цену</span></div>
          <div class="sizes">
            <button
              v-for="s in SIZES"
              :key="s.id"
              :class="['size', { on: size === s.id }]"
              @click="size = s.id"
            >
              <span v-if="s.rec" class="rec">Выбор гостей</span>
              <div class="sz">{{ s.name.split(' · ')[0] }}</div>
              <div class="sd">{{ s.desc }}</div>
              <div class="sp tnum">{{ fmt(s.price) }} ₽</div>
            </button>
          </div>
        </div>

        <!-- OCCASION -->
        <div class="block">
          <div class="bh"><span class="bt">Повод</span><span class="bhint">подберём открытку и тон</span></div>
          <div class="occ-chips">
            <button
              v-for="o in OCCASIONS"
              :key="o.id"
              :class="['opt', { on: occasion === o.id }]"
              @click="occasion = o.id"
            >
              <span v-if="o.em" class="em">{{ o.em }}</span>{{ o.name }}
            </button>
          </div>
        </div>

        <!-- POSTCARD -->
        <div class="block">
          <div :class="['cardsw', { on: cardOn }]" @click="cardOn = !cardOn">
            <div class="sw-txt">
              <div class="st"><span class="ic" v-html="I.card"></span> Открытка с текстом</div>
              <div class="sd">Напишем от руки и вложим в букет — бесплатно</div>
            </div>
            <div class="toggle"></div>
          </div>
          <div v-if="cardOn" class="cardbox">
            <div class="carddesigns">
              <div
                v-for="d in CARD_DESIGNS"
                :key="d.id"
                :class="['carddesign', { on: cardDesign === d.id }]"
                style="color:var(--clay)"
                @click="cardDesign = d.id"
              >{{ d.em }}</div>
              <div style="align-self:center;font-size:12.5px;color:var(--ink-faint)">дизайн открытки</div>
            </div>
            <textarea
              class="cardtext"
              maxlength="200"
              placeholder="Например: «С днём рождения! Пусть каждый день будет таким же светлым, как эти цветы.»"
              v-model="cardText"
            ></textarea>
            <div class="cardmeta"><span>Почерк флориста, чёрные чернила</span><span class="tnum">{{ cardText.length }}/200</span></div>
          </div>
          <div class="anon-note">
            <span class="ic" v-html="I.eyeoff"></span>
            <span>Анонимную доставку можно включить при оформлении заказа</span>
          </div>
        </div>

        <!-- ADDONS -->
        <div class="block">
          <div class="bh"><span class="bt">Дополнить букет</span><span class="bhint">по желанию</span></div>
          <div class="addons">
            <div
              v-for="a in ADDONS"
              :key="a.id"
              :class="['addon', { on: addons[a.id] }]"
            >
              <div class="ph am" :style="{ background: a.color }"></div>
              <div class="ai"><div class="an">{{ a.display || a.name }}</div><div class="ap tnum">+{{ fmt(a.price) }} ₽</div></div>
              <button :class="['addbtn', { on: addons[a.id] }]" @click="toggleAddon(a.id)">{{ addons[a.id] ? '✓' : '+' }}</button>
            </div>
          </div>
        </div>

        <!-- PURCHASE -->
        <div class="purchase">
          <div class="qty">
            <button @click="qty = Math.max(1, qty - 1)">−</button>
            <span class="qn tnum">{{ qty }}</span>
            <button @click="qty = Math.min(20, qty + 1)">+</button>
          </div>
          <NuxtLink v-if="added" class="btn-primary" to="/cart" style="text-decoration:none">Перейти в корзину →</NuxtLink>
          <button v-else class="btn-primary" @click="addToCart">В корзину<span class="pr tnum">{{ fmt(total) }} ₽</span></button>
          <button :class="['icon-square', { on: wished }]" @click="wishlist.toggle(String(route.params.slug))"><span class="ic" v-html="I.heart"></span></button>
        </div>
        <div class="loyal-line">
          <span class="ic" v-html="I.star"></span>
          <span>Вернём <b>{{ fmt(points) }} {{ plural(points, ['балл', 'балла', 'баллов']) }}</b> — оплатите ими до 30% следующего заказа</span>
        </div>
        <div class="deliv-note">
          <span class="ic" v-html="I.truck"></span>
          <span>Доставим <b style="color:var(--ink)">сегодня к 18:00</b>, если оформите до 16:00. Перед отправкой пришлём фото готового букета в WhatsApp.</span>
        </div>
      </div>
    </div>

    <!-- ===== LOWER SECTIONS ===== -->
    <div class="sections">
      <section>
        <div class="specgrid">
          <div class="sc" v-for="(s, i) in SPECS" :key="i">
            <div class="sv">{{ s[0] }}</div>
            <div class="sk">{{ s[1] }}</div>
          </div>
        </div>
      </section>

      <div class="compo-group">
        <div class="two">
          <section class="panelcard">
            <div class="sec-title serif" style="font-size:22px;margin-bottom:14px">Состав</div>
            <div class="complist">
              <div class="comp" v-for="(c, i) in COMPOSITION" :key="i">
                <span class="ic" v-html="flowerIcon(c.c, c.core, c.id, 26, 11)"></span>
                <span class="cn">{{ c.n }}</span>
                <span class="cq">{{ c.q }}</span>
              </div>
            </div>
          </section>
          <section class="panelcard">
            <div class="sec-title serif" style="font-size:22px;margin-bottom:14px">Уход за букетом</div>
            <div class="carelist">
              <div class="care" v-for="(c, i) in CARE" :key="i"><span class="num">{{ i + 1 }}</span><span>{{ c }}</span></div>
            </div>
          </section>
        </div>
        <div class="whom-strip">
          <span class="whom-lbl">
            <span class="ic" style="vertical-align:-2px;margin-right:5px;color:var(--clay)" v-html="DECO_ICON"></span>Идеально в подарок
          </span>
          <span :class="['wchip', 'wc' + (i % 5)]" v-for="(w, i) in WHOM" :key="i">{{ w }}</span>
        </div>
      </div>

      <!-- REVIEWS -->
      <section id="reviews">
        <div class="sec-title serif">Отзывы · 213</div>
        <div class="rev-head">
          <div class="rev-score">
            <div class="big serif">4.9</div>
            <div>
              <Stars :n="5" />
              <div style="font-size:13px;color:var(--ink-faint);margin-top:4px">на основе 213 оценок</div>
            </div>
          </div>
          <div class="rev-bars">
            <div class="rev-bar" v-for="row in REV_BARS" :key="row[0]">
              <span>{{ row[0] }}★</span>
              <span class="track"><span class="fill" :style="{ width: row[1] + '%' }"></span></span>
              <span class="tnum">{{ row[1] }}%</span>
            </div>
          </div>
          <button class="ghost-btn" style="height:44px;margin-left:auto">Оставить отзыв</button>
        </div>
        <div class="revgrid">
          <div class="review" v-for="(r, i) in REVIEWS" :key="i">
            <div class="rt">
              <div class="av">{{ r.n[0] }}</div>
              <div><div class="rn">{{ r.n }}</div><div class="rd">{{ r.d }}</div></div>
              <Stars :n="r.s" />
            </div>
            <p>{{ r.t }}</p>
            <div v-if="r.photos > 0" class="rphotos">
              <div class="rphoto" v-for="j in r.photos" :key="j">
                <div class="ph" style="position:absolute;inset:0;border-radius:9px"><span class="lbl">фото</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- RELATED -->
      <section>
        <div class="sec-title serif">С этим букетом заказывают</div>
        <div class="cards">
          <NuxtLink
            v-for="(p, i) in RELATED" :key="i"
            class="pcard"
            :to="p.slug ? `/product/${p.slug}` : '/catalog'"
            style="text-decoration:none;color:inherit"
          >
            <div class="pm">
              <img v-if="p.img" :src="p.img" :alt="p.n" class="media-img" />
              <div v-else class="ph" style="position:absolute;inset:0"><span class="lbl">фото букета</span></div>
              <span v-if="p.tag" :class="['tag', p.tag[0]]">{{ p.tag[1] }}</span>
              <button class="like" :class="{ on: isWished(p.slug) }" @click.prevent="p.slug && wishlist.toggle(p.slug)"><span class="ic" v-html="I.heart"></span></button>
            </div>
            <div class="pb">
              <div class="pn">{{ p.n }}</div>
              <div class="pc">{{ p.c }}</div>
              <div class="pp">
                <span class="n tnum">{{ fmt(p.p) }} ₽</span>
                <span v-if="p.o > 0" class="o tnum">{{ fmt(p.o) }} ₽</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- mobile sticky -->
    <div class="mbar">
      <div class="mp">
        <span class="k">{{ sizeObj.name.split(' · ')[0] }} · {{ qty }} шт</span>
        <span class="v serif tnum">{{ fmt(total) }} ₽</span>
      </div>
      <NuxtLink v-if="added" class="btn-primary" to="/cart" style="text-decoration:none">Перейти в корзину →</NuxtLink>
      <button v-else class="btn-primary" @click="addToCart">В корзину</button>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { createCartLine } from '~/lib/cart/createCartLine'

/* ---------------- fetch real product by slug ---------------- */
const route = useRoute()
const cart = useCart()
const wishlist = useWishlist()
const isWished = slug => wishlist.slugs.value.includes(slug)
const { data: product } = await useFetch(() => '/api/products/' + route.params.slug, { default: () => null })
/* отзывы товара с бэка */
const { data: reviewsRaw } = await useFetch(() => '/api/reviews/product/' + route.params.slug, { default: () => [] })
/* рекомендации «с этим заказывают» с бэка */
const { data: recsRaw } = await useFetch(() => '/api/products/' + route.params.slug + '/recommendations', { default: () => [] })
/* запасной пул реальных товаров из каталога (если рекомендаций нет) */
const { data: relPool } = await useFetch('/api/products/catalog', { query: { limit: 6 }, default: () => ({ items: [] }) })

useSeoMeta({
  title: computed(() => (product.value?.name ? product.value.name + ' — Бутон' : 'Букет — Бутон')),
})

/* ---------------- helpers ---------------- */
const fmt = n => Number(n || 0).toLocaleString('ru-RU')
const plural = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}

/* ---------------- data ---------------- */
const SIZES_DEFAULT = [
  { id: 'S', name: 'S · Камерный', desc: '11 стеблей · 35 см', price: 3900, old: 0 },
  { id: 'M', name: 'M · Классический', desc: '19 стеблей · 45 см', price: 5200, old: 6100, rec: true },
  { id: 'L', name: 'L · Роскошный', desc: '27 стеблей · 55 см', price: 7400, old: 8600 },
]
const OCCASIONS = [
  { id: 'birthday', em: '🎂', name: 'День рождения' },
  { id: 'love', em: '❤️', name: 'Любовь' },
  { id: 'wedding', em: '💍', name: 'Свадьба' },
  { id: 'sorry', em: '🕊', name: 'Извинения' },
  { id: 'thanks', em: '🙏', name: 'Благодарность' },
  { id: 'none', em: '', name: 'Без повода' },
]
const CARD_DESIGNS = [
  { id: 'mini', em: '✿', label: 'Мини' },
  { id: 'kraft', em: '❦', label: 'Крафт' },
  { id: 'photo', em: '❤', label: 'Сердце' },
]
const ADDON_COLORS = [
  'oklch(0.72 0.05 70)',
  'oklch(0.42 0.06 50)',
  'oklch(0.82 0.03 230)',
  'oklch(0.78 0.07 20)',
]
const ADDONS_DEFAULT = [
  { id: 'bear', name: 'Мишка Тедди', price: 1200, color: ADDON_COLORS[0] },
  { id: 'choco', name: 'Конфеты Lindt', price: 990, color: ADDON_COLORS[1] },
  { id: 'vase', name: 'Стеклянная ваза', price: 1500, color: ADDON_COLORS[2] },
  { id: 'balloon', name: 'Связка шаров', price: 850, color: ADDON_COLORS[3] },
]
const COMPOSITION_PALETTE = [
  { id: 'peony', c: 'oklch(0.84 0.07 18)', core: 'oklch(0.72 0.1 22)' },
  { id: 'ranunculus', c: 'oklch(0.93 0.05 88)', core: 'oklch(0.82 0.09 75)' },
  { id: 'leaf', c: 'oklch(0.62 0.05 165)', core: 'oklch(0.62 0.05 165)' },
  { id: 'default', c: 'oklch(0.9 0.014 100)', core: 'oklch(0.82 0.02 100)' },
]
const COMPOSITION_DEFAULT = [
  { n: 'Пионы розовые', q: '7 шт', id: 'peony', c: 'oklch(0.84 0.07 18)', core: 'oklch(0.72 0.1 22)' },
  { n: 'Ранункулюс', q: '6 шт', id: 'ranunculus', c: 'oklch(0.93 0.05 88)', core: 'oklch(0.82 0.09 75)' },
  { n: 'Эвкалипт', q: '4 ветки', id: 'leaf', c: 'oklch(0.62 0.05 165)', core: 'oklch(0.62 0.05 165)' },
  { n: 'Гипсофила', q: '2 ветки', id: 'default', c: 'oklch(0.9 0.014 100)', core: 'oklch(0.82 0.02 100)' },
]
const CARE_DEFAULT = [
  'Подрежьте стебли под углом 45° на 2–3 см.',
  'Меняйте воду каждые 2 дня, мойте вазу.',
  'Держите вдали от фруктов, сквозняков и прямого солнца.',
  'Удаляйте увядшие листья ниже уровня воды.',
]
const WHOM = ['Маме', 'Любимой', 'Коллеге', 'Подруге', 'Жене', 'Без повода']
const FALLBACK_REVIEWS = [
  { n: 'Мария С.', d: '2 недели назад', s: 5, t: 'Заказывала маме на юбилей. Прислали фото перед доставкой — букет ещё пышнее, чем на сайте. Стоял 9 дней!', photos: 0 },
  { n: 'Дмитрий К.', d: 'месяц назад', s: 5, t: 'Собрал за час, привезли точно в слот 16:00–18:00. Пионы свежие, упаковка аккуратная. Жена в восторге.', photos: 0 },
  { n: 'Анна В.', d: 'месяц назад', s: 4, t: 'Красивый букет, но хотелось чуть больше зелени. В остальном всё на высоте, открытка от руки — приятная мелочь.', photos: 0 },
]
const revDate = iso => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) } catch { return '' }
}
const REVIEWS = computed(() => {
  const list = Array.isArray(reviewsRaw.value) ? reviewsRaw.value.filter(r => r && r.text) : []
  if (!list.length) return FALLBACK_REVIEWS
  return list.map(r => ({ n: r.name || 'Гость', d: revDate(r.createdAt), s: r.rating || 5, t: r.text, photos: 0 }))
})
const FALLBACK_RELATED = [
  { n: 'Невский букет', c: 'Кустовые розы, фрезия', p: 4200, o: 0, tag: ['new', 'Новинка'], slug: '', img: '' },
  { n: 'Нежность в коробке', c: 'Пионовидные розы', p: 5800, o: 6900, tag: ['sale', '−16%'], slug: '', img: '' },
  { n: 'Летнее поле', c: 'Сезонный микс', p: 3400, o: 0, tag: ['hit', 'Хит'], slug: '', img: '' },
  { n: 'Свадебный пион', c: 'Розы, гипсофила', p: 6500, o: 0, tag: null, slug: '', img: '' },
]
const TAGc_REL = { 'Хит': 'hit', 'Новинка': 'new', 'Скидка': 'sale', 'Премиум': 'hit' }
const mapRel = p => ({
  n: p.name,
  c: p.meta || '',
  p: p.price || 0,
  o: p.oldPrice || 0,
  tag: p.tag ? [TAGc_REL[p.tag] || 'hit', p.tag] : null,
  slug: p.slug || '',
  img: (p.images && p.images[0]) || '',
})
const RELATED = computed(() => {
  const recs = Array.isArray(recsRaw.value) ? recsRaw.value : []
  if (recs.length) return recs.slice(0, 4).map(mapRel)
  // нет рекомендаций на бэке → берём реальные товары из каталога (без текущего)
  const pool = (relPool.value?.items || []).filter(p => p.slug && p.slug !== route.params.slug)
  if (pool.length) return pool.slice(0, 4).map(mapRel)
  return FALLBACK_RELATED
})
const GALLERY_THUMBS_DEFAULT = ['общий', 'сверху', 'деталь', 'упаковка', 'в руке']
const SPECS = [
  ['19', 'стеблей'], ['45 см', 'высота'], ['35 см', 'диаметр'],
  ['≈1,2 кг', 'вес'], ['Плёнка', 'упаковка'], ['7 дней', 'свежесть'],
]
const REV_BARS = [[5, 89], [4, 8], [3, 2], [2, 1], [1, 0]]

/* ---------------- product → view-model (safe fallbacks) ---------------- */
const title = computed(() => product.value?.name || 'Белые ночи')
const subtitle = computed(() =>
  product.value?.description ||
  product.value?.meta ||
  'Воздушная композиция из пионов и ранункулюса с серебристым эвкалиптом — нежная и тихая, как петербургское лето.'
)

/* gallery: main = images[0], thumbs follow images; fallback to placeholder labels */
const images = computed(() => {
  const imgs = product.value?.images
  return Array.isArray(imgs) ? imgs.filter(Boolean) : []
})
const hasImages = computed(() => images.value.length > 0)
const mainImage = computed(() => images.value[thumb.value] ?? images.value[0] ?? null)
const GALLERY_THUMBS = computed(() =>
  hasImages.value ? images.value : GALLERY_THUMBS_DEFAULT
)

/* SIZES: map {label, desc, price}; mark the middle one as recommended */
const SIZES = computed(() => {
  const arr = product.value?.sizes
  if (!Array.isArray(arr) || !arr.length) return SIZES_DEFAULT
  const rec = Math.floor(arr.length / 2)
  return arr.map((s, i) => ({
    id: s.label || String(i),
    name: s.label || ('Размер ' + (i + 1)),
    desc: s.desc || '',
    price: Number(s.price) || 0,
    old: 0,
    rec: i === rec,
  }))
})

/* COMPOSITION: map {name, qty}; assign palette/flower icon by index */
const COMPOSITION = computed(() => {
  const arr = product.value?.composition
  if (!Array.isArray(arr) || !arr.length) return COMPOSITION_DEFAULT
  return arr.map((c, i) => {
    const pal = COMPOSITION_PALETTE[i % COMPOSITION_PALETTE.length]
    return { n: c.name || '', q: c.qty || '', id: pal.id, c: pal.c, core: pal.core }
  })
})

/* CARE: split careInstructions string on '. ' into steps */
const CARE = computed(() => {
  const raw = product.value?.careInstructions
  if (typeof raw !== 'string' || !raw.trim()) return CARE_DEFAULT
  return raw
    .split('. ')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => (/[.!?…]$/.test(s) ? s : s + '.'))
})

/* ADDONS: map {name, price, display}; cycle through swatch colors */
const ADDONS = computed(() => {
  const arr = product.value?.addons
  if (!Array.isArray(arr) || !arr.length) return ADDONS_DEFAULT
  return arr.map((a, i) => ({
    id: a.name || String(i),
    name: a.name || '',
    price: Number(a.price) || 0,
    display: a.display || a.name || '',
    color: ADDON_COLORS[i % ADDON_COLORS.length],
  }))
})

/* ---------------- inline svg icons ---------------- */
const I = {
  heart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/></svg>',
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>',
  truck: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
  camera: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>',
  leaf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>',
  shield: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  card: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>',
  eyeoff: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9 9 0 0 1 21 12a14 14 0 0 1-2.3 3M6.1 6.2A14 14 0 0 0 3 12a9 9 0 0 0 12 5"/></svg>',
}
const DECO_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><circle cx="12" cy="12" r="2.6"/></svg>'

/* ---- stars component (render fn) ---- */
const Stars = (props) => {
  const n = props.n ?? 5
  return h('span', { class: 'stars' },
    Array.from({ length: 5 }).map((_, i) =>
      h('span', { key: i, style: { opacity: i < n ? 1 : 0.25 }, innerHTML: I.star })
    )
  )
}

/* ---- minimalist cartoon flower heads (returns svg string) ---- */
function ring(count, dist, prx, pry, fill, stroke, phase) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const deg = (i / count) * 360 + (phase || 0)
    const sw = stroke === 'none' ? 0 : Math.max(0.6, pry * 0.08)
    out += `<g transform="rotate(${deg})"><ellipse cx="0" cy="${-dist}" rx="${prx}" ry="${pry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`
  }
  return out
}
function flowerHead(c, core, id, R) {
  const st = 'oklch(0 0 0 / .13)', lite = 'oklch(1 0 0 / .24)'
  let el = ''
  if (id === 'peony') {
    el = ring(9, R * 0.55, R * 0.42, R * 0.52, c, st, 0)
       + ring(7, R * 0.32, R * 0.34, R * 0.42, c, st, 20)
       + ring(6, R * 0.18, R * 0.26, R * 0.32, lite, 'none', 0)
       + `<circle r="${R * 0.16}" fill="${core}"/>`
  } else if (id === 'ranunculus') {
    el = ring(11, R * 0.62, R * 0.26, R * 0.36, c, st, 0)
       + ring(9, R * 0.42, R * 0.22, R * 0.3, c, st, 16)
       + ring(7, R * 0.24, R * 0.2, R * 0.26, lite, 'none', 8)
       + `<circle r="${R * 0.12}" fill="${core}"/>`
  } else if (id === 'leaf') {
    el = `<line x1="0" y1="${R * 0.85}" x2="0" y2="${-R * 0.85}" stroke="${c}" stroke-width="${Math.max(1, R * 0.1)}" stroke-linecap="round"/>`
    const ts = [-0.5, -0.15, 0.2, 0.55]
    ts.forEach((t, j) => {
      const ly = t * R, sx = (j % 2 ? 1 : -1) * R * 0.26
      el += `<ellipse cx="${sx}" cy="${ly}" rx="${R * 0.2}" ry="${R * 0.36}" fill="${c}" transform="rotate(${j % 2 ? 38 : -38} ${sx} ${ly})"/>`
    })
  } else {
    el = ring(6, R * 0.5, R * 0.4, R * 0.52, c, st, 0)
       + ring(6, R * 0.28, R * 0.3, R * 0.4, lite, 'none', 30)
       + `<circle r="${R * 0.18}" fill="${core}"/>`
  }
  return `<g transform="translate(12 12)">${el}</g>`
}
function flowerIcon(c, core, id, size = 24, R = 10) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="overflow:visible;flex:none">${flowerHead(c, core, id, R)}</svg>`
}

/* ---------------- state ---------------- */
const thumb = ref(0)
const size = ref(null)
const occasion = ref('birthday')
const cardOn = ref(true)
const cardDesign = ref('mini')
const cardText = ref('')
const addons = ref({})
const qty = ref(1)
const wished = computed(() => wishlist.slugs.value.includes(String(route.params.slug)))
const added = ref(false)

/* default selected size = recommended (or first); re-sync when product loads */
watch(SIZES, (list) => {
  const found = list.find(s => s.id === size.value)
  if (!found) size.value = (list.find(s => s.rec) || list[0])?.id ?? null
}, { immediate: true })

/* keep thumb in range when gallery changes */
watch(GALLERY_THUMBS, (list) => {
  if (thumb.value >= list.length) thumb.value = 0
})

/* ---------------- derived ---------------- */
const sizeObj = computed(() =>
  SIZES.value.find(s => s.id === size.value) || SIZES.value[0] ||
  { id: '', name: '', desc: '', price: Number(product.value?.price) || 0, old: 0 }
)
const addonsTotal = computed(() => ADDONS.value.reduce((a, x) => a + (addons.value[x.id] ? x.price : 0), 0))
const unit = computed(() => (sizeObj.value.price || Number(product.value?.price) || 0) + addonsTotal.value)
const total = computed(() => unit.value * qty.value)
const oldTotal = computed(() =>
  (sizeObj.value.old ? sizeObj.value.old : sizeObj.value.price) * qty.value + addonsTotal.value * qty.value
)
const save = computed(() => (sizeObj.value.old ? (sizeObj.value.old - sizeObj.value.price) * qty.value : 0))
const points = computed(() => Math.round(total.value * 0.05))

/* ---------------- actions ---------------- */
function toggleAddon(id) {
  addons.value = { ...addons.value, [id]: !addons.value[id] }
}
function addToCart() {
  const chosenAddons = ADDONS.value.filter(a => addons.value[a.id]).map(a => a.name)
  cart.addLine(createCartLine({
    slug: String(route.params.slug),
    name: title.value,
    bloom: product.value?.bloom || 'rose',
    image: mainImage.value || undefined,
    meta: sizeObj.value.name || subtitle.value,
    sizeLabel: sizeObj.value.name || '',
    price: unit.value,
    qty: qty.value,
    addons: chosenAddons,
  }))
  added.value = true
}
watch([size, qty, () => JSON.stringify(addons.value), occasion], () => {
  added.value = false
})
</script>

<style scoped>
/* ---- old design-system tokens (oklch), scoped to this page ---- */
.wrap{
  --paper:oklch(0.985 0 0);
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
  color:var(--ink);
  font-family:'Inter',system-ui,sans-serif;
}
.wrap :deep(button){font-family:inherit;cursor:pointer;color:inherit;border:none;background:none;}
.wrap :deep(textarea){font-family:inherit;}

.pdp{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:42px;align-items:start;}
@media(max-width:1040px){.pdp{grid-template-columns:1fr;gap:28px;}}

/* gallery */
.gallery{position:sticky;top:84px;}
@media(max-width:1040px){.gallery{position:static;}}
.gmain{aspect-ratio:4/5;border-radius:var(--r);border:1px solid var(--line);box-shadow:var(--shadow);}
.gmain .lbl{font-size:12.5px;}
.gthumbs{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:12px;}
.gthumb{position:relative;aspect-ratio:1/1;border-radius:10px;border:1px solid var(--line);cursor:pointer;overflow:hidden;}
.gthumb.on{outline:2px solid var(--green);outline-offset:1px;}
.gthumb .lbl{font-size:9px;padding:3px 5px;}

/* info column */
.buy{display:flex;flex-direction:column;}
.rating{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--ink-soft);margin-bottom:12px;flex-wrap:wrap;}
.stars{display:inline-flex;gap:1px;color:var(--clay);}
.rating a{color:var(--green);text-decoration:none;border-bottom:1px solid color-mix(in oklab,var(--green),transparent 70%);}
.ptitle{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(32px,4vw,46px);line-height:1.04;letter-spacing:-.015em;}
.psub{color:var(--ink-soft);font-size:15.5px;margin-top:8px;}
.trust-strip{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 4px;}
.trust-strip .t{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:500;color:var(--ink-soft);background:var(--card);border:1px solid var(--line);border-radius:30px;padding:6px 12px;}
.trust-strip .t :deep(svg){color:var(--green-soft);}

.pricerow{display:flex;align-items:baseline;gap:12px;margin:22px 0 6px;}
.pricerow .now{font-family:'Montserrat',serif;font-size:40px;font-weight:600;letter-spacing:-.01em;}
.pricerow .old{font-size:19px;color:var(--ink-faint);text-decoration:line-through;}
.pricerow .save{font-size:12.5px;font-weight:700;background:var(--blush);color:oklch(0.32 0.06 24);padding:4px 9px;border-radius:6px;}

.block{margin-top:24px;}
.block > .bh{display:flex;align-items:baseline;justify-content:flex-start;gap:12px;margin-bottom:11px;}
.block .bt{font-size:14px;font-weight:600;}
.block .bhint{font-size:12.5px;color:var(--ink-faint);}

/* size */
.sizes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.size{border:1px solid var(--line-strong);border-radius:12px;padding:14px 12px;cursor:pointer;text-align:left;transition:.15s;position:relative;background:var(--card);}
.size:hover{border-color:var(--green-soft);}
.size.on{border-color:var(--green);background:var(--green-wash);box-shadow:inset 0 0 0 1px var(--green);}
.size .sz{font-weight:700;font-size:15px;}
.size .sd{font-size:12px;color:var(--ink-faint);margin:2px 0 8px;}
.size .sp{font-weight:600;font-size:14.5px;}
.size .rec{position:absolute;top:-9px;right:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;background:var(--clay);color:#fff;padding:2px 7px;border-radius:20px;}

/* chips (occasion) */
.occ-chips{display:flex;gap:8px;flex-wrap:wrap;}
.opt{padding:9px 14px;border-radius:30px;border:1px solid var(--line-strong);background:var(--card);font-size:13.5px;font-weight:500;cursor:pointer;transition:.14s;display:inline-flex;align-items:center;gap:7px;}
.opt:hover{border-color:var(--green-soft);}
.opt.on{border-color:var(--green);background:var(--green-wash);color:var(--green);font-weight:600;}
.opt .em{font-size:14px;}

/* postcard / toggles */
.cardsw{display:flex;align-items:center;gap:13px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--card);cursor:pointer;}
.cardsw + .cardsw{margin-top:10px;}
.cardsw .sw-txt{flex:1;}
.cardsw .sw-txt .st{font-weight:600;font-size:14.5px;display:flex;align-items:center;gap:8px;}
.cardsw .sw-txt .sd{font-size:12.5px;color:var(--ink-faint);margin-top:2px;}
.toggle{width:44px;height:26px;border-radius:30px;background:var(--line-strong);position:relative;flex:none;transition:.18s;}
.toggle::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.18s;box-shadow:0 1px 3px oklch(0 0 0 / .2);}
.cardsw.on .toggle{background:var(--green);}
.cardsw.on .toggle::after{transform:translateX(18px);}

.cardbox{margin-top:12px;border:1px solid var(--line);border-radius:12px;padding:16px;background:var(--paper);}
.anon-note{display:flex;align-items:center;gap:9px;margin-top:12px;font-size:13px;color:var(--ink-faint);padding:2px 4px;}
.anon-note :deep(svg){flex:none;color:var(--ink-faint);}
.carddesigns{display:flex;gap:10px;margin-bottom:14px;}
.carddesign{width:54px;height:38px;border-radius:8px;border:1px solid var(--line-strong);cursor:pointer;display:grid;place-items:center;font-size:16px;}
.carddesign.on{outline:2px solid var(--green);outline-offset:1px;}
.cardtext{width:100%;min-height:78px;resize:vertical;border:1px solid var(--line-strong);border-radius:10px;padding:11px 13px;font-size:14px;background:var(--card);line-height:1.45;}
.cardtext:focus{outline:none;border-color:var(--green-soft);box-shadow:0 0 0 3px var(--green-wash);}
.cardmeta{display:flex;justify-content:space-between;margin-top:7px;font-size:12px;color:var(--ink-faint);}

/* addons */
.addons{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
@media(max-width:560px){.addons{grid-template-columns:1fr;}}
.addon{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--card);transition:.15s;}
.addon.on{border-color:var(--green-soft);background:oklch(0.97 0.014 140);}
.addon .am{width:46px;height:46px;border-radius:9px;flex:none;}
.addon .ai{flex:1;min-width:0;}
.addon .ai .an{font-weight:600;font-size:14px;}
.addon .ai .ap{font-size:12.5px;color:var(--ink-faint);}
.addbtn{width:34px;height:34px;border-radius:9px;border:1px solid var(--line-strong);display:grid;place-items:center;color:var(--green);font-size:19px;flex:none;}
.addbtn:hover{background:var(--green-wash);border-color:var(--green-soft);}
.addbtn.on{background:var(--green);color:#fff;border-color:var(--green);}

/* purchase bar */
.purchase{display:flex;gap:10px;margin-top:26px;align-items:stretch;}
.qty{display:flex;align-items:center;border:1px solid var(--line-strong);border-radius:12px;overflow:hidden;background:var(--card);}
.qty button{width:46px;height:52px;display:grid;place-items:center;font-size:20px;color:var(--ink-soft);}
.qty button:hover{background:var(--green-wash);color:var(--green);}
.qty .qn{min-width:34px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums;}
.purchase .btn-primary{flex:1;font-size:16px;}
.purchase .btn-primary .pr{margin-left:auto;font-weight:700;}
.loyal-line{display:flex;align-items:center;gap:9px;margin-top:14px;background:var(--clay-wash);border-radius:10px;padding:11px 13px;font-size:13px;color:oklch(0.45 0.08 47);}
.loyal-line b{color:var(--clay);}
.loyal-line :deep(svg){color:var(--clay);flex:none;}
.deliv-note{display:flex;gap:10px;margin-top:12px;font-size:13px;color:var(--ink-soft);align-items:flex-start;}
.deliv-note :deep(svg){color:var(--green-soft);flex:none;margin-top:1px;}

.ic{display:inline-flex;align-items:center;}

/* ===== lower sections ===== */
.sections{margin-top:64px;display:flex;flex-direction:column;gap:48px;}
.sec-title{font-family:'Montserrat',serif;font-weight:500;font-size:28px;letter-spacing:-.01em;margin-bottom:20px;}
.specgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;}
@media(max-width:680px){.specgrid{grid-template-columns:repeat(2,1fr);}}
.specgrid .sc{background:var(--card);padding:20px;}
.specgrid .sc .sv{font-family:'Montserrat',serif;font-size:26px;font-weight:600;}
.specgrid .sc .sk{font-size:12.5px;color:var(--ink-faint);text-transform:uppercase;letter-spacing:.05em;margin-top:4px;}

.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
@media(max-width:760px){.two{grid-template-columns:1fr;}}
.panelcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:24px;box-shadow:var(--shadow);}
.complist{display:flex;flex-direction:column;gap:2px;}
.comp{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);}
.comp:last-child{border-bottom:none;}
.comp .cn{flex:1;font-weight:500;}
.comp .cq{color:var(--ink-faint);font-size:13.5px;}
.carelist{display:flex;flex-direction:column;gap:14px;}
.care{display:flex;gap:12px;font-size:14px;color:var(--ink-soft);}
.care .num{width:24px;height:24px;border-radius:7px;background:var(--green-wash);color:var(--green);font-weight:700;font-size:12px;display:grid;place-items:center;flex:none;}

.compo-group{display:flex;flex-direction:column;gap:14px;}
.whom-strip{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 2px;}
.whom-strip .whom-lbl{font-size:13px;font-weight:600;color:var(--ink-soft);margin-right:4px;}
.wchip{font-size:12.5px;font-weight:600;padding:5px 12px;border-radius:30px;line-height:1;}
.wc0{background:var(--blush-wash);color:oklch(0.5 0.1 24);}
.wc1{background:var(--clay-wash);color:var(--clay);}
.wc2{background:var(--green-wash);color:var(--green);}
.wc3{background:oklch(0.93 0.03 250);color:oklch(0.48 0.09 250);}
.wc4{background:oklch(0.94 0.028 320);color:oklch(0.48 0.08 320);}

/* reviews */
.rev-head{display:flex;gap:30px;align-items:center;flex-wrap:wrap;margin-bottom:22px;}
.rev-score{display:flex;align-items:center;gap:16px;}
.rev-score .big{font-family:'Montserrat',serif;font-size:54px;font-weight:600;line-height:1;}
.rev-bars{flex:1;min-width:200px;max-width:320px;}
.rev-bar{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--ink-faint);margin:3px 0;}
.rev-bar .track{flex:1;height:6px;border-radius:6px;background:var(--paper-2);overflow:hidden;}
.rev-bar .fill{height:100%;background:var(--clay);border-radius:6px;}
.revgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
@media(max-width:760px){.revgrid{grid-template-columns:1fr;}}
.review{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;box-shadow:var(--shadow);}
.review .rt{display:flex;align-items:center;gap:11px;margin-bottom:11px;}
.review .av{width:38px;height:38px;border-radius:50%;background:var(--green-wash);color:var(--green);display:grid;place-items:center;font-weight:700;}
.review .rn{font-weight:600;font-size:14px;}
.review .rd{font-size:12px;color:var(--ink-faint);}
.review p{font-size:14px;color:var(--ink-soft);line-height:1.5;}
.review .rphotos{display:flex;gap:8px;margin-top:12px;}
.review .rphoto{position:relative;width:66px;height:66px;border-radius:9px;border:1px solid var(--line);overflow:hidden;}
.review .rphoto .lbl{font-size:8px;padding:2px 4px;}

/* related */
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
@media(max-width:980px){.cards{grid-template-columns:repeat(2,1fr);}}
@media(max-width:520px){.cards{grid-template-columns:1fr;}}
.pcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);transition:.16s;cursor:pointer;}
.pcard:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);}
.pcard .pm{position:relative;aspect-ratio:4/5;overflow:hidden;}
.pcard .pm .tag{position:absolute;top:12px;left:12px;}
.pcard .pm .like{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:oklch(1 0 0 / .85);backdrop-filter:blur(5px);display:grid;place-items:center;color:var(--ink-soft);}
.pcard .pb{padding:14px;}
.pcard .pn{font-weight:600;font-size:15px;}
.pcard .pc{font-size:12.5px;color:var(--ink-faint);margin:3px 0 10px;}
.pcard .pp{display:flex;align-items:baseline;gap:8px;}
.pcard .pp .n{font-weight:700;font-size:16px;}
.pcard .pp .o{font-size:13px;color:var(--ink-faint);text-decoration:line-through;}

/* mobile sticky */
.mbar{display:none;}
@media(max-width:1040px){
  .mbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;background:oklch(0.992 0.006 84 / .94);backdrop-filter:blur(12px);border-top:1px solid var(--line);padding:12px 18px;align-items:center;gap:14px;box-shadow:0 -8px 30px oklch(0.4 0.03 70 / .1);}
  .mbar .mp{display:flex;flex-direction:column;}
  .mbar .mp .k{font-size:11px;color:var(--ink-faint);}
  .mbar .mp .v{font-family:'Montserrat',serif;font-size:24px;font-weight:600;line-height:1;}
  .mbar .btn-primary{height:48px;flex:1;}
}

/* ---- page frame (from buton.css) ---- */
.wrap{max-width:1320px;margin:0 auto;padding:24px 24px 140px;}
.crumbs{font-size:13px;color:var(--ink-faint);display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.crumbs a{color:var(--ink-faint);text-decoration:none;}
.crumbs a:hover{color:var(--ink);}
.crumbs .sep{opacity:.5;}

/* ---- shared buttons (from buton.css) ---- */
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}
.ghost-btn{text-decoration:none;height:52px;padding:0 18px;border-radius:12px;border:1px solid var(--line-strong);font-weight:600;font-size:15px;color:var(--ink);background:var(--card);display:inline-flex;align-items:center;justify-content:center;gap:9px;transition:.16s;}
.ghost-btn:hover{background:var(--paper-2);border-color:var(--green-soft);}
.icon-square{width:52px;height:52px;border-radius:12px;border:1px solid var(--line-strong);background:var(--card);display:grid;place-items:center;color:var(--ink-soft);flex:none;transition:.16s;}
.icon-square:hover{background:var(--paper-2);color:var(--clay);}
.icon-square.on{color:var(--clay);border-color:var(--clay);background:var(--clay-wash);}

/* ---- tags (from buton.css) ---- */
.tag{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;padding:4px 9px;border-radius:6px;}
.tag.hit{background:var(--clay);color:#fff;}
.tag.new{background:var(--green);color:#fff;}
.tag.sale{background:var(--blush);color:oklch(0.32 0.06 24);}

/* ---- media placeholder (from buton.css) ---- */
.ph{position:relative;background:repeating-linear-gradient(135deg, oklch(0.9 0.014 80) 0 11px, oklch(0.93 0.012 82) 11px 22px);display:grid;place-items:center;overflow:hidden;}
.ph .lbl{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11.5px;letter-spacing:.04em;color:oklch(0.5 0.02 70);background:oklch(0.98 0.008 84 / .82);padding:5px 10px;border-radius:6px;border:1px solid var(--line);}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
.tnum{font-variant-numeric:tabular-nums;}
</style>
