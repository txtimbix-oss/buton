<template>
  <NuxtLink class="pcard" :to="p.slug ? `/product/${p.slug}` : '/product/test'">
    <div class="pm">
      <BloomImg :kind="p.bloom" />
      <ShopImg
        v-if="p.images?.[0] && !imgError"
        :src="p.images[0]"
        :alt="p.name"
        class="pcard-img"
        sizes="(max-width: 768px) 47vw, (max-width: 1100px) 30vw, 260px"
        @error="imgError = true"
      />
      <span v-if="p.tag" class="tag" :class="tagCls">{{ p.tag }}</span>
      <button
        class="like" :class="{ on: isFaved }"
        :aria-label="isFaved ? 'Убрать из избранного' : 'В избранное'"
        @click.prevent="p.slug && wishlist.toggle(p.slug)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
      </button>
    </div>
    <div class="pb">
      <div class="pn">{{ p.name }}</div>
      <div v-if="p.meta" class="pc">{{ p.meta }}</div>
      <div class="pp">
        <span v-if="ratingValue > 0" class="prate">
          <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>
          <b>{{ ratingValue.toFixed(1) }}</b>
        </span>
        <span class="pprice">
          <span class="n">{{ formatRub(price) }}</span>
          <span v-if="p.oldPrice" class="o">{{ formatRub(p.oldPrice) }}</span>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { buildProductPresentation } from '~/lib/product/presentation'
import type { Product } from '~/composables/useShop'

const props = defineProps<{ p: Product }>()

const wishlist = useWishlist()
const imgError = ref(false)

const isFaved   = computed(() => !!props.p.slug && wishlist.slugs.value.includes(props.p.slug))
const price     = computed(() => buildProductPresentation(props.p).primarySizePrice || props.p.price || 0)
const ratingValue = computed(() => Number(props.p.rating || 0))
const tagCls = computed(() => {
  const t = String(props.p.tag || '')
  if (/нов|new/i.test(t)) return 'new'
  if (/скид|sale|%|−|–|-\s?\d/i.test(t)) return 'sale'
  return 'hit'
})

function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value || 0)) + ' ₽'
}
</script>

<style scoped>
/* Дефолтная карточка каталога (.pcard) — единый вид на всех страницах.
   Токены — только глобальные (tokens.css): --muted вместо --ink-faint,
   --ink-2 вместо --ink-soft, --sand вместо --line-strong, --sh-sm/--sh-md вместо --shadow. */
.pcard {
  position: relative; display: flex; flex-direction: column;
  background: var(--card); border: 1px solid var(--line); border-radius: 18px;
  overflow: hidden; box-shadow: var(--sh-sm); transition: transform .16s var(--ease), box-shadow .16s, border-color .16s;
  cursor: pointer; text-decoration: none; color: inherit;
}
.pcard:hover { transform: translateY(-3px); box-shadow: var(--sh-md); border-color: var(--sand); }

.pcard .pm { position: relative; aspect-ratio: 4/5; overflow: hidden; }
:deep(.pcard-img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }

.pcard .tag {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase;
  padding: 4px 9px; border-radius: 6px;
}
.pcard .tag.hit  { background: var(--clay);  color: #fff; }
.pcard .tag.new  { background: var(--green); color: #fff; }
.pcard .tag.sale { background: var(--blush); color: #6b2f18; }

.pcard .like {
  position: absolute; top: 10px; right: 10px; z-index: 3;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.85); backdrop-filter: blur(5px);
  display: grid; place-items: center; color: var(--muted);
  border: 1px solid rgba(255,255,255,.4); cursor: pointer;
  transition: transform .14s var(--ease), color .14s;
}
.pcard .like svg { width: 19px; height: 19px; }
.pcard .like:hover { color: var(--clay); transform: scale(1.08); }
.pcard .like:active { transform: scale(.86); }
.pcard .like.on { color: var(--clay); }
.pcard .like.on svg { fill: var(--clay); stroke: var(--clay); animation: likepop .32s ease; }
@keyframes likepop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }

.pcard .pb {
  position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 2;
  display: flex; flex-direction: column;
  padding: 13px 14px; background: var(--card); border-radius: 16px;
  box-shadow: 0 10px 26px rgba(20,28,22,.18);
}
.pcard .pn { font-weight: 600; font-size: 15.5px; letter-spacing: -.01em; line-height: 1.25; }
.pcard .pc { font-size: 12.5px; color: var(--muted); margin: 3px 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pcard .pp { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; }
.pcard .prate { flex: none; display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--muted); }
.pcard .prate svg { color: var(--clay); }
.pcard .prate b { color: var(--ink-2); font-weight: 600; }
.pcard .pprice { display: inline-flex; align-items: baseline; gap: 7px; }
.pcard .pprice .n { font-weight: 700; font-size: 17px; font-variant-numeric: tabular-nums; }
.pcard .pprice .o { font-size: 13px; color: var(--muted); text-decoration: line-through; font-variant-numeric: tabular-nums; }
</style>
