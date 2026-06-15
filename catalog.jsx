const { useState, useMemo } = React;
const fmt = n => n.toLocaleString("ru-RU");
const plural = (n,[one,few,many]) => { const a=Math.abs(n)%100, b=a%10; if(a>10&&a<20) return many; if(b>1&&b<5) return few; if(b===1) return one; return many; };

const I = {
  search:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>,
  heart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 4.8 3.5 3.3 6.5C19 15.5 12 20 12 20Z"/></svg>,
  user:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 3.2-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/></svg>,
  cart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L5.6 4.8A1 1 0 0 0 4.6 4H3"/><circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="20" r="1.1" fill="currentColor" stroke="none"/></svg>,
  check:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-10"/></svg>,
  plus:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  star:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>,
  filter:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 6h18M6 12h12M10 18h4"/></svg>,
  flower:<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C12 6 13.5 4 15 4s1.4 3.6-.6 5.6M12 14.4c0 3.6 1.5 5.6 3 5.6s1.4-3.6-.6-5.6M9.6 12C6 12 4 10.5 4 9s3.6-1.4 5.6.6M14.4 12c3.6 0 5.6 1.5 5.6 3s-3.6 1.4-5.6-.6"/></svg>,
  x:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>,
};
const PH = ({label, style})=>(<div className="ph" style={style}><span className="lbl">{label}</span></div>);

/* ---- options ---- */
const COLLECTIONS = [["all","Все букеты"],["mono","Монобукеты"],["box","В коробке"],["author","Авторские"],["wed","Свадебные"]];
const OCCAS = [["birthday","День рождения"],["love","Любовь"],["wedding","Свадьба"],["sorry","Извинения"],["thanks","Благодарность"]];
const COLORS = [["pink","oklch(0.82 0.07 18)"],["red","oklch(0.6 0.16 22)"],["white","oklch(0.95 0.012 90)"],["blue","oklch(0.74 0.07 250)"],["lilac","oklch(0.78 0.07 320)"],["yellow","oklch(0.88 0.1 90)"],["green","oklch(0.7 0.09 140)"]];
const CNAME = {pink:"Розовый",red:"Красный",white:"Белый",blue:"Синий",lilac:"Сиреневый",yellow:"Жёлтый",green:"Зелёный"};
const TYPES = [["peony","Пионы"],["rose","Розы"],["tulip","Тюльпаны"],["hydrangea","Гортензия"],["mix","Сезонный микс"]];
const SIZES = [["S","S"],["M","M"],["L","L"]];
const SEASONS = [["spring","Весна"],["summer","Лето"],["autumn","Осень"],["all","Круглый год"]];
const TS = {peony:"summer",rose:"all",tulip:"spring",hydrangea:"summer",mix:"autumn"};
const CICON = {
  all:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  mono:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="7" r="3.2"/><path d="M12 10v10M9 14c-2 0-3-1-3-3M15 14c2 0 3-1 3-3"/></svg>,
  box:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h16v12H4zM4 8l2-4h12l2 4M12 4v16"/></svg>,
  author:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>,
  wed:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8.5" cy="14" r="5"/><circle cx="15.5" cy="14" r="5"/></svg>,
};

/* ---- product data ---- */
const grads = {pink:"oklch(0.84 0.06 20)",red:"oklch(0.6 0.15 24)",white:"oklch(0.92 0.012 90)",blue:"oklch(0.74 0.06 250)",lilac:"oklch(0.78 0.06 320)",yellow:"oklch(0.86 0.09 90)",green:"oklch(0.72 0.08 140)"};
const RAW = [
  ["Белые ночи","Пионы, ранункулюс, эвкалипт",5200,6100,4.9,"author","love","pink","peony","M",true,"hit"],
  ["Невский букет","Кустовые розы, фрезия",4200,0,4.8,"mono","birthday","pink","rose","S",true,"new"],
  ["Нежность в коробке","Пионовидные розы",5800,6900,5.0,"box","love","pink","rose","M",true,"sale"],
  ["Летнее поле","Сезонный микс",3400,0,4.7,"author","thanks","yellow","mix","M",false,null],
  ["Тихий вечер","Гортензия, эустома",4600,0,4.9,"author","birthday","blue","hydrangea","M",true,"new"],
  ["Карамель","Розы кустовые, статица",3900,0,4.8,"mono","thanks","yellow","rose","S",true,"new"],
  ["Первый снег","Маттиола, лизиантус",4300,5100,5.0,"author","wedding","white","mix","M",false,"sale"],
  ["Гранат","Пионы, гвоздика",5100,0,4.9,"author","love","red","peony","L",true,null],
  ["Аметист","Эустома, гортензия",4700,0,4.8,"box","birthday","lilac","hydrangea","M",false,null],
  ["Рассвет","Тюльпаны микс",2600,0,4.6,"mono","thanks","yellow","tulip","S",true,"new"],
  ["Сангрия","Красные розы",5400,6200,4.9,"mono","love","red","rose","L",true,"sale"],
  ["Облако","Гортензия белая",4900,0,4.9,"mono","wedding","white","hydrangea","M",false,null],
  ["Пион-парад","Пионы розовые",6800,0,5.0,"author","love","pink","peony","L",true,"hit"],
  ["Мятный бриз","Эвкалипт, хризантема",3100,0,4.7,"author","thanks","green","mix","S",true,null],
  ["Коралл","Розы, ранункулюс",4400,0,4.8,"box","birthday","red","rose","M",false,"new"],
  ["Лаванда","Лизиантус, лаванда",3700,4300,4.8,"mono","sorry","lilac","mix","S",false,"sale"],
  ["Свадебный пион","Розы, гипсофила",6500,0,5.0,"wed","wedding","white","peony","L",true,null],
  ["Солнце","Жёлтые тюльпаны",2900,0,4.6,"mono","birthday","yellow","tulip","S",true,null],
  ["Туман","Гортензия голубая",5200,0,4.9,"box","love","blue","hydrangea","M",false,null],
  ["Фламинго","Пионы, эустома",5600,6400,4.9,"author","love","pink","peony","M",true,"sale"],
  ["Изумруд","Зелёный микс, рускус",3300,0,4.7,"author","thanks","green","mix","M",false,"new"],
  ["Романс","Красные розы, эвкалипт",7100,0,5.0,"box","love","red","rose","L",true,"hit"],
  ["Зефир","Кустовые розы белые",3800,0,4.8,"mono","wedding","white","rose","S",false,null],
  ["Вишня","Тюльпаны бордо",3200,0,4.7,"mono","birthday","red","tulip","S",true,"new"],
];
const PRODUCTS = RAW.map((r,i)=>({ id:i, n:r[0], c:r[1], p:r[2], o:r[3], r:r[4], collection:r[5], occasion:r[6], color:r[7], type:r[8], size:r[9], today:r[10], tag:r[11] }));
const TAGLAB = {hit:["hit","Хит"],new:["new","Новинка"],sale:["sale","Скидка"]};
const PER=9;

function Header(){return(<>
  <div className="announce"><div className="ann-left"><span className="ann-deco"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg></span><span className="ann-promo"><b>−10%</b> на первый букет</span><span className="ann-badge">новым клиентам</span><button className="ann-code" onClick={e=>{if(navigator.clipboard)navigator.clipboard.writeText('БУТОН10');const t=e.currentTarget;t.classList.add('copied');setTimeout(()=>t.classList.remove('copied'),1400);}}>БУТОН10<span className="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span className="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button></div><div className="ann-trust"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span></div></div>
  <header className="site"><div className="site-in">
    <a className="logo" href="Витрина.html" style={{textDecoration:"none",color:"inherit"}}><span className="mark"></span>Бутон</a>
    <nav className="main"><a href="Витрина.html">Главная</a><a href="Каталог.html" className="on">Каталог</a><a href="Конструктор букета.html">Конструктор</a><a href="Доставка.html">Доставка</a><a href="Подписка.html">Подписка</a></nav>
    <div className="site-tools"><button className="icobtn">{I.search}</button><button className="icobtn">{I.heart}</button><a className="icobtn" href="cabinet/Личный кабинет.html">{I.user}</a><a className="icobtn" href="Оформление заказа.html">{I.cart}<span className="badge">2</span></a></div>
  </div></header></>);}

function Card({p, liked, onLike}){
  return (
    <a className="pcard" href="Карточка товара.html" onClick={e=>{if(e.target.closest('.like')||e.target.closest('.quick'))e.preventDefault();}}>
      <div className="pm">
        <PH label="фото букета" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${grads[p.color]}, oklch(0.92 0.02 80))`}}/>
        {p.tag && <span className={"tag "+TAGLAB[p.tag][0]}>{TAGLAB[p.tag][1]}</span>}
        <button className={"like"+(liked?" on":"")} onClick={()=>onLike(p.id)}>{I.heart}</button>
        <button className="quick">{I.plus} Быстрый заказ</button>
      </div>
      <div className="pb">
        <div className="prate">{I.star}<b>{p.r.toFixed(1)}</b>{p.today&&<span style={{color:"var(--green-soft)",marginLeft:6}}>· сегодня</span>}</div>
        <div className="pn">{p.n}</div>
        <div className="pc">{p.c}</div>
        <div className="pp"><span className="n">{fmt(p.p)} ₽</span>{p.o>0&&<span className="o">{fmt(p.o)} ₽</span>}</div>
      </div>
    </a>
  );
}

const DEFAULT = { coll:"all", quick:null, occ:[], season:[], type:[], size:[], maxPrice:8000, saleOnly:false, todayOnly:false };

function App(){
  const [f, setF] = useState(DEFAULT);
  const [sort, setSort] = useState("pop");
  const [page, setPage] = useState(1);
  const [likes, setLikes] = useState({});
  const [drawer, setDrawer] = useState(false);

  const upd = patch => { setF(s=>({...s,...patch})); setPage(1); };
  const toggleArr = (key,val)=> upd({[key]: f[key].includes(val)? f[key].filter(x=>x!==val): [...f[key],val]});
  const reset = ()=>{ setF(DEFAULT); setPage(1); };
  const toggleLike = id=>setLikes(l=>({...l,[id]:!l[id]}));

  const filtered = useMemo(()=>{
    let list = PRODUCTS.filter(p=>{
      if(f.coll!=="all" && p.collection!==f.coll) return false;
      if(f.quick==="hit" && p.tag!=="hit") return false;
      if(f.quick==="new" && p.tag!=="new") return false;
      if(f.quick==="sale" && p.o<=0) return false;
      if(f.quick==="today" && !p.today) return false;
      if(f.quick==="cheap" && p.p>3000) return false;
      if(f.occ.length && !f.occ.includes(p.occasion)) return false;
      if(f.season.length && !f.season.includes(TS[p.type])) return false;
      if(f.type.length && !f.type.includes(p.type)) return false;
      if(f.size.length && !f.size.includes(p.size)) return false;
      if(p.p>f.maxPrice) return false;
      if(f.saleOnly && p.o<=0) return false;
      if(f.todayOnly && !p.today) return false;
      return true;
    });
    if(sort==="cheap") list=[...list].sort((a,b)=>a.p-b.p);
    else if(sort==="exp") list=[...list].sort((a,b)=>b.p-a.p);
    else if(sort==="rate") list=[...list].sort((a,b)=>b.r-a.r);
    return list;
  },[f,sort]);

  const pages = Math.max(1, Math.ceil(filtered.length/PER));
  const cur = Math.min(page,pages);
  const shown = filtered.slice((cur-1)*PER, cur*PER);
  const cntFor = pred => PRODUCTS.filter(pred).length;

  const Sidebar = ()=>(
    <>
      <div className="fgroup">
        <h4>Повод</h4>
        <div className="fopts">{OCCAS.map(([id,n])=>(
          <div className={"fopt"+(f.occ.includes(id)?" on":"")} key={id} onClick={()=>toggleArr("occ",id)}><span className="cbx">{I.check}</span>{n}<span className="cnt">{cntFor(p=>p.occasion===id)}</span></div>
        ))}</div>
      </div>
      <div className="fgroup">
        <h4>Сезон</h4>
        <div className="fopts">{SEASONS.map(([id,n])=>(
          <div className={"fopt"+(f.season.includes(id)?" on":"")} key={id} onClick={()=>toggleArr("season",id)}><span className="cbx">{I.check}</span>{n}<span className="cnt">{cntFor(p=>TS[p.type]===id)}</span></div>
        ))}</div>
      </div>
      <div className="fgroup">
        <h4>Тип цветов</h4>
        <div className="fopts">{TYPES.map(([id,n])=>(
          <div className={"fopt"+(f.type.includes(id)?" on":"")} key={id} onClick={()=>toggleArr("type",id)}><span className="cbx">{I.check}</span>{n}<span className="cnt">{cntFor(p=>p.type===id)}</span></div>
        ))}</div>
      </div>
      <div className="fgroup">
        <h4>Размер</h4>
        <div className="fopts" style={{flexDirection:"row",gap:8}}>{SIZES.map(([id,n])=>(
          <div className={"fopt"+(f.size.includes(id)?" on":"")} key={id} onClick={()=>toggleArr("size",id)} style={{border:"1px solid var(--line-strong)",borderRadius:9,padding:"8px 14px",justifyContent:"center"}}>{n}</div>
        ))}</div>
      </div>
      <div className="fgroup">
        <h4>Цена, до</h4>
        <div className="range">
          <div className="vals"><span>0 ₽</span><span>{fmt(f.maxPrice)} ₽</span></div>
          <input type="range" min="2000" max="8000" step="100" value={f.maxPrice} onChange={e=>upd({maxPrice:+e.target.value})}/>
        </div>
      </div>
      <div className="fgroup" style={{borderBottom:"none"}}>
        <div className="fopts">
          <div className={"fopt"+(f.saleOnly?" on":"")} onClick={()=>upd({saleOnly:!f.saleOnly})}><span className="cbx">{I.check}</span>Только со скидкой</div>
          <div className={"fopt"+(f.todayOnly?" on":"")} onClick={()=>upd({todayOnly:!f.todayOnly})}><span className="cbx">{I.check}</span>Доступно сегодня</div>
        </div>
      </div>
      <button className="freset" onClick={reset}>Сбросить фильтры</button>
    </>
  );

  return (
    <div className="app">
      <Header/>
      <div className="wrap">
        <div className="crumbs"><a href="Витрина.html">Главная</a><span className="sep">/</span><span>Каталог</span></div>
        <div className="cat-head">
          <h1 className="serif">Каталог букетов</h1>
          <p className="sub">Свежие букеты с доставкой по Санкт-Петербургу · <b>{filtered.length} {plural(filtered.length,['букет','букета','букетов'])}</b> по вашему запросу</p>
        </div>

        <div className="collections">
          {COLLECTIONS.map(([id,n])=>(<button className={"coll"+(f.coll===id?" on":"")} key={id} onClick={()=>upd({coll:id})}>{CICON[id]}{n}</button>))}
        </div>
        <div className="qfilters">
          <span className="ql">Быстрый выбор:</span>
          {[["hit","Хиты"],["new","Новинки"],["sale","Со скидкой"],["today","Доступно сегодня"],["cheap","До 3 000 ₽"]].map(([id,n])=>(
            <button className={"qf"+(f.quick===id?" on":"")} key={id} onClick={()=>upd({quick:f.quick===id?null:id})}>{n}</button>
          ))}
        </div>

        <div className="cat-grid">
          <aside className="filters"><Sidebar/></aside>

          <div>
            <div className="resbar">
              <button className="filt-mobile" onClick={()=>setDrawer(true)}>{I.filter} Фильтры</button>
              <span className="rc"><b>{filtered.length}</b> {plural(filtered.length,['букет','букета','букетов'])}</span>
              <div className="sortwrap">
                <span className="sl">Сортировка:</span>
                <select className="sortsel" value={sort} onChange={e=>setSort(e.target.value)}>
                  <option value="pop">Популярные</option>
                  <option value="cheap">Сначала дешёвые</option>
                  <option value="exp">Сначала дорогие</option>
                  <option value="rate">По рейтингу</option>
                </select>
              </div>
            </div>

            {shown.length>0 ? (
              <div className="cards">{shown.map(p=><Card key={p.id} p={p} liked={likes[p.id]} onLike={toggleLike}/>)}</div>
            ) : (
              <div className="empty">
                <div className="ring">{I.flower}</div>
                <h3>Ничего не нашлось</h3>
                <p>Попробуйте смягчить фильтры — или начните с готовой основы в конструкторе.</p>
                <button className="btn-primary" onClick={reset} style={{margin:"0 auto"}}>Сбросить фильтры</button>
              </div>
            )}

            {pages>1 && (
              <div className="pager">
                <button className="pg" disabled={cur===1} onClick={()=>setPage(cur-1)}>←</button>
                {Array.from({length:pages}).map((_,i)=>(<button className={"pg"+(cur===i+1?" on":"")} key={i} onClick={()=>setPage(i+1)}>{i+1}</button>))}
                <button className="pg" disabled={cur===pages} onClick={()=>setPage(cur+1)}>→</button>
              </div>
            )}
          </div>
        </div>

        <div className="seo">
          <h2 className="serif">Доставка букетов в Санкт-Петербурге</h2>
          <p>«Бутон» — цветочная мастерская с 7-летней историей. Мы собираем букеты из свежих сезонных цветов и доставляем по всему Петербургу за 2 часа. Перед отправкой присылаем фото готового букета — вы видите, что получит ваш близкий.</p>
          <p>В каталоге — монобукеты, композиции в шляпных коробках, авторские и свадебные букеты. Фильтруйте по поводу, цвету, типу цветов и бюджету, оплачивайте баллами клуба «Бутон» и возвращайтесь за свежестью снова.</p>
        </div>
      </div>

      {/* mobile drawer */}
      <div className={"drawer-bg"+(drawer?" open":"")} onClick={()=>setDrawer(false)}></div>
      <div className={"drawer"+(drawer?" open":"")}>
        <div className="dh"><h3>Фильтры</h3><button className="dclose" onClick={()=>setDrawer(false)}>{I.x}</button></div>
        <Sidebar/>
        <div className="dapply"><button className="btn-primary" style={{width:"100%"}} onClick={()=>setDrawer(false)}>Показать {filtered.length} {plural(filtered.length,['букет','букета','букетов'])}</button></div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
