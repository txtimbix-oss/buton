const { useState, useMemo, useEffect, useRef } = React;

/* ============================ DATA ============================ */
const FLOWERS = [
  { id:"peony",     name:"Пионы",          price:450, color:"oklch(0.84 0.07 18)",  core:"oklch(0.72 0.1 22)" },
  { id:"ranunculus",name:"Ранункулюс",     price:180, color:"oklch(0.93 0.05 88)",  core:"oklch(0.82 0.09 75)" },
  { id:"sprayrose", name:"Кустовая роза",  price:220, color:"oklch(0.66 0.13 32)",  core:"oklch(0.54 0.14 30)" },
  { id:"hydrangea", name:"Гортензия",      price:520, color:"oklch(0.78 0.07 250)", core:"oklch(0.68 0.09 250)" },
  { id:"tulip",     name:"Тюльпаны",       price:120, color:"oklch(0.7 0.14 12)",   core:"oklch(0.58 0.15 10)" },
  { id:"eustoma",   name:"Эустома",        price:190, color:"oklch(0.8 0.06 320)",  core:"oklch(0.7 0.08 320)" },
  { id:"chrys",     name:"Хризантема",     price:150, color:"oklch(0.88 0.08 120)", core:"oklch(0.78 0.1 125)" },
  { id:"matiola",   name:"Маттиола",       price:160, color:"oklch(0.82 0.05 300)", core:"oklch(0.72 0.07 300)" },
];
const GREENS = [
  { id:"euca",  name:"Эвкалипт",  desc:"серебристый",  price:80, color:"oklch(0.74 0.04 165)" },
  { id:"ruscus",name:"Рускус",    desc:"глянцевый",    price:60, color:"oklch(0.55 0.07 150)" },
  { id:"pista", name:"Фисташка",  desc:"фактурная",    price:90, color:"oklch(0.6 0.08 135)" },
  { id:"gyp",   name:"Гипсофила", desc:"облачко",      price:70, color:"oklch(0.95 0.01 100)" },
];
const WRAPS = [
  { id:"kraft", name:"Крафт-бумага",  desc:"тёплая, ремесленная", price:150, paper:"oklch(0.74 0.05 70)" },
  { id:"film",  name:"Корейская плёнка", desc:"матовая, нежная", price:250, paper:"oklch(0.9 0.02 60)" },
  { id:"box",   name:"Шляпная коробка", desc:"держит форму",     price:600, paper:"oklch(0.42 0.04 40)" },
  { id:"none",  name:"Без упаковки",  desc:"только лента",        price:0,   paper:"oklch(0.88 0.012 80)" },
];
const RIBBONS = [
  { id:"ivory", name:"Айвори",      color:"oklch(0.92 0.02 85)",  price:0 },
  { id:"dusty", name:"Пыльная роза",color:"oklch(0.76 0.06 20)",  price:0 },
  { id:"moss",  name:"Мох",         color:"oklch(0.5 0.06 150)",  price:0 },
  { id:"bordo", name:"Бордо",       color:"oklch(0.42 0.12 25)",  price:50 },
  { id:"none",  name:"Без ленты",   color:"transparent",          price:0 },
];
const PRESETS = [
  { id:"tender",  name:"Нежный",     flowers:{peony:5, ranunculus:5, eustoma:3}, greens:["euca"],        wrap:"film",  ribbon:"ivory" },
  { id:"bright",  name:"Яркий",      flowers:{tulip:9, sprayrose:6, chrys:3},    greens:["pista"],        wrap:"kraft", ribbon:"dusty" },
  { id:"minimal", name:"Минимализм", flowers:{hydrangea:3, eustoma:4},           greens:["euca"],         wrap:"none",  ribbon:"moss" },
  { id:"peony",   name:"Пионовый",   flowers:{peony:9, matiola:5},               greens:["euca","gyp"],   wrap:"box",   ribbon:"bordo" },
];
const fmt = n => n.toLocaleString("ru-RU");
const plural = (n,[one,few,many]) => { const a=Math.abs(n)%100, b=a%10; if(a>10&&a<20) return many; if(b>1&&b<5) return few; if(b===1) return one; return many; };

/* ============================ ICONS ============================ */
const I = {
  search:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>,
  heart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 4.8 3.5 3.3 6.5C19 15.5 12 20 12 20Z"/></svg>,
  user:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 3.2-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/></svg>,
  cart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L5.6 4.8A1 1 0 0 0 4.6 4H3"/><circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="20" r="1.1" fill="currentColor" stroke="none"/></svg>,
  check:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-10"/></svg>,
  spark:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg>,
  info:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
  flower:<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C12 6 13.5 4 15 4s1.4 3.6-.6 5.6M12 14.4c0 3.6 1.5 5.6 3 5.6s1.4-3.6-.6-5.6M9.6 12C6 12 4 10.5 4 9s3.6-1.4 5.6.6M14.4 12c3.6 0 5.6 1.5 5.6 3s-3.6 1.4-5.6-.6"/></svg>,
  truck:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  camera:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>,
  leaf:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13ZM5 19c2-5 5-8 9-10"/></svg>,
};

/* ---- minimalist cartoon flower heads ---- */
function ring(key, count, dist, prx, pry, fill, stroke, phase){
  const out = [];
  for(let i=0;i<count;i++){
    const deg = (i/count)*360 + (phase||0);
    out.push(<g key={key+i} transform={`rotate(${deg})`}>
      <ellipse cx="0" cy={-dist} rx={prx} ry={pry} fill={fill} stroke={stroke} strokeWidth={stroke==="none"?0:Math.max(0.6,pry*0.08)}/>
    </g>);
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
  } else if(id==="ranunculus"){
    el = [...ring("a",11, R*0.62, R*0.26, R*0.36, c, st, 0), ...ring("b",9, R*0.42, R*0.22, R*0.3, c, st, 16), ...ring("c",7, R*0.24, R*0.2, R*0.26, lite, "none", 8), <circle key="cc" r={R*0.12} fill={core}/>];
  } else if(id==="sprayrose"){
    el = [<circle key="bg" r={R*0.92} fill={c} stroke={st} strokeWidth="1"/>, ...ring("a",5, R*0.46, R*0.36, R*0.46, c, st, 0), ...ring("b",4, R*0.24, R*0.3, R*0.34, lite, "none", 30), <path key="sp" d={`M 0 ${-R*0.2} A ${R*0.2} ${R*0.2} 0 1 1 ${-R*0.17} ${R*0.07}`} fill="none" stroke={core} strokeWidth={R*0.11} strokeLinecap="round"/>];
  } else if(id==="tulip"){
    el = [...ring("a",3, R*0.34, R*0.5, R*0.74, c, st, 0), ...ring("b",3, R*0.2, R*0.3, R*0.52, lite, "none", 60)];
  } else if(id==="hydrangea"){
    const flo = (fx,fy,s,kk)=>[<g key={"f"+kk} transform={`translate(${fx} ${fy})`}>{ring("p"+kk,4, s*0.5, s*0.42, s*0.42, c, st, 45)}<circle r={s*0.18} fill={core}/></g>];
    el = [...flo(0,0,R*0.95,0), ...flo(R*0.55,-R*0.2,R*0.7,1), ...flo(-R*0.5,-R*0.3,R*0.7,2), ...flo(R*0.15,R*0.6,R*0.65,3), ...flo(-R*0.45,R*0.42,R*0.6,4)];
  } else if(id==="eustoma"){
    el = [...ring("a",5, R*0.5, R*0.5, R*0.56, c, st, 0), ...ring("b",5, R*0.28, R*0.28, R*0.34, lite, "none", 36), <circle key="cc" r={R*0.2} fill={core}/>, ...ring("d",6, R*0.16, R*0.05, R*0.14, "oklch(0.95 0.09 95)", "none", 0)];
  } else if(id==="chrys"){
    el = [...ring("a",18, R*0.55, R*0.1, R*0.62, c, st, 0), ...ring("b",14, R*0.4, R*0.1, R*0.5, c, st, 13), ...ring("c",10, R*0.24, R*0.09, R*0.34, lite, "none", 18), <circle key="cc" r={R*0.15} fill={core}/>];
  } else {
    el = [...ring("a",6, R*0.5, R*0.4, R*0.52, c, st, 0), ...ring("b",6, R*0.28, R*0.3, R*0.4, lite, "none", 30), <circle key="cc" r={R*0.18} fill={core}/>];
  }
  return <g transform={`translate(${x} ${y})`}>{el}</g>;
}

/* ===================== BOUQUET PREVIEW (top view) ===================== */
function BouquetPreview({ heads, greens, wrap, ribbon }){
  // phyllotaxis packing of flower heads
  const N = heads.length;
  const cx = 200, cy = 195;
  const headR = N === 0 ? 0 : Math.max(13, Math.min(34, 132 / Math.sqrt(N)));
  const spread = N === 0 ? 0 : headR * Math.sqrt(N) * 0.9;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const placed = heads.map((h, i) => {
    const r = N === 1 ? 0 : spread * Math.sqrt((i + 0.5) / N);
    const a = i * golden;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), c: h.color, core: h.core, id: h.id, k: i };
  });
  // draw bigger heads last? keep order; render greenery first behind
  const collarR = spread + headR * 0.7 + 20;
  const wrapPaper = wrap ? wrap.paper : null;
  const showWrap = wrap && wrap.id !== "none";
  const ribCol = ribbon && ribbon.id !== "none" ? ribbon.color : null;

  // greenery sprigs around the rim
  const sprigs = [];
  if (N > 0 && greens.length){
    const count = 7 + greens.length * 4;
    for (let i = 0; i < count; i++){
      const g = greens[i % greens.length];
      const a = (i / count) * Math.PI * 2 + 0.3;
      const rr = spread + headR * 0.55;
      sprigs.push({ x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a), a:(a*180/Math.PI)+90, c:g.color, k:i });
    }
  }

  return (
    <svg viewBox="0 0 400 400" aria-label="Превью букета">
      <defs>
        <radialGradient id="vig" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="oklch(1 0 0 / 0)"/>
          <stop offset="100%" stopColor="oklch(0.4 0.02 70 / .07)"/>
        </radialGradient>
      </defs>

      {/* wrap collar behind */}
      {showWrap && N > 0 && (
        <g>
          <circle cx={cx} cy={cy} r={collarR} fill={wrapPaper} opacity="0.95"/>
          <circle cx={cx} cy={cy} r={collarR} fill="none" stroke="oklch(0 0 0 / .08)" strokeWidth="1"/>
          {/* paper facets */}
          {Array.from({length:14}).map((_,i)=>{
            const a=(i/14)*Math.PI*2; 
            return <line key={i} x1={cx} y1={cy} x2={cx+collarR*Math.cos(a)} y2={cy+collarR*Math.sin(a)} stroke="oklch(0 0 0 / .06)" strokeWidth="1"/>;
          })}
        </g>
      )}

      {/* greenery sprigs */}
      {sprigs.map(s=>(
        <g key={"g"+s.k} transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}>
          <line x1="0" y1="15" x2="0" y2="-21" stroke={s.c} strokeWidth="1.6" strokeLinecap="round"/>
          {[-13,-5,3,11].map((ly,j)=>{const sx=j%2?4.5:-4.5; return <ellipse key={j} cx={sx} cy={ly} rx="3.2" ry="6" fill={s.c} opacity="0.92" transform={`rotate(${j%2?34:-34} ${sx} ${ly})`}/>;})}
        </g>
      ))}

      {/* cartoon flower heads */}
      {placed.map(p=>(<FlowerHead key={p.k} p={p} x={p.x} y={p.y} R={headR}/>))}

      {/* ribbon accent ring */}
      {ribCol && N > 0 && showWrap && (
        <circle cx={cx} cy={cy} r={collarR-7} fill="none" stroke={ribCol} strokeWidth="6" strokeDasharray="2 0" opacity="0.92"/>
      )}
      {ribCol && N > 0 && !showWrap && (
        <circle cx={cx} cy={cy} r={spread+headR*0.5+8} fill="none" stroke={ribCol} strokeWidth="5" opacity="0.9"/>
      )}

      <rect x="0" y="0" width="400" height="400" fill="url(#vig)" pointerEvents="none"/>
    </svg>
  );
}

/* ============================ UI atoms ============================ */
function Stepper({ q, onAdd, onSub, max }){
  if (q === 0) return <button className="add-pill" onClick={onAdd}>+ Добавить</button>;
  return (
    <div className="stepper">
      <button onClick={onSub}>−</button>
      <span className="qv tnum">{q}</span>
      <button onClick={onAdd} disabled={max && q >= max}>+</button>
    </div>
  );
}

/* ============================ APP ============================ */
const LS = "buton_constructor_v1";
const initial = { flowers:{peony:5, ranunculus:5, eustoma:3}, greens:["euca"], wrap:"film", ribbon:"ivory" };

function App(){
  const [st, setSt] = useState(()=>{
    try{ const s = JSON.parse(localStorage.getItem(LS)); if(s && s.flowers) return s; }catch(e){}
    return initial;
  });
  const [activePreset, setActivePreset] = useState(null);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  useEffect(()=>{ localStorage.setItem(LS, JSON.stringify(st)); setAdded(false); }, [st]);

  const setQ = (id, delta) => { setActivePreset(null); setSt(s=>{
    const cur = s.flowers[id]||0; const next = Math.max(0, Math.min(40, cur+delta));
    const f = {...s.flowers}; if(next===0) delete f[id]; else f[id]=next; return {...s, flowers:f};
  }); };
  const toggleGreen = id => { setActivePreset(null); setSt(s=>({...s, greens: s.greens.includes(id)? s.greens.filter(g=>g!==id): [...s.greens, id]})); };
  const setWrap = id => { setActivePreset(null); setSt(s=>({...s, wrap:id})); };
  const setRibbon = id => { setActivePreset(null); setSt(s=>({...s, ribbon:id})); };
  const applyPreset = p => { setActivePreset(p.id); setSt({ flowers:{...p.flowers}, greens:[...p.greens], wrap:p.wrap, ribbon:p.ribbon }); };
  const reset = () => { setActivePreset(null); setSt({ flowers:{}, greens:[], wrap:"none", ribbon:"none" }); };

  /* derived */
  const stems = useMemo(()=>Object.values(st.flowers).reduce((a,b)=>a+b,0), [st.flowers]);
  const heads = useMemo(()=>{
    const arr=[]; FLOWERS.forEach(f=>{ const q=st.flowers[f.id]||0; for(let i=0;i<q;i++) arr.push(f); });
    // interleave for nicer color mix
    return arr.map((v,i)=>({v,i})).sort((a,b)=> (a.i % 5) - (b.i % 5) || a.i-b.i ).map(o=>o.v);
  }, [st.flowers]);
  const greenObjs = useMemo(()=>GREENS.filter(g=>st.greens.includes(g.id)), [st.greens]);
  const wrapObj = WRAPS.find(w=>w.id===st.wrap) || null;
  const ribbonObj = RIBBONS.find(r=>r.id===st.ribbon) || null;

  const priceFlowers = useMemo(()=>FLOWERS.reduce((a,f)=>a+(st.flowers[f.id]||0)*f.price,0),[st.flowers]);
  const priceGreens = greenObjs.reduce((a,g)=>a+g.price,0);
  const priceWrap = wrapObj? wrapObj.price : 0;
  const priceRibbon = ribbonObj? ribbonObj.price : 0;
  const total = priceFlowers + priceGreens + priceWrap + priceRibbon;
  const points = Math.round(total*0.05);
  const height = stems===0?0: Math.round(38 + Math.min(28, stems*0.9));
  const size = stems===0? "—" : stems<=9? "S" : stems<=18? "M" : "L";

  const handleAdd = () => { if(stems===0) return; setAdded(true); };

  return (
    <div className="app">
      <div className="announce"><div className="ann-left"><span className="ann-deco"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg></span><span className="ann-promo"><b>−10%</b> на первый букет</span><span className="ann-badge">новым клиентам</span><button className="ann-code" onClick={e=>{if(navigator.clipboard)navigator.clipboard.writeText('БУТОН10');const t=e.currentTarget;t.classList.add('copied');setTimeout(()=>t.classList.remove('copied'),1400);}}>БУТОН10<span className="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span className="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button></div><div className="ann-trust"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span></div></div>
      <header className="site">
        <div className="site-in">
          <a className="logo" href="Витрина.html" style={{textDecoration:"none",color:"inherit"}}><span className="mark"></span>Бутон</a>
          <nav className="main">
            <a href="Витрина.html">Главная</a><a href="Каталог.html">Каталог</a><a href="Конструктор букета.html" className="on">Конструктор</a>
            <a href="Доставка.html">Доставка</a><a href="Подписка.html">Подписка</a><a href="Подарочные карты.html">Подарочные</a>
          </nav>
          <div className="site-tools">
            <button className="icobtn">{I.search}</button>
            <button className="icobtn">{I.heart}</button>
            <a className="icobtn" href="cabinet/Личный кабинет.html">{I.user}</a>
            <button className="icobtn">{I.cart}<span className="badge">2</span></button>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="crumbs"><a href="#">Главная</a><span className="sep">/</span><a href="#">Каталог</a><span className="sep">/</span><span>Конструктор</span></div>

        <div className="head">
          <div>
            <div className="craft">Цветочная мастерская · СПб</div>
            <h1 className="serif">Соберите свой <em>букет</em></h1>
            <p className="sub">Выбирайте цветы поштучно, добавляйте зелень и упаковку — цена пересчитывается вживую. Или начните с готовой основы.</p>
          </div>
        </div>

        <div className="presets">
          <span className="lab">Соберём за вас:</span>
          {PRESETS.map(p=>(
            <button key={p.id} className={"preset"+(activePreset===p.id?" on":"")} onClick={()=>applyPreset(p)}>
              <span className="sw">{Object.keys(p.flowers).slice(0,3).map(fid=>{
                const f=FLOWERS.find(x=>x.id===fid); return <i key={fid} style={{background:f.color}}></i>;
              })}</span>
              {p.name}
            </button>
          ))}
          <button className="preset" onClick={reset} style={{color:"var(--ink-faint)"}}>Очистить</button>
        </div>

        <div className="work">
          {/* ---------- LEFT: PREVIEW + BILL ---------- */}
          <aside className="panel">
            <div className="preview-card">
              <div className="stage">
                <div className="sizebadge">Размер <b>{size}</b>{stems>0 && <span style={{color:"var(--ink-faint)",fontWeight:400}}>· {stems} ст.</span>}</div>
                {stems===0 ? (
                  <div className="empty">
                    <div className="ring">{I.flower}</div>
                    Начните добавлять цветы —<br/>букет соберётся здесь
                  </div>
                ) : <BouquetPreview heads={heads} greens={greenObjs} wrap={wrapObj} ribbon={ribbonObj} />}
              </div>

              {stems>0 && (
                <div className="compose">
                  {FLOWERS.filter(f=>st.flowers[f.id]).map(f=>(
                    <span className="chip" key={f.id}>
                      <i style={{background:f.color}}></i>{f.name} · <b>{st.flowers[f.id]}</b>
                      <button className="x" onClick={()=>setQ(f.id,-99)}>×</button>
                    </span>
                  ))}
                </div>
              )}

              <div className="spec">
                <div className="s"><div className="v tnum">{stems}</div><div className="k">{plural(stems,['стебель','стебля','стеблей'])}</div></div>
                <div className="s"><div className="v tnum">{height||"—"}{height?" см":""}</div><div className="k">высота</div></div>
                <div className="s"><div className="v">{wrapObj && wrapObj.id!=="none"? "Да":"—"}</div><div className="k">упаковка</div></div>
              </div>

              <div className="bill">
                <div className="row"><span>Цветы · {stems} шт</span><span className="tnum">{fmt(priceFlowers)} ₽</span></div>
                <div className={"row"+(priceGreens?"":" muted")}><span>Зелень · {greenObjs.length}</span><span className="tnum">{priceGreens?fmt(priceGreens)+" ₽":"—"}</span></div>
                <div className={"row"+(priceWrap?"":" muted")}><span>{wrapObj?wrapObj.name:"Упаковка"}</span><span className="tnum">{priceWrap?fmt(priceWrap)+" ₽":"—"}</span></div>
                <div className={"row"+(priceRibbon?"":" muted")}><span>Лента{ribbonObj&&ribbonObj.id!=="none"?" · "+ribbonObj.name.toLowerCase():""}</span><span className="tnum">{priceRibbon?fmt(priceRibbon)+" ₽":"бесплатно"}</span></div>
                <div className="tot"><span className="l">Итого</span><span className="p tnum">{fmt(total)} ₽</span></div>

                <div className="loyal">{I.spark}<span>Вернём <b>{fmt(points)} {plural(points,['балл','балла','баллов'])}</b> на счёт после доставки</span></div>

                <div className="cta">
                  {added ? (
                    <a className="btn-primary" href="Оформление заказа.html" style={{textDecoration:"none"}}>Перейти в корзину →</a>
                  ) : (
                    <button className="btn-primary" onClick={handleAdd} disabled={stems===0}>В корзину<span className="pr tnum">{fmt(total)} ₽</span></button>
                  )}
                  <button className={"icon-square"+(wished?" on":"")} onClick={()=>setWished(w=>!w)} aria-label="В избранное">{I.heart}</button>
                </div>
                <div className="assure">
                  <span>{I.truck} Сегодня к 18:00</span>
                  <span>{I.camera} Фото до доставки</span>
                  <span>{I.leaf} Свежесть 7 дней</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ---------- RIGHT: BUILDER ---------- */}
          <div className="builder">
            <section className="section">
              <div className="sec-head"><span className="no">1</span><h3>Цветы</h3><span className="meta">в букете <b>{stems}</b></span></div>
              <div className="sec-body">
                <div className="flowers">
                  {FLOWERS.map(f=>{
                    const q = st.flowers[f.id]||0;
                    return (
                      <div className={"fcard"+(q?" active":"")} key={f.id}>
                        <div className="fhead"><svg viewBox="0 0 44 44" width="44" height="44"><FlowerHead p={{c:f.color, core:f.core, id:f.id}} x={22} y={22} R={17}/></svg></div>
                        <div className="finfo">
                          <div className="n">{f.name}</div>
                          <div className="p"><b>{f.price} ₽</b> / шт</div>
                        </div>
                        <Stepper q={q} onAdd={()=>setQ(f.id,1)} onSub={()=>setQ(f.id,-1)} max={40} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="sec-head"><span className="no">2</span><h3>Зелень и фактура</h3><span className="meta">{greenObjs.length? <>выбрано <b>{greenObjs.length}</b></>:"по желанию"}</span></div>
              <div className="sec-body">
                <div className="tiles">
                  {GREENS.map(g=>{
                    const on = st.greens.includes(g.id);
                    return (
                      <div className={"tile"+(on?" on":"")} key={g.id} onClick={()=>toggleGreen(g.id)}>
                        <div className="check">{I.check}</div>
                        <div className="leaf" style={{background:g.color, opacity:.9}}>{I.leaf}</div>
                        <div className="tt">{g.name}</div>
                        <div className="td">{g.desc}</div>
                        <div className="tp">+{g.price} ₽</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="sec-head"><span className="no">3</span><h3>Упаковка</h3><span className="meta">{wrapObj?wrapObj.name:""}</span></div>
              <div className="sec-body">
                <div className="tiles">
                  {WRAPS.map(w=>{
                    const on = st.wrap===w.id;
                    return (
                      <div className={"tile"+(on?" on":"")} key={w.id} onClick={()=>setWrap(w.id)}>
                        <div className="check">{I.check}</div>
                        <div className="leaf" style={{background:w.paper}}></div>
                        <div className="tt">{w.name}</div>
                        <div className="td">{w.desc}</div>
                        <div className="tp">{w.price?"+"+w.price+" ₽":"бесплатно"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="sec-head"><span className="no">4</span><h3>Лента</h3><span className="meta">{ribbonObj?ribbonObj.name:""}</span></div>
              <div className="sec-body">
                <div className="ribbons">
                  {RIBBONS.map(r=>(
                    <div className={"ribbon"+(st.ribbon===r.id?" on":"")} key={r.id} onClick={()=>setRibbon(r.id)}>
                      <div className="rsw" style={r.id==="none"?{border:"1.5px dashed var(--line-strong)",background:"transparent"}:{background:r.color}}></div>
                      <div className="rn">{r.name}</div>
                    </div>
                  ))}
                </div>
                <div className="note">{I.info}<span>Соберём за 2 часа. Перед отправкой пришлём фото готового букета в WhatsApp — на случай, если захотите что-то поправить.</span></div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* mobile sticky bar */}
      <div className="mbar">
        <div className="mp"><span className="k">{stems} ст · размер {size}</span><span className="v serif tnum">{fmt(total)} ₽</span></div>
        {added ? <a className="btn-primary" href="Оформление заказа.html" style={{textDecoration:"none"}}>Перейти в корзину →</a> : <button className="btn-primary" onClick={handleAdd} disabled={stems===0}>В корзину</button>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
