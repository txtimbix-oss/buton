<template>
  <Teleport to="body">
    <Transition name="cqv">
      <div v-if="open" class="cqv-overlay" @click.self="close">
        <div
          ref="panel"
          class="cqv"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <div class="cqv-actions">
            <button class="cqv-icon cqv-like" :class="{ on: liked }" :aria-label="liked ? 'В избранном' : 'В избранное'" @click="toggleLike">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/></svg>
            </button>
            <button class="cqv-icon" :class="{ copied: shareCopied }" :aria-label="shareCopied ? 'Ссылка скопирована' : 'Поделиться'" @click="shareProduct">
              <svg v-if="!shareCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8.5 7.5 12 4l3.5 3.5"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>
            </button>
            <button ref="closeBtn" class="cqv-icon" aria-label="Закрыть" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>

          <div class="cqv-scroll">
            <!-- ВЕРХ: галерея + основная инфо -->
            <div class="cqv-top">
              <!-- МЕДИА -->
              <div class="cqv-media">
                <div class="cqv-main">
                  <img v-if="mainImg && !imgError" :src="mainImg" :alt="title" class="cqv-img" @error="imgError = true" />
                  <div v-else class="cqv-ph"><span class="cqv-ph-lbl">фото букета</span></div>
                  <span v-if="tagArr" class="cqv-tag" :class="tagArr[0]">{{ tagArr[1] }}</span>
                </div>
                <div v-if="images.length > 1" class="cqv-thumbs">
                  <button
                    v-for="(t, i) in images"
                    :key="i"
                    class="cqv-thumb"
                    :class="{ on: i === thumb }"
                    @click="thumb = i"
                  >
                    <img :src="t" :alt="title" />
                  </button>
                </div>
              </div>

              <!-- ИНФО -->
              <div class="cqv-info">
                <div class="cqv-avail"><span class="cqv-dot" /><span class="cqv-avail-t">Наличие подтверждено · соберём за 2 часа</span></div>
                <h2 class="cqv-title serif">{{ title }}</h2>

                <div class="cqv-rate">
                  <span class="cqv-stars">
                    <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor" :style="{ opacity: n <= filled ? 1 : .25 }"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>
                  </span>
                  <b>{{ rating }}</b>
                  <span v-if="reviewTotal" class="cqv-revs">· {{ reviewTotal }} {{ plural(reviewTotal, ['отзыв', 'отзыва', 'отзывов']) }}</span>
                </div>

                <p v-if="subtitle" class="cqv-desc">{{ subtitle }}</p>

                <div class="cqv-price">
                  <span class="cqv-now serif">{{ fmt(unitPrice) }} ₽</span>
                  <span v-if="oldPrice" class="cqv-old">{{ fmt(oldPrice) }} ₽</span>
                  <span v-if="discount" class="cqv-save">−{{ discount }}%</span>
                </div>

                <!-- размеры -->
                <div v-if="loading || sizes.length" class="cqv-field">
                  <div class="cqv-field-h">
                    <span>Размер букета</span>
                    <span v-if="activeSize && activeSize.desc" class="cqv-field-hint">{{ activeSize.desc }}</span>
                  </div>
                  <div v-if="loading" class="cqv-sizes">
                    <span v-for="n in 3" :key="n" class="cqv-size cqv-skel" />
                  </div>
                  <div v-else class="cqv-sizes">
                    <button
                      v-for="s in sizes"
                      :key="s.label"
                      class="cqv-size"
                      :class="{ on: s.label === sizeLabel }"
                      @click="sizeLabel = s.label"
                    >
                      <span class="cqv-size-l">{{ shortLabel(s.label) }}</span>
                      <span class="cqv-size-p">{{ fmt(s.price) }} ₽</span>
                    </button>
                  </div>
                </div>

                <!-- повод -->
                <div class="cqv-field">
                  <div class="cqv-field-h"><span>Повод</span><span class="cqv-field-hint">подберём открытку и тон</span></div>
                  <div class="cqv-chips">
                    <button
                      v-for="o in OCCASIONS"
                      :key="o.id"
                      class="cqv-chip"
                      :class="{ on: occasion === o.id }"
                      @click="occasion = o.id"
                    >
                      <span v-if="o.em" class="cqv-chip-em">{{ o.em }}</span>{{ o.name }}
                    </button>
                  </div>
                </div>

                <!-- открытка -->
                <div class="cqv-field">
                  <button class="cqv-card-sw" :class="{ on: cardOn }" type="button" @click="cardOn = !cardOn">
                    <span class="cqv-card-txt">
                      <span class="cqv-card-t">Открытка с текстом</span>
                      <span class="cqv-card-d">Напишем от руки и вложим в букет — бесплатно</span>
                    </span>
                    <span class="cqv-toggle" :class="{ on: cardOn }"><span></span></span>
                  </button>
                  <div v-if="cardOn" class="cqv-card-box">
                    <div class="cqv-card-designs">
                      <button
                        v-for="d in CARD_DESIGNS"
                        :key="d.id"
                        class="cqv-card-design"
                        :class="{ on: cardDesign === d.id }"
                        @click="cardDesign = d.id"
                      >{{ d.em }}</button>
                      <span class="cqv-card-designs-h">дизайн открытки</span>
                    </div>
                    <textarea
                      class="cqv-card-ta"
                      maxlength="200"
                      v-model="cardText"
                      placeholder="Например: «С днём рождения! Пусть каждый день будет таким же светлым, как эти цветы.»"
                    ></textarea>
                    <div class="cqv-card-meta"><span>Почерк флориста, чёрные чернила</span><span>{{ cardText.length }}/200</span></div>
                  </div>
                </div>

                <!-- допы -->
                <div v-if="addonOptions.length" class="cqv-field">
                  <div class="cqv-field-h"><span>Дополнить букет</span><span class="cqv-field-hint">по желанию</span></div>
                  <div class="cqv-addons">
                    <button
                      v-for="a in addonOptions"
                      :key="a.id"
                      class="cqv-addon"
                      :class="{ on: addonsSel[a.id] }"
                      @click="toggleAddon(a.id)"
                    >
                      <span class="cqv-addon-sw" :style="{ background: a.color }"></span>
                      <span class="cqv-addon-i">
                        <span class="cqv-addon-n">{{ a.name }}</span>
                        <span class="cqv-addon-p">{{ a.label }}</span>
                      </span>
                      <span class="cqv-addon-add" :class="{ on: addonsSel[a.id] }">{{ addonsSel[a.id] ? '✓' : '+' }}</span>
                    </button>
                  </div>
                </div>

                <div class="cqv-perks">
                  <span class="cqv-perk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span>
                  <span class="cqv-perk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg> Свежесть 7 дней</span>
                  <span class="cqv-perk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg> Замена при браке</span>
                </div>

                <div class="cqv-loyal">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>
                  <span>Вернём <b>{{ fmt(points) }} {{ plural(points, ['балл', 'балла', 'баллов']) }}</b> — оплатите ими до 30% следующего заказа</span>
                </div>
                <div class="cqv-deliv">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
                  <span>Доставим <b>сегодня к 18:00</b>, если оформите до 16:00. Перед отправкой пришлём фото готового букета в WhatsApp.</span>
                </div>
              </div>
            </div>

            <!-- НИЖНИЕ СЕКЦИИ -->
            <div class="cqv-sections">
              <section v-if="composition.length" class="cqv-sec">
                <h3 class="cqv-sec-t">Состав</h3>
                <div class="cqv-comp">
                  <div v-for="(c, i) in composition" :key="i" class="cqv-comp-row">
                    <span class="cqv-comp-n">{{ c.name }}</span>
                    <span class="cqv-comp-q">{{ c.qty }}</span>
                  </div>
                </div>
              </section>

              <section v-if="specs.length" class="cqv-sec">
                <h3 class="cqv-sec-t">Характеристики</h3>
                <div class="cqv-specs">
                  <div v-for="(s, i) in specs" :key="i" class="cqv-spec">
                    <span class="cqv-spec-k">{{ s[0] }}</span>
                    <span class="cqv-spec-v">{{ s[1] }}</span>
                  </div>
                </div>
              </section>

              <section v-if="careSteps.length" class="cqv-sec">
                <h3 class="cqv-sec-t">Уход за букетом</h3>
                <ol class="cqv-care">
                  <li v-for="(c, i) in careSteps" :key="i"><span class="cqv-care-n">{{ i + 1 }}</span><span>{{ c }}</span></li>
                </ol>
              </section>

              <section class="cqv-sec">
                <h3 class="cqv-sec-t">Идеально в подарок</h3>
                <div class="cqv-whom">
                  <span v-for="(w, i) in WHOM" :key="i" class="cqv-whom-chip">{{ w }}</span>
                </div>
              </section>

              <!-- ОТЗЫВЫ -->
              <section class="cqv-sec">
                <h3 class="cqv-sec-t">Отзывы<template v-if="reviewTotal"> · {{ reviewTotal }}</template></h3>
                <div class="cqv-rev-head">
                  <div class="cqv-rev-score">
                    <div class="cqv-rev-big serif">{{ reviewScore }}</div>
                    <span class="cqv-stars">
                      <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor" :style="{ opacity: n <= Math.round(reviewScore) ? 1 : .25 }"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>
                    </span>
                  </div>
                  <div class="cqv-rev-bars">
                    <div v-for="row in revBars" :key="row[0]" class="cqv-rev-bar">
                      <span>{{ row[0] }}★</span>
                      <span class="cqv-rev-track"><span class="cqv-rev-fill" :style="{ width: row[1] + '%' }"></span></span>
                      <span class="cqv-rev-pct">{{ row[1] }}%</span>
                    </div>
                  </div>
                </div>
                <div class="cqv-reviews">
                  <div v-for="(r, i) in REVIEWS" :key="i" class="cqv-review">
                    <div class="cqv-review-h">
                      <span class="cqv-review-av">{{ (r.n || '?')[0] }}</span>
                      <span class="cqv-review-meta"><span class="cqv-review-n">{{ r.n }}</span><span class="cqv-review-d">{{ r.d }}</span></span>
                      <span class="cqv-stars cqv-stars--sm">
                        <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor" :style="{ opacity: n <= r.s ? 1 : .25 }"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>
                      </span>
                    </div>
                    <p class="cqv-review-t">{{ r.t }}</p>
                  </div>
                </div>
              </section>

              <!-- С ЭТИМ ЗАКАЗЫВАЮТ -->
              <section v-if="related.length" class="cqv-sec">
                <h3 class="cqv-sec-t">С этим букетом заказывают</h3>
                <div class="cqv-rel">
                  <NuxtLink
                    v-for="(p, i) in related"
                    :key="i"
                    class="cqv-rel-card"
                    :to="p.slug ? `/product/${p.slug}` : '/catalog'"
                    @click="close"
                  >
                    <span class="cqv-rel-media">
                      <img v-if="p.img" :src="p.img" :alt="p.n" />
                      <span v-else class="cqv-rel-ph"></span>
                      <span v-if="p.tag" class="cqv-rel-tag" :class="p.tag[0]">{{ p.tag[1] }}</span>
                    </span>
                    <span class="cqv-rel-n">{{ p.n }}</span>
                    <span v-if="p.c" class="cqv-rel-c">{{ p.c }}</span>
                    <span class="cqv-rel-p">{{ fmt(p.p) }} ₽<span v-if="p.o" class="cqv-rel-o">{{ fmt(p.o) }} ₽</span></span>
                  </NuxtLink>
                </div>
              </section>

              <NuxtLink class="cqv-full" :to="fullLink" @click="close">
                Открыть полную страницу товара
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
              </NuxtLink>
            </div>
          </div>

          <!-- STICKY ПОКУПКА -->
          <div class="cqv-bar">
            <div class="cqv-qty">
              <button aria-label="Меньше" @click="qty = Math.max(1, qty - 1)">−</button>
              <span class="cqv-qn">{{ qty }}</span>
              <button aria-label="Больше" @click="qty = Math.min(20, qty + 1)">+</button>
            </div>
            <NuxtLink v-if="added" class="cqv-cta is-added" to="/cart" @click="close">
              Перейти в корзину
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </NuxtLink>
            <button v-else class="cqv-cta" @click="addToCart">
              В корзину<span class="cqv-cta-p">{{ fmt(total) }} ₽</span>
            </button>
            <NuxtLink class="cqv-cta cqv-cta--ghost" :to="fullLink" @click="close">Купить сейчас</NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { createCartLine } from '~/lib/cart/createCartLine'

const cart = useCart()

const props = defineProps({
  card: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const open = computed(() => !!props.card)

/* ---- state ---- */
const detail = ref(null)
const reviewsRaw = ref([])
const recsRaw = ref([])
const relPool = ref({ items: [] })
const loading = ref(false)
const thumb = ref(0)
const sizeLabel = ref(null)
const qty = ref(1)
const added = ref(false)
const imgError = ref(false)
const panel = ref(null)
const closeBtn = ref(null)
/* конфигуратор — как на полной странице товара */
const occasion = ref('birthday')
const cardOn = ref(true)
const cardDesign = ref('mini')
const cardText = ref('')
const addonsSel = ref({})

/* ---- helpers ---- */
const fmt = n => Number(n || 0).toLocaleString('ru-RU')
const shortLabel = l => String(l || '').split(/[·\-—]/)[0].trim() || l
const plural = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}
const revDate = iso => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) } catch { return '' }
}
const close = () => emit('close')

/* ---- статические данные конфигуратора (как на PDP) ---- */
const OCCASIONS = [
  { id: 'birthday', em: '🎂', name: 'День рождения' },
  { id: 'love', em: '❤️', name: 'Любовь' },
  { id: 'wedding', em: '💍', name: 'Свадьба' },
  { id: 'sorry', em: '🕊', name: 'Извинения' },
  { id: 'thanks', em: '🙏', name: 'Благодарность' },
  { id: 'none', em: '', name: 'Без повода' },
]
const CARD_DESIGNS = [
  { id: 'mini', em: '✿' },
  { id: 'kraft', em: '❦' },
  { id: 'photo', em: '❤' },
]
const ADDON_COLORS = ['oklch(0.72 0.05 70)', 'oklch(0.42 0.06 50)', 'oklch(0.82 0.03 230)', 'oklch(0.78 0.07 20)']
const ADDONS_DEFAULT = [
  { id: 'bear', name: 'Мишка Тедди', price: 1200 },
  { id: 'choco', name: 'Конфеты Lindt', price: 990 },
  { id: 'vase', name: 'Стеклянная ваза', price: 1500 },
  { id: 'balloon', name: 'Связка шаров', price: 850 },
]
const WHOM = ['Маме', 'Любимой', 'Коллеге', 'Подруге', 'Жене', 'Без повода']
const FALLBACK_REVIEWS = [
  { n: 'Мария С.', d: '2 недели назад', s: 5, t: 'Заказывала маме на юбилей. Прислали фото перед доставкой — букет ещё пышнее, чем на сайте. Стоял 9 дней!' },
  { n: 'Дмитрий К.', d: 'месяц назад', s: 5, t: 'Собрали за час, привезли точно в слот 16:00–18:00. Цветы свежие, упаковка аккуратная. Жена в восторге.' },
  { n: 'Анна В.', d: 'месяц назад', s: 4, t: 'Красивый букет, но хотелось чуть больше зелени. В остальном всё на высоте, открытка от руки — приятная мелочь.' },
]
const FALLBACK_RELATED = [
  { n: 'Невский букет', c: 'Кустовые розы, фрезия', p: 4200, o: 0, tag: ['new', 'Новинка'], slug: '', img: '' },
  { n: 'Нежность в коробке', c: 'Пионовидные розы', p: 5800, o: 6900, tag: ['sale', '−16%'], slug: '', img: '' },
  { n: 'Летнее поле', c: 'Сезонный микс', p: 3400, o: 0, tag: ['hit', 'Хит'], slug: '', img: '' },
  { n: 'Свадебный пион', c: 'Розы, гипсофила', p: 6500, o: 0, tag: null, slug: '', img: '' },
]
const TAG_MAP = { hit: ['hit', 'Хит'], new: ['new', 'Новинка'], sale: ['sale', 'Скидка'] }
const TAGc_REL = { 'Хит': 'hit', 'Новинка': 'new', 'Скидка': 'sale', 'Премиум': 'hit' }

const tagArr = computed(() => {
  const t = props.card?.tag
  if (!t) return null
  if (Array.isArray(t)) return t
  return TAG_MAP[t] || ['hit', t]
})

/* ---- derived: основное ---- */
const title = computed(() => detail.value?.name || props.card?.n || 'Букет')
const subtitle = computed(() => detail.value?.description || detail.value?.meta || props.card?.c || '')
const rating = computed(() => Number(detail.value?.rating ?? props.card?.r ?? 4.9).toFixed(1))
const filled = computed(() => Math.round(Number(rating.value)))
const images = computed(() => {
  const d = detail.value?.images
  if (Array.isArray(d) && d.filter(Boolean).length) return d.filter(Boolean)
  return props.card?.img ? [props.card.img] : []
})
const mainImg = computed(() => images.value[thumb.value] || images.value[0] || null)
const sizes = computed(() => Array.isArray(detail.value?.sizes) ? detail.value.sizes : [])
const activeSize = computed(() => sizes.value.find(s => s.label === sizeLabel.value) || null)

/* ---- цена (размер + допы) × кол-во ---- */
const sizePrice = computed(() => activeSize.value?.price || detail.value?.price || props.card?.p || 0)
const priceLabel = p => `+${fmt(p)} ₽`
const addonOptions = computed(() => {
  const arr = detail.value?.addons
  // у API: name = название, display = ценник («+ 1 200 ₽» / «бесплатно»); price = число
  const base = Array.isArray(arr) && arr.length
    ? arr.map((a, i) => ({ id: a.name || String(i), name: a.name || '', price: Number(a.price) || 0, label: a.display || priceLabel(Number(a.price) || 0) }))
    : ADDONS_DEFAULT.map(a => ({ ...a, label: priceLabel(a.price) }))
  return base.map((a, i) => ({ ...a, color: ADDON_COLORS[i % ADDON_COLORS.length] }))
})
const addonsTotal = computed(() => addonOptions.value.reduce((s, a) => s + (addonsSel.value[a.id] ? a.price : 0), 0))
const unitPrice = computed(() => sizePrice.value + addonsTotal.value)
const total = computed(() => unitPrice.value * qty.value)
const points = computed(() => Math.round(total.value * 0.05))
const oldPrice = computed(() => {
  const o = Number(props.card?.o || 0)
  return o > sizePrice.value ? o : 0
})
const discount = computed(() => oldPrice.value ? Math.round((1 - sizePrice.value / oldPrice.value) * 100) : 0)
const fullLink = computed(() => props.card?.slug ? `/product/${props.card.slug}` : '/product/test')

/* ---- состав / уход / характеристики ---- */
const composition = computed(() => Array.isArray(detail.value?.composition) ? detail.value.composition.filter(c => c && c.name) : [])
const careSteps = computed(() => {
  const raw = detail.value?.careInstructions
  if (typeof raw !== 'string' || !raw.trim()) return []
  return raw.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
})
const specs = computed(() => {
  const out = []
  if (activeSize.value?.desc) out.push(['Размер', activeSize.value.desc])
  out.push(['Свежесть', 'до 7 дней'])
  out.push(['Сборка', 'за 2 часа'])
  out.push(['Упаковка', 'авторская'])
  out.push(['Фото', 'перед доставкой'])
  out.push(['Замена', 'при браке'])
  return out
})

/* ---- отзывы ---- */
const REVIEWS = computed(() => {
  const list = Array.isArray(reviewsRaw.value) ? reviewsRaw.value.filter(r => r && r.text) : []
  if (!list.length) return FALLBACK_REVIEWS
  return list.map(r => ({ n: r.name || 'Гость', d: revDate(r.createdAt), s: r.rating || 5, t: r.text }))
})
const reviewTotal = computed(() => {
  const real = Array.isArray(reviewsRaw.value) ? reviewsRaw.value.filter(r => r && r.text).length : 0
  return real || Number(detail.value?.reviewCount || 0)
})
const reviewScore = computed(() => {
  const list = REVIEWS.value
  if (!list.length) return rating.value
  return (list.reduce((a, r) => a + (Number(r.s) || 0), 0) / list.length).toFixed(1)
})
const revBars = computed(() => {
  const list = REVIEWS.value
  const tot = list.length || 1
  return [5, 4, 3, 2, 1].map(star => {
    const c = list.filter(r => Math.round(Number(r.s) || 0) === star).length
    return [star, Math.round((c / tot) * 100)]
  })
})

/* ---- рекомендации ---- */
const mapRel = p => ({
  n: p.name,
  c: p.meta || '',
  p: p.price || 0,
  o: p.oldPrice || 0,
  tag: p.tag ? [TAGc_REL[p.tag] || 'hit', p.tag] : null,
  slug: p.slug || '',
  img: (p.images && p.images[0]) || '',
})
const related = computed(() => {
  const recs = Array.isArray(recsRaw.value) ? recsRaw.value : []
  if (recs.length) return recs.slice(0, 4).map(mapRel)
  const pool = (relPool.value?.items || []).filter(p => p.slug && p.slug !== props.card?.slug)
  if (pool.length) return pool.slice(0, 4).map(mapRel)
  return FALLBACK_RELATED
})

/* ---- избранное / поделиться ---- */
const wishlist = useWishlist()
const liked = computed(() => {
  const slug = props.card?.slug
  return slug ? wishlist.slugs.value.includes(slug) : false
})
function toggleLike() {
  if (props.card?.slug) wishlist.toggle(props.card.slug)
}
const shareCopied = ref(false)
async function shareProduct() {
  const url = (import.meta.client ? location.origin : '') + fullLink.value
  const isTouch = import.meta.client && navigator.maxTouchPoints > 0
  if (isTouch && navigator.share) {
    try { await navigator.share({ title: title.value, url }) } catch (_) {}
    return
  }
  try { if (navigator.clipboard) await navigator.clipboard.writeText(url) } catch (_) {}
  shareCopied.value = true
  setTimeout(() => { shareCopied.value = false }, 1600)
}

/* ---- actions ---- */
function toggleAddon(id) {
  addonsSel.value = { ...addonsSel.value, [id]: !addonsSel.value[id] }
}
function addToCart() {
  const chosen = addonOptions.value.filter(a => addonsSel.value[a.id]).map(a => a.name)
  cart.addLine(createCartLine({
    slug: props.card?.slug || detail.value?.slug || '',
    name: title.value,
    bloom: detail.value?.bloom || props.card?.bloom || 'rose',
    image: mainImg.value || undefined,
    meta: activeSize.value?.label || subtitle.value,
    sizeLabel: activeSize.value?.label || '',
    price: unitPrice.value,
    qty: qty.value,
    addons: chosen,
  }))
  added.value = true
}
// сброс «добавлено» при смене конфигурации
watch([sizeLabel, qty, occasion, () => JSON.stringify(addonsSel.value)], () => { added.value = false })

/* ---- lifecycle: fetch detail/reviews/recs, lock scroll, esc, focus ---- */
function onKey(e) { if (e.key === 'Escape') close() }

watch(() => props.card, async (c) => {
  detail.value = null
  reviewsRaw.value = []
  recsRaw.value = []
  relPool.value = { items: [] }
  thumb.value = 0
  qty.value = 1
  added.value = false
  imgError.value = false
  sizeLabel.value = null
  occasion.value = 'birthday'
  cardOn.value = true
  cardDesign.value = 'mini'
  cardText.value = ''
  addonsSel.value = {}
  if (!c || !c.slug) return

  loading.value = true
  const [d, rv, rc, pl] = await Promise.all([
    $fetch(`/api/products/${c.slug}`).catch(() => null),
    $fetch(`/api/reviews/product/${c.slug}`).catch(() => []),
    $fetch(`/api/products/${c.slug}/recommendations`).catch(() => []),
    $fetch('/api/products/catalog', { query: { limit: 6 } }).catch(() => ({ items: [] })),
  ])
  detail.value = d
  reviewsRaw.value = Array.isArray(rv) ? rv : []
  recsRaw.value = Array.isArray(rc) ? rc : []
  relPool.value = pl && pl.items ? pl : { items: [] }
  loading.value = false

  const sz = detail.value?.sizes
  if (Array.isArray(sz) && sz.length) {
    sizeLabel.value = (sz[Math.floor(sz.length / 2)] || sz[0]).label
  }
})

// сброс флага ошибки при смене картинки (превью / подгрузка деталей)
watch(mainImg, () => { imgError.value = false })

watch(open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) {
    window.addEventListener('keydown', onKey)
    nextTick(() => (closeBtn.value || panel.value)?.focus())
  } else {
    window.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.cqv-overlay {
  --paper: oklch(0.985 0 0);
  --card: oklch(1 0 0);
  --ink: oklch(0.255 0.018 64);
  --ink-soft: oklch(0.46 0.018 64);
  --ink-faint: oklch(0.62 0.014 70);
  --green: oklch(0.62 0.15 148);
  --green-soft: oklch(0.58 0.1 150);
  --green-wash: oklch(0.95 0.03 150);
  --clay: oklch(0.72 0.15 52);
  --blush: oklch(0.8 0.055 24);
  --line: oklch(0.912 0 0);
  --line-strong: oklch(0.86 0 0);

  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: oklch(0.22 0.02 60 / .46);
  backdrop-filter: blur(3px);
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
}

.cqv {
  position: relative;
  width: 100%;
  max-width: 940px;
  max-height: 90vh;
  background: var(--card);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 30px 80px oklch(0.2 0.02 60 / .35);
  display: flex;
  flex-direction: column;
}
.cqv:focus { outline: none; }
.cqv * { box-sizing: border-box; }
.serif { font-family: 'Montserrat', system-ui, sans-serif; }

/* скролл-зона */
.cqv-scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; }

/* действия в углу: лайк / поделиться / закрыть */
.cqv-actions { position: absolute; top: 14px; right: 14px; z-index: 5; display: flex; gap: 6px; }
.cqv-icon {
  width: 38px; height: 38px; border: none; border-radius: 50%;
  background: oklch(1 0 0 / .85); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  color: var(--ink-soft); display: grid; place-items: center; cursor: pointer;
  transition: transform .14s, color .14s, background .14s;
}
.cqv-icon svg { width: 18px; height: 18px; transition: fill .14s; }
.cqv-icon:hover { color: var(--clay); background: oklch(1 0 0 / .96); transform: scale(1.06); }
.cqv-icon:active { transform: scale(.92); }
.cqv-like.on { color: var(--clay); }
.cqv-like.on svg { fill: var(--clay); animation: cqvpop .32s ease; }
.cqv-icon.copied { color: var(--green); }
@keyframes cqvpop { 0% { transform: scale(1); } 40% { transform: scale(1.32); } 100% { transform: scale(1); } }

/* ---- верх: 2 колонки ---- */
.cqv-top { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(0, 1fr); align-items: stretch; }

.cqv-media { display: flex; flex-direction: column; background: oklch(0.93 0.012 80); min-height: 0; }
.cqv-main { position: relative; flex: 1; min-height: 380px; overflow: hidden; }
.cqv-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.cqv-ph {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(135deg, oklch(0.9 0.014 80) 0 11px, oklch(0.93 0.012 82) 11px 22px);
  display: grid; place-items: center;
}
.cqv-ph-lbl {
  font: 11.5px ui-monospace, 'SF Mono', Menlo, monospace;
  letter-spacing: .04em; color: oklch(0.5 0.02 70);
  background: oklch(0.98 0.008 84 / .82); padding: 5px 10px; border-radius: 6px;
}
.cqv-tag {
  position: absolute; top: 14px; left: 14px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase;
  padding: 4px 9px; border-radius: 6px;
}
.cqv-tag.hit { background: var(--clay); color: #fff; }
.cqv-tag.new { background: var(--green); color: #fff; }
.cqv-tag.sale { background: var(--blush); color: oklch(0.32 0.06 24); }
.cqv-thumbs { display: flex; gap: 8px; padding: 10px; background: var(--card); flex-wrap: wrap; }
.cqv-thumb {
  width: 52px; height: 52px; flex: none; padding: 0;
  border-radius: 9px; overflow: hidden; cursor: pointer;
  border: 1px solid var(--line); background: none; transition: border-color .14s;
}
.cqv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cqv-thumb.on { border-color: var(--green); outline: 1px solid var(--green); }

/* ---- инфо ---- */
.cqv-info { padding: 30px 30px 26px; display: flex; flex-direction: column; }
.cqv-avail { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--green-soft); padding-right: 118px; }
.cqv-avail-t { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cqv-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green-soft); flex: none; }
.cqv-title { font-weight: 600; font-size: clamp(23px, 2.6vw, 29px); line-height: 1.08; letter-spacing: -.015em; margin: 10px 0 0; text-wrap: balance; }
.cqv-rate { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 13.5px; }
.cqv-stars { display: inline-flex; gap: 1px; color: var(--clay); }
.cqv-stars svg { width: 15px; height: 15px; }
.cqv-rate b { color: var(--ink-soft); font-weight: 600; }
.cqv-revs { color: var(--ink-faint); }
.cqv-desc { margin-top: 12px; font-size: 14px; line-height: 1.55; color: var(--ink-soft); }

.cqv-price { display: flex; align-items: baseline; gap: 11px; margin-top: 18px; }
.cqv-now { font-size: 32px; font-weight: 600; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
.cqv-old { font-size: 16px; color: var(--ink-faint); text-decoration: line-through; font-variant-numeric: tabular-nums; }
.cqv-save { font-size: 12px; font-weight: 700; background: var(--blush); color: oklch(0.32 0.06 24); padding: 3px 8px; border-radius: 6px; }

.cqv-field { margin-top: 20px; }
.cqv-field-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.cqv-field-h > span:first-child { font-size: 13.5px; font-weight: 600; }
.cqv-field-hint { font-size: 12.5px; color: var(--ink-faint); }
.cqv-sizes { display: flex; gap: 8px; }
.cqv-size {
  flex: 1; min-width: 0; padding: 9px 6px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  border: 1px solid var(--line-strong); border-radius: 11px; background: var(--card); cursor: pointer; transition: .14s;
}
.cqv-size-l { font-weight: 700; font-size: 14px; }
.cqv-size-p { font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums; }
.cqv-size:hover { border-color: var(--green-soft); }
.cqv-size.on { border-color: var(--green); background: var(--green-wash); box-shadow: inset 0 0 0 1px var(--green); }
.cqv-size.on .cqv-size-p { color: var(--green-soft); }
.cqv-skel {
  height: 50px; border: none; cursor: default;
  background: linear-gradient(90deg, oklch(0.93 0.01 80) 25%, oklch(0.96 0.008 80) 50%, oklch(0.93 0.01 80) 75%);
  background-size: 200% 100%; animation: cqvshimmer 1.3s infinite;
}
@keyframes cqvshimmer { to { background-position: -200% 0; } }

/* повод / чипы */
.cqv-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cqv-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 13px; border: 1px solid var(--line-strong); border-radius: 30px;
  background: var(--card); font-family: inherit; font-size: 13px; font-weight: 500; color: var(--ink-soft);
  cursor: pointer; transition: .14s;
}
.cqv-chip-em { font-size: 14px; line-height: 1; }
.cqv-chip:hover { border-color: var(--green-soft); }
.cqv-chip.on { border-color: var(--green); background: var(--green-wash); color: var(--ink); }

/* открытка */
.cqv-card-sw {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border: 1px solid var(--line-strong); border-radius: 13px;
  background: var(--card); cursor: pointer; text-align: left; font-family: inherit; transition: .14s;
}
.cqv-card-sw.on { border-color: var(--green); background: var(--green-wash); }
.cqv-card-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cqv-card-t { font-weight: 600; font-size: 14px; color: var(--ink); }
.cqv-card-d { font-size: 12.5px; color: var(--ink-faint); margin-top: 2px; }
.cqv-toggle { flex: none; width: 42px; height: 24px; border-radius: 30px; background: var(--line-strong); position: relative; transition: background .16s; }
.cqv-toggle > span { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .16s; box-shadow: 0 1px 3px oklch(0.2 0.02 60 / .25); }
.cqv-toggle.on { background: var(--green); }
.cqv-toggle.on > span { transform: translateX(18px); }
.cqv-card-box { margin-top: 12px; }
.cqv-card-designs { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.cqv-card-design {
  width: 38px; height: 38px; border: 1px solid var(--line-strong); border-radius: 9px;
  background: var(--card); color: var(--clay); font-size: 16px; cursor: pointer;
  display: grid; place-items: center; transition: .14s;
}
.cqv-card-design.on { border-color: var(--green); background: var(--green-wash); }
.cqv-card-designs-h { font-size: 12.5px; color: var(--ink-faint); }
.cqv-card-ta {
  width: 100%; min-height: 72px; resize: vertical;
  border: 1px solid var(--line-strong); border-radius: 11px; padding: 11px 13px;
  font-family: inherit; font-size: 13.5px; line-height: 1.5; color: var(--ink); background: var(--paper); outline: none; transition: border-color .14s;
}
.cqv-card-ta:focus { border-color: var(--green); }
.cqv-card-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-faint); margin-top: 6px; }

/* допы */
.cqv-addons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.cqv-addon {
  display: flex; align-items: center; gap: 10px; padding: 9px 11px;
  border: 1px solid var(--line-strong); border-radius: 12px; background: var(--card);
  cursor: pointer; text-align: left; font-family: inherit; transition: .14s;
}
.cqv-addon.on { border-color: var(--green); background: var(--green-wash); }
.cqv-addon-sw { flex: none; width: 30px; height: 30px; border-radius: 8px; }
.cqv-addon-i { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cqv-addon-n { font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cqv-addon-p { font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums; }
.cqv-addon-add { flex: none; width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--line-strong); display: grid; place-items: center; font-size: 15px; color: var(--ink-soft); }
.cqv-addon-add.on { background: var(--green); border-color: var(--green); color: #fff; }

/* лояльность / доставка */
.cqv-loyal, .cqv-deliv { display: flex; gap: 9px; align-items: flex-start; font-size: 13px; line-height: 1.45; color: var(--ink-soft); margin-top: 14px; }
.cqv-loyal { color: var(--green-soft); }
.cqv-loyal b, .cqv-deliv b { color: var(--ink); }
.cqv-loyal svg, .cqv-deliv svg { width: 16px; height: 16px; flex: none; margin-top: 1px; color: var(--green-soft); }

.cqv-perks { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.cqv-perk {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500; color: var(--ink-soft);
  background: var(--paper); border: 1px solid var(--line); border-radius: 30px; padding: 5px 11px;
}
.cqv-perk svg { width: 14px; height: 14px; color: var(--green-soft); flex: none; }

/* ---- секции ---- */
.cqv-sections { padding: 6px 30px 26px; }
.cqv-sec { padding: 20px 0; border-top: 1px solid var(--line); }
.cqv-sec:first-child { border-top: none; }
.cqv-sec-t { font-family: 'Montserrat', system-ui, sans-serif; font-weight: 600; font-size: 17px; margin: 0 0 14px; }
.cqv-comp { display: flex; flex-direction: column; }
.cqv-comp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 0; }
.cqv-comp-n { font-weight: 500; font-size: 14px; }
.cqv-comp-q { color: var(--ink-faint); font-size: 13px; font-variant-numeric: tabular-nums; }
.cqv-specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.cqv-spec { background: var(--card); padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.cqv-spec-k { font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-faint); }
.cqv-spec-v { font-size: 14px; font-weight: 600; }
.cqv-care { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.cqv-care li { display: flex; gap: 11px; font-size: 14px; line-height: 1.5; color: var(--ink-soft); }
.cqv-care-n { flex: none; width: 23px; height: 23px; border-radius: 7px; background: var(--green-wash); color: var(--green); font-weight: 700; font-size: 12px; display: grid; place-items: center; }

/* идеально в подарок */
.cqv-whom { display: flex; flex-wrap: wrap; gap: 8px; }
.cqv-whom-chip { font-size: 13px; font-weight: 500; color: var(--ink-soft); background: var(--paper); border: 1px solid var(--line); border-radius: 30px; padding: 6px 13px; }

/* отзывы */
.cqv-rev-head { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; margin-bottom: 18px; }
.cqv-rev-score { display: flex; align-items: center; gap: 12px; }
.cqv-rev-big { font-size: 40px; font-weight: 600; line-height: 1; }
.cqv-rev-bars { flex: 1; min-width: 170px; display: flex; flex-direction: column; gap: 4px; }
.cqv-rev-bar { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-faint); }
.cqv-rev-track { flex: 1; height: 6px; border-radius: 4px; background: var(--line); overflow: hidden; }
.cqv-rev-fill { display: block; height: 100%; background: var(--clay); border-radius: 4px; }
.cqv-rev-pct { font-variant-numeric: tabular-nums; min-width: 30px; text-align: right; }
.cqv-reviews { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.cqv-review { border: 1px solid var(--line); border-radius: 13px; padding: 15px; background: var(--card); }
.cqv-review-h { display: flex; align-items: center; gap: 9px; margin-bottom: 9px; }
.cqv-review-av { width: 34px; height: 34px; border-radius: 50%; background: var(--green-wash); color: var(--green); font-weight: 700; display: grid; place-items: center; font-size: 14px; flex: none; }
.cqv-review-meta { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.cqv-review-n { font-weight: 600; font-size: 13.5px; }
.cqv-review-d { font-size: 12px; color: var(--ink-faint); }
.cqv-review-t { margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--ink-soft); }
.cqv-stars--sm { color: var(--clay); }
.cqv-stars--sm svg { width: 13px; height: 13px; }

/* с этим заказывают */
.cqv-rel { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cqv-rel-card { display: flex; flex-direction: column; text-decoration: none; color: inherit; }
.cqv-rel-media { position: relative; aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden; background: oklch(0.93 0.012 80); margin-bottom: 8px; }
.cqv-rel-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cqv-rel-tag { position: absolute; top: 8px; left: 8px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; padding: 3px 7px; border-radius: 5px; }
.cqv-rel-tag.hit { background: var(--clay); color: #fff; }
.cqv-rel-tag.new { background: var(--green); color: #fff; }
.cqv-rel-tag.sale { background: var(--blush); color: oklch(0.32 0.06 24); }
.cqv-rel-n { font-size: 13px; font-weight: 600; line-height: 1.25; }
.cqv-rel-c { font-size: 11.5px; color: var(--ink-faint); margin-top: 2px; line-height: 1.3; }
.cqv-rel-p { font-size: 13.5px; font-weight: 700; margin-top: 5px; font-variant-numeric: tabular-nums; }
.cqv-rel-o { font-size: 11.5px; color: var(--ink-faint); text-decoration: line-through; margin-left: 6px; font-weight: 400; }

.cqv-full {
  margin-top: 22px; width: 100%;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 46px; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--card);
  font-weight: 600; font-size: 14px; color: var(--ink); text-decoration: none; transition: .14s;
}
.cqv-full svg { width: 16px; height: 16px; color: var(--ink-faint); transition: .14s; }
.cqv-full:hover { border-color: var(--green-soft); color: var(--green); background: var(--green-wash); }
.cqv-full:hover svg { color: var(--green); }

/* ---- sticky bar ---- */
.cqv-bar {
  flex: none; display: flex; align-items: center; gap: 10px;
  padding: 14px 22px;
  background: oklch(1 0 0 / .97); backdrop-filter: blur(8px);
  box-shadow: 0 -8px 20px oklch(0.2 0.02 60 / .1);
}
.cqv-qty { display: flex; align-items: center; flex: none; border: 1px solid var(--line-strong); border-radius: 12px; overflow: hidden; background: var(--card); }
.cqv-qty button { width: 40px; height: 50px; border: none; background: none; font-size: 19px; color: var(--ink-soft); cursor: pointer; }
.cqv-qty button:hover { background: var(--green-wash); color: var(--green); }
.cqv-qn { min-width: 28px; text-align: center; font-weight: 600; font-variant-numeric: tabular-nums; }
.cqv-cta {
  flex: 1; height: 52px; border: none; border-radius: 12px;
  background: var(--green); color: oklch(0.96 0.02 90);
  font-family: inherit; font-weight: 600; font-size: 15px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  text-decoration: none; transition: background .16s, transform .12s; white-space: nowrap;
  box-shadow: 0 4px 14px oklch(0.62 0.15 148 / .25);
}
.cqv-cta:hover { background: oklch(0.55 0.15 148); }
.cqv-cta:active { transform: scale(.985); }
.cqv-cta svg { width: 18px; height: 18px; }
.cqv-cta-p { font-weight: 700; font-variant-numeric: tabular-nums; }
.cqv-cta.is-added { background: var(--green-soft); }
.cqv-cta--ghost {
  flex: none; min-width: 150px; background: var(--card); color: var(--ink);
  border: 1px solid var(--line-strong); box-shadow: none;
}
.cqv-cta--ghost:hover { background: var(--paper); border-color: var(--green-soft); color: var(--green); }

/* ---- мобайл: bottom-sheet ---- */
@media (max-width: 760px) {
  .cqv-overlay { padding: 0; place-items: end stretch; }
  .cqv { max-width: none; max-height: 94vh; border-radius: 22px 22px 0 0; }
  .cqv-top { grid-template-columns: minmax(0, 1fr); }
  .cqv-media, .cqv-info { min-width: 0; }
  .cqv-main { min-height: 0; aspect-ratio: 4 / 3; }
  .cqv-info { padding: 22px 18px; }
  .cqv-sections { padding: 4px 18px 20px; }
  .cqv-specs { grid-template-columns: repeat(2, 1fr); }
  .cqv-reviews { grid-template-columns: 1fr; }
  .cqv-rel { grid-template-columns: repeat(2, 1fr); }
  .cqv-bar { padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); flex-wrap: wrap; }
  .cqv-cta { font-size: 14.5px; }
  .cqv-cta--ghost { flex: 1; min-width: 0; }
}
@media (max-width: 420px) {
  .cqv-addons { grid-template-columns: 1fr; }
  .cqv-bar .cqv-cta--ghost { display: none; }
}

/* ---- transitions ---- */
.cqv-enter-active, .cqv-leave-active { transition: opacity .22s ease; }
.cqv-enter-from, .cqv-leave-to { opacity: 0; }
.cqv-enter-active .cqv, .cqv-leave-active .cqv { transition: transform .26s cubic-bezier(.22, 1, .36, 1), opacity .2s ease; }
.cqv-enter-from .cqv, .cqv-leave-to .cqv { transform: translateY(10px) scale(.98); opacity: 0; }
@media (max-width: 760px) {
  .cqv-enter-from .cqv, .cqv-leave-to .cqv { transform: translateY(100%); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .cqv-enter-active, .cqv-leave-active,
  .cqv-enter-active .cqv, .cqv-leave-active .cqv { transition: opacity .15s ease; }
  .cqv-enter-from .cqv, .cqv-leave-to .cqv { transform: none; opacity: 0; }
}
</style>
