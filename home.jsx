const { useState, useEffect, useRef } = React;
const fmt = n => n.toLocaleString("ru-RU");
const plural = (n,[one,few,many]) => { const a=Math.abs(n)%100, b=a%10; if(a>10&&a<20) return many; if(b>1&&b<5) return few; if(b===1) return one; return many; };

const I = {
  search:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>,
  heart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 4.8 3.5 3.3 6.5C19 15.5 12 20 12 20Z"/></svg>,
  user:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 3.2-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/></svg>,
  cart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L5.6 4.8A1 1 0 0 0 4.6 4H3"/><circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="20" r="1.1" fill="currentColor" stroke="none"/></svg>,
  plus:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  arrow:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  star:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>,
  x:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  camera:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>,
  truck:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  leaf:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>,
  shield:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>,
};
const PH = ({label, style, cls=""})=>(<div className={"ph "+cls} style={style}><span className="lbl">{label}</span></div>);
const Stars = ({n=5})=><span style={{display:"inline-flex",gap:1,color:"var(--clay)"}}>{Array.from({length:5}).map((_,i)=><span key={i} style={{opacity:i<n?1:.25}}>{I.star}</span>)}</span>;

/* data */
const OCCAS = [
  { n:"Монобукеты", q:"от 1 200 ₽", grad:"oklch(0.8 0.07 18)" },
  { n:"В коробке", q:"от 3 400 ₽", grad:"oklch(0.7 0.06 250)" },
  { n:"Авторские", q:"от 3 900 ₽", grad:"oklch(0.62 0.08 135)" },
  { n:"Свадебные", q:"от 5 500 ₽", grad:"oklch(0.85 0.05 30)" },
  { n:"Подписка", q:"−15% выгода", grad:"oklch(0.62 0.11 47)" },
];
const HITS = [
  { n:"Белые ночи", c:"Пионы, ранункулюс, эвкалипт", p:5200, o:6100, r:4.9, tag:["hit","Хит недели"], m:"oklch(0.85 0.06 20)" },
  { n:"Невский букет", c:"Кустовые розы, фрезия", p:4200, o:0, r:4.8, tag:["new","Новинка"], m:"oklch(0.72 0.06 350)" },
  { n:"Нежность в коробке", c:"Пионовидные розы", p:5800, o:6900, r:5.0, tag:["sale","−16%"], m:"oklch(0.8 0.05 30)" },
  { n:"Летнее поле", c:"Сезонный микс", p:3400, o:0, r:4.7, tag:null, m:"oklch(0.78 0.08 110)" },
];
const NEW = [
  { n:"Тихий вечер", c:"Гортензия, эустома", p:4600, o:0, r:4.9, tag:["new","Новинка"], m:"oklch(0.74 0.06 270)" },
  { n:"Карамель", c:"Розы кустовые, статица", p:3900, o:0, r:4.8, tag:["new","Новинка"], m:"oklch(0.76 0.08 50)" },
  { n:"Первый снег", c:"Маттиола, лизиантус", p:4300, o:5100, r:5.0, tag:["sale","−15%"], m:"oklch(0.9 0.02 300)" },
  { n:"Гранат", c:"Пионы, гвоздика", p:5100, o:0, r:4.9, tag:null, m:"oklch(0.62 0.12 25)" },
];
const TIERS = [
  { n:"Серебро", c:"5%", d:"кэшбэк баллами с каждого заказа", th:"от 1 заказа", gold:false },
  { n:"Золото", c:"10%", d:"кэшбэк + ранний доступ к коллекциям", th:"от 30 000 ₽ за год", gold:true },
  { n:"Платина", c:"15%", d:"кэшбэк + бесплатная доставка всегда", th:"от 80 000 ₽ за год", gold:false },
];
const REVIEWS = [
  { n:"Мария С.", s:5, t:"Прислали фото перед доставкой — букет ещё пышнее, чем на сайте. Стоял 9 дней!", p:2 },
  { n:"Дмитрий К.", s:5, t:"Собрал за час, привезли точно в слот. Пионы свежие, жена в восторге.", p:1 },
  { n:"Анна В.", s:5, t:"Открытка от руки — приятная мелочь. Заказываю уже третий раз.", p:0 },
  { n:"Игорь П.", s:5, t:"Анонимная доставка сработала идеально. Сервис топ!", p:2 },
  { n:"Елена Т.", s:5, t:"Баллами оплатила почти треть заказа. Очень удобная программа.", p:1 },
  { n:"Олег Р.", s:4, t:"Доставили в срок, упаковка аккуратная. Буду заказывать ещё.", p:0 },
];

/* ---- minimalist cartoon flower heads (ported from constructor) ---- */
function ring(key, count, dist, prx, pry, fill, stroke, phase){
  const out = [];
  for(let i=0;i<count;i++){
    const deg = (i/count)*360 + (phase||0);
    out.push(<g key={key+i} transform={`rotate(${deg})`}><ellipse cx="0" cy={-dist} rx={prx} ry={pry} fill={fill} stroke={stroke} strokeWidth={stroke==="none"?0:Math.max(0.6,pry*0.08)}/></g>);
  }
  return out;
}
function FlowerHead({ p, x, y, R }){
  const c = p.c, core = p.core, id = p.id;
  const st = "oklch(0 0 0 / .13)";
  const lite = "oklch(1 0 0 / .24)";
  let el = [];
  if(id==="peony"){
    el = [...ring("a",9, R*0.55, R*0.42, R*0.52, c, st, 0), ...ring("b",7, R*0.32, R*0.34, R*0.42, c, st, 20), ...ring("c",6, R*0.18, R*0.26, R*0.32, lite, "none", 0), <circle key="cc" r={R*0.16} fill={core}/>];
  } else if(id==="sprayrose"){
    el = [<circle key="bg" r={R*0.92} fill={c} stroke={st} strokeWidth="1"/>, ...ring("a",5, R*0.46, R*0.36, R*0.46, c, st, 0), ...ring("b",4, R*0.24, R*0.3, R*0.34, lite, "none", 30), <path key="sp" d={`M 0 ${-R*0.2} A ${R*0.2} ${R*0.2} 0 1 1 ${-R*0.17} ${R*0.07}`} fill="none" stroke={core} strokeWidth={R*0.11} strokeLinecap="round"/>];
  } else if(id==="hydrangea"){
    const flo = (fx,fy,s,kk)=>[<g key={"f"+kk} transform={`translate(${fx} ${fy})`}>{ring("p"+kk,4, s*0.5, s*0.42, s*0.42, c, st, 45)}<circle r={s*0.18} fill={core}/></g>];
    el = [...flo(0,0,R*0.95,0), ...flo(R*0.55,-R*0.2,R*0.7,1), ...flo(-R*0.5,-R*0.3,R*0.7,2), ...flo(R*0.15,R*0.6,R*0.65,3), ...flo(-R*0.45,R*0.42,R*0.6,4)];
  } else if(id==="eustoma"){
    el = [...ring("a",5, R*0.5, R*0.5, R*0.56, c, st, 0), ...ring("b",5, R*0.28, R*0.28, R*0.34, lite, "none", 36), <circle key="cc" r={R*0.2} fill={core}/>, ...ring("d",6, R*0.16, R*0.05, R*0.14, "oklch(0.95 0.09 95)", "none", 0)];
  } else if(id==="chrys"){
    el = [...ring("a",18, R*0.55, R*0.1, R*0.62, c, st, 0), ...ring("b",14, R*0.4, R*0.1, R*0.5, c, st, 13), ...ring("c",10, R*0.24, R*0.09, R*0.34, lite, "none", 18), <circle key="cc" r={R*0.15} fill={core}/>];
  } else if(id==="leaf"){
    el = [<line key="st" x1="0" y1={R*0.85} x2="0" y2={-R*0.85} stroke={c} strokeWidth={Math.max(1,R*0.1)} strokeLinecap="round"/>,
      ...[-0.5,-0.15,0.2,0.55].map((t,j)=>{const ly=t*R; const sx=(j%2?1:-1)*R*0.26; return <ellipse key={"l"+j} cx={sx} cy={ly} rx={R*0.2} ry={R*0.36} fill={c} transform={`rotate(${j%2?38:-38} ${sx} ${ly})`}/>;})];
  } else {
    el = [...ring("a",6, R*0.5, R*0.4, R*0.52, c, st, 0), ...ring("b",6, R*0.28, R*0.3, R*0.4, lite, "none", 30), <circle key="cc" r={R*0.18} fill={core}/>];
  }
  return <g transform={`translate(${x} ${y})`}>{el}</g>;
}

function Header({count, onCart, onSearch, onWish, wishCount}){
  return (<>
    <div className="announce"><div className="ann-left"><span className="ann-deco"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg></span><span className="ann-promo"><b>−10%</b> на первый букет</span><span className="ann-badge">новым клиентам</span><button className="ann-code" onClick={e=>{if(navigator.clipboard)navigator.clipboard.writeText('БУТОН10');const t=e.currentTarget;t.classList.add('copied');setTimeout(()=>t.classList.remove('copied'),1400);}}>БУТОН10<span className="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span className="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button></div><div className="ann-trust"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span></div></div>
    <header className="site">
      <div className="site-in">
        <a className="logo" href="Витрина.html" style={{textDecoration:"none",color:"inherit"}}><span className="mark"></span>Бутон</a>
        <nav className="main">
          <a href="#" className="on">Главная</a>
          <a href="Карточка товара.html">Каталог</a>
          <a href="Конструктор букета.html">Конструктор</a>
          <a href="Доставка.html">Доставка</a><a href="Подписка.html">Подписка</a>
        </nav>
        <div className="site-tools">
          <button className="icobtn" onClick={onSearch}>{I.search}</button>
          <button className="icobtn" onClick={onWish}>{I.heart}{wishCount>0 && <span className="badge">{wishCount}</span>}</button>
          <a className="icobtn" href="cabinet/Личный кабинет.html">{I.user}</a>
          <button className="icobtn" onClick={onCart}>{I.cart}{count>0 && <span className="badge">{count}</span>}</button>
        </div>
      </div>
    </header>
  </>);
}

function Footer(){
  return (
    <footer className="site">
      <div className="fin">
        <div className="fbrand">
          <div className="flogo"><span className="mark"></span>Бутон</div>
          <p>Цветочная мастерская в Санкт-Петербурге. Собираем букеты, в которых слышно тишину — 7 лет, 2 400 отзывов, 4.9★.</p>
        </div>
        <div className="fcol"><h4>Магазин</h4><a href="Карточка товара.html">Каталог</a><a href="Конструктор букета.html">Конструктор</a><a href="Подписка.html">Подписка</a><a href="Подарочные карты.html">Подарочные карты</a></div>
        <div className="fcol"><h4>Помощь</h4><a href="Доставка.html">Доставка и оплата</a><a href="Отслеживание заказа.html">Отследить заказ</a><a href="Доставка.html">Вопросы и ответы</a></div>
        <div className="fcol"><h4>Контакты</h4><a href="#">+7 (812) 000-00-00</a><a href="#">Telegram</a><a href="#">WhatsApp</a><a href="#">Невский пр., 28</a></div>
      </div>
      <div className="fbot"><span>© 2026 Бутон · Цветочная мастерская</span><span>Политика конфиденциальности · Оферта</span></div>
    </footer>
  );
}

function Card({p, onAdd, liked, onLike}){
  return (
    <a className="pcard" href="Карточка товара.html" onClick={e=>{if(e.target.closest('.like')||e.target.closest('.quick'))e.preventDefault();}}>
      <div className="pm">
        <PH label="фото букета" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${p.m}, oklch(0.92 0.02 80))`}}/>
        {p.tag && <span className={"tag "+p.tag[0]}>{p.tag[1]}</span>}
        <button className={"like"+(liked?" on":"")} onClick={()=>onLike(p.n)}>{I.heart}</button>
        <button className="quick" onClick={()=>onAdd(p)}>{I.plus} Быстрый заказ</button>
      </div>
      <div className="pb">
        <div className="prate">{I.star}<b>{p.r.toFixed(1)}</b></div>
        <div className="pn">{p.n}</div>
        <div className="pc">{p.c}</div>
        <div className="pp"><span className="n">{fmt(p.p)} ₽</span>{p.o>0 && <span className="o">{fmt(p.o)} ₽</span>}</div>
      </div>
    </a>
  );
}

function useCountdown(){
  const [left, setLeft] = useState(0);
  useEffect(()=>{
    const tick=()=>{ const now=new Date(); const end=new Date(now); end.setHours(16,0,0,0); if(end<now) end.setDate(end.getDate()+1); setLeft(Math.floor((end-now)/1000)); };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);
  const h=Math.floor(left/3600), m=Math.floor(left%3600/60), s=left%60;
  const p2=x=>String(x).padStart(2,"0");
  return [p2(h),p2(m),p2(s)];
}

function CartDrawer({open, onClose, items, setQty, remove}){
  const subtotal = items.reduce((a,x)=>a+x.p*x.qty,0);
  const points = Math.round(subtotal*0.05);
  const toFree = Math.max(0, 4000-subtotal);
  const pct = Math.min(100, subtotal/4000*100);
  const cnt = items.reduce((a,x)=>a+x.qty,0);
  return (<>
    <div className={"cart-bg"+(open?" open":"")} onClick={onClose}></div>
    <div className={"cart-drawer"+(open?" open":"")}>
      <div className="cd-head"><h3 className="serif">Корзина</h3><span className="cnt">{cnt} {plural(cnt,['товар','товара','товаров'])}</span><button className="dclose" onClick={onClose}>{I.x}</button></div>
      {items.length===0 ? (
        <div className="cd-empty"><div className="ring">{I.cart}</div><h4>Корзина пуста</h4><p>Загляните в каталог или соберите свой букет.</p><a className="btn-primary" href="Каталог.html" style={{textDecoration:"none"}}>В каталог</a></div>
      ) : (<>
        <div className="cd-free">
          {toFree>0 ? <span>До <b>бесплатной доставки</b> осталось <b>{fmt(toFree)} ₽</b></span> : <span><b>Доставка бесплатно</b> 🎉</span>}
          <div className="track"><div className="fill" style={{width:pct+"%"}}></div></div>
        </div>
        <div className="cd-body">
          {items.map(x=>(
            <div className="cd-item" key={x.id}>
              <div className="im"><PH label="фото" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${x.m}, oklch(0.9 0.02 80))`}}/></div>
              <div className="ii">
                <div className="nm">{x.n}</div><div className="mt">{x.c}</div>
                <div className="bot"><div className="cd-qty"><button onClick={()=>setQty(x.id,-1)}>−</button><span className="qn tnum">{x.qty}</span><button onClick={()=>setQty(x.id,1)}>+</button></div><button className="rm" onClick={()=>remove(x.id)}>Удалить</button></div>
              </div>
              <div className="pp tnum">{fmt(x.p*x.qty)} ₽</div>
            </div>
          ))}
        </div>
        <div className="cd-foot">
          <div className="earn">{I.star}<span>Вернём <b>{fmt(points)} {plural(points,['балл','балла','баллов'])}</b> после доставки</span></div>
          <div className="totrow"><span className="l">Итого</span><span className="p tnum">{fmt(subtotal)} ₽</span></div>
          <a className="btn-primary" href="Оформление заказа.html" style={{textDecoration:"none"}}>Оформить заказ {I.arrow}</a>
          <a className="cont" href="Каталог.html" onClick={e=>{e.preventDefault();onClose();}}>Продолжить покупки</a>
        </div>
      </>)}
    </div>
  </>);
}

function SearchOverlay({open, onClose, query, setQuery, results}){
  const inputRef = useRef(null);
  useEffect(()=>{ if(open && inputRef.current) setTimeout(()=>inputRef.current.focus(),60); },[open]);
  const POP=[{q:"Пионы",id:"peony",c:"oklch(0.84 0.07 18)",core:"oklch(0.72 0.1 22)"},{q:"Розы",id:"sprayrose",c:"oklch(0.66 0.13 32)",core:"oklch(0.54 0.14 30)"},{q:"Гортензия",id:"hydrangea",c:"oklch(0.78 0.07 250)",core:"oklch(0.68 0.09 250)"},{q:"Эустома",id:"eustoma",c:"oklch(0.8 0.06 320)",core:"oklch(0.7 0.08 320)"},{q:"Микс",id:"chrys",c:"oklch(0.72 0.1 140)",core:"oklch(0.6 0.12 140)"},{q:"Эвкалипт",id:"leaf",c:"oklch(0.6 0.06 160)",core:"oklch(0.6 0.06 160)"}];
  return (<>
    <div className={"search-bg"+(open?" open":"")} onClick={onClose}></div>
    <div className={"search-panel"+(open?" open":"")}>
      <div className="search-in">
        <div className="search-field">{I.search}<input ref={inputRef} placeholder="Поиск букетов, цветов, поводов…" value={query} onChange={e=>setQuery(e.target.value)}/><button className="sx" onClick={onClose}>{I.x}</button></div>
        {query.trim()==="" ? (<>
          <div className="search-sect">Популярные запросы</div>
          <div className="search-pop">{POP.map(o=><button key={o.q} onClick={()=>setQuery(o.q)} style={{borderColor:`color-mix(in oklab, ${o.c} 45%, var(--line-strong))`,background:`color-mix(in oklab, ${o.c} 9%, var(--card))`}}><svg viewBox="0 0 24 24" width="22" height="22" style={{overflow:"visible",flex:"none"}}><FlowerHead p={{c:o.c,core:o.core,id:o.id}} x={12} y={12} R={10}/></svg>{o.q}</button>)}</div>
        </>) : results.length ? (<>
          <div className="search-sect">Найдено: {results.length}</div>
          <div className="sres">{results.map(p=>(
            <a key={p.n} href="Карточка товара.html"><div className="sm"><PH label="" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${p.m}, oklch(0.92 0.02 80))`}}/></div><div className="si"><div className="nn">{p.n}</div><div className="cc">{p.c}</div></div><div className="pp tnum">{fmt(p.p)} ₽</div></a>
          ))}</div>
        </>) : <div className="search-empty">По запросу «{query}» ничего не нашлось. Попробуйте «пионы» или «розы».</div>}
      </div>
    </div>
  </>);
}

function WishDrawer({open, onClose, items, onUnlike, onAdd}){
  return (<>
    <div className={"cart-bg"+(open?" open":"")} onClick={onClose}></div>
    <div className={"cart-drawer"+(open?" open":"")}>
      <div className="cd-head"><h3 className="serif">Избранное</h3><span className="cnt">{items.length} {plural(items.length,['букет','букета','букетов'])}</span><button className="dclose" onClick={onClose}>{I.x}</button></div>
      {items.length===0 ? (
        <div className="cd-empty"><div className="ring">{I.heart}</div><h4>Пока пусто</h4><p>Жмите ♡ на букетах, чтобы сохранить их здесь.</p><a className="btn-primary" href="Каталог.html" style={{textDecoration:"none"}}>В каталог</a></div>
      ) : (
        <div className="cd-body">
          {items.map(x=>(
            <div className="cd-item" key={x.n}>
              <div className="im"><PH label="фото" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${x.m}, oklch(0.9 0.02 80))`}}/></div>
              <div className="ii"><div className="nm">{x.n}</div><div className="mt">{x.c}</div>
                <div className="bot"><button className="rm" style={{color:"var(--green)",fontWeight:600}} onClick={()=>onAdd(x)}>В корзину</button><button className="rm" onClick={()=>onUnlike(x.n)}>Убрать</button></div>
              </div>
              <div className="pp tnum">{fmt(x.p)} ₽</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>);
}

function App(){
  const [likes, setLikes] = useState({"Белые ночи":true, "Тихий вечер":true});
  const [toast, setToast] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ALLP = [...HITS, ...NEW];
  const results = query.trim() ? ALLP.filter(p=>(p.n+" "+p.c).toLowerCase().includes(query.trim().toLowerCase())) : [];
  const wishItems = ALLP.filter(p=>likes[p.n]);
  const wishCount = wishItems.length;
  useEffect(()=>{ const h=e=>{ if(e.key==="Escape"){ setSearchOpen(false); setWishOpen(false); setDrawer(false); } }; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[]);
  const [cart, setCart] = useState([
    { id:"belyenochi", n:"Белые ночи", c:"Размер M · открытка", p:5200, qty:1, m:"oklch(0.85 0.06 20)" },
    { id:"nevsky", n:"Невский букет", c:"Размер S", p:4200, qty:1, m:"oklch(0.72 0.06 350)" },
  ]);
  const cartCount = cart.reduce((a,x)=>a+x.qty,0);
  const [h,m,s] = useCountdown();
  const toggleLike = n => setLikes(l=>({...l,[n]:!l[n]}));
  const setCartQty=(id,d)=>setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+d)}:x));
  const removeCart=id=>setCart(c=>c.filter(x=>x.id!==id));
  const add = p => {
    const key = p.n;
    setCart(c=>{ const i=c.findIndex(x=>x.id===key); if(i>=0){const n=[...c];n[i]={...n[i],qty:n[i].qty+1};return n;} return [...c,{id:key,n:p.n,c:p.c,p:p.p,qty:1,m:p.m}]; });
    setDrawer(true);
  };

  return (
    <div className="app">
      <Header count={cartCount} onCart={()=>setDrawer(true)} onSearch={()=>setSearchOpen(true)} onWish={()=>setWishOpen(true)} wishCount={wishCount}/>
      <div className="wrap">
        {/* HERO */}
        <section className="hero">
          <div className="hero-l">
            <div className="eyebrow">Цветочная мастерская · Санкт-Петербург</div>
            <h1 className="serif">Букеты, в которых<br/>слышно <em>тишину</em></h1>
            <p className="lead">Соберём из свежих сезонных цветов, привезём за 2 часа и пришлём фото перед доставкой. Без суеты — как любит Петербург.</p>
            <div className="cta">
              <a className="btn-primary" href="Карточка товара.html">Смотреть каталог {I.arrow}</a>
              <a className="ghost-btn" href="Конструктор букета.html">Собрать свой букет</a>
            </div>
            <div className="stats">
              <div className="s"><div className="v">7 лет</div><div className="k">в Петербурге</div></div>
              <div className="s"><div className="v"><span className="star">★</span> 4.9</div><div className="k">2 400 отзывов</div></div>
              <div className="s"><div className="v">2 часа</div><div className="k">сборка букета</div></div>
            </div>
          </div>
          <div className="hero-r">
            <div className="hero-media">
              <PH label="ГЛАВНОЕ ФОТО · букет «Белые ночи»" style={{position:"absolute",inset:0,background:"linear-gradient(150deg, oklch(0.85 0.06 20), oklch(0.78 0.05 320), oklch(0.88 0.03 90))"}}/>
              <div className="hero-badge"><span className="dotpulse"></span>Доставим сегодня к 18:00</div>
              <div className="hero-mini">
                <div className="hm-t"><span className="tag hit">Хит недели</span><div className="nm">Белые ночи</div><div className="cm">Пионы, ранункулюс, эвкалипт</div></div>
                <div className="hm-p"><div className="pp">5 200 ₽</div></div>
                <button className="hm-add" onClick={()=>add(HITS[0])}>{I.plus}</button>
              </div>
            </div>
          </div>
        </section>

        {/* TIMER */}
        <div className="timer">
          <span className="tt"><b>Соберём и доставим уже сегодня</b> — если оформите в ближайшие</span>
          <span className="tclock"><span className="seg">{h}</span>:<span className="seg">{m}</span>:<span className="seg">{s}</span></span>
        </div>

        {/* OCCASIONS */}
        <section>
          <div className="sec-h"><div><div className="eyebrow">Каталог по случаю</div><h2>Выберите повод</h2></div><a className="more" href="Карточка товара.html">Весь каталог {I.arrow}</a></div>
          <div className="occas">
            {OCCAS.map((o,i)=>(
              <a className="occ" href="Карточка товара.html" key={i}>
                <PH label="фото" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${o.grad}, oklch(0.9 0.02 80))`}}/>
                <div className="oc-grad"></div>
                <div className="oc-t"><div className="on">{o.n}</div><div className="oq">{o.q}</div></div>
              </a>
            ))}
          </div>
        </section>

        {/* HITS */}
        <section className="s-block">
          <div className="sec-h"><div><div className="eyebrow">Выбор покупателей</div><h2>Хиты недели</h2></div><a className="more" href="Карточка товара.html">Смотреть все {I.arrow}</a></div>
          <div className="cards">{HITS.map((p,i)=><Card key={i} p={p} onAdd={add} liked={likes[p.n]} onLike={toggleLike}/>)}</div>
        </section>

        {/* CONSTRUCTOR PROMO */}
        <section className="s-block">
          <div className="promo">
            <div className="pr-txt">
              <div className="eyebrow">Соберём за вас или соберите сами</div>
              <h3 className="serif">Конструктор<br/>букета</h3>
              <p>Выбирайте цветы поштучно, зелень, упаковку и ленту — цена пересчитывается вживую. Или начните с готовой основы.</p>
              <div><a className="btn-primary" href="Конструктор букета.html">Собрать букет {I.arrow}</a></div>
            </div>
            <div className="pr-media"><PH label="фото · процесс сборки букета" style={{position:"absolute",inset:0,background:"linear-gradient(150deg, oklch(0.82 0.05 140), oklch(0.86 0.05 90))"}}/></div>
          </div>
        </section>

        {/* NEW */}
        <section className="s-block">
          <div className="sec-h"><div><div className="eyebrow">Только собрали</div><h2>Новинки</h2></div><a className="more" href="Карточка товара.html">Смотреть все {I.arrow}</a></div>
          <div className="cards">{NEW.map((p,i)=><Card key={i} p={p} onAdd={add} liked={likes[p.n]} onLike={toggleLike}/>)}</div>
        </section>

        {/* LOYALTY */}
        <section className="s-block">
          <div className="loyal-block">
            <div className="lb-top">
              <div><h2 className="serif">Клуб «Бутон»</h2><p>Каждый заказ копит баллы. Оплачивайте ими до 30% следующего букета и поднимайтесь по уровням.</p></div>
              <a className="btn-primary" href="#" style={{background:"var(--clay)"}}>Вступить — бесплатно {I.arrow}</a>
            </div>
            <div className="tiers">
              {TIERS.map((t,i)=>(
                <div className={"tier"+(t.gold?" gold":"")} key={i}>
                  <div className="tr-n">{t.n}</div>
                  <div className="tr-c">{t.c}</div>
                  <div className="tr-d">{t.d}</div>
                  <div className="tr-th">Порог: {t.th}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS MARQUEE */}
        <section className="s-block">
          <div className="sec-h"><div><div className="eyebrow">Отзывы с фото реальных букетов</div><h2>Нам доверяют</h2></div><a className="more" href="Карточка товара.html#reviews">Все 2 400 отзывов {I.arrow}</a></div>
        </section>
        <div className="marq">
          <div className="marq-track">
            {[...REVIEWS,...REVIEWS].map((r,i)=>(
              <div className="rcard" key={i}>
                <div className="rh"><div className="av">{r.n[0]}</div><div className="rn">{r.n}</div><span className="rs"><Stars n={r.s}/></span></div>
                <p>{r.t}</p>
                {r.p>0 && <div className="rp">{Array.from({length:r.p}).map((_,j)=><div className="rphoto" key={j}><PH label="фото" style={{position:"absolute",inset:0}}/></div>)}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* SUBSCRIPTION CTA */}
        <section className="s-block">
          <div className="subcta">
            <div className="sc-t">
              <h3 className="serif">Свежие цветы — по подписке</h3>
              <p>Букет к вашему дню недели со скидкой 15%. Меняйте, ставьте на паузу или отменяйте в один клик.</p>
              <a className="btn-primary" href="#">Оформить подписку {I.arrow}</a>
            </div>
            <div className="sc-media"><PH label="фото · букет недели" style={{position:"absolute",inset:0,background:"linear-gradient(150deg, oklch(0.8 0.07 30), oklch(0.85 0.04 60))"}}/></div>
          </div>
          {/* TRUST ROW */}
          <div className="trust-row">
            <div className="tr"><span className="ic">{I.camera}</span><div><div className="tt">Фото перед доставкой</div><div className="td">Покажем букет до отправки</div></div></div>
            <div className="tr"><span className="ic">{I.truck}</span><div><div className="tt">Доставка за 2 часа</div><div className="td">По слотам, без опозданий</div></div></div>
            <div className="tr"><span className="ic">{I.leaf}</span><div><div className="tt">Свежесть 7 дней</div><div className="td">Или заменим букет</div></div></div>
            <div className="tr"><span className="ic">{I.shield}</span><div><div className="tt">Гарантия качества</div><div className="td">2 400 отзывов · 4.9★</div></div></div>
          </div>
        </section>
      </div>
      <Footer/>
      <CartDrawer open={drawer} onClose={()=>setDrawer(false)} items={cart} setQty={setCartQty} remove={removeCart}/>
      <WishDrawer open={wishOpen} onClose={()=>setWishOpen(false)} items={wishItems} onUnlike={n=>setLikes(l=>({...l,[n]:false}))} onAdd={p=>{add(p);setWishOpen(false);}}/>
      <SearchOverlay open={searchOpen} onClose={()=>setSearchOpen(false)} query={query} setQuery={setQuery} results={results}/>
      <div className={"toast"+(toast?" show":"")}>{I.cart}{toast}</div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
