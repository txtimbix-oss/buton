<template>
  <div class="app">
    <div class="wrap">
      <div class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span class="sep">/</span>
        <NuxtLink to="/catalog">Каталог</NuxtLink>
        <span class="sep">/</span>
        <span>Оформление заказа</span>
      </div>
      <div class="co-head"><h1 class="serif">Оформление заказа</h1></div>

      <!-- FREE DELIVERY BAR -->
      <div class="freebar" :class="{ 'is-free': freeDelivery }">
        <span class="fb-ic">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
        </span>
        <span class="fb-t">
          <template v-if="freeDelivery">Доставка <b>бесплатно</b> — заказ от {{ fmt(freeThreshold) }} ₽ 🎉</template>
          <template v-else>До бесплатной доставки осталось <b>{{ fmt(toFree) }} ₽</b></template>
        </span>
      </div>

      <div class="co">
        <!-- MAIN -->
        <div class="co-main">

          <!-- 1. ITEMS -->
          <div class="card">
            <div class="card-h">
              <span class="n">1</span><h3>Ваш заказ</h3>
              <span class="hint">{{ items.length }} {{ plural(items.length, ['товар', 'товара', 'товаров']) }}</span>
            </div>
            <div class="card-b">
              <div v-for="x in items" :key="x.id" class="litem">
                <div class="lm">
                  <img v-if="x.image" :src="x.image" :alt="x.n" class="lm-img" loading="lazy" />
                  <div v-else class="ph" :style="{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${x.m}, oklch(0.9 0.02 80))` }">
                    <span class="lbl">фото</span>
                  </div>
                </div>
                <div class="li">
                  <div class="ln">{{ x.n }}</div>
                  <div class="lc">{{ x.c }}</div>
                  <div v-if="x.addon" class="laddon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11h16v9H4zM2 7h20v4H2zM12 7v13M12 7S10 3 7.5 4 9 7 12 7s2.5-2 4.5-3 1.5 3-.5 3"/></svg>
                    +{{ x.addon }}
                  </div>
                  <div class="lbot">
                    <div class="qty">
                      <button @click="setQty(x.id, -1)">−</button>
                      <span class="qn tnum">{{ x.qty }}</span>
                      <button @click="setQty(x.id, 1)">+</button>
                    </div>
                    <button class="lremove" @click="remove(x.id)">Удалить</button>
                  </div>
                </div>
                <div class="lp">
                  <div class="now tnum">{{ fmt(x.price * x.qty) }} ₽</div>
                  <div v-if="x.old > 0" class="old tnum">{{ fmt(x.old * x.qty) }} ₽</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. DELIVERY METHOD + ZONE -->
          <div class="card">
            <div class="card-h"><span class="n">2</span><h3>Способ получения</h3></div>
            <div class="card-b">
              <div class="methods">
                <div class="method" :class="{ on: method === 'courier' }" @click="method = 'courier'">
                  <div class="mt">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
                    Курьером
                  </div>
                  <div class="md">По Санкт-Петербургу, в выбранный слот</div>
                  <div class="mp">{{ freeDelivery ? `Бесплатно от ${fmt(freeThreshold)} ₽` : `от ${fmt(ZONES[0]?.price || 390)} ₽` }}</div>
                </div>
                <div class="method" :class="{ on: method === 'pickup' }" @click="method = 'pickup'">
                  <div class="mt">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h16l-1 11H5zM4 9l1.5-5h13L20 9M9 13v4M15 13v4"/></svg>
                    Самовывоз
                  </div>
                  <div class="md">Невский пр., 28 · ежедневно 9:00–21:00</div>
                  <div class="mp">Бесплатно</div>
                </div>
              </div>

              <div v-if="method === 'courier'" style="margin-top:18px">
                <ClientOnly>
                  <YandexMapPicker @select="onMapAddress" />
                </ClientOnly>
                <div v-if="zoneObj.n" class="cart-zonetag">Зона: {{ zoneObj.n }} · {{ zoneObj.price }} ₽</div>
                <div class="zones">
                  <button v-for="z in ZONES" :key="z.id" class="zone" :class="{ on: zone === z.id }" @click="zone = z.id">
                    {{ z.n }}<span class="zp tnum">{{ z.price }} ₽</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. RECIPIENT -->
          <div class="card">
            <div class="card-h">
              <span class="n">3</span><h3>Получатель и адрес</h3>
              <span class="hint">получатель может отличаться от вас</span>
            </div>
            <div class="card-b">
              <div class="field">
                <label>Ваш телефон <span class="req">*</span></label>
                <input class="inp" placeholder="+7 (___) ___-__-__" />
              </div>
              <div class="selfrow" :class="{ on: self }" @click="self = !self">
                <span class="cbx">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>
                </span>
                <span class="st">Я сам(а) получу букет — заполнить данными заказчика</span>
              </div>
              <template v-if="!self">
                <div class="frow">
                  <div class="field">
                    <label>Имя получателя <span class="req">*</span></label>
                    <input class="inp" placeholder="Например, Анна" />
                  </div>
                  <div class="field">
                    <label>Телефон получателя <span class="req">*</span></label>
                    <input class="inp" placeholder="+7 (___) ___-__-__" />
                  </div>
                </div>
                <div class="field" style="margin-top:0;margin-bottom:6px">
                  <span style="font-size:12.5px;color:var(--ink-faint)">Курьер позвонит получателю, чтобы согласовать удобное время — сюрприз не раскроем.</span>
                </div>
              </template>
              <div class="field">
                <label>Адрес доставки <span class="req">*</span></label>
                <input class="inp" placeholder="Улица, дом" v-model="address" />
                <div class="suggest">
                  <span class="sg" @click="zone = 'center'">Невский пр., 28</span>
                  <span class="sg" @click="zone = 'vasil'">6-я линия В.О., 12</span>
                  <span class="sg" @click="zone = 'spalny'">пр. Просвещения, 45</span>
                </div>
              </div>
              <div class="frow">
                <div class="field">
                  <label>Квартира / офис</label>
                  <input class="inp" placeholder="—" />
                </div>
                <div class="field">
                  <label>Подъезд / этаж / домофон</label>
                  <input class="inp" placeholder="—" />
                </div>
              </div>
            </div>
          </div>

          <!-- 4. DATE & TIME -->
          <div class="card">
            <div class="card-h"><span class="n">4</span><h3>Дата и время</h3></div>
            <div class="card-b">
              <div class="dates">
                <button v-for="d in dates" :key="d.id" class="date" :class="{ on: date === d.id }" @click="date = d.id">
                  <div class="dw">{{ d.w }}</div>
                  <div class="dd tnum">{{ d.d }}</div>
                </button>
              </div>
              <div class="slots">
                <button
                  v-for="s in SLOTS"
                  :key="s.id"
                  class="slot"
                  :class="{ on: slot === s.id, off: s.off }"
                  :disabled="s.off"
                  @click="!s.off && (slot = s.id)"
                >
                  {{ s.t }}<span v-if="!s.off" class="sf">{{ s.f }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 5. OPTIONS -->
          <div class="card">
            <div class="card-h"><span class="n">5</span><h3>Открытка и пожелания</h3></div>
            <div class="card-b">
              <div class="opt-switch" :class="{ on: giftOn }">
                <div class="sw-txt">
                  <div class="st">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11h16v9H4zM2 7h20v4H2zM12 7v13M12 7S10 3 7.5 4 9 7 12 7s2.5-2 4.5-3 1.5 3-.5 3"/></svg>
                    Открытка с текстом
                  </div>
                  <div class="sd">Напишем от руки и вложим в букет — бесплатно</div>
                  <textarea v-if="giftOn" class="inp" style="margin-top:10px" maxlength="200" placeholder="Текст для открытки…"></textarea>
                </div>
                <div class="toggle" @click="giftOn = !giftOn"></div>
              </div>

              <div class="opt-switch hl" :class="{ on: waPhoto }" @click="waPhoto = !waPhoto">
                <div class="sw-txt">
                  <div class="st">
                    <span class="wa">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>
                    </span>
                    Пришлите фото букета в WhatsApp до доставки
                  </div>
                  <div class="sd">Покажем готовый букет перед отправкой — успеете внести правки</div>
                </div>
                <div class="toggle"></div>
              </div>

              <div class="opt-switch" :class="{ on: anon }" @click="anon = !anon">
                <div class="sw-txt">
                  <div class="st">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9 9 0 0 1 21 12a14 14 0 0 1-2.3 3M6.1 6.2A14 14 0 0 0 3 12a9 9 0 0 0 12 5"/></svg>
                    Анонимная доставка
                  </div>
                  <div class="sd">Получатель не увидит, кто отправитель</div>
                </div>
                <div class="toggle"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY -->
        <aside class="summary">
          <div class="sum-card">
            <h3 class="serif">Итог заказа</h3>
            <div class="promo-row">
              <input class="inp" placeholder="Промокод (SPRING15)" v-model="promo" />
              <button @click="applyPromo">Применить</button>
            </div>
            <div v-if="promoApplied" class="promo-ok">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>
              Промокод SPRING15 · −15% применён
            </div>

            <div class="bonus" :class="{ on: useBonus }" @click="useBonus = !useBonus">
              <span class="cbx">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>
              </span>
              <div>
                <div class="bt">Списать баллы</div>
                <div class="bd">Доступно <b>{{ fmt(bonusAvail) }}</b> · спишем <b>{{ fmt(maxBonus) }}</b> (до 30% заказа)</div>
              </div>
            </div>

            <div class="sum-rows">
              <div class="r">
                <span>Букеты · {{ totalQty }} шт</span>
                <span class="tnum">{{ fmt(subtotal) }} ₽</span>
              </div>
              <div v-if="promoDisc > 0" class="r disc">
                <span>Промокод SPRING15</span>
                <span class="tnum">−{{ fmt(promoDisc) }} ₽</span>
              </div>
              <div v-if="bonusUsed > 0" class="r disc">
                <span>Баллы</span>
                <span class="tnum">−{{ fmt(bonusUsed) }} ₽</span>
              </div>
              <div class="r" :class="{ free: delivery === 0 }">
                <span>Доставка{{ method === 'pickup' ? ' · самовывоз' : ` · ${zoneObj.n}` }}</span>
                <span class="tnum">{{ delivery === 0 ? 'бесплатно' : fmt(delivery) + ' ₽' }}</span>
              </div>
            </div>
            <div class="sum-total">
              <span class="l">К оплате</span>
              <span class="p tnum">{{ fmt(total) }} ₽</span>
            </div>
            <div class="earn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>
              <span>Вернём <b>{{ fmt(earn) }} {{ plural(earn, ['балл', 'балла', 'баллов']) }}</b> после доставки</span>
            </div>
            <NuxtLink class="btn-primary paybtn" to="/orders/track" style="text-decoration:none">Оплатить {{ fmt(total) }} ₽</NuxtLink>
            <div class="pay-note">Нажимая «Оплатить», вы соглашаетесь с офертой и политикой конфиденциальности. Оплата картой, СБП или при получении.</div>
          </div>
        </aside>
      </div>
    </div>

    <!-- MOBILE BAR -->
    <div class="mbar">
      <div class="mp">
        <span class="k">К оплате</span>
        <span class="v serif tnum">{{ fmt(total) }} ₽</span>
      </div>
      <NuxtLink class="btn-primary" to="/orders/track" style="text-decoration:none">Оплатить</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

useSeoMeta({ title: 'Оформление заказа — Бутон' })

const fmt = n => n.toLocaleString('ru-RU')
const plural = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}

/* ---- корзина из реального стора (useCart) ---- */
const cart = useCart()
const BLOOM_COLOR = {
  rose: 'oklch(0.84 0.06 20)', pink: 'oklch(0.84 0.06 20)', red: 'oklch(0.6 0.15 24)',
  white: 'oklch(0.92 0.012 90)', cream: 'oklch(0.9 0.03 80)', peach: 'oklch(0.86 0.07 50)',
  lav: 'oklch(0.78 0.06 320)', lilac: 'oklch(0.78 0.06 320)', blue: 'oklch(0.74 0.06 250)',
  yellow: 'oklch(0.86 0.09 90)', green: 'oklch(0.72 0.08 140)', mix: 'oklch(0.8 0.07 140)',
}
const items = computed(() => cart.items.value.map(l => ({
  id: l.lineId,
  n: l.name,
  c: l.meta || l.sizeLabel || '',
  addon: (l.addons && l.addons.length) ? l.addons.join(', ') : null,
  price: l.price,
  old: 0,
  qty: l.qty,
  image: l.image || '',
  m: BLOOM_COLOR[l.bloom] || 'oklch(0.85 0.06 20)',
})))

/* ---- зоны доставки с бэка (фолбэк — реальные значения) ---- */
const ZONES_FALLBACK = [
  { id: 'center', n: 'Центр', price: 390 },
  { id: 'nord', n: 'Север и Юг', price: 390 },
  { id: 'far', n: 'Отдалённые', price: 490 },
  { id: 'prig', n: 'Пригород', price: 690 },
]
const { data: zonesRaw } = await useFetch('/api/delivery-zones', { default: () => [] })
const ZONES = computed(() => {
  const list = Array.isArray(zonesRaw.value) ? zonesRaw.value.filter(z => z && z.isActive !== false) : []
  if (!list.length) return ZONES_FALLBACK
  return [...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(z => ({ id: z._id, n: z.name, price: z.cost || 0 }))
})

/* слоты доставки с бэка по выбранной дате/зоне (фолбэк — статичные) */
const SLOTS_FALLBACK = [
  { id: 's1', t: '12:00–14:00', off: true },
  { id: 's2', t: '14:00–16:00', off: false, f: 'свободно' },
  { id: 's3', t: '16:00–18:00', off: false, f: 'свободно' },
  { id: 's4', t: '18:00–20:00', off: false, f: 'мало слотов' },
  { id: 's5', t: '20:00–22:00', off: false, f: 'свободно' },
]
const slotsRaw = ref(null)
const SLOTS = computed(() => {
  const list = slotsRaw.value?.slots
  if (!Array.isArray(list) || !list.length) return SLOTS_FALLBACK
  return list.map((s, i) => ({
    id: 's' + (i + 1),
    t: String(s.time || '').replace(/\s+/g, ''),
    off: !!s.full,
    f: s.full ? 'нет мест' : (typeof s.remaining === 'number' && s.remaining <= 2 ? `осталось ${s.remaining}` : 'свободно'),
  }))
})

/* ---- бонусы юзера + порог бесплатной доставки из настроек ---- */
const { user: shopUser } = useShopUser()
const bonusAvail = computed(() => Number(shopUser.value?.bonusBalance) || 0)
const settings = useSettings()
const freeThreshold = computed(() => Number(settings.value?.deliveryFreeThreshold) || 5000)

function dateChips() {
  const wd = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  const out = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    out.push({ id: i, w: i === 0 ? 'сегодня' : i === 1 ? 'завтра' : wd[d.getDay()], d: d.getDate() })
  }
  return out
}

// state
const method = ref('courier')
const zone = ref(null)
const address = ref('')
function onMapAddress (addr) { if (addr) address.value = addr }
const self = ref(false)
const date = ref(0)
const slot = ref('s3')
const giftOn = ref(true)
const anon = ref(false)
const waPhoto = ref(true)
const promo = ref('')
const promoApplied = ref(false)
const useBonus = ref(false)

// дефолтная зона = первая доступная (после загрузки с бэка)
watch(ZONES, (list) => { if (list.length && !list.some(z => z.id === zone.value)) zone.value = list[0].id }, { immediate: true })

// dates — new Date() only on the client
const dates = ref([])
onMounted(() => { dates.value = dateChips() })

/* слоты с бэка: перезапрос при смене даты/зоны (клиент-онли, date обязателен) */
async function loadSlots() {
  if (!import.meta.client) return
  const d = new Date(); d.setDate(d.getDate() + date.value)
  try {
    slotsRaw.value = await $fetch('/api/delivery-slots/availability', {
      query: { date: d.toISOString().slice(0, 10), zoneId: zone.value || undefined },
    })
  } catch { slotsRaw.value = null }
}
onMounted(loadSlots)
watch([date, zone], loadSlots)
// держим выбранный слот валидным (не full)
watch(SLOTS, (list) => {
  const cur = list.find(s => s.id === slot.value)
  if (!cur || cur.off) { const first = list.find(s => !s.off); if (first) slot.value = first.id }
}, { immediate: true })

const setQty = (id, d) => { const l = cart.items.value.find(x => x.lineId === id); if (l) cart.setLineQty(id, l.qty + d) }
const remove = id => cart.removeLine(id)

const subtotal = computed(() => items.value.reduce((a, x) => a + x.price * x.qty, 0))
const totalQty = computed(() => items.value.reduce((a, x) => a + x.qty, 0))
const zoneObj = computed(() => ZONES.value.find(z => z.id === zone.value) || ZONES.value[0] || { n: '', price: 0 })
const slotExtra = computed(() => 0) // наценки за слот в API нет
const baseDelivery = computed(() => method.value === 'pickup' ? 0 : (zoneObj.value.price + slotExtra.value))
const freeDelivery = computed(() => subtotal.value >= freeThreshold.value)
const delivery = computed(() => freeDelivery.value ? 0 : baseDelivery.value)
const promoDisc = computed(() => promoApplied.value ? Math.round(subtotal.value * 0.15) : 0)
const afterPromo = computed(() => subtotal.value - promoDisc.value)
const maxBonus = computed(() => Math.min(bonusAvail.value, Math.round(afterPromo.value * 0.3)))
const bonusUsed = computed(() => useBonus.value ? maxBonus.value : 0)
const total = computed(() => Math.max(0, afterPromo.value - bonusUsed.value + delivery.value))
const earn = computed(() => Math.round(total.value * 0.05))
const toFree = computed(() => Math.max(0, freeThreshold.value - subtotal.value))
const freePct = computed(() => Math.min(100, subtotal.value / freeThreshold.value * 100))

const applyPromo = () => {
  promoApplied.value = promo.value.trim().toUpperCase() === 'SPRING15'
}
</script>

<style scoped>
/* ---- design tokens (from buton.css) ---- */
.app{
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
  --r-sm:10px;
  min-height:100vh;
  color:var(--ink);
  font-family:'Inter',system-ui,sans-serif;
}
.app *{box-sizing:border-box;margin:0;padding:0;}
.app button{font-family:inherit;cursor:pointer;color:inherit;border:none;background:none;}
.app input,.app textarea,.app select{font-family:inherit;font-size:inherit;color:inherit;}
.serif{font-family:'Montserrat',Georgia,serif;}
.tnum{font-variant-numeric:tabular-nums;}

/* ---- page frame ---- */
.wrap{max-width:1320px;margin:0 auto;padding:24px 24px 140px;}
.crumbs{font-size:13px;color:var(--ink-faint);display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.crumbs a{color:var(--ink-faint);text-decoration:none;}
.crumbs a:hover{color:var(--ink);}
.crumbs .sep{opacity:.5;}

/* ---- buttons ---- */
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}

/* ---- media placeholder ---- */
.ph{position:relative;background:
  repeating-linear-gradient(135deg, oklch(0.9 0.014 80) 0 11px, oklch(0.93 0.012 82) 11px 22px);
  display:grid;place-items:center;overflow:hidden;}
.ph .lbl{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11.5px;letter-spacing:.04em;color:oklch(0.5 0.02 70);background:oklch(0.98 0.008 84 / .82);padding:5px 10px;border-radius:6px;border:1px solid var(--line);}

/* ---- checkout head + freebar ---- */
.co-head{margin-bottom:8px;}
.co-head h1{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(30px,3.6vw,44px);letter-spacing:-.015em;}
.freebar{display:flex;align-items:center;gap:12px;background:var(--green-wash);border:1px solid color-mix(in srgb, var(--green) 22%, transparent);border-radius:12px;padding:12px 16px;margin:18px 0 24px;font-size:14px;line-height:1.35;color:var(--ink-soft);}
.freebar .fb-ic{width:32px;height:32px;border-radius:9px;background:var(--card);color:var(--green);display:grid;place-items:center;flex:none;}
.freebar .fb-t{flex:1;}
.freebar .fb-t b{color:var(--green);font-weight:700;white-space:nowrap;}

.co{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,400px);gap:30px;align-items:start;}
@media(max-width:980px){.co{grid-template-columns:1fr;}}
.co-main{display:flex;flex-direction:column;gap:18px;}

.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);}
.card-h{display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid var(--line);}
.card-h .n{width:27px;height:27px;border-radius:8px;background:var(--green);color:#fff;font-size:13px;font-weight:700;display:grid;place-items:center;flex:none;}
.card-h h3{font-size:17px;font-weight:600;letter-spacing:-.01em;}
.card-h .hint{margin-left:auto;font-size:12.5px;color:var(--ink-faint);}
.card-b{padding:20px 22px;}

/* line items */
.litem{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid var(--line);}
.litem:first-child{padding-top:0;}
.litem:last-child{border-bottom:none;padding-bottom:0;}
.litem .lm{width:78px;height:96px;border-radius:10px;flex:none;position:relative;overflow:hidden;border:1px solid var(--line);}
.litem .lm-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
.litem .li{flex:1;min-width:0;}
.litem .li .ln{font-weight:600;font-size:15.5px;}
.litem .li .lc{font-size:12.5px;color:var(--ink-faint);margin:2px 0 4px;}
.litem .li .laddon{font-size:12px;color:var(--green-soft);display:flex;align-items:center;gap:5px;}
.litem .li .lbot{display:flex;align-items:center;gap:12px;margin-top:11px;}
.qty{display:flex;align-items:center;border:1px solid var(--line-strong);border-radius:9px;overflow:hidden;}
.qty button{width:32px;height:32px;display:grid;place-items:center;font-size:17px;color:var(--ink-soft);}
.qty button:hover{background:var(--green-wash);color:var(--green);}
.qty .qn{min-width:30px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums;font-size:14px;}
.litem .lremove{font-size:13px;color:var(--ink-faint);}
.litem .lremove:hover{color:var(--clay);}
.litem .lp{text-align:right;flex:none;}
.litem .lp .now{font-weight:700;font-size:16px;font-variant-numeric:tabular-nums;}
.litem .lp .old{font-size:12.5px;color:var(--ink-faint);text-decoration:line-through;}

/* method cards */
.methods{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.methods{grid-template-columns:1fr;}}
.method{border:1px solid var(--line-strong);border-radius:12px;padding:16px;cursor:pointer;transition:.15s;position:relative;}
.method:hover{border-color:var(--green-soft);}
.method.on{border-color:var(--green);background:var(--green-wash);box-shadow:inset 0 0 0 1px var(--green);}
.method .mt{font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px;}
.method .md{font-size:12.5px;color:var(--ink-faint);margin:5px 0 8px;}
.method .mp{font-weight:600;font-size:14px;color:var(--green);}

/* forms */
.field{margin-bottom:14px;}
.field:last-child{margin-bottom:0;}
.field label{display:block;font-size:13px;font-weight:500;color:var(--ink-soft);margin-bottom:6px;}
.field label .req{color:var(--clay);}
.inp{width:100%;height:46px;border:1px solid var(--line-strong);border-radius:10px;padding:0 13px;font-size:14.5px;background:var(--card);transition:.14s;}
.inp:focus{outline:none;border-color:var(--green-soft);box-shadow:0 0 0 3px var(--green-wash);}
textarea.inp{height:auto;min-height:74px;padding:11px 13px;resize:vertical;line-height:1.45;}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.frow{grid-template-columns:1fr;}}
.suggest{margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;}
.suggest .sg{font-size:12.5px;color:var(--green);background:var(--green-wash);border-radius:20px;padding:5px 11px;cursor:pointer;}
.suggest .sg:hover{background:oklch(0.89 0.03 150);}

/* recipient toggle */
.selfrow{display:flex;align-items:center;gap:11px;padding:13px 15px;border:1px solid var(--line);border-radius:11px;background:var(--paper);cursor:pointer;margin-bottom:16px;}
.selfrow .cbx{width:22px;height:22px;border-radius:6px;border:1.5px solid var(--line-strong);display:grid;place-items:center;color:transparent;flex:none;transition:.14s;}
.selfrow.on .cbx{background:var(--green);border-color:var(--green);color:#fff;}
.selfrow .st{font-size:14px;font-weight:500;}

/* zone tag + zones */
.cart-zonetag{display:inline-block;margin:12px 0 4px;background:var(--green-wash);border:1px solid var(--green-soft);border-radius:9px;padding:7px 12px;font-size:12.5px;font-weight:600;color:var(--green);}
.zones{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}
.zone{padding:9px 13px;border-radius:30px;border:1px solid var(--line-strong);background:var(--card);font-size:13px;font-weight:500;cursor:pointer;transition:.14s;display:flex;align-items:center;gap:8px;}
.zone:hover{border-color:var(--green-soft);}
.zone.on{border-color:var(--green);background:var(--green-wash);color:var(--green);font-weight:600;}
.zone .zp{font-size:12px;color:var(--ink-faint);}
.zone.on .zp{color:var(--green-soft);}

/* date / slots */
.dates{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.date{min-width:62px;padding:9px 6px;border-radius:11px;border:1px solid var(--line-strong);background:var(--card);cursor:pointer;text-align:center;transition:.14s;}
.date:hover{border-color:var(--green-soft);}
.date.on{border-color:var(--green);background:var(--green);color:#fff;}
.date .dw{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;opacity:.7;}
.date .dd{font-weight:700;font-size:17px;margin-top:2px;}
.date.on .dw{opacity:.85;}
.slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:9px;}
.slot{padding:11px;border-radius:10px;border:1px solid var(--line-strong);background:var(--card);font-size:13.5px;font-weight:600;cursor:pointer;text-align:center;transition:.14s;}
.slot:hover{border-color:var(--green-soft);}
.slot.on{border-color:var(--green);background:var(--green-wash);color:var(--green);}
.slot.off{opacity:.4;cursor:not-allowed;text-decoration:line-through;}
.slot .sf{display:block;font-size:11px;font-weight:500;color:var(--green-soft);margin-top:2px;}

/* option switches */
.opt-switch{display:flex;align-items:flex-start;gap:13px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;cursor:pointer;}
.opt-switch + .opt-switch{margin-top:10px;}
.opt-switch.hl{border-color:var(--green-soft);background:oklch(0.97 0.014 140);}
.opt-switch .sw-txt{flex:1;}
.opt-switch .sw-txt .st{font-weight:600;font-size:14.5px;display:flex;align-items:center;gap:8px;}
.opt-switch .sw-txt .sd{font-size:12.5px;color:var(--ink-faint);margin-top:3px;}
.toggle{width:44px;height:26px;border-radius:30px;background:var(--line-strong);position:relative;flex:none;transition:.18s;margin-top:2px;}
.toggle::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.18s;box-shadow:0 1px 3px oklch(0 0 0 / .2);}
.opt-switch.on .toggle{background:var(--green);}
.opt-switch.on .toggle::after{transform:translateX(18px);}
.wa{color:#25D366;display:inline-flex;}

/* summary */
.summary{position:sticky;top:84px;}
.sum-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:22px;}
.sum-card h3{font-family:'Montserrat',serif;font-size:22px;font-weight:600;margin-bottom:16px;}
.promo-row{display:flex;gap:8px;margin-bottom:14px;}
.promo-row .inp{flex:1;height:44px;}
.promo-row button{height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line-strong);font-weight:600;font-size:13.5px;background:var(--paper);}
.promo-row button:hover{background:var(--paper-2);}
.promo-ok{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--green);background:var(--green-wash);border-radius:9px;padding:9px 12px;margin-bottom:14px;}
.bonus{display:flex;align-items:flex-start;gap:11px;border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-bottom:16px;cursor:pointer;}
.bonus.on{border-color:var(--clay);background:var(--clay-wash);}
.bonus .cbx{width:22px;height:22px;border-radius:6px;border:1.5px solid var(--line-strong);display:grid;place-items:center;color:transparent;flex:none;}
.bonus.on .cbx{background:var(--clay);border-color:var(--clay);color:#fff;}
.bonus .bt{font-size:13.5px;font-weight:600;}
.bonus .bd{font-size:12px;color:var(--ink-faint);margin-top:2px;}
.bonus .bd b{color:var(--clay);}
.sum-rows{border-top:1px solid var(--line);padding-top:14px;}
.sum-rows .r{display:flex;justify-content:space-between;font-size:14px;color:var(--ink-soft);padding:5px 0;}
.sum-rows .r span:last-child{font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums;}
.sum-rows .r.disc span:last-child{color:var(--clay);}
.sum-rows .r.free span:last-child{color:var(--green);}
.sum-total{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:14px;border-top:1px solid var(--line);}
.sum-total .l{font-size:15px;font-weight:600;}
.sum-total .p{font-family:'Montserrat',serif;font-size:30px;font-weight:600;font-variant-numeric:tabular-nums;}
.earn{display:flex;align-items:center;gap:8px;background:var(--clay-wash);border-radius:10px;padding:10px 13px;margin-top:14px;font-size:13px;color:oklch(0.45 0.08 47);}
.earn b{color:var(--clay);}
.paybtn{width:100%;height:54px;margin-top:14px;font-size:16px;}
.pay-note{font-size:12px;color:var(--ink-faint);text-align:center;margin-top:11px;line-height:1.45;}

/* mobile bar */
.mbar{display:none;}
@media(max-width:980px){
  .summary{position:static;}
  .mbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;background:oklch(0.992 0.006 84 / .94);backdrop-filter:blur(12px);border-top:1px solid var(--line);padding:12px 18px;align-items:center;gap:14px;box-shadow:0 -8px 30px oklch(0.4 0.03 70 / .1);}
  .mbar .mp{display:flex;flex-direction:column;}
  .mbar .mp .k{font-size:11px;color:var(--ink-faint);}
  .mbar .mp .v{font-family:'Montserrat',serif;font-size:23px;font-weight:600;line-height:1;}
  .mbar .btn-primary{height:48px;flex:1;}
}
</style>
