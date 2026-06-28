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
                  <span v-if="reviewCount" class="cqv-revs">· {{ reviewCount }} {{ plural(reviewCount, ['отзыв', 'отзыва', 'отзывов']) }}</span>
                </div>

                <p v-if="subtitle" class="cqv-desc">{{ subtitle }}</p>

                <div class="cqv-price">
                  <span class="cqv-now serif">{{ fmt(price) }} ₽</span>
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

                <div class="cqv-perks">
                  <span class="cqv-perk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span>
                  <span class="cqv-perk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg> Свежесть 7 дней</span>
                  <span class="cqv-perk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg> Замена при браке</span>
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
              В корзину<span class="cqv-cta-p">{{ fmt(price * qty) }} ₽</span>
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

const props = defineProps({
  card: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const open = computed(() => !!props.card)

/* ---- state ---- */
const detail = ref(null)
const loading = ref(false)
const thumb = ref(0)
const sizeLabel = ref(null)
const qty = ref(1)
const added = ref(false)
const imgError = ref(false)
const panel = ref(null)
const closeBtn = ref(null)

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
const close = () => emit('close')

const TAG_MAP = { hit: ['hit', 'Хит'], new: ['new', 'Новинка'], sale: ['sale', 'Скидка'] }
const tagArr = computed(() => {
  const t = props.card?.tag
  if (!t) return null
  if (Array.isArray(t)) return t
  return TAG_MAP[t] || ['hit', t]
})

/* ---- derived ---- */
const title = computed(() => detail.value?.name || props.card?.n || 'Букет')
const subtitle = computed(() => detail.value?.description || detail.value?.meta || props.card?.c || '')
const rating = computed(() => Number(detail.value?.rating ?? props.card?.r ?? 4.9).toFixed(1))
const filled = computed(() => Math.round(Number(rating.value)))
const reviewCount = computed(() => Number(detail.value?.reviewCount || 0))
const images = computed(() => {
  const d = detail.value?.images
  if (Array.isArray(d) && d.filter(Boolean).length) return d.filter(Boolean)
  return props.card?.img ? [props.card.img] : []
})
const mainImg = computed(() => images.value[thumb.value] || images.value[0] || null)
const sizes = computed(() => Array.isArray(detail.value?.sizes) ? detail.value.sizes : [])
const activeSize = computed(() => sizes.value.find(s => s.label === sizeLabel.value) || null)
const price = computed(() => activeSize.value?.price || detail.value?.price || props.card?.p || 0)
const oldPrice = computed(() => {
  const o = Number(props.card?.o || 0)
  return o > price.value ? o : 0
})
const discount = computed(() => oldPrice.value ? Math.round((1 - price.value / oldPrice.value) * 100) : 0)
const fullLink = computed(() => props.card?.slug ? `/product/${props.card.slug}` : '/product/test')

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
  return out
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
  // на тач-устройствах — нативный шэр (WhatsApp/Telegram), на десктопе — копируем ссылку
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
function addToCart() {
  // Оптимистично, как на полной странице товара. Реальная корзина (useCart)
  // на переписанных страницах пока не подключена — это отдельная задача.
  added.value = true
}

/* ---- lifecycle: fetch detail, lock scroll, esc, focus ---- */
function onKey(e) { if (e.key === 'Escape') close() }

watch(() => props.card, async (c) => {
  detail.value = null
  thumb.value = 0
  qty.value = 1
  added.value = false
  imgError.value = false
  sizeLabel.value = null
  if (!c || !c.slug) return

  loading.value = true
  try {
    detail.value = await $fetch(`/api/products/${c.slug}`)
  } catch {
    detail.value = null
  }
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

.cqv-perks { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.cqv-perk {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500; color: var(--ink-soft);
  background: var(--paper); border: 1px solid var(--line); border-radius: 30px; padding: 5px 11px;
}
.cqv-perk svg { width: 14px; height: 14px; color: var(--green-soft); flex: none; }

/* ---- секции ---- */
.cqv-sections { padding: 6px 30px 26px; }
.cqv-sec { padding: 20px 0; }
.cqv-sec-t { font-family: 'Montserrat', system-ui, sans-serif; font-weight: 600; font-size: 17px; margin: 0 0 14px; }
.cqv-comp { display: flex; flex-direction: column; }
.cqv-comp-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 0; }
.cqv-comp-n { font-weight: 500; font-size: 14px; }
.cqv-comp-q { color: var(--ink-faint); font-size: 13px; font-variant-numeric: tabular-nums; }
.cqv-specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.cqv-spec { background: var(--card); padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.cqv-spec-k { font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-faint); }
.cqv-spec-v { font-size: 14px; font-weight: 600; }
.cqv-care { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.cqv-care li { display: flex; gap: 11px; font-size: 14px; line-height: 1.5; color: var(--ink-soft); }
.cqv-care-n { flex: none; width: 23px; height: 23px; border-radius: 7px; background: var(--green-wash); color: var(--green); font-weight: 700; font-size: 12px; display: grid; place-items: center; }

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
  .cqv-bar { padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); flex-wrap: wrap; }
  .cqv-cta { font-size: 14.5px; }
  .cqv-cta--ghost { flex: 1; min-width: 0; }
}
@media (max-width: 420px) {
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
