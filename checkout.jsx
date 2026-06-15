const { useState, useMemo } = React;
const fmt = n => n.toLocaleString("ru-RU");
const plural = (n,[one,few,many]) => { const a=Math.abs(n)%100, b=a%10; if(a>10&&a<20) return many; if(b>1&&b<5) return few; if(b===1) return one; return many; };

const I = {
  search:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>,
  heart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 4.8 3.5 3.3 6.5C19 15.5 12 20 12 20Z"/></svg>,
  user:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 3.2-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/></svg>,
  cart:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 7h13l-1.3 8.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L5.6 4.8A1 1 0 0 0 4.6 4H3"/><circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="20" r="1.1" fill="currentColor" stroke="none"/></svg>,
  check:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-10"/></svg>,
  truck:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  shop:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 9h16l-1 11H5zM4 9l1.5-5h13L20 9M9 13v4M15 13v4"/></svg>,
  pin:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>,
  gift:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 11h16v9H4zM2 7h20v4H2zM12 7v13M12 7S10 3 7.5 4 9 7 12 7s2.5-2 4.5-3 1.5 3-.5 3"/></svg>,
  eyeoff:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9 9 0 0 1 21 12a14 14 0 0 1-2.3 3M6.1 6.2A14 14 0 0 0 3 12a9 9 0 0 0 12 5"/></svg>,
  camera:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>,
  star:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17.8 5.9 20.3l1.4-6.7-5-4.6 6.8-.7z"/></svg>,
};
const PH = ({label, style})=>(<div className="ph" style={style}><span className="lbl">{label}</span></div>);

const ITEMS0 = [
  { id:1, n:"Белые ночи", c:"Размер M · открытка", addon:"Мишка Тедди", price:5200, old:6100, qty:1, m:"oklch(0.85 0.06 20)" },
  { id:2, n:"Невский букет", c:"Размер S · кустовые розы", addon:null, price:4200, old:0, qty:1, m:"oklch(0.72 0.06 350)" },
];
const ZONES = [
  { id:"center", n:"Центр", price:400 },
  { id:"vasil", n:"Васильевский о.", price:500 },
  { id:"spalny", n:"Спальные районы", price:600 },
  { id:"kad", n:"За КАД", price:900 },
];
const SLOTS = [
  { id:"s1", t:"12:00–14:00", off:true },
  { id:"s2", t:"14:00–16:00", off:false, f:"свободно" },
  { id:"s3", t:"16:00–18:00", off:false, f:"свободно" },
  { id:"s4", t:"18:00–20:00", off:false, f:"мало слотов" },
  { id:"s5", t:"20:00–22:00", off:false, f:"+200 ₽" },
];
const BONUS_AVAIL = 1240;

function dateChips(){
  const wd=["вс","пн","вт","ср","чт","пт","сб"]; const out=[]; const now=new Date();
  for(let i=0;i<7;i++){ const d=new Date(now); d.setDate(now.getDate()+i); out.push({ id:i, w:i===0?"сегодня":i===1?"завтра":wd[d.getDay()], d:d.getDate() }); }
  return out;
}

function Header(){
  return (<>
    <div className="announce"><div className="ann-left"><span className="ann-deco"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3.1"/><circle cx="12" cy="18" r="3.1"/><circle cx="6" cy="12" r="3.1"/><circle cx="18" cy="12" r="3.1"/><circle cx="12" cy="12" r="2.8" fill="oklch(0.7 0.13 47)"/></svg></span><span className="ann-promo"><b>−10%</b> на первый букет</span><span className="ann-badge">новым клиентам</span><button className="ann-code" onClick={e=>{if(navigator.clipboard)navigator.clipboard.writeText('БУТОН10');const t=e.currentTarget;t.classList.add('copied');setTimeout(()=>t.classList.remove('copied'),1400);}}>БУТОН10<span className="ic-copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></span><span className="ic-done"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 5 5 9-10"/></svg></span></button></div><div className="ann-trust"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg> Бесплатная доставка от 4 000 ₽</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Сборка за 2 часа</span><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg> Фото перед доставкой</span></div></div>
    <header className="site"><div className="site-in">
      <a className="logo" href="Витрина.html" style={{textDecoration:"none",color:"inherit"}}><span className="mark"></span>Бутон</a>
      <nav className="main"><a href="Витрина.html">Главная</a><a href="Карточка товара.html">Каталог</a><a href="Конструктор букета.html">Конструктор</a><a href="Доставка.html">Доставка</a><a href="Подписка.html">Подписка</a></nav>
      <div className="site-tools"><button className="icobtn">{I.search}</button><button className="icobtn">{I.heart}</button><a className="icobtn" href="cabinet/Личный кабинет.html">{I.user}</a><button className="icobtn">{I.cart}<span className="badge">2</span></button></div>
    </div></header>
  </>);
}

function App(){
  const [items, setItems] = useState(ITEMS0);
  const [method, setMethod] = useState("courier");
  const [zone, setZone] = useState("center");
  const [self, setSelf] = useState(false);
  const [date, setDate] = useState(0);
  const [slot, setSlot] = useState("s3");
  const [giftOn, setGiftOn] = useState(true);
  const [anon, setAnon] = useState(false);
  const [waPhoto, setWaPhoto] = useState(true);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [useBonus, setUseBonus] = useState(false);

  const dates = useMemo(dateChips, []);
  const setQty=(id,d)=>setItems(it=>it.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+d)}:x));
  const remove=id=>setItems(it=>it.filter(x=>x.id!==id));

  const subtotal = items.reduce((a,x)=>a+x.price*x.qty,0);
  const zoneObj = ZONES.find(z=>z.id===zone);
  const slotExtra = slot==="s5"?200:0;
  const baseDelivery = method==="pickup"?0:(zoneObj.price+slotExtra);
  const freeDelivery = subtotal>=4000;
  const delivery = freeDelivery?0:baseDelivery;
  const promoDisc = promoApplied?Math.round(subtotal*0.15):0;
  const afterPromo = subtotal-promoDisc;
  const maxBonus = Math.min(BONUS_AVAIL, Math.round(afterPromo*0.3));
  const bonusUsed = useBonus?maxBonus:0;
  const total = Math.max(0, afterPromo - bonusUsed + delivery);
  const earn = Math.round(total*0.05);
  const toFree = Math.max(0, 4000-subtotal);
  const freePct = Math.min(100, subtotal/4000*100);

  const applyPromo=()=>{ if(promo.trim().toUpperCase()==="SPRING15"){setPromoApplied(true);} else {setPromoApplied(false);} };

  return (
    <div className="app">
      <Header/>
      <div className="wrap">
        <div className="crumbs"><a href="Витрина.html">Главная</a><span className="sep">/</span><a href="Карточка товара.html">Каталог</a><span className="sep">/</span><span>Оформление заказа</span></div>
        <div className="co-head"><h1 className="serif">Оформление заказа</h1></div>
        <div className="freebar">
          <span className="fb-ic">{I.truck}</span>
          <div className="fb-t">
            {freeDelivery ? <span><b>Доставка бесплатно</b> — сумма заказа превысила 4 000 ₽ 🎉</span>
              : <span>До <b>бесплатной доставки</b> осталось <b>{fmt(toFree)} ₽</b></span>}
            <div className="track"><div className="fill" style={{width:freePct+"%"}}></div></div>
          </div>
        </div>

        <div className="co">
          {/* MAIN */}
          <div className="co-main">
            {/* ITEMS */}
            <div className="card">
              <div className="card-h"><span className="n">1</span><h3>Ваш заказ</h3><span className="hint">{items.length} {plural(items.length,['товар','товара','товаров'])}</span></div>
              <div className="card-b">
                {items.map(x=>(
                  <div className="litem" key={x.id}>
                    <div className="lm"><PH label="фото" style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${x.m}, oklch(0.9 0.02 80))`}}/></div>
                    <div className="li">
                      <div className="ln">{x.n}</div>
                      <div className="lc">{x.c}</div>
                      {x.addon && <div className="laddon">{I.gift} +{x.addon}</div>}
                      <div className="lbot">
                        <div className="qty"><button onClick={()=>setQty(x.id,-1)}>−</button><span className="qn tnum">{x.qty}</span><button onClick={()=>setQty(x.id,1)}>+</button></div>
                        <button className="lremove" onClick={()=>remove(x.id)}>Удалить</button>
                      </div>
                    </div>
                    <div className="lp"><div className="now tnum">{fmt(x.price*x.qty)} ₽</div>{x.old>0 && <div className="old tnum">{fmt(x.old*x.qty)} ₽</div>}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY METHOD + ZONE */}
            <div className="card">
              <div className="card-h"><span className="n">2</span><h3>Способ получения</h3></div>
              <div className="card-b">
                <div className="methods">
                  <div className={"method"+(method==="courier"?" on":"")} onClick={()=>setMethod("courier")}>
                    <div className="mt">{I.truck} Курьером</div>
                    <div className="md">По Санкт-Петербургу, в выбранный слот</div>
                    <div className="mp">{freeDelivery?"Бесплатно от 4 000 ₽":"от 400 ₽"}</div>
                  </div>
                  <div className={"method"+(method==="pickup"?" on":"")} onClick={()=>setMethod("pickup")}>
                    <div className="mt">{I.shop} Самовывоз</div>
                    <div className="md">Невский пр., 28 · ежедневно 9:00–21:00</div>
                    <div className="mp">Бесплатно</div>
                  </div>
                </div>

                {method==="courier" && <div style={{marginTop:18}}>
                  <div className="map">
                    <div className="road" style={{left:0,right:0,top:"46%",height:6}}></div>
                    <div className="road" style={{top:0,bottom:0,left:"58%",width:6}}></div>
                    <div className="zone-circle"></div>
                    <div className="pin">{I.pin}</div>
                    <div className="maptag">Зона: {zoneObj.n} · {zoneObj.price} ₽</div>
                  </div>
                  <div className="zones">
                    {ZONES.map(z=>(
                      <button className={"zone"+(zone===z.id?" on":"")} key={z.id} onClick={()=>setZone(z.id)}>{z.n}<span className="zp tnum">{z.price} ₽</span></button>
                    ))}
                  </div>
                </div>}
              </div>
            </div>

            {/* RECIPIENT */}
            <div className="card">
              <div className="card-h"><span className="n">3</span><h3>Получатель и адрес</h3><span className="hint">получатель может отличаться от вас</span></div>
              <div className="card-b">
                <div className="field"><label>Ваш телефон <span className="req">*</span></label><input className="inp" placeholder="+7 (___) ___-__-__"/></div>
                <div className={"selfrow"+(self?" on":"")} onClick={()=>setSelf(v=>!v)}>
                  <span className="cbx">{I.check}</span><span className="st">Я сам(а) получу букет — заполнить данными заказчика</span>
                </div>
                {!self && <>
                  <div className="frow">
                    <div className="field"><label>Имя получателя <span className="req">*</span></label><input className="inp" placeholder="Например, Анна"/></div>
                    <div className="field"><label>Телефон получателя <span className="req">*</span></label><input className="inp" placeholder="+7 (___) ___-__-__"/></div>
                  </div>
                  <div className="field" style={{marginTop:0,marginBottom:6}}><span style={{fontSize:12.5,color:"var(--ink-faint)"}}>Курьер позвонит получателю, чтобы согласовать удобное время — сюрприз не раскроем.</span></div>
                </>}
                <div className="field"><label>Адрес доставки <span className="req">*</span></label><input className="inp" placeholder="Улица, дом"/>
                  <div className="suggest">
                    <span className="sg" onClick={()=>setZone("center")}>Невский пр., 28</span>
                    <span className="sg" onClick={()=>setZone("vasil")}>6-я линия В.О., 12</span>
                    <span className="sg" onClick={()=>setZone("spalny")}>пр. Просвещения, 45</span>
                  </div>
                </div>
                <div className="frow">
                  <div className="field"><label>Квартира / офис</label><input className="inp" placeholder="—"/></div>
                  <div className="field"><label>Подъезд / этаж / домофон</label><input className="inp" placeholder="—"/></div>
                </div>
              </div>
            </div>

            {/* DATE & TIME */}
            <div className="card">
              <div className="card-h"><span className="n">4</span><h3>Дата и время</h3></div>
              <div className="card-b">
                <div className="dates">
                  {dates.map(d=>(<button className={"date"+(date===d.id?" on":"")} key={d.id} onClick={()=>setDate(d.id)}><div className="dw">{d.w}</div><div className="dd tnum">{d.d}</div></button>))}
                </div>
                <div className="slots">
                  {SLOTS.map(s=>(
                    <button className={"slot"+(slot===s.id?" on":"")+(s.off?" off":"")} key={s.id} disabled={s.off} onClick={()=>!s.off&&setSlot(s.id)}>{s.t}{!s.off&&<span className="sf">{s.f}</span>}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* OPTIONS: card / anon / wa photo */}
            <div className="card">
              <div className="card-h"><span className="n">5</span><h3>Открытка и пожелания</h3></div>
              <div className="card-b">
                <div className={"opt-switch"+(giftOn?" on":"")}>
                  <div className="sw-txt">
                    <div className="st">{I.gift} Открытка с текстом</div>
                    <div className="sd">Напишем от руки и вложим в букет — бесплатно</div>
                    {giftOn && <textarea className="inp" style={{marginTop:10}} maxLength={200} placeholder="Текст для открытки…"></textarea>}
                  </div>
                  <div className="toggle" onClick={()=>setGiftOn(v=>!v)}></div>
                </div>
                <div className={"opt-switch hl"+(waPhoto?" on":"")} onClick={()=>setWaPhoto(v=>!v)}>
                  <div className="sw-txt"><div className="st"><span className="wa">{I.camera}</span> Пришлите фото букета в WhatsApp до доставки</div><div className="sd">Покажем готовый букет перед отправкой — успеете внести правки</div></div>
                  <div className="toggle"></div>
                </div>
                <div className={"opt-switch"+(anon?" on":"")} onClick={()=>setAnon(v=>!v)}>
                  <div className="sw-txt"><div className="st">{I.eyeoff} Анонимная доставка</div><div className="sd">Получатель не увидит, кто отправитель</div></div>
                  <div className="toggle"></div>
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="summary">
            <div className="sum-card">
              <h3 className="serif">Итог заказа</h3>
              <div className="promo-row">
                <input className="inp" placeholder="Промокод (SPRING15)" value={promo} onChange={e=>setPromo(e.target.value)}/>
                <button onClick={applyPromo}>Применить</button>
              </div>
              {promoApplied && <div className="promo-ok">{I.check} Промокод SPRING15 · −15% применён</div>}

              <div className={"bonus"+(useBonus?" on":"")} onClick={()=>setUseBonus(v=>!v)}>
                <span className="cbx">{I.check}</span>
                <div><div className="bt">Списать баллы</div><div className="bd">Доступно <b>{fmt(BONUS_AVAIL)}</b> · спишем <b>{fmt(maxBonus)}</b> (до 30% заказа)</div></div>
              </div>

              <div className="sum-rows">
                <div className="r"><span>Букеты · {items.reduce((a,x)=>a+x.qty,0)} шт</span><span className="tnum">{fmt(subtotal)} ₽</span></div>
                {promoDisc>0 && <div className="r disc"><span>Промокод SPRING15</span><span className="tnum">−{fmt(promoDisc)} ₽</span></div>}
                {bonusUsed>0 && <div className="r disc"><span>Баллы</span><span className="tnum">−{fmt(bonusUsed)} ₽</span></div>}
                <div className={"r"+(delivery===0?" free":"")}><span>Доставка{method==="pickup"?" · самовывоз":` · ${zoneObj.n}`}</span><span className="tnum">{delivery===0?"бесплатно":fmt(delivery)+" ₽"}</span></div>
              </div>
              <div className="sum-total"><span className="l">К оплате</span><span className="p tnum">{fmt(total)} ₽</span></div>
              <div className="earn">{I.star}<span>Вернём <b>{fmt(earn)} {plural(earn,['балл','балла','баллов'])}</b> после доставки</span></div>
              <a className="btn-primary paybtn" href="Заказ оформлен.html" style={{textDecoration:"none"}}>Оплатить {fmt(total)} ₽</a>
              <div className="pay-note">Нажимая «Оплатить», вы соглашаетесь с офертой и политикой конфиденциальности. Оплата картой, СБП или при получении.</div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mbar">
        <div className="mp"><span className="k">К оплате</span><span className="v serif tnum">{fmt(total)} ₽</span></div>
        <a className="btn-primary" href="Заказ оформлен.html" style={{textDecoration:"none"}}>Оплатить</a>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
