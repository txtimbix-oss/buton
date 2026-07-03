<template>
  <div class="app">
    <div class="wrap">
      <!-- хлебные крошки -->
      <div class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span class="sep">/</span>
        <span>Каталог</span>
      </div>

      <!-- заголовок -->
      <div class="cat-head">
        <h1 class="serif">Каталог букетов</h1>
        <p class="sub">
          Свежие букеты с доставкой по Санкт-Петербургу ·
          <b>{{ total }} {{ plural(total, ['букет', 'букета', 'букетов']) }}</b>
          по вашему запросу
        </p>
      </div>

      <!-- коллекции (чипы) -->
      <div class="collections">
        <button
          v-for="[id, n] in COLLECTIONS"
          :key="id"
          class="coll"
          :class="{ on: f.coll === id }"
          @click="upd({ coll: id })"
        >
          <span class="cicon" v-html="CICON[id]" />{{ n }}
        </button>
      </div>

      <!-- быстрые фильтры -->
      <div class="qfilters">
        <span class="ql">Быстрый выбор:</span>
        <button
          v-for="[id, n] in QUICK"
          :key="id"
          class="qf"
          :class="{ on: f.quick === id }"
          @click="upd({ quick: f.quick === id ? null : id })"
        >
          {{ n }}
        </button>
      </div>

      <div class="cat-grid">
        <!-- сайдбар фильтров (десктоп) -->
        <aside class="filters">
          <CatalogSidebar />
        </aside>

        <div>
          <!-- бар результатов / сортировки -->
          <div class="resbar">
            <button class="filt-mobile" @click="drawer = true">
              <span v-html="I.filter" />Фильтры
            </button>
            <span class="rc">
              <b>{{ total }}</b> {{ plural(total, ['букет', 'букета', 'букетов']) }}
            </span>
            <div class="sortwrap">
              <span class="sl">Сортировка:</span>
              <select v-model="sort" class="sortsel">
                <option value="pop">Популярные</option>
                <option value="cheap">Сначала дешёвые</option>
                <option value="exp">Сначала дорогие</option>
                <option value="rate">По рейтингу</option>
              </select>
            </div>
          </div>

          <!-- сетка карточек -->
          <div v-if="shown.length > 0" class="cards">
            <NuxtLink
              v-for="p in shown"
              :key="p.id"
              class="pcard"
              :to="p.slug ? `/product/${p.slug}` : '/product/test'"
              @click.capture="e => onCardClick(e, p)"
            >
              <div class="pm">
                <img v-if="p.img" :src="p.img" class="media-img" :alt="p.n" />
                <div
                  v-else
                  class="ph"
                  :style="{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(160deg, ${grads[p.color]}, oklch(0.92 0.02 80))`,
                  }"
                >
                  <span class="lbl">фото букета</span>
                </div>
                <span v-if="p.tag" class="tag" :class="tagLab(p)[0]">{{ tagLab(p)[1] }}</span>
                <button class="like" :class="{ on: likes[p.id] }" @click.prevent="toggleLike(p.id)">
                  <span v-html="I.heart" />
                </button>
                <button class="quick" @click.prevent>
                  <span v-html="I.eye" /> Смотреть товар
                </button>
              </div>
              <div class="pb">
                <div class="pn">{{ p.n }}</div>
                <div class="pc">{{ p.c }}</div>
                <div class="pp">
                  <span class="prate"><span v-html="I.star" /><b>{{ p.r.toFixed(1) }}</b></span>
                  <span class="pprice">
                    <span class="n">{{ fmt(p.p) }} ₽</span>
                    <span v-if="p.o > 0" class="o">{{ fmt(p.o) }} ₽</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- пустое состояние -->
          <div v-else class="empty">
            <div class="ring" v-html="I.flower" />
            <h3>Ничего не нашлось</h3>
            <p>Попробуйте смягчить фильтры — или начните с готовой основы в конструкторе.</p>
            <button class="btn-primary" style="margin: 0 auto" @click="reset">Сбросить фильтры</button>
          </div>

          <!-- пагинация -->
          <div v-if="pages > 1" class="pager">
            <button class="pg" :disabled="cur === 1" @click="page = cur - 1">←</button>
            <button
              v-for="(i, idx) in pageList"
              :key="idx"
              class="pg"
              :class="{ on: cur === i, dots: i === '…' }"
              :disabled="i === '…'"
              @click="i !== '…' && (page = i)"
            >
              {{ i }}
            </button>
            <button class="pg" :disabled="cur === pages" @click="page = cur + 1">→</button>
          </div>
        </div>
      </div>

      <!-- SEO-проза -->
      <div class="seo">
        <h2 class="serif">Доставка букетов в Санкт-Петербурге</h2>
        <p>
          «Бутон» — цветочная мастерская с 7-летней историей. Мы собираем букеты из свежих сезонных
          цветов и доставляем по всему Петербургу за 2 часа. Перед отправкой присылаем фото готового
          букета — вы видите, что получит ваш близкий.
        </p>
        <p>
          В каталоге — монобукеты, композиции в шляпных коробках, авторские и свадебные букеты.
          Фильтруйте по поводу, цвету, типу цветов и бюджету, оплачивайте баллами клуба «Бутон» и
          возвращайтесь за свежестью снова.
        </p>
      </div>
    </div>

    <!-- мобильный drawer -->
    <div class="drawer-bg" :class="{ open: drawer }" @click="drawer = false" />
    <div class="drawer" :class="{ open: drawer }">
      <div class="dh">
        <h3>Фильтры</h3>
        <button class="dclose" @click="drawer = false"><span v-html="I.x" /></button>
      </div>
      <CatalogSidebar />
      <div class="dapply">
        <button class="btn-primary" style="width: 100%" @click="drawer = false">
          Показать {{ total }} {{ plural(total, ['букет', 'букета', 'букетов']) }}
        </button>
      </div>
    </div>

    <!-- быстрый просмотр товара -->
    <CatalogQuickView :card="quickCard" @close="quickCard = null" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, h } from 'vue'

useSeoMeta({ title: 'Каталог букетов — Бутон' })

/* ---- helpers ---- */
const fmt = n => n.toLocaleString('ru-RU')
const plural = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}

/* ---- inline icons (как строки SVG для v-html) ---- */
const I = {
  heart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/></svg>',
  check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>',
  filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
  flower: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C12 6 13.5 4 15 4s1.4 3.6-.6 5.6M12 14.4c0 3.6 1.5 5.6 3 5.6s1.4-3.6-.6-5.6M9.6 12C6 12 4 10.5 4 9s3.6-1.4 5.6.6M14.4 12c3.6 0 5.6 1.5 5.6 3s-3.6 1.4-5.6-.6"/></svg>',
  x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
}

/* ---- options ---- */
const COLLECTIONS = [['all', 'Все букеты'], ['mono', 'Монобукеты'], ['box', 'В коробке'], ['author', 'Авторские'], ['wed', 'Свадебные']]
const QUICK = [['hit', 'Хиты'], ['new', 'Новинки'], ['sale', 'Со скидкой'], ['today', 'Доступно сегодня'], ['cheap', 'До 3 000 ₽']]
const CICON = {
  all: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  mono: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="7" r="3.2"/><path d="M12 10v10M9 14c-2 0-3-1-3-3M15 14c2 0 3-1 3-3"/></svg>',
  box: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h16v12H4zM4 8l2-4h12l2 4M12 4v16"/></svg>',
  author: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
  wed: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8.5" cy="14" r="5"/><circle cx="15.5" cy="14" r="5"/></svg>',
}

/* ---- card mapping ---- */
const grads = { pink: 'oklch(0.84 0.06 20)', red: 'oklch(0.6 0.15 24)', white: 'oklch(0.92 0.012 90)', blue: 'oklch(0.74 0.06 250)', lilac: 'oklch(0.78 0.06 320)', yellow: 'oklch(0.86 0.09 90)', green: 'oklch(0.72 0.08 140)' }
const TAGLAB = { hit: ['hit', 'Хит'], new: ['new', 'Новинка'], sale: ['sale', 'Скидка'] }
const tagLab = p => Array.isArray(p.tag) ? p.tag : (TAGLAB[p.tag] || ['hit', p.tag])
const LIMIT = 24

/* ---- state ---- */
const route = useRoute()
const DEFAULT = { coll: 'all', quick: null, bloom: [], sizes: [], tag: null, collection: null, maxPrice: null, saleOnly: false }
const f = reactive({ ...DEFAULT, bloom: [], sizes: [] })
{
  const Q = route.query
  if (Q.coll) f.coll = String(Q.coll)
  if (Q.quick) f.quick = String(Q.quick)
  if (Q.sale === '1') f.saleOnly = true
}
const sort = ref('pop')
const page = ref(1)

/* клики по категориям/быстрым фильтрам в шапке (?coll=/?quick=/?sale=) */
watch(() => route.query, (Q) => {
  f.coll = Q.coll ? String(Q.coll) : 'all'
  f.quick = Q.quick ? String(Q.quick) : null
  f.saleOnly = Q.sale === '1'
  page.value = 1
})

const likes = reactive({})
const drawer = ref(false)
const toggleLike = id => { likes[id] = !likes[id] }
const quickCard = ref(null)
const onCardClick = (e, p) => {
  if (e.target.closest('.like')) { e.preventDefault(); return }
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
  e.preventDefault()
  quickCard.value = p
}

const upd = patch => { Object.assign(f, patch); page.value = 1 }
const toggleArr = (key, val) => {
  const arr = f[key]
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val); else arr.splice(i, 1)
  page.value = 1
}
const reset = () => { Object.assign(f, { ...DEFAULT, bloom: [], sizes: [] }); page.value = 1 }

/* ---- server-side query → /api/products/catalog ---- */
const SORT_MAP = { pop: 'popular', cheap: 'price_asc', exp: 'price_desc', rate: 'popular' }
/* id чипа-категории → реальный slug категории на бэке (?category=) */
const COLL_SLUG = { mono: 'mono', box: 'box', author: 'avtorskie', wed: 'wedding' }
const query = computed(() => {
  const q = { page: page.value, limit: LIMIT, sort: SORT_MAP[sort.value] || 'popular' }
  if (f.coll !== 'all' && COLL_SLUG[f.coll]) q.category = COLL_SLUG[f.coll]
  if (f.collection) q.collection = f.collection
  if (f.bloom.length) q.blooms = f.bloom.join(',')
  if (f.sizes.length) q.sizes = f.sizes.join(',')
  let tag = f.tag
  if (f.quick === 'hit') tag = 'Хит'
  else if (f.quick === 'new') tag = 'Новинка'
  if (tag) q.tag = tag
  if (f.saleOnly || f.quick === 'sale') q.sale = 'true'
  if (f.quick === 'cheap') q.priceMax = 3000
  else if (f.maxPrice != null) q.priceMax = f.maxPrice
  return q
})
const { data: catalog } = await useFetch('/api/products/catalog', {
  query,
  default: () => ({ items: [], total: 0, page: 1, limit: LIMIT, pages: 1, facets: {} }),
})

/* ---- facets = источник правды для UI фильтров (не из items текущей страницы) ---- */
const facets = computed(() => catalog.value?.facets || {})
const total = computed(() => catalog.value?.total || 0)
const pages = computed(() => Math.max(1, catalog.value?.pages || 1))
const cur = computed(() => Math.min(page.value, pages.value))
/* windowed-пейджер: 1 2 … cur-1 cur cur+1 … n-1 n */
const pageList = computed(() => {
  const n = pages.value, c = cur.value
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const set = new Set([1, 2, n - 1, n, c - 1, c, c + 1])
  const arr = [...set].filter(x => x >= 1 && x <= n).sort((a, b) => a - b)
  const res = []
  let prev = 0
  for (const x of arr) { if (x - prev > 1) res.push('…'); res.push(x); prev = x }
  return res
})
const priceRange = computed(() => facets.value.priceRange || { min: 0, max: 16000 })
const bloomOpts = computed(() => (facets.value.blooms || []).map(b => [b.value, b.label, b.count]))
/* технические/тестовые теги прячем из «Подборок» */
const JUNK_TAGS = new Set(['qa', 'QA', 'recommendations', 'test'])
const tagOpts = computed(() => (facets.value.tags || []).filter(t => !JUNK_TAGS.has(t.value)).map(t => [t.value, t.label, t.count]))
const sizeOpts = computed(() => (facets.value.sizes || []).map(s => [s.value, s.label, s.count]))
/* коллекции: реальные (без seed-*), топ по количеству */
const collectionOpts = computed(() => (facets.value.collections || []).filter(c => !/^seed-/.test(c.slug) && c.count > 0).sort((a, b) => b.count - a.count).slice(0, 12).map(c => [c.slug, c.name, c.count]))

/* ---- карточки текущей страницы (server-side, без клиентской фильтрации) ---- */
const TAGc = { 'Хит': 'hit', 'Новинка': 'new', 'Скидка': 'sale', 'премиум': 'hit' }
const toCard = (p, i) => ({
  id: p._id || i, n: p.name, c: p.meta || '', p: p.price || 0,
  o: p.oldPrice || 0,
  r: p.rating || 4.9, tag: p.tag ? [TAGc[p.tag] || 'hit', p.tag] : null,
  img: (p.images && p.images[0]) || '', m: 'oklch(0.85 0.06 20)', slug: p.slug,
  color: p.bloom, bloom: p.bloom,
})
const shown = computed(() => (catalog.value?.items || []).map(toCard))

/* ---- sidebar (facet-driven, общий desktop + drawer) ---- */
const CatalogSidebar = () => {
  const optGroup = (title, opts, isOn, onClick) =>
    h('div', { class: 'fgroup' }, [
      h('h4', title),
      h('div', { class: 'fopts' },
        opts.map(([id, label, count]) =>
          h('div', { key: id, class: ['fopt', { on: isOn(id) }], onClick: () => onClick(id) }, [
            h('span', { class: 'cbx', innerHTML: I.check }),
            label,
            h('span', { class: 'cnt' }, count),
          ]),
        ),
      ),
    ])
  const pr = priceRange.value
  const priceVal = f.maxPrice ?? pr.max
  return h('div', { class: 'sidebar-inner' }, [
    tagOpts.value.length ? optGroup('Подборки', tagOpts.value, id => f.tag === id, id => upd({ tag: f.tag === id ? null : id })) : null,
    bloomOpts.value.length ? optGroup('Палитра', bloomOpts.value, id => f.bloom.includes(id), id => toggleArr('bloom', id)) : null,
    sizeOpts.value.length ? optGroup('Размер', sizeOpts.value, id => f.sizes.includes(id), id => toggleArr('sizes', id)) : null,
    collectionOpts.value.length ? optGroup('Коллекции', collectionOpts.value, id => f.collection === id, id => upd({ collection: f.collection === id ? null : id })) : null,
    h('div', { class: 'fgroup' }, [
      h('h4', 'Цена, до'),
      h('div', { class: 'range' }, [
        h('div', { class: 'vals' }, [h('span', `${fmt(pr.min)} ₽`), h('span', `${fmt(priceVal)} ₽`)]),
        h('input', {
          type: 'range', min: String(pr.min), max: String(pr.max), step: '100',
          value: priceVal,
          onInput: e => upd({ maxPrice: +e.target.value }),
        }),
      ]),
    ]),
    h('div', { class: 'fgroup', style: { borderBottom: 'none' } }, [
      h('div', { class: 'fopts' }, [
        h('div', { class: ['fopt', { on: f.saleOnly }], onClick: () => upd({ saleOnly: !f.saleOnly }) }, [
          h('span', { class: 'cbx', innerHTML: I.check }), 'Только со скидкой',
        ]),
      ]),
    ]),
    h('button', { class: 'freset', onClick: reset }, 'Сбросить фильтры'),
  ])
}
</script>

<style scoped>
/* ===== токены дизайн-системы (oklch) ===== */
.app {
  --paper: oklch(0.985 0 0);
  --paper-2: oklch(0.955 0 0);
  --card: oklch(1 0 0);
  --ink: oklch(0.255 0.018 64);
  --ink-soft: oklch(0.46 0.018 64);
  --ink-faint: oklch(0.62 0.014 70);
  --green: oklch(0.62 0.15 148);
  --green-soft: oklch(0.58 0.1 150);
  --green-wash: oklch(0.95 0.03 150);
  --clay: oklch(0.72 0.15 52);
  --clay-wash: oklch(0.95 0.035 60);
  --blush: oklch(0.8 0.055 24);
  --line: oklch(0.912 0 0);
  --line-strong: oklch(0.86 0 0);
  --shadow: 0 1px 2px oklch(0.4 0.03 70 / .05), 0 8px 24px oklch(0.4 0.03 70 / .06);
  --shadow-lg: 0 2px 6px oklch(0.4 0.03 70 / .07), 0 24px 60px oklch(0.4 0.03 70 / .12);
  --r: 14px;
  min-height: 100vh;
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  font-feature-settings: "ss01";
  font-size: 15px;
  line-height: 1.5;
}
.app *,
.app *::before,
.app *::after { box-sizing: border-box; }
.serif { font-family: 'Montserrat', Georgia, serif; }
.app button { font-family: inherit; cursor: pointer; color: inherit; border: none; background: none; }
.app input,
.app select { font-family: inherit; font-size: inherit; color: inherit; }

/* ===== каркас страницы ===== */
.wrap { max-width: 1320px; margin: 0 auto; padding: 24px 24px 140px; }
.crumbs { font-size: 13px; color: var(--ink-faint); display: flex; gap: 8px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
.crumbs a { color: var(--ink-faint); text-decoration: none; }
.crumbs a:hover { color: var(--ink); }
.crumbs .sep { opacity: .5; }

/* ===== buttons (из buton.css) ===== */
.btn-primary { text-decoration: none; height: 52px; padding: 0 20px; border-radius: 12px; background: var(--green); color: oklch(0.96 0.02 90); font-weight: 600; font-size: 16px; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: .16s; box-shadow: 0 4px 14px oklch(0.62 0.15 148 / .22); }
.btn-primary:hover { background: oklch(0.55 0.15 148); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

/* ===== chips / tags (из buton.css) ===== */
.tag { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; padding: 4px 9px; border-radius: 6px; }
.tag.hit { background: var(--clay); color: #fff; }
.tag.new { background: var(--green); color: #fff; }
.tag.sale { background: var(--blush); color: oklch(0.32 0.06 24); }

/* ===== media placeholder ===== */
.ph { position: relative; background: repeating-linear-gradient(135deg, oklch(0.9 0.014 80) 0 11px, oklch(0.93 0.012 82) 11px 22px); display: grid; place-items: center; overflow: hidden; }
.ph .lbl { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 11.5px; letter-spacing: .04em; color: oklch(0.5 0.02 70); background: oklch(0.98 0.008 84 / .82); padding: 5px 10px; border-radius: 6px; border: 1px solid var(--line); }
.media-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }

/* ===== product card (из buton.css) ===== */
.pcard { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow); transition: .16s; cursor: pointer; display: flex; flex-direction: column; text-decoration: none; color: inherit; }
.pcard:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--line-strong); }
.pcard .pm { position: relative; aspect-ratio: 4/5; overflow: hidden; }
.pcard .pm .tag { position: absolute; top: 12px; left: 12px; }
.pcard .pm .like { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; background: oklch(1 0 0 / .85); backdrop-filter: blur(5px); display: grid; place-items: center; color: var(--ink-soft); border: 1px solid oklch(1 0 0 / .4); transition: transform .14s, color .14s; }
.pcard .pm .like:hover { color: var(--clay); transform: scale(1.08); }
.pcard .pm .like:active { transform: scale(.86); }
.pcard .pm .like.on { color: var(--clay); }
.pcard .pm .like.on :deep(svg) { fill: var(--clay); stroke: var(--clay); animation: likepop .32s ease; }
@keyframes likepop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
.pcard .pm .quick { position: absolute; left: 50%; top: auto; bottom: 16px; transform: translate(-50%, 12px); height: 42px; padding: 0 20px; border-radius: 30px; background: oklch(0.99 0.006 84 / .94); backdrop-filter: blur(6px); border: 1px solid var(--line); font-weight: 600; font-size: 13.5px; color: var(--green); display: inline-flex; align-items: center; justify-content: center; gap: 7px; white-space: nowrap; opacity: 0; transition: .2s; z-index: 3; box-shadow: 0 8px 20px oklch(0.2 0.02 60 / .2); }
.pcard:hover .pm .quick { opacity: 1; transform: translate(-50%, 0); }
.pcard .pb { position: absolute; left: 10px; right: 10px; bottom: 10px; padding: 13px 14px; display: flex; flex-direction: column; background: var(--card); border-radius: 16px; box-shadow: 0 10px 26px oklch(0.2 0.02 60 / .18); z-index: 2; transition: opacity .22s ease, transform .22s ease; }
.pcard:hover .pb { opacity: 0; transform: translateY(10px); pointer-events: none; }
.pcard .prate { font-size: 12.5px; color: var(--ink-faint); display: inline-flex; align-items: center; gap: 4px; flex: none; }
.pcard .prate > span { color: var(--clay); }
.pcard .prate b { color: var(--ink-soft); }
.pcard .pn { font-weight: 600; font-size: 15.5px; letter-spacing: -.01em; }
.pcard .pc { font-size: 12.5px; color: var(--ink-faint); margin: 3px 0 12px; }
.pcard .pp { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; }
.pcard .pp .pprice { display: inline-flex; align-items: baseline; gap: 7px; }
.pcard .pp .n { font-weight: 700; font-size: 17px; font-variant-numeric: tabular-nums; }
.pcard .pp .o { font-size: 13px; color: var(--ink-faint); text-decoration: line-through; font-variant-numeric: tabular-nums; }

/* ===== product grid (из buton.css) ===== */
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 980px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .cards { grid-template-columns: 1fr; } }

/* ===== заголовок каталога (из Каталог.html) ===== */
.cat-head { margin-bottom: 20px; }
.cat-head h1 { font-family: 'Montserrat', serif; font-weight: 500; font-size: clamp(32px, 3.8vw, 46px); letter-spacing: -.015em; }
.cat-head .sub { color: var(--ink-soft); font-size: 15.5px; margin-top: 8px; }
.cat-head .sub b { color: var(--green); font-weight: 600; }

/* ===== коллекции ===== */
.collections { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.coll { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 30px; border: 1px solid var(--line-strong); background: var(--card); font-weight: 600; font-size: 13.5px; cursor: pointer; transition: .14s; }
.coll:hover { border-color: var(--green-soft); }
.coll.on { background: var(--green); color: #fff; border-color: var(--green); }
.coll .cicon { display: inline-flex; }

/* ===== быстрые фильтры ===== */
.qfilters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
.qfilters .ql { font-size: 12.5px; color: var(--ink-faint); margin-right: 2px; }
.qf { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 30px; border: 1px dashed var(--line-strong); background: transparent; font-size: 13px; font-weight: 500; cursor: pointer; transition: .14s; }
.qf:hover { border-color: var(--green-soft); color: var(--green); }
.qf.on { border-style: solid; border-color: var(--green); background: var(--green-wash); color: var(--green); font-weight: 600; }

/* ===== grid layout ===== */
.cat-grid { display: grid; grid-template-columns: 264px minmax(0, 1fr); gap: 30px; align-items: start; }
@media (max-width: 920px) { .cat-grid { grid-template-columns: 1fr; } }

/* ===== sidebar ===== */
.filters { position: sticky; top: 84px; }
@media (max-width: 920px) { .filters { display: none; } }

/* ===== results bar ===== */
.resbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.resbar .rc { font-size: 14px; color: var(--ink-soft); }
.resbar .rc b { color: var(--ink); }
.sortwrap { display: flex; align-items: center; gap: 9px; }
.sortwrap .sl { font-size: 13px; color: var(--ink-faint); }
.sortsel { height: 40px; border: 1px solid var(--line-strong); border-radius: 10px; padding: 0 34px 0 13px; font-size: 13.5px; font-weight: 500; background: var(--card) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%23766' stroke-width='1.8'><path d='M3 5l4 4 4-4'/></svg>") no-repeat right 12px center; cursor: pointer; -webkit-appearance: none; appearance: none; }
.filt-mobile { display: none; }
@media (max-width: 920px) { .filt-mobile { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--card); font-weight: 600; font-size: 13.5px; } }

/* override card grid внутри каталога */
.cat-grid .cards { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 1180px) { .cat-grid .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .cat-grid .cards { grid-template-columns: 1fr; } }

/* ===== pagination ===== */
.pager { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 36px; }
.pg { min-width: 42px; height: 42px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--card); font-weight: 600; font-size: 14px; display: grid; place-items: center; cursor: pointer; padding: 0 12px; }
.pg:hover { border-color: var(--green-soft); }
.pg.on { background: var(--green); color: #fff; border-color: var(--green); }
.pg:disabled { opacity: .4; cursor: not-allowed; }
.pg.dots { border: none; background: none; cursor: default; opacity: 1; min-width: 22px; padding: 0; color: var(--ink-faint); }
.pg.dots:hover { border: none; }

/* ===== empty ===== */
.empty { text-align: center; padding: 70px 20px; border: 1px dashed var(--line-strong); border-radius: var(--r); }
.empty .ring { width: 84px; height: 84px; border-radius: 50%; background: var(--green-wash); color: var(--green); display: grid; place-items: center; margin: 0 auto 18px; }
.empty h3 { font-family: 'Montserrat', serif; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.empty p { color: var(--ink-soft); margin-bottom: 20px; }

/* ===== seo prose ===== */
.seo { margin-top: 60px; padding-top: 32px; border-top: 1px solid var(--line); max-width: 80ch; }
.seo h2 { font-family: 'Montserrat', serif; font-size: 24px; font-weight: 500; margin-bottom: 14px; }
.seo p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.6; margin-bottom: 12px; }

/* ===== mobile drawer ===== */
.drawer-bg { position: fixed; inset: 0; background: oklch(0.2 0.02 60 / .4); z-index: 60; opacity: 0; pointer-events: none; transition: .2s; }
.drawer-bg.open { opacity: 1; pointer-events: auto; }
.drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 300px; max-width: 88vw; background: var(--paper); z-index: 61; transform: translateX(-100%); transition: .24s; overflow-y: auto; padding: 20px; box-shadow: var(--shadow-lg); }
.drawer.open { transform: translateX(0); }
.drawer .dh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.drawer .dh h3 { font-size: 18px; font-weight: 600; }
.drawer .dclose { width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--line); display: grid; place-items: center; }
.drawer .dapply { position: sticky; bottom: 0; background: var(--paper); padding-top: 14px; }
</style>

<!--
  Стили сайдбара фильтров вынесены из scoped-блока намеренно: CatalogSidebar —
  инлайновый функциональный компонент (h(...)), его элементы не получают data-v
  атрибут scoped-стилей. Всё ниже жёстко вложено в .sidebar-inner, поэтому не течёт.
-->
<style>
.sidebar-inner { display: flex; flex-direction: column; }

.sidebar-inner .fgroup { border-bottom: 1px solid var(--line); padding: 16px 0; }
.sidebar-inner .fgroup:first-child { padding-top: 0; }
.sidebar-inner .fgroup h4 {
  font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  color: var(--ink-faint); margin-bottom: 12px;
}

.sidebar-inner .fopts { display: flex; flex-direction: column; gap: 2px; }
.sidebar-inner .fopt {
  display: flex; align-items: center; gap: 11px;
  font-size: 14px; color: var(--ink-soft); cursor: pointer; user-select: none;
  padding: 6px 8px; margin: 0 -8px; border-radius: 9px;
  transition: background .14s, color .14s;
}
.sidebar-inner .fopt:hover { background: var(--paper-2); color: var(--ink); }
.sidebar-inner .fopt .cbx {
  width: 19px; height: 19px; border-radius: 6px; flex: none;
  border: 1.5px solid var(--line-strong); display: grid; place-items: center;
  color: transparent; transition: .14s;
}
.sidebar-inner .fopt:hover .cbx { border-color: var(--green-soft); }
.sidebar-inner .fopt.on { color: var(--ink); font-weight: 600; }
.sidebar-inner .fopt.on .cbx { background: var(--green); border-color: var(--green); color: #fff; }
.sidebar-inner .fopt .cnt {
  margin-left: auto; font-size: 12px; font-variant-numeric: tabular-nums; color: var(--ink-faint);
}
.sidebar-inner .fopt.on .cnt { color: var(--green-soft); }

/* размеры — пилюли в ряд */
.sidebar-inner .fsizes { flex-direction: row; gap: 8px; }
.sidebar-inner .fopt-size {
  flex: 1; justify-content: center; gap: 0;
  margin: 0; padding: 10px 0;
  border: 1px solid var(--line-strong); border-radius: 10px;
  font-weight: 600; font-size: 14px; color: var(--ink-soft);
}
.sidebar-inner .fopt-size:hover { background: var(--paper-2); border-color: var(--green-soft); color: var(--ink); }
.sidebar-inner .fopt-size.on { background: var(--green); border-color: var(--green); color: #fff; }

/* цена */
.sidebar-inner .range { margin-top: 2px; }
.sidebar-inner .range .vals {
  display: flex; justify-content: space-between;
  font-size: 13.5px; font-weight: 600; font-variant-numeric: tabular-nums; margin-bottom: 12px;
}
.sidebar-inner .range input[type=range] {
  width: 100%; -webkit-appearance: none; appearance: none;
  height: 4px; border-radius: 4px; background: var(--line-strong); outline: none;
}
.sidebar-inner .range input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
  background: var(--green); cursor: pointer; border: 3px solid var(--card);
  box-shadow: 0 1px 4px oklch(0 0 0 / .2);
}
.sidebar-inner .range input[type=range]::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--green); cursor: pointer; border: 3px solid var(--card);
}

/* сброс */
.sidebar-inner .freset {
  width: 100%; height: 44px; margin-top: 20px;
  border-radius: 11px; border: 1px solid var(--line-strong); background: var(--card);
  font-weight: 600; font-size: 13.5px; color: var(--ink-soft);
  transition: .14s;
}
.sidebar-inner .freset:hover { background: var(--paper-2); color: var(--clay); border-color: var(--clay); }
</style>
