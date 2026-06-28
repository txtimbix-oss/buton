<template>
  <div class="wrap" style="padding-top:34px;">
    <div class="crumbs">
      <NuxtLink to="/">Главная</NuxtLink><span class="sep">/</span><span>Подписка</span>
    </div>

    <div class="s-hero">
      <div>
        <div class="pill">🌿 Выгода до 15% и приятная рутина</div>
        <h1 class="serif">Свежие цветы<br>каждую <em>неделю</em></h1>
        <p>Букет приезжает к вашему дню без напоминаний и забот. Меняйте состав, ставьте на паузу или отменяйте в один клик.</p>
        <a class="btn-primary" href="#plans" style="text-decoration:none">Выбрать тариф</a>
      </div>
      <div class="s-media ph"><span class="lbl">фото · букет недели</span></div>
    </div>

    <div class="sec">
      <div class="sh"><div class="eyebrow">Как это работает</div><h2 class="serif">Три шага — и готово</h2></div>
      <div class="steps3">
        <div class="st3"><div class="no">1</div><h3>Выбираете тариф</h3><p>Размер букета и частоту: раз в неделю или раз в две недели. В любой момент можно изменить.</p></div>
        <div class="st3"><div class="no">2</div><h3>Указываете день</h3><p>Удобный день недели и адрес. Флорист собирает сезонный букет и присылает фото перед доставкой.</p></div>
        <div class="st3"><div class="no">3</div><h3>Получаете красоту</h3><p>Свежие цветы приезжают точно в срок. Управляйте подпиской из личного кабинета.</p></div>
      </div>
    </div>

    <div class="sec" id="plans">
      <div class="sh"><div class="eyebrow">Тарифы</div><h2 class="serif">Выберите свой букет недели</h2></div>
      <div class="plans">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="plan"
          :class="{ best: plan.best, on: selectedPlan === plan.name }"
          @click="selectPlan(plan)"
        >
          <div v-if="plan.best" class="best-tag">Выбор клиентов</div>
          <div class="pn">{{ plan.name }}</div>
          <div class="pp tnum">{{ plan.price }}<span> / нед</span></div>
          <div class="pf">{{ plan.flavour }}</div>
          <ul>
            <li v-for="feat in plan.features" :key="feat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 4 4 10-11"/></svg>{{ feat }}
            </li>
          </ul>
          <div class="choose">Выбрать</div>
        </div>
      </div>

      <form class="signup" @submit.prevent="okVisible = true">
        <div class="sel">Выбран тариф: <b>{{ selectedLabel }}</b></div>
        <label>Имя</label><input class="inp" placeholder="Ваше имя" />
        <div class="frow">
          <div><label>Телефон</label><input class="inp" placeholder="+7 (___) ___-__-__" /></div>
          <div><label>День доставки</label><input class="inp" placeholder="Например, пятница" /></div>
        </div>
        <label>Адрес</label><input class="inp" placeholder="Город, улица, дом" />
        <button class="btn-primary" type="submit">Оформить подписку</button>
      </form>
    </div>

    <div class="sec">
      <div class="sh"><div class="eyebrow">Отзывы</div><h2 class="serif">Что говорят подписчики</h2></div>
      <div class="tcards">
        <div class="tc"><div class="rs">★★★★★</div><p>«Каждую пятницу дома свежие цветы — настроение совсем другое. И дешевле, чем покупать поштучно.»</p><div class="au"><div class="av">Е</div><div class="n">Елена Т.</div></div></div>
        <div class="tc"><div class="rs">★★★★★</div><p>«Оформил подписку маме. Она в восторге, а я спокоен — букет приезжает сам, без моих напоминалок.»</p><div class="au"><div class="av">И</div><div class="n">Игорь П.</div></div></div>
        <div class="tc"><div class="rs">★★★★★</div><p>«Удобно, что можно ставить на паузу на время отпуска. Букеты всегда разные и очень свежие.»</p><div class="au"><div class="av">М</div><div class="n">Мария С.</div></div></div>
      </div>
    </div>

    <div class="success-ov" :class="{ show: okVisible }" @click.self="okVisible = false">
      <div class="success-box">
        <div class="ok"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m4 12 5 5 11-12"/></svg></div>
        <h3 class="serif">Подписка оформлена!</h3>
        <p>Первый букет приедет уже на этой неделе. Детали отправили вам в SMS.</p>
        <button class="btn-primary" style="width:100%" @click="okVisible = false">Отлично</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Подписка на цветы — Бутон' })

const plans = [
  {
    name: 'Минимум',
    price: '2 600 ₽',
    flavour: 'монобукет · 15 стеблей',
    features: ['Сезонный монобукет', 'Скидка 10%', 'Пауза в любой момент'],
    best: false,
  },
  {
    name: 'Классика',
    price: '4 200 ₽',
    flavour: 'авторский букет · 25 стеблей',
    features: ['Авторский сезонный букет', 'Скидка 12% + бесплатная доставка', 'Открытка с пожеланием'],
    best: true,
  },
  {
    name: 'Премиум',
    price: '6 800 ₽',
    flavour: 'роскошный букет · 40 стеблей',
    features: ['Роскошный авторский букет', 'Скидка 15% + приоритетный слот', 'Ваза в подарок раз в месяц'],
    best: false,
  },
]

const selectedPlan = ref('Классика')
const okVisible = ref(false)

const selectedLabel = computed(() => {
  const p = plans.find(x => x.name === selectedPlan.value)
  return p ? `${p.name} · ${p.price} / нед` : ''
})

function selectPlan(plan) {
  selectedPlan.value = plan.name
}
</script>

<style scoped>
/* ---- oklch-токены дизайн-системы (инлайн под .wrap) ---- */
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

/* ---- page frame (из buton.css) ---- */
.wrap{max-width:1320px;margin:0 auto;padding:24px 24px 140px;color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-size:15px;line-height:1.5;}
.wrap *{box-sizing:border-box;}
.serif{font-family:'Montserrat',Georgia,serif;}
.tnum{font-variant-numeric:tabular-nums;}
.crumbs{font-size:13px;color:var(--ink-faint);display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.crumbs a{color:var(--ink-faint);text-decoration:none;}
.crumbs a:hover{color:var(--ink);}
.crumbs .sep{opacity:.5;}

/* ---- buttons (из buton.css) ---- */
.btn-primary{text-decoration:none;height:52px;padding:0 20px;border-radius:12px;background:var(--green);color:oklch(0.96 0.02 90);font-weight:600;font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:.16s;box-shadow:0 4px 14px oklch(0.62 0.15 148 / .22);border:none;cursor:pointer;font-family:inherit;}
.btn-primary:hover{background:oklch(0.55 0.15 148);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}

/* ---- media placeholder (из buton.css) ---- */
.ph{position:relative;background:
  repeating-linear-gradient(135deg, oklch(0.9 0.014 80) 0 11px, oklch(0.93 0.012 82) 11px 22px);
  display:grid;place-items:center;overflow:hidden;}
.ph .lbl{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11.5px;letter-spacing:.04em;color:oklch(0.5 0.02 70);background:oklch(0.98 0.008 84 / .82);padding:5px 10px;border-radius:6px;border:1px solid var(--line);}

/* ---- стили страницы Подписка (из <style> Подписка.html) ---- */
.s-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:36px;align-items:center;margin-top:18px;}
@media(max-width:900px){.s-hero{grid-template-columns:1fr;}}
.s-hero .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:16px;}
.s-hero h1{font-family:'Montserrat',serif;font-weight:500;font-size:clamp(36px,4.6vw,56px);letter-spacing:-.02em;line-height:1.03;}
.s-hero h1 em{font-style:italic;color:var(--clay);}
.s-hero p{color:var(--ink-soft);font-size:17px;margin:18px 0 26px;max-width:44ch;line-height:1.5;}
.s-hero .pill{display:inline-flex;align-items:center;gap:8px;background:var(--clay-wash);color:var(--clay);font-weight:600;font-size:13.5px;padding:7px 14px;border-radius:30px;margin-bottom:18px;}
.s-media{position:relative;height:100%;min-height:380px;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow-lg);}
.sec{margin-top:70px;}
.sec .sh{text-align:center;margin-bottom:30px;}
.sec .sh .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--green-soft);font-weight:600;margin-bottom:10px;}
.sec .sh h2{font-family:'Montserrat',serif;font-weight:500;font-size:34px;letter-spacing:-.01em;}
.steps3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
@media(max-width:760px){.steps3{grid-template-columns:1fr;}}
.st3{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:26px;box-shadow:var(--shadow);}
.st3 .no{width:38px;height:38px;border-radius:11px;background:var(--green);color:#fff;font-family:'Montserrat',serif;font-size:19px;font-weight:600;display:grid;place-items:center;margin-bottom:14px;}
.st3 h3{font-size:17px;font-weight:600;margin-bottom:6px;}
.st3 p{color:var(--ink-soft);font-size:14px;line-height:1.5;}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch;}
@media(max-width:820px){.plans{grid-template-columns:1fr;}}
.plan{background:var(--card);border:1.5px solid var(--line);border-radius:var(--r);padding:28px;box-shadow:var(--shadow);cursor:pointer;transition:.16s;position:relative;display:flex;flex-direction:column;}
.plan:hover{border-color:var(--green-soft);transform:translateY(-3px);}
.plan.on{border-color:var(--green);box-shadow:0 0 0 1px var(--green), var(--shadow-lg);}
.plan.best{border-color:var(--clay);}
.plan .best-tag{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--clay);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:4px 12px;border-radius:20px;}
.plan .pn{font-size:13px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;color:var(--green-soft);}
.plan .pp{font-family:'Montserrat',serif;font-size:40px;font-weight:600;margin:8px 0 2px;}
.plan .pp span{font-size:15px;color:var(--ink-faint);font-family:'Inter';font-weight:400;}
.plan .pf{font-size:13px;color:var(--ink-faint);margin-bottom:18px;}
.plan ul{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
.plan li{display:flex;gap:9px;font-size:14px;color:var(--ink-soft);}
.plan li svg{color:var(--green);flex:none;margin-top:2px;}
.plan .choose{margin-top:auto;height:46px;border-radius:11px;border:1px solid var(--line-strong);font-weight:600;font-size:14.5px;display:flex;align-items:center;justify-content:center;background:var(--card);transition:.15s;}
.plan.on .choose{background:var(--green);color:#fff;border-color:var(--green);}
.signup{max-width:560px;margin:34px auto 0;background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:28px;}
.signup .sel{background:var(--green-wash);border-radius:11px;padding:13px 16px;font-size:14px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;}
.signup .sel b{color:var(--green);}
.signup label{display:block;font-size:13px;font-weight:500;color:var(--ink-soft);margin:0 0 6px;}
.signup .inp{width:100%;height:46px;border:1px solid var(--line-strong);border-radius:10px;padding:0 13px;font-size:14.5px;background:var(--card);margin-bottom:14px;font-family:inherit;color:inherit;}
.signup .inp:focus{outline:none;border-color:var(--green-soft);box-shadow:0 0 0 3px var(--green-wash);}
.signup .frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.signup .btn-primary{width:100%;height:52px;margin-top:6px;}
.tcards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
@media(max-width:760px){.tcards{grid-template-columns:1fr;}}
.tc{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:22px;box-shadow:var(--shadow);}
.tc .rs{color:var(--clay);font-size:13px;margin-bottom:10px;}
.tc p{font-size:14.5px;color:var(--ink-soft);line-height:1.55;margin-bottom:14px;}
.tc .au{display:flex;align-items:center;gap:10px;}
.tc .av{width:34px;height:34px;border-radius:50%;background:var(--green-wash);color:var(--green);display:grid;place-items:center;font-weight:700;}
.tc .au .n{font-weight:600;font-size:13.5px;}
.success-ov{display:none;}
.success-ov.show{display:flex;position:fixed;inset:0;background:oklch(0.2 0.02 60 / .5);z-index:80;align-items:center;justify-content:center;padding:20px;}
.success-box{background:var(--paper);border-radius:var(--r);padding:40px;max-width:420px;text-align:center;box-shadow:var(--shadow-lg);}
.success-box .ok{width:72px;height:72px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;margin:0 auto 18px;}
.success-box h3{font-family:'Montserrat',serif;font-size:26px;font-weight:600;margin-bottom:10px;}
.success-box p{color:var(--ink-soft);margin-bottom:20px;}
</style>
