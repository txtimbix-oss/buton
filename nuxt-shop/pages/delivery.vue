<template>
  <div class="wrap" style="padding-top:34px;">
    <div class="crumbs">
      <NuxtLink to="/">Главная</NuxtLink>
      <span class="sep">/</span>
      <span>{{ s.deliveryPageTitle || 'Доставка и оплата' }}</span>
    </div>

    <div class="d-hero">
      <div class="eyebrow">{{ s.storeCity || 'Санкт-Петербург' }} · {{ s.contactHours }}</div>
      <h1 class="serif">{{ s.deliveryPageTitle || 'Доставка и оплата' }}</h1>
      <p>{{ s.deliveryPageSubtitle }}</p>
    </div>

    <div v-if="methods.length" class="d-sec">
      <h2 class="serif">Способы получения</h2>
      <div class="methods">
        <div v-for="(m, i) in methods" :key="i" class="mcard">
          <div class="ic" v-html="ICON[m.icon] || ICON.truck" />
          <h3>{{ m.title }}</h3>
          <p>{{ m.desc }}</p>
          <div class="price">{{ m.price }}</div>
        </div>
      </div>
      <div v-if="freeThreshold" class="free-note">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 12 5 5 9-10"/></svg>
        <span><b>Бесплатная доставка</b> при заказе от {{ fmt(freeThreshold) }} ₽ по Санкт-Петербургу.</span>
      </div>
    </div>

    <div v-if="zones.length" class="d-sec">
      <h2 class="serif">Зоны и стоимость</h2>
      <div class="zones">
        <div v-for="(z, i) in zones" :key="i" class="zone">
          <div class="zn">{{ z.name }}</div>
          <div class="zc">{{ z.areas }}</div>
          <div class="zp tnum">{{ z.price }}</div>
        </div>
      </div>
    </div>

    <div v-if="slots.length" class="d-sec">
      <h2 class="serif">Временные слоты</h2>
      <div class="slots">
        <div v-for="(t, i) in slots" :key="i" class="slot"><div class="st">{{ t }}</div></div>
      </div>
    </div>

    <div v-if="payments.length" class="d-sec">
      <h2 class="serif">Оплата</h2>
      <div class="pays">
        <div v-for="(p, i) in payments" :key="i" class="pay">
          <span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg></span>
          <span class="pay-t"><b>{{ p.title }}</b><span v-if="p.desc" class="pd">{{ p.desc }}</span></span>
        </div>
      </div>
    </div>

    <div v-if="faq.length" class="d-sec">
      <h2 class="serif">Частые вопросы</h2>
      <div class="faq">
        <details v-for="(f, i) in faq" :key="i" :open="i === 0">
          <summary>{{ f.q }}</summary>
          <div class="fa-body">{{ f.a }}</div>
        </details>
      </div>
    </div>

    <div class="d-cta">
      <h2 class="serif">Готовы порадовать близких?</h2>
      <p>Соберём и доставим свежий букет уже сегодня.</p>
      <NuxtLink class="btn-primary" to="/catalog" style="text-decoration:none">Перейти в каталог <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></NuxtLink>
    </div>
  </div>
</template>

<script setup>
const settings = useSettings()
const s = computed(() => settings.value || {})
useSeoMeta({ title: computed(() => (s.value.deliveryPageTitle || 'Доставка и оплата') + ' — Бутон') })

const fmt = n => Number(n || 0).toLocaleString('ru-RU')
const asArr = v => {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim().startsWith('[')) { try { return JSON.parse(v) } catch { return [] } }
  return []
}
const methods = computed(() => asArr(s.value.deliveryOptions))
const zones = computed(() => asArr(s.value.deliveryZones))
const payments = computed(() => asArr(s.value.paymentMethods))
const faq = computed(() => asArr(s.value.faqItems))
const slots = computed(() => String(s.value.deliveryTimeSlots || '').split('\n').map(x => x.trim()).filter(Boolean))
const freeThreshold = computed(() => Number(s.value.deliveryFreeThreshold) || 0)

const ICON = {
  truck: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>',
  clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  leaf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>',
  box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h16v12H4zM4 8l2-4h12l2 4M12 4v16"/></svg>',
}
</script>

<style scoped>
/* ---- дизайн-токены из buton.css (:root) ---- */
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
  --r-sm:10px;
}

/* ---- page frame из buton.css ---- */
.wrap{max-width:1320px;margin:0 auto;padding:24px 24px 140px;color:var(--ink);font-family:'Inter',system-ui,sans-serif;line-height:1.5;}
.serif{font-family:'Montserrat',Georgia,serif;}
.tnum{font-variant-numeric:tabular-nums;}

.crumbs{font-size:13px;color:var(--ink-faint);display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.crumbs a{color:var(--ink-faint);text-decoration:none;}
.crumbs a:hover{color:var(--ink);}
.crumbs .sep{opacity:.5;}

/* ---- buttons из buton.css ---- */
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}

/* ============ стили из Доставка.html ============ */
.d-hero{text-align:center;max-width:680px;margin:14px auto 0;}
.d-hero .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:12px;}
.d-hero h1{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(32px,4.4vw,50px);letter-spacing:-.02em;line-height:1.04;}
.d-hero h1 em{font-style:italic;color:var(--clay);}
.d-hero p{color:var(--ink-soft);font-size:16.5px;margin-top:14px;line-height:1.5;}
.d-sec{margin-top:60px;}
.d-sec h2{font-family:'Montserrat',serif;font-weight:500;font-size:28px;letter-spacing:-.01em;margin-bottom:20px;}
.methods{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
@media(max-width:680px){.methods{grid-template-columns:1fr;}}
.mcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:26px;}
.mcard .ic{width:48px;height:48px;border-radius:12px;background:var(--green-wash);color:var(--green);display:grid;place-items:center;margin-bottom:16px;}
.mcard h3{font-size:19px;font-weight:600;margin-bottom:6px;}
.mcard p{color:var(--ink-soft);font-size:14.5px;line-height:1.5;margin-bottom:14px;}
.mcard .price{font-family:'Montserrat',serif;font-size:22px;font-weight:600;color:var(--green);}
.mcard .sub{font-size:12.5px;color:var(--ink-faint);}
.free-note{display:flex;gap:12px;align-items:center;background:var(--green-wash);border-radius:12px;padding:16px 20px;margin-top:18px;color:var(--green);font-size:15px;}
.free-note b{font-weight:700;}
.zones{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:760px){.zones{grid-template-columns:repeat(2,1fr);}}
.zone{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;box-shadow:var(--shadow);}
.zone .zn{font-weight:600;font-size:16px;}
.zone .zc{font-size:12.5px;color:var(--ink-faint);margin:3px 0 12px;}
.zone .zp{font-family:'Montserrat',serif;font-size:24px;font-weight:600;}
.slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;}
.slot{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;text-align:center;box-shadow:var(--shadow);}
.slot .st{font-weight:700;font-size:16px;}
.slot .ss{font-size:12px;color:var(--ink-faint);margin-top:3px;}
.pays{display:flex;gap:12px;flex-wrap:wrap;}
.pay{display:flex;align-items:flex-start;gap:11px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px;font-size:14.5px;box-shadow:var(--shadow);max-width:340px;}
.pay .ic{color:var(--green-soft);flex:none;margin-top:1px;}
.pay-t{display:flex;flex-direction:column;gap:2px;}
.pay-t b{font-weight:600;}
.pay .pd{font-size:12.5px;color:var(--ink-faint);line-height:1.4;}
.faq{max-width:780px;}
.faq details{background:var(--card);border:1px solid var(--line);border-radius:12px;margin-bottom:10px;box-shadow:var(--shadow);overflow:hidden;}
.faq summary{padding:18px 20px;font-weight:600;font-size:16px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:14px;}
.faq summary::-webkit-details-marker{display:none;}
.faq summary::after{content:"+";font-size:22px;color:var(--green-soft);font-weight:400;transition:.2s;flex:none;}
.faq details[open] summary::after{transform:rotate(45deg);}
.faq .fa-body{padding:0 20px 18px;color:var(--ink-soft);font-size:14.5px;line-height:1.55;}
.d-cta{text-align:center;margin-top:60px;background:oklch(0.31 0.025 150);border-radius:var(--r);padding:44px;}
.d-cta h2{font-family:'Montserrat',serif;font-weight:500;font-size:30px;color:#fff;margin-bottom:10px;}
.d-cta p{color:oklch(0.78 0.015 90);margin-bottom:22px;}
</style>
