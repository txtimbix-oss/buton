<template>
  <div class="wrap" style="padding-top:34px;">
    <div class="crumbs"><NuxtLink to="/">Главная</NuxtLink><span class="sep">/</span><span>Отслеживание заказа</span></div>

    <div class="tr-head">
      <h1 class="serif">Где мой букет?</h1>
      <p>Введите номер заказа и телефон — покажем статус доставки в реальном времени.</p>
    </div>

    <form v-if="!showResult" class="lookup" @submit.prevent="onSubmit">
      <div class="frow">
        <div><label>Номер заказа</label><input v-model="ordNum" class="inp" placeholder="Например, 4821" /></div>
        <div><label>Телефон</label><input v-model="ordPhone" class="inp" placeholder="+7 (___) ___-__-__" /></div>
      </div>
      <button class="btn-primary" type="submit">Найти заказ</button>
      <div class="err" :class="{ show: showErr }">Заказ не найден. Проверьте номер — для демо введите <b>4821</b>.</div>
      <div class="hint">Номер заказа есть в SMS и письме после оплаты. Для демо: <b>4821</b></div>
    </form>

    <div class="result" :class="{ show: showResult }">
      <div class="rcard">
        <div class="rtop">
          <div><div class="on">Заказ №4821</div><div class="od">Оформлен сегодня в 14:20</div><div class="badge-status"><span class="pulse"></span>В пути · курьер скоро будет</div></div>
          <div class="ot"><div class="od">Сумма</div><div class="v tnum">6 750 ₽</div></div>
        </div>
        <div class="vstep">
          <div class="vs done"><div class="vd"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4 10-11"/></svg></div><div><div class="vt">Заказ принят и оплачен</div><div class="vtime">сегодня, 14:20</div></div></div>
          <div class="vs done"><div class="vd"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4 10-11"/></svg></div><div><div class="vt">Букет собран · фото отправлено в WhatsApp</div><div class="vtime">сегодня, 15:40</div></div></div>
          <div class="vs active"><div class="vd"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg></div><div><div class="vt">Курьер в пути</div><div class="vtime">ожидаемое время: 16:00–18:00</div></div></div>
          <div class="vs"><div class="vd"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z"/></svg></div><div><div class="vt">Доставлен</div><div class="vtime">—</div></div></div>
        </div>
      </div>
      <div class="rcard">
        <div class="dl"><span class="k">Состав</span><span class="v">Белые ночи (M), Невский букет (S)</span></div>
        <div class="dl"><span class="k">Получатель</span><span class="v">Анна, +7 (921) 000-00-00</span></div>
        <div class="dl"><span class="k">Адрес</span><span class="v">Невский пр., 28, кв. 14</span></div>
        <div class="dl"><span class="k">Курьер</span><span class="v">Михаил · +7 (911) 000-00-00</span></div>
      </div>
      <button class="again" type="button" @click="trackAnother">← Отследить другой заказ</button>
    </div>
  </div>
</template>

<script setup>
const showResult = ref(false)
const showErr = ref(false)
const ordNum = ref('')
const ordPhone = ref('')

function onSubmit() {
  const n = ordNum.value.trim()
  if (n === '4821' || n === '') {
    showErr.value = false
    showResult.value = true
  } else {
    showErr.value = true
  }
}

function trackAnother() {
  showResult.value = false
  ordNum.value = ''
}

useSeoMeta({ title: 'Отслеживание заказа — Бутон' })
</script>

<style scoped>
.wrap{
  /* oklch-токены дизайн-системы (инлайн под .wrap) */
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

  max-width:1320px;margin:0 auto;padding:24px 24px 140px;
  color:var(--ink);
  font-family:'Inter',system-ui,sans-serif;
  font-size:15px;line-height:1.5;
  -webkit-font-smoothing:antialiased;
  font-feature-settings:"ss01";
}
.wrap *{box-sizing:border-box;}

.serif{font-family:'Montserrat',Georgia,serif;}
.tnum{font-variant-numeric:tabular-nums;}

/* ---------- breadcrumbs ---------- */
.crumbs{font-size:13px;color:var(--ink-faint);display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.crumbs a{color:var(--ink-faint);text-decoration:none;}
.crumbs a:hover{color:var(--ink);}
.crumbs .sep{opacity:.5;}

/* ---------- primary button ---------- */
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);border:none;cursor:pointer;font-family:inherit;}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}
.btn-primary:disabled{background:var(--line-strong);box-shadow:none;color:oklch(1 0 0 / .8);cursor:not-allowed;}

/* ---------- page-specific styles (из Отслеживание заказа.html) ---------- */
.tr-head{text-align:center;max-width:620px;margin:14px auto 0;}
.tr-head h1{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(30px,4vw,44px);letter-spacing:-.015em;}
.tr-head p{color:var(--ink-soft);font-size:16px;margin-top:12px;}
.lookup{max-width:560px;margin:30px auto 0;background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:26px;}
.lookup .frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.lookup .frow{grid-template-columns:1fr;}}
.lookup label{display:block;font-size:13px;font-weight:500;color:var(--ink-soft);margin-bottom:6px;}
.lookup .inp{width:100%;height:48px;border:1px solid var(--line-strong);border-radius:10px;padding:0 13px;font-size:15px;background:var(--card);font-family:inherit;color:inherit;}
.lookup .inp:focus{outline:none;border-color:var(--green-soft);box-shadow:0 0 0 3px var(--green-wash);}
.lookup .btn-primary{width:100%;height:52px;margin-top:16px;}
.lookup .hint{font-size:12.5px;color:var(--ink-faint);text-align:center;margin-top:12px;}
.lookup .err{display:none;background:var(--blush-wash);color:oklch(0.45 0.12 24);border-radius:10px;padding:11px 14px;font-size:13.5px;margin-top:14px;}
.lookup .err.show{display:block;}

.result{display:none;max-width:760px;margin:30px auto 0;}
.result.show{display:block;animation:fade .3s ease;}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.rcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:26px;margin-bottom:18px;}
.rtop{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:6px;}
.rtop .on{font-family:'Montserrat',serif;font-size:24px;font-weight:600;}
.rtop .od{font-size:13px;color:var(--ink-faint);margin-top:2px;}
.rtop .ot{text-align:right;}
.rtop .ot .v{font-family:'Montserrat',serif;font-size:24px;font-weight:600;}
.badge-status{display:inline-flex;align-items:center;gap:7px;background:var(--green-wash);color:var(--green);font-weight:600;font-size:13px;padding:6px 13px;border-radius:30px;margin-top:10px;}
.badge-status .pulse{width:8px;height:8px;border-radius:50%;background:var(--green);}

.vstep{margin-top:24px;padding-left:8px;}
.vs{display:flex;gap:16px;padding-bottom:22px;position:relative;}
.vs:last-child{padding-bottom:0;}
.vs::before{content:"";position:absolute;left:15px;top:32px;bottom:-4px;width:2px;background:var(--line-strong);}
.vs:last-child::before{display:none;}
.vs.done::before{background:var(--green);}
.vs .vd{width:32px;height:32px;border-radius:50%;background:var(--card);border:2px solid var(--line-strong);display:grid;place-items:center;color:var(--ink-faint);flex:none;z-index:1;}
.vs.done .vd{background:var(--green);border-color:var(--green);color:#fff;}
.vs.active .vd{border-color:var(--green);color:var(--green);box-shadow:0 0 0 4px var(--green-wash);}
.vs .vt{font-weight:600;font-size:15px;}
.vs.active .vt{color:var(--green);}
.vs .vtime{font-size:12.5px;color:var(--ink-faint);margin-top:2px;}
.dl{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px;}
.dl:last-child{border-bottom:none;}
.dl .k{color:var(--ink-faint);width:120px;flex:none;}
.dl .v{font-weight:500;}
.again{display:block;text-align:center;margin-top:18px;color:var(--green);font-weight:600;font-size:14px;background:none;border:none;cursor:pointer;width:100%;font-family:inherit;}
</style>
