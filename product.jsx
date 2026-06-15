const { useState, useMemo, useRef, useEffect } = React;

const fmt = n => n.toLocaleString("ru-RU");
const plural = (n,[one,few,many]) => { const a=Math.abs(n)%100, b=a%10; if(a>10&&a<20) return many; if(b>1&&b<5) return few; if(b===1) return one; return many; };

/* ---------------- data ---------------- */
const SIZES = [
  { id:"S", name:"S · Камерный", desc:"11 стеблей · 35 см", price:3900, old:0 },
  { id:"M", name:"M · Классический", desc:"19 стеблей · 45 см", price:5200, old:6100, rec:true },
  { id:"L", name:"L · Роскошный", desc:"27 стеблей · 55 см", price:7400, old:8600 },
];
const OCCASIONS = [
  { id:"birthday", em:"🎂", name:"День рождения" },
  { id:"love", em:"❤️", name:"Любовь" },
  { id:"wedding", em:"💍", name:"Свадьба" },
  { id:"sorry", em:"🕊", name:"Извинения" },
  { id:"thanks", em:"🙏", name:"Благодарность" },
  { id:"none", em:"", name:"Без повода" },
];
const CARD_DESIGNS = [
  { id:"mini", em:"✿", label:"Мини" },
  { id:"kraft", em:"❦", label:"Крафт" },
  { id:"photo", em:"❤", label:"Сердце" },
];
const ADDONS = [
  { id:"bear", name:"Мишка Тедди", price:1200, color:"oklch(0.72 0.05 70)" },
  { id:"choco", name:"Конфеты Lindt", price:990, color:"oklch(0.42 0.06 50)" },
  { id:"vase", name:"Стеклянная ваза", price:1500, color:"oklch(0.82 0.03 230)" },
  { id:"balloon", name:"Связка шаров", price:850, color:"oklch(0.78 0.07 20)" },
];
const COMPOSITION = [
  { n:"Пионы розовые", q:"7 шт", id:"peony", c:"oklch(0.84 0.07 18)", core:"oklch(0.72 0.1 22)" },
  { n:"Ранункулюс", q:"6 шт", id:"ranunculus", c:"oklch(0.93 0.05 88)", core:"oklch(0.82 0.09 75)" },
  { n:"Эвкалипт", q:"4 ветки", id:"leaf", c:"oklch(0.62 0.05 165)", core:"oklch(0.62 0.05 165)" },
  { n:"Гипсофила", q:"2 ветки", id:"default", c:"oklch(0.9 0.014 100)", core:"oklch(0.82 0.02 100)" },
];
const CARE = [
  "Подрежьте стебли под углом 45° на 2–3 см.",
  "Меняйте воду каждые 2 дня, мойте вазу.",
  "Держите вдали от фруктов, сквозняков и прямого солнца.",
  "Удаляйте увядшие листья ниже уровня воды.",
];
const WHOM = ["Маме","Любимой","Коллеге","Подруге","Жене","Без повода"];
const REVIEWS = [
  { n:"Мария С.", d:"2 недели назад", s:5, t:"Заказывала маме на юбилей. Прислали фото перед доставкой — букет ещё пышнее, чем на сайте. Стоял 9 дней!", photos:2 },
  { n:"Дмитрий К.", d:"месяц назад", s:5, t:"Собрал за час, привезли точно в слот 16:00–18:00. Пионы свежие, упаковка аккуратная. Жена в восторге.", photos:1 },
  { n:"Анна В.", d:"месяц назад", s:4, t:"Красивый букет, но хотелось чуть больше зелени. В остальном всё на высоте, открытка от руки — приятная мелочь.", photos:0 },
  { n:"Игорь П.", d:"2 месяца назад", s:5, t:"Анонимная доставка сработала идеально — получательница так и не узнала отправителя 😄 Сервис топ.", photos:2 },
];
const RELATED = [
  { n:"Невский букет", c:"Кустовые розы, фрезия", p:4200, o:0, tag:["new","Новинка"] },
  { n:"Нежность в коробке", c:"Пионовидные розы", p:5800, o:6900, tag:["sale","−16%"] },
  { n:"Летнее поле", c:"Сезонный микс", p:3400, o:0, tag:["hit","Хит"] },
  { n:"Свадебный пион", c:"Розы, гипсофила", p:6500, o:0, tag:null },
];

/* ---------------- icons ---------------- */
const I = {
  search:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>,
  heart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 4.8 3.5 3.3 6.5C19 15.5 12 20 12 20Z"/></svg>,
  user:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 3.2-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/></svg>,
  cart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L5.6 4.8A1 1 0 0 0 4.6 4H3"/><circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="20" r="1.1" fill="currentColor" stroke="none"/></svg>,
  star:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>,
  zoom:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3M11 8v6M8 11h6"/></svg>,
  truck:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  camera:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>,
  leaf:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>,
  shield:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>,
  clock:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  card:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>,
  eyeoff:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9 9 0 0 1 21 12a14 14 0 0 1-2.3 3M6.1 6.2A14 14 0 0 0 3 12a9 9 0 0 0 12 5"/></svg>,
};
const Stars = ({n=5})=><span className="stars">{Array.from({length:5}).map((_,i)=><span key={i} style={{opacity:i<n?1:.25}}>{I.star}</span>)}</span>;
const PH = ({label, style, cls=""})=>(<div className={"ph "+cls} style={style}><span className="lbl">{label}</span></div>);

/* ---- minimalist cartoon flower heads ---- */
function ring(key, count, dist, prx, pry, fill, stroke, phase){
  const out = [];
  for(let i=0;i<count;i++){ const deg=(i/count)*360+(phase||0);
    out.push(<g key={key+i} transform={`rotate(${deg})`}><ellipse cx="0" cy={-dist} rx={prx} ry={pry} fill={fill} stroke={stroke} strokeWidth={stroke==="none"?0:Math.max(0.6,pry*0.08)}/></g>);
  }
  return out;
}
function FlowerHead({ p, x, y, R }){
  const c=p.c, core=p.core, id=p.id, st="oklch(0 0 0 / .13)", lite="oklch(1 0 0 / .24)";
  let el=[];
  if(id==="peony") el=[...ring("a",9,R*0.55,R*0.42,R*0.52,c,st,0),...ring("b",7,R*0.32,R*0.34,R*0.42,c,st,20),...ring("cc",6,R*0.18,R*0.26,R*0.32,lite,"none",0),<circle key="z" r={R*0.16} fill={core}/>];
  else if(id==="ranunculus") el=[...ring("a",11,R*0.62,R*0.26,R*0.36,c,st,0),...ring("b",9,R*0.42,R*0.22,R*0.3,c,st,16),...ring("cc",7,R*0.24,R*0.2,R*0.26,lite,"none",8),<circle key="z" r={R*0.12} fill={core}/>];
  else if(id==="sprayrose") el=[<circle key="bg" r={R*0.92} fill={c} stroke={st} strokeWidth="1"/>,...ring("a",5,R*0.46,R*0.36,R*0.46,c,st,0),...ring("b",4,R*0.24,R*0.3,R*0.34,lite,"none",30),<path key="sp" d={`M 0 ${-R*0.2} A ${R*0.2} ${R*0.2} 0 1 1 ${-R*0.17} ${R*0.07}`} fill="none" stroke={core} strokeWidth={R*0.11} strokeLinecap="round"/>];
  else if(id==="hydrangea"){ const flo=(fx,fy,s,kk)=>[<g key={"f"+kk} transform={`translate(${fx} ${fy})`}>{ring("p"+kk,4,s*0.5,s*0.42,s*0.42,c,st,45)}<circle r={s*0.18} fill={core}/></g>]; el=[...flo(0,0,R*0.95,0),...flo(R*0.55,-R*0.2,R*0.7,1),...flo(-R*0.5,-R*0.3,R*0.7,2),...flo(R*0.15,R*0.6,R*0.65,3),...flo(-R*0.45,R*0.42,R*0.6,4)]; }
  else if(id==="eustoma") el=[...ring("a",5,R*0.5,R*0.5,R*0.56,c,st,0),...ring("b",5,R*0.28,R*0.28,R*0.34,lite,"none",36),<circle key="z" r={R*0.2} fill={core}/>,...ring("d",6,R*0.16,R*0.05,R*0.14,"oklch(0.95 0.09 95)","none",0)];
  else if(id==="chrys") el=[...ring("a",18,R*0.55,R*0.1,R*0.62,c,st,0),...ring("b",14,R*0.4,R*0.1,R*0.5,c,st,13),...ring("cc",10,R*0.24,R*0.09,R*0.34,lite,"none",18),<circle key="z" r={R*0.15} fill={core}/>];
  else if(id==="leaf") el=[<line key="st" x1="0" y1={R*0.85} x2="0" y2={-R*0.85} stroke={c} strokeWidth={Math.max(1,R*0.1)} strokeLinecap="round"/>,...[-0.5,-0.15,0.2,0.55].map((t,j)=>{const ly=t*R,sx=(j%2?1:-1)*R*0.26; return <ellipse key={"l"+j} cx={sx} cy={ly} rx={R*0.2} ry={R*0.36} fill={c} transform={`rotate(${j%2?38:-38} ${sx} ${ly})`}/>;})];
  else el=[...ring("a",6,R*0.5,R*0.4,R*0.52,c,st,0),...ring("b",6,R*0.28,R*0.3,R*0.4,lite,"none",30),<circle key="z" r={R*0.18} fill={core}/>];
  return <g transform={`translate(${x} ${y})`}>{el}</g>;
}
const FlowerIcon = ({c,core,id,size=24,R=10})=>(<svg viewBox="0 0 24 24" width={size} height={size} style={{overflow:"visible",flex:"none"}}><FlowerHead p={{c,core,id}} x={12} y={12} R={R}/></svg>);

/* ---------------- app ---------------- */
function App(){
  const [thumb, setThumb] = useState(0);
  const [size, setSize] = useState("M");
  const [occasion, setOccasion] = useState("birthday");
  const [cardOn, setCardOn] = useState(true);
  const [cardDesign, setCardDesign] = useState("mini");
  const [cardText, setCardText] = useState("");
  const [anon, setAnon] = useState(false);
  const [addons, setAddons] = useState({});
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const sizeObj = SIZES.find(s=>s.id===size);
  const addonsTotal = ADDONS.reduce((a,x)=> a + (addons[x.id]? x.price:0), 0);
  const unit = sizeObj.price + addonsTotal;
  const total = unit * qty;
  const oldTotal = (sizeObj.old? sizeObj.old : sizeObj.price) * qty + addonsTotal*qty;
  const save = sizeObj.old ? (sizeObj.old - sizeObj.price)*qty : 0;
  const points = Math.round(total*0.05);

  const toggleAddon = id => setAddons(a=>({...a,[id]:!a[id]}));
  const addToCart = ()=>{ setAdded(true); };
  useEffect(()=>{ setAdded(false); }, [size, qty, JSON.stringify(addons), occasion]);

  return (
    <div className="app">
      <div className="announce"><div className="ann-left"><span className="ann-deco"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg></span><span className="ann-promo"><b>−10%</b> на первый букет</span><span className="ann-badge">новым клиентам</span><button className="ann-code" onClick={e=>{if(navigator.clipboard)navigator.clipboard.writeText('БУТОН10');const t=e.currentTarget;t.classList.add('copied');setTimeout(()=>t.classList.remove('copied'),1400);}}>БУТОН10<span className="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span className="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button></div><div className="ann-trust"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span></div></div>
      <header className="site">
        <div className="site-in">
          <a className="logo" href="Витрина.html" style={{textDecoration:"none",color:"inherit"}}><span className="mark"></span>Бутон</a>
          <nav className="main">
            <a href="Витрина.html">Главная</a><a href="Каталог.html" className="on">Каталог</a><a href="Конструктор букета.html">Конструктор</a>
            <a href="Доставка.html">Доставка</a><a href="Подписка.html">Подписка</a><a href="Подарочные карты.html">Подарочные</a>
          </nav>
          <div className="site-tools">
            <a className="icobtn" href="Каталог.html">{I.search}</a>
            <a className="icobtn" href="cabinet/Избранное.html">{I.heart}</a>
            <a className="icobtn" href="cabinet/Личный кабинет.html">{I.user}</a>
            <a className="icobtn" href="Оформление заказа.html">{I.cart}<span className="badge">2</span></a>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="crumbs">
          <a href="Витрина.html">Главная</a><span className="sep">/</span>
          <a href="Каталог.html">Каталог</a><span className="sep">/</span>
          <a href="Каталог.html">Авторские</a><span className="sep">/</span><span>Белые ночи</span>
        </div>

        <div className="pdp">
          {/* GALLERY */}
          <div className="gallery">
            <PH cls="gmain" label="ФОТО БУКЕТА · 4:5"
              style={{position:"relative"}}>
            </PH>
            <div className="gthumbs">
              {["общий","сверху","деталь","упаковка","в руке"].map((t,i)=>(
                <div key={i} className={"gthumb"+(thumb===i?" on":"")} onClick={()=>setThumb(i)}>
                  <PH label={t} cls="" style={{position:"absolute",inset:0,borderRadius:9}}/>
                </div>
              ))}
            </div>
          </div>

          {/* BUY */}
          <div className="buy">
            <div className="rating">
              <Stars n={5}/><b style={{color:"var(--ink)"}}>4.9</b>
              <a href="#reviews">213 отзывов</a>
              <span className="dot" style={{color:"var(--ink-faint)"}}>·</span>
              <span style={{color:"var(--green-soft)",fontWeight:600}}>В наличии · соберём за 2 часа</span>
            </div>
            <h1 className="ptitle serif">Белые ночи</h1>
            <p className="psub">Воздушная композиция из пионов и ранункулюса с серебристым эвкалиптом — нежная и тихая, как петербургское лето.</p>

            <div className="trust-strip">
              <span className="t">{I.camera} Фото перед доставкой</span>
              <span className="t">{I.leaf} Свежесть 7 дней</span>
              <span className="t">{I.shield} Замена при браке</span>
            </div>

            <div className="pricerow">
              <span className="now serif tnum">{fmt(total)} ₽</span>
              {sizeObj.old>0 && <span className="old tnum">{fmt(oldTotal)} ₽</span>}
              {save>0 && <span className="save">Выгода {fmt(save)} ₽</span>}
            </div>

            {/* SIZE */}
            <div className="block">
              <div className="bh"><span className="bt">Размер букета</span><span className="bhint">влияет на пышность и цену</span></div>
              <div className="sizes">
                {SIZES.map(s=>(
                  <button key={s.id} className={"size"+(size===s.id?" on":"")} onClick={()=>setSize(s.id)}>
                    {s.rec && <span className="rec">Выбор гостей</span>}
                    <div className="sz">{s.name.split(" · ")[0]}</div>
                    <div className="sd">{s.desc}</div>
                    <div className="sp tnum">{fmt(s.price)} ₽</div>
                  </button>
                ))}
              </div>
            </div>

            {/* OCCASION */}
            <div className="block">
              <div className="bh"><span className="bt">Повод</span><span className="bhint">подберём открытку и тон</span></div>
              <div className="chips">
                {OCCASIONS.map(o=>(
                  <button key={o.id} className={"opt"+(occasion===o.id?" on":"")} onClick={()=>setOccasion(o.id)}>
                    {o.em && <span className="em">{o.em}</span>}{o.name}
                  </button>
                ))}
              </div>
            </div>

            {/* POSTCARD */}
            <div className="block">
              <div className={"switch"+(cardOn?" on":"")} onClick={()=>setCardOn(v=>!v)}>
                <div className="sw-txt">
                  <div className="st">{I.card} Открытка с текстом</div>
                  <div className="sd">Напишем от руки и вложим в букет — бесплатно</div>
                </div>
                <div className="toggle"></div>
              </div>
              {cardOn && (
                <div className="cardbox">
                  <div className="carddesigns">
                    {CARD_DESIGNS.map(d=>(
                      <div key={d.id} className={"carddesign"+(cardDesign===d.id?" on":"")} onClick={()=>setCardDesign(d.id)} style={{color:"var(--clay)"}}>{d.em}</div>
                    ))}
                    <div style={{alignSelf:"center",fontSize:12.5,color:"var(--ink-faint)"}}>дизайн открытки</div>
                  </div>
                  <textarea className="cardtext" maxLength={200} placeholder="Например: «С днём рождения! Пусть каждый день будет таким же светлым, как эти цветы.»" value={cardText} onChange={e=>setCardText(e.target.value)}></textarea>
                  <div className="cardmeta"><span>Почерк флориста, чёрные чернила</span><span className="tnum">{cardText.length}/200</span></div>
                </div>
              )}
              <div className="anon-note"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9 9 0 0 1 21 12a14 14 0 0 1-2.3 3M6.1 6.2A14 14 0 0 0 3 12a9 9 0 0 0 12 5"/></svg><span>Анонимную доставку можно включить при оформлении заказа</span></div>
            </div>

            {/* ADDONS */}
            <div className="block">
              <div className="bh"><span className="bt">Дополнить букет</span><span className="bhint">по желанию</span></div>
              <div className="addons">
                {ADDONS.map(a=>(
                  <div key={a.id} className={"addon"+(addons[a.id]?" on":"")}>
                    <PH label="" cls="am" style={{background:a.color}}/>
                    <div className="ai"><div className="an">{a.name}</div><div className="ap tnum">+{fmt(a.price)} ₽</div></div>
                    <button className={"addbtn"+(addons[a.id]?" on":"")} onClick={()=>toggleAddon(a.id)}>{addons[a.id]?"✓":"+"}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* PURCHASE */}
            <div className="purchase">
              <div className="qty">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                <span className="qn tnum">{qty}</span>
                <button onClick={()=>setQty(q=>Math.min(20,q+1))}>+</button>
              </div>
              {added ? (
                <a className="btn-primary" href="Оформление заказа.html" style={{textDecoration:"none"}}>Перейти в корзину →</a>
              ) : (
                <button className="btn-primary" onClick={addToCart}>В корзину<span className="pr tnum">{fmt(total)} ₽</span></button>
              )}
              <button className={"icon-square"+(wished?" on":"")} onClick={()=>setWished(w=>!w)}>{I.heart}</button>
            </div>
            <div className="loyal-line">{I.star}<span>Вернём <b>{fmt(points)} {plural(points,['балл','балла','баллов'])}</b> — оплатите ими до 30% следующего заказа</span></div>
            <div className="deliv-note">{I.truck}<span>Доставим <b style={{color:"var(--ink)"}}>сегодня к 18:00</b>, если оформите до 16:00. Перед отправкой пришлём фото готового букета в WhatsApp.</span></div>
          </div>
        </div>

        {/* ===== LOWER SECTIONS ===== */}
        <div className="sections">
          <section>
            <div className="specgrid">
              {[["19","стеблей"],["45 см","высота"],["35 см","диаметр"],["≈1,2 кг","вес"],["Плёнка","упаковка"],["7 дней","свежесть"]].map((s,i)=>(
                <div className="sc" key={i}><div className="sv">{s[0]}</div><div className="sk">{s[1]}</div></div>
              ))}
            </div>
          </section>

          <div className="compo-group">
          <div className="two">
            <section className="panelcard">
              <div className="sec-title serif" style={{fontSize:22,marginBottom:14}}>Состав</div>
              <div className="complist">
                {COMPOSITION.map((c,i)=>(
                  <div className="comp" key={i}><FlowerIcon c={c.c} core={c.core} id={c.id} size={26} R={11} /><span className="cn">{c.n}</span><span className="cq">{c.q}</span></div>
                ))}
              </div>
            </section>
            <section className="panelcard">
              <div className="sec-title serif" style={{fontSize:22,marginBottom:14}}>Уход за букетом</div>
              <div className="carelist">
                {CARE.map((c,i)=>(<div className="care" key={i}><span className="num">{i+1}</span><span>{c}</span></div>))}
              </div>
            </section>
          </div>
            <div className="whom-strip">
              <span className="whom-lbl"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:"-2px",marginRight:5,color:"var(--clay)"}}><circle cx="12" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><circle cx="12" cy="12" r="2.6"/></svg>Идеально в подарок</span>
              {WHOM.map((w,i)=>(<span className={"wchip wc"+(i%5)} key={i}>{w}</span>))}
            </div>
          </div>

          {/* REVIEWS */}
          <section id="reviews">
            <div className="sec-title serif">Отзывы · 213</div>
            <div className="rev-head">
              <div className="rev-score">
                <div className="big serif">4.9</div>
                <div><Stars n={5}/><div style={{fontSize:13,color:"var(--ink-faint)",marginTop:4}}>на основе 213 оценок</div></div>
              </div>
              <div className="rev-bars">
                {[[5,89],[4,8],[3,2],[2,1],[1,0]].map(([s,p])=>(
                  <div className="rev-bar" key={s}><span>{s}★</span><span className="track"><span className="fill" style={{width:p+"%"}}></span></span><span className="tnum">{p}%</span></div>
                ))}
              </div>
              <button className="ghost-btn" style={{height:44,marginLeft:"auto"}}>Оставить отзыв</button>
            </div>
            <div className="revgrid">
              {REVIEWS.map((r,i)=>(
                <div className="review" key={i}>
                  <div className="rt">
                    <div className="av">{r.n[0]}</div>
                    <div><div className="rn">{r.n}</div><div className="rd">{r.d}</div></div>
                    <Stars n={r.s}/>
                  </div>
                  <p>{r.t}</p>
                  {r.photos>0 && (
                    <div className="rphotos">
                      {Array.from({length:r.photos}).map((_,j)=>(
                        <div className="rphoto" key={j}><PH label="фото" style={{position:"absolute",inset:0,borderRadius:9}}/></div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* RELATED */}
          <section>
            <div className="sec-title serif">С этим букетом заказывают</div>
            <div className="cards">
              {RELATED.map((p,i)=>(
                <div className="pcard" key={i}>
                  <div className="pm">
                    <PH label="фото букета" style={{position:"absolute",inset:0}}/>
                    {p.tag && <span className={"tag "+p.tag[0]}>{p.tag[1]}</span>}
                    <button className="like">{I.heart}</button>
                  </div>
                  <div className="pb">
                    <div className="pn">{p.n}</div>
                    <div className="pc">{p.c}</div>
                    <div className="pp"><span className="n tnum">{fmt(p.p)} ₽</span>{p.o>0 && <span className="o tnum">{fmt(p.o)} ₽</span>}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* mobile sticky */}
      <div className="mbar">
        <div className="mp"><span className="k">{sizeObj.name.split(" · ")[0]} · {qty} шт</span><span className="v serif tnum">{fmt(total)} ₽</span></div>
        {added ? <a className="btn-primary" href="Оформление заказа.html" style={{textDecoration:"none"}}>Перейти в корзину →</a> : <button className="btn-primary" onClick={addToCart}>В корзину</button>}
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
