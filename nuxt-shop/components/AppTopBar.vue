<template>
  <!-- Большой баннер-картинка из админки (на всех страницах) -->
  <NuxtLink v-if="bnr" :to="bnrLink" class="topbanner" aria-label="Баннер «Бутон»">
    <img :src="bnr.imageUrl" :alt="bnr.title || 'Бутон'" class="topbanner__img" />
    <div v-if="bnr.title || bnr.subtitle" class="topbanner__cap">
      <div class="bwide topbanner__capw">
        <div v-if="bnr.title" class="topbanner__title">{{ bnr.title }}</div>
        <div v-if="bnr.subtitle" class="topbanner__sub">{{ bnr.subtitle }}</div>
        <div class="topbanner__actions">
          <span class="topbanner__cta">
            {{ bnrCta }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
          <button
            v-if="promo"
            type="button"
            class="topbanner__promo"
            :class="{ copied: promoCopied }"
            :title="promoCopied ? 'Скопировано' : 'Скопировать промокод'"
            @click.prevent.stop="copyPromo"
          >
            <span class="topbanner__promo-lbl">Промокод</span>
            <b>{{ promo }}</b>
            <span class="ic-copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span>
            <span class="ic-done"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg></span>
          </button>
        </div>
      </div>
    </div>
  </NuxtLink>

  <!-- Фолбэк: промо-плашка, если баннер из API недоступен -->
  <div v-else class="announce" aria-label="Объявление магазина">
    <div class="ann-left">
      <span class="ann-deco">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg>
      </span>
      <span class="ann-promo"><b>−10%</b> на первый букет</span>
      <span class="ann-badge">новым клиентам</span>
      <button class="ann-code" @click="copyCode">БУТОН10<span class="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span class="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button>
    </div>
    <div class="ann-trust">
      <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span>
      <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span>
      <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span>
    </div>
  </div>
</template>

<script setup>
const { data: bannersRaw } = await useFetch('/api/banners/active', { default: () => [] })
const banners = computed(() => (Array.isArray(bannersRaw.value) ? bannersRaw.value : []))
// берём баннер позиции hero, иначе — первый с картинкой
const bnr = computed(() => {
  const list = banners.value.filter(b => b && b.imageUrl)
  return list.find(b => b.position === 'hero') || list[0] || null
})
const bnrLink = computed(() => bnr.value?.buttonLink || bnr.value?.link || '/catalog')
const bnrCta = computed(() => bnr.value?.buttonText || bnr.value?.ctaText || 'Смотреть каталог')
const promo = computed(() => bnr.value?.promoCode || '')
const promoCopied = ref(false)
function copyPromo() {
  try { if (navigator.clipboard && promo.value) navigator.clipboard.writeText(promo.value) } catch (_) {}
  promoCopied.value = true
  setTimeout(() => { promoCopied.value = false }, 1600)
}

function copyCode(e) {
  try { if (navigator.clipboard) navigator.clipboard.writeText('БУТОН10') } catch (_) {}
  const el = e.currentTarget
  el.classList.add('copied')
  setTimeout(() => el.classList.remove('copied'), 1400)
}
</script>

<style scoped>
/* ===== большой баннер-картинка ===== */
.topbanner {
  display: block; position: relative; width: 100%;
  height: clamp(150px, 15vw, 210px);
  overflow: hidden; text-decoration: none;
  background: var(--paper-2);
}
.topbanner__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.topbanner__cap {
  position: absolute; inset: auto 0 0 0;
  padding: clamp(16px, 2.6vw, 30px) 0;
  color: #fff;
  background: linear-gradient(to top, rgba(20,28,22,.62), rgba(20,28,22,.14) 55%, transparent);
}
.topbanner__capw { display: flex; flex-direction: column; gap: 5px; }
.topbanner__title {
  font-family: 'Montserrat', Georgia, serif; font-weight: 600;
  font-size: clamp(22px, 2.6vw, 34px); line-height: 1.05; letter-spacing: -.01em;
  text-shadow: 0 1px 14px rgba(0,0,0,.28);
}
.topbanner__sub { font-size: clamp(13px, 1.3vw, 15px); opacity: .92; max-width: 48ch; }
.topbanner__actions {
  display: flex; align-items: center; gap: 12px;
  margin-top: 13px; flex-wrap: wrap;
}
.topbanner__cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: 11px;
  background: #fff; color: var(--green, #369E4E);
  font-weight: 600; font-size: 14px; line-height: 1;
  box-shadow: 0 4px 14px rgba(0,0,0,.16);
  transition: transform .16s, box-shadow .16s;
}
.topbanner:hover .topbanner__cta { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(0,0,0,.22); }
.topbanner__cta svg { transition: transform .16s; }
.topbanner:hover .topbanner__cta svg { transform: translateX(4px); }

/* промокод из баннера — клик копирует */
.topbanner__promo {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 11px;
  background: rgba(255,255,255,.14); border: 1px dashed rgba(255,255,255,.5);
  color: #fff; font-weight: 700; font-size: 13.5px; letter-spacing: .04em;
  cursor: pointer; font-family: inherit; line-height: 1;
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
  transition: background .15s, transform .12s, border-color .15s;
}
.topbanner__promo:hover { background: rgba(255,255,255,.24); }
.topbanner__promo:active { transform: scale(.97); }
.topbanner__promo-lbl { font-weight: 500; font-size: 12px; letter-spacing: .02em; opacity: .85; }
.topbanner__promo .ic-copy, .topbanner__promo .ic-done { display: inline-flex; }
.topbanner__promo .ic-done { display: none; color: #b6f0c4; }
.topbanner__promo.copied .ic-copy { display: none; }
.topbanner__promo.copied .ic-done { display: inline-flex; }
.topbanner__promo.copied { border-color: rgba(182,240,196,.8); }

/* ===== фолбэк-плашка (как было) ===== */
.announce{background:linear-gradient(100deg, oklch(0.62 0.15 148), oklch(0.55 0.15 148));color:oklch(0.9 0.02 90);min-height:56px;display:flex;align-items:center;justify-content:space-between;gap:14px 28px;flex-wrap:wrap;padding:12px 22px;}
.ann-left{display:flex;align-items:center;gap:13px;flex-wrap:wrap;}
.ann-deco{color:oklch(0.82 0.08 30);display:inline-flex;}
.ann-promo{font-size:13.5px;color:oklch(0.92 0.02 90);}
.ann-promo b{color:#fff;font-weight:700;font-size:15px;}
.ann-badge{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:oklch(1 0 0 / .14);padding:4px 9px;border-radius:20px;color:oklch(0.96 0.02 90);}
.ann-code{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:13px;letter-spacing:.05em;background:oklch(1 0 0 / .12);border:1px dashed oklch(1 0 0 / .42);border-radius:8px;padding:5px 12px;color:#fff;transition:.15s;cursor:pointer;font-family:inherit;}
.ann-code:hover{background:oklch(1 0 0 / .2);}
.ann-code:active{transform:scale(.97);}
.ann-code .ic-copy,.ann-code .ic-done{display:inline-flex;}
.ann-code .ic-done{display:none;color:oklch(0.86 0.12 150);}
.ann-code.copied .ic-copy{display:none;}
.ann-code.copied .ic-done{display:inline-flex;}
.ann-trust{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
.ann-trust span{display:inline-flex;align-items:center;gap:7px;color:oklch(0.84 0.02 90);font-size:12.5px;font-weight:500;}
.ann-trust svg{opacity:.85;flex:none;}
@media(max-width:880px){.announce{justify-content:center;}.ann-trust{display:none;}}
</style>
