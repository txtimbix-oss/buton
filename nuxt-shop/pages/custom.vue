<template>
  <div class="app">
    <div class="wrap">
      <div class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink><span class="sep">/</span>
        <NuxtLink to="/catalog">Каталог</NuxtLink><span class="sep">/</span>
        <span>Конструктор</span>
      </div>

      <div class="head">
        <div>
          <div class="craft">Цветочная мастерская · СПб</div>
          <h1 class="serif">Соберите свой <em>букет</em></h1>
          <p class="sub">Выбирайте цветы поштучно, добавляйте зелень и упаковку — цена пересчитывается вживую. Или начните с готовой основы.</p>
        </div>
      </div>

      <div class="presets">
        <span class="lab">Соберём за вас:</span>
        <button
          v-for="p in PRESETS"
          :key="p.id"
          :class="['preset', { on: activePreset === p.id }]"
          @click="applyPreset(p)"
        >
          <span class="sw">
            <i
              v-for="fid in Object.keys(p.flowers).slice(0, 3)"
              :key="fid"
              :style="{ background: flowerById(fid).color }"
            ></i>
          </span>
          {{ p.name }}
        </button>
        <button class="preset" style="color:var(--ink-faint)" @click="reset">Очистить</button>
      </div>

      <div class="work">
        <!-- ---------- LEFT: PREVIEW + BILL ---------- -->
        <aside class="panel">
          <div class="preview-card">
            <div class="stage">
              <div class="sizebadge">
                Размер <b>{{ size }}</b>
                <span v-if="stems > 0" style="color:var(--ink-faint);font-weight:400">· {{ stems }} ст.</span>
              </div>
              <div v-if="stems === 0" class="empty">
                <div class="ring" v-html="ICONS.flower"></div>
                Начните добавлять цветы —<br />букет соберётся здесь
              </div>
              <svg v-else viewBox="0 0 400 400" aria-label="Превью букета" v-html="bouquetSvg"></svg>
            </div>

            <div v-if="stems > 0" class="compose">
              <span v-for="f in composedFlowers" :key="f.id" class="chip">
                <i :style="{ background: f.color }"></i>{{ f.name }} · <b>{{ st.flowers[f.id] }}</b>
                <button class="x" @click="setQ(f.id, -99)">×</button>
              </span>
            </div>

            <div class="spec">
              <div class="s"><div class="v tnum">{{ stems }}</div><div class="k">{{ plural(stems, ['стебель','стебля','стеблей']) }}</div></div>
              <div class="s"><div class="v tnum">{{ height || '—' }}{{ height ? ' см' : '' }}</div><div class="k">высота</div></div>
              <div class="s"><div class="v">{{ wrapObj && wrapObj.id !== 'none' ? 'Да' : '—' }}</div><div class="k">упаковка</div></div>
            </div>

            <div class="bill">
              <div class="row"><span>Цветы · {{ stems }} шт</span><span class="tnum">{{ fmt(priceFlowers) }} ₽</span></div>
              <div :class="['row', { muted: !priceGreens }]"><span>Зелень · {{ greenObjs.length }}</span><span class="tnum">{{ priceGreens ? fmt(priceGreens) + ' ₽' : '—' }}</span></div>
              <div :class="['row', { muted: !priceWrap }]"><span>{{ wrapObj ? wrapObj.name : 'Упаковка' }}</span><span class="tnum">{{ priceWrap ? fmt(priceWrap) + ' ₽' : '—' }}</span></div>
              <div :class="['row', { muted: !priceRibbon }]"><span>Лента{{ ribbonObj && ribbonObj.id !== 'none' ? ' · ' + ribbonObj.name.toLowerCase() : '' }}</span><span class="tnum">{{ priceRibbon ? fmt(priceRibbon) + ' ₽' : 'бесплатно' }}</span></div>
              <div class="tot"><span class="l">Итого</span><span class="p tnum">{{ fmt(total) }} ₽</span></div>

              <div class="loyal">
                <span v-html="ICONS.spark"></span>
                <span>Вернём <b>{{ fmt(points) }} {{ plural(points, ['балл','балла','баллов']) }}</b> на счёт после доставки</span>
              </div>

              <div class="cta">
                <NuxtLink v-if="added" class="btn-primary" to="/cart" style="text-decoration:none">Перейти в корзину →</NuxtLink>
                <button v-else class="btn-primary" :disabled="stems === 0" @click="handleAdd">В корзину<span class="pr tnum">{{ fmt(total) }} ₽</span></button>
                <button :class="['icon-square', { on: wished }]" aria-label="В избранное" v-html="ICONS.heart" @click="wished = !wished"></button>
              </div>
              <div class="assure">
                <span><span v-html="ICONS.truck"></span> Сегодня к 18:00</span>
                <span><span v-html="ICONS.camera"></span> Фото до доставки</span>
                <span><span v-html="ICONS.leaf"></span> Свежесть 7 дней</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- ---------- RIGHT: BUILDER ---------- -->
        <div class="builder">
          <section class="section">
            <div class="sec-head"><span class="no">1</span><h3>Цветы</h3><span class="meta">в букете <b>{{ stems }}</b></span></div>
            <div class="sec-body">
              <div class="flowers">
                <div v-for="f in FLOWERS" :key="f.id" :class="['fcard', { active: st.flowers[f.id] }]">
                  <div class="fhead">
                    <svg viewBox="0 0 44 44" width="44" height="44" v-html="flowerHeadSvg({ c: f.color, core: f.core, id: f.id }, 22, 22, 17)"></svg>
                  </div>
                  <div class="finfo">
                    <div class="n">{{ f.name }}</div>
                    <div class="p"><b>{{ f.price }} ₽</b> / шт</div>
                  </div>
                  <button v-if="!st.flowers[f.id]" class="add-pill" @click="setQ(f.id, 1)">+ Добавить</button>
                  <div v-else class="stepper">
                    <button @click="setQ(f.id, -1)">−</button>
                    <span class="qv tnum">{{ st.flowers[f.id] }}</span>
                    <button :disabled="st.flowers[f.id] >= 40" @click="setQ(f.id, 1)">+</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="sec-head"><span class="no">2</span><h3>Зелень и фактура</h3><span class="meta"><template v-if="greenObjs.length">выбрано <b>{{ greenObjs.length }}</b></template><template v-else>по желанию</template></span></div>
            <div class="sec-body">
              <div class="tiles">
                <div v-for="g in GREENS" :key="g.id" :class="['tile', { on: st.greens.includes(g.id) }]" @click="toggleGreen(g.id)">
                  <div class="check" v-html="ICONS.check"></div>
                  <div class="leaf" :style="{ background: g.color, opacity: .9 }" v-html="ICONS.leaf"></div>
                  <div class="tt">{{ g.name }}</div>
                  <div class="td">{{ g.desc }}</div>
                  <div class="tp">+{{ g.price }} ₽</div>
                </div>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="sec-head"><span class="no">3</span><h3>Упаковка</h3><span class="meta">{{ wrapObj ? wrapObj.name : '' }}</span></div>
            <div class="sec-body">
              <div class="tiles">
                <div v-for="w in WRAPS" :key="w.id" :class="['tile', { on: st.wrap === w.id }]" @click="setWrap(w.id)">
                  <div class="check" v-html="ICONS.check"></div>
                  <div class="leaf" :style="{ background: w.paper }"></div>
                  <div class="tt">{{ w.name }}</div>
                  <div class="td">{{ w.desc }}</div>
                  <div class="tp">{{ w.price ? '+' + w.price + ' ₽' : 'бесплатно' }}</div>
                </div>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="sec-head"><span class="no">4</span><h3>Лента</h3><span class="meta">{{ ribbonObj ? ribbonObj.name : '' }}</span></div>
            <div class="sec-body">
              <div class="ribbons">
                <div v-for="r in RIBBONS" :key="r.id" :class="['ribbon', { on: st.ribbon === r.id }]" @click="setRibbon(r.id)">
                  <div class="rsw" :style="r.id === 'none' ? { border: '1.5px dashed var(--line-strong)', background: 'transparent' } : { background: r.color }"></div>
                  <div class="rn">{{ r.name }}</div>
                </div>
              </div>
              <div class="note">
                <span v-html="ICONS.info"></span>
                <span>Соберём за 2 часа. Перед отправкой пришлём фото готового букета в WhatsApp — на случай, если захотите что-то поправить.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- mobile sticky bar -->
    <div class="mbar">
      <div class="mp"><span class="k">{{ stems }} ст · размер {{ size }}</span><span class="v serif tnum">{{ fmt(total) }} ₽</span></div>
      <NuxtLink v-if="added" class="btn-primary" to="/cart" style="text-decoration:none">Перейти в корзину →</NuxtLink>
      <button v-else class="btn-primary" :disabled="stems === 0" @click="handleAdd">В корзину</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

useSeoMeta({ title: 'Конструктор букета — Бутон' })

/* ============================ DATA (API-first + fallback) ============================ */
/* Каталог конструктора с бэка. Пока прод-БД не мигрирована на v2 (нет цветов зелени/
   бумаги/лент и пресетов) — используем фолбэк-каталог; id совпадают с v2, поэтому после
   миграции подхватывается автоматически без правок. */
const { data: bbOptions } = await useFetch('/api/bouquet-builder/options', { default: () => ({}) })
const opt = computed(() => bbOptions.value || {})

const FALLBACK_FLOWERS = [
  { id: 'peony',     name: 'Пионы',          price: 450, color: 'oklch(0.84 0.07 18)',  core: 'oklch(0.72 0.1 22)' },
  { id: 'ranunculus',name: 'Ранункулюс',     price: 180, color: 'oklch(0.93 0.05 88)',  core: 'oklch(0.82 0.09 75)' },
  { id: 'sprayrose', name: 'Кустовая роза',  price: 220, color: 'oklch(0.66 0.13 32)',  core: 'oklch(0.54 0.14 30)' },
  { id: 'hydrangea', name: 'Гортензия',      price: 520, color: 'oklch(0.78 0.07 250)', core: 'oklch(0.68 0.09 250)' },
  { id: 'tulip',     name: 'Тюльпаны',       price: 120, color: 'oklch(0.7 0.14 12)',   core: 'oklch(0.58 0.15 10)' },
  { id: 'eustoma',   name: 'Эустома',        price: 190, color: 'oklch(0.8 0.06 320)',  core: 'oklch(0.7 0.08 320)' },
  { id: 'chrys',     name: 'Хризантема',     price: 150, color: 'oklch(0.88 0.08 120)', core: 'oklch(0.78 0.1 125)' },
  { id: 'matiola',   name: 'Маттиола',       price: 160, color: 'oklch(0.82 0.05 300)', core: 'oklch(0.72 0.07 300)' },
]
const FALLBACK_GREENS = [
  { id: 'euca',  name: 'Эвкалипт',  desc: 'серебристый', price: 80, color: 'oklch(0.74 0.04 165)' },
  { id: 'ruscus',name: 'Рускус',    desc: 'глянцевый',   price: 60, color: 'oklch(0.55 0.07 150)' },
  { id: 'pista', name: 'Фисташка',  desc: 'фактурная',   price: 90, color: 'oklch(0.6 0.08 135)' },
  { id: 'gyp',   name: 'Гипсофила', desc: 'облачко',     price: 70, color: 'oklch(0.95 0.01 100)' },
]
const FALLBACK_WRAPS = [
  { id: 'kraft', name: 'Крафт-бумага',     desc: 'тёплая, ремесленная', price: 150, paper: 'oklch(0.74 0.05 70)' },
  { id: 'film',  name: 'Корейская плёнка', desc: 'матовая, нежная',     price: 250, paper: 'oklch(0.9 0.02 60)' },
  { id: 'box',   name: 'Шляпная коробка',  desc: 'держит форму',        price: 600, paper: 'oklch(0.42 0.04 40)' },
  { id: 'none',  name: 'Без упаковки',     desc: 'только лента',        price: 0,   paper: 'oklch(0.88 0.012 80)' },
]
const FALLBACK_RIBBONS = [
  { id: 'ivory', name: 'Айвори',       color: 'oklch(0.92 0.02 85)', price: 0 },
  { id: 'dusty', name: 'Пыльная роза', color: 'oklch(0.76 0.06 20)', price: 0 },
  { id: 'moss',  name: 'Мох',          color: 'oklch(0.5 0.06 150)', price: 0 },
  { id: 'bordo', name: 'Бордо',        color: 'oklch(0.42 0.12 25)', price: 50 },
  { id: 'none',  name: 'Без ленты',    color: 'transparent',         price: 0 },
]
const FALLBACK_PRESETS = [
  { id: 'tender',  name: 'Нежный',     flowers: { peony: 5, ranunculus: 5, eustoma: 3 }, greens: ['euca'],       wrap: 'film',  ribbon: 'ivory' },
  { id: 'bright',  name: 'Яркий',      flowers: { tulip: 9, sprayrose: 6, chrys: 3 },    greens: ['pista'],      wrap: 'kraft', ribbon: 'dusty' },
  { id: 'minimal', name: 'Минимализм', flowers: { hydrangea: 3, eustoma: 4 },            greens: ['euca'],       wrap: 'none',  ribbon: 'moss' },
  { id: 'peony',   name: 'Пионовый',   flowers: { peony: 9, matiola: 5 },                greens: ['euca','gyp'], wrap: 'box',   ribbon: 'bordo' },
]

/* каталог API готов только когда есть все визуальные поля + пресеты (v2) */
const catalogReady = computed(() => {
  const o = opt.value
  const ok = (arr, keys) => Array.isArray(arr) && arr.length > 0 && arr.every(x => keys.every(k => x[k] != null))
  return ok(o.flowers, ['id', 'color', 'core'])
    && ok(o.greenery, ['id', 'color', 'desc'])
    && ok(o.packaging, ['id', 'paper'])
    && ok(o.ribbons, ['id', 'color'])
    && Array.isArray(o.presets) && o.presets.length > 0
})

const FLOWERS = computed(() => catalogReady.value
  ? opt.value.flowers.map(f => ({ id: f.id, name: f.name, price: f.price, color: f.color, core: f.core }))
  : FALLBACK_FLOWERS)
const GREENS = computed(() => catalogReady.value
  ? opt.value.greenery.map(g => ({ id: g.id, name: g.name, desc: g.desc, price: g.price, color: g.color }))
  : FALLBACK_GREENS)
const WRAPS = computed(() => catalogReady.value
  ? opt.value.packaging.map(w => ({ id: w.id, name: w.name, desc: w.desc, price: w.price, paper: w.paper }))
  : FALLBACK_WRAPS)
const RIBBONS = computed(() => catalogReady.value
  ? opt.value.ribbons.map(r => ({ id: r.id, name: r.name, color: r.color, price: r.price }))
  : FALLBACK_RIBBONS)
const PRESETS = computed(() => catalogReady.value
  ? opt.value.presets.map(p => ({ id: p.id, name: p.name, flowers: p.flowers, greens: p.greens, wrap: p.wrap, ribbon: p.ribbon }))
  : FALLBACK_PRESETS)

const fmt = n => n.toLocaleString('ru-RU')
const plural = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}
const flowerById = id => FLOWERS.value.find(x => x.id === id) || { color: 'transparent' }

/* ============================ ICONS ============================ */
const ICONS = {
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>',
  spark: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg>',
  info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  heart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/></svg>',
  flower: '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C12 6 13.5 4 15 4s1.4 3.6-.6 5.6M12 14.4c0 3.6 1.5 5.6 3 5.6s1.4-3.6-.6-5.6M9.6 12C6 12 4 10.5 4 9s3.6-1.4 5.6.6M14.4 12c3.6 0 5.6 1.5 5.6 3s-3.6 1.4-5.6-.6"/></svg>',
  truck: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
  camera: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>',
  leaf: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>',
}

/* ---- minimalist cartoon flower heads (SVG string builders) ---- */
function ring(count, dist, prx, pry, fill, stroke, phase) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const deg = (i / count) * 360 + (phase || 0)
    const sw = stroke === 'none' ? 0 : Math.max(0.6, pry * 0.08)
    out += `<g transform="rotate(${deg})"><ellipse cx="0" cy="${-dist}" rx="${prx}" ry="${pry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`
  }
  return out
}

function flowerHeadInner(p, R) {
  const c = p.c, core = p.core, id = p.id
  const st = 'oklch(0 0 0 / .13)'
  const lite = 'oklch(1 0 0 / .24)'
  let el = ''
  if (id === 'peony') {
    el = ring(9, R * 0.55, R * 0.42, R * 0.52, c, st, 0) + ring(7, R * 0.32, R * 0.34, R * 0.42, c, st, 20) + ring(6, R * 0.18, R * 0.26, R * 0.32, lite, 'none', 0) + `<circle r="${R * 0.16}" fill="${core}"/>`
  } else if (id === 'ranunculus') {
    el = ring(11, R * 0.62, R * 0.26, R * 0.36, c, st, 0) + ring(9, R * 0.42, R * 0.22, R * 0.3, c, st, 16) + ring(7, R * 0.24, R * 0.2, R * 0.26, lite, 'none', 8) + `<circle r="${R * 0.12}" fill="${core}"/>`
  } else if (id === 'sprayrose') {
    el = `<circle r="${R * 0.92}" fill="${c}" stroke="${st}" stroke-width="1"/>` + ring(5, R * 0.46, R * 0.36, R * 0.46, c, st, 0) + ring(4, R * 0.24, R * 0.3, R * 0.34, lite, 'none', 30) + `<path d="M 0 ${-R * 0.2} A ${R * 0.2} ${R * 0.2} 0 1 1 ${-R * 0.17} ${R * 0.07}" fill="none" stroke="${core}" stroke-width="${R * 0.11}" stroke-linecap="round"/>`
  } else if (id === 'tulip') {
    el = ring(3, R * 0.34, R * 0.5, R * 0.74, c, st, 0) + ring(3, R * 0.2, R * 0.3, R * 0.52, lite, 'none', 60)
  } else if (id === 'hydrangea') {
    const flo = (fx, fy, s) => `<g transform="translate(${fx} ${fy})">${ring(4, s * 0.5, s * 0.42, s * 0.42, c, st, 45)}<circle r="${s * 0.18}" fill="${core}"/></g>`
    el = flo(0, 0, R * 0.95) + flo(R * 0.55, -R * 0.2, R * 0.7) + flo(-R * 0.5, -R * 0.3, R * 0.7) + flo(R * 0.15, R * 0.6, R * 0.65) + flo(-R * 0.45, R * 0.42, R * 0.6)
  } else if (id === 'eustoma') {
    el = ring(5, R * 0.5, R * 0.5, R * 0.56, c, st, 0) + ring(5, R * 0.28, R * 0.28, R * 0.34, lite, 'none', 36) + `<circle r="${R * 0.2}" fill="${core}"/>` + ring(6, R * 0.16, R * 0.05, R * 0.14, 'oklch(0.95 0.09 95)', 'none', 0)
  } else if (id === 'chrys') {
    el = ring(18, R * 0.55, R * 0.1, R * 0.62, c, st, 0) + ring(14, R * 0.4, R * 0.1, R * 0.5, c, st, 13) + ring(10, R * 0.24, R * 0.09, R * 0.34, lite, 'none', 18) + `<circle r="${R * 0.15}" fill="${core}"/>`
  } else {
    el = ring(6, R * 0.5, R * 0.4, R * 0.52, c, st, 0) + ring(6, R * 0.28, R * 0.3, R * 0.4, lite, 'none', 30) + `<circle r="${R * 0.18}" fill="${core}"/>`
  }
  return el
}

function flowerHeadSvg(p, x, y, R) {
  return `<g transform="translate(${x} ${y})">${flowerHeadInner(p, R)}</g>`
}

/* ===================== BOUQUET PREVIEW (top view) ===================== */
function buildBouquetSvg(heads, greens, wrap, ribbon) {
  const N = heads.length
  const cx = 200, cy = 195
  const headR = N === 0 ? 0 : Math.max(13, Math.min(34, 132 / Math.sqrt(N)))
  const spread = N === 0 ? 0 : headR * Math.sqrt(N) * 0.9
  const golden = Math.PI * (3 - Math.sqrt(5))
  const placed = heads.map((h, i) => {
    const r = N === 1 ? 0 : spread * Math.sqrt((i + 0.5) / N)
    const a = i * golden
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), c: h.color, core: h.core, id: h.id }
  })
  const collarR = spread + headR * 0.7 + 20
  const wrapPaper = wrap ? wrap.paper : null
  const showWrap = wrap && wrap.id !== 'none'
  const ribCol = ribbon && ribbon.id !== 'none' ? ribbon.color : null

  let svg = ''
  svg += '<defs><radialGradient id="vig" cx="50%" cy="42%" r="62%"><stop offset="0%" stop-color="oklch(1 0 0 / 0)"/><stop offset="100%" stop-color="oklch(0.4 0.02 70 / .07)"/></radialGradient></defs>'

  // wrap collar behind
  if (showWrap && N > 0) {
    svg += '<g>'
    svg += `<circle cx="${cx}" cy="${cy}" r="${collarR}" fill="${wrapPaper}" opacity="0.95"/>`
    svg += `<circle cx="${cx}" cy="${cy}" r="${collarR}" fill="none" stroke="oklch(0 0 0 / .08)" stroke-width="1"/>`
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx + collarR * Math.cos(a)}" y2="${cy + collarR * Math.sin(a)}" stroke="oklch(0 0 0 / .06)" stroke-width="1"/>`
    }
    svg += '</g>'
  }

  // greenery sprigs around the rim
  if (N > 0 && greens.length) {
    const count = 7 + greens.length * 4
    for (let i = 0; i < count; i++) {
      const g = greens[i % greens.length]
      const a = (i / count) * Math.PI * 2 + 0.3
      const rr = spread + headR * 0.55
      const sx = cx + rr * Math.cos(a)
      const sy = cy + rr * Math.sin(a)
      const rot = (a * 180 / Math.PI) + 90
      let leaves = ''
      ;[-13, -5, 3, 11].forEach((ly, j) => {
        const lx = j % 2 ? 4.5 : -4.5
        leaves += `<ellipse cx="${lx}" cy="${ly}" rx="3.2" ry="6" fill="${g.color}" opacity="0.92" transform="rotate(${j % 2 ? 34 : -34} ${lx} ${ly})"/>`
      })
      svg += `<g transform="translate(${sx} ${sy}) rotate(${rot})"><line x1="0" y1="15" x2="0" y2="-21" stroke="${g.color}" stroke-width="1.6" stroke-linecap="round"/>${leaves}</g>`
    }
  }

  // cartoon flower heads
  placed.forEach(p => {
    svg += flowerHeadSvg({ c: p.c, core: p.core, id: p.id }, p.x, p.y, headR)
  })

  // ribbon accent ring
  if (ribCol && N > 0 && showWrap) {
    svg += `<circle cx="${cx}" cy="${cy}" r="${collarR - 7}" fill="none" stroke="${ribCol}" stroke-width="6" stroke-dasharray="2 0" opacity="0.92"/>`
  }
  if (ribCol && N > 0 && !showWrap) {
    svg += `<circle cx="${cx}" cy="${cy}" r="${spread + headR * 0.5 + 8}" fill="none" stroke="${ribCol}" stroke-width="5" opacity="0.9"/>`
  }

  svg += '<rect x="0" y="0" width="400" height="400" fill="url(#vig)" pointer-events="none"/>'
  return svg
}

/* ============================ STATE ============================ */
const LS = 'buton_constructor_v1'
const initial = { flowers: { peony: 5, ranunculus: 5, eustoma: 3 }, greens: ['euca'], wrap: 'film', ribbon: 'ivory' }

const st = ref({ ...initial, flowers: { ...initial.flowers }, greens: [...initial.greens] })
const activePreset = ref(null)
const wished = ref(false)
const added = ref(false)

onMounted(() => {
  try {
    const s = JSON.parse(localStorage.getItem(LS))
    if (s && s.flowers) st.value = s
  } catch (e) { /* noop */ }
})

watch(st, (val) => {
  if (process.client) {
    try { localStorage.setItem(LS, JSON.stringify(val)) } catch (e) { /* noop */ }
  }
  added.value = false
}, { deep: true })

/* ============================ ACTIONS ============================ */
function setQ(id, delta) {
  activePreset.value = null
  const cur = st.value.flowers[id] || 0
  const next = Math.max(0, Math.min(40, cur + delta))
  const f = { ...st.value.flowers }
  if (next === 0) delete f[id]; else f[id] = next
  st.value = { ...st.value, flowers: f }
}
function toggleGreen(id) {
  activePreset.value = null
  const greens = st.value.greens.includes(id)
    ? st.value.greens.filter(g => g !== id)
    : [...st.value.greens, id]
  st.value = { ...st.value, greens }
}
function setWrap(id) {
  activePreset.value = null
  st.value = { ...st.value, wrap: id }
}
function setRibbon(id) {
  activePreset.value = null
  st.value = { ...st.value, ribbon: id }
}
function applyPreset(p) {
  activePreset.value = p.id
  st.value = { flowers: { ...p.flowers }, greens: [...p.greens], wrap: p.wrap, ribbon: p.ribbon }
}
function reset() {
  activePreset.value = null
  st.value = { flowers: {}, greens: [], wrap: 'none', ribbon: 'none' }
}
function handleAdd() {
  if (stems.value === 0) return
  added.value = true
}

/* ============================ DERIVED ============================ */
const stems = computed(() => Object.values(st.value.flowers).reduce((a, b) => a + b, 0))
const heads = computed(() => {
  const arr = []
  FLOWERS.value.forEach(f => {
    const q = st.value.flowers[f.id] || 0
    for (let i = 0; i < q; i++) arr.push(f)
  })
  return arr
    .map((v, i) => ({ v, i }))
    .sort((a, b) => (a.i % 5) - (b.i % 5) || a.i - b.i)
    .map(o => o.v)
})
const greenObjs = computed(() => GREENS.value.filter(g => st.value.greens.includes(g.id)))
const wrapObj = computed(() => WRAPS.value.find(w => w.id === st.value.wrap) || null)
const ribbonObj = computed(() => RIBBONS.value.find(r => r.id === st.value.ribbon) || null)
const composedFlowers = computed(() => FLOWERS.value.filter(f => st.value.flowers[f.id]))

const priceFlowers = computed(() => FLOWERS.value.reduce((a, f) => a + (st.value.flowers[f.id] || 0) * f.price, 0))
const priceGreens = computed(() => greenObjs.value.reduce((a, g) => a + g.price, 0))
const priceWrap = computed(() => (wrapObj.value ? wrapObj.value.price : 0))
const priceRibbon = computed(() => (ribbonObj.value ? ribbonObj.value.price : 0))
const total = computed(() => priceFlowers.value + priceGreens.value + priceWrap.value + priceRibbon.value)
const points = computed(() => Math.round(total.value * 0.05))
const height = computed(() => (stems.value === 0 ? 0 : Math.round(38 + Math.min(28, stems.value * 0.9))))
const size = computed(() => (stems.value === 0 ? '—' : stems.value <= 9 ? 'S' : stems.value <= 18 ? 'M' : 'L'))

const bouquetSvg = computed(() => buildBouquetSvg(heads.value, greenObjs.value, wrapObj.value, ribbonObj.value))
</script>

<style scoped>
:root {
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
  --r-sm: 10px;
}

.app { min-height: 100vh; color: var(--ink); font-family: 'Inter', system-ui, sans-serif; }
.serif { font-family: 'Montserrat', Georgia, serif; }
.tnum { font-variant-numeric: tabular-nums; }
.app :deep(button) { font-family: inherit; cursor: pointer; color: inherit; border: none; background: none; }

/* ---------- page frame ---------- */
.wrap { max-width: 1320px; margin: 0 auto; padding: 26px 24px 140px; }
.crumbs { font-size: 13px; color: var(--ink-faint); display: flex; gap: 8px; align-items: center; margin-bottom: 18px; }
.crumbs a { color: var(--ink-faint); text-decoration: none; }
.crumbs a:hover { color: var(--ink); }
.crumbs .sep { opacity: .5; }

.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 22px; flex-wrap: wrap; }
.head h1 { font-family: 'Montserrat', serif; font-weight: 500; font-size: clamp(34px, 4vw, 52px); line-height: 1.02; letter-spacing: -.015em; }
.head h1 em { font-style: italic; color: var(--clay); }
.head .sub { color: var(--ink-soft); font-size: 15.5px; max-width: 46ch; margin-top: 10px; }
.head .craft { font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--green-soft); font-weight: 600; margin-bottom: 14px; }

/* ---------- presets ---------- */
.presets { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 26px; }
.presets .lab { font-size: 13px; color: var(--ink-faint); margin-right: 2px; }
.preset { display: inline-flex; align-items: center; gap: 9px; padding: 8px 14px 8px 9px; border-radius: 30px; border: 1px solid var(--line-strong); background: var(--card); font-weight: 600; font-size: 13.5px; transition: .16s; }
.preset:hover { border-color: var(--green-soft); transform: translateY(-1px); }
.preset.on { border-color: var(--green); background: var(--green-wash); color: var(--green); }
.preset .sw { display: flex; }
.preset .sw i { width: 13px; height: 13px; border-radius: 50%; display: block; margin-left: -5px; box-shadow: 0 0 0 1.5px var(--card); }
.preset .sw i:first-child { margin-left: 0; }

/* ---------- workspace grid ---------- */
.work { display: grid; grid-template-columns: minmax(0, 400px) minmax(0, 1fr); gap: 30px; align-items: start; }
@media (max-width: 980px) { .work { grid-template-columns: 1fr; } }

/* ---------- preview panel ---------- */
.panel { position: sticky; top: 84px; }
@media (max-width: 980px) { .panel { position: static; } }
.preview-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); box-shadow: var(--shadow); }
.stage {
  position: relative; aspect-ratio: 1/1; border-radius: var(--r) var(--r) 0 0; overflow: hidden;
  background: radial-gradient(120% 120% at 50% 18%, oklch(0.975 0.012 86), oklch(0.93 0.016 80));
  display: grid; place-items: center; border-bottom: 1px solid var(--line);
}
.stage .sizebadge { position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--ink-soft); background: oklch(1 0 0 / .7); backdrop-filter: blur(6px); padding: 6px 11px; border-radius: 30px; border: 1px solid var(--line); z-index: 2; }
.stage .sizebadge b { color: var(--green); font-size: 13px; }
.stage .empty { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; color: var(--ink-faint); padding: 40px; }
.stage .empty .ring { width: 120px; height: 120px; border-radius: 50%; border: 2px dashed var(--line-strong); margin: 0 auto 16px; display: grid; place-items: center; color: var(--line-strong); }
.stage svg { display: block; width: 86%; height: 86%; overflow: visible; }

.compose { padding: 16px 18px; display: flex; gap: 8px; flex-wrap: wrap; border-bottom: 1px solid var(--line); }
.chip { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; background: var(--paper-2); border-radius: 30px; padding: 5px 11px 5px 7px; color: var(--ink-soft); }
.chip i { width: 11px; height: 11px; border-radius: 50%; display: block; }
.chip b { color: var(--ink); }
.chip .x { margin-left: 1px; color: var(--ink-faint); width: 15px; height: 15px; display: grid; place-items: center; border-radius: 50%; font-size: 13px; }
.chip .x:hover { background: oklch(0.85 0.02 60); color: var(--ink); }

.spec { padding: 14px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; border-bottom: 1px solid var(--line); }
.spec .s { text-align: center; }
.spec .s .v { font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
.spec .s .k { font-size: 11px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

.bill { padding: 16px 18px 18px; }
.bill .row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: var(--ink-soft); padding: 5px 0; }
.bill .row span:last-child { color: var(--ink); font-weight: 500; }
.bill .row.muted span:last-child { color: var(--ink-faint); font-weight: 400; }
.bill .tot { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; padding-top: 14px; border-top: 1px solid var(--line); }
.bill .tot .l { font-size: 14px; color: var(--ink-soft); }
.bill .tot .p { font-family: 'Montserrat', serif; font-size: 32px; font-weight: 600; letter-spacing: -.01em; }
.loyal { display: flex; align-items: center; gap: 9px; margin-top: 12px; background: var(--clay-wash); border-radius: var(--r-sm); padding: 10px 12px; font-size: 13px; color: oklch(0.45 0.08 47); }
.loyal b { color: var(--clay); font-weight: 700; }
.cta { margin-top: 14px; display: flex; gap: 10px; }
.btn-primary { flex: 1; height: 52px; padding: 0 18px; border-radius: 12px; background: var(--green); color: oklch(0.96 0.02 90); font-weight: 600; font-size: 16px; white-space: nowrap; display: flex; align-items: center; justify-content: flex-start; gap: 10px; transition: .16s; box-shadow: 0 4px 14px oklch(0.62 0.15 148 / .22); text-decoration: none; }
.btn-primary:hover { background: oklch(0.55 0.15 148); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { background: var(--line-strong); box-shadow: none; color: oklch(1 0 0 / .8); cursor: not-allowed; }
.btn-primary .pr { margin-left: auto; font-weight: 700; }
.icon-square { width: 52px; height: 52px; border-radius: 12px; border: 1px solid var(--line-strong); display: grid; place-items: center; color: var(--ink-soft); }
.icon-square:hover { background: var(--paper-2); color: var(--clay); }
.icon-square.on { color: var(--clay); border-color: var(--clay); background: var(--clay-wash); }
.assure { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 14px; font-size: 12px; color: var(--ink-faint); }
.assure span { display: inline-flex; gap: 5px; align-items: center; }

/* ---------- builder ---------- */
.builder { display: flex; flex-direction: column; gap: 16px; }
.section { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); box-shadow: var(--shadow); overflow: hidden; }
.sec-head { display: flex; align-items: center; gap: 13px; padding: 16px 20px; }
.sec-head .no { width: 26px; height: 26px; border-radius: 8px; background: var(--green-wash); color: var(--green); font-size: 13px; font-weight: 700; display: grid; place-items: center; flex: none; }
.sec-head h3 { font-size: 17px; font-weight: 600; letter-spacing: -.01em; }
.sec-head .meta { margin-left: auto; font-size: 13px; color: var(--ink-faint); }
.sec-head .meta b { color: var(--green); font-weight: 600; }
.sec-body { padding: 4px 20px 20px; }

.flowers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (max-width: 560px) { .flowers { grid-template-columns: 1fr; } }
.fcard { display: flex; align-items: center; gap: 13px; padding: 12px; border: 1px solid var(--line); border-radius: var(--r-sm); transition: .15s; background: var(--card); }
.fcard.active { border-color: var(--green-soft); background-color: oklch(0.97 0.014 140); }
.fhead { width: 44px; height: 44px; border-radius: 50%; flex: none; display: grid; place-items: center; background: oklch(0.962 0.012 84); box-shadow: inset 0 0 0 1px oklch(0 0 0 / .05); }
.fhead svg { display: block; overflow: visible; }
.finfo { flex: 1; min-width: 0; }
.finfo .n { font-weight: 600; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.finfo .p { font-size: 12.5px; color: var(--ink-faint); }
.finfo .p b { color: var(--ink-soft); font-weight: 600; }
.stepper { display: flex; align-items: center; gap: 0; border: 1px solid var(--line-strong); border-radius: 9px; overflow: hidden; flex: none; }
.stepper button { width: 32px; height: 32px; display: grid; place-items: center; color: var(--ink-soft); font-size: 17px; transition: .12s; }
.stepper button:hover { background: var(--green-wash); color: var(--green); }
.stepper button:disabled { color: var(--line-strong); cursor: not-allowed; }
.stepper .qv { min-width: 30px; text-align: center; font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums; }
.add-pill { height: 32px; padding: 0 14px; border-radius: 9px; border: 1px solid var(--line-strong); font-weight: 600; font-size: 13px; color: var(--green); display: inline-flex; align-items: center; gap: 6px; }
.add-pill:hover { background: var(--green-wash); border-color: var(--green-soft); }

/* greenery / option tiles */
.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.tile { border: 1px solid var(--line); border-radius: var(--r-sm); padding: 13px; cursor: pointer; transition: .15s; position: relative; display: flex; flex-direction: column; gap: 8px; }
.tile:hover { border-color: var(--green-soft); }
.tile.on { border-color: var(--green); background: var(--green-wash); }
.tile .tt { font-weight: 600; font-size: 14px; }
.tile .td { font-size: 12px; color: var(--ink-faint); }
.tile .tp { font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-top: auto; }
.tile .check { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--line-strong); display: grid; place-items: center; color: transparent; transition: .15s; }
.tile.on .check { background: var(--green); border-color: var(--green); color: #fff; }
.tile .leaf { width: 34px; height: 34px; border-radius: 8px; display: grid; place-items: center; }

.ribbons { display: flex; gap: 12px; flex-wrap: wrap; }
.ribbon { display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer; }
.ribbon .rsw { width: 46px; height: 46px; border-radius: 50%; box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08); position: relative; transition: .15s; }
.ribbon.on .rsw { box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--green); }
.ribbon .rn { font-size: 12px; color: var(--ink-soft); font-weight: 500; }
.ribbon.on .rn { color: var(--green); font-weight: 600; }

.note { display: flex; gap: 10px; align-items: flex-start; background: var(--green-wash); border-radius: var(--r-sm); padding: 12px 14px; font-size: 13px; color: var(--green); margin-top: 4px; }
.note :deep(svg) { flex: none; margin-top: 1px; }

/* mobile sticky bar */
.mbar { display: none; }
@media (max-width: 980px) {
  .mbar { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; background: oklch(0.992 0.006 84 / .94); backdrop-filter: blur(12px); border-top: 1px solid var(--line); padding: 12px 18px; align-items: center; gap: 14px; box-shadow: 0 -8px 30px oklch(0.4 0.03 70 / .1); }
  .mbar .mp { display: flex; flex-direction: column; }
  .mbar .mp .k { font-size: 11px; color: var(--ink-faint); }
  .mbar .mp .v { font-family: 'Montserrat', serif; font-size: 24px; font-weight: 600; line-height: 1; }
  .mbar .btn-primary { height: 48px; flex: 1; justify-content: center; }
}
</style>
