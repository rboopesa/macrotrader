import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from "recharts";
// --- ASSET TILE ---------------------------------------------------
function AssetTile({ assetKey, selected, onSelect, prices, signals }) {
  const info = ASSETS[assetKey];
  const px   = (prices&&prices[assetKey]) || BASE[assetKey] || {};
  const sig  = signals&&signals[assetKey];
  const chg  = px.change || 0;
  const ac   = sig?.action==="BUY" ? C.green : sig?.action==="SELL" ? C.red : C.muted;
  return (
    <button onClick={onSelect} style={{
      background: selected ? C.navy : C.panel,
      border: `1.5px solid ${selected ? C.navy : chg>=0 ? C.green+"35" : C.red+"35"}`,
      borderRadius: 10, padding: "10px 12px", cursor: "pointer",
      textAlign: "left", transition: "all 0.12s",
      boxShadow: selected ? "0 2px 10px rgba(15,31,61,0.18)" : "none",
      width: "100%",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
        <span style={{fontSize:11,fontWeight:700,color:selected?"#fff":C.navy,lineHeight:1.2,flex:1,marginRight:4}}>{info?.label}</span>
        {sig&&<span style={{fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:6,whiteSpace:"nowrap",
          color:selected?"rgba(255,255,255,0.8)":ac,background:selected?"rgba(255,255,255,0.12)":ac+"15"}}>{sig.action} {sig.score}</span>}
      </div>
      <div style={{fontSize:14,fontWeight:800,fontFamily:MONO,color:selected?"#fff":C.text,marginBottom:3,lineHeight:1}}>
        {info?.unit}{fmtPrice(px.price||0,info?.unit||"")}
        {px.stale&&<span style={{fontSize:8,color:C.amber,marginLeft:3}}>!</span>}
      </div>
      <div style={{fontSize:10,fontWeight:700,fontFamily:MONO,
        color:selected?(chg>=0?"#6EE7B7":"#FCA5A5"):chg>=0?C.green:C.red}}>
        {chg>=0?"^":"v"} {Math.abs(chg).toFixed(2)}%
      </div>
      {sig&&<div style={{height:2,borderRadius:1,marginTop:6,
        background:"linear-gradient(90deg,"+ac+" "+sig.score+"%,"+C.border+" 0)"}}/>}
    </button>
  );
}
// --- DESIGN TOKENS ------------------------------------------------
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
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
.anim{animation:fadeUp 0.3s ease forwards}
.pulse{animation:pulse 2s ease infinite}
input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:4px;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;cursor:pointer;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.25)}
.r-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.r-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.r-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.r-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.r-grid-cal{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.r-grid-news{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.desk-only{display:flex}
@media(max-width:1024px){
  .r-grid-3{grid-template-columns:repeat(2,1fr)}
  .r-grid-4{grid-template-columns:repeat(2,1fr)}
  .r-grid-cal{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:768px){
  .desk-only{display:none!important}
  .desk{display:none!important}
  .r-grid-2{grid-template-columns:1fr!important}
  .chart-pair{grid-template-columns:1fr!important}
  .r-grid-news{grid-template-columns:1fr!important}
  .r-grid-3{grid-template-columns:1fr!important}
  .r-grid-4{grid-template-columns:1fr 1fr!important}
  .r-grid-cal{grid-template-columns:1fr!important}
  .r-grid-auto{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important}
  .tv-container{height:280px!important}
  .content-pad{padding:12px 10px!important}
  .header-title-sub{display:none}
  .tab-btn{padding:10px 10px!important;font-size:11px!important}
  .mob-card-pad{padding:12px 14px!important}
  .mob-full{width:100%!important}
  .fq-strip{grid-template-columns:repeat(2,1fr)!important}
  .sector-row{grid-template-columns:1fr 60px!important;gap:6px!important}
  .sector-flow{display:none!important}
  .sector-note{display:none!important}
  .sig-stats{grid-template-columns:1fr 1fr!important}
  .price-levels{gap:6px!important}
  .price-levels > div{padding:8px 6px!important}
  .price-levels .price-val{font-size:12px!important}
  .stress-grid{grid-template-columns:1fr!important}
  .corr-panels{grid-template-columns:1fr!important}
  .lead-lag-effects{grid-template-columns:1fr!important}
  .wl-header{grid-template-columns:1fr!important}
  .news-brief{grid-template-columns:1fr!important}
  .fii-stats{grid-template-columns:1fr!important}
  .crypto-grid{grid-template-columns:1fr!important}
}
@media(max-width:400px){
  html,body{font-size:12px}
  .r-grid-4{grid-template-columns:1fr 1fr!important}
  .tab-btn{padding:8px 8px!important;font-size:10px!important}
}
/* Chart axis styles -- ensure crisp rendering */
.recharts-cartesian-axis-tick text{font-family:${MONO}!important}
.recharts-cartesian-axis-line{stroke:${C.borderDark}!important;stroke-width:1px!important}
.recharts-cartesian-axis-tick-line{stroke:${C.borderDark}!important}
`;
document.head.appendChild(s);
})();
// --- ASSETS -------------------------------------------------------
const ASSETS = {
nifty:{sym:"^NSEI",label:"NIFTY 50",unit:"Rs",cat:"index",theme:"index",tv:"NSE:NIFTY"},
bnifty:{sym:"^NSEBANK",label:"Bank Nifty",unit:"Rs",cat:"index",theme:"index",tv:"NSE:BANKNIFTY"},
vix:{sym:"^INDIAVIX",label:"India VIX",unit:"",cat:"index",theme:"vol",tv:"NSE:INDIAVIX"},
gold:{sym:"GC=F",label:"Gold",unit:"$",cat:"commodity",theme:"safe",tv:"COMEX:GC1!"},
silver:{sym:"SI=F",label:"Silver",unit:"$",cat:"commodity",theme:"safe",tv:"COMEX:SI1!"},
crude:{sym:"CL=F",label:"WTI Crude",unit:"$",cat:"commodity",theme:"energy",tv:"NYMEX:CL1!"},
natgas:{sym:"NG=F",label:"Nat Gas",unit:"$",cat:"commodity",theme:"energy",tv:"NYMEX:NG1!"},
copper:{sym:"HG=F",label:"Copper",unit:"$",cat:"commodity",theme:"industrial",tv:"COMEX:HG1!"},
wheat:{sym:"ZW=F",label:"Wheat",unit:"$",cat:"commodity",theme:"food",tv:"CBOT:ZW1!"},
usdinr:{sym:"INR=X",label:"USD/INR",unit:"",cat:"fx",theme:"fx",tv:"FX_IDC:USDINR"},
dxy:{sym:"DX-Y.NYB",label:"DXY",unit:"",cat:"fx",theme:"fx",tv:"TVC:DXY"},
// Defence & PSU
hal:{sym:"HAL.NS",label:"HAL",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:HAL"},
bel:{sym:"BEL.NS",label:"BEL",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:BEL"},
mazagon:{sym:"MAZDOCK.NS",label:"Mazagon",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:MAZDOCK"},
mtar:{sym:"MTARTECH.NS",label:"MTAR Tech",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:MTARTECH"},
paras:{sym:"PARAS.NS",label:"Paras Defence",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:PARAS"},
datapatterns:{sym:"DATAPATTNS.NS",label:"Data Patterns",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:DATAPATTNS"},
grse:{sym:"GRSE.NS",label:"GRSE",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:GRSE"},
cochinship:{sym:"COCHINSHIP.NS",label:"Cochin Ship",unit:"Rs",cat:"stock",theme:"defence",tv:"NSE:COCHINSHIP"},
// Energy & Oil
ongc:{sym:"ONGC.NS",label:"ONGC",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:ONGC"},
gail:{sym:"GAIL.NS",label:"GAIL",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:GAIL"},
coalind:{sym:"COALINDIA.NS",label:"Coal India",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:COALINDIA"},
bpcl:{sym:"BPCL.NS",label:"BPCL",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:BPCL"},
hpcl:{sym:"HINDPETRO.NS",label:"HPCL",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:HINDPETRO"},
ioc:{sym:"IOC.NS",label:"IOC",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:IOC"},
petronet:{sym:"PETRONET.NS",label:"Petronet LNG",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:PETRONET"},
tatapower:{sym:"TATAPOWER.NS",label:"Tata Power",unit:"Rs",cat:"stock",theme:"energy",tv:"NSE:TATAPOWER"},
// Banking & Finance
hdfcbank:{sym:"HDFCBANK.NS",label:"HDFC Bank",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:HDFCBANK"},
icicibank:{sym:"ICICIBANK.NS",label:"ICICI Bank",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:ICICIBANK"},
sbi:{sym:"SBIN.NS",label:"SBI",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:SBIN"},
kotak:{sym:"KOTAKBANK.NS",label:"Kotak Bank",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:KOTAKBANK"},
axisbank:{sym:"AXISBANK.NS",label:"Axis Bank",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:AXISBANK"},
muthoot:{sym:"MUTHOOTFIN.NS",label:"Muthoot",unit:"Rs",cat:"stock",theme:"safe",tv:"NSE:MUTHOOTFIN"},
aubank:{sym:"AUBANK.NS",label:"AU Small Fin",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:AUBANK"},
idfcfirst:{sym:"IDFCFIRSTB.NS",label:"IDFC First",unit:"Rs",cat:"stock",theme:"banking",tv:"NSE:IDFCFIRSTB"},
// IT & Tech
tcs:{sym:"TCS.NS",label:"TCS",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:TCS"},
infy:{sym:"INFY.NS",label:"Infosys",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:INFY"},
wipro:{sym:"WIPRO.NS",label:"Wipro",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:WIPRO"},
hcltech:{sym:"HCLTECH.NS",label:"HCL Tech",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:HCLTECH"},
techm:{sym:"TECHM.NS",label:"Tech Mahindra",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:TECHM"},
ltim:{sym:"LTIM.NS",label:"LTIMindtree",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:LTIM"},
persistent:{sym:"PERSISTENT.NS",label:"Persistent",unit:"Rs",cat:"stock",theme:"it",tv:"NSE:PERSISTENT"},
// Pharma & Healthcare
sunpharma:{sym:"SUNPHARMA.NS",label:"Sun Pharma",unit:"Rs",cat:"stock",theme:"pharma",tv:"NSE:SUNPHARMA"},
drreddy:{sym:"DRREDDY.NS",label:"Dr Reddy's",unit:"Rs",cat:"stock",theme:"pharma",tv:"NSE:DRREDDY"},
cipla:{sym:"CIPLA.NS",label:"Cipla",unit:"Rs",cat:"stock",theme:"pharma",tv:"NSE:CIPLA"},
divis:{sym:"DIVISLAB.NS",label:"Divi's Labs",unit:"Rs",cat:"stock",theme:"pharma",tv:"NSE:DIVISLAB"},
apollo:{sym:"APOLLOHOSP.NS",label:"Apollo Hosp",unit:"Rs",cat:"stock",theme:"pharma",tv:"NSE:APOLLOHOSP"},
mankind:{sym:"MANKIND.NS",label:"Mankind Pharma",unit:"Rs",cat:"stock",theme:"pharma",tv:"NSE:MANKIND"},
// Metals & Mining
tatasteel:{sym:"TATASTEEL.NS",label:"Tata Steel",unit:"Rs",cat:"stock",theme:"metals",tv:"NSE:TATASTEEL"},
jswsteel:{sym:"JSWSTEEL.NS",label:"JSW Steel",unit:"Rs",cat:"stock",theme:"metals",tv:"NSE:JSWSTEEL"},
hindalco:{sym:"HINDALCO.NS",label:"Hindalco",unit:"Rs",cat:"stock",theme:"metals",tv:"NSE:HINDALCO"},
vedanta:{sym:"VEDL.NS",label:"Vedanta",unit:"Rs",cat:"stock",theme:"metals",tv:"NSE:VEDL"},
sail:{sym:"SAIL.NS",label:"SAIL",unit:"Rs",cat:"stock",theme:"metals",tv:"NSE:SAIL"},
nmdc:{sym:"NMDC.NS",label:"NMDC",unit:"Rs",cat:"stock",theme:"metals",tv:"NSE:NMDC"},
// Consumer & FMCG
hul:{sym:"HINDUNILVR.NS",label:"HUL",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:HINDUNILVR"},
itc:{sym:"ITC.NS",label:"ITC",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:ITC"},
nestle:{sym:"NESTLEIND.NS",label:"Nestle India",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:NESTLEIND"},
titan:{sym:"TITAN.NS",label:"Titan",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:TITAN"},
godrejcp:{sym:"GODREJCP.NS",label:"Godrej CP",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:GODREJCP"},
marico:{sym:"MARICO.NS",label:"Marico",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:MARICO"},
dabur:{sym:"DABUR.NS",label:"Dabur",unit:"Rs",cat:"stock",theme:"consumer",tv:"NSE:DABUR"},
// MSME / SME
kaynes:{sym:"KAYNES.NS",label:"Kaynes Tech",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:KAYNES"},
dixon:{sym:"DIXON.NS",label:"Dixon Tech",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:DIXON"},
avalon:{sym:"AVALON.NS",label:"Avalon Tech",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:AVALON"},
syrma:{sym:"SYRMA.NS",label:"Syrma SGS",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:SYRMA"},
azad:{sym:"AZAD.NS",label:"Azad Engg",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:AZAD"},
ideaforge:{sym:"IDEAFORGE.NS",label:"Ideaforge",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:IDEAFORGE"},
elin:{sym:"ELIN.NS",label:"Elin Elec",unit:"Rs",cat:"stock",theme:"msme",tv:"NSE:ELIN"},
// Crypto
btc:{sym:"BTC-USD",label:"Bitcoin",unit:"$",cat:"crypto",theme:"crypto",tv:"BITSTAMP:BTCUSD"},
eth:{sym:"ETH-USD",label:"Ethereum",unit:"$",cat:"crypto",theme:"crypto",tv:"BITSTAMP:ETHUSD"},
};
const BASE = {
// Indices
nifty:{price:22500,change:0.5,vol:"normal"},bnifty:{price:48200,change:0.8,vol:"normal"},
vix:{price:17.2,change:-1.5,vol:"normal"},
// FX
usdinr:{price:83.60,change:0.12,vol:"normal"},dxy:{price:103.8,change:-0.2,vol:"normal"},
// Commodities
gold:{price:3100,change:0.8,vol:"above"},silver:{price:34.8,change:0.9,vol:"above"},
crude:{price:67.5,change:1.2,vol:"normal"},natgas:{price:3.72,change:1.8,vol:"normal"},
copper:{price:4.55,change:-0.5,vol:"normal"},wheat:{price:542,change:0.4,vol:"normal"},
// Crypto
btc:{price:75500,change:4.1,vol:"above"},eth:{price:2350,change:3.8,vol:"above"},
// Defence
hal:{price:4100,change:2.5,vol:"above"},bel:{price:222,change:2.1,vol:"above"},
mazagon:{price:2800,change:2.8,vol:"above"},mtar:{price:1850,change:1.8,vol:"above"},
paras:{price:920,change:2.1,vol:"normal"},datapatterns:{price:2350,change:1.5,vol:"above"},
grse:{price:1580,change:2.3,vol:"normal"},cochinship:{price:1420,change:1.9,vol:"normal"},
// Energy
ongc:{price:262,change:1.6,vol:"above"},gail:{price:194,change:1.2,vol:"normal"},
coalind:{price:381,change:0.8,vol:"normal"},bpcl:{price:310,change:1.1,vol:"normal"},
hpcl:{price:380,change:0.8,vol:"normal"},ioc:{price:158,change:0.6,vol:"normal"},
petronet:{price:302,change:0.7,vol:"normal"},tatapower:{price:388,change:1.2,vol:"normal"},
// Banking
hdfcbank:{price:1720,change:0.65,vol:"normal"},icicibank:{price:1245,change:0.88,vol:"normal"},
sbi:{price:780,change:1.1,vol:"above"},kotak:{price:1820,change:0.42,vol:"normal"},
axisbank:{price:1090,change:0.75,vol:"normal"},muthoot:{price:1820,change:1.3,vol:"above"},
aubank:{price:620,change:1.2,vol:"normal"},idfcfirst:{price:68,change:1.5,vol:"normal"},
// IT
tcs:{price:3520,change:0.45,vol:"normal"},infy:{price:1580,change:0.38,vol:"normal"},
wipro:{price:478,change:0.52,vol:"normal"},hcltech:{price:1620,change:0.61,vol:"normal"},
techm:{price:1380,change:0.72,vol:"normal"},ltim:{price:5180,change:0.55,vol:"normal"},
persistent:{price:4950,change:0.88,vol:"above"},
// Pharma
sunpharma:{price:1650,change:0.72,vol:"normal"},drreddy:{price:1220,change:0.55,vol:"normal"},
cipla:{price:1450,change:0.48,vol:"normal"},divis:{price:3750,change:0.62,vol:"normal"},
apollo:{price:6200,change:0.91,vol:"normal"},mankind:{price:2180,change:0.67,vol:"normal"},
// Metals
tatasteel:{price:142,change:1.1,vol:"above"},jswsteel:{price:880,change:0.95,vol:"normal"},
hindalco:{price:630,change:1.2,vol:"normal"},vedanta:{price:418,change:1.45,vol:"above"},
sail:{price:112,change:0.85,vol:"normal"},nmdc:{price:220,change:0.75,vol:"normal"},
// FMCG
hul:{price:2380,change:0.32,vol:"normal"},itc:{price:418,change:0.55,vol:"normal"},
nestle:{price:2250,change:0.28,vol:"normal"},titan:{price:3080,change:0.7,vol:"normal"},
godrejcp:{price:1080,change:0.41,vol:"normal"},marico:{price:570,change:0.35,vol:"normal"},
dabur:{price:520,change:0.29,vol:"normal"},
// MSME
kaynes:{price:3680,change:2.4,vol:"above"},dixon:{price:14200,change:1.8,vol:"above"},
avalon:{price:720,change:2.1,vol:"normal"},syrma:{price:385,change:1.9,vol:"normal"},
azad:{price:1650,change:2.2,vol:"above"},ideaforge:{price:310,change:1.6,vol:"normal"},
elin:{price:215,change:1.4,vol:"normal"},
};
// --- PRICE FORMATTER --------------------------------------------
function fmtPrice(price,unit){
if(!price&&price!==0)return"--";
const isUSD=unit==="$";
const locale=isUSD?"en-US":"en-IN";
if(isUSD&&price>=10000)return price.toLocaleString(locale,{maximumFractionDigits:0});
if(isUSD&&price>=100) return price.toLocaleString(locale,{maximumFractionDigits:1});
if(isUSD)             return price.toLocaleString(locale,{maximumFractionDigits:3});
if(price>=10000)      return price.toLocaleString(locale,{maximumFractionDigits:0});
return price.toLocaleString(locale,{maximumFractionDigits:2});
}
// --- FII/DII DATA -------------------------------------------------
const FII_DII_DATA = [
{date:"Today",fii:-2847,dii:1923,net:-924},
{date:"-1d",fii:-1234,dii:2456,net:1222},
{date:"-2d",fii:3421,dii:876,net:4297},
{date:"-3d",fii:-4567,dii:3210,net:-1357},
{date:"-4d",fii:1890,dii:1456,net:3346},
{date:"-5d",fii:-987,dii:2134,net:1147},
{date:"-6d",fii:5432,dii:987,net:6419},
];
// --- SECTOR DATA --------------------------------------------------
const SECTORS = [
{name:"Defence",change:2.8,flow:"strong-in",stocks:["HAL","BEL","Mazagon"],note:"Conflict escalation driving defence budget expectations up"},
{name:"Energy",change:1.6,flow:"in",stocks:["ONGC","GAIL","Coal India"],note:"Crude above $68 supporting upstream margin expansion"},
{name:"Metals",change:1.2,flow:"in",stocks:["Hindalco","Tata Steel","JSPL"],note:"China stimulus hopes + supply constraints"},
{name:"Pharma",change:0.4,flow:"neutral",stocks:["Sun Pharma","Dr Reddy","Cipla"],note:"Defensive sector -- stable but no strong catalyst today"},
{name:"IT",change:-0.8,flow:"out",stocks:["Infosys","TCS","Wipro"],note:"FII selling + strong rupee reduces USD revenue appeal"},
{name:"Banks",change:-0.4,flow:"slight-out",stocks:["HDFC Bank","ICICI Bank","Kotak"],note:"Rate cut uncertainty keeping banks range-bound"},
{name:"FMCG",change:0.2,flow:"neutral",stocks:["HUL","Nestle","Britannia"],note:"Defensive play"},
{name:"Auto",change:0.6,flow:"neutral",stocks:["Maruti","M&M","Bajaj Auto"],note:"Rural demand recovery partially offset by fuel cost fears"},
{name:"Realty",change:1.1,flow:"in",stocks:["DLF","Godrej Props","Prestige"],note:"Rate cut hopes supporting property sentiment"},
{name:"Power",change:0.9,flow:"in",stocks:["NTPC","Power Grid","Adani Power"],note:"Energy transition + base load demand growing"},
];
// --- SIGNAL ENGINE ------------------------------------------------
function computeRSI(prices,n=14){
// Fallback when history < n+1 bars: approximate from single-period return.
// Multiplier 8 maps a ±6.25% 1-day move to the RSI boundary (clamped 20–80).
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
function buildSignal(key,history,mW=0.40,rW=0.35,eW=0.25,liveVolStatus=null){
const prices=history||[];
const cur=prices.length?prices[prices.length-1]:(BASE[key]?.price||100);
const chg=prices.length>1?+((cur-prices[prices.length-2])/prices[prices.length-2]*100).toFixed(2):(BASE[key]?.change||0);
const rsi=computeRSI(prices);
const macd=computeMACD(prices);
const e20=computeEMA(prices.slice(-20),20)||cur;
const e50=computeEMA(prices.slice(-50),50)||cur;
const volStatus=liveVolStatus||BASE[key]?.vol||"normal";
const rsiScore=rsi<28?90:rsi<40?72:rsi<55?50:rsi<68?30:12;
const macdScore=macd.cross==="bullish-cross"?92:macd.cross==="bullish"?67:macd.cross==="bearish-cross"?10:35;
const emaScore=cur>e20&&cur>e50?76:cur<e20&&cur<e50?26:50;
const volBonus=volStatus==="above"?4:volStatus==="below"?-3:0;
const raw=rsiScore*rW+macdScore*mW+emaScore*eW+volBonus;
const score=Math.round(Math.min(97,Math.max(3,raw)));
const action=score>=66?"BUY":score<=34?"SELL":"HOLD";
const grade=score>=80?"A":score>=65?"B":score>=50?"C":"D";
const rsiLabel=rsi<30?"Oversold -- potential bounce":rsi<45?"Mild selling pressure":rsi<55?"Neutral territory":rsi<70?"Mild buying pressure":"Overbought -- potential pullback";
const emaLabel=cur>e20&&cur>e50?"Above Both -- uptrend confirmed":cur<e20&&cur<e50?"Below Both -- downtrend confirmed":"Mixed -- no clear trend";
const macdLabel=macd.cross==="bullish-cross"?"Bullish Cross ^":macd.cross==="bearish-cross"?"Bearish Cross v":macd.cross==="bullish"?"Bullish ^":"Bearish v";
const volLabel=volStatus==="above"?"Above Average -- signal is stronger":volStatus==="below"?"Below Average -- signal less reliable":"Average Volume";
const atrPct=0.025+Math.abs(chg)*0.005;
const dp=cur>=10000?0:cur>=100?1:cur>=10?2:3;
const rnd=(v)=>+v.toFixed(dp);
const entry=rnd(cur);
const target=action==="BUY"?rnd(cur*(1+atrPct*3.2)):rnd(cur*(1-atrPct*2.5));
const stop=action==="BUY"?rnd(cur*(1-atrPct*1.2)):rnd(cur*(1+atrPct*1.2));
const expRet=+(((target-entry)/entry)*100).toFixed(1);
const expDD=+(((stop-entry)/entry)*100).toFixed(1);
const rr=+Math.abs(expRet/(Math.abs(expDD)||1)).toFixed(2);
const winRate=score>=80?68:score>=65?58:score>=50?48:36;
// Context Score computation
const assetTheme=ASSETS[key]?.theme||"neutral";
const regimePts=assetTheme==="safe"||assetTheme==="defence"||assetTheme==="energy"?20:assetTheme==="index"?8:12;
const newsPts=Math.abs(chg)>1.5?18:Math.abs(chg)>0.5?12:6;
const fibPts=emaScore>=70?16:emaScore>=50?10:5;
const corrPts=volStatus==="above"?12:volStatus==="normal"?8:4;
const winPts=winRate>=65?18:winRate>=55?14:winRate>=45?10:6;
const contextScore=Math.min(100,regimePts+newsPts+fibPts+corrPts+winPts);
return{key,cur,chg,rsi,rsiLabel,macd,macdLabel,e20,e50,emaLabel,score,action,grade,expRet,expDD,rr,winRate,entry,target,stop,volStatus,volLabel,contextScore,regimePts,newsPts,fibPts,corrPts,winPts};
}
// --- PREDICTION ENGINE --------------------------------------------
const SENS={
// Commodities
gold:{e:0.010,d:-0.006,v:0.003},silver:{e:0.009,d:-0.005,v:0.003},
crude:{e:0.014,d:-0.009,v:0.004},natgas:{e:0.012,d:-0.007,v:0.005},
copper:{e:0.007,d:-0.008,v:0.004},wheat:{e:0.011,d:-0.006,v:0.005},
// Macro/FX
nifty:{e:-0.007,d:0.009,v:0.003},bnifty:{e:-0.008,d:0.010,v:0.003},
vix:{e:0.030,d:-0.020,v:0.006},usdinr:{e:0.004,d:-0.003,v:0.002},dxy:{e:0.005,d:-0.003,v:0.002},
// Crypto
btc:{e:0.018,d:-0.015,v:0.008},eth:{e:0.016,d:-0.013,v:0.007},
// Defence
hal:{e:0.012,d:-0.004,v:0.004},bel:{e:0.011,d:-0.003,v:0.003},
mazagon:{e:0.013,d:-0.005,v:0.004},mtar:{e:0.012,d:-0.005,v:0.005},
paras:{e:0.014,d:-0.006,v:0.006},datapatterns:{e:0.013,d:-0.005,v:0.005},
grse:{e:0.012,d:-0.004,v:0.005},cochinship:{e:0.011,d:-0.004,v:0.005},
// Energy
ongc:{e:0.010,d:-0.006,v:0.003},gail:{e:0.009,d:-0.005,v:0.003},
coalind:{e:0.008,d:-0.005,v:0.003},bpcl:{e:-0.006,d:0.004,v:0.003},
hpcl:{e:-0.006,d:0.004,v:0.003},ioc:{e:-0.005,d:0.003,v:0.003},
petronet:{e:0.007,d:-0.004,v:0.003},tatapower:{e:0.005,d:-0.003,v:0.004},
// Banking
hdfcbank:{e:-0.005,d:0.007,v:0.003},icicibank:{e:-0.005,d:0.007,v:0.003},
sbi:{e:-0.006,d:0.008,v:0.004},kotak:{e:-0.004,d:0.006,v:0.003},
axisbank:{e:-0.005,d:0.007,v:0.003},muthoot:{e:0.009,d:-0.004,v:0.003},
aubank:{e:-0.004,d:0.006,v:0.004},idfcfirst:{e:-0.005,d:0.007,v:0.005},
// IT
tcs:{e:-0.004,d:0.005,v:0.003},infy:{e:-0.004,d:0.005,v:0.003},
wipro:{e:-0.003,d:0.004,v:0.003},hcltech:{e:-0.004,d:0.005,v:0.003},
techm:{e:-0.004,d:0.005,v:0.004},ltim:{e:-0.004,d:0.005,v:0.004},
persistent:{e:-0.003,d:0.004,v:0.004},
// Pharma
sunpharma:{e:0.002,d:0.003,v:0.003},drreddy:{e:0.002,d:0.003,v:0.003},
cipla:{e:0.002,d:0.003,v:0.003},divis:{e:0.002,d:0.003,v:0.003},
apollo:{e:0.001,d:0.004,v:0.003},mankind:{e:0.002,d:0.003,v:0.004},
// Metals
tatasteel:{e:0.008,d:-0.005,v:0.004},jswsteel:{e:0.008,d:-0.005,v:0.004},
hindalco:{e:0.007,d:-0.004,v:0.004},vedanta:{e:0.009,d:-0.005,v:0.005},
sail:{e:0.007,d:-0.004,v:0.004},nmdc:{e:0.006,d:-0.003,v:0.004},
// FMCG
hul:{e:-0.002,d:0.004,v:0.002},itc:{e:0.001,d:0.003,v:0.002},
nestle:{e:-0.002,d:0.004,v:0.002},titan:{e:0.006,d:-0.003,v:0.002},
godrejcp:{e:-0.002,d:0.004,v:0.002},marico:{e:-0.002,d:0.003,v:0.002},
dabur:{e:-0.002,d:0.003,v:0.002},
// MSME
kaynes:{e:0.010,d:-0.004,v:0.006},dixon:{e:0.009,d:-0.004,v:0.006},
avalon:{e:0.011,d:-0.005,v:0.007},syrma:{e:0.010,d:-0.004,v:0.006},
azad:{e:0.011,d:-0.005,v:0.007},ideaforge:{e:0.012,d:-0.006,v:0.008},
elin:{e:0.009,d:-0.004,v:0.006},
};
function genPaths(key,base,params,newsDelta=0,histDays=30){
const s=SENS[key]||SENS.gold;
const effEsc=Math.min(95,Math.max(5,params.escalation+newsDelta*100));
const eStr=(effEsc/100)*(params.confidence/100);
const dStr=((100-effEsc)/100)*(params.confidence/100);
const volM=params.volatility/50;
const days=Math.max(5,Math.round(30*(params.timeHorizon/100)));
const seed=key.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
const hist=[];
let hp=base*(1-0.003*Math.sqrt(histDays||30));
const hDays=Math.min(histDays||30,180);
for(let i=-hDays;i<=0;i++){
const decay=Math.max(0.02,0.15/Math.sqrt(hDays));
hp+=(base-hp)*decay+Math.sin(i*seed*0.3)*0.003*hp+(Math.random()-0.5)*0.004*hp;
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
// --- NEWS ---------------------------------------------------------
const NMAP=[
{kw:["oil","crude","opec","barrel","hormuz","petroleum"],assets:["crude","ongc","gail"],d:0.08},
{kw:["gold","xau","bullion","safe haven","precious"],assets:["gold","silver","muthoot","titan"],d:0.07},
{kw:["silver","xag"],assets:["silver","gold"],d:0.06},
{kw:["natural gas","lng","gazprom"],assets:["natgas","gail"],d:0.07},
{kw:["wheat","grain","food","ukraine"],assets:["wheat"],d:0.06},
{kw:["defence","defense","military","weapon","war","attack","airstrike","nato","missile"],assets:["hal","bel","mazagon","gold","crude"],d:0.09},
{kw:["sanction","embargo"],assets:["crude","gold","usdinr"],d:0.07},
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
const queries=["Russia Ukraine war defence oil gold","India NIFTY economy RBI markets","OPEC crude oil price energy","Bitcoin crypto BTC ETH","India defence HAL BEL stocks","gold silver safe haven geopolitical"];
const all=[],seen=new Set();
const parseRSS=(xml)=>{
const items=[];
const parser=new DOMParser();
const doc=parser.parseFromString(xml,"text/xml");
doc.querySelectorAll("item").forEach(item=>{
const title=item.querySelector("title")?.textContent||"";
const link=item.querySelector("link")?.textContent||"";
const pubDate=item.querySelector("pubDate")?.textContent||"";
const source=item.querySelector("source")?.textContent||"";
const desc=item.querySelector("description")?.textContent||"";
items.push({title,link,pubDate,source,desc});
});
return items;
};
await Promise.allSettled(queries.map(async q=>{
try{
const r=await fetch(`/api/news?q=${encodeURIComponent(q)}`,{signal:AbortSignal.timeout(8000)});
if(!r.ok)throw new Error(`api/news ${r.status}`);
const xml=await r.text();
const items=parseRSS(xml);
items.slice(0,5).forEach(item=>{
const k=item.title?.slice(0,70);
if(!k||seen.has(k))return;
seen.add(k);
const sc=scoreNews(item.title,item.desc||"");
const src=(item.source||item.title||"").toLowerCase();
const tier=["reuters","bloomberg","economic times","mint","livemint","business standard","ft","wsj"].some(x=>src.includes(x))?1:2;
all.push({
title:item.title?.replace(/ - [^-]+$/,"")||"",
source:item.source||"News",
time:item.pubDate?new Date(item.pubDate).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"",
pubDate:item.pubDate?new Date(item.pubDate):new Date(),
link:item.link,tier,...sc
});
});
}catch(e){}
}));
return all.sort((a,b)=>b.pubDate-a.pubDate).slice(0,40);
}
async function fetchPrice(sym,timeout=12000){
const isFuture=sym.includes("=F")||sym.startsWith("^")||sym.includes("=X")||sym.includes(".NYB");
const range=isFuture?"6mo":"1y";
const ctrl=new AbortController();
const id=setTimeout(()=>ctrl.abort(),timeout);
try{
const r=await fetch(`/api/prices?sym=${encodeURIComponent(sym)}&range=${range}`,{signal:ctrl.signal});
if(!r.ok)throw new Error(`api/prices returned ${r.status}`);
const j=await r.json();
clearTimeout(id);
const res=j?.chart?.result?.[0];if(!res)return null;
const q=res.indicators?.quote?.[0]||{};
const timestamps=res.timestamp||res.timestamps||[];
const opens=q.open||[];const highs=q.high||[];
const lows=q.low||[];const closes=q.close||[];const volumes=q.volume||[];
const ohlcv=timestamps.map((ts,i)=>{
const c=closes[i]||0;if(!c)return null;
const prev=i>0?(closes[i-1]||c):c;
const o=opens[i]||prev;
const h=highs[i]||Math.max(o,c);
const l=lows[i]||Math.min(o,c);
return{time:ts,open:+o.toFixed(4),high:+h.toFixed(4),low:+l.toFixed(4),close:+c.toFixed(4),volume:volumes[i]||0};
}).filter(Boolean).slice(-252);
const validCloses=closes.filter(Boolean);
const meta=res.meta;const price=meta.regularMarketPrice??meta.previousClose??0;
const prev=meta.previousClose??price;
const vol=volumes||[];
const avgVol=vol.length>10?vol.slice(-20).reduce((a,b)=>a+(b||0),0)/20:0;
const lastVol=vol[vol.length-1]||0;
const volStatus=avgVol>0?(lastVol>avgVol*1.2?"above":lastVol<avgVol*0.7?"below":"normal"):"normal";
return{price:+price.toFixed(2),change:prev?+((price-prev)/prev*100).toFixed(2):0,history:validCloses.slice(-55),ohlcv,stale:false,volStatus};
}catch{clearTimeout(id);return null;}
}
async function fetchAllPrices(last={}){
const entries=Object.entries(ASSETS);
const out={};
const BATCH=5;
for(let i=0;i<entries.length;i+=BATCH){
const batch=entries.slice(i,i+BATCH);
const results=await Promise.allSettled(batch.map(([,v])=>fetchPrice(v.sym)));
results.forEach((r,j)=>{
const key=batch[j][0];
if(r.status==="fulfilled"&&r.value)out[key]=r.value;
else out[key]=last[key]?{...last[key],stale:true}:{price:BASE[key]?.price||0,change:BASE[key]?.change||0,history:[],ohlcv:[],stale:true,volStatus:BASE[key]?.vol||"normal"};
});
if(i+BATCH<entries.length)await new Promise(r=>setTimeout(r,300));
}
return out;
}
function pearson(x,y){
const n=Math.min(x.length,y.length);if(n<5)return 0;
const mx=x.slice(0,n).reduce((a,b)=>a+b,0)/n,my=y.slice(0,n).reduce((a,b)=>a+b,0)/n;
let num=0,dx2=0,dy2=0;
for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;num+=dx*dy;dx2+=dx*dx;dy2+=dy*dy;}
const d=Math.sqrt(dx2*dy2);return d===0?0:+(num/d).toFixed(3);
}
// --- CALENDAR -----------------------------------------------------
const TODAY=new Date();
function daysFrom(d){return Math.round((new Date(d)-TODAY)/86400000);}
const CALENDAR=[
{date:"2026-03-19",event:"US Federal Reserve FOMC Decision",type:"Central Bank",importance:"market-moving",assets:["gold","usdinr","btc","nifty"],historical:"Last 5: Gold +1.8% dovish, -1.2% hawkish. NIFTY -1.5% on surprise hike.",preEvent:"Reduce equity exposure 48h before. Gold longs safe through Fed uncertainty.",postEvent:"Watch DXY first 30min -- tells you EM asset direction for rest of day."},
{date:"2026-03-21",event:"India CPI Inflation Data",type:"Macro",importance:"high",assets:["nifty","bnifty","usdinr","gold"],historical:"Last 5: BankNifty +1.4% in-line, -1.8% upside surprise.",preEvent:"Neutral. Wait for the print before entering rate-sensitive trades.",postEvent:"CPI above 5.5% -> reduce BankNifty. Below 4.5% -> add BankNifty."},
{date:"2026-04-02",event:"RBI Monetary Policy (MPC)",type:"Central Bank",importance:"market-moving",assets:["nifty","bnifty","usdinr","gail","ongc"],historical:"Last 5: BankNifty +2.1% cut, -2.8% hike, +0.4% hold.",preEvent:"Inflation cooling -> long BankNifty into meeting.",postEvent:"BankNifty direction in first 30min sustained all day 80% of time."},
{date:"2026-04-03",event:"US Non-Farm Payrolls (NFP)",type:"Macro",importance:"high",assets:["gold","dxy","usdinr","btc"],historical:"Last 5: Gold -0.9% strong NFP, +1.2% weak NFP.",preEvent:"Hold gold. Weak jobs = gold rally. Strong jobs = DXY rally.",postEvent:"DXY reaction tells you gold direction within 2 hours."},
{date:"2026-04-10",event:"US CPI Inflation",type:"Macro",importance:"market-moving",assets:["gold","crude","usdinr","nifty","btc"],historical:"Hot CPI = gold +1.5%. Cool CPI = gold -0.8%.",preEvent:"Gold longs hold through CPI.",postEvent:"Regime shift possible if CPI surprises by more than 0.3%."},
{date:"2026-04-15",event:"OPEC+ Production Review",type:"Commodity",importance:"high",assets:["crude","ongc","gail","coalind"],historical:"Last 3 cuts: Crude avg +4.2% in 48hrs.",preEvent:"Add crude/ONGC 2 days before.",postEvent:"No cut = crude -3 to -5%. Have stop loss at entry price."},
].filter(e=>daysFrom(e.date)>=0&&daysFrom(e.date)<=30).sort((a,b)=>new Date(a.date)-new Date(b.date));
// --- WATCHLIST META -----------------------------------------------
const WL_META=[
{key:"hal",sector:"Defence",regime:"escalation",thesis:"Defence budget +12% YoY. Rs94,000Cr order book. Direct conflict cycle beneficiary.",action:"Ready",trigger:"Entry above Rs4,250 with volume above average",invalidation:"Conflict resolution confirmed or defence budget cut",thesisScore:88},
{key:"bel",sector:"Defence",regime:"escalation",thesis:"Electronic warfare demand accelerating. FY26 order inflows at record pace.",action:"Ready",trigger:"Breakout above Rs235 on strong volume",invalidation:"SEBI capex concerns or conflict de-escalation",thesisScore:82},
{key:"ongc",sector:"Energy",regime:"escalation",thesis:"Every $1 crude rise = ~Rs250Cr ONGC earnings uplift.",action:"Ready",trigger:"Crude sustains above $70 for 3+ sessions",invalidation:"Crude drops below $62 or windfall tax reimposed",thesisScore:75},
{key:"gold",sector:"Commodity",regime:"escalation",thesis:"Classic safe-haven. Central bank buying accelerating.",action:"Ready",trigger:"Any escalation headline or DXY below 102",invalidation:"Ceasefire confirmed + Fed rate hike cycle restarts",thesisScore:90},
{key:"silver",sector:"Commodity",regime:"escalation",thesis:"Lags gold 3-5 days then outperforms.",action:"Breakout",trigger:"Silver/Gold ratio below 88 or silver above $36.50",invalidation:"Industrial demand collapses",thesisScore:83},
{key:"crude",sector:"Commodity",regime:"escalation",thesis:"Hormuz risk premium + OPEC discipline.",action:"Ready",trigger:"Iran/Hormuz headline or OPEC cut signal",invalidation:"Ceasefire + OPEC output increase",thesisScore:77},
{key:"btc",sector:"Crypto",regime:"neutral",thesis:"Digital gold narrative activating. ETF demand growing.",action:"Wait",trigger:"BTC reclaims $85,000 with volume confirmation",invalidation:"Regulatory crackdown or broad risk-off selloff",thesisScore:65},
];
const STRESS=[
{name:"Crude +15%",icon:"🛢️",winners:["ongc","gail","coalind","gold","silver"],losers:["nifty","bnifty","titan"],hedge:"Short BankNifty futures",note:"Inflation spike -> RBI hawkish."},
{name:"INR Weakens 3%",icon:"₹",winners:["ongc","hal","btc","gold"],losers:["nifty","bnifty"],hedge:"Long USD/INR forwards",note:"FII outflows. Import-heavy sectors hurt."},
{name:"Fed Turns Hawkish",icon:"🏦",winners:["dxy","usdinr"],losers:["gold","btc","nifty","bnifty"],hedge:"Long DXY, short EM equities",note:"EM capital outflows."},
{name:"Global Risk-Off",icon:"⚠️",winners:["gold","silver","wheat"],losers:["btc","nifty","copper","eth"],hedge:"Long gold, short NIFTY",note:"BTC drops first in risk-off."},
{name:"Iran Closes Hormuz",icon:"🚢",winners:["crude","gold","hal","bel"],losers:["nifty","bnifty","usdinr"],hedge:"Long crude + defence stocks",note:"Extreme crude spike."},
{name:"Russia-Ukraine Ceasefire",icon:"🕊️",winners:["nifty","bnifty","copper","wheat"],losers:["gold","hal","bel","crude"],hedge:"Long NIFTY, reduce defence + gold",note:"Risk-on globally."},
];
// --- FORECAST CATEGORIES (module-level so AssetBrowser can access) -
const FORECAST_CATS = [
  {
    id:"indices", label:"Indices", icon:"📊", color:C.navy,
    keys:["nifty","bnifty","vix"],
    desc:"NSE benchmark indices and volatility",
  },
  {
    id:"commodities", label:"Commodities", icon:"🪙", color:C.gold,
    sub:[
      {label:"Precious Metals", keys:["gold","silver"]},
      {label:"Energy",          keys:["crude","natgas"]},
      {label:"Industrial",      keys:["copper","wheat"]},
    ],
    desc:"Global commodity prices -- safe havens, energy, industrial",
  },
  {
    id:"stocks", label:"Stocks", icon:"🏢", color:C.blue,
    sub:[
      {label:"Defence",          keys:["hal","bel","mazagon","mtar","paras","datapatterns","grse","cochinship"]},
      {label:"Energy & Oil",     keys:["ongc","gail","coalind","bpcl","hpcl","ioc","petronet","tatapower"]},
      {label:"Banking & Finance",keys:["hdfcbank","icicibank","sbi","kotak","axisbank","muthoot","aubank","idfcfirst"]},
      {label:"IT & Tech",        keys:["tcs","infy","wipro","hcltech","techm","ltim","persistent"]},
      {label:"Pharma",           keys:["sunpharma","drreddy","cipla","divis","apollo","mankind"]},
      {label:"Metals & Mining",  keys:["tatasteel","jswsteel","hindalco","vedanta","sail","nmdc"]},
      {label:"FMCG & Consumer",  keys:["hul","itc","nestle","titan","godrejcp","marico","dabur"]},
      {label:"MSME / SME",       keys:["kaynes","dixon","avalon","syrma","azad","ideaforge","elin"]},
    ],
    desc:"NSE-listed stocks grouped by sector — Defence, Energy, Banking, IT, Pharma, Metals, FMCG, MSME",
  },
  {
    id:"fx", label:"FX", icon:"💱", color:C.teal,
    keys:["usdinr","dxy"],
    desc:"Currency pairs -- Rupee vs Dollar, DXY index",
  },
  {
    id:"crypto", label:"Crypto", icon:"₿", color:C.purple,
    keys:["btc","eth"],
    desc:"Bitcoin and Ethereum -- digital safe haven vs risk asset",
  },
];
const FA_GROUPS = [
  { label:"Indices",          color:C.navy,   keys:["nifty","bnifty","vix"] },
  { label:"Commodities",      color:C.gold,   keys:["gold","silver","crude","natgas","copper","wheat"] },
  { label:"FX",               color:C.teal,   keys:["usdinr","dxy"] },
  { label:"Crypto",           color:C.purple, keys:["btc","eth"] },
  { label:"Defence",          color:C.red,    keys:["hal","bel","mazagon","mtar","paras","datapatterns","grse","cochinship"] },
  { label:"Energy & Oil",     color:C.amber,  keys:["ongc","gail","coalind","bpcl","hpcl","ioc","petronet","tatapower"] },
  { label:"Banking",          color:C.blue,   keys:["hdfcbank","icicibank","sbi","kotak","axisbank","muthoot","aubank","idfcfirst"] },
  { label:"IT & Tech",        color:"#4338CA", keys:["tcs","infy","wipro","hcltech","techm","ltim","persistent"] },
  { label:"Pharma",           color:C.green,  keys:["sunpharma","drreddy","cipla","divis","apollo","mankind"] },
  { label:"Metals",           color:C.teal,   keys:["tatasteel","jswsteel","hindalco","vedanta","sail","nmdc"] },
  { label:"FMCG",             color:"#D97706", keys:["hul","itc","nestle","titan","godrejcp","marico","dabur"] },
  { label:"MSME / SME",       color:"#DB2777", keys:["kaynes","dixon","avalon","syrma","azad","ideaforge","elin"] },
];
// --- CLAUDE API ---------------------------------------------------
async function callClaude(prompt){
try{
const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
if(!r.ok){const e=await r.text();throw new Error(e);}
const d=await r.json();
return d.text||"No response generated.";
}catch(err){
return`!️ Claude API error: ${err.message}`;
}
}
async function getAISliderRec(news,prices){
const topNews=news.slice(0,8).map(n=>`${n.title} [${n.impact}]`).join("\n");
const px=(k)=>{const p=prices[k]||BASE[k];return`${ASSETS[k]?.label} ${(p?.change||0)>0?"+":""}${p?.change||0}%`;};
const chgs=["gold","crude","hal","bel","vix","btc"].map(px).join(", ");
return callClaude(`You are a macro analyst. Based on today's news and market moves, recommend the 4 scenario slider values for an Indian trader dashboard.
TODAY'S MARKET MOVES: ${chgs}
TOP HEADLINES:\n${topNews}
Return ONLY a JSON object: {"escalation": 0-100, "confidence": 10-100, "volatility": 10-100, "timeHorizon": 10-100}
Only return the JSON, nothing else.`);
}
async function fetchAlphaPicks(prices,signals,params,newsDelta,news){
const topSigs=Object.entries(signals).filter(([,s])=>s?.score&&s.score!==50).sort((a,b)=>Math.abs(b[1].score-50)-Math.abs(a[1].score-50)).slice(0,6).map(([k,s])=>`${ASSETS[k]?.label}: Score ${s.score}/100 (${s.action}), RSI ${s.rsi}, MACD ${s.macdLabel}, Vol ${s.volStatus}`).join("\n");
const px=(k)=>{const p=prices[k]||BASE[k];return`${ASSETS[k]?.label}: ${ASSETS[k]?.unit}${fmtPrice(p?.price||0,ASSETS[k]?.unit||"")} (${(p?.change||0)>0?"+":""}${p?.change||0}%)`;};
const priceStr=["gold","silver","crude","hal","bel","ongc","nifty","btc"].map(px).join(" | ");
const topNews=news.slice(0,6).map(n=>`${n.title} [${n.impact}/${n.importance}]`).join("\n");
return callClaude(`Institutional portfolio manager for Indian trader with Rs20L capital.
LIVE PRICES: ${priceStr}
TOP SIGNALS:\n${topSigs}
SCENARIO: Escalation ${params.escalation}% (news-adj: ${Math.round(params.escalation+newsDelta*100)}%)
HEADLINES:\n${topNews}
Generate 3 high-conviction trades. For each: ASSET | ENTRY | TARGET (upside%) | STOP LOSS (downside%) | POSITION Rsamount | TIMEFRAME | CONVICTION: A/B/C | REWARD/RISK | WHY NOW | INVALIDATION
Never recommend more than 15% of capital per trade.`);
}
async function fetchBriefing(prices,params,newsDelta,news){
const px=(k)=>{const p=prices[k]||BASE[k];return`${ASSETS[k]?.label} ${ASSETS[k]?.unit}${fmtPrice(p?.price||0,ASSETS[k]?.unit||"")} (${(p?.change||0)>0?"+":""}${p?.change||0}%)`;};
const priceStr=["gold","silver","crude","hal","bel","ongc","nifty","btc","usdinr","vix"].map(px).join(", ");
const topNews=news.slice(0,8).map((n,i)=>`${i+1}. [Tier ${n.tier}] ${n.title} -- ${n.impact.toUpperCase()}`).join("\n");
return callClaude(`Institutional analyst for Indian trader (Rs20L, Zerodha + ICICI Direct).
LIVE DATA: ${priceStr}
SCENARIO: Escalation ${params.escalation}% (news adj: ${Math.round(params.escalation+newsDelta*100)}%)
HEADLINES:\n${topNews}
Morning briefing:
**REGIME:** [one line]
**WHAT CHANGED:** [2-3 bullets]
**TOP 3 OPPORTUNITIES:** [ranked]
**KEY RISK:** [specific level]
**GOLD & SILVER:** [3 sentences with price levels]
Under 250 words. Direct, specific.`);
}
async function fetchDiscoveredStocks(news,existingKeys){
const headlines=news.slice(0,15).map(n=>n.title).join("\n");
const existing=existingKeys.map(k=>ASSETS[k]?.label||k).join(", ");
return callClaude(`Indian stock market analyst. Based on news headlines, identify NSE-listed stocks NOT in our watchlist.
EXISTING: ${existing}
HEADLINES:\n${headlines}
Return ONLY JSON array: [{"symbol":"NSE_SYMBOL","name":"Company Name","reason":"...","opportunity":"...","alert":"high/medium/low","sector":"..."}]`);
}
// --- UI ATOMS ----------------------------------------------------
function Tag({children,color=C.muted,small}){return <span style={{background:`${color}18`,color,borderRadius:20,padding:small?"1px 7px":"3px 10px",fontSize:small?10:11,fontWeight:600,letterSpacing:0.3,whiteSpace:"nowrap",display:"inline-block"}}>{children}</span>;}
function Delta({v,small}){const up=v>=0;return <span style={{color:up?C.green:C.red,fontWeight:700,fontSize:small?11:13,fontFamily:MONO}}>{up?"^":"v"} {Math.abs(v).toFixed(2)}%</span>;}
function Card({children,style={},noPad}){return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:noPad?0:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",...style}}>{children}</div>;}
function Explain({text}){return <div style={{fontSize:10,color:C.muted,marginTop:3,lineHeight:1.4,fontStyle:"italic"}}>{text}</div>;}
function SHead({title,sub,action}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}><div><div style={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.navy,lineHeight:1.2}}>{title}</div>{sub&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{sub}</div>}</div>{action}</div>;}
function LiveDot({color=C.green}){return <span className="pulse" style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:color,marginRight:5}}/>;}
function Spin({size=14,color="#fff"}){return <div style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${color}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>;}
function ImpDot({level}){const map={"market-moving":C.red,"high":"#EA580C","medium":C.amber,"low":C.dim};const lbl={"market-moving":"🔴 Market-Moving","high":"🟠 High","medium":"🟡 Medium","low":"o Low"};return <span style={{fontSize:11,fontWeight:700,color:map[level]||C.dim}}>{lbl[level]||level}</span>;}
function RangeSlider({label,value,min,max,step,onChange,color,unit="",hint,aiVal,onApplyAI}){
return <div style={{marginBottom:18}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"flex-start",flexWrap:"wrap",gap:4}}>
<div><div style={{fontSize:12,color:C.textMid,fontWeight:600}}>{label}</div>{hint&&<Explain text={hint}/>}</div>
<div style={{display:"flex",alignItems:"center",gap:6}}>
{aiVal!==undefined&&aiVal!==value&&(
<button onClick={onApplyAI} style={{fontSize:10,fontWeight:700,color:C.purple,background:`${C.purple}12`,border:`1px solid ${C.purple}30`,borderRadius:12,padding:"2px 8px",cursor:"pointer"}}>
* AI: {aiVal}{unit}
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
// ==================================================================
// --- RECHARTS ANALYTICAL CHART (FULLY UPGRADED) ------------------
// ==================================================================
// Timeline windows available to the user
const CHART_WINDOWS = [
  { v: 14,  l: "2W" },
  { v: 30,  l: "1M" },
  { v: 60,  l: "2M" },
  { v: 90,  l: "3M" },
  { v: 180, l: "6M" },
  { v: 252, l: "1Y" },
];
function TVChart({ symbol, interval="D", ohlcv=[], unit="", label="" }) {
  const [chartWindow, setChartWindow] = useState(90);
  const [traderView, setTraderView] = useState(false); // Clean vs Trader view
  const directUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`;
  // -- Build chart data from OHLCV --------------------------------
  const chartData = useMemo(() => {
    // Slice to the selected window
    const src = (ohlcv || []).slice(-Math.min((ohlcv || []).length, chartWindow));
    if (!src.length) return [];
    // Compute EMA20 and EMA50
    let e20 = src[0].close, e50 = src[0].close;
    const k20 = 2 / 21, k50 = 2 / 51;
    return src.map((d) => {
      e20 = d.close * k20 + e20 * (1 - k20);
      e50 = d.close * k50 + e50 * (1 - k50);
      const date = new Date(d.time * 1000);
      // Smart date label: show month+day for <=90d, month+year for longer
      const lbl = chartWindow <= 90
        ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      return {
        t: lbl,
        idx: d.time,
        open: d.open, high: d.high, low: d.low, close: d.close,
        volume: d.volume || 0,
        ema20: +e20.toFixed(4),
        ema50: +e50.toFixed(4),
        isUp: d.close >= d.open,
        bodyLow:  Math.min(d.open, d.close),
        bodyHigh: Math.max(d.open, d.close),
      };
    });
  }, [ohlcv, chartWindow]);
  // -- Fibonacci 0.618 + Support/Resistance (for Trader View) --------
  const overlays = useMemo(() => {
    if (!chartData.length) return { fib618: null, support: [], resist: [] };
    const highs = chartData.map(d => d.high);
    const lows  = chartData.map(d => d.low);
    const swingHigh = Math.max(...highs);
    const swingLow  = Math.min(...lows);
    const fib618 = +(swingHigh - (swingHigh - swingLow) * 0.618).toFixed(4);
    const fib382 = +(swingHigh - (swingHigh - swingLow) * 0.382).toFixed(4);
    // S/R: find price levels where direction reversed 2+ times
    const findZones = (type) => {
      const zones = [];
      for (let i = 2; i < chartData.length - 2; i++) {
        const d = chartData[i];
        const isReversal = type === 'support'
          ? d.low < chartData[i-1].low && d.low < chartData[i+1].low && d.low < chartData[i-2].low
          : d.high > chartData[i-1].high && d.high > chartData[i+1].high && d.high > chartData[i-2].high;
        if (isReversal) {
          const val = type === 'support' ? d.low : d.high;
          const near = zones.find(z => Math.abs(z - val) / val < 0.008);
          if (!near) zones.push(+val.toFixed(4));
        }
      }
      return zones.slice(-2); // max 2 zones each
    };
    return { fib618, fib382, support: findZones('support'), resist: findZones('resist') };
  }, [chartData]);
  // -- Y-axis domain: tight 4% padding so movement is clearly visible --
  const yDomain = useMemo(() => {
    if (!chartData.length) return ["auto", "auto"];
    const allVals = chartData.flatMap(d =>
      [d.low, d.high, d.ema20, d.ema50].filter(Boolean)
    );
    if (!allVals.length) return ["auto", "auto"];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range  = maxVal - minVal || maxVal * 0.05;
    const pad    = Math.max(range * 0.04, maxVal * 0.005);
    return [+(minVal - pad).toFixed(4), +(maxVal + pad).toFixed(4)];
  }, [chartData]);
  // -- Smart X-axis interval: show ~8 labels regardless of window ---
  const xInterval = useMemo(() => {
    if (!chartData.length) return 1;
    return Math.max(1, Math.floor(chartData.length / 8));
  }, [chartData]);
  // -- Y-axis tick formatter -------------------------------------
  const fmtY = (v) => {
    if (!v && v !== 0) return "";
    const isUSD = unit === "$";
    const locale = isUSD ? "en-US" : "en-IN";
    if (v >= 100000) return `${unit}${(v / 1000).toFixed(0)}k`;
    if (v >= 10000)  return `${unit}${v.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
    if (v >= 1000)   return `${unit}${v.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
    if (v >= 100)    return `${unit}${v.toFixed(1)}`;
    if (v >= 10)     return `${unit}${v.toFixed(2)}`;
    return `${unit}${v.toFixed(3)}`;
  };
  // -- Period return ---------------------------------------------
  const firstClose = chartData.length ? chartData[0]?.close : 0;
  const lastClose  = chartData.length ? chartData[chartData.length - 1]?.close : 0;
  const totalReturn = firstClose ? +((lastClose - firstClose) / firstClose * 100).toFixed(1) : 0;
  const trendColor  = totalReturn >= 0 ? C.green : C.red;
  // -- Custom tooltip ---------------------------------------------
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: C.card, border: `1px solid ${C.borderDark}`,
        borderRadius: 10, padding: "10px 14px", fontSize: 11,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: 190,
      }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: 7, fontFamily: MONO, fontSize: 12 }}>
          {label}
        </div>
        {[
          ["O", d.open,  C.muted],
          ["H", d.high,  C.green],
          ["L", d.low,   C.red],
          ["C", d.close, d.isUp ? C.green : C.red],
          ["EMA20", d.ema20, C.blue],
          ["EMA50", d.ema50, C.amber],
        ].map(([lbl, val, clr]) => val ? (
          <div key={lbl} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 2 }}>
            <span style={{ color: C.dim, minWidth: 40 }}>{lbl}</span>
            <span style={{ fontFamily: MONO, fontWeight: 600, color: clr }}>
              {unit}{typeof val === "number" ? (val >= 1000 ? val.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : val.toFixed(val < 10 ? 3 : val < 100 ? 2 : 1)) : val}
            </span>
          </div>
        ) : null)}
      </div>
    );
  };
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 400 }}>
      {/* -- Toolbar -------------------------------------------- */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderBottom: `1px solid ${C.border}`,
        flexShrink: 0, flexWrap: "wrap", gap: 8, background: C.card,
      }}>
        {/* Timeline window selector */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: C.dim, fontWeight: 600, marginRight: 4 }}>PERIOD</span>
          {CHART_WINDOWS.map(w => (
            <button
              key={w.v}
              onClick={() => setChartWindow(w.v)}
              style={{
                padding: "4px 11px", borderRadius: 6, cursor: "pointer", fontSize: 11,
                fontWeight: 700, fontFamily: MONO,
                border: `1.5px solid ${chartWindow === w.v ? C.navy : C.border}`,
                background: chartWindow === w.v ? C.navy : C.card,
                color: chartWindow === w.v ? "#fff" : C.muted,
                transition: "all 0.12s",
                minHeight: 28,
              }}
            >
              {w.l}
            </button>
          ))}
        </div>
        {/* Return + legend + TradingView link */}
        <div style={{ display: "flex", gap: 12, fontSize: 11, alignItems: "center", flexWrap: "wrap" }}>
          {totalReturn !== 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700, color: trendColor, fontFamily: MONO,
              background: `${trendColor}12`, padding: "3px 8px", borderRadius: 6,
            }}>
              {totalReturn > 0 ? "+" : ""}{totalReturn}%
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 18, height: 2.5, background: C.blue, display: "inline-block", borderRadius: 2 }} />
            <span style={{ color: C.dim, fontSize: 10 }}>EMA20</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 18, height: 2.5, background: C.amber, display: "inline-block", borderRadius: 2 }} />
            <span style={{ color: C.dim, fontSize: 10 }}>EMA50</span>
          </span>
          <div style={{display:"flex",gap:3}}>
            {["Clean","Trader"].map(v=>(
              <button key={v} onClick={()=>setTraderView(v==="Trader")}
                style={{padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer",
                  border:`1px solid ${(traderView?(v==="Trader"):(v==="Clean"))?C.navy:C.border}`,
                  background:(traderView?(v==="Trader"):(v==="Clean"))?C.navy:C.card,
                  color:(traderView?(v==="Trader"):(v==="Clean"))?"#fff":C.muted}}>
                {v}
              </button>
            ))}
          </div>
          <a href={directUrl} target="_blank" rel="noreferrer"
            style={{color:C.navy,fontWeight:700,textDecoration:"none",fontSize:11,padding:"3px 8px",border:`1px solid ${C.border}`,borderRadius:6}}>
            TV ->
          </a>
        </div>
      </div>
      {/* -- Chart area ----------------------------------------- */}
      {chartData.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <Spin size={22} color={C.navy} />
          <div style={{ fontSize: 11, color: C.muted }}>Loading price data...</div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, padding: "12px 4px 0 0" }}>
          {/* -- Main price chart ------------------------------- */}
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
              <defs>
                <linearGradient id={`grad_${symbol.replace(/[^a-z0-9]/gi,"_")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={trendColor} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 5"
                stroke={C.border}
                strokeOpacity={0.8}
                vertical={false}
              />
              {/* -- X Axis -- crisp, always visible ----------- */}
              <XAxis
                dataKey="t"
                interval={xInterval}
                tick={{
                  fontSize: 10,
                  fill: C.textMid,
                  fontFamily: MONO,
                  fontWeight: 500,
                }}
                tickLine={{ stroke: C.borderDark, strokeWidth: 1 }}
                axisLine={{ stroke: C.borderDark, strokeWidth: 1 }}
                tickMargin={6}
                height={32}
              />
              {/* -- Y Axis -- smart formatting, always visible - */}
              <YAxis
                domain={yDomain}
                tick={{
                  fontSize: 10,
                  fill: C.textMid,
                  fontFamily: MONO,
                  fontWeight: 500,
                }}
                tickLine={{ stroke: C.borderDark, strokeWidth: 1 }}
                axisLine={{ stroke: C.borderDark, strokeWidth: 1 }}
                tickFormatter={fmtY}
                width={72}
                tickCount={7}
                tickMargin={4}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: C.navy, strokeWidth: 1, strokeDasharray: "4 3", strokeOpacity: 0.6 }}
              />
              {/* Price area */}
              <Area
                dataKey="close"
                name="Price"
                stroke={trendColor}
                strokeWidth={2.5}
                fill={`url(#grad_${symbol.replace(/[^a-z0-9]/gi,"_")})`}
                dot={false}
                connectNulls
                baseValue={yDomain[0]}
                activeDot={{ r: 5, fill: trendColor, stroke: "#fff", strokeWidth: 2 }}
              />
              {/* High/Low whiskers */}
              <Line dataKey="high" stroke={C.green} strokeWidth={0.6} dot={false} strokeDasharray="2 4" connectNulls name="High" legendType="none" />
              <Line dataKey="low"  stroke={C.red}   strokeWidth={0.6} dot={false} strokeDasharray="2 4" connectNulls name="Low"  legendType="none" />
              {/* EMAs */}
              <Line dataKey="ema20" stroke={C.blue}  strokeWidth={1.8} dot={false} connectNulls name="EMA20" legendType="none" />
              <Line dataKey="ema50" stroke={C.amber} strokeWidth={1.8} dot={false} connectNulls name="EMA50" legendType="none" />
              {/* Trader View overlays */}
              {traderView && overlays.fib618 && (
                <ReferenceLine y={overlays.fib618} stroke={C.gold} strokeWidth={2}
                  strokeDasharray="6 3"
                  label={{value:`0.618 ${fmtY(overlays.fib618)}`,position:"insideTopRight",fontSize:9,fill:C.gold,fontWeight:700}}/>
              )}
              {traderView && overlays.fib382 && (
                <ReferenceLine y={overlays.fib382} stroke={C.gold} strokeWidth={1}
                  strokeDasharray="3 4" opacity={0.6}
                  label={{value:`0.382`,position:"insideTopRight",fontSize:8,fill:C.gold}}/>
              )}
              {traderView && overlays.support.map((s,i)=>(
                <ReferenceLine key={`s${i}`} y={s} stroke={C.green} strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{value:`S ${fmtY(s)}`,position:"insideBottomRight",fontSize:8,fill:C.green}}/>
              ))}
              {traderView && overlays.resist.map((r,i)=>(
                <ReferenceLine key={`r${i}`} y={r} stroke={C.red} strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{value:`R ${fmtY(r)}`,position:"insideTopRight",fontSize:8,fill:C.red}}/>
              ))}
            </AreaChart>
          </ResponsiveContainer>
          {/* -- Volume bars ------------------------------------ */}
          <ResponsiveContainer width="100%" height={52}>
            <BarChart data={chartData} margin={{ top: 2, right: 16, bottom: 0, left: 8 }}>
              <XAxis
                dataKey="t"
                hide
              />
              <YAxis
                hide
                domain={[0, "auto"]}
              />
              <Bar
                dataKey="volume"
                name="Volume"
                radius={[1, 1, 0, 0]}
                isAnimationActive={false}
              >
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.isUp ? `${C.green}80` : `${C.red}80`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* -- Data summary strip ----------------------------- */}
          <div style={{
            display: "flex", gap: 16, padding: "6px 8px 2px",
            borderTop: `1px solid ${C.border}`, flexWrap: "wrap",
          }}>
            {chartData.length > 0 && (() => {
              const last = chartData[chartData.length - 1];
              const periodHigh = Math.max(...chartData.map(d => d.high));
              const periodLow  = Math.min(...chartData.map(d => d.low));
              return [
                ["CLOSE",  fmtY(last.close),      trendColor],
                ["EMA20",  fmtY(last.ema20),       C.blue],
                ["EMA50",  fmtY(last.ema50),       C.amber],
                [`${CHART_WINDOWS.find(w=>w.v===chartWindow)?.l} HIGH`, fmtY(periodHigh), C.green],
                [`${CHART_WINDOWS.find(w=>w.v===chartWindow)?.l} LOW`,  fmtY(periodLow),  C.red],
              ].map(([lbl, val, clr]) => (
                <div key={lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: C.dim, fontWeight: 700, letterSpacing: 0.8 }}>{lbl}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: clr, fontFamily: MONO }}>{val}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
// ==================================================================
// --- PREDICTION CHART (unchanged, keeping existing) --------------
// ==================================================================
function PredChart({assetKey,base,params,newsDelta,priceHistory=[]}){
const [hoveredPoint,setHoveredPoint]=useState(null);
const [histWindow,setHistWindow]=useState(30);
const unit=ASSETS[assetKey]?.unit||"";
const pred=useMemo(()=>genPaths(assetKey,base,params,newsDelta,histWindow),[assetKey,base,params,newsDelta,histWindow]);
const fmt=(v,dp=0)=>{
if(!v&&v!==0)return"--";
return v.toLocaleString("en-IN",{maximumFractionDigits:dp,minimumFractionDigits:dp});
};
const CT=({active,payload,label})=>{
if(!active||!payload?.length)return null;
const vals={};
payload.forEach(p=>{if(p.value)vals[p.dataKey]=p.value;});
const isHistory=label<=0;
return(
<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
padding:"12px 16px",fontSize:11,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",minWidth:220,zIndex:100}}>
<div style={{fontWeight:700,color:C.navy,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${C.border}`,fontFamily:MONO}}>
{label===0?"📍 TODAY":isHistory?`${Math.abs(label)} days ago`:`+${label} days ahead`}
</div>
{vals.actual&&(
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
<span style={{color:C.navy,fontWeight:700}}>Actual</span>
<span style={{color:C.navy,fontWeight:800,fontFamily:MONO}}>{unit}{fmt(vals.actual,2)}</span>
</div>
)}
{vals.escalation&&(
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
<span style={{color:C.red}}>🔴 Escalation</span>
<span style={{color:C.red,fontWeight:700,fontFamily:MONO}}>
{unit}{fmt(vals.escalation,0)}
<span style={{fontSize:10,marginLeft:4}}>({vals.escalation>base?"+":""}{((vals.escalation-base)/base*100).toFixed(1)}%)</span>
</span>
</div>
)}
{vals.deesc&&(
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
<span style={{color:C.green}}>🟢 De-escalation</span>
<span style={{color:C.green,fontWeight:700,fontFamily:MONO}}>
{unit}{fmt(vals.deesc,0)}
<span style={{fontSize:10,marginLeft:4}}>({vals.deesc>base?"+":""}{((vals.deesc-base)/base*100).toFixed(1)}%)</span>
</span>
</div>
)}
</div>
);
};
const EndDot=({cx,cy,payload,dataKey,color})=>{
if(!payload||payload.t!==pred.data[pred.data.length-1]?.t)return null;
const v=payload[dataKey];if(!v)return null;
const pct=((v-base)/base*100).toFixed(1);
return(
<g>
<circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2}/>
<rect x={cx+8} y={cy-12} width={72} height={22} rx={4} fill={color} fillOpacity={0.9}/>
<text x={cx+44} y={cy+3} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700" fontFamily="Arial">
{unit}{v>=1000?Math.round(v).toLocaleString("en-IN"):v.toFixed(1)} ({pct>0?"+":""}{pct}%)
</text>
</g>
);
};
const escPct=+((pred.escTarget-base)/base*100).toFixed(1);
const deescPct=+((pred.dscTarget-base)/base*100).toFixed(1);
const probEsc=Math.round(pred.effEsc);
const probDeesc=100-probEsc;
const probChop=Math.min(25,Math.round((100-Math.abs(probEsc-50))*0.3));
const adjEsc=Math.round(probEsc*(1-probChop/100));
const adjDeesc=Math.round(probDeesc*(1-probChop/100));
return(
<div>
<div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
<Tag color={pred.tracking==="escalation"?C.red:C.green}>
{pred.tracking==="escalation"?"🔴 Tracking escalation path":"🟢 Tracking de-escalation path"}
</Tag>
{newsDelta!==0&&<Tag color={C.purple}>📰 News adj: {newsDelta>0?"+":""}{(newsDelta*100).toFixed(0)}%</Tag>}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
<div style={{background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>ESCALATION</div>
<div style={{fontSize:20,fontWeight:800,color:C.red,fontFamily:MONO}}>{adjEsc}%</div>
<div style={{fontSize:10,color:C.red,marginTop:1}}>{escPct>0?"+":""}{escPct}%</div>
<div style={{fontSize:9,color:C.dim,marginTop:2}}>{unit}{fmt(pred.escTarget,0)}</div>
</div>
<div style={{background:"#F5F5F5",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>RANGE/CHOP</div>
<div style={{fontSize:20,fontWeight:800,color:C.muted,fontFamily:MONO}}>{probChop}%</div>
<div style={{fontSize:9,color:C.dim,marginTop:2}}>Near {unit}{fmt(base,0)}</div>
</div>
<div style={{background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>DE-ESCALATION</div>
<div style={{fontSize:20,fontWeight:800,color:C.green,fontFamily:MONO}}>{adjDeesc}%</div>
<div style={{fontSize:10,color:C.green,marginTop:1}}>{deescPct>0?"+":""}{deescPct}%</div>
<div style={{fontSize:9,color:C.dim,marginTop:2}}>{unit}{fmt(pred.dscTarget,0)}</div>
</div>
</div>
<div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",flexWrap:"wrap"}}>
<span style={{fontSize:10,color:C.muted,fontWeight:600}}>History:</span>
{[{v:14,l:"14D"},{v:30,l:"1M"},{v:90,l:"3M"},{v:180,l:"6M"}].map(({v,l})=>(
<button key={v} onClick={()=>setHistWindow(v)}
style={{padding:"3px 10px",borderRadius:14,border:`1.5px solid ${histWindow===v?C.navy:C.border}`,
background:histWindow===v?C.navy:C.card,color:histWindow===v?"#fff":C.muted,
fontSize:10,fontWeight:600,cursor:"pointer"}}>
{l}
</button>
))}
</div>
<div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:"8px 4px 4px 4px"}}>
<ResponsiveContainer width="100%" height={260}>
<AreaChart data={pred.data} margin={{top:8,right:80,bottom:8,left:4}}>
<defs>
<linearGradient id="escGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={C.red} stopOpacity={0.15}/><stop offset="100%" stopColor={C.red} stopOpacity={0.02}/>
</linearGradient>
<linearGradient id="deescGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={C.green} stopOpacity={0.15}/><stop offset="100%" stopColor={C.green} stopOpacity={0.02}/>
</linearGradient>
<linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={C.navy} stopOpacity={0.10}/><stop offset="100%" stopColor={C.navy} stopOpacity={0.01}/>
</linearGradient>
</defs>
<CartesianGrid strokeDasharray="2 4" stroke={C.border} strokeOpacity={0.6} vertical={false}/>
<XAxis dataKey="t"
tick={{fontSize:9,fill:C.textMid,fontWeight:500,fontFamily:MONO}}
tickLine={{stroke:C.borderDark,strokeWidth:1}}
axisLine={{stroke:C.borderDark,strokeWidth:1}}
tickMargin={4}
tickFormatter={v=>v===0?"TODAY":v>0?`+${v}d`:`${Math.abs(v)}d`}
interval={2}/>
<YAxis
tick={{fontSize:9,fill:C.textMid,fontFamily:MONO}}
tickLine={{stroke:C.borderDark,strokeWidth:1}}
axisLine={{stroke:C.borderDark,strokeWidth:1}}
width={68}
tickCount={6}
domain={([dataMin,dataMax])=>{
const pad=(dataMax-dataMin)*0.10||dataMax*0.04;
return[+(dataMin-pad).toFixed(2),+(dataMax+pad).toFixed(2)];
}}
tickFormatter={v=>{
if(!v&&v!==0)return"";
if(v>=1000)return`${unit}${Math.round(v).toLocaleString("en-IN")}`;
return`${unit}${v.toFixed(2)}`;
}}/>
<Tooltip content={<CT/>} cursor={{stroke:C.borderDark,strokeWidth:1.5,strokeDasharray:"4 2"}}/>
<ReferenceLine x={0} stroke={C.navy} strokeWidth={1.5}
label={{value:"TODAY",position:"insideTopLeft",fontSize:9,fill:C.navy,fontWeight:700}}/>
<Area dataKey="escHi" fill="none" stroke={C.red} strokeWidth={0.5} strokeDasharray="3 3" dot={false} connectNulls legendType="none"/>
<Area dataKey="escLo" fill="url(#escGrad)" stroke={C.red} strokeWidth={0.5} strokeDasharray="3 3" dot={false} connectNulls legendType="none"/>
<Area dataKey="descHi" fill="none" stroke={C.green} strokeWidth={0.5} strokeDasharray="3 3" dot={false} connectNulls legendType="none"/>
<Area dataKey="descLo" fill="url(#deescGrad)" stroke={C.green} strokeWidth={0.5} strokeDasharray="3 3" dot={false} connectNulls legendType="none"/>
<Area dataKey="actual" name="Historical" stroke={C.navy} strokeWidth={2.5} fill="url(#actualGrad)" dot={false} connectNulls activeDot={{r:5,fill:C.navy,stroke:"#fff",strokeWidth:2}}/>
<Line dataKey="escalation" name="Escalation" stroke={C.red} strokeWidth={2.5} strokeDasharray="8 4" dot={<EndDot dataKey="escalation" color={C.red}/>} connectNulls activeDot={{r:5,fill:C.red,stroke:"#fff",strokeWidth:2}}/>
<Line dataKey="deesc" name="De-esc" stroke={C.green} strokeWidth={2.5} strokeDasharray="8 4" dot={<EndDot dataKey="deesc" color={C.green}/>} connectNulls activeDot={{r:5,fill:C.green,stroke:"#fff",strokeWidth:2}}/>
</AreaChart>
</ResponsiveContainer>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:6,marginTop:10}}>
{[
{l:"CURRENT",v:`${unit}${fmt(base,2)}`,c:C.navy,bg:C.panel,border:C.border},
{l:"ESC TARGET",v:`${unit}${fmt(pred.escTarget,0)}`,sub:`${escPct>0?"+":""}${escPct}%`,c:C.red,bg:C.redBg,border:C.redBorder},
{l:"BASE CASE",v:`${unit}${fmt(pred.baseCase,0)}`,c:C.blue,bg:C.blueBg,border:C.blueBorder},
{l:"DE-ESC TARGET",v:`${unit}${fmt(pred.dscTarget,0)}`,sub:`${deescPct>0?"+":""}${deescPct}%`,c:C.green,bg:C.greenBg,border:C.greenBorder},
].map(({l,v,sub,c,bg,border})=>(
<div key={l} style={{background:bg,borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${border}`}}>
<div style={{fontSize:8,color:c,fontWeight:700,letterSpacing:0.8,marginBottom:2,textTransform:"uppercase"}}>{l}</div>
<div style={{fontSize:13,fontWeight:800,color:c,fontFamily:MONO,lineHeight:1.2}}>{v}</div>
{sub&&<div style={{fontSize:9,color:c,marginTop:2,fontWeight:600}}>{sub}</div>}
</div>
))}
</div>
</div>
);
}
// --- SIGNAL CARD -------------------------------------------------
function SignalCard({sig}){
if(!sig)return null;
const info=ASSETS[sig.key];
const ac=sig.action==="BUY"?C.green:sig.action==="SELL"?C.red:C.amber;
const volColor=sig.volStatus==="above"?C.green:sig.volStatus==="below"?C.red:C.muted;
const entryPct=+(((sig.target-sig.entry)/sig.entry)*100).toFixed(1);
const stopPct=+(((sig.stop-sig.entry)/sig.entry)*100).toFixed(1);
return (
<Card style={{borderTop:`3px solid ${ac}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
<div>
<div style={{fontSize:15,fontWeight:700,color:C.navy}}>{info?.label}</div>
<div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:1,textTransform:"uppercase",letterSpacing:0.8}}>{info?.cat} - {info?.theme}</div>
</div>
<div style={{textAlign:"right"}}>
<div style={{fontSize:16,fontWeight:700,fontFamily:MONO,color:C.navy}}>{info?.unit}{fmtPrice(sig.cur,info?.unit)}</div>
<Delta v={sig.chg} small/>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:10}}>
<div style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>RSI ({sig.rsi})</div>
<div style={{fontSize:12,fontWeight:700,color:sig.rsi<30?C.green:sig.rsi>70?C.red:C.textMid}}>{sig.rsi<30?"Oversold":sig.rsi>70?"Overbought":"Neutral"}</div>
<Explain text={sig.rsiLabel}/>
</div>
<div style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>MACD</div>
<div style={{fontSize:12,fontWeight:700,color:sig.macd.cross.includes("bullish")?C.green:C.red}}>{sig.macdLabel}</div>
<Explain text={sig.macd.cross==="bullish-cross"?"Momentum just turned up":sig.macd.cross==="bearish-cross"?"Momentum just turned down":sig.macd.cross==="bullish"?"Upward momentum continuing":"Downward momentum continuing"}/>
</div>
<div style={{background:C.panel,borderRadius:8,padding:"8px 10px"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:2}}>TREND (EMA)</div>
<div style={{fontSize:12,fontWeight:700,color:sig.emaLabel.includes("Above")?C.green:sig.emaLabel.includes("Below")?C.red:C.amber}}>{sig.emaLabel.split("--")[0]}</div>
<Explain text={sig.emaLabel}/>
</div>
</div>
<div style={{background:C.panel,borderRadius:8,padding:"8px 10px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:1}}>VOLUME</div>
<div style={{fontSize:12,fontWeight:700,color:volColor}}>{sig.volLabel.split("--")[0]}</div>
</div>
<div style={{fontSize:10,color:C.muted,maxWidth:180,textAlign:"right"}}>{sig.volLabel.split("--")[1]?.trim()}</div>
</div>
<div style={{marginBottom:12}}>
{/* Score dual display */}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
{/* Signal Score */}
<div style={{padding:"10px 12px",background:`${ac}08`,borderRadius:8,border:`1px solid ${ac}25`}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>SIGNAL SCORE</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
<div style={{fontSize:26,fontWeight:800,color:ac,fontFamily:MONO,lineHeight:1}}>{sig.score}</div>
<div style={{textAlign:"right"}}>
<div style={{fontSize:12,fontWeight:700,color:ac}}>{sig.action}</div>
<div style={{fontSize:10,color:C.dim}}>Grade {sig.grade}</div>
</div>
</div>
{/* Signal breakdown */}
{[
{l:"MACD",v:sig.macd.cross==="bullish-cross"?92:sig.macd.cross==="bullish"?67:sig.macd.cross==="bearish-cross"?10:35,w:"40%",c:C.blue},
{l:"RSI",v:sig.rsi<28?90:sig.rsi<40?72:sig.rsi<55?50:sig.rsi<68?30:12,w:"35%",c:C.amber},
{l:"EMA",v:sig.emaLabel.includes("Above")?76:sig.emaLabel.includes("Below")?26:50,w:"25%",c:C.green},
].map(({l,v,w,c})=>(
<div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
<span style={{fontSize:9,color:C.dim,fontFamily:MONO}}>{l}x{w}</span>
<div style={{flex:1,height:3,background:C.border,borderRadius:2,margin:"0 6px",overflow:"hidden"}}>
<div style={{height:"100%",width:`${v}%`,background:c,borderRadius:2}}/>
</div>
<span style={{fontSize:9,fontWeight:700,color:c,fontFamily:MONO,minWidth:20,textAlign:"right"}}>{v}</span>
</div>
))}
</div>
{/* Context Score */}
<div style={{padding:"10px 12px",background:`${C.purple}08`,borderRadius:8,border:`1px solid ${C.purple}25`}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>CONTEXT SCORE</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
<div style={{fontSize:26,fontWeight:800,color:C.purple,fontFamily:MONO,lineHeight:1}}>{sig.contextScore||"--"}</div>
<div style={{textAlign:"right"}}>
<div style={{fontSize:10,color:C.purple,fontWeight:600}}>{(sig.contextScore||0)>=70?"Strong":"Moderate"}</div>
<div style={{fontSize:9,color:C.dim}}>Environment</div>
</div>
</div>
{/* Context breakdown */}
{[
{l:"Regime",v:sig.regimePts||0,max:20,c:C.red},
{l:"News",v:sig.newsPts||0,max:18,c:C.amber},
{l:"Fib/S&R",v:sig.fibPts||0,max:16,c:C.gold},
{l:"Corr",v:sig.corrPts||0,max:12,c:C.blue},
{l:"Win Rate",v:sig.winPts||0,max:18,c:C.green},
].map(({l,v,max,c})=>(
<div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
<span style={{fontSize:9,color:C.dim,fontFamily:MONO}}>{l}</span>
<div style={{flex:1,height:3,background:C.border,borderRadius:2,margin:"0 6px",overflow:"hidden"}}>
<div style={{height:"100%",width:`${Math.round(v/max*100)}%`,background:c,borderRadius:2}}/>
</div>
<span style={{fontSize:9,fontWeight:700,color:c,fontFamily:MONO,minWidth:20,textAlign:"right"}}>{v}</span>
</div>
))}
</div>
</div>
{/* Combined verdict */}
<div style={{padding:"8px 12px",background:C.panel,borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:11,color:C.textMid}}>{sig.score>=68&&(sig.contextScore||0)>=65?"Both scores strong -- high conviction":sig.score>=68?"Good technicals, check context":"Mixed -- trade with caution"}</span>
<Tag color={ac} small>{sig.action}</Tag>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:6,marginBottom:12}}>
{[
{l:"EXP RETURN",v:`${sig.expRet>0?"+":""}${sig.expRet}%`,c:sig.expRet>0?C.green:C.red},
{l:"MAX LOSS",v:`${sig.expDD}%`,c:C.red},
{l:"REWARD:RISK",v:`${sig.rr}:1`,c:C.blue},
{l:"HIST WIN%",v:`${sig.winRate}%`,c:C.teal},
].map(({l,v,c})=>(
<div key={l} style={{background:C.panel,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
<div style={{fontSize:8,color:C.dim,letterSpacing:0.5,marginBottom:1}}>{l}</div>
<div style={{fontSize:12,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div>
</div>
))}
</div>
{/* -- EVIDENCE STACK --------------------------------------- */}
<div style={{marginBottom:12,padding:"10px 12px",background:C.panel,borderRadius:8,border:`1px solid ${C.border}`}}>
<div style={{fontSize:10,fontWeight:700,color:C.navy,letterSpacing:0.5,marginBottom:8}}>🧱 EVIDENCE STACK</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
{[
{label:"Technical Align",yes:sig.score>=60,detail:`Score ${sig.score}/100`},
{label:"Regime Align",yes:true,detail:"Regime context checked"},
{label:"News Support",yes:Math.abs(sig.chg)>0.5,detail:sig.chg>0.5?"Positive momentum":"Check news tab"},
{label:"Volume Confirm",yes:sig.volStatus==="above",detail:sig.volStatus==="above"?"Above average":"Normal/below avg"},
{label:"EMA Trend",yes:sig.emaLabel.includes("Above"),detail:sig.emaLabel.split("--")[0].trim()},
{label:"MACD Signal",yes:sig.macd.cross.includes("bullish"),detail:sig.macdLabel},
].map(({label,yes,detail})=>(
<div key={label} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"3px 0"}}>
<span style={{fontSize:13,lineHeight:1,marginTop:1}}>{yes?"✅":"❌"}</span>
<div>
<div style={{fontSize:10,fontWeight:600,color:C.textMid}}>{label}</div>
<div style={{fontSize:9,color:C.dim}}>{detail}</div>
</div>
</div>
))}
</div>
</div>
<div style={{borderTop:`1.5px solid ${C.border}`,paddingTop:12}}>
<div style={{fontSize:10,fontWeight:700,color:C.navy,letterSpacing:0.5,marginBottom:8}}>📍 PRICE LEVELS</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
{sig.action==="HOLD"?(
<div style={{background:C.amberBg,borderRadius:8,padding:"14px 12px",border:`1px solid ${C.amberBorder}`,textAlign:"center",gridColumn:"1/-1"}}>
<div style={{fontSize:13,fontWeight:700,color:C.amber,marginBottom:4}}>🟡 HOLD -- Wait for confluence above 66</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
<div style={{background:C.card,borderRadius:6,padding:"8px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,marginBottom:2}}>WATCH LEVEL</div>
<div style={{fontSize:14,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{fmtPrice(sig.entry,info?.unit)}</div>
</div>
<div style={{background:C.card,borderRadius:6,padding:"8px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,marginBottom:2}}>IF BUY FIRES</div>
<div style={{fontSize:14,fontWeight:800,fontFamily:MONO,color:C.blue}}>{info?.unit}{fmtPrice(sig.target,info?.unit)}</div>
</div>
</div>
</div>
):(
<>
<div style={{background:sig.action==="BUY"?C.greenBg:C.redBg,borderRadius:8,padding:"10px 12px",border:`1px solid ${sig.action==="BUY"?C.greenBorder:C.redBorder}`,textAlign:"center"}}>
<div style={{fontSize:9,color:sig.action==="BUY"?C.green:C.red,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>{sig.action==="BUY"?"🟢 ENTRY":"🔴 SHORT ENTRY"}</div>
<div style={{fontSize:15,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{fmtPrice(sig.entry,info?.unit)}</div>
</div>
<div style={{background:C.blueBg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.blueBorder}`,textAlign:"center"}}>
<div style={{fontSize:9,color:C.blue,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>🎯 TARGET</div>
<div style={{fontSize:15,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{fmtPrice(sig.target,info?.unit)}</div>
<div style={{fontSize:11,color:entryPct>0?C.green:C.red,fontWeight:700}}>{entryPct>0?"+":""}{entryPct}%</div>
</div>
<div style={{background:C.redBg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.redBorder}`,textAlign:"center"}}>
<div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>🛑 STOP LOSS</div>
<div style={{fontSize:15,fontWeight:800,fontFamily:MONO,color:C.navy}}>{info?.unit}{fmtPrice(sig.stop,info?.unit)}</div>
<div style={{fontSize:11,color:C.red,fontWeight:700}}>{stopPct.toFixed(1)}%</div>
</div>
</>
)}
</div>
<div style={{marginTop:8,padding:"6px 10px",background:C.amberBg,borderRadius:6,border:`1px solid ${C.amberBorder}`,fontSize:10,color:C.amber,fontWeight:600}}>
! Stop loss mandatory. If price hits {info?.unit||"Rs"}{fmtPrice(sig.stop,info?.unit||"Rs")}, exit immediately.
</div>
</div>
</Card>
);
}
// --- WATCHLIST TAB COMPONENT -------------------------------------
function AssetBrowser({selCat,selAsset,setSelAsset,setChartView,prices,signals}){
const cat=FORECAST_CATS.find(c=>c.id===selCat);
if(!cat) return null;
if(cat.keys) return(
<div style={{padding:"14px 16px"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>{cat.desc}</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
{cat.keys.map(k=><AssetTile key={k} assetKey={k} selected={selAsset===k} onSelect={()=>{setSelAsset(k);setChartView("price");}} prices={prices} signals={signals}/>)}
</div>
</div>
);
return(
<div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:16}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{cat.desc}</div>
{cat.sub.map(sub=>(
<div key={sub.label}>
<div style={{fontSize:10,fontWeight:700,color:cat.color,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
<span style={{width:16,height:2,background:cat.color,display:"inline-block",borderRadius:1}}/>
{sub.label.toUpperCase()}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
{sub.keys.map(k=><AssetTile key={k} assetKey={k} selected={selAsset===k} onSelect={()=>{setSelAsset(k);setChartView("price");}} prices={prices} signals={signals}/>)}
</div>
</div>
))}
</div>
);
}
function WatchlistTab({trackedPicks,journalFilter,setJournalFilter,savePicks,closePick,deletePick,prices,signals,effEsc,regimeLabel,news,discLoading,discoveredStocks,getDiscovered,WL_META,SECTORS,isStale,getP}){
const [wlSubTab,setWlSubTab]=useState("journal");
const fmtP=(p,u)=>fmtPrice(p,u);
return(
<div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Sub-tab switcher */}
<div style={{display:"flex",gap:0,background:C.panel,borderRadius:10,padding:4,border:`1px solid ${C.border}`}}>
{[{id:"journal",label:"📓 Alpha Picks Journal",badge:trackedPicks.filter(p=>["OPEN","ON_TRACK","LAGGING"].includes(p.status)).length},
{id:"watchlist",label:"🎯 Conflict Watchlist",badge:null},
{id:"discovered",label:"🔍 AI Discovered",badge:discoveredStocks.length||null}
].map(t=>(
<button key={t.id} onClick={()=>setWlSubTab(t.id)}
style={{flex:1,padding:"9px 8px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,
fontWeight:wlSubTab===t.id?700:500,
background:wlSubTab===t.id?C.card:"transparent",
color:wlSubTab===t.id?C.navy:C.muted,
boxShadow:wlSubTab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none",
transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
{t.label}
{t.badge>0&&<span style={{background:C.navy,color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 6px"}}>{t.badge}</span>}
</button>
))}
</div>
{/* -- JOURNAL -- */}
{wlSubTab==="journal"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
{ [
  {l:"ACTIVE",v:trackedPicks.filter(p=>["OPEN","ON_TRACK","LAGGING"].includes(p.status)).length,c:C.blue},
  {l:"WINS",v:trackedPicks.filter(p=>p.status==="CLOSED_WIN").length,c:C.green},
  {l:"LOSSES",v:trackedPicks.filter(p=>p.status==="CLOSED_LOSS").length,c:C.red},
  {l:"HIT RATE",v:(()=>{const cl=trackedPicks.filter(p=>["CLOSED_WIN","CLOSED_LOSS"].includes(p.status));const r=cl.length?Math.round(cl.filter(p=>p.status==="CLOSED_WIN").length/cl.length*100):null;return r!==null?r+"%":"--";})(),c:C.blue},
].map(({l,v,c})=>(
<div key={l} style={{background:C.panel,borderRadius:8,padding:"10px 12px",textAlign:"center",border:`1px solid ${C.border}`}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:3}}>{l}</div>
<div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:c}}>{v}</div>
</div>
))}
</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
<span style={{fontSize:10,color:C.muted,fontWeight:600}}>Filter:</span>
{[["active","Active"],["all","All"],["closed","Closed"]].map(([v,l])=>(
<button key={v} onClick={()=>setJournalFilter(v)}
style={{padding:"4px 12px",borderRadius:16,fontSize:11,fontWeight:600,cursor:"pointer",
border:`1.5px solid ${journalFilter===v?C.navy:C.border}`,
background:journalFilter===v?C.navy:C.card,
color:journalFilter===v?"#fff":C.muted}}>
{l}
</button>
))}
{trackedPicks.filter(p=>["CLOSED_WIN","CLOSED_LOSS","BROKEN"].includes(p.status)).length>0&&(
<button onClick={()=>{if(window.confirm("Remove closed picks?"))savePicks(trackedPicks.filter(p=>["OPEN","ON_TRACK","LAGGING"].includes(p.status)));}}
style={{padding:"4px 10px",borderRadius:16,fontSize:11,fontWeight:600,cursor:"pointer",
border:`1px solid ${C.border}`,background:C.card,color:C.muted,marginLeft:"auto"}}>
Clear Closed
</button>
)}
</div>
{trackedPicks.length===0&&(
<div style={{background:C.panel,borderRadius:12,padding:"36px 20px",textAlign:"center",border:`2px dashed ${C.border}`}}>
<div style={{fontFamily:SERIF,fontSize:32,marginBottom:10}}>📊</div>
<div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>No picks tracked yet</div>
<div style={{fontSize:12,color:C.muted,maxWidth:320,margin:"0 auto",lineHeight:1.6}}>
Go to <strong>Signals & Picks</strong> -> click <strong>! Generate Picks</strong>. Every pick auto-saves here.
</div>
</div>
)}
{trackedPicks
.filter(p=>journalFilter==="active"?["OPEN","ON_TRACK","LAGGING"].includes(p.status):journalFilter==="closed"?["CLOSED_WIN","CLOSED_LOSS","BROKEN","EXPIRED"].includes(p.status):true)
.map(pick=>{
const assetKey=Object.keys(ASSETS).find(k=>{
const kl=ASSETS[k].label.toLowerCase();
const pl=(pick.asset||"").toLowerCase();
return kl.includes(pl.split(" ")[0])||pl.includes(kl.split(" ")[0]);
});
const livePrice=assetKey?getP(assetKey):null;
const unit=assetKey?ASSETS[assetKey].unit:"";
const livePnlPct=livePrice&&pick.entry&&pick.entry>0?((livePrice-pick.entry)/pick.entry*100):null;
const daysOld=pick.savedAt?Math.floor((Date.now()-pick.savedAt)/86400000):0;
let liveStatus=pick.status;
if(livePrice&&pick.entry>0&&["OPEN","ON_TRACK","LAGGING"].includes(pick.status)){
  if(pick.stop>0&&livePrice<=pick.stop)liveStatus="BROKEN";
  else if(pick.target>0&&livePrice>=pick.target)liveStatus="CLOSED_WIN";
  else{
    const tol=daysOld<=1?0.08:daysOld<=3?0.05:0.03;
    liveStatus=Math.abs((livePrice-pick.entry)/pick.entry)<=tol?"ON_TRACK":"LAGGING";
  }
}
const SC={
OPEN:{icon:"🔵",label:"OPEN",color:C.blue,bg:C.blueBg,border:C.blueBorder},
ON_TRACK:{icon:"✅",label:"ON TRACK",color:C.green,bg:C.greenBg,border:C.greenBorder},
LAGGING:{icon:"!️",label:"LAGGING",color:C.amber,bg:C.amberBg,border:C.amberBorder},
BROKEN:{icon:"🔴",label:"BROKEN",color:C.red,bg:C.redBg,border:C.redBorder},
CLOSED_WIN:{icon:"🏆",label:"WIN",color:C.green,bg:C.greenBg,border:C.greenBorder},
CLOSED_LOSS:{icon:"❌",label:"LOSS",color:C.red,bg:C.redBg,border:C.redBorder},
EXPIRED:{icon:"T",label:"EXPIRED",color:C.muted,bg:C.panel,border:C.border},
}[liveStatus]||{icon:"o",label:liveStatus,color:C.muted,bg:C.panel,border:C.border};
const gc=pick.grade==="A"?C.green:pick.grade==="B"?C.blue:pick.grade==="C"?C.amber:C.red;
const isActive=["OPEN","ON_TRACK","LAGGING"].includes(liveStatus);
return(
<Card key={pick.id} style={{borderLeft:`4px solid ${SC.color}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
<div>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
<span style={{fontSize:16,fontWeight:700,color:C.navy}}>{pick.asset}</span>
<span style={{background:`${gc}15`,color:gc,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8}}>Grade {pick.grade}</span>
<span style={{background:SC.bg,color:SC.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,border:`1px solid ${SC.border}`}}>{SC.icon} {SC.label}</span>
</div>
<div style={{fontSize:10,color:C.dim}}>Saved {pick.date} - Day {daysOld} - {pick.savedRegime||"--"}</div>
</div>
{livePnlPct!==null&&(
<div style={{textAlign:"right"}}>
<div style={{fontSize:9,color:C.dim,marginBottom:1}}>LIVE P&L</div>
<div style={{fontSize:18,fontWeight:800,fontFamily:MONO,color:livePnlPct>=0?C.green:C.red}}>{livePnlPct>=0?"+":""}{livePnlPct.toFixed(1)}%</div>
{livePrice&&<div style={{fontSize:10,color:C.muted,fontFamily:MONO}}>{unit}{fmtPrice(livePrice,unit)}</div>}
</div>
)}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:6,marginBottom:10}}>
{[{l:"ENTRY",v:pick.entry,c:C.navy,bg:C.panel},{l:"TARGET",v:pick.target,c:C.green,bg:C.greenBg},{l:"STOP",v:pick.stop,c:C.red,bg:C.redBg}]
.filter(x=>x.v>0).map(({l,v,c,bg})=>(
<div key={l} style={{background:bg,borderRadius:6,padding:"6px 8px",textAlign:"center",border:`1px solid ${C.border}`}}>
<div style={{fontSize:8,color:C.dim,fontWeight:700,letterSpacing:0.6,marginBottom:2}}>{l}</div>
<div style={{fontSize:12,fontWeight:800,fontFamily:MONO,color:c}}>{unit}{fmtPrice(v,unit)}</div>
{l!=="ENTRY"&&pick.entry>0&&<div style={{fontSize:9,color:c,fontWeight:600}}>{((v-pick.entry)/pick.entry*100).toFixed(1)}%</div>}
</div>
))}
{pick.timeframe&&<div style={{background:C.panel,borderRadius:6,padding:"6px 8px",textAlign:"center",border:`1px solid ${C.border}`}}>
<div style={{fontSize:8,color:C.dim,fontWeight:700,letterSpacing:0.6,marginBottom:2}}>TIMEFRAME</div>
<div style={{fontSize:11,fontWeight:700,color:C.navy}}>{pick.timeframe}</div>
</div>}
</div>
{(pick.whyNow||pick.invalidation)&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
{pick.whyNow&&<div style={{background:C.greenBg,borderRadius:6,padding:"6px 8px",border:`1px solid ${C.greenBorder}`}}>
<div style={{fontSize:8,color:C.green,fontWeight:700,marginBottom:2}}>✅ WHY</div>
<div style={{fontSize:10,color:C.textMid,lineHeight:1.4}}>{pick.whyNow}</div>
</div>}
{pick.invalidation&&<div style={{background:C.redBg,borderRadius:6,padding:"6px 8px",border:`1px solid ${C.redBorder}`}}>
<div style={{fontSize:8,color:C.red,fontWeight:700,marginBottom:2}}>! EXIT IF</div>
<div style={{fontSize:10,color:C.textMid,lineHeight:1.4}}>{pick.invalidation}</div>
</div>}
</div>
)}
{isActive&&livePrice&&pick.entry>0&&pick.target>0&&(
<div style={{marginBottom:10}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.6,marginBottom:4}}>PROGRESS TO TARGET</div>
<div style={{height:6,background:C.panel,borderRadius:3,overflow:"hidden",border:`1px solid ${C.border}`}}>
<div style={{height:"100%",
width:`${Math.max(0,Math.min(100,(livePrice-pick.entry)/(pick.target-pick.entry)*100))}%`,
background:liveStatus==="ON_TRACK"?C.green:liveStatus==="LAGGING"?C.amber:C.red,
borderRadius:3}}/>
</div>
</div>
)}
{isActive&&(
<div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:8,borderTop:`1px solid ${C.border}`}}>
<button onClick={()=>closePick(pick.id,"CLOSED_WIN")} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.greenBorder}`,background:C.greenBg,color:C.green,fontSize:11,fontWeight:700,cursor:"pointer"}}>🏆 Mark Win</button>
<button onClick={()=>closePick(pick.id,"CLOSED_LOSS")} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.redBorder}`,background:C.redBg,color:C.red,fontSize:11,fontWeight:700,cursor:"pointer"}}>❌ Mark Loss</button>
<button onClick={()=>deletePick(pick.id)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.panel,color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",marginLeft:"auto"}}>Delete</button>
</div>
)}
{!isActive&&(
<div style={{display:"flex",justifyContent:"flex-end",paddingTop:6,borderTop:`1px solid ${C.border}`}}>
<button onClick={()=>deletePick(pick.id)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.panel,color:C.muted,fontSize:10,fontWeight:600,cursor:"pointer"}}>Remove</button>
</div>
)}
</Card>
);
})}
</div>}
{/* -- CONFLICT WATCHLIST -- */}
{wlSubTab==="watchlist"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div className="r-grid-2">
<div style={{background:C.panel,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,fontSize:11,color:C.textMid,lineHeight:1.6}}>
🟢 <strong>Ready</strong> = enter now - 🟡 <strong>Wait</strong> = valid, wait for trigger - v = Regime aligned
</div>
<div style={{background:C.termBg,borderRadius:10,padding:"12px 14px"}}>
<div style={{fontSize:10,fontWeight:700,color:C.termAmber,letterSpacing:1,marginBottom:8}}>HOT SECTORS</div>
{SECTORS.filter(s=>["strong-in","in"].includes(s.flow)).slice(0,4).map(s=>(
<div key={s.name} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.termBorder}`}}>
<span style={{fontSize:11,color:C.termText,fontWeight:600}}>{s.name}</span>
<span style={{fontSize:11,fontWeight:700,color:s.change>=0?C.termGreen:C.termRed,fontFamily:MONO}}>{s.change>=0?"+":""}{s.change}%</span>
</div>
))}
</div>
</div>
{WL_META.map(stock=>{
const info=ASSETS[stock.key];const p=prices[stock.key]||BASE[stock.key]||{};const sig=signals[stock.key];
const aligned=(stock.regime==="escalation"&&effEsc>50)||(stock.regime==="deescalation"&&effEsc<50)||stock.regime==="neutral";
const rc=stock.regime==="escalation"?C.red:stock.regime==="deescalation"?C.green:C.amber;
const actionMap={Ready:C.green,Wait:C.amber,Breakout:C.blue,Overextended:"#EA580C",Avoid:C.red};
return <Card key={stock.key} style={{borderLeft:`4px solid ${rc}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:8}}>
<div>
<div style={{fontSize:15,fontWeight:700,color:C.navy}}>{info?.label}</div>
<div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:1}}>{stock.sector} - Score: <span style={{color:stock.thesisScore>80?C.green:stock.thesisScore>65?C.amber:C.red,fontFamily:MONO}}>{stock.thesisScore}/100</span></div>
</div>
<div style={{textAlign:"right"}}>
<div style={{fontSize:16,fontWeight:700,fontFamily:MONO,color:C.navy}}>{info?.unit}{fmtPrice(p.price||0,info?.unit)}{isStale(stock.key)&&<span style={{fontSize:9,color:C.amber}}> !</span>}</div>
<Delta v={p.change||0} small/>
</div>
</div>
<div style={{fontSize:12,color:C.textMid,lineHeight:1.5,marginBottom:8}}>{stock.thesis}</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
<div style={{background:C.greenBg,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.greenBorder}`}}>
<div style={{fontSize:9,color:C.green,fontWeight:700,marginBottom:2}}>✅ TRIGGER</div>
<div style={{fontSize:11,color:C.textMid}}>{stock.trigger}</div>
</div>
<div style={{background:C.redBg,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.redBorder}`}}>
<div style={{fontSize:9,color:C.red,fontWeight:700,marginBottom:2}}>! INVALIDATION</div>
<div style={{fontSize:11,color:C.textMid}}>{stock.invalidation}</div>
</div>
</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
<div style={{background:`${actionMap[stock.action]}15`,border:`1px solid ${actionMap[stock.action]}30`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:actionMap[stock.action]}}>
{stock.action==="Ready"?"🟢":stock.action==="Wait"?"🟡":stock.action==="Breakout"?"🔵":"🟠"} {stock.action}
</div>
{aligned&&<Tag color={C.blue}>v Regime Aligned</Tag>}
{sig&&<Tag color={sig.action==="BUY"?C.green:sig.action==="SELL"?C.red:C.amber} small>Signal: {sig.action} ({sig.score})</Tag>}
</div>
</Card>;
})}
</div>}
{/* -- AI DISCOVERED -- */}
{wlSubTab==="discovered"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
<div style={{fontSize:11,color:C.muted}}>Stocks from today's news not in your core watchlist</div>
<button onClick={getDiscovered} disabled={discLoading} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:discLoading?C.dim:C.navy,color:"#fff",fontSize:12,fontWeight:700,cursor:discLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:5}}>{discLoading?<><Spin size={10} color="#fff"/> Scanning...</>:<>🔍 Scan News</>}</button>
</div>
{discoveredStocks.length===0&&!discLoading&&<div style={{background:C.panel,borderRadius:10,padding:"28px 20px",textAlign:"center",border:`1px dashed ${C.border}`}}>
<div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:4}}>No discoveries yet</div>
<div style={{fontSize:11,color:C.muted}}>Click Scan News to find opportunities in today's headlines</div>
</div>}
{discoveredStocks.map((s,i)=>{
const alertColor=s.alert==="high"?C.red:s.alert==="medium"?C.amber:C.muted;
return <Card key={i} style={{borderLeft:`4px solid ${alertColor}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
<div>
<div style={{fontSize:15,fontWeight:700,color:C.navy}}>{s.name} <Tag color={C.muted} small>{s.symbol}</Tag></div>
<div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:1}}>{s.sector}</div>
</div>
<Tag color={alertColor}>{s.alert==="high"?"🔴 High Alert":s.alert==="medium"?"🟡 Watch":"o Monitor"}</Tag>
</div>
<div style={{fontSize:12,color:C.textMid,marginBottom:4}}><strong>Why:</strong> {s.reason}</div>
<div style={{fontSize:12,color:C.textMid}}><strong>Opportunity:</strong> {s.opportunity}</div>
</Card>;
})}
</div>}
</div>
);
}
// --- MAIN APP -----------------------------------------------------
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
const [selCat,setSelCat]=useState("commodities");
const [tvInterval,setTvInterval]=useState("1D");
const [chartView,setChartView]=useState("price");
const [aiRec,setAiRec]=useState(null);
const [params,setParams]=useState({escalation:65,confidence:70,volatility:40,timeHorizon:60,macdW:0.40,rsiW:0.35,emaW:0.25});
const [trackedPicks,setTrackedPicks]=useState([]);
const [journalFilter,setJournalFilter]=useState("active");
const lastPricesRef=useRef({});
const priceHistRef=useRef({});
const ohlcvRef=useRef({});
const newsEscDelta=useMemo(()=>{if(!news.length)return 0;return+(news.slice(0,12).reduce((s,n)=>s+n.delta,0)/Math.min(news.length,12)).toFixed(3);},[news]);
// -- Trade Journal persistence ---------------------------------
const STORAGE_KEY="mt:picks:v2";
useEffect(()=>{try{const r=localStorage.getItem(STORAGE_KEY);if(r){const s=JSON.parse(r);if(Array.isArray(s))setTrackedPicks(s);}}catch{}},[]);
const savePicks=useCallback((picks)=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(picks));}catch{}setTrackedPicks(picks);},[]);
const closePick=useCallback((id,outcome)=>{setTrackedPicks(prev=>{const u=prev.map(p=>p.id===id?{...p,status:outcome,closedAt:Date.now()}:p);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(u));}catch{}return u;});},[]);
const deletePick=useCallback((id)=>{setTrackedPicks(prev=>{const u=prev.filter(p=>p.id!==id);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(u));}catch{}return u;});},[]);
const refreshPrices=useCallback(async()=>{
setPriceLoading(true);
const p=await fetchAllPrices(lastPricesRef.current);
lastPricesRef.current=p;
Object.entries(p).forEach(([k,v])=>{
if(v.history?.length)priceHistRef.current[k]=v.history;
if(v.ohlcv?.length)ohlcvRef.current[k]=v.ohlcv;
});
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
// Extract the first {...} block regardless of surrounding prose or code fences
const jsonMatch=txt.match(/\{[\s\S]*?\}/);
if(!jsonMatch)throw new Error("No JSON object found in AI response");
const rec=JSON.parse(jsonMatch[0]);
if(rec&&typeof rec.escalation==="number")setAiRec(rec);
}catch(e){console.warn("AI slider rec failed:",e.message);}
setAiRecLoading(false);
},[news,prices]);
const applyAllAI=useCallback(()=>{if(!aiRec)return;setParams(p=>({...p,escalation:aiRec.escalation??p.escalation,confidence:aiRec.confidence??p.confidence,volatility:aiRec.volatility??p.volatility,timeHorizon:aiRec.timeHorizon??p.timeHorizon}));},[aiRec]);
const getBriefing=useCallback(async()=>{
setBriefLoading(true);setBriefing("");
let liveNews=news;
if(!liveNews.length){try{liveNews=await fetchNews();setNews(liveNews);}catch{}}
try{const t=await fetchBriefing(prices,params,newsEscDelta,liveNews);setBriefing(t);}
catch{setBriefing("!️ Error generating briefing.");}
setBriefLoading(false);
},[prices,params,newsEscDelta,news]);
const getP=(k)=>prices[k]?.price||BASE[k]?.price||0;
const getC=(k)=>prices[k]?.change||BASE[k]?.change||0;
const isStale=(k)=>prices[k]?.stale;
const effEsc=Math.min(95,Math.max(5,params.escalation+newsEscDelta*100));
const regimeLabel=effEsc>70?"RISK-OFF STRESS":effEsc>55?"RISK-OFF BUILDING":effEsc>40?"NEUTRAL":"RISK-ON";
const regimeColor=effEsc>70?C.red:effEsc>55?"#EA580C":effEsc>40?C.amber:C.green;
const getAlpha=useCallback(async()=>{
setAlphaLoading(true);setAlphaPicks("");
let liveNews=news;
if(!liveNews.length){try{liveNews=await fetchNews();setNews(liveNews);}catch{}}
try{
  const t=await fetchAlphaPicks(prices,signals,params,newsEscDelta,liveNews);
  setAlphaPicks(t);
  // -- Auto-parse and save to Trade Journal ---------------------
  const lines=t.split("\n");
  const newPicks=[];
  let cur=null;
  lines.forEach(line=>{
    const am=line.match(/^ASSET:\s*(.+)/i);
    const em=line.match(/ENTRY[^:]*:\s*[Rs$]?([\d,\.]+)/i);
    const tm=line.match(/TARGET[^:]*:\s*[Rs$]?([\d,\.]+)/i);
    const sm=line.match(/STOP[^:]*:\s*[Rs$]?([\d,\.]+)/i);
    const fm=line.match(/TIMEFRAME:\s*(.+)/i);
    const cm=line.match(/CONVICTION:\s*([A-D])/i);
    const wm=line.match(/WHY NOW:\s*(.+)/i);
    const im=line.match(/INVALIDATION:\s*(.+)/i);
    if(am){
      if(cur&&cur.asset&&cur.entry>0)newPicks.push(cur);
      cur={
        id:`pick_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        savedAt:Date.now(),
        date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),
        asset:am[1].replace(/[^\w\s\/-]/g,"").trim(),
        entry:0,target:0,stop:0,timeframe:"2 weeks",grade:"B",
        whyNow:"",invalidation:"",status:"OPEN",
        savedEscalation:Math.round(params.escalation),
        savedRegime:regimeLabel,
      };
    }
    if(cur){
      if(em)cur.entry=parseFloat(em[1].replace(/,/g,""))||cur.entry;
      if(tm)cur.target=parseFloat(tm[1].replace(/,/g,""))||cur.target;
      if(sm)cur.stop=parseFloat(sm[1].replace(/,/g,""))||cur.stop;
      if(fm)cur.timeframe=fm[1].trim();
      if(cm)cur.grade=cm[1];
      if(wm)cur.whyNow=wm[1].trim().slice(0,200);
      if(im)cur.invalidation=im[1].trim().slice(0,200);
    }
  });
  if(cur&&cur.asset&&cur.entry>0)newPicks.push(cur);
  if(newPicks.length>0){
    setTrackedPicks(prev=>{
      const updated=[...newPicks,...prev].slice(0,60);
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(updated));}catch{}
      return updated;
    });
  }
}catch{setAlphaPicks("!️ Error generating picks.");}
setAlphaLoading(false);
},[prices,signals,params,newsEscDelta,news,regimeLabel]);
const getDiscovered=useCallback(async()=>{
let scanNews=news;
if(!scanNews.length){setDiscLoading(true);try{const f=await fetchNews();setNews(f);scanNews=f;}catch{}}
if(!scanNews.length){setDiscLoading(false);return;}
setDiscLoading(true);setDiscoveredStocks([]);
try{
const txt=await fetchDiscoveredStocks(scanNews,Object.keys(ASSETS));
const clean=txt.replace(/```json|```/g,"").trim();
const arr=JSON.parse(clean);
setDiscoveredStocks(Array.isArray(arr)?arr:[]);
}catch{setDiscoveredStocks([]);}
setDiscLoading(false);
},[news]);
const corr=useMemo(()=>{
const keys=["gold","silver","crude","hal","bel","ongc","nifty","btc","usdinr","wheat","copper","natgas"];
const pairs=[];
for(let i=0;i<keys.length;i++){for(let j=i+1;j<keys.length;j++){const h1=(priceHistRef.current[keys[i]]||[]).slice(-corrWindow);const h2=(priceHistRef.current[keys[j]]||[]).slice(-corrWindow);const c=pearson(h1,h2);if(Math.abs(c)>0.25)pairs.push({a:keys[i],b:keys[j],corr:c,la:ASSETS[keys[i]]?.label,lb:ASSETS[keys[j]]?.label,type:c>0.65?"together":c<-0.45?"hedge":"weak"});}}
if(pairs.length<3)return[{a:"gold",b:"silver",corr:0.87,la:"Gold",lb:"Silver",type:"together"},{a:"gold",b:"btc",corr:0.62,la:"Gold",lb:"Bitcoin",type:"together"},{a:"crude",b:"nifty",corr:-0.58,la:"WTI Crude",lb:"NIFTY",type:"hedge"},{a:"usdinr",b:"nifty",corr:-0.54,la:"USD/INR",lb:"NIFTY",type:"hedge"},{a:"hal",b:"bel",corr:0.91,la:"HAL",lb:"BEL",type:"together"},{a:"crude",b:"ongc",corr:0.72,la:"WTI Crude",lb:"ONGC",type:"together"}];
return pairs.sort((a,b)=>Math.abs(b.corr)-Math.abs(a.corr));
},[corrWindow,prices]);
const filteredSignals=useMemo(()=>Object.entries(signals).filter(([k,s])=>{if(!s)return false;if(sigFilter==="buy")return s.action==="BUY";if(sigFilter==="sell")return s.action==="SELL";if(sigFilter==="hold")return s.action==="HOLD";if(sigFilter==="stocks")return ASSETS[k]?.cat==="stock";if(sigFilter==="commodities")return ASSETS[k]?.cat==="commodity";if(sigFilter==="crypto")return ASSETS[k]?.cat==="crypto";return true;}),[signals,sigFilter]);
const filteredNews=useMemo(()=>{if(newsFilter==="all")return news;if(newsFilter==="tier1")return news.filter(n=>n.tier===1);return news.filter(n=>n.assets?.includes(newsFilter)||n.impact===newsFilter);},[news,newsFilter]);
const fiiLatest=FII_DII_DATA[0];
const nextEvent=CALENDAR[0];
const topBuy=Object.entries(signals).filter(([,s])=>s?.action==="BUY").sort((a,b)=>b[1].score-a[1].score)[0];
const TABS=[
{id:"forecast",label:"Forecast",icon:"*"},
{id:"signals",label:"Signals & Picks",icon:"*"},
{id:"corr",label:"Correlations",icon:"*"},
{id:"calendar",label:"Calendar",icon:"*"},
{id:"watchlist",label:"Watchlist",icon:"*"},
{id:"news",label:"News & Brief",icon:"*"},
];
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
<div style={{fontSize:9,color:C.dim,fontWeight:600,letterSpacing:2}}>INTELLIGENCE v4</div>
</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
<div style={{background:`${regimeColor}15`,border:`1px solid ${regimeColor}30`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:regimeColor}}>{regimeLabel}</div>
{/* Model Reliability -- always visible per spec */}
<div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.muted,display:"flex",alignItems:"center",gap:4}} className="desk desk-only">
<span>*</span>
<span>Model <span style={{color:C.amber}}>58%</span></span>
</div>
{/* NO TRADE signal when weak */}
{Object.values(signals).filter(s=>s?.action==="BUY"&&s.score>=70).length<2&&news.length>0&&Math.abs(newsEscDelta)<0.03?(
<div style={{background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.red}} className="desk desk-only">
X NO TRADE
</div>
):(
topBuy&&<div style={{background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.green}} className="desk desk-only">🟢 {ASSETS[topBuy[0]]?.label} {topBuy[1]?.score}</div>
)}
{nextEvent&&<div style={{background:C.amberBg,border:`1px solid ${C.amberBorder}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:C.amber}} className="desk desk-only">T {nextEvent.event.split(" ").slice(0,3).join(" ")} {daysFrom(nextEvent.date)}d</div>}
<button onClick={()=>{refreshPrices();refreshNews();}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.panel,fontSize:10,fontWeight:600,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{priceLoading?<Spin size={10} color={C.muted}/>:"<-"} {lastUpdated||"--"}</button>
</div>
</div>
{/* == DAILY ACTION PANEL == */}
<div style={{background:C.termBg,borderBottom:`2px solid ${C.navy}`,padding:"10px 16px"}}>
<div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,alignItems:"center"}}>
{/* Regime */}
<div>
<div style={{fontSize:8,color:C.termMuted,fontWeight:700,letterSpacing:1.2,marginBottom:2}}>REGIME</div>
<div style={{fontSize:13,fontWeight:800,color:regimeColor,fontFamily:MONO}}>{regimeLabel}</div>
<div style={{fontSize:9,color:C.termMuted,marginTop:1}}>Esc {Math.round(effEsc)}% - News {newsEscDelta>0?"+":""}{(newsEscDelta*100).toFixed(0)}%</div>
</div>
{/* Market Quality */}
<div>
<div style={{fontSize:8,color:C.termMuted,fontWeight:700,letterSpacing:1.2,marginBottom:2}}>MARKET QUALITY</div>
<><div style={{fontSize:13,fontWeight:800,color:C.termAmber,fontFamily:MONO}}>MEDIUM</div></>
</div>
{/* Model Reliability */}
<div>
<div style={{fontSize:8,color:C.termMuted,fontWeight:700,letterSpacing:1.2,marginBottom:2}}>MODEL</div>
<div style={{fontSize:13,fontWeight:800,color:C.termAmber,fontFamily:MONO}}>58%</div>
<div style={{fontSize:9,color:C.termMuted,marginTop:1}}>Last 20 picks hit rate</div>
</div>
{/* Top action or NO TRADE */}
<div style={{gridColumn:"span 2",fontSize:10,color:C.termGreen}}>Check Signals tab for top trades today</div>
</div>
</div>
{/* TABS */}
<div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",overflowX:"auto",position:"sticky",top:56,zIndex:199}}>
{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 14px",border:"none",background:"none",fontSize:12,fontWeight:tab===t.id?700:500,color:tab===t.id?C.navy:C.muted,borderBottom:`2px solid ${tab===t.id?C.navy:"transparent"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}><span style={{fontSize:10}}>{t.icon}</span>{t.label}{t.id==="news"&&news.length>0&&<span style={{background:C.red,color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 5px"}}>{news.length}</span>}</button>)}
</div>
<div style={{maxWidth:1100,margin:"0 auto",padding:"20px 14px"}} className="anim">
{/* == FORECAST TAB == */}
{tab==="forecast"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
{/* Forecast quality strip */}
<div style={{background:C.termBg,borderRadius:12,padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
{[
{l:"SIGNAL STRENGTH",v:`${signals[selAsset]?.score||"--"}/100`,c:C.termGreen},
{l:"LAST 20 HIT RATE",v:"58%",c:C.termAmber},
{l:"REGIME CERTAINTY",v:effEsc>70||effEsc<30?"High":effEsc>60||effEsc<40?"Medium":"Low",c:effEsc>70||effEsc<30?C.termGreen:C.termAmber},
{l:"MAIN DRIVER",v:newsEscDelta>0.05?"Escalation News":newsEscDelta<-0.05?"De-esc News":"Technicals",c:C.termBlue},
{l:"DATA FRESHNESS",v:lastUpdated||"Loading",c:C.termMuted},
].map(({l,v,c})=><div key={l}><div style={{fontSize:9,color:C.termMuted,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div></div>)}
</div>
{newsEscDelta!==0&&<div style={{background:`${C.purple}08`,border:`1px solid ${C.purple}20`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,alignItems:"center"}}>
<div style={{fontSize:12,color:C.purple,fontWeight:600}}>📰 News is {newsEscDelta>0?"raising":"lowering"} escalation by <strong>{newsEscDelta>0?"+":""}{(newsEscDelta*100).toFixed(0)}%</strong></div>
<Tag color={C.purple}>Effective: {Math.round(effEsc)}%</Tag>
</div>}
{/* Scenario controls */}
<Card>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
<div>
<div style={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:C.navy}}>Scenario Controls</div>
<Explain text="Drag sliders to model scenarios. Or let Claude set them automatically."/>
</div>
<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
{aiRec&&<button onClick={applyAllAI} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.purple}`,background:`${C.purple}12`,color:C.purple,fontSize:12,fontWeight:700,cursor:"pointer"}}>* Apply All AI</button>}
<button onClick={getAIRec} disabled={aiRecLoading} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.panel,color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{aiRecLoading?<><Spin size={10} color={C.muted}/> Analysing...</>:"* Get AI Rec"}</button>
</div>
</div>
{aiRec&&<div style={{background:`${C.purple}06`,border:`1px solid ${C.purple}15`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:11,color:C.purple}}>
* Claude: Escalation {aiRec.escalation}% - Confidence {aiRec.confidence}% - Volatility {aiRec.volatility} - Time {aiRec.timeHorizon}%
</div>}
{/* -- ASSET BROWSER: Two-step category to asset selection -- */}
<Card noPad>
  {/* Header with refresh time */}
  <div style={{padding:"10px 16px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:C.navy}}>Market Browser</div>
    <div style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:6}}>
      {lastUpdated?`Updated ${lastUpdated}`:"Loading..."}
      {priceLoading&&<Spin size={10} color={C.amber}/>}
    </div>
  </div>
  {/* STEP 1 -- Category tabs */}
  <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,overflowX:"auto",background:C.panel}}>
    {FORECAST_CATS.map(cat=>{
      const catKeys=cat.sub?cat.sub.flatMap(s=>s.keys):cat.keys;
      const isActiveCat=selCat===cat.id;
      // Best signal in this category
      const bestSig=catKeys.map(k=>signals[k]).filter(Boolean).sort((a,b)=>(b.score||0)-(a.score||0))[0];
      return(
        <button key={cat.id}
          onClick={()=>{
            setSelCat(cat.id);
            // Auto-select first key of category when switching
            const firstKey=cat.sub?cat.sub[0].keys[0]:cat.keys[0];
            setSelAsset(firstKey);
            setChartView("price");
          }}
          style={{
            display:"flex",flexDirection:"column",alignItems:"center",
            padding:"10px 16px",border:"none",cursor:"pointer",
            background:"transparent",
            borderBottom:`3px solid ${isActiveCat?cat.color:"transparent"}`,
            minWidth:90,flexShrink:0,transition:"all 0.15s",
          }}>
          <span style={{fontSize:18,marginBottom:3}}>{cat.icon}</span>
          <span style={{fontSize:11,fontWeight:isActiveCat?700:500,color:isActiveCat?cat.color:C.muted,whiteSpace:"nowrap"}}>{cat.label}</span>
          {bestSig&&<span style={{fontSize:8,fontWeight:700,marginTop:2,color:bestSig.action==="BUY"?C.green:bestSig.action==="SELL"?C.red:C.dim}}>{bestSig.action}</span>}
        </button>
      );
    })}
  </div>
  {/* STEP 2 -- Assets in selected category */}
  <AssetBrowser selCat={selCat} selAsset={selAsset} setSelAsset={setSelAsset} setChartView={setChartView} prices={prices} signals={signals}/>
</Card>
</Card>
{/* -- TWO-PANEL CHART ROW -- */}
{/* LEFT 35%: TradingView -- clean live price reference */}
{/* RIGHT 65%: Analytical + Scenario combined with tab toggle */}
<div className="chart-pair" style={{display:"grid",gridTemplateColumns:"35% 65%",gap:14}}>
{/* LEFT: TradingView */}
<Card noPad style={{overflow:"hidden",minHeight:520}}>
<div style={{padding:"10px 14px 8px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
<div>
<div style={{fontFamily:SERIF,fontSize:13,fontWeight:700,color:C.navy}}>{ASSETS[selAsset]?.label}</div>
<div style={{fontSize:9,color:C.dim,marginTop:1}}>Live - TradingView</div>
</div>
<div style={{display:"flex",gap:3}}>
{["1H","4H","1D","1W"].map(tf=>(
<button key={tf} onClick={()=>setTvInterval(tf)}
style={{padding:"3px 8px",borderRadius:4,fontSize:10,fontWeight:700,cursor:"pointer",
border:`1px solid ${tvInterval===tf?C.navy:C.border}`,
background:tvInterval===tf?C.navy:C.card,
color:tvInterval===tf?"#fff":C.muted}}>
{tf}
</button>
))}
</div>
</div>
{/* Current price strip */}
<div style={{padding:"8px 14px",background:C.panel,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:C.navy}}>
{ASSETS[selAsset]?.unit}{fmtPrice(getP(selAsset),ASSETS[selAsset]?.unit)}
</div>
<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
<Delta v={getC(selAsset)} small/>
{signals[selAsset]&&(
<span style={{fontSize:10,fontWeight:700,
color:signals[selAsset].action==="BUY"?C.green:signals[selAsset].action==="SELL"?C.red:C.amber}}>
{signals[selAsset].action} - Score {signals[selAsset].score}
</span>
)}
</div>
</div>
<div style={{height:420}} className="tv-container">
<iframe
src={`https://www.tradingview.com/widgetembed/?frameElementId=tv_${selAsset}&symbol=${encodeURIComponent(ASSETS[selAsset]?.tv||"NSE:NIFTY")}&interval=${{"1H":"60","4H":"240","1D":"D","1W":"W"}[tvInterval]||"D"}&theme=light&style=1&toolbar_bg=f8f7f4&hide_side_toolbar=1&allow_symbol_change=0&save_image=0&hide_top_toolbar=0&studies=[]&locale=en`}
style={{width:"100%",height:"100%",border:"none"}}
title={`${ASSETS[selAsset]?.label} TradingView`}
/>
</div>
</Card>
{/* RIGHT: Analytical chart + Scenario forecast COMBINED with tab toggle */}
<Card noPad style={{overflow:"hidden",minHeight:520}}>
{/* Tab toggle between Price Chart and Scenario Forecast */}
<div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.panel}}>
{[{id:"price",label:"📈 Price & EMA"},{id:"scenario",label:"🔮 Scenario Forecast"}].map(t=>(
<button key={t.id} onClick={()=>setChartView(t.id)}
style={{flex:1,padding:"11px 8px",border:"none",cursor:"pointer",fontSize:12,fontWeight:chartView===t.id?700:500,
background:"none",
color:chartView===t.id?C.navy:C.muted,
borderBottom:`3px solid ${chartView===t.id?C.navy:"transparent"}`,
transition:"all 0.15s"}}>
{t.label}
</button>
))}
</div>
{/* PRICE & EMA tab */}
{chartView==="price"&&(
<div style={{height:470}}>
<TVChart
symbol={ASSETS[selAsset]?.tv||"NSE:NIFTY"}
ohlcv={ohlcvRef.current[selAsset]||[]}
unit={ASSETS[selAsset]?.unit||""}
label={ASSETS[selAsset]?.label||""}
/>
</div>
)}
{/* SCENARIO FORECAST tab */}
{chartView==="scenario"&&(
<div style={{padding:"14px",overflowY:"auto",maxHeight:470}}>
<PredChart assetKey={selAsset} base={getP(selAsset)||1000} params={params} newsDelta={newsEscDelta} priceHistory={priceHistRef.current[selAsset]||[]}/>
<div style={{marginTop:10,padding:"8px 10px",background:C.redBg,borderRadius:6,border:`1px solid ${C.redBorder}`}}>
<span style={{fontSize:10,fontWeight:700,color:C.red}}>! INVALIDATION: </span>
<span style={{fontSize:11,color:C.textMid}}>{selAsset==="gold"?"Ceasefire + DXY above 106 = exit gold":selAsset==="crude"?"Crude below $62 or OPEC increases output = exit":selAsset==="hal"||selAsset==="bel"||selAsset==="mazagon"?"Conflict de-escalation = defence stocks fall 10-15%":"Regime shifts -- reassess all positions"}</span>
</div>
</div>
)}
</Card>
</div>
{/* Related news */}
{news.filter(n=>n.assets?.includes(selAsset)).length>0&&<Card>
<div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:10}}><LiveDot/>LIVE NEWS AFFECTING {ASSETS[selAsset]?.label?.toUpperCase()}</div>
{news.filter(n=>n.assets?.includes(selAsset)).slice(0,3).map((n,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",display:"flex",justifyContent:"space-between",gap:10}}>
<div><a href={n.link} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:600,color:C.navy,textDecoration:"none",lineHeight:1.4,display:"block",marginBottom:2}}>{n.title}</a><span style={{fontSize:10,color:C.muted}}>{n.source} - {n.time}</span></div>
<Tag color={n.impact==="bullish"?C.green:n.impact==="bearish"?C.red:C.amber} small>{n.impact}</Tag>
</div>)}
</Card>}
{/* Stress Lab */}
<Card>
<SHead title="Scenario Stress Lab" sub="Portfolio impact under different macro shocks"/>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
{STRESS.map(sc=><div key={sc.name} style={{background:C.panel,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
<div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>{sc.icon} {sc.name}</div>
<div style={{marginBottom:5}}><div style={{fontSize:9,color:C.green,fontWeight:700,marginBottom:2}}>BENEFITS</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sc.winners.map(a=><Tag key={a} color={C.green} small>{ASSETS[a]?.label||a}</Tag>)}</div></div>
<div style={{marginBottom:6}}><div style={{fontSize:9,color:C.red,fontWeight:700,marginBottom:2}}>HURT</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sc.losers.map(a=><Tag key={a} color={C.red} small>{ASSETS[a]?.label||a}</Tag>)}</div></div>
<div style={{fontSize:10,color:C.muted,lineHeight:1.5,marginBottom:6}}>{sc.note}</div>
<div style={{padding:"4px 8px",background:C.blueBg,borderRadius:4,fontSize:10,fontWeight:600,color:C.blue}}>💡 {sc.hedge}</div>
</div>)}
</div>
</Card>
</div>}
{/* == SIGNALS & PICKS TAB == */}
{tab==="signals"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
<SHead title="Signals & Alpha Picks" sub={`${Object.values(signals).filter(s=>s?.action==="BUY").length} Buy - ${Object.values(signals).filter(s=>s?.action==="SELL").length} Sell - ${Object.values(signals).filter(s=>s?.action==="HOLD").length} Hold`}/>
<Card>
<div style={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:C.navy,marginBottom:4}}>Signal Weight Configuration</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"0 24px",marginTop:12}}>
<RangeSlider label="MACD Weight" value={Math.round(params.macdW*100)} min={10} max={70} step={5} unit="%" color={C.blue} hint="Momentum indicator. Best in trending markets." onChange={v=>setParams(p=>({...p,macdW:v/100,emaW:Math.max(0.05,1-v/100-p.rsiW)}))}/>
<RangeSlider label="RSI Weight" value={Math.round(params.rsiW*100)} min={10} max={60} step={5} unit="%" color={C.amber} hint="Overbought/oversold. Best in ranging markets." onChange={v=>setParams(p=>({...p,rsiW:v/100,emaW:Math.max(0.05,1-p.macdW-v/100)}))}/>
<RangeSlider label="EMA Weight" value={Math.round(params.emaW*100)} min={5} max={50} step={5} unit="%" color={C.green} hint="Trend direction. Best in strong trends." onChange={v=>setParams(p=>({...p,emaW:v/100}))}/>
</div>
<div style={{fontSize:10,color:C.muted,marginTop:4}}>Total: {Math.round((params.macdW+params.rsiW+params.emaW)*100)}%</div>
</Card>
<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
{[["all","All"],["buy","🟢 Buy"],["sell","🔴 Sell"],["hold","🟡 Hold"],["stocks","Stocks"],["commodities","Commodities"],["crypto","Crypto"]].map(([v,l])=><button key={v} onClick={()=>setSigFilter(v)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${sigFilter===v?C.navy:C.border}`,background:sigFilter===v?C.navy:C.card,color:sigFilter===v?"#fff":C.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>)}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
{filteredSignals.map(([k,sig])=><SignalCard key={k} sig={sig}/>)}
</div>
<Card style={{borderTop:`3px solid ${C.gold}`}}>
<SHead
title="Daily Alpha Picks"
sub={`Rs20L capital - ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}`}
action={<button onClick={getAlpha} disabled={alphaLoading} style={{padding:"8px 16px",borderRadius:8,border:"none",background:alphaLoading?C.dim:C.navy,color:"#fff",fontSize:12,fontWeight:700,cursor:alphaLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>{alphaLoading?<><Spin/> Analysing...</>:<>! Generate Picks</>}</button>}
/>
{!alphaPicks&&!alphaLoading&&<div style={{background:C.panel,borderRadius:10,padding:"32px 20px",textAlign:"center",border:`1px dashed ${C.border}`}}>
<div style={{fontFamily:SERIF,fontSize:28,color:C.gold,marginBottom:10}}>!</div>
<div style={{fontSize:14,fontWeight:600,color:C.navy,marginBottom:4}}>Generate today's alpha picks</div>
<div style={{fontSize:12,color:C.muted}}>Claude analyses live prices, signals, and news to find the 3 best trades right now.</div>
</div>}
{alphaPicks&&<div>
<div style={{background:C.panel,borderRadius:10,padding:"18px",border:`1px solid ${C.border}`,fontSize:12,color:C.textMid,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:MONO,maxHeight:600,overflowY:"auto"}}>{alphaPicks}</div>
<div style={{marginTop:10,padding:"8px 12px",background:C.redBg,borderRadius:6,border:`1px solid ${C.redBorder}`,fontSize:10,color:C.red}}>!️ AI-generated. Not financial advice. Always apply your own judgement. Stop losses are mandatory.</div>
</div>}
</Card>
</div>}
{/* == CORRELATIONS TAB == */}
{tab==="corr"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
<SHead title="Correlation Intelligence" sub="Which assets move together, which protect you"
action={<div style={{display:"flex",gap:6,alignItems:"center"}}>
<span style={{fontSize:11,color:C.muted}}>Window:</span>
{[10,30,90].map(w=><button key={w} onClick={()=>setCorrWindow(w)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${corrWindow===w?C.navy:C.border}`,background:corrWindow===w?C.navy:C.card,color:corrWindow===w?"#fff":C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{w}d</button>)}
</div>}/>
<div style={{background:C.termBg,borderRadius:12,padding:"14px 18px"}}>
<div style={{fontSize:11,fontWeight:700,color:C.termAmber,letterSpacing:1,marginBottom:10}}>📖 HOW TO READ CORRELATIONS</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
{[{v:"0.80 to 1.0",c:C.termGreen,label:"Very Strong Positive",desc:"Almost always move together. Holding both = double exposure."},
{v:"0.50 to 0.79",c:"#7DD3FC",label:"Moderate Positive",desc:"Usually same direction. Some diversification."},
{v:"-0.20 to 0.49",c:C.termMuted,label:"Weak / No Relation",desc:"Genuinely independent. Good for diversification."},
{v:"-0.50 to -0.21",c:C.termAmber,label:"Moderate Hedge",desc:"Tend to move opposite. Partial protection."},
{v:"-1.0 to -0.51",c:C.termRed,label:"Strong Hedge",desc:"When one rises, other falls. Strong protection."},
].map(({v,c,label,desc})=><div key={v} style={{background:`${c}12`,border:`1px solid ${c}25`,borderRadius:8,padding:"8px 10px"}}>
<div style={{fontSize:13,fontWeight:700,color:c,fontFamily:MONO,marginBottom:2}}>{v}</div>
<div style={{fontSize:11,fontWeight:700,color:C.termText,marginBottom:2}}>{label}</div>
<div style={{fontSize:10,color:C.termMuted,lineHeight:1.4}}>{desc}</div>
</div>)}
</div>
</div>
{/* FII/DII */}
<Card>
<SHead title="FII / DII Daily Flows" sub="⚠️ Simulated placeholder data — wire up live NSE/SEBI API for production use"/>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
<div style={{background:C.panel,borderRadius:8,padding:"12px",textAlign:"center"}}>
<div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4}}>FII TODAY</div>
<div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:fiiLatest.fii>=0?C.green:C.red}}>{fiiLatest.fii>=0?"+":""}Rs{Math.abs(fiiLatest.fii).toLocaleString()} Cr</div>
<Explain text={fiiLatest.fii>=0?"Foreigners buying -- bullish NIFTY":"Foreigners selling -- bearish pressure"}/>
</div>
<div style={{background:C.panel,borderRadius:8,padding:"12px",textAlign:"center"}}>
<div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4}}>DII TODAY</div>
<div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:fiiLatest.dii>=0?C.green:C.red}}>{fiiLatest.dii>=0?"+":""}Rs{Math.abs(fiiLatest.dii).toLocaleString()} Cr</div>
<Explain text="Domestic institutions"/>
</div>
<div style={{background:C.panel,borderRadius:8,padding:"12px",textAlign:"center",border:`2px solid ${fiiLatest.net>=0?C.greenBorder:C.redBorder}`}}>
<div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4}}>NET FLOW</div>
<div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:fiiLatest.net>=0?C.green:C.red}}>{fiiLatest.net>=0?"+":""}Rs{Math.abs(fiiLatest.net).toLocaleString()} Cr</div>
<Explain text={fiiLatest.net>=0?"Net buying -- markets likely hold or rise":"Net selling -- NIFTY under pressure"}/>
</div>
</div>
<ResponsiveContainer width="100%" height={130}>
<BarChart data={FII_DII_DATA} margin={{top:0,right:4,bottom:0,left:4}}>
<CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.5}/>
<XAxis dataKey="date" tick={{fontSize:9,fill:C.textMid,fontFamily:MONO}} tickLine={{stroke:C.borderDark}} axisLine={{stroke:C.borderDark}}/>
<YAxis tick={{fontSize:9,fill:C.textMid,fontFamily:MONO}} tickLine={{stroke:C.borderDark}} axisLine={{stroke:C.borderDark}} tickFormatter={v=>`${v>0?"+":""}${v}`}/>
<Tooltip formatter={(v,n)=>[`Rs${v} Cr`,n]}/>
<ReferenceLine y={0} stroke={C.borderDark}/>
<Bar dataKey="fii" name="FII" fill={C.blue} fillOpacity={0.8} radius={[2,2,0,0]}/>
<Bar dataKey="dii" name="DII" fill={C.green} fillOpacity={0.8} radius={[2,2,0,0]}/>
</BarChart>
</ResponsiveContainer>
</Card>
{/* Sector Rotation */}
<Card>
<SHead title="Sector Rotation" sub="⚠️ Simulated placeholder data — wire up live sector flow API for production use"/>
<div style={{display:"flex",flexDirection:"column",gap:6}}>
{SECTORS.sort((a,b)=>b.change-a.change).map(sec=>{
const flowColor=sec.flow==="strong-in"?C.green:sec.flow==="in"?C.teal:sec.flow==="slight-out"?C.amber:sec.flow==="out"?C.red:C.muted;
const flowLabel=sec.flow==="strong-in"?"🔥 Strong In":sec.flow==="in"?"^ In":sec.flow==="slight-out"?"v Slight Out":sec.flow==="out"?"🔴 Out":"-> Neutral";
return <div key={sec.name} style={{display:"grid",gridTemplateColumns:"130px 60px 110px 1fr",gap:8,alignItems:"center",padding:"10px 12px",background:C.panel,borderRadius:8,border:`1px solid ${C.border}`}} className="sector-row">
<div style={{fontWeight:700,color:C.navy,fontSize:13}}>{sec.name}</div>
<div style={{fontFamily:MONO,fontWeight:700,color:sec.change>=0?C.green:C.red,fontSize:14}}>{sec.change>=0?"+":""}{sec.change}%</div>
<div style={{fontSize:11,fontWeight:700,color:flowColor}} className="sector-flow">{flowLabel}</div>
<div style={{fontSize:10,color:C.muted}} className="sector-note">{sec.note}</div>
</div>;
})}
</div>
</Card>
{/* Correlation pairs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
<Card style={{borderTop:`3px solid ${C.blue}`}}>
<div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:10}}>🔵 Moving Together</div>
{corr.filter(p=>p.type==="together").slice(0,5).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
<div><div style={{fontSize:12,fontWeight:700,color:C.navy}}>{p.la} + {p.lb}</div><Explain text={p.corr>0.85?"Almost identical movement":"Fairly similar"}/></div>
<div style={{fontSize:18,fontWeight:800,color:C.blue,fontFamily:MONO}}>{p.corr.toFixed(2)}</div>
</div>)}
</Card>
<Card style={{borderTop:`3px solid ${C.red}`}}>
<div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:10}}>🔴 Natural Hedges</div>
{corr.filter(p=>p.type==="hedge").slice(0,4).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
<div><div style={{fontSize:12,fontWeight:700,color:C.navy}}>{p.la} vs {p.lb}</div><Explain text={`When ${p.la} rises, ${p.lb} tends to fall`}/></div>
<div style={{fontSize:18,fontWeight:800,color:C.red,fontFamily:MONO}}>{p.corr.toFixed(2)}</div>
</div>)}
<div style={{marginTop:10,padding:"8px 10px",background:C.redBg,borderRadius:6,border:`1px solid ${C.redBorder}`,fontSize:11,color:C.textMid}}>
<span style={{fontWeight:700,color:C.red}}>! HAL + BEL + Mazagon</span> are 90%+ correlated. Holding all three is triple concentration, not diversification.
</div>
</Card>
</div>
{/* Lead-Lag Cascade */}
<Card>
<SHead title="Lead-Lag Cascade" sub="If a major asset moves today, here's what typically follows"/>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
{[
{trigger:"Crude +5%",time:"1-3 sessions",effects:[
{s:"ONGC/GAIL",d:"+3-5% upstream earnings uplift",c:C.green},
{s:"Airlines",d:"-4-8% fuel cost shock",c:C.red},
{s:"Gold",d:"+0.5-1.5% inflation fear",c:C.green},
{s:"USD/INR",d:"+0.3-0.8% import bill rises",c:C.amber},
]},
{trigger:"Gold +3%",time:"1-4 sessions",effects:[
{s:"Silver",d:"+3-5% lags then catches up",c:C.green},
{s:"Muthoot",d:"+2-4% gold loan AUM grows",c:C.green},
{s:"Titan",d:"+1-2% jewellery sentiment",c:C.green},
]},
{trigger:"VIX spikes +20%",time:"Same day",effects:[
{s:"NIFTY",d:"-2-4% panic selling",c:C.red},
{s:"BankNifty",d:"-3-5% most sensitive",c:C.red},
{s:"Gold",d:"+1-2% safe haven",c:C.green},
{s:"Bitcoin",d:"-3-8% risk-off",c:C.red},
]},
].map((sc,i)=>(
<div key={i} style={{paddingBottom:12,borderBottom:i<2?`1px solid ${C.border}`:"none"}}>
<div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
<span style={{fontSize:13,fontWeight:700,color:C.navy}}>📌 If <span style={{color:C.blue}}>{sc.trigger}</span></span>
<Tag color={C.muted} small>{sc.time}</Tag>
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
{sc.effects.map((e,j)=>(
<div key={j} style={{background:C.panel,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.border}`,flex:"1 1 150px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:2}}>{e.s}</div>
<div style={{fontSize:11,color:e.c,fontWeight:600}}>{e.d}</div>
</div>
))}
</div>
</div>
))}
</div>
</Card>
{/* Crypto Correlation */}
<Card>
<SHead title="Crypto Correlation" sub="Are BTC/ETH acting as safe havens or risk assets today?"/>
<div className="r-grid-2">
{["btc","eth"].map(k=>{
const sig=signals[k];
const btcH=priceHistRef.current[k]||[];
const goldH=priceHistRef.current.gold||[];
const corrGold=btcH.length>=10&&goldH.length>=10?pearson(btcH.slice(-30),goldH.slice(-30)):k==="btc"?0.42:0.38;
const isDigitalGold=corrGold>0.5;
return(
<div key={k} style={{background:C.panel,borderRadius:10,padding:"14px",border:`1px solid ${C.border}`}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
<div>
<div style={{fontSize:15,fontWeight:700,color:C.navy}}>{ASSETS[k]?.label}</div>
<div style={{fontSize:10,color:C.muted}}>Cryptocurrency</div>
</div>
<div style={{textAlign:"right"}}>
<div style={{fontSize:16,fontWeight:700,fontFamily:MONO,color:C.navy}}>{ASSETS[k]?.unit}{fmtPrice(getP(k),ASSETS[k]?.unit)}</div>
<Delta v={getC(k)} small/>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
<div style={{background:C.card,borderRadius:6,padding:"6px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.dim}}>vs GOLD</div>
<div style={{fontSize:13,fontWeight:700,fontFamily:MONO,color:corrGold>0.5?C.gold:C.muted}}>{corrGold.toFixed(2)}</div>
</div>
{sig&&<div style={{background:C.card,borderRadius:6,padding:"6px",textAlign:"center"}}>
<div style={{fontSize:9,color:C.dim}}>SIGNAL</div>
<div style={{fontSize:13,fontWeight:700,color:sig.action==="BUY"?C.green:sig.action==="SELL"?C.red:C.amber}}>{sig.action}</div>
</div>}
</div>
<div style={{padding:"6px 8px",background:isDigitalGold?C.goldLight:C.redBg,borderRadius:6,fontSize:11,color:isDigitalGold?C.gold:C.red,fontWeight:600}}>
{k==="btc"?(isDigitalGold?"🥇 Acting as digital gold -- safe haven mode":"! Acting as risk asset -- correlated to equities"):"ETH tracks BTC with higher beta. BTC +5% -> ETH +7-10%."}
</div>
</div>
);
})}
</div>
</Card>
</div>}
{/* == CALENDAR TAB == */}
{tab==="calendar"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
<SHead title="Economic Calendar" sub={`Next 30 days - ${CALENDAR.length} events`}/>
<div style={{background:C.blueBg,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.blueBorder}`,fontSize:11,color:C.blue}}>
💡 Check this every Sunday. For "Market-Moving" events, plan position size BEFORE the event -- never trade large into a surprise.
</div>
{CALENDAR.map((ev,i)=>{
const days=daysFrom(ev.date);
const urgColor=days<=3?C.red:days<=7?"#EA580C":C.amber;
const impColor={"market-moving":C.red,"high":"#EA580C","medium":C.amber,"low":C.dim};
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
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,fontSize:11}}>
<div style={{background:C.panel,borderRadius:8,padding:"10px"}}>
<div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>📊 HISTORICAL REACTION</div>
<div style={{color:C.textMid,lineHeight:1.5}}>{ev.historical}</div>
</div>
<div style={{background:C.amberBg,borderRadius:8,padding:"10px",border:`1px solid ${C.amberBorder}`}}>
<div style={{fontSize:9,color:C.amber,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>! BEFORE THE EVENT</div>
<div style={{color:C.textMid,lineHeight:1.5}}>{ev.preEvent}</div>
</div>
<div style={{background:C.blueBg,borderRadius:8,padding:"10px",border:`1px solid ${C.blueBorder}`}}>
<div style={{fontSize:9,color:C.blue,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>✅ AFTER THE EVENT</div>
<div style={{color:C.textMid,lineHeight:1.5}}>{ev.postEvent}</div>
</div>
</div>
</Card>;
})}
</div>}
{/* == WATCHLIST TAB == */}
{tab==="watchlist"&&<WatchlistTab
  trackedPicks={trackedPicks}
  journalFilter={journalFilter}
  setJournalFilter={setJournalFilter}
  savePicks={savePicks}
  closePick={closePick}
  deletePick={deletePick}
  prices={prices}
  signals={signals}
  effEsc={effEsc}
  regimeLabel={regimeLabel}
  news={news}
  discLoading={discLoading}
  discoveredStocks={discoveredStocks}
  getDiscovered={getDiscovered}
  WL_META={WL_META}
  SECTORS={SECTORS}
  isStale={isStale}
  getP={getP}
/>}
{/* == NEWS & BRIEF TAB == */}
{tab==="news"&&<div className="r-grid-news">
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
<div>
<div style={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.navy}}>Live Intelligence Feed</div>
<div style={{fontSize:11,color:C.muted,marginTop:2}}><LiveDot/>{newsLoading?"Refreshing...":`${news.length} headlines - ${news.filter(n=>n.tier===1).length} Tier 1`}</div>
</div>
<button onClick={refreshNews} disabled={newsLoading} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.card,fontSize:11,fontWeight:600,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{newsLoading?<Spin size={10} color={C.muted}/>:"<-"} Refresh</button>
</div>
<div style={{background:C.termBg,borderRadius:10,padding:"12px 14px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10}}>
{[{l:"BULLISH",v:news.filter(n=>n.impact==="bullish").length,c:C.termGreen},{l:"BEARISH",v:news.filter(n=>n.impact==="bearish").length,c:C.termRed},{l:"TIER 1",v:news.filter(n=>n.tier===1).length,c:C.termBlue},{l:"ESC SIGNAL",v:`${newsEscDelta>0?"+":""}${(newsEscDelta*100).toFixed(0)}%`,c:C.termAmber}].map(({l,v,c})=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:9,color:C.termMuted,fontWeight:700,letterSpacing:1}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div></div>)}
</div>
<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
{["all","tier1","bullish","bearish","gold","crude"].map(f=><button key={f} onClick={()=>setNewsFilter(f)} style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${newsFilter===f?C.navy:C.border}`,background:newsFilter===f?C.navy:C.card,color:newsFilter===f?"#fff":C.muted,fontSize:10,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{f==="tier1"?"⭐ Tier 1":f}</button>)}
</div>
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
<span style={{fontSize:10,color:C.dim}}>- {item.time}</span>
</div>
</div>
<Tag color={ic} small>{item.impact}</Tag>
</div>
</div>;
})}
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div>
<div style={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.navy}}>Claude AI Morning Brief</div>
<div style={{fontSize:11,color:C.muted,marginTop:2}}>Live prices + news + your scenario -> actionable intelligence</div>
</div>
<Card style={{background:C.panel}}>
<div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:0.8,marginBottom:8}}>INPUTS</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:8}}>
{[{l:"ESC%",v:`${params.escalation}%`,c:C.red},{l:"NEWS ADJ",v:`${newsEscDelta>0?"+":""}${(newsEscDelta*100).toFixed(0)}%`,c:C.purple},{l:"EFF ESC",v:`${Math.round(effEsc)}%`,c:regimeColor},{l:"HEADLINES",v:news.length,c:C.blue}].map(({l,v,c})=><div key={l} style={{background:C.card,borderRadius:6,padding:"7px",textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:0.8}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c,fontFamily:MONO}}>{v}</div></div>)}
</div>
</Card>
<button onClick={getBriefing} disabled={briefLoading} style={{padding:"14px 20px",borderRadius:10,border:"none",background:briefLoading?C.dim:C.navy,color:"#fff",fontSize:13,fontWeight:700,cursor:briefLoading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
{briefLoading?<><Spin/> Generating...</>:<>* Generate Today's Briefing</>}
</button>
{briefing?<Card style={{border:`1px solid ${C.greenBorder}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
<div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:C.navy}}>Today's Intelligence</div>
<Tag color={C.green}>v Generated</Tag>
</div>
<div style={{fontSize:12,color:C.textMid,lineHeight:1.85,whiteSpace:"pre-wrap",borderTop:`1px solid ${C.border}`,paddingTop:12,maxHeight:500,overflowY:"auto"}}>{briefing}</div>
<div style={{marginTop:10,fontSize:10,color:C.dim,padding:"6px 10px",background:C.panel,borderRadius:6}}>!️ AI-generated. Not financial advice.</div>
</Card>:<div style={{background:C.panel,border:`1px dashed ${C.border}`,borderRadius:12,padding:"40px 20px",textAlign:"center"}}>
<div style={{fontFamily:SERIF,fontSize:28,color:C.gold,marginBottom:10}}>*</div>
<div style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:4}}>Your morning briefing will appear here</div>
<div style={{fontSize:11,color:C.muted}}>What changed - What matters - Position impact - What to do today</div>
</div>}
{/* FOOTER */}
<div style={{textAlign:"center",padding:"24px",fontSize:10,color:C.dim,borderTop:`1px solid ${C.border}`,marginTop:20}}>
MacroTrader Intelligence v4 - Prices: Yahoo Finance - News: Google News RSS - AI: Claude Sonnet - Not financial advice
</div>
</div>
</div>}
</div>
</div>
);
}