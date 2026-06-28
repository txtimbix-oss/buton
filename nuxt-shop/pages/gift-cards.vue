<template>
  <div class="wrap" style="padding-top:34px;">
    <div class="crumbs">
      <a href="/">Главная</a><span class="sep">/</span><span>Подарочные карты</span>
    </div>

    <div class="gc-head">
      <div class="eyebrow">Идеальный подарок без догадок</div>
      <h1 class="serif">Подарочная <em>карта</em> «Бутон»</h1>
      <p>Когда не угадать с букетом — подарите выбор. Получатель сам соберёт то, что хочет, а карта придёт красиво оформленной на почту.</p>
    </div>

    <div class="gc-grid">
      <div class="gc-prevwrap">
        <div class="cert" :class="theme">
          <svg class="c-deco" width="180" height="180" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.4" /><circle cx="12" cy="18" r="3.4" /><circle cx="6" cy="12" r="3.4" /><circle cx="18" cy="12" r="3.4" /><circle cx="12" cy="12" r="3" /></svg>
          <div class="c-top"><div class="c-logo"><span class="mk" />Бутон</div><div class="c-label">Подарочная карта</div></div>
          <div class="c-amount">{{ amountFmt }}</div>
          <div class="c-msg">{{ certMsg }}</div>
          <div class="c-foot"><span>Кому: {{ toName || '—' }}</span><span>действует 1 год</span></div>
        </div>
        <div class="gc-note">Карту можно потратить на любой букет, конструктор или подписку.</div>
      </div>

      <form @submit.prevent="submit">
        <div class="gc-step">
          <div class="sh"><span class="no">1</span><h3>Номинал</h3></div>
          <div class="noms">
            <button
              v-for="n in noms"
              :key="n"
              type="button"
              class="nom"
              :class="{ on: !custom && amount === n }"
              @click="selectNom(n)"
            >{{ n.toLocaleString('ru-RU') }} ₽</button>
            <div class="nom-custom">≈<input v-model="custom" type="number" placeholder="свой" min="1000" max="100000" @input="onCustom"><span style="color:var(--ink-faint)">₽</span></div>
          </div>
        </div>

        <div class="gc-step">
          <div class="sh"><span class="no">2</span><h3>Оформление</h3></div>
          <div class="themes">
            <div
              v-for="t in themes"
              :key="t.value"
              class="theme"
              :class="{ on: theme === t.value }"
              :style="`background:${t.bg}`"
              @click="theme = t.value"
            />
          </div>
        </div>

        <div class="gc-step">
          <div class="sh"><span class="no">3</span><h3>Кому и от кого</h3></div>
          <div class="gc-field frow">
            <div><label>Имя получателя</label><input v-model="toName" class="inp" placeholder="Например, Анна"></div>
            <div><label>От кого</label><input class="inp" placeholder="Ваше имя"></div>
          </div>
          <div class="gc-field"><label>Пожелание на карте</label><textarea v-model="msg" class="inp" maxlength="80" placeholder="С праздником! Выбери букет по душе 🌸" /></div>
          <div class="gc-field"><label>E-mail получателя</label><input class="inp" type="email" placeholder="anna@example.com"></div>
          <div class="gc-field">
            <label>Формат</label>
            <div class="formats">
              <div
                v-for="(f, i) in formats"
                :key="f"
                class="fmt"
                :class="{ on: format === i }"
                @click="format = i"
              >{{ f }}</div>
            </div>
          </div>
          <div class="gc-buy"><span class="total">{{ amountFmt }}</span><button class="btn-primary" type="submit">Оплатить карту</button></div>
        </div>
      </form>
    </div>

    <div class="success-ov" :class="{ show: okVisible }" @click.self="okVisible = false">
      <div class="success-box">
        <div class="ok"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m4 12 5 5 11-12" /></svg></div>
        <h3 class="serif">Карта отправлена!</h3>
        <p>Красиво оформленная карта уже летит на почту получателя. Копию выслали и вам.</p>
        <button class="btn-primary" style="width:100%" @click="okVisible = false">Готово</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Подарочные карты — Бутон' })

const noms = [2000, 3000, 5000, 10000]
const themes = [
  { value: '', bg: 'linear-gradient(140deg,oklch(0.4 0.05 152),oklch(0.55 0.15 148))' },
  { value: 'theme-blush', bg: 'linear-gradient(140deg,oklch(0.62 0.1 24),oklch(0.7 0.08 350))' },
  { value: 'theme-clay', bg: 'linear-gradient(140deg,oklch(0.58 0.11 47),oklch(0.5 0.1 35))' },
  { value: 'theme-night', bg: 'linear-gradient(140deg,oklch(0.32 0.04 265),oklch(0.26 0.04 290))' },
]
const formats = ['📧 На e-mail', '📱 Себе в чат', '🖨 Распечатать']

const amount = ref(3000)
const custom = ref('')
const theme = ref('')
const toName = ref('')
const msg = ref('')
const format = ref(0)
const okVisible = ref(false)

const amountFmt = computed(() => amount.value.toLocaleString('ru-RU') + ' ₽')
const certMsg = computed(() => (msg.value ? '«' + msg.value + '»' : '«С праздником! Выбери букет по душе 🌸»'))

function selectNom (n) {
  custom.value = ''
  amount.value = n
}

function onCustom () {
  const v = parseInt(custom.value || 0, 10)
  if (v > 0) amount.value = v
}

function submit () {
  okVisible.value = true
}
</script>

<style scoped>
/* ===== oklch-токены (из buton.css), инлайн под .wrap ===== */
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

/* ===== базовые классы из buton.css, нужные странице ===== */
.wrap{max-width:1320px;margin:0 auto;padding:24px 24px 140px;color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased;font-feature-settings:"ss01";}
.wrap *{box-sizing:border-box;}
.serif{font-family:'Montserrat',Georgia,serif;}
.crumbs{font-size:13px;color:var(--ink-faint);display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.crumbs a{color:var(--ink-faint);text-decoration:none;}
.crumbs a:hover{color:var(--ink);}
.crumbs .sep{opacity:.5;}
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);border:none;cursor:pointer;}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}

/* ===== <style> из «Подарочные карты.html» ===== */
.gc-head{text-align:center;max-width:640px;margin:14px auto 36px;}
.gc-head .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:12px;}
.gc-head h1{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(32px,4.4vw,50px);letter-spacing:-.02em;line-height:1.04;}
.gc-head h1 em{font-style:italic;color:var(--clay);}
.gc-head p{color:var(--ink-soft);font-size:16.5px;margin-top:14px;}
.gc-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,440px);gap:34px;align-items:start;}
@media(max-width:920px){.gc-grid{grid-template-columns:1fr;}}
/* preview */
.gc-prevwrap{position:sticky;top:90px;}
@media(max-width:920px){.gc-prevwrap{position:static;}}
.cert{aspect-ratio:1.6/1;border-radius:18px;padding:30px;color:#fff;position:relative;overflow:hidden;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;transition:.3s;
  background:linear-gradient(140deg, oklch(0.4 0.05 152), oklch(0.55 0.15 148));}
.cert.theme-blush{background:linear-gradient(140deg, oklch(0.62 0.1 24), oklch(0.7 0.08 350));}
.cert.theme-clay{background:linear-gradient(140deg, oklch(0.58 0.11 47), oklch(0.5 0.1 35));}
.cert.theme-night{background:linear-gradient(140deg, oklch(0.32 0.04 265), oklch(0.26 0.04 290));}
.cert .c-deco{position:absolute;right:-26px;top:-26px;opacity:.18;}
.cert .c-top{display:flex;justify-content:space-between;align-items:center;}
.cert .c-logo{font-family:'Montserrat',serif;font-size:22px;font-weight:600;display:flex;align-items:center;gap:8px;}
.cert .c-logo .mk{width:8px;height:8px;border-radius:50%;background:oklch(0.82 0.1 45);}
.cert .c-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.8;}
.cert .c-amount{font-family:'Montserrat',serif;font-size:54px;font-weight:600;margin-top:auto;letter-spacing:-.01em;}
.cert .c-msg{font-size:14px;opacity:.92;margin-top:8px;min-height:20px;font-style:italic;}
.cert .c-foot{display:flex;justify-content:space-between;font-size:11.5px;opacity:.75;margin-top:14px;}
.gc-note{text-align:center;font-size:13px;color:var(--ink-faint);margin-top:16px;}
/* controls */
.gc-step{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:22px;margin-bottom:16px;}
.gc-step .sh{display:flex;align-items:center;gap:11px;margin-bottom:16px;}
.gc-step .sh .no{width:26px;height:26px;border-radius:8px;background:var(--green);color:#fff;font-size:13px;font-weight:700;display:grid;place-items:center;}
.gc-step .sh h3{font-size:16px;font-weight:600;}
.noms{display:flex;gap:10px;flex-wrap:wrap;}
.nom{padding:11px 18px;border-radius:11px;border:1.5px solid var(--line-strong);background:var(--card);font-weight:700;font-size:15px;cursor:pointer;transition:.14s;font-variant-numeric:tabular-nums;color:inherit;}
.nom:hover{border-color:var(--green-soft);}
.nom.on{border-color:var(--green);background:var(--green-wash);color:var(--green);}
.nom-custom{display:flex;align-items:center;gap:8px;border:1.5px solid var(--line-strong);border-radius:11px;padding:0 14px;}
.nom-custom input{border:none;outline:none;background:none;width:90px;height:42px;font-weight:700;font-size:15px;font-variant-numeric:tabular-nums;color:inherit;font-family:inherit;}
.themes{display:flex;gap:12px;flex-wrap:wrap;}
.theme{width:60px;height:40px;border-radius:9px;cursor:pointer;position:relative;transition:.14s;}
.theme.on{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--green);}
.gc-field{margin-bottom:13px;}
.gc-field label{display:block;font-size:13px;font-weight:500;color:var(--ink-soft);margin-bottom:6px;}
.gc-field .inp{width:100%;height:44px;border:1px solid var(--line-strong);border-radius:10px;padding:0 13px;font-size:14.5px;background:var(--card);color:inherit;font-family:inherit;}
.gc-field textarea.inp{height:auto;min-height:66px;padding:10px 13px;resize:vertical;line-height:1.45;}
.gc-field .inp:focus{outline:none;border-color:var(--green-soft);box-shadow:0 0 0 3px var(--green-wash);}
.gc-field .frow{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.formats{display:flex;gap:10px;}
.fmt{flex:1;border:1px solid var(--line-strong);border-radius:10px;padding:12px;text-align:center;cursor:pointer;font-size:13.5px;font-weight:500;transition:.14s;}
.fmt.on{border-color:var(--green);background:var(--green-wash);color:var(--green);font-weight:600;}
.gc-buy{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:8px;}
.gc-buy .total{font-family:'Montserrat',serif;font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;}
.gc-buy .btn-primary{flex:1;height:52px;}
.success-ov{display:none;}
.success-ov.show{display:flex;position:fixed;inset:0;background:oklch(0.2 0.02 60 / .5);z-index:80;align-items:center;justify-content:center;padding:20px;}
.success-box{background:var(--paper);border-radius:var(--r);padding:40px;max-width:420px;text-align:center;box-shadow:var(--shadow-lg);}
.success-box .ok{width:72px;height:72px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;margin:0 auto 18px;}
.success-box h3{font-family:'Montserrat',serif;font-size:26px;font-weight:600;margin-bottom:10px;}
.success-box p{color:var(--ink-soft);margin-bottom:20px;}
</style>
