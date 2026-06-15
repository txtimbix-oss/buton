/* ============ Бутон · общая оболочка (шапка + плашка + футер) ============
   Использование: подключить <script src="shell.js"></script> и задать
   window.SHELL_ACTIVE = "Каталог" (опц.) ДО подключения. Вставляет промо-плашку
   и шапку в начало <body>, футер — в конец. */
(function(){
  const ACTIVE = window.SHELL_ACTIVE || "";
  const CARTN  = window.SHELL_CART != null ? window.SHELL_CART : 2;
  const WISHN  = window.SHELL_WISH != null ? window.SHELL_WISH : 2;

  const NAV = [
    ["Главная","Витрина.html"],
    ["Каталог","Каталог.html"],
    ["Конструктор","Конструктор букета.html"],
    ["Доставка","Доставка.html"],
    ["Подписка","Подписка.html"],
  ];
  const ic = {
    search:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    heart:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 4.8 3.5 3.3 6.5C19 15.5 12 20 12 20Z"/></svg>',
    user:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 3.2-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/></svg>',
    cart:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L5.6 4.8A1 1 0 0 0 4.6 4H3"/><circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="20" r="1.1" fill="currentColor" stroke="none"/></svg>',
  };

  const announce = `
  <div class="announce"><div class="ann-left"><span class="ann-deco"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg></span><span class="ann-promo"><b>−10%</b> на первый букет</span><span class="ann-badge">новым клиентам</span><button class="ann-code" id="annCode">БУТОН10<span class="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span class="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button></div><div class="ann-trust"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span></div></div>`;

  const nav = NAV.map(([n,h])=>`<a href="${h}"${n===ACTIVE?' class="on"':''}>${n}</a>`).join("");
  const header = `
  <header class="site"><div class="site-in">
    <a class="logo" href="Витрина.html" style="text-decoration:none;color:inherit"><span class="mark"></span>Бутон</a>
    <nav class="main">${nav}</nav>
    <div class="site-tools">
      <a class="icobtn" href="Каталог.html" aria-label="Поиск">${ic.search}</a>
      <a class="icobtn" href="Витрина.html" aria-label="Избранное">${ic.heart}${WISHN>0?`<span class="badge">${WISHN}</span>`:''}</a>
      <a class="icobtn" href="cabinet/Личный кабинет.html" aria-label="Кабинет">${ic.user}</a>
      <a class="icobtn" href="Оформление заказа.html" aria-label="Корзина">${ic.cart}${CARTN>0?`<span class="badge">${CARTN}</span>`:''}</a>
    </div>
  </div></header>`;

  const footer = `
  <footer class="site"><div class="fin">
    <div class="fbrand"><div class="flogo"><span class="mark"></span>Бутон</div><p>Цветочная мастерская в Санкт-Петербурге. Собираем букеты, в которых слышно тишину — 7 лет, 2 400 отзывов, 4.9★.</p></div>
    <div class="fcol"><h4>Магазин</h4><a href="Каталог.html">Каталог</a><a href="Конструктор букета.html">Конструктор</a><a href="Подписка.html">Подписка</a><a href="Подарочные карты.html">Подарочные карты</a></div>
    <div class="fcol"><h4>Помощь</h4><a href="Доставка.html">Доставка и оплата</a><a href="Отслеживание заказа.html">Отследить заказ</a><a href="Витрина.html">Уход за цветами</a></div>
    <div class="fcol"><h4>Контакты</h4><a href="#">+7 (812) 000-00-00</a><a href="#">Telegram</a><a href="#">WhatsApp</a><a href="#">Невский пр., 28</a></div>
  </div><div class="fbot"><span>© 2026 Бутон · Цветочная мастерская</span><span>Политика конфиденциальности · Оферта</span></div></footer>`;

  function mount(){
    document.body.insertAdjacentHTML("afterbegin", announce + header);
    document.body.insertAdjacentHTML("beforeend", footer);
    const code = document.getElementById("annCode");
    if(code) code.addEventListener("click", ()=>{
      try{ navigator.clipboard && navigator.clipboard.writeText("БУТОН10"); }catch(e){}
      code.classList.add("copied"); setTimeout(()=>code.classList.remove("copied"),1400);
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount);
  else mount();
})();
