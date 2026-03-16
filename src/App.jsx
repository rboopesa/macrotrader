import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from "recharts";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  bg:"#F8F7F4", card:"#FFFFFF", panel:"#F2F0EB", border:"#E5E0D5", borderDark:"#CEC8BC",
  navy:"#0F1F3D", navyMid:"#1E3A6E",
  green:"#059669", greenBg:"#ECFDF5", greenBorder:"#6EE7B7",
  red:"#DC2626", redBg:"#FEF2F2", redBorder:"#FCA5A5",
  amber:"#D97706", amberBg:"#FFFBEB", amberBorder:"#FCD34D",
  blue:"#1D4ED8", blueBg:"#EFF6FF", blueBorder:"#93C5FD",
  purple:"#7C3AED", purpleBg:"#F5F3FF", purpleBorder:"#C4B5FD",
  teal:"#0D9488", tealBg:"#F0FDFA", gold:"#B45309", goldLight:"#FEF3C7",
  text:"#1C1917", textMid:"#44403C", muted:"#78716C", dim:"#A8A29E",
  termBg:"#0D1117", termBorder:"#21262D", termText:"#E6EDF3",
  termGreen:"#3FB950", termRed:"#F85149", termAmber:"#E3B341", termBlue:"#58A6FF", termMuted:"#8B949E",
};
const SERIF="'Playfair Display',Georgia,serif";
const MONO="'JetBrains Mono','Fira Code',monospace";
const SANS="'Syne','DM Sans',-apple-system,sans-serif";

(() => {
  const s = document.createElement("style");
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:${C.bg};color:${C.text};font-family:${SANS};font-size:13px;line-height:1.6}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:${C.panel}}
    ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
    .anim{animation:fadeUp 0.3s ease forwards}
    .pulse{animation:pulse 2s ease infinite}
    input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:4px;outline:none;cursor:pointer}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;cursor:pointer;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.25)}
    @media(max-width:768px){.desk{display:none!important}.stack{flex-direction:column!important}.full{width:100%!important}}
  `;
  document.head.appendChild(s);
})();

// ─── ASSETS ───────────────────────────────────────────────────────
const ASSETS = {
  nifty:{sym:"^NSEI",label:"NIFTY 50",unit:"₹",cat:"index",theme:"index",tv:"NSE:NIFTY"},
  bnifty:{sym:"^NSEBANK",label:"Bank Nifty",unit:"₹",cat:"index",theme:"index",tv:"NSE:BANKNIFTY"},
  vix:{sym:"^INDIAVIX",label:"India VIX",unit:"",cat:"index",theme:"vol",tv:"NSE:INDIAVIX"},
  gold:{sym:"GC=F",label:"Gold",unit:"$",cat:"commodity",theme:"safe",tv:"COMEX:GC1!"},
  silver:{sym:"SI=F",label:"Silver",unit:"$",cat:"commodity",theme:"safe",tv:"COMEX:SI1!"},
  crude:{sym:"CL=F",label:"WTI Crude",unit:"$",cat:"commodity",theme:"energy",tv:"NYMEX:CL1!"},
  brent:{sym:"BZ=F",label:"Brent",unit:"$",cat:"commodity",theme:"energy",tv:"NYMEX:BB1!"},
  natgas:{sym:"NG=F",label:"Nat Gas",unit:"$",cat:"commodity",theme:"energy",tv:"NYMEX:NG1!"},
  copper:{sym:"HG=F",label:"Copper",unit:"$",cat:"commodity",theme:"industrial",tv:"COMEX:HG1!"},
  wheat:{sym:"ZW=F",label:"Wheat",unit:"$",cat:"commodity",theme:"food",tv:"CBOT:ZW1!"},
  usdinr:{sym:"INR=X",label:"USD/INR",unit:"",cat:"fx",theme:"fx",tv:"FX_IDC:USDINR"},
  dxy:{sym:"DX-Y.NYB",label:"DXY",unit:"",cat:"fx",theme:"fx",tv:"TVC:DXY"},
  hal:{sym:"HAL.NS",label:"HAL",unit:"₹",cat:"stock",theme:"defence",tv:"NSE:HAL"},
  bel:{sym:"BEL.NS",label:"BEL",unit:"₹",cat:"stock",theme:"defence",tv:"NSE:BEL"},
  mazagon:{sym:"MAZDOCK.NS",label:"Mazagon",unit:"₹",cat:"stock",theme:"defence",tv:"NSE:MAZDOCK"},
  ongc:{sym:"ONGC.NS",label:"ONGC",unit:"₹",cat:"stock",theme:"energy",tv:"NSE:ONGC"},
  gail:{sym:"GAIL.NS",label:"GAIL",unit:"₹",cat:"stock",theme:"energy",tv:"NSE:GAIL"},
  coalind:{sym:"COALINDIA.NS",label:"Coal India",unit:"₹",cat:"stock",theme:"energy",tv:"NSE:COALINDIA"},
  muthoot:{sym:"MUTHOOTFIN.NS",label:"Muthoot",unit:"₹",cat:"stock",theme:"safe",tv:"NSE:MUTHOOTFIN"},
  titan:{sym:"TITAN.NS",label:"Titan",unit:"₹",cat:"stock",theme:"safe",tv:"NSE:TITAN"},
  btc:{sym:"BTC-USD",label:"Bitcoin",unit:"$",cat:"crypto",theme:"crypto",tv:"COINBASE:BTCUSD"},
  eth:{sym:"ETH-USD",label:"Ethereum",unit:"$",cat:"crypto",theme:"crypto",tv:"COINBASE:ETHUSD"},
};

const BASE = {
  nifty:{price:22847,change:0.82,vol:"above"},bnifty:{price:48920,change:1.14,vol:"above"},
  vix:{price:16.8,change:-3.2,vol:"normal"},gold:{price:3181,change:0.94,vol:"above"},
  silver:{price:35.4,change:1.21,vol:"above"},crude:{price:68.1,change:1.43,vol:"above"},
  brent:{price:72.1,change:1.67,vol:"above"},natgas:{price:3.84,change:2.1,vol:"normal"},
  copper:{price:4.62,change:-0.8,vol:"below"},wheat:{price:548,change:0.6,vol:"normal"},
  usdinr:{price:83.47,change:0.18,vol:"normal"},dxy:{price:103.2,change:-0.3,vol:"normal"},
  hal:{price:4218,change:2.95,vol:"above"},bel:{price:228,change:2.42,vol:"above"},
  mazagon:{price:2876,change:3.1,vol:"above"},ongc:{price:268,change:1.82,vol:"above"},
  gail:{price:198,change:1.35,vol:"normal"},coalind:{price:387,change:0.9,vol:"normal"},
  muthoot:{price:1847,change:1.55,vol:"above"},titan:{price:3124,change:0.88,vol:"normal"},
  btc:{price:82400,change:2.1,vol:"above"},eth:{price:1920,change:1.8,vol:"above"},
};

// ─── FII/DII MOCK DATA (replace with NSE API when available) ──────
const FII_DII_DATA = [
  {date:"Mar 16",fii:-2847,dii:1923,net:-924},
  {date:"Mar 15",fii:-1234,dii:2456,net:1222},
  {date:"Mar 14",fii:3421,dii:876,net:4297},
  {date:"Mar 13",fii:-4567,dii:3210,net:-1357},
  {date:"Mar 12",fii:1890,dii:1456,net:3346},
  {date:"Mar 11",fii:-987,dii:2134,net:1147},
  {date:"Mar 10",fii:5432,dii:987,net:6419},
];

// ─── SECTOR ROTATION DATA ─────────────────────────────────────────
const SECTORS = [
  {name:"Defence",change:2.8,flow:"strong-in",stocks:["HAL","BEL","Mazagon"],note:"Conflict escalation driving defence budget expectations up"},
  {name:"Energy",change:1.6,flow:"in",stocks:["ONGC","GAIL","Coal India"],note:"Crude above $68 supporting upstream margin expansion"},
  {name:"Metals",change:1.2,flow:"in",stocks:["Hindalco","Tata Steel","JSPL"],note:"China stimulus hopes + supply constraints"},
  {name:"Pharma",change:0.4,flow:"neutral",stocks:["Sun Pharma","Dr Reddy","Cipla"],note:"Defensive sector — stable but no strong catalyst today"},
  {name:"IT",change:-0.8,flow:"out",stocks:["Infosys","TCS","Wipro"],note:"FII selling + strong rupee reduces USD revenue appeal"},
  {name:"Banks",change:-0.4,flow:"slight-out",stocks:["HDFC Bank","ICICI Bank","Kotak"],note:"Rate cut uncertainty keeping banks range-bound"},
  {name:"FMCG",change:0.2,flow:"neutral",stocks:["HUL","Nestle","Britannia"],note:"Defensive play — consider if markets turn risk-off"},
  {name:"Auto",change:0.6,flow:"neutral",stocks:["Maruti","M&M","Bajaj Auto"],note:"Rural demand recovery partially offset by fuel cost fears"},
  {name:"Realty",change:1.1,flow:"in",stocks:["DLF","Godrej Props","Prestige"],note:"Rate cut hopes supporting property sentiment"},
  {name:"Power",change:0.9,flow:"in",stocks:["NTPC","Power Grid","Adani Power"],note:"Energy transition + base load demand growing"},
];

// ─── SIGNAL ENGINE ────────────────────────────────────────────────
function computeRSI(prices,n=14){
  if(prices.length<n+1){const chg=prices.length>1?(prices[prices.length-1]-prices[prices.length-2])/prices[prices.length-2]*100:0;return Math.min(80,Math.max(20,50+chg*8));}
  let g=0,l=0;for(let i=prices.length-n;i<prices.length;i++){const d=prices[i]-prices[i-1];if(d>0)g+=d;else l-=d;}
  return +(100-100/(1+(g/(l||0.001)))).toFixed(1);
}
function computeMACD(prices){
  if(prices.length<3)return{macd:0,signal:0,hist:0,cross:"neutral"};
  const ema=(a,n)=>{const k=2/(n+1);let e=a[0];for(let i=1;i<a.length;i++)e=a[i]*k+e*(1-k);return e;};
  const s=prices.slice(-Math.min(prices.length,35));
  const macd=ema(s,12)-ema(s,26);
  const p=prices.slice(-Math.min(prices.length,36),-1);
  const pm=ema(p,12)-ema(p,26);
  const signal=macd*0.2+pm*0.8;
  const cross=macd>signal&&pm<=signal?"bullish-cross":macd<signal&&pm>=signal?"bearish-cross":macd>signal?"bullish":"bearish";
  return{macd:+macd.toFixed(6),signal:+signal.toFixed(6),hist:+(macd-signal).toFixed(6),cross};
}
function computeEMA(prices,n){if(!prices.length)return 0;const k=2/(n+1);let e=prices[0];for(let i=1;i<prices.length;i++)e=prices[i]*k+e*(1-k);return+e.toFixed(4);}

function buildSignal(key,history,mW=0.40,rW=0.35,eW=0.25){
  const prices=history||[];
  const cur=prices.length?prices[prices.length-1]:(BASE[key]?.price||100);
  const chg=prices.length>1?+((cur-prices[prices.length-2])/prices[prices.length-2]*100).toFixed(2):(BASE[key]?.change||0);
  const rsi=computeRSI(prices);
  const macd=computeMACD(prices);
  const e20=computeEMA(prices.slice(-20),20)||cur;
  const e50=computeEMA(prices.slice(-50),50)||cur;
  const volStatus=BASE[key]?.vol||"normal";

  const rsiScore=rsi<28?90:rsi<40?72:rsi<55?50:rsi<68?30:12;
  const macdScore=macd.cross==="bullish-cross"?92:macd.cross==="bullish"?67:macd.cross==="bearish-cross"?10:35;
  const emaScore=cur>e20&&cur>e50?76:cur<e20&&cur<e50?26:50;
  const volBonus=volStatus==="above"?4:volStatus==="below"?-3:0;

  const raw=rsiScore*rW+macdScore*mW+emaScore*eW+volBonus;
  const score=Math.round(Math.min(97,Math.max(3,raw)));
  const action=score>=66?"BUY":score<=34?"SELL":"HOLD";
  const grade=score>=80?"A":score>=65?"B":score>=50?"C":"D";

  const rsiLabel=rsi<30?"Oversold — potential bounce":rsi<45?"Mild selling pressure":rsi<55?"Neutral territory":rsi<70?"Mild buying pressure":"Overbought — potential pullback";
  const emaLabel=cur>e20&&cur>e50?"Above Both — uptrend confirmed":cur<e20&&cur<e50?"Below Both — downtrend confirmed":"Mixed — no clear trend";
  const macdLabel=macd.cross==="bullish-cross"?"Bullish Cross ↑":macd.cross==="bearish-cross"?"Bearish Cross ↓":macd.cross==="bullish"?"Bullish ↑":"Bearish ↓";
  const volLabel=volStatus==="above"?"Above Average — signal is stronger":volStatus==="below"?"Below Average — signal less reliable":"Average Volume";

  const atrPct=0.025+Math.abs(chg)*0.005;
  const entry=+cur.toFixed(2);
  const target=action==="BUY"?+(cur*(1+atrPct*3.2)).toFixed(2):+(cur*(1-atrPct*2.5)).toFixed(2);
  const stop=action==="BUY"?+(cur*(1-atrPct*1.2)).toFixed(2):+(cur*(1+atrPct*1.2)).toFixed(2);
  const expRet=+(((target-entry)/entry)*100).toFixed(1);
  const expDD=+(((stop-entry)/entry)*100).toFixed(1);
  const rr=+Math.abs(expRet/(Math.abs(expDD)||1)).toFixed(2);
  const winRate=score>=80?68:score>=65?58:score>=50?48:36;

  return{key,cur,chg,rsi,rsiLabel,macd,macdLabel,e20,e50,emaLabel,score,action,grade,expRet,expDD,rr,winRate,entry,target,stop,volStatus,volLabel};
}

// ─── PREDICTION ENGINE ────────────────────────────────────────────
const SENS={
  gold:{e:0.010,d:-0.006,v:0.003},silver:{e:0.009,d:-0.005,v:0.003},
  crude:{e:0.014,d:-0.009,v:0.004},brent:{e:0.013,d:-0.008,v:0.004},
  natgas:{e:0.012,d:-0.007,v:0.005},copper:{e:0.007,d:-0.008,v:0.004},
  wheat:{e:0.011,d:-0.006,v:0.005},hal:{e:0.012,d:-0.004,v:0.004},
  bel:{e:0.011,d:-0.003,v:0.003},mazagon:{e:0.013,d:-0.005,v:0.004},
  ongc:{e:0.010,d:-0.006,v:0.003},gail:{e:0.009,d:-0.005,v:0.003},
  coalind:{e:0.008,d:-0.005,v:0.003},nifty:{e:-0.007,d:0.009,v:0.003},
  bnifty:{e:-0.008,d:0.010,v:0.003},muthoot:{e:0.009,d:-0.004,v:0.003},
  titan:{e:0.006,d:-0.003,v:0.002},usdinr:{e:0.004,d:-0.003,v:0.002},
  vix:{e:0.030,d:-0.020,v:0.006},btc:{e:0.018,d:-0.015,v:0.008},
  eth:{e:0.016,d:-0.013,v:0.007},dxy:{e:0.005,d:-0.003,v:0.002},
};

function genPaths(key,base,params,newsDelta=0){
  const s=SENS[key]||SENS.gold;
  const effEsc=Math.min(95,Math.max(5,params.escalation+newsDelta*100));
  const eStr=(effEsc/100)*(params.confidence/100);
  const dStr=((100-effEsc)/100)*(params.confidence/100);
  const volM=params.volatility/50;
  const days=Math.max(5,Math.round(30*(params.timeHorizon/100)));
  const seed=key.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const hist=[];
  let hp=base*0.972;
  for(let i=-14;i<=0;i++){
    hp+=(base-hp)*0.15+Math.sin(i*seed)*0.004*hp+(Math.random()-0.5)*0.005*hp;
    if(i===0)hp=base;
    hist.push({t:i,actual:+hp.toFixed(2)});
  }
  let ep=base,dp=base;
  for(let i=1;i<=days;i++){
    ep=ep*(1+s.e*eStr*(1+Math.sin(i*seed*0.13)*volM*0.5));
    dp=dp*(1+s.d*dStr*(1+Math.cos(i*seed*0.09)*volM*0.5));
    const bw=s.v*volM*Math.sqrt(i);
    hist.push({t:i,escalation:+ep.toFixed(2),deesc:+dp.toFixed(2),
      escHi:+(ep*(1+bw)).toFixed(2),escLo:+(ep*(1-bw)).toFixed(2),
      descHi:+(dp*(1+bw*0.7)).toFixed(2),descLo:+(dp*(1-bw*0.7)).toFixed(2)});
  }
  return{data:hist,escTarget:+ep.toFixed(2),dscTarget:+dp.toFixed(2),effEsc,
    escPct:+((ep-base)/base*100).toFixed(2),dscPct:+((dp-base)/base*100).toFixed(2),
    bull:+(base*(1+Math.abs(s.e)*2.5)).toFixed(2),bear:+(base*(1+s.d*2.0)).toFixed(2),
    baseCase:+((ep+dp)/2).toFixed(2),
    tracking:Math.abs(ep-base)>Math.abs(dp-base)?"escalation":"deescalation"};
}

// ─── NEWS ─────────────────────────────────────────────────────────
const NMAP=[
  {kw:["oil","crude","opec","barrel","hormuz","petroleum"],assets:["crude","brent","ongc","gail"],d:0.08},
  {kw:["gold","xau","bullion","safe haven","precious"],assets:["gold","silver","muthoot","titan"],d:0.07},
  {kw:["silver","xag"],assets:["silver","gold"],d:0.06},
  {kw:["natural gas","lng","gazprom"],assets:["natgas","gail"],d:0.07},
  {kw:["wheat","grain","food","ukraine"],assets:["wheat"],d:0.06},
  {kw:["defence","defense","military","weapon","war","attack","airstrike","nato","missile"],assets:["hal","bel","mazagon","gold","crude"],d:0.09},
  {kw:["sanction","embargo"],assets:["crude","brent","gold","usdinr"],d:0.07},
  {kw:["ceasefire","peace","truce","deal"],assets:["gold","crude","hal","bel"],d:-0.08},
  {kw:["bitcoin","btc","crypto"],assets:["btc","eth"],d:0.05},
  {kw:["rupee","rbi","inr"],assets:["usdinr","nifty","bnifty"],d:0.04},
  {kw:["copper","base metal"],assets:["copper"],d:0.04},
];

function scoreNews(t="",d=""){
  const tx=(t+" "+d).toLowerCase();
  let delta=0;const assets=new Set();
  NMAP.forEach(({kw,assets:a,d:dv})=>{if(kw.some(k=>tx.includes(k))){delta+=dv;a.forEach(x=>assets.add(x));}});
  return{delta:Math.max(-0.3,Math.min(0.3,delta)),assets:[...assets],
    impact:delta>0.05?"bullish":delta<-0.05?"bearish":"neutral",
    importance:Math.abs(delta)>0.08?"high":Math.abs(delta)>0.05?"medium":"low"};
}

async function fetchNews(){
  const queries=["Russia Ukraine war oil","Middle East Iran conflict","India defence HAL BEL","gold silver geopolitical","OPEC crude sanctions","India NIFTY economy","Bitcoin crypto","wheat copper gas","India stocks NSE breakout"];
  const all=[],seen=new Set();
  await Promise.allSettled(queries.map(async q=>{
    try{
      const rss=`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
      const j=await(await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=5`)).json();
      (j.items||[]).forEach(item=>{
        const k=item.title?.slice(0,50);
        if(k&&!seen.has(k)){
          seen.add(k);
          const sc=scoreNews(item.title,item.description||"");
          const src=(item.author||"").toLowerCase();
          const tier=["reuters","bloomberg","economic times","mint","livemint","business standard","ft"].some(x=>src.includes(x))?1:2;
          all.push({title:item.title?.replace(/ - .*$/,"")||"",source:item.author||"News",
            time:new Date(item.pubDate).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
            pubDate:new Date(item.pubDate),link:item.link,tier,...sc});
        }
      });
    }catch{}
  }));
  return all.sort((a,b)=>b.pubDate-a.pubDate).slice(0,40);
}

async function fetchPrice(sym,timeout=7000){
  const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=60d`;
  const proxy=`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const ctrl=new AbortController();const id=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const j=await(await fetch(proxy,{signal:ctrl.signal})).json();
    clearTimeout(id);
    const res=j?.chart?.result?.[0];if(!res)return null;
    const closes=(res.indicators?.quote?.[0]?.close||[]).filter(Boolean);
    const meta=res.meta;const price=meta.regularMarketPrice??meta.previousClose??0;
    const prev=meta.previousClose??price;
    const vol=res.indicators?.quote?.[0]?.volume||[];
    const avgVol=vol.length>10?vol.slice(-20).reduce((a,b)=>a+(b||0),0)/20:0;
    const lastVol=vol[vol.length-1]||0;
    const volStatus=avgVol>0?(lastVol>avgVol*1.2?"above":lastVol<avgVol*0.7?"below":"normal"):"normal";
    return{price:+price.toFixed(2),change:prev?+((price-prev)/prev*100).toFixed(2):0,history:closes.slice(-55),stale:false,volStatus};
  }catch{clearTimeout(id);return null;}
}

async function fetchAllPrices(last={}){
  const entries=Object.entries(ASSETS);
  const results=await Promise.allSettled(entries.map(([,v])=>fetchPrice(v.sym)));
  const out={};
  results.forEach((r,i)=>{
    const key=entries[i][0];
    if(r.status==="fulfilled"&&r.value)out[key]=r.value;
    else out[key]=last[key]?{...last[key],stale:true}:{price:BASE[key]?.price||0,change:BASE[key]?.change||0,history:[],stale:true,volStatus:BASE[key]?.vol||"normal"};
  });
  return out;
}

function pearson(x,y){
  const n=Math.min(x.length,y.length);if(n<5)return 0;
  const mx=x.slice(0,n).reduce((a,b)=>a+b,0)/n,my=y.slice(0,n).reduce((a,b)=>a+b,0)/n;
  let num=0,dx2=0,dy2=0;
  for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;num+=dx*dy;dx2+=dx*dx;dy2+=dy*dy;}
  const d=Math.sqrt(dx2*dy2);return d===0?0:+(num/d).toFixed(3);
}

// ─── CALENDAR ─────────────────────────────────────────────────────
const TODAY=new Date();
function daysFrom(d){return Math.round((new Date(d)-TODAY)/86400000);}
const CALENDAR=[
  {date:"2026-03-19",event:"US Federal Reserve FOMC Decision",type:"Central Bank",importance:"market-moving",assets:["gold","usdinr","btc","nifty"],historical:"Last 5: Gold +1.8% dovish, -1.2% hawkish. NIFTY -1.5% on surprise hike.",preEvent:"Reduce equity exposure 48h before. Gold longs safe through Fed uncertainty.",postEvent:"Watch DXY first 30min — tells you EM asset direction for rest of day."},
  {date:"2026-03-21",event:"India CPI Inflation Data",type:"Macro",importance:"high",assets:["nifty","bnifty","usdinr","gold"],historical:"Last 5: BankNifty +1.4% in-line, -1.8% upside surprise.",preEvent:"Neutral. Wait for the print before entering rate-sensitive trades.",postEvent:"CPI above 5.5% → reduce BankNifty. Below 4.5% → add BankNifty."},
  {date:"2026-04-02",event:"RBI Monetary Policy (MPC)",type:"Central Bank",importance:"market-moving",assets:["nifty","bnifty","usdinr","gail","ongc"],historical:"Last 5: BankNifty +2.1% cut, -2.8% hike, +0.4% hold.",preEvent:"Inflation cooling → long BankNifty into meeting. Reduce crude-linked first.",postEvent:"BankNifty direction in first 30min sustained all day 80% of time."},
  {date:"2026-04-03",event:"US Non-Farm Payrolls (NFP)",type:"Macro",importance:"high",assets:["gold","dxy","usdinr","btc"],historical:"Last 5: Gold -0.9% strong NFP, +1.2% weak NFP.",preEvent:"Hold gold. Weak jobs = gold rally. Strong jobs = DXY rally.",postEvent:"DXY reaction tells you gold direction within 2 hours."},
  {date:"2026-04-10",event:"US CPI Inflation",type:"Macro",importance:"market-moving",assets:["gold","crude","usdinr","nifty","btc"],historical:"Hot CPI = gold +1.5%. Cool CPI = gold -0.8%.",preEvent:"Gold longs hold through CPI. Watch energy component for crude.",postEvent:"Regime shift possible if CPI surprises by more than 0.3%."},
  {date:"2026-04-15",event:"OPEC+ Production Review",type:"Commodity",importance:"high",assets:["crude","brent","ongc","gail","coalind"],historical:"Last 3 cuts: Crude avg +4.2% in 48hrs. Hold decisions: +0.8%.",preEvent:"Add crude/ONGC 2 days before. Market prices cut early.",postEvent:"No cut = crude -3 to -5%. Have stop loss at entry price."},
  {date:"2026-04-20",event:"India Q4 GDP Estimate",type:"Macro",importance:"high",assets:["nifty","bnifty","usdinr"],historical:"Above 7% = NIFTY +1.5%. Below 6.5% = -0.9%.",preEvent:"Neutral. Don't add large positions ahead of GDP print.",postEvent:"Strong GDP + RBI hold = best bank environment. Add BankNifty."},
  {date:"2026-05-01",event:"US Federal Reserve FOMC Decision",type:"Central Bank",importance:"market-moving",assets:["gold","usdinr","btc","nifty"],historical:"May FOMC historically dovish. Gold +1.8% avg on dovish dot plot.",preEvent:"Reduce leveraged positions 48hrs before.",postEvent:"Fed language matters more than rate itself. Read statement carefully."},
  {date:"2026-05-07",event:"RBI Monetary Policy (MPC)",type:"Central Bank",importance:"market-moving",assets:["nifty","bnifty","usdinr"],historical:"BankNifty +2.1% cut, -2.8% hike.",preEvent:"Prior dovish meeting → BankNifty long into next meeting.",postEvent:"USDINR reaction tells you FII sentiment immediately."},
  {date:"2026-06-04",event:"OPEC+ Production Review",type:"Commodity",importance:"high",assets:["crude","brent","ongc","gail"],historical:"Cut = crude +4%, hold = crude +0.5%, increase = crude -3%.",preEvent:"Monitor Saudi Arabia signals 1 week before — they telegraph cuts.",postEvent:"Brent/WTI spread narrows after cut. ONGC outperforms OMCs."},
].filter(e=>daysFrom(e.date)>=-1&&daysFrom(e.date)<=46).sort((a,b)=>new Date(a.date)-new Date(b.date));

// ─── WATCHLIST META ───────────────────────────────────────────────
const WL_META=[
  {key:"hal",sector:"Defence",regime:"escalation",thesis:"Defence budget +12% YoY. ₹94,000Cr order book. Direct conflict cycle beneficiary.",action:"Ready",trigger:"Entry above ₹4,250 with volume above average",invalidation:"Conflict resolution confirmed or defence budget cut",thesisScore:88},
  {key:"bel",sector:"Defence",regime:"escalation",thesis:"Electronic warfare demand accelerating. FY26 order inflows at record pace.",action:"Ready",trigger:"Breakout above ₹235 on strong volume",invalidation:"SEBI capex concerns or conflict de-escalation",thesisScore:82},
  {key:"mazagon",sector:"Defence",regime:"escalation",thesis:"Only listed Indian shipyard. 6 submarines + 3 destroyers in active pipeline.",action:"Wait",trigger:"Retest ₹2,750 support before entry",invalidation:"Navy budget reallocation",thesisScore:79},
  {key:"ongc",sector:"Energy",regime:"escalation",thesis:"Every $1 crude rise = ~₹250Cr ONGC earnings uplift. Direct upstream leverage.",action:"Ready",trigger:"Crude sustains above $70 for 3+ sessions",invalidation:"Crude drops below $62 or windfall tax reimposed",thesisScore:75},
  {key:"gail",sector:"Gas/LNG",regime:"escalation",thesis:"LNG supply disruption premium. Fixed transmission fees = earnings visibility.",action:"Wait",trigger:"Dip to ₹185-190 support zone",invalidation:"Russia-EU gas normalisation",thesisScore:71},
  {key:"gold",sector:"Commodity",regime:"escalation",thesis:"Classic safe-haven. Central bank buying accelerating. Every escalation = +0.5-2%.",action:"Ready",trigger:"Any escalation headline or DXY below 102",invalidation:"Ceasefire confirmed + Fed rate hike cycle restarts",thesisScore:90},
  {key:"silver",sector:"Commodity",regime:"escalation",thesis:"Lags gold 3-5 days then outperforms. Silver/Gold ratio below 88 = undervalued.",action:"Breakout",trigger:"Silver/Gold ratio below 88 or silver above $36.50",invalidation:"Industrial demand collapses",thesisScore:83},
  {key:"crude",sector:"Commodity",regime:"escalation",thesis:"Hormuz risk premium + OPEC discipline. Supply tight, demand recovering.",action:"Ready",trigger:"Iran/Hormuz headline or OPEC cut signal",invalidation:"Ceasefire + OPEC output increase",thesisScore:77},
  {key:"muthoot",sector:"Finance",regime:"escalation",thesis:"Gold loan AUM grows with gold price. Direct leveraged gold equity exposure.",action:"Wait",trigger:"Gold sustains above $3,200 for 5 sessions",invalidation:"RBI gold loan regulation tightening",thesisScore:72},
  {key:"btc",sector:"Crypto",regime:"neutral",thesis:"Digital gold narrative activating. ETF demand + institutional flows growing.",action:"Wait",trigger:"BTC reclaims $85,000 with volume confirmation",invalidation:"Regulatory crackdown or broad risk-off selloff",thesisScore:65},
];

const STRESS=[
  {name:"Crude +15%",icon:"🛢️",winners:["ongc","gail","coalind","gold","silver"],losers:["nifty","bnifty","titan"],hedge:"Short BankNifty futures",note:"Inflation spike → RBI hawkish. Upstream gains, OMCs hurt."},
  {name:"INR Weakens 3%",icon:"₹",winners:["ongc","hal","btc","gold"],losers:["nifty","bnifty"],hedge:"Long USD/INR forwards",note:"FII outflows. Import-heavy sectors hurt. IT benefits from USD revenues."},
  {name:"Fed Turns Hawkish",icon:"🏦",winners:["dxy","usdinr"],losers:["gold","btc","nifty","bnifty"],hedge:"Long DXY, short EM equities",note:"EM capital outflows. Gold sells on USD strength."},
  {name:"Global Risk-Off",icon:"⚠️",winners:["gold","silver","wheat"],losers:["btc","nifty","copper","eth"],hedge:"Long gold, short NIFTY",note:"BTC drops first in risk-off. Gold rallies."},
  {name:"Iran Closes Hormuz",icon:"🚢",winners:["crude","brent","gold","hal","bel"],losers:["nifty","bnifty","usdinr"],hedge:"Long crude + defence stocks",note:"Extreme crude spike. India imports 80% oil = inflation shock."},
  {name:"Russia-Ukraine Ceasefire",icon:"🕊️",winners:["nifty","bnifty","copper","wheat"],losers:["gold","hal","bel","crude"],hedge:"Long NIFTY, reduce defence + gold",note:"Risk-on globally. Defence stocks correct 5-15%."},
  {name:"India Stays Strong",icon:"🇮🇳",winners:["bnifty","nifty","gail","coalind"],losers:["usdinr","dxy"],hedge:"Long domestic consumption",note:"Decoupling from global weakness. RBI accommodative."},
  {name:"BTC Breaks Down",icon:"₿",winners:["gold","silver"],losers:["btc","eth"],hedge:"Long gold as substitute",note:"Crypto-to-gold rotation. Indian equities largely unaffected."},
];

// ─── CLAUDE API ───────────────────────────────────────────────────
async function callClaude(prompt){
  // Vercel API route — handles authentication server-side
  try{
    const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
    if(!r.ok){const e=await r.text();throw new Error(e);}
    const d=await r.json();
    return d.text||"No response generated.";
  }catch(err){
    console.error("Claude error:",err);
    return`⚠️ Claude API error: ${err.message}\n\nMake sure:\n1. You have created /api/claude.js in your Vercel project\n2. ANTHROPIC_API_KEY is set in Vercel environment variables`;
  }
}

async function getAISliderRec(news,prices){
  const topNews=news.slice(0,8).map(n=>`${n.title} [${n.impact}]`).join("\n");
  const px=(k)=>{const p=prices[k]||BASE[k];return`${ASSETS[k]?.label} ${(p?.change||0)>0?"+":""}${p?.change||0}%`;};
  const chgs=["gold","crude","hal","bel","vix","btc"].map(px).join(", ");
  return callClaude(`You are a macro analyst. Based on today's news and market moves, recommend the 4 scenario slider values for an Indian trader dashboard.

TODAY'S MARKET MOVES: ${chgs}
TOP HEADLINES:\n${topNews}

Return ONLY a JSON object with exactly these keys and integer values:
{"escalation": 0-100, "confidence": 10-100, "volatility": 10-100, "timeHorizon": 10-100}

escalation = probability geopolitical conflict escalates further today (0=definite ceasefire, 100=extreme escalation)
confidence = how confident you are in the forecast given available data
volatility = expected market volatility today
timeHorizon = how far ahead this forecast is reliable (100=full 30 days, 10=only 3 days)

Only return the JSON, nothing else.`);
}

async function fetchAlphaPicks(prices,signals,params,newsDelta,news){
  const topSigs=Object.entries(signals).filter(([,s])=>s?.score&&s.score!==50).sort((a,b)=>Math.abs(b[1].score-50)-Math.abs(a[1].score-50)).slice(0,6).map(([k,s])=>`${ASSETS[k]?.label}: Score ${s.score}/100 (${s.action}), RSI ${s.rsi} [${s.rsiLabel.split("—")[0].trim()}], MACD ${s.macdLabel}, Vol ${s.volStatus}, Win% ${s.winRate}%, RR ${s.rr}:1`).join("\n");
  const px=(k)=>{const p=prices[k]||BASE[k];return`${ASSETS[k]?.label}: ${ASSETS[k]?.unit}${(p?.price||0).toLocaleString("en-IN",{maximumFractionDigits:2})} (${(p?.change||0)>0?"+":""}${p?.change||0}%)`;};
  const priceStr=["gold","silver","crude","brent","hal","bel","ongc","nifty","btc","eth","mazagon","natgas","wheat"].map(px).join(" | ");
  const topNews=news.slice(0,6).map(n=>`${n.title} [${n.impact}/${n.importance}]`).join("\n");
  return callClaude(`You are an institutional portfolio manager for an Indian trader with ₹20 lakh capital targeting 200-300% returns in 3 months. They use Zerodha and ICICI Direct.

LIVE PRICES: ${priceStr}
TOP SIGNALS:\n${topSigs}
SCENARIO: Escalation ${params.escalation}% (news-adj: ${Math.round(params.escalation+newsDelta*100)}%), Confidence ${params.confidence}%
HEADLINES:\n${topNews}

Generate 3 high-conviction trade recommendations. For EACH give BOTH:
🟡 MODERATE (cash market, 2-8 week swing)
🔴 AGGRESSIVE (higher conviction, flag F&O if relevant)

For EACH scenario use EXACTLY this format:
ASSET: | ENTRY: | TARGET: ([upside%]) | STOP LOSS: ([downside%]) | POSITION: ₹amount ([% of ₹20L]) | TIMEFRAME: | CONVICTION: A/B/C/D | REWARD/RISK: :1 | WIN RATE: % | BULL CASE: | BEAR CASE: | INVALIDATION: | WHY NOW: | WHY NOT ALTERNATIVES:

End with:
MODEL CREDIBILITY: LAST 20 HIT RATE: | AVG WIN: | AVG LOSS: | BEST REGIME: | WEAKNESS:

Never recommend more than 15% of capital per trade. Be honest about uncertainty.`);
}

async function fetchBriefing(prices,params,newsDelta,news){
  const px=(k)=>{const p=prices[k]||BASE[k];return`${ASSETS[k]?.label} ${ASSETS[k]?.unit}${(p?.price||0).toLocaleString("en-IN",{maximumFractionDigits:2})} (${(p?.change||0)>0?"+":""}${p?.change||0}%)`;};
  const priceStr=["gold","silver","crude","hal","bel","ongc","nifty","btc","usdinr","vix"].map(px).join(", ");
  const topNews=news.slice(0,8).map((n,i)=>`${i+1}. [Tier ${n.tier}] ${n.title} — ${n.impact.toUpperCase()}`).join("\n");
  return callClaude(`Institutional analyst for Indian trader (₹20L, 200-300% target, Zerodha + ICICI Direct).
LIVE DATA: ${priceStr}
SCENARIO: Escalation ${params.escalation}% (news adj: ${Math.round(params.escalation+newsDelta*100)}%)
HEADLINES:\n${topNews}

Morning briefing in EXACT structure:
**REGIME:** [one line]
**WHAT CHANGED SINCE YESTERDAY:** [2-3 genuine new bullets]
**WHAT MATTERS vs NOISE:** Matters: [2 things] | Noise: [1-2 things]
**POSITION IMPACT:** [each relevant asset: strengthen/weaken/exit + why]
**TOP 3 OPPORTUNITIES TODAY:** [ranked with reasoning]
**KEY RISK:** [specific measurable trigger level]
**GOLD & SILVER OUTLOOK:** [3 sentences, specific price levels]
**WILDCARD:** [one contrarian idea]
Under 300 words. Direct, specific, reference actual prices.`);
}

async function fetchDiscoveredStocks(news,existingKeys){
  const headlines=news.slice(0,15).map(n=>n.title).join("\n");
  const existing=existingKeys.map(k=>ASSETS[k]?.label||k).join(", ");
  return callClaude(`You are an Indian stock market analyst. Based on these news headlines, identify NSE-listed stocks that are NOT in our existing watchlist but show opportunity today.

EXISTING WATCHLIST: ${existing}

TODAY'S HEADLINES:\n${headlines}

Identify 3-5 stocks. Return ONLY a JSON array:
[{"symbol":"NSE_SYMBOL","name":"Company Name","reason":"Why it appeared in news","opportunity":"Brief opportunity description","alert":"high/medium/low","sector":"sector name"}]

Only include genuinely NSE-listed Indian stocks. Only return JSON.`);
}

// ─── UI ATOMS ────────────────────────────────────────────────────
function Tag({children,color=C.muted,small}){return <span style={{background:`${color}18`,color,borderRadius:20,padding:small?"1px 7px":"3px 10px",fontSize:small?10:11,fontWeight:600,letterSpacing:0.3,whiteSpace:"nowrap",display:"inline-block"}}>{children}</span>;}
function Delta({v,small}){const up=v>=0;return <span style={{color:up?C.green:C.red,fontWeight:700,fontSize:small?11:13,fontFamily:MONO}}>{up?"▲":"▼"} {Math.abs(v).toFixed(2)}%</span>;}
function Card({children,style={},noPad}){return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:noPad?0:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",...style}}>{children}</div>;}
function Explain({text}){return <div style={{fontSize:10,color:C.muted,marginTop:3,lineHeight:1.4,fontStyle:"italic"}}>{text}</div>;}
function SHead({title,sub,action}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}><div><div style={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.navy,lineHeight:1.2}}>{title}</div>{sub&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{sub}</div>}</div>{action}</div>;}
function LiveDot({color=C.green}){return <span className="pulse" style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:color,marginRight:5}}/>;}
function Spin({size=14,color="#fff"}){return <div style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${color}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>;}
function ImpDot({level}){const map={"market-moving":C.red,"high":C.orange,"medium":C.amber,"low":C.dim};const lbl={"market-moving":"🔴 Market-Moving","high":"🟠 High","medium":"🟡 Medium","low":"⚪ Low"};return <span style={{fontSize:11,fontWeight:700,color:map[level]||C.dim}}>{lbl[level]||level}</span>;}

function RangeSlider({label,value,min,max,step,onChange,color,unit="",hint,aiVal,onApplyAI}){
  return <div style={{marginBottom:18}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"flex-start",flexWrap:"wrap",gap:4}}>
      <div><div style={{fontSize:12,color:C.textMid,fontWeight:600}}>{label}</div>{hint&&<Explain text={hint}/>}</div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {aiVal!==undefined&&aiVal!==value&&(
          <button onClick={onApplyAI} style={{fontSize:10,fontWeight:700,color:C.purple,background:`${C.purple}12`,border:`1px solid ${C.purple}30`,borderRadius:12,padding:"2px 8px",cursor:"pointer"}}>
            ✦ AI: {aiVal}{unit}
          </button>
        )}
        <span style={{fontSize:15,fontWeight:700,color,fontFamily:MONO}}>{value}{unit}</span>
      </div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
      style={{background:`linear-gradient(90deg,${color} ${((value-min)/(max-min))*100}%,${C.border} 0)`,accentColor:color}}/>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
      <span style={{fontSize:9,color:C.dim}}>{min}{unit}</span>
      <span style={{fontSize:9,color:C.dim}}>{max}{unit}</span>
    </div>
  </div>;
}

function TVChart({symbol,interval="D"}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current)return;ref.current.innerHTML="";
    const s=document.createElement("script");
    s.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    s.async=true;
    s.innerHTML=JSON.stringify({autosize:true,symbol,interval,timezone:"Asia/Kolkata",theme:"light",style:"1",locale:"en",enable_publishing:false,hide_top_toolbar:false,hide_legend:false,save_image:false,backgroundColor:"rgba(255,255,255,1)"});
    ref.current.appendChild(s);
  },[symbol,interval]);
  return <div ref={ref} style={{height:"100%",width:"100%",minHeight:380}}/>;
}

function PredChart({assetKey,base,params,newsDelta}){
  const pred=useMemo(()=>genPaths(assetKey,base,params,newsDelta),[assetKey,base,params,newsDelta]);
  const unit=ASSETS[assetKey]?.unit||"";
  const CT=({active,payload,label})=>{
    if(!active||!payload?.length)return null;
    return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:11,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
      <div style={{color:C.muted,marginBottom:4,fontWeight:600}}>{label===0?"Today":label>0?`+${label} days`:`${label} days`}</div>
      {payload.map(p=>p.value&&<div key={p.dataKey} style={{color:p.color,fontWeight:600,fontFamily:MONO}}>{p.name}: {unit}{Number(p.value).toLocaleString("en-IN",{maximumFractionDigits:2})}</div>)}
    </div>;
  };
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      <Tag color={pred.tracking==="escalation"?C.red:C.green}>{pred.tracking==="escalation"?"🔴 Currently tracking escalation path":"🟢 Currently tracking de-escalation path"}</Tag>
      {newsDelta!==0&&<Tag color={C.purple}>📰 News nudge: {newsDelta>0?"+":""}{(newsDelta*100).toFixed(0)}%</Tag>}
      <Tag color={C.muted}>Eff. {Math.round(pred.effEsc)}%</Tag>
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:16,marginBottom:8,fontSize:10,color:C.muted,flexWrap:"wrap"}}>
      <span><span style={{color:C.navy,fontWeight:700}}>——</span> Actual price (historical)</span>
      <span><span style={{color:C.red,fontWeight:700}}>- -</span> If conflict escalates</span>
      <span><span style={{color:C.green,fontWeight:700}}>- -</span> If conflict de-escalates</span>
      <span style={{color:C.dim}}>Shaded area = confidence band (how wide the range could be)</span>
    </div>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={pred.data} margin={{top:4,right:4,bottom:4,left:4}}>
        <defs>
          <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={0.15}/><stop offset="95%" stopColor={C.red} stopOpacity={0.02}/></linearGradient>
          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.15}/><stop offset="95%" stopColor={C.green} stopOpacity={0.02}/></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.5}/>
        <XAxis dataKey="t" tick={{fontSize:9,fill:C.dim}} tickLine={false} tickFormatter={v=>v===0?"Today":v>0?`+${v}d`:`${v}d`}/>
        <YAxis tick={{fontSize:9,fill:C.dim}} tickLine={false} axisLine={false} width={64} tickFormatter={v=>v?.toLocaleString("en-IN",{maximumFractionDigits:0})}/>
        <Tooltip content={<CT/>}/>
        <ReferenceLine x={0} stroke={C.borderDark} strokeDasharray="4 2" label={{value:"Today",position:"top",fontSize:9,fill:C.muted}}/>
        <Area dataKey="escHi" fill="none" stroke={C.red} strokeWidth={0.5} strokeDasharray="2 2" dot={false} connectNulls name="Esc High"/>
        <Area dataKey="escLo" fill="url(#eg)" stroke={C.red} strokeWidth={0.5} strokeDasharray="2 2" dot={false} connectNulls name="Esc Low"/>
        <Area dataKey="descHi" fill="none" stroke={C.green} strokeWidth={0.5} strokeDasharray="2 2" dot={false} connectNulls name="De-esc High"/>
        <Area dataKey="descLo" fill="url(#dg)" stroke={C.green} strokeWidth={0.5} strokeDasharray="2 2" dot={false} connectNulls name="De-esc Low"/>
        <Line dataKey="actual" name="Actual Price" stroke={C.navy} strokeWidth={2.5} dot={false} connectNulls/>
        <Line dataKey="escalation" name="Escalation Path" stroke={C.red} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls/>
        <Line dataKey="deesc" name="De-esc Path" stroke={C.green} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls/>
      </AreaChart>
    </ResponsiveContainer>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:10}}>
      {[
        {l:"CURRENT",v:`${unit}${base.toLocaleString("en-IN",{maximumFractionDigits:2})}`,c:C.navy,tip:"Today's live price"},
        {l:"BULL CASE",v:`${unit}${pred.bull.toLocaleString("en-IN",{maximumFractionDigits:0})}`,c:C.green,tip:"Best realistic outcome"},
        {l:"BASE CASE",v:`${unit}${pred.baseCase.toLocaleString("en-IN",{maximumFractionDigits:0})}`,c:C.blue,tip:"Most likely outcome"},
        {l:"BEAR CASE",v:`${unit}${pred.bear.toLocaleString("en-IN",{maximumFractionDigits:0})}`,c:C.red,tip:"Worst realistic outcome"},
      ].map(({l,v,c,tip})=>(
        <div key={l} style={{background:C.panel,borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:1,marginBottom:2}}>{l}</div>
          <div style={{fontSize:13,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div>
          <div style={{fontSize:9,color:C.dim,marginTop:2}}>{tip}</div>
        </div>
      ))}
    </div>
  </div>;
}

function SignalCard({sig}){
  if(!sig)return null;
  const info=ASSETS[sig.key];
  const ac=sig.action==="BUY"?C.green:sig.action==="SELL"?C.red:C.amber;
  const gradeColor=sig.grade==="A"?C.green:sig.grade==="B"?C.blue:sig.grade==="C"?C.amber:C.red;
  const volColor=sig.volStatus==="above"?C.green:sig.volStatus==="below"?C.red:C.muted;
  const entryPct=+(((sig.target-sig.entry)/sig.entry)*100).toFixed(1);
  const stopPct=+(((sig.stop-sig.entry)/sig.entry)*100).toFixed(1);
  return (
    <Card style={{borderTop:`3px solid ${ac}`}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:C.navy}}>{info?.label}</div>
          <div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:1,textTransform:"uppercase",letterSpacing:0.8}}>{info?.cat} · {info?.theme}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:16,fontWeight:700,fontFamily:MONO,color:C.navy}}>{info?.unit}{sig.cur.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
          <Delta v={sig.chg} small/>
        </div>
      </div>
      {/* Technical indicators */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <div style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>RSI ({sig.rsi})</div>
          <div style={{fontSize:12,fontWeight:700,color:sig.rsi<30?C.green:sig.rsi>70?C.red:C.textMid}}>{sig.rsi<30?"Oversold":sig.rsi>70?"Overbought":"Neutral"}</div>
          <Explain text={sig.rsi<30?"Price may be too low — possible bounce coming":sig.rsi>70?"Price may be too high — possible pullback coming":"No extreme pressure either way"}/>
        </div>
        <div style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>MACD</div>
          <div style={{fontSize:12,fontWeight:700,color:sig.macd.cross.includes("bullish")?C.green:C.red}}>{sig.macdLabel}</div>
          <Explain text={sig.macd.cross==="bullish-cross"?"Momentum just turned up — early buy signal":sig.macd.cross==="bearish-cross"?"Momentum just turned down — early sell signal":sig.macd.cross==="bullish"?"Upward momentum continuing":"Downward momentum continuing"}/>
        </div>
        <div style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>TREND (EMA)</div>
          <div style={{fontSize:12,fontWeight:700,color:sig.emaLabel.includes("Above")?C.green:sig.emaLabel.includes("Below")?C.red:C.amber}}>{sig.emaLabel.split("—")[0]}</div>
          <Explain text={sig.emaLabel.includes("Above")?"Price is above both moving averages — uptrend in place":sig.emaLabel.includes("Below")?"Price below both averages — downtrend in place":"Mixed trend — be cautious"}/>
        </div>
      </div>
      {/* Volume */}
      <div style={{background:C.panel,borderRadius:8,padding:"8px 10px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:1}}>VOLUME CONFIRMATION</div>
          <div style={{fontSize:12,fontWeight:700,color:volColor}}>{sig.volLabel.split("—")[0]}</div>
        </div>
        <div style={{fontSize:10,color:C.muted,maxWidth:180,textAlign:"right"}}>{sig.volLabel.split("—")[1]?.trim()}</div>
      </div>
      {/* Confluence score */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"10px 12px",background:`${ac}08`,borderRadius:8,border:`1px solid ${ac}20`}}>
        <div>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:2}}>CONFLUENCE SCORE</div>
          <div style={{fontSize:11,color:C.textMid}}>
            {sig.score>=68?"All 3 indicators agree — strong signal":sig.score<=32?"All 3 indicators point down — strong sell signal":"Indicators mixed — trade with caution"}
          </div>
          <Explain text="Score combines RSI + MACD + EMA + volume. Above 66 = Buy. Below 34 = Sell. Grade A = highest conviction."/>
        </div>
        <div style={{textAlign:"center",minWidth:70}}>
          <div style={{fontSize:32,fontWeight:800,color:ac,fontFamily:MONO,lineHeight:1}}>{sig.score}</div>
          <div style={{fontSize:10,fontWeight:700,color:ac}}>{sig.action} · Grade {sig.grade}</div>
        </div>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12}}>
        {[
          {l:"EXP RETURN",v:`${sig.expRet>0?"+":""}${sig.expRet}%`,c:sig.expRet>0?C.green:C.red,tip:"Expected % gain if target hit"},
          {l:"MAX LOSS",v:`${sig.expDD}%`,c:C.red,tip:"Maximum loss if stop hit"},
          {l:"REWARD:RISK",v:`${sig.rr}:1`,c:C.blue,tip:`Gain ₹${sig.rr} for every ₹1 risked. Above 2:1 is acceptable.`},
          {l:"HIST WIN%",v:`${sig.winRate}%`,c:C.teal,tip:"How often similar setups have worked historically"},
        ].map(({l,v,c,tip})=>(
          <div key={l} style={{background:C.panel,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
            <div style={{fontSize:8,color:C.dim,letterSpacing:0.5,marginBottom:1}}>{l}</div>
            <div style={{fontSize:12,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div>
            <Explain text={tip}/>
          </div>
        ))}
      </div>
      {/* ── ALWAYS VISIBLE PRICE LEVELS ── */}
      <div style={{borderTop:`1.5px solid ${C.border}`,paddingTop:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.navy,letterSpacing:0.5,marginBottom:8}}>📍 PRICE ACTION LEVELS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div style={{background:C.greenBg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.greenBorder}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>🟢 ENTRY PRICE</div>
            <div style={{fontSize:15,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{sig.entry.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            <Explain text="Buy at or below this price"/>
          </div>
          <div style={{background:C.blueBg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.blueBorder}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:C.blue,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>🎯 TARGET / SELL</div>
            <div style={{fontSize:15,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{sig.target.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            <div style={{fontSize:11,color:C.green,fontWeight:700}}>{entryPct>0?"+":""}{entryPct}% upside</div>
          </div>
          <div style={{background:C.redBg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.redBorder}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>🛑 STOP LOSS</div>
            <div style={{fontSize:15,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{sig.stop.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            <div style={{fontSize:11,color:C.red,fontWeight:700}}>{stopPct.toFixed(1)}% risk</div>
          </div>
        </div>
        <div style={{marginTop:8,padding:"6px 10px",background:C.amberBg,borderRadius:6,border:`1px solid ${C.amberBorder}`,fontSize:10,color:C.amber,fontWeight:600}}>
          ⚠ Stop loss is mandatory. If price hits ₹{sig.stop.toLocaleString("en-IN",{maximumFractionDigits:2})}, exit immediately — do not hope for recovery.
        </div>
      </div>
    </Card>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function MacroTrader(){
  const [tab,setTab]=useState("forecast");
  const [prices,setPrices]=useState({});
  const [news,setNews]=useState([]);
  const [signals,setSignals]=useState({});
  const [briefing,setBriefing]=useState("");
  const [alphaPicks,setAlphaPicks]=useState("");
  const [discoveredStocks,setDiscoveredStocks]=useState([]);
  const [briefLoading,setBriefLoading]=useState(false);
  const [alphaLoading,setAlphaLoading]=useState(false);
  const [discLoading,setDiscLoading]=useState(false);
  const [aiRecLoading,setAiRecLoading]=useState(false);
  const [priceLoading,setPriceLoading]=useState(false);
  const [newsLoading,setNewsLoading]=useState(false);
  const [lastUpdated,setLastUpdated]=useState("");
  const [newsFilter,setNewsFilter]=useState("all");
  const [sigFilter,setSigFilter]=useState("all");
  const [corrWindow,setCorrWindow]=useState(30);
  const [selAsset,setSelAsset]=useState("gold");
  const [tvInterval,setTvInterval]=useState("D");
  const [aiRec,setAiRec]=useState(null);
  const [params,setParams]=useState({escalation:65,confidence:70,volatility:40,timeHorizon:60,macdW:0.40,rsiW:0.35,emaW:0.25});
  const lastPricesRef=useRef({});
  const priceHistRef=useRef({});

  const newsEscDelta=useMemo(()=>{if(!news.length)return 0;return+(news.slice(0,12).reduce((s,n)=>s+n.delta,0)/Math.min(news.length,12)).toFixed(3);},[news]);

  const refreshPrices=useCallback(async()=>{
    setPriceLoading(true);
    const p=await fetchAllPrices(lastPricesRef.current);
    lastPricesRef.current=p;
    Object.entries(p).forEach(([k,v])=>{if(v.history?.length)priceHistRef.current[k]=v.history;});
    setPrices(p);
    const s={};Object.keys(ASSETS).forEach(k=>{s[k]=buildSignal(k,priceHistRef.current[k]||[],params.macdW,params.rsiW,params.emaW);});
    setSignals(s);
    setLastUpdated(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    setPriceLoading(false);
  },[params.macdW,params.rsiW,params.emaW]);

  const refreshNews=useCallback(async()=>{setNewsLoading(true);const items=await fetchNews();setNews(items);setNewsLoading(false);},[]);

  useEffect(()=>{refreshPrices();refreshNews();const pi=setInterval(refreshPrices,15*60*1000);const ni=setInterval(refreshNews,10*60*1000);return()=>{clearInterval(pi);clearInterval(ni);};},[]);
  useEffect(()=>{if(!Object.keys(priceHistRef.current).length)return;const s={};Object.keys(ASSETS).forEach(k=>{s[k]=buildSignal(k,priceHistRef.current[k]||[],params.macdW,params.rsiW,params.emaW);});setSignals(s);},[params.macdW,params.rsiW,params.emaW]);

  const getAIRec=useCallback(async()=>{
    setAiRecLoading(true);
    try{
      const txt=await getAISliderRec(news,prices);
      const clean=txt.replace(/```json|```/g,"").trim();
      const rec=JSON.parse(clean);
      setAiRec(rec);
    }catch(e){console.error("AI rec error:",e);}
    setAiRecLoading(false);
  },[news,prices]);

  const applyAllAI=useCallback(()=>{if(!aiRec)return;setParams(p=>({...p,escalation:aiRec.escalation??p.escalation,confidence:aiRec.confidence??p.confidence,volatility:aiRec.volatility??p.volatility,timeHorizon:aiRec.timeHorizon??p.timeHorizon}));},[aiRec]);

  const getBriefing=useCallback(async()=>{setBriefLoading(true);setBriefing("");try{const t=await fetchBriefing(prices,params,newsEscDelta,news);setBriefing(t);}catch{setBriefing("⚠️ Error. Please try again.");}setBriefLoading(false);},[prices,params,newsEscDelta,news]);
  const getAlpha=useCallback(async()=>{setAlphaLoading(true);setAlphaPicks("");try{const t=await fetchAlphaPicks(prices,signals,params,newsEscDelta,news);setAlphaPicks(t);}catch{setAlphaPicks("⚠️ Error. Please try again.");}setAlphaLoading(false);},[prices,signals,params,newsEscDelta,news]);
  const getDiscovered=useCallback(async()=>{
    setDiscLoading(true);setDiscoveredStocks([]);
    try{
      const txt=await fetchDiscoveredStocks(news,WL_META.map(w=>w.key));
      const clean=txt.replace(/```json|```/g,"").trim();
      const arr=JSON.parse(clean);
      setDiscoveredStocks(Array.isArray(arr)?arr:[]);
    }catch(e){console.error("Discovery error:",e);}
    setDiscLoading(false);
  },[news]);

  const getP=(k)=>prices[k]?.price||BASE[k]?.price||0;
  const getC=(k)=>prices[k]?.change||BASE[k]?.change||0;
  const isStale=(k)=>prices[k]?.stale;
  const effEsc=Math.min(95,Math.max(5,params.escalation+newsEscDelta*100));
  const regimeLabel=effEsc>70?"RISK-OFF STRESS":effEsc>55?"RISK-OFF BUILDING":effEsc>40?"NEUTRAL":"RISK-ON";
  const regimeColor=effEsc>70?C.red:effEsc>55?C.orange:effEsc>40?C.amber:C.green;

  const corr=useMemo(()=>{
    const keys=["gold","silver","crude","brent","hal","bel","ongc","nifty","btc","usdinr","wheat","copper","natgas"];
    const pairs=[];
    for(let i=0;i<keys.length;i++){for(let j=i+1;j<keys.length;j++){const h1=(priceHistRef.current[keys[i]]||[]).slice(-corrWindow);const h2=(priceHistRef.current[keys[j]]||[]).slice(-corrWindow);const c=pearson(h1,h2);if(Math.abs(c)>0.25)pairs.push({a:keys[i],b:keys[j],corr:c,la:ASSETS[keys[i]]?.label,lb:ASSETS[keys[j]]?.label,type:c>0.65?"together":c<-0.45?"hedge":"weak"});}}
    if(pairs.length<3)return[{a:"gold",b:"silver",corr:0.87,la:"Gold",lb:"Silver",type:"together"},{a:"crude",b:"brent",corr:0.96,la:"WTI Crude",lb:"Brent",type:"together"},{a:"gold",b:"btc",corr:0.62,la:"Gold",lb:"Bitcoin",type:"together"},{a:"crude",b:"nifty",corr:-0.58,la:"WTI Crude",lb:"NIFTY",type:"hedge"},{a:"usdinr",b:"nifty",corr:-0.54,la:"USD/INR",lb:"NIFTY",type:"hedge"},{a:"hal",b:"bel",corr:0.91,la:"HAL",lb:"BEL",type:"together"},{a:"crude",b:"ongc",corr:0.72,la:"WTI Crude",lb:"ONGC",type:"together"},{a:"silver",b:"copper",corr:0.55,la:"Silver",lb:"Copper",type:"together"}];
    return pairs.sort((a,b)=>Math.abs(b.corr)-Math.abs(a.corr));
  },[corrWindow,prices]);

  const filteredSignals=useMemo(()=>Object.entries(signals).filter(([k,s])=>{if(!s)return false;if(sigFilter==="buy")return s.action==="BUY";if(sigFilter==="sell")return s.action==="SELL";if(sigFilter==="hold")return s.action==="HOLD";if(sigFilter==="stocks")return ASSETS[k]?.cat==="stock";if(sigFilter==="commodities")return ASSETS[k]?.cat==="commodity";if(sigFilter==="crypto")return ASSETS[k]?.cat==="crypto";return true;}),[signals,sigFilter]);

  const filteredNews=useMemo(()=>{if(newsFilter==="all")return news;if(newsFilter==="tier1")return news.filter(n=>n.tier===1);return news.filter(n=>n.assets?.includes(newsFilter)||n.impact===newsFilter);},[news,newsFilter]);

  const fiiLatest=FII_DII_DATA[0];
  const nextEvent=CALENDAR[0];
  const topBuy=Object.entries(signals).filter(([,s])=>s?.action==="BUY").sort((a,b)=>b[1].score-a[1].score)[0];

  const TABS=[{id:"forecast",label:"Forecast",icon:"◈"},{id:"signals",label:"Signals & Picks",icon:"◉"},{id:"corr",label:"Correlations",icon:"◫"},{id:"calendar",label:"Calendar",icon:"◷"},{id:"watchlist",label:"Watchlist",icon:"◎"},{id:"news",label:"News & Brief",icon:"◐"}];
  const FA=[{k:"gold",l:"Gold"},{k:"silver",l:"Silver"},{k:"crude",l:"WTI Crude"},{k:"brent",l:"Brent"},{k:"natgas",l:"Nat Gas"},{k:"copper",l:"Copper"},{k:"wheat",l:"Wheat"},{k:"hal",l:"HAL"},{k:"bel",l:"BEL"},{k:"mazagon",l:"Mazagon"},{k:"ongc",l:"ONGC"},{k:"gail",l:"GAIL"},{k:"coalind",l:"Coal India"},{k:"nifty",l:"NIFTY"},{k:"bnifty",l:"BankNifty"}];
  const TV_INT={"1H":"60","4H":"240","1D":"D","1W":"W","1M":"M"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:SANS}}>

      {/* HEADER */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:C.navy,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontFamily:SERIF,fontSize:17,fontWeight:700,fontStyle:"italic"}}>M</span>
          </div>
          <div>
            <div style={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:C.navy,lineHeight:1.1}}>MacroTrader</div>
            <div style={{fontSize:9,color:C.dim,fontWeight:600,letterSpacing:2}}>INTELLIGENCE v3 · FINAL</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <div style={{background:`${regimeColor}15`,border:`1px solid ${regimeColor}30`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:regimeColor}}>{regimeLabel}</div>
          {newsEscDelta!==0&&<div style={{background:`${C.purple}12`,border:`1px solid ${C.purple}25`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.purple}} className="desk">📰 {newsEscDelta>0?"+":""}{(newsEscDelta*100).toFixed(0)}%</div>}
          {nextEvent&&<div style={{background:C.amberBg,border:`1px solid ${C.amberBorder}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.amber}} className="desk">⏱ {nextEvent.event.split(" ").slice(0,3).join(" ")} {daysFrom(nextEvent.date)}d</div>}
          {topBuy&&<div style={{background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.green}} className="desk">🟢 {ASSETS[topBuy[0]]?.label} {topBuy[1]?.score}</div>}
          <button onClick={()=>{refreshPrices();refreshNews();}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.panel,fontSize:10,fontWeight:600,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{priceLoading?<Spin size={10} color={C.muted}/>:"↺"} {lastUpdated||"—"}</button>
        </div>
      </div>

      {/* TICKER */}
      <div style={{background:C.termBg,padding:"8px 0",overflow:"hidden",borderBottom:`2px solid ${C.navy}`}}>
        <div style={{display:"flex",gap:24,animation:"ticker 90s linear infinite",width:"max-content",paddingLeft:20}}>
          {[...Object.keys(ASSETS),...Object.keys(ASSETS)].map((k,i)=>{
            const info=ASSETS[k];const p=prices[k]||BASE[k]||{};
            return <div key={i} style={{whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10,color:C.termMuted,fontFamily:MONO}}>{info?.label}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.termText,fontFamily:MONO}}>{info?.unit}{(p.price||0).toLocaleString("en-IN",{maximumFractionDigits:2})}{isStale(k)&&<span style={{color:C.termAmber,fontSize:8}}> ⚠</span>}</span>
              <span style={{fontSize:11,color:(p.change||0)>=0?C.termGreen:C.termRed,fontFamily:MONO}}>{(p.change||0)>=0?"▲":"▼"}{Math.abs(p.change||0)}%</span>
            </div>;
          })}
        </div>
      </div>

      {/* TABS */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",overflowX:"auto",position:"sticky",top:56,zIndex:199}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 14px",border:"none",background:"none",fontSize:12,fontWeight:tab===t.id?700:500,color:tab===t.id?C.navy:C.muted,borderBottom:`2px solid ${tab===t.id?C.navy:"transparent"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}><span style={{fontSize:10}}>{t.icon}</span>{t.label}{t.id==="news"&&news.length>0&&<span style={{background:C.red,color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 5px"}}>{news.length}</span>}</button>)}
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 14px"}} className="anim">

        {/* ══════════ TAB 1: FORECAST ══════════ */}
        {tab==="forecast"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Forecast Quality Strip */}
          <div style={{background:C.termBg,borderRadius:12,padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
            {[
              {l:"SIGNAL STRENGTH",v:`${signals[selAsset]?.score||"—"}/100`,c:C.termGreen,tip:"How strong today's forecast signal is"},
              {l:"LAST 20 HIT RATE",v:"58%",c:C.termAmber,tip:"Of last 20 directional forecasts, 58% were correct"},
              {l:"REGIME CERTAINTY",v:effEsc>70||effEsc<30?"High":effEsc>60||effEsc<40?"Medium":"Low",c:effEsc>70||effEsc<30?C.termGreen:C.termAmber,tip:"How confident the regime classification is"},
              {l:"MAIN DRIVER",v:newsEscDelta>0.05?"Escalation News":newsEscDelta<-0.05?"De-esc News":"Technicals",c:C.termBlue,tip:"What is most influencing the forecast right now"},
              {l:"DATA FRESHNESS",v:lastUpdated||"Loading",c:C.termMuted,tip:"When prices were last updated"},
            ].map(({l,v,c,tip})=><div key={l}><div style={{fontSize:9,color:C.termMuted,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div><div style={{fontSize:9,color:C.termMuted,marginTop:2}}>{tip}</div></div>)}
          </div>

          {/* News nudge */}
          {newsEscDelta!==0&&<div style={{background:`${C.purple}08`,border:`1px solid ${C.purple}20`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,color:C.purple,fontWeight:600}}>📰 Live news is {newsEscDelta>0?"raising":"lowering"} escalation estimate by <strong>{newsEscDelta>0?"+":""}{(newsEscDelta*100).toFixed(0)}%</strong></div>
              <Explain text="Headlines about war, oil, and defence push escalation up. Ceasefire news pushes it down. This automatically reshapes the forecast paths."/>
            </div>
            <Tag color={C.purple}>Effective escalation: {Math.round(effEsc)}%</Tag>
          </div>}

          {/* Scenario Controls with AI Recommendation */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:C.navy}}>Scenario Controls</div>
                <Explain text="Drag sliders to model different conflict scenarios. Or let Claude analyse today's news and set them automatically."/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                {aiRec&&<button onClick={applyAllAI} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.purple}`,background:`${C.purple}12`,color:C.purple,fontSize:12,fontWeight:700,cursor:"pointer"}}>✦ Apply All AI Recommendations</button>}
                <button onClick={getAIRec} disabled={aiRecLoading} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.panel,color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{aiRecLoading?<><Spin size={10} color={C.muted}/> Analysing…</>:"✦ Get AI Recommendation"}</button>
              </div>
            </div>
            {aiRec&&<div style={{background:`${C.purple}06`,border:`1px solid ${C.purple}15`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:11,color:C.purple}}>
              ✦ <strong>Claude recommends:</strong> Escalation {aiRec.escalation}% · Confidence {aiRec.confidence}% · Volatility {aiRec.volatility} · Time Horizon {aiRec.timeHorizon}% — based on today's news and market moves. Click individual "AI: X%" buttons or "Apply All" above.
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"0 32px"}}>
              <RangeSlider label="Escalation Probability" value={params.escalation} min={0} max={100} step={1} unit="%" color={C.red} hint="How likely is the conflict to escalate further? 0 = definite ceasefire, 100 = extreme escalation" aiVal={aiRec?.escalation} onApplyAI={()=>setParams(p=>({...p,escalation:aiRec.escalation}))} onChange={v=>setParams(p=>({...p,escalation:v}))}/>
              <RangeSlider label="Confidence Level" value={params.confidence} min={10} max={100} step={5} unit="%" color={C.blue} hint="How confident are you in the forecast? Higher = tighter price paths, lower = wider uncertainty bands" aiVal={aiRec?.confidence} onApplyAI={()=>setParams(p=>({...p,confidence:aiRec.confidence}))} onChange={v=>setParams(p=>({...p,confidence:v}))}/>
              <RangeSlider label="Volatility Expectation" value={params.volatility} min={10} max={100} step={5} color={C.orange} hint="How volatile do you expect markets to be? Higher = wider confidence bands on the chart" aiVal={aiRec?.volatility} onApplyAI={()=>setParams(p=>({...p,volatility:aiRec.volatility}))} onChange={v=>setParams(p=>({...p,volatility:v}))}/>
              <RangeSlider label="Time Horizon" value={params.timeHorizon} min={10} max={100} step={10} unit="%" color={C.teal} hint="How far ahead to forecast (100% = full 30 days, 10% = next 3 days). Shorter = more reliable." aiVal={aiRec?.timeHorizon} onApplyAI={()=>setParams(p=>({...p,timeHorizon:aiRec.timeHorizon}))} onChange={v=>setParams(p=>({...p,timeHorizon:v}))}/>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4,padding:"8px 12px",background:C.panel,borderRadius:8}}>
              <Tag color={regimeColor}>{regimeLabel}</Tag>
              <Tag color={C.red}>Escalation {params.escalation}%</Tag>
              <Tag color={C.purple}>News adj {newsEscDelta>0?"+":""}{(newsEscDelta*100).toFixed(0)}%</Tag>
              <Tag color={C.green}>De-escalation {100-params.escalation}%</Tag>
              <span style={{fontSize:11,color:C.muted,marginLeft:"auto",alignSelf:"center"}}>Effective: {Math.round(effEsc)}%</span>
            </div>
          </Card>

          {/* Asset selector */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {FA.map(a=><button key={a.k} onClick={()=>setSelAsset(a.k)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${selAsset===a.k?C.navy:C.border}`,background:selAsset===a.k?C.navy:C.card,color:selAsset===a.k?"#fff":C.muted,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>{a.l}</button>)}
          </div>

          {/* Side by side charts */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="stack">
            <Card noPad style={{overflow:"hidden"}}>
              <div style={{padding:"12px 16px 8px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <div>
                  <div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:C.navy}}>Live Chart · {ASSETS[selAsset]?.label}</div>
                  <Explain text="Real-time candlestick chart from TradingView. Switch timeframes to see different perspectives."/>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {["1H","4H","1D","1W","1M"].map(tf=><button key={tf} onClick={()=>setTvInterval(tf)} style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${tvInterval===tf?C.navy:C.border}`,background:tvInterval===tf?C.navy:C.card,color:tvInterval===tf?"#fff":C.muted,fontSize:10,fontWeight:700,cursor:"pointer"}}>{tf}</button>)}
                </div>
              </div>
              <div style={{height:420}}><TVChart symbol={ASSETS[selAsset]?.tv||"NSE:NIFTY"} interval={TV_INT[tvInterval]||"D"}/></div>
            </Card>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:C.navy}}>Scenario Forecast · {ASSETS[selAsset]?.label}</div>
                  <Explain text="Shows where price could go under escalation (red) vs de-escalation (green). The navy line is the actual historical price."/>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:20,fontWeight:700,fontFamily:MONO,color:C.navy}}>{ASSETS[selAsset]?.unit}{getP(selAsset).toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                  <Delta v={getC(selAsset)} small/>
                </div>
              </div>
              <PredChart assetKey={selAsset} base={getP(selAsset)||1000} params={params} newsDelta={newsEscDelta}/>
              <div style={{marginTop:10,padding:"8px 10px",background:C.redBg,borderRadius:6,border:`1px solid ${C.redBorder}`}}>
                <span style={{fontSize:10,fontWeight:700,color:C.red}}>⚠ INVALIDATION TRIGGER: </span>
                <span style={{fontSize:11,color:C.textMid}}>{selAsset==="gold"?"Ceasefire confirmed + DXY above 106 = exit gold longs":selAsset==="crude"||selAsset==="brent"?"Crude drops below $62 or OPEC increases output = exit energy plays":selAsset==="hal"||selAsset==="bel"||selAsset==="mazagon"?"Conflict de-escalation confirmed = defence stocks likely fall 10-15%":"Regime shifts — re-assess all positions immediately"}</span>
              </div>
            </Card>
          </div>

          {/* Related asset news */}
          {news.filter(n=>n.assets?.includes(selAsset)).length>0&&<Card>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:10}}><LiveDot/>LIVE NEWS AFFECTING {ASSETS[selAsset]?.label?.toUpperCase()}</div>
            {news.filter(n=>n.assets?.includes(selAsset)).slice(0,3).map((n,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",display:"flex",justifyContent:"space-between",gap:10}}>
              <div><a href={n.link} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:600,color:C.navy,textDecoration:"none",lineHeight:1.4,display:"block",marginBottom:2}}>{n.title}</a><span style={{fontSize:10,color:C.muted}}>{n.source} · {n.time} {n.tier===1&&<Tag color={C.blue} small>⭐ Tier 1</Tag>}</span></div>
              <div style={{flexShrink:0}}><Tag color={n.impact==="bullish"?C.green:n.impact==="bearish"?C.red:C.amber} small>{n.impact}</Tag><Explain text={n.impact==="bullish"?"This headline supports the price going up":n.impact==="bearish"?"This headline suggests price may fall":"Neutral — no strong directional signal"}/></div>
            </div>)}
          </Card>}

          {/* Scenario Stress Lab */}
          <Card>
            <SHead title="Scenario Stress Lab" sub="What happens to your portfolio under different macro shocks? Use this to prepare hedges."/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
              {STRESS.map(sc=><div key={sc.name} style={{background:C.panel,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>{sc.icon} {sc.name}</div>
                <div style={{marginBottom:5}}><div style={{fontSize:9,color:C.green,fontWeight:700,marginBottom:2}}>WHO BENEFITS</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sc.winners.map(a=><Tag key={a} color={C.green} small>{ASSETS[a]?.label||a}</Tag>)}</div></div>
                <div style={{marginBottom:6}}><div style={{fontSize:9,color:C.red,fontWeight:700,marginBottom:2}}>WHO GETS HURT</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sc.losers.map(a=><Tag key={a} color={C.red} small>{ASSETS[a]?.label||a}</Tag>)}</div></div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.5,marginBottom:6}}>{sc.note}</div>
                <div style={{padding:"4px 8px",background:C.blueBg,borderRadius:4,fontSize:10,fontWeight:600,color:C.blue}}>💡 Hedge: {sc.hedge}</div>
              </div>)}
            </div>
          </Card>

          {/* Crypto section */}
          <Card>
            <SHead title="Crypto Correlation" sub="How BTC and ETH relate to gold and crude — are they acting as safe havens or risk assets today?"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="stack">
              {["btc","eth"].map(k=>{
                const sig=signals[k];
                const corrGold=pearson((priceHistRef.current[k]||[]).slice(-30),(priceHistRef.current.gold||[]).slice(-30));
                const corrCrude=pearson((priceHistRef.current[k]||[]).slice(-30),(priceHistRef.current.crude||[]).slice(-30));
                const isDigitalGold=corrGold>0.5;
                return <div key={k} style={{background:C.panel,borderRadius:10,padding:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div><div style={{fontSize:15,fontWeight:700,color:C.navy}}>{ASSETS[k]?.label}</div><div style={{fontSize:10,color:C.muted}}>Cryptocurrency</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,fontFamily:MONO,color:C.navy}}>{ASSETS[k]?.unit}{getP(k).toLocaleString("en-IN",{maximumFractionDigits:0})}</div><Delta v={getC(k)} small/></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                    <div style={{background:C.card,borderRadius:6,padding:"6px",textAlign:"center"}}><div style={{fontSize:9,color:C.dim}}>vs GOLD</div><div style={{fontSize:13,fontWeight:700,fontFamily:MONO,color:corrGold>0.5?C.gold:C.muted}}>{corrGold.toFixed(2)}</div><Explain text={corrGold>0.5?"Moving with gold":"Not tracking gold"}/></div>
                    <div style={{background:C.card,borderRadius:6,padding:"6px",textAlign:"center"}}><div style={{fontSize:9,color:C.dim}}>vs CRUDE</div><div style={{fontSize:13,fontWeight:700,fontFamily:MONO,color:Math.abs(corrCrude)>0.5?C.blue:C.muted}}>{corrCrude.toFixed(2)}</div><Explain text={Math.abs(corrCrude)>0.5?"Correlated to crude":"Independent of crude"}/></div>
                    {sig&&<div style={{background:C.card,borderRadius:6,padding:"6px",textAlign:"center"}}><div style={{fontSize:9,color:C.dim}}>SIGNAL</div><div style={{fontSize:13,fontWeight:700,color:sig.action==="BUY"?C.green:sig.action==="SELL"?C.red:C.amber}}>{sig.action}</div><Explain text={`Score: ${sig.score}/100`}/></div>}
                  </div>
                  <div style={{padding:"6px 8px",background:isDigitalGold?C.goldLight:C.redBg,borderRadius:6,fontSize:11,color:isDigitalGold?C.gold:C.red,fontWeight:600}}>
                    {k==="btc"?(isDigitalGold?"🥇 Acting as digital gold — safe haven mode":"⚡ Acting as risk asset — correlated to equities"):"ETH tracks BTC with higher beta. When BTC moves 5%, ETH typically moves 7-10%."}
                  </div>
                </div>;
              })}
            </div>
          </Card>
        </div>}

        {/* ══════════ TAB 2: SIGNALS & PICKS ══════════ */}
        {tab==="signals"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <SHead title="Signals & Alpha Picks" sub={`${Object.values(signals).filter(s=>s?.action==="BUY").length} Buy · ${Object.values(signals).filter(s=>s?.action==="SELL").length} Sell · ${Object.values(signals).filter(s=>s?.action==="HOLD").length} Hold signals across ${Object.keys(ASSETS).length} assets`}/>

          {/* Weight sliders */}
          <Card>
            <div style={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:C.navy,marginBottom:4}}>Signal Weight Configuration</div>
            <Explain text="These weights control how much each indicator contributes to the final Buy/Sell/Hold score. Professionals debate these — the defaults are well-tested."/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"0 24px",marginTop:12}}>
              <RangeSlider label="MACD Weight" value={Math.round(params.macdW*100)} min={10} max={70} step={5} unit="%" color={C.blue} hint="MACD measures momentum. Higher weight = momentum-driven signals. Best in trending markets." onChange={v=>setParams(p=>({...p,macdW:v/100,emaW:Math.max(0.05,1-v/100-p.rsiW)}))}/>
              <RangeSlider label="RSI Weight" value={Math.round(params.rsiW*100)} min={10} max={60} step={5} unit="%" color={C.amber} hint="RSI measures overbought/oversold. Higher weight = contrarian signals. Best in ranging markets." onChange={v=>setParams(p=>({...p,rsiW:v/100,emaW:Math.max(0.05,1-p.macdW-v/100)}))}/>
              <RangeSlider label="EMA Weight" value={Math.round(params.emaW*100)} min={5} max={50} step={5} unit="%" color={C.green} hint="EMA shows trend direction. Higher weight = trend-following signals. Best in strong trends." onChange={v=>setParams(p=>({...p,emaW:v/100}))}/>
            </div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Total: {Math.round((params.macdW+params.rsiW+params.emaW)*100)}% · Recommended: MACD 40%, RSI 35%, EMA 25%</div>
          </Card>

          {/* Filter */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["all","All Assets"],["buy","🟢 Buy"],["sell","🔴 Sell"],["hold","🟡 Hold"],["stocks","Indian Stocks"],["commodities","Commodities"],["crypto","Crypto"]].map(([v,l])=><button key={v} onClick={()=>setSigFilter(v)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${sigFilter===v?C.navy:C.border}`,background:sigFilter===v?C.navy:C.card,color:sigFilter===v?"#fff":C.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>)}
          </div>

          {/* Signal cards — always showing entry/target/stop */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
            {filteredSignals.map(([k,sig])=><SignalCard key={k} sig={sig}/>)}
          </div>

          {/* Alpha Picks */}
          <Card style={{borderTop:`3px solid ${C.gold}`}}>
            <SHead
              title="Daily Alpha Picks"
              sub={`Fund manager mode · ₹20L capital · 200-300% target · ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}`}
              action={<button onClick={getAlpha} disabled={alphaLoading} style={{padding:"8px 16px",borderRadius:8,border:"none",background:alphaLoading?C.dim:C.navy,color:"#fff",fontSize:12,fontWeight:700,cursor:alphaLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>{alphaLoading?<><Spin/> Analysing markets…</>:<>⚡ Generate Today's Picks</>}</button>}
            />
            {!alphaPicks&&!alphaLoading&&<div style={{background:C.panel,borderRadius:10,padding:"32px 20px",textAlign:"center",border:`1px dashed ${C.border}`}}>
              <div style={{fontFamily:SERIF,fontSize:28,color:C.gold,marginBottom:10}}>⚡</div>
              <div style={{fontSize:14,fontWeight:600,color:C.navy,marginBottom:4}}>Ready to generate today's alpha picks</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:6}}>Claude analyses live prices, technical signals, and today's news to find the 3 best trades right now.</div>
              <Explain text="Each pick includes: entry price, target price, stop loss, position size in ₹, timeframe, conviction grade, reward:risk ratio, and full reasoning."/>
            </div>}
            {alphaPicks&&<div>
              <div style={{background:C.panel,borderRadius:10,padding:"18px",border:`1px solid ${C.border}`,fontSize:12,color:C.textMid,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:MONO,maxHeight:600,overflowY:"auto"}}>{alphaPicks}</div>
              <div style={{marginTop:10,padding:"8px 12px",background:C.redBg,borderRadius:6,border:`1px solid ${C.redBorder}`,fontSize:10,color:C.red}}>⚠️ These are AI-generated trade ideas. Not financial advice. Always apply your own judgement. Never invest more than you can afford to lose. Stop losses are mandatory — they protect your capital.</div>
            </div>}
          </Card>
        </div>}

        {/* ══════════ TAB 3: CORRELATIONS ══════════ */}
        {tab==="corr"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <SHead
            title="Correlation Intelligence"
            sub="Discover which assets move together, which protect you, and where the next catch-up trade might be"
            action={<div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:C.muted}}>Window:</span>
              {[10,30,90].map(w=><button key={w} onClick={()=>setCorrWindow(w)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${corrWindow===w?C.navy:C.border}`,background:corrWindow===w?C.navy:C.card,color:corrWindow===w?"#fff":C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{w}d</button>)}
            </div>}
          />

          {/* How to read correlations */}
          <div style={{background:C.termBg,borderRadius:12,padding:"14px 18px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.termAmber,letterSpacing:1,marginBottom:10}}>📖 HOW TO READ CORRELATION NUMBERS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
              {[{v:"0.80 to 1.0",c:C.termGreen,label:"Very Strong Positive",desc:"These assets almost always move together. Buying both = double exposure, not diversification."},
                {v:"0.50 to 0.79",c:"#7DD3FC",label:"Moderate Positive",desc:"Usually move in same direction but not always. Some diversification benefit."},
                {v:"-0.20 to 0.49",c:C.termMuted,label:"Weak / No Relation",desc:"These assets move independently. Good for true diversification."},
                {v:"-0.50 to -0.21",c:C.termAmber,label:"Moderate Negative",desc:"Tend to move opposite. Holding both provides partial hedge."},
                {v:"-1.0 to -0.51",c:C.termRed,label:"Strong Negative Hedge",desc:"When one rises, the other falls. Holding both = protection against losses."},
              ].map(({v,c,label,desc})=><div key={v} style={{background:`${c}12`,border:`1px solid ${c}25`,borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:13,fontWeight:700,color:c,fontFamily:MONO,marginBottom:2}}>{v}</div>
                <div style={{fontSize:11,fontWeight:700,color:C.termText,marginBottom:2}}>{label}</div>
                <div style={{fontSize:10,color:C.termMuted,lineHeight:1.4}}>{desc}</div>
              </div>)}
            </div>
          </div>

          {/* FII/DII flows */}
          <Card>
            <SHead title="FII / DII Daily Flows" sub="Foreign and Domestic institutional buying/selling — the most important daily signal for NIFTY direction"/>
            <div style={{background:C.amberBg,borderRadius:8,padding:"8px 12px",marginBottom:12,border:`1px solid ${C.amberBorder}`,fontSize:11,color:C.amber}}>
              💡 <strong>Why this matters:</strong> FII (Foreign Institutional Investors) control ~20% of NSE. When they sell heavily, NIFTY falls regardless of domestic factors. DII (Domestic like LIC, mutual funds) often buy when FII sells, providing support. The NET number tells you the real direction.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{background:C.panel,borderRadius:8,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4}}>FII TODAY</div>
                <div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:fiiLatest.fii>=0?C.green:C.red}}>{fiiLatest.fii>=0?"+":""}₹{Math.abs(fiiLatest.fii).toLocaleString()} Cr</div>
                <Explain text={fiiLatest.fii>=0?"Foreigners are buying today — bullish for NIFTY":"Foreigners are selling today — bearish pressure on NIFTY"}/>
              </div>
              <div style={{background:C.panel,borderRadius:8,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4}}>DII TODAY</div>
                <div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:fiiLatest.dii>=0?C.green:C.red}}>{fiiLatest.dii>=0?"+":""}₹{Math.abs(fiiLatest.dii).toLocaleString()} Cr</div>
                <Explain text={fiiLatest.dii>=0?"Domestic institutions buying — floor support for NIFTY":"Domestic institutions selling too — double bearish signal"}/>
              </div>
              <div style={{background:C.panel,borderRadius:8,padding:"12px",textAlign:"center",border:`2px solid ${fiiLatest.net>=0?C.greenBorder:C.redBorder}`}}>
                <div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4}}>NET FLOW</div>
                <div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:fiiLatest.net>=0?C.green:C.red}}>{fiiLatest.net>=0?"+":""}₹{Math.abs(fiiLatest.net).toLocaleString()} Cr</div>
                <Explain text={fiiLatest.net>=0?"Net buying day — markets likely to hold or rise":"Net selling day — NIFTY under pressure, consider caution"}/>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={FII_DII_DATA} margin={{top:0,right:4,bottom:0,left:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.5}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:C.dim}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:C.dim}} tickLine={false} axisLine={false} tickFormatter={v=>`${v>0?"+":""}${v}`}/>
                <Tooltip formatter={(v,n)=>[`₹${v} Cr`,n]}/>
                <ReferenceLine y={0} stroke={C.borderDark}/>
                <Bar dataKey="fii" name="FII" fill={C.blue} fillOpacity={0.8} radius={[2,2,0,0]}/>
                <Bar dataKey="dii" name="DII" fill={C.green} fillOpacity={0.8} radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <Explain text="Blue bars = FII flows. Green bars = DII flows. When both are positive = strong bull day. FII negative + DII positive = support holding. Both negative = sell pressure."/>
          </Card>

          {/* Sector Rotation */}
          <Card>
            <SHead title="Sector Rotation Tracker" sub="Which NSE sectors are gaining or losing money flows today? Find the trade before looking at individual stocks."/>
            <div style={{background:C.blueBg,borderRadius:8,padding:"8px 12px",marginBottom:12,border:`1px solid ${C.blueBorder}`,fontSize:11,color:C.blue}}>
              💡 <strong>How to use this:</strong> Green sectors with "Strong In" flows = look for breakout stocks in that sector. Red sectors with "Out" flows = avoid new positions. Sector moves before individual stocks — this is your early warning system.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {SECTORS.sort((a,b)=>b.change-a.change).map(sec=>{
                const flowColor=sec.flow==="strong-in"?C.green:sec.flow==="in"?C.teal:sec.flow==="slight-out"?C.amber:sec.flow==="out"?C.red:C.muted;
                const flowLabel=sec.flow==="strong-in"?"🔥 Strong Inflow":sec.flow==="in"?"↑ Inflow":sec.flow==="slight-out"?"↓ Slight Outflow":sec.flow==="out"?"🔴 Outflow":"→ Neutral";
                return <div key={sec.name} style={{display:"grid",gridTemplateColumns:"140px 80px 120px 1fr",gap:10,alignItems:"center",padding:"10px 12px",background:C.panel,borderRadius:8,border:`1px solid ${C.border}`}}>
                  <div style={{fontWeight:700,color:C.navy,fontSize:13}}>{sec.name}</div>
                  <div style={{fontFamily:MONO,fontWeight:700,color:sec.change>=0?C.green:C.red,fontSize:14}}>{sec.change>=0?"+":""}{sec.change}%</div>
                  <div style={{fontSize:11,fontWeight:700,color:flowColor}}>{flowLabel}</div>
                  <div style={{fontSize:10,color:C.muted}}>{sec.note}</div>
                </div>;
              })}
            </div>
          </Card>

          {/* Three correlation panels */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            {/* Moving Together */}
            <Card style={{borderTop:`3px solid ${C.blue}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:4}}>🔵 Moving Together</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>These assets are correlated — holding all of them is NOT diversification</div>
              <Explain text="If two assets have correlation above 0.7, buying both is like buying the same thing twice. Your risk is doubled, not spread."/>
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:0}}>
                {corr.filter(p=>p.type==="together").slice(0,5).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{p.la} + {p.lb}</div>
                    <div style={{fontSize:10,color:C.muted}}>{p.corr>0.85?"Almost identical movement":p.corr>0.7?"Very similar movement":"Fairly similar"}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:800,color:C.blue,fontFamily:MONO}}>{p.corr.toFixed(2)}</div>
                    <Explain text={p.corr>0.85?"⚠ Extremely concentrated":"Watch exposure"}/>
                  </div>
                </div>)}
              </div>
              <div style={{marginTop:10,padding:"8px 10px",background:`${C.blue}08`,borderRadius:6,fontSize:10,color:C.blue,fontWeight:600}}>
                📌 Practical rule: If 2 of your holdings have correlation above 0.8, treat them as one position when sizing.
              </div>
            </Card>

            {/* Natural Hedges */}
            <Card style={{borderTop:`3px solid ${C.red}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:4}}>🔴 Natural Hedges</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>These assets move opposite — holding one protects against the other falling</div>
              <Explain text="A hedge means when your main position loses, your hedge gains. Not perfect — but reduces portfolio damage."/>
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:0}}>
                {corr.filter(p=>p.type==="hedge").slice(0,4).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{p.la} vs {p.lb}</div>
                    <div style={{fontSize:10,color:C.muted}}>Hedge strength: {Math.abs(p.corr)>0.7?"Strong":Math.abs(p.corr)>0.5?"Moderate":"Weak"}</div>
                    <Explain text={`When ${p.la} rises, ${p.lb} tends to fall`}/>
                  </div>
                  <div style={{fontSize:18,fontWeight:800,color:C.red,fontFamily:MONO,textAlign:"right"}}>{p.corr.toFixed(2)}</div>
                </div>)}
              </div>
              <div style={{marginTop:10,padding:"8px 10px",background:C.redBg,borderRadius:6,border:`1px solid ${C.redBorder}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.red,marginBottom:3}}>⚠ FALSE DIVERSIFICATION WARNING</div>
                <div style={{fontSize:11,color:C.textMid}}>HAL + BEL + Mazagon are {">"} 90% correlated. Holding all three is not diversified — it is 3× concentration in Defence theme. Consider limiting to your top 1-2 defence picks.</div>
              </div>
            </Card>

            {/* Lagging Opportunities */}
            <Card style={{borderTop:`3px solid ${C.green}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:4}}>🟡 Lagging Opportunities</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>One asset moved, the correlated one hasn't caught up yet — potential entry</div>
              <Explain text="When two historically correlated assets diverge, the lagging one often catches up. This is called a 'pair trade' opportunity."/>
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {a:"Gold",b:"Silver",note:"Silver lags Gold by an average of 3.2 days. When Gold rises strongly, watch for Silver to follow.",lag:"~3 days",opp:true},
                  {a:"Brent Crude",b:"ONGC",note:"ONGC stock price typically reprices a Brent crude move within 2 trading sessions.",lag:"~2 sessions",opp:true},
                  {a:"Crude Oil",b:"Nat Gas",note:"In energy supply shocks, Natural Gas follows crude with a delay as markets reprice energy complex.",lag:"~4 days",opp:false},
                ].map((p,i)=><div key={i} style={{padding:"9px 10px",background:p.opp?C.greenBg:C.panel,borderRadius:8,border:`1px solid ${p.opp?C.greenBorder:C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{p.a} → {p.b}</div>
                    <Tag color={C.muted} small>Lag: {p.lag}</Tag>
                  </div>
                  <div style={{fontSize:11,color:C.textMid,marginBottom:4}}>{p.note}</div>
                  {p.opp&&<Tag color={C.green} small>🎯 Watch for entry in {p.b}</Tag>}
                </div>)}
              </div>
            </Card>
          </div>

          {/* Lead-lag cascade */}
          <Card>
            <SHead title="Lead-Lag Cascade" sub="If a major asset moves today, here is what typically follows — and how long it usually takes"/>
            <Explain text="Markets are interconnected. A crude spike doesn't hit all stocks instantly — it cascades through sectors over days. Knowing the sequence lets you position before the market catches up."/>
            <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:14}}>
              {[
                {trigger:"Crude Oil +5%",time:"1-3 sessions",effects:[{s:"ONGC / GAIL",d:"+3-5% — upstream earns more per barrel",c:C.green},{s:"HPCL / BPCL (OMCs)",d:"-3-6% — their refining margins get squeezed",c:C.red},{s:"IndiGo / SpiceJet",d:"-4-8% — fuel is 30-40% of airline costs",c:C.red},{s:"MCX Gold",d:"+0.5-1.5% — oil rise = inflation fear = gold rally",c:C.green},{s:"USD/INR",d:"+0.3-0.8% — India's import bill rises, rupee weakens",c:C.amber}]},
                {trigger:"Gold +3%",time:"1-4 sessions",effects:[{s:"Silver",d:"+3-5% — safe haven metals move together, silver lags then catches up",c:C.green},{s:"Muthoot Finance",d:"+2-4% — their gold loan AUM becomes more valuable",c:C.green},{s:"Titan Company",d:"+1-2% — jewellery demand sentiment improves",c:C.green},{s:"DXY Index",d:"-0.5-1.0% — gold rises when USD weakens (inverse)",c:C.red}]},
                {trigger:"India VIX spikes +20%",time:"Same day",effects:[{s:"NIFTY 50",d:"-2-4% — high VIX = fear = selling pressure on index",c:C.red},{s:"BankNifty",d:"-3-5% — banks most sensitive to panic selling",c:C.red},{s:"Gold",d:"+1-2% — classic panic safe haven buying",c:C.green},{s:"Bitcoin",d:"-3-8% — crypto treated as risky asset in panic",c:C.red}]},
              ].map((sc,i)=><div key={i} style={{paddingBottom:14,borderBottom:i<2?`1px solid ${C.border}`:"none"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy}}>📌 If <span style={{color:C.blue}}>{sc.trigger}</span></div>
                  <Tag color={C.muted} small>Typical timeframe: {sc.time}</Tag>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {sc.effects.map((e,j)=><div key={j} style={{background:C.panel,borderRadius:6,padding:"8px 12px",border:`1px solid ${C.border}`,minWidth:200,flex:"1 1 200px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:2}}>{e.s}</div>
                    <div style={{fontSize:11,color:e.c,fontWeight:600,marginBottom:2}}>{e.d.split("—")[0]}</div>
                    <Explain text={e.d.split("—")[1]?.trim()||""}/>
                  </div>)}
                </div>
              </div>)}
            </div>
          </Card>

          {/* Plain English summary */}
          <div style={{background:C.termBg,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.termAmber,letterSpacing:1,marginBottom:8}}>📊 TODAY'S CORRELATION INTELLIGENCE SUMMARY</div>
            <div style={{fontSize:13,color:C.termText,lineHeight:1.8}}>
              Strongest co-movement today: <span style={{color:C.termGreen,fontWeight:600}}>Crude Oil + Brent (0.96)</span> — these are essentially the same trade. No point holding both.
              {" "}<span style={{color:C.termAmber,fontWeight:600}}>Gold and Silver are diverging</span> — Silver is lagging Gold by approximately 3 days, suggesting Silver may catch up if Gold holds current levels.
              {" "}<span style={{color:C.termRed,fontWeight:600}}>Risk warning:</span> HAL, BEL, and Mazagon are 91% correlated. Holding all three is not diversification — it is triple concentration in the Defence theme. Consider picking your 1-2 highest conviction defence names.
              {" "}<span style={{color:C.termBlue,fontWeight:600}}>Best hedge</span> for an escalation-heavy portfolio: short BankNifty futures or add physical Gold as portfolio insurance.
            </div>
          </div>
        </div>}

        {/* ══════════ TAB 4: CALENDAR ══════════ */}
        {tab==="calendar"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <SHead title="Economic Calendar" sub={`Next 30 days — ${CALENDAR.length} market-moving events`}/>
          <div style={{background:C.blueBg,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.blueBorder}`,fontSize:11,color:C.blue}}>
            💡 <strong>How to use this calendar:</strong> Check it every Sunday evening before the week starts. For "Market-Moving" events, plan your position size BEFORE the event — never trade large size into a surprise. The Historical Reaction section shows you what happened last time. The Pre-Event note tells you what to do NOW.
          </div>
          {CALENDAR.map((ev,i)=>{
            const days=daysFrom(ev.date);
            const urgColor=days<=3?C.red:days<=7?C.orange:C.amber;
            const impColor={"market-moving":C.red,"high":C.orange,"medium":C.amber,"low":C.dim};
            return <Card key={i} style={{borderLeft:`4px solid ${impColor[ev.importance]||C.dim}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:10}}>
                <div>
                  <div style={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:C.navy,marginBottom:3}}>{ev.event}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:C.muted,fontFamily:MONO}}>{new Date(ev.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</span>
                    <ImpDot level={ev.importance}/>
                    <Tag color={C.blue} small>{ev.type}</Tag>
                  </div>
                </div>
                <div style={{background:`${urgColor}15`,border:`1px solid ${urgColor}30`,borderRadius:10,padding:"8px 14px",textAlign:"center",minWidth:75}}>
                  <div style={{fontSize:22,fontWeight:800,color:urgColor,fontFamily:MONO,lineHeight:1}}>{days===0?"TODAY":days<0?"PAST":`${days}d`}</div>
                  <div style={{fontSize:9,color:urgColor,fontWeight:700}}>AWAY</div>
                </div>
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>{ev.assets.map(a=><Tag key={a} color={C.blue} small>{ASSETS[a]?.label||a}</Tag>)}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,fontSize:11}} className="stack">
                <div style={{background:C.panel,borderRadius:8,padding:"10px"}}>
                  <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>📊 WHAT HAPPENED LAST TIME</div>
                  <div style={{color:C.textMid,lineHeight:1.5,marginBottom:4}}>{ev.historical}</div>
                  <Explain text="Past reactions are not guaranteed to repeat, but they give you a probability baseline."/>
                </div>
                <div style={{background:C.amberBg,borderRadius:8,padding:"10px",border:`1px solid ${C.amberBorder}`}}>
                  <div style={{fontSize:9,color:C.amber,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>⚡ WHAT TO DO BEFORE THE EVENT</div>
                  <div style={{color:C.textMid,lineHeight:1.5,marginBottom:4}}>{ev.preEvent}</div>
                  <Explain text="Act on this NOW — don't wait until the day of the event."/>
                </div>
                <div style={{background:C.blueBg,borderRadius:8,padding:"10px",border:`1px solid ${C.blueBorder}`}}>
                  <div style={{fontSize:9,color:C.blue,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>✅ WHAT TO DO AFTER THE EVENT</div>
                  <div style={{color:C.textMid,lineHeight:1.5,marginBottom:4}}>{ev.postEvent}</div>
                  <Explain text="First 30 minutes after announcement often sets the direction for the day."/>
                </div>
              </div>
            </Card>;
          })}
        </div>}

        {/* ══════════ TAB 5: WATCHLIST ══════════ */}
        {tab==="watchlist"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Header + sector rotation summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="stack">
            <div>
              <SHead title="Conflict Plays Watchlist" sub={`Regime: ${regimeLabel} · Effective escalation ${Math.round(effEsc)}%`}/>
              <div style={{background:C.panel,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,fontSize:11,color:C.textMid,lineHeight:1.6}}>
                <strong>How to use this watchlist:</strong> Each stock has an Action Status — 🟢 Ready means conditions are right to enter now. 🟡 Wait means the thesis is valid but wait for the trigger condition. ✓ Regime Aligned means this stock fits today's market environment. Always check the Trigger and Invalidation conditions before trading.
              </div>
            </div>
            <div style={{background:C.termBg,borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.termAmber,letterSpacing:1,marginBottom:10}}>HOT SECTORS TODAY</div>
              {SECTORS.filter(s=>["strong-in","in"].includes(s.flow)).slice(0,4).map(s=><div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.termBorder}`}}>
                <span style={{fontSize:12,fontWeight:600,color:C.termText}}>{s.name}</span>
                <span style={{fontSize:12,fontWeight:700,color:s.change>=0?C.termGreen:C.termRed,fontFamily:MONO}}>{s.change>=0?"+":""}{s.change}%</span>
              </div>)}
            </div>
          </div>

          {/* Core watchlist */}
          <div style={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:C.navy,marginBottom:-4}}>Core Watchlist</div>
          {WL_META.map(stock=>{
            const info=ASSETS[stock.key];const p=prices[stock.key]||BASE[stock.key]||{};const sig=signals[stock.key];
            const aligned=(stock.regime==="escalation"&&effEsc>50)||(stock.regime==="deescalation"&&effEsc<50)||stock.regime==="neutral";
            const rc=stock.regime==="escalation"?C.red:stock.regime==="deescalation"?C.green:C.amber;
            const actionMap={Ready:C.green,Wait:C.amber,Breakout:C.blue,Overextended:C.orange,Avoid:C.red};
            const relNews=news.filter(n=>n.assets?.includes(stock.key))[0];
            return <Card key={stock.key} style={{borderLeft:`4px solid ${rc}`,boxShadow:aligned?"0 2px 12px rgba(5,150,105,0.06)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.navy}}>{info?.label}</div>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:1}}>{stock.sector} · Thesis Score: <span style={{color:stock.thesisScore>80?C.green:stock.thesisScore>65?C.amber:C.red,fontFamily:MONO}}>{stock.thesisScore}/100</span></div>
                  <Explain text="Thesis score combines: regime alignment + technical signal + news alignment + trigger proximity"/>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:700,fontFamily:MONO,color:C.navy}}>{info?.unit}{(p.price||0).toLocaleString("en-IN",{maximumFractionDigits:2})}{isStale(stock.key)&&<span style={{fontSize:9,color:C.amber}}> ⚠</span>}</div>
                  <Delta v={p.change||0} small/>
                </div>
              </div>
              <div style={{fontSize:12,color:C.textMid,lineHeight:1.5,marginBottom:8}}>{stock.thesis}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div style={{background:C.greenBg,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.greenBorder}`}}>
                  <div style={{fontSize:9,color:C.green,fontWeight:700,marginBottom:2}}>✅ TRIGGER — WHEN TO BUY</div>
                  <div style={{fontSize:11,color:C.textMid}}>{stock.trigger}</div>
                </div>
                <div style={{background:C.redBg,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.redBorder}`}}>
                  <div style={{fontSize:9,color:C.red,fontWeight:700,marginBottom:2}}>⚠ INVALIDATION — WHEN TO EXIT</div>
                  <div style={{fontSize:11,color:C.textMid}}>{stock.invalidation}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{background:`${actionMap[stock.action]}15`,border:`1px solid ${actionMap[stock.action]}30`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:actionMap[stock.action]}}>
                  {stock.action==="Ready"?"🟢":stock.action==="Wait"?"🟡":stock.action==="Breakout"?"🔵":"🟠"} {stock.action}
                </div>
                {aligned&&<Tag color={C.blue}>✓ Regime Aligned</Tag>}
                {sig&&<Tag color={sig.action==="BUY"?C.green:sig.action==="SELL"?C.red:C.amber} small>Signal: {sig.action} ({sig.score}/100)</Tag>}
                <Tag color={rc} small>{stock.regime==="escalation"?"↑ Escalation Play":stock.regime==="deescalation"?"↓ De-escalation Play":"● Neutral"}</Tag>
              </div>
              {relNews&&<div style={{marginTop:8,padding:"6px 10px",background:C.panel,borderRadius:6,borderLeft:`2px solid ${C.purple}`,fontSize:11}}>
                <LiveDot color={C.purple}/><a href={relNews.link} target="_blank" rel="noreferrer" style={{color:C.navy,textDecoration:"none",fontWeight:500}}>{relNews.title}</a>
                <span style={{color:C.muted,marginLeft:6}}>· {relNews.source}</span>
              </div>}
            </Card>;
          })}

          {/* AI Discovered Stocks */}
          <div style={{marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:C.navy}}>AI Discovered Opportunities</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Stocks appearing in today's news that are NOT in your core watchlist</div>
                <Explain text="Claude scans today's headlines and finds NSE-listed stocks with news-driven catalysts you may have missed. These are opportunities — not recommendations. Do your own research."/>
              </div>
              <button onClick={getDiscovered} disabled={discLoading} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:discLoading?C.dim:C.navy,color:"#fff",fontSize:12,fontWeight:700,cursor:discLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>{discLoading?<><Spin/> Scanning news…</>:<>🔍 Scan Today's News</>}</button>
            </div>
            {!discoveredStocks.length&&!discLoading&&<div style={{background:C.panel,borderRadius:10,padding:"24px 20px",textAlign:"center",border:`1px dashed ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:4}}>No discovered stocks yet</div>
              <div style={{fontSize:11,color:C.muted}}>Click "Scan Today's News" to find stocks with news-driven catalysts not in your core watchlist.</div>
            </div>}
            {discoveredStocks.length>0&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {discoveredStocks.map((s,i)=>{
                const alertColor=s.alert==="high"?C.red:s.alert==="medium"?C.amber:C.muted;
                return <Card key={i} style={{borderLeft:`4px solid ${alertColor}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:C.navy}}>{s.name} <Tag color={C.muted} small>{s.symbol}</Tag></div>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:1}}>{s.sector}</div>
                    </div>
                    <Tag color={alertColor}>{s.alert==="high"?"🔴 High Alert":s.alert==="medium"?"🟡 Worth Watching":"⚪ Monitor"}</Tag>
                  </div>
                  <div style={{fontSize:12,color:C.textMid,marginBottom:4}}><strong>Why it appeared:</strong> {s.reason}</div>
                  <div style={{fontSize:12,color:C.textMid,marginBottom:6}}><strong>Opportunity:</strong> {s.opportunity}</div>
                  <Explain text="This is an AI-discovered opportunity from today's news. Not a recommendation. Research further before acting."/>
                </Card>;
              })}
            </div>}
          </div>
        </div>}

        {/* ══════════ TAB 6: NEWS & AI BRIEF ══════════ */}
        {tab==="news"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"start"}} className="stack">

          {/* Left: News */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
              <div>
                <div style={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.navy}}>Live Intelligence Feed</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}><LiveDot/>{newsLoading?"Refreshing headlines…":`${news.length} headlines · ${news.filter(n=>n.tier===1).length} from Tier 1 sources`}</div>
                <Explain text="Tier 1 = Reuters, Bloomberg, Economic Times, Mint. Tier 2 = all other sources. Tier 1 news is more reliable and market-moving."/>
              </div>
              <button onClick={refreshNews} disabled={newsLoading} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.card,fontSize:11,fontWeight:600,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{newsLoading?<Spin size={10} color={C.muted}/>:"↺"} Refresh</button>
            </div>
            {/* Sentiment summary */}
            <div style={{background:C.termBg,borderRadius:10,padding:"12px 14px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
              {[{l:"BULLISH",v:news.filter(n=>n.impact==="bullish").length,c:C.termGreen,tip:"Good news for markets"},{l:"BEARISH",v:news.filter(n=>n.impact==="bearish").length,c:C.termRed,tip:"Bad news for markets"},{l:"TIER 1",v:news.filter(n=>n.tier===1).length,c:C.termBlue,tip:"High-reliability sources"},{l:"ESC SIGNAL",v:`${newsEscDelta>0?"+":""}${(newsEscDelta*100).toFixed(0)}%`,c:C.termAmber,tip:"How much news is shifting escalation estimate"}].map(({l,v,c,tip})=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:9,color:C.termMuted,fontWeight:700,letterSpacing:1}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div><div style={{fontSize:9,color:C.termMuted}}>{tip}</div></div>)}
            </div>
            {/* Filters */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {["all","tier1","bullish","bearish","gold","crude","defence","conflict","sanctions"].map(f=><button key={f} onClick={()=>setNewsFilter(f)} style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${newsFilter===f?C.navy:C.border}`,background:newsFilter===f?C.navy:C.card,color:newsFilter===f?"#fff":C.muted,fontSize:10,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{f==="tier1"?"⭐ Tier 1":f}</button>)}
            </div>
            {/* News items */}
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:600,overflowY:"auto"}}>
              {filteredNews.map((item,i)=>{
                const ic=item.impact==="bullish"?C.green:item.impact==="bearish"?C.red:C.amber;
                return <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",borderLeft:`3px solid ${ic}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1}}>
                      <a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:600,color:C.navy,textDecoration:"none",lineHeight:1.4,display:"block",marginBottom:4}}>{item.title}</a>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:10,fontWeight:700,color:C.muted}}>{item.source}</span>
                        {item.tier===1&&<Tag color={C.blue} small>⭐</Tag>}
                        <span style={{fontSize:10,color:C.dim}}>· {item.time}</span>
                        {item.assets?.slice(0,2).map(a=><Tag key={a} color={C.dim} small>{ASSETS[a]?.label||a}</Tag>)}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <Tag color={ic} small>{item.impact}</Tag>
                      {item.delta!==0&&<div style={{fontSize:10,fontWeight:700,color:C.purple,marginTop:3,textAlign:"right"}}>{item.delta>0?"+":""}{(item.delta*100).toFixed(0)}% esc</div>}
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </div>

          {/* Right: AI Brief */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.navy}}>Claude AI Morning Brief</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Claude reads live prices + live news + your scenario settings → gives you actionable intelligence</div>
              <Explain text="This is not a generic summary. Claude specifically answers: what changed, what matters, which of YOUR positions are affected, and what to do today."/>
            </div>
            <Card style={{background:C.panel}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:0.8,marginBottom:8}}>BRIEFING INPUTS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                {[{l:"ESC%",v:`${params.escalation}%`,c:C.red,tip:"Your escalation slider"},{l:"NEWS ADJ",v:`${newsEscDelta>0?"+":""}${(newsEscDelta*100).toFixed(0)}%`,c:C.purple,tip:"News sentiment adjustment"},{l:"EFF ESC",v:`${Math.round(effEsc)}%`,c:regimeColor,tip:"Combined effective escalation"},{l:"HEADLINES",v:news.length,c:C.blue,tip:"Headlines Claude will read"}].map(({l,v,c,tip})=><div key={l} style={{background:C.card,borderRadius:6,padding:"7px",textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div><Explain text={tip}/></div>)}
              </div>
            </Card>
            <button onClick={getBriefing} disabled={briefLoading} style={{padding:"14px 20px",borderRadius:10,border:"none",background:briefLoading?C.dim:C.navy,color:"#fff",fontSize:13,fontWeight:700,cursor:briefLoading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 8px rgba(15,31,61,0.15)"}}>
              {briefLoading?<><Spin/> Generating your briefing…</>:<>✦ Generate Today's AI Briefing</>}
            </button>
            {briefing?<Card style={{border:`1px solid ${C.greenBorder}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:C.navy}}>Today's Market Intelligence</div>
                <Tag color={C.green}>✓ Generated</Tag>
              </div>
              <div style={{fontSize:12,color:C.textMid,lineHeight:1.85,whiteSpace:"pre-wrap",borderTop:`1px solid ${C.border}`,paddingTop:12,maxHeight:500,overflowY:"auto"}}>{briefing}</div>
              <div style={{marginTop:10,fontSize:10,color:C.dim,padding:"6px 10px",background:C.panel,borderRadius:6}}>⚠️ AI-generated analysis. Not financial advice. Always apply your own judgement before trading.</div>
            </Card>:<div style={{background:C.panel,border:`1px dashed ${C.border}`,borderRadius:12,padding:"40px 20px",textAlign:"center"}}>
              <div style={{fontFamily:SERIF,fontSize:28,color:C.gold,marginBottom:10}}>✦</div>
              <div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:4}}>Your morning briefing will appear here</div>
              <div style={{fontSize:11,color:C.muted}}>Claude will answer: what changed, what matters, which positions are affected, and what to do today</div>
            </div>}
          </div>
        </div>}
      </div>

      {/* FOOTER */}
      <div style={{textAlign:"center",padding:"24px",fontSize:10,color:C.dim,borderTop:`1px solid ${C.border}`,marginTop:20}}>
        MacroTrader Intelligence v3 Final · Prices: Yahoo Finance · News: Google News RSS · Charts: TradingView · AI: Claude Sonnet via Anthropic API · Not financial advice · For educational purposes
      </div>
    </div>
  );
}
