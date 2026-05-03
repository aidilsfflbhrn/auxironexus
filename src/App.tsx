import React, { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, CartesianGrid } from "recharts";

const C={
  bg0:"#080e14",bg1:"#0d1520",bg2:"#121d2c",bg3:"#192538",
  border:"#1e2e42",border2:"#28405a",
  txt0:"#f0f5ff",txt1:"#c2d4e8",txt2:"#7a9ab8",txt3:"#3a5570",
  gold:"#d4a843",goldL:"#f0cc5a",
  up:"#22d46e",upD:"#0f2e1c",dn:"#f04545",dnD:"#3a1010",
  blue:"#4a9eff",amber:"#f0a020",vix:"#b060f0",bond:"#20c8d8",
};
const ICFG={
  NOISE:{color:"#486080",bg:"rgba(72,96,128,0.08)",bar:"#243347"},
  LOW:{color:"#4890f8",bg:"rgba(72,144,248,0.07)",bar:"#1850b0"},
  MODERATE:{color:"#f09020",bg:"rgba(240,144,32,0.07)",bar:"#906020"},
  HIGH:{color:"#f04040",bg:"rgba(240,64,64,0.07)",bar:"#6c1c1c"},
  CRITICAL:{color:"#ff1840",bg:"rgba(255,24,64,0.06)",bar:"#980020"},
};
const SC={"RISK-ON":"#28cc78","RISK-OFF":"#f04040","NEUTRAL":"#486080","MIXED":"#f09020"};
const DC={BULLISH:"#28cc78",BEARISH:"#f04040",NEUTRAL:"#486080"};

const TIER1=["XAU/USD","XAG/USD","WTI/USD","SPX","NDX","DX","VIX"];
const TIER2=["EUR/USD","GBP/USD","USD/JPY","AUD/USD","GBP/JPY","US10Y","US02Y","DJI","RUT"];

const INSTRUMENTS=[
  {s:"XAU/USD",l:"GOLD",      b:3230, cat:"Commodities",grp:"Metals", roro:"OFF",v:0.004,tier:1},
  {s:"XAG/USD",l:"SILVER",    b:32.14,cat:"Commodities",grp:"Metals", roro:"OFF",v:0.005,tier:1},
  {s:"WTI/USD",l:"OIL WTI",   b:61.85,cat:"Commodities",grp:"Energy", roro:"ON", v:0.005,tier:1},
  {s:"SPX",    l:"S&P 500",   b:5320, cat:"Indices",    grp:"US",     roro:"ON", v:0.003,tier:1},
  {s:"NDX",    l:"NASDAQ 100",b:18540,cat:"Indices",    grp:"US",     roro:"ON", v:0.004,tier:1},
  {s:"DJI",    l:"DOW 30",    b:39820,cat:"Indices",    grp:"US",     roro:"ON", v:0.003,tier:2},
  {s:"RUT",    l:"RUSSELL 2K",b:1980, cat:"Indices",    grp:"US",     roro:"ON", v:0.005,tier:2},
  {s:"DX",     l:"DXY",       b:99.82,cat:"Indices",    grp:"USD",    roro:"OFF",v:0.002,tier:1},
  {s:"VIX",    l:"VIX",       b:21.50,cat:"Volatility", grp:"VIX",   roro:"OFF",v:0.025,tier:1},
  {s:"EUR/USD",l:"EUR/USD",   b:1.1042,cat:"Forex",    grp:"Majors", roro:"MIX",v:0.002,tier:2},
  {s:"GBP/USD",l:"GBP/USD",   b:1.2985,cat:"Forex",    grp:"Majors", roro:"MIX",v:0.002,tier:2},
  {s:"USD/JPY",l:"USD/JPY",   b:143.25,cat:"Forex",    grp:"Majors", roro:"OFF",v:0.002,tier:2},
  {s:"AUD/USD",l:"AUD/USD",   b:0.6312,cat:"Forex",    grp:"Majors", roro:"ON", v:0.002,tier:2},
  {s:"GBP/JPY",l:"GBP/JPY",   b:186.10,cat:"Forex",    grp:"Crosses",roro:"ON", v:0.002,tier:2},
  {s:"US10Y",  l:"US 10Y",    b:4.38,  cat:"Bonds",    grp:"Yields", roro:"OFF",v:0.006,tier:2},
  {s:"US02Y",  l:"US 2Y",     b:4.02,  cat:"Bonds",    grp:"Yields", roro:"OFF",v:0.008,tier:2},
];

const FILTER_CATS=["All","Risk-On","Risk-Off","FX","Bonds"];
const DEFAULT_QUAD=["XAU/USD","SPX","DX","WTI/USD"];
const SAMPLES=[
  "Federal Reserve surprises with emergency 50bps rate cut amid banking stress",
  "US CPI comes in at 3.8% vs 3.5% expected, core inflation remains sticky",
  "Iran closes Strait of Hormuz following US airstrike on oil facilities",
  "China PMI falls to 48.2, below the 50 contraction threshold",
  "Russia halts natural gas supply to three European nations",
  "US NFP jobs data comes in at 150k vs 200k expected",
];

const AI_SYS=`You are an elite macro financial analyst and geopolitical strategist. Respond ONLY with valid JSON:
{"impactScore":<0-100>,"impactLevel":"<NOISE|LOW|MODERATE|HIGH|CRITICAL>","marketSentiment":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sentimentShift":"<BULLISH|BEARISH|NEUTRAL>","immediateImpact":"<2-3 sentences>","moneyFlow":"<2 sentences on institutional money movement>","geopoliticalCascade":"<2-3 sentences: full transmission chain>","affectedInstruments":[{"symbol":"<sym>","direction":"<BULLISH|BEARISH|NEUTRAL>","confidence":<0-100>,"currentPrice":<number>,"targetLevel":<number>,"reason":"<one sentence>"}],"keyDrivers":["<d1>","<d2>","<d3>"],"edgeFinderOverride":{"triggered":<true|false>,"reason":"<why geopolitical conditions override scoring model>"},"edgeFinderCrossCheck":{"hasData":<true|false>,"cotAlignment":"<CONFIRMS|CONTRADICTS|MIXED|N/A>","cotNote":"<1-2 sentences: what COT data shows vs the event, or N/A>","setupAlignment":"<CONFIRMS|CONTRADICTS|MIXED|N/A>","setupNote":"<1-2 sentences: what top setups show vs event direction, or N/A>","keyContradiction":"<the single most important conflict between EdgeFinder data and the news event, or null>","resolution":"<2 sentences: how to reconcile conflicting signals, which to prioritize and why>","tradeVerdict":"<EDGEFINDER WINS|NEWS WINS|WAIT FOR CONFIRMATION|SPLIT — explain briefly>"},"scenarios":[{"type":"BEARISH_EXTREME","title":"<n>","probability":<0-100>,"timeline":"<e.g. 2-5 days>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+8%>"}]},{"type":"BASE_CASE","title":"<n>","probability":<0-100>,"timeline":"<e.g. 1-3 days>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+3%>"}]},{"type":"BULLISH_REVERSAL","title":"<n>","probability":<0-100>,"timeline":"<e.g. 1 week>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.-2%>"}]}],"keyLevelsToWatch":[{"symbol":"<sym>","level":<number>,"significance":"<why critical now>"}],"traderNote":"<3-4 sentences actionable>","timeHorizon":"<INTRADAY|SHORT-TERM|MEDIUM-TERM|LONG-TERM>","nextCatalysts":["<event1>","<event2>"]}
Probabilities sum to 100. List 3-5 affected instruments. List 3 key levels. Always explain full transmission chain. If EdgeFinder screenshots are attached, read the COT data, top setups, and any positioning data shown, then fill edgeFinderCrossCheck.hasData=true and provide a full cross-analysis highlighting contradictions. If no images provided, set hasData=false and all alignment fields to "N/A".`;

const CTX_SYS=`You are a senior market analyst with access to live news via web search. Generate a concise breaking news briefing covering what has happened in the LAST 1-2 HOURS during this trading session.

Search the web RIGHT NOW for: breaking market news last 2 hours, latest Gold and DXY price movement and catalyst, any Fed speaker statements today, JPY or BOJ activity, geopolitical breaking developments, any surprise economic data that just printed.

Respond ONLY with valid JSON:
{"sessionBias":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","regimeUpdate":"<1 sentence: what is driving the current market regime RIGHT NOW>","breaking":[{"time":"<SGT time>","type":"<ECONOMIC DATA|FED SPEAKER|CENTRAL BANK|GEOPOLITICAL|MARKET MOVE>","typeColor":"<use: ECONOMIC DATA=#22c55e, FED SPEAKER=#818cf8, CENTRAL BANK=#fb923c, GEOPOLITICAL=#ef4444, MARKET MOVE=#3b82f6>","headline":"<specific factual headline — what actually happened>","impact":"<BULLISH GOLD|BEARISH GOLD|BULLISH USD|BEARISH USD|RISK-ON|RISK-OFF|NEUTRAL>","detail":"<2-3 sentences: exactly what happened, the specific numbers or statements, and why it matters for traders>","goldReaction":"<how Gold actually moved or is moving in response — be specific with price levels>","tradingNote":"<1 sentence: the single most actionable thing a trader should know right now>"}],"marketMoves":[{"symbol":"<sym>","from":"<price>","to":"<price>","change":"<+/-amount>","direction":"<up|down>","note":"<1 sentence: what caused this move>"}],"nextUp":[{"time":"<SGT>","event":"<specific upcoming event or risk>","impact":"<HIGH|MEDIUM>","note":"<1 sentence why it matters>"}],"goldBias":"<BULLISH|BEARISH|NEUTRAL>","dxyBias":"<BULLISH|BEARISH|NEUTRAL>","sessionSummary":"<2 sentences: plain English summary of what has happened this session so far and what traders should be focused on right now>"}
Provide 1-3 breaking items covering only GENUINELY NEW developments from the last 2 hours — not background context or old news. If nothing significant happened, say so honestly. Provide 3-5 market moves. Provide 2-3 next up items. No economic calendar — that lives in the Intel report only.`;
const INTEL_SYS=`You are a senior macro strategist and market intelligence analyst at a top-tier investment bank. You have access to live market data and real-time news via web search. Generate a comprehensive pre-session intelligence briefing in the style of a JPMorgan morning research note — detailed but tightly summarised, covering what happened this week, what is happening this session, and what to expect.

Search the web thoroughly for ALL of the following:
1. GOLD: Latest price drivers, what moved Gold this week, central bank buying, ETF flows, real yield direction, DXY correlation, institutional positioning, bank forecasts and price targets for Gold this week and month
2. DXY AND FED: Current DXY level and trend, where it closed this week vs key levels, latest Fed speaker statements, CME FedWatch cut probabilities, real yields (10Y TIPS), upcoming Fed events
3. JPY AND CARRY TRADE: USD/JPY level vs BOJ intervention history, any BOJ or Finance Ministry statements, carry trade positioning, GBP/JPY as carry indicator, risk of unwind
4. CENTRAL BANKS: ECB rate outlook, BOE policy stance, BOJ rate hike expectations, any surprise central bank communications this week
5. GEOPOLITICAL: Active geopolitical risks (Middle East, Russia-Ukraine, China-Taiwan), any escalation or de-escalation this week, commodity supply risk
6. ECONOMIC CALENDAR: Upcoming high-impact events for THIS SESSION ONLY (see session rules below)
7. WEEKLY CONTEXT: What were the key themes this week? What data printed? What surprised markets? How does that set up for next week?
8. MARKET SENTIMENT: Overall risk-on or risk-off regime, what is driving it, what could change it this session

Respond ONLY with valid JSON, no extra text:
{"session":"<ASIA OPEN|LONDON OPEN|NY SESSION>","generatedAt":"<time SGT>","validFor":"<e.g. 9pm-1am SGT>","marketRegime":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","regimeDrivers":"<2 sentences: what is specifically driving the current risk regime>","headline":"<the single most important market theme for this session>","executiveSummary":"<4-5 sentences in JPMorgan morning note style: what happened this week, current macro picture, key risks tonight, what traders should be positioned for>","weeklyContext":{"summary":"<3-4 sentences: key themes and data that defined this week>","biggestMove":"<which instrument moved most and why>","setupForNext":"<2 sentences: how this week's developments set up next week>"},"alerts":[{"priority":<1,2,or3>,"type":"<INTERVENTION RISK|BINARY EVENT|CENTRAL BANK|GEOPOLITICAL|DATA RISK>","color":"<#ff1840 for P1|#f0a500 for P2|#fb923c for P3>","headline":"<specific alert headline>","detail":"<3-4 sentences: full context, historical precedent, probability, exact levels>","monitor":"<1-2 sentences: what to watch and trigger levels>"}],"markets":[{"asset":"<full name>","price":"<price>","chg":"<+/-X.XX%>","weekChg":"<weekly change>","bias":"<BULLISH|BEARISH|NEUTRAL|AVOID LONGS|WATCH>","note":"<2 sentences: what drove this instrument this week and what matters tonight>"}],"macro":[{"heading":"<heading>","color":"<hex>","body":"<3-4 sentences: detailed analysis with specific data points, probabilities, historical context>","keyData":"<key data points separated by ·>"}],"calendar":[{"time":"<SGT>","flag":"<emoji>","event":"<name>","stars":<2or3>,"forecast":"<value>","prev":"<value>","impact":"<CRITICAL|HIGH|MEDIUM>","goldBull":"<bullish condition>","goldBear":"<bearish condition>","analysis":"<2 sentences>"}],"instruments":[{"name":"<name>","color":"<hex>","price":"<price>","bias":"<bias>","conviction":"<HIGH|MEDIUM|LOW>","summary":"<3-4 sentences: full macro view, key levels context, what changes the thesis>","levels":{"s2":<n>,"s1":<n>,"now":<n>,"r1":<n>,"r2":<n>},"setup":"<entry zone, stop, target, R/R or NO SETUP with reason>","avoid":["<condition1>","<condition2>"]}],"watchlist":[{"symbol":"<sym>","price":"<price>","bias":"<bias>","priority":"<CRITICAL|HIGH|MEDIUM>","color":"<hex>","note":"<1-2 sentences: why watching tonight and key level>"}],"tradeFocus":"<4-5 sentences talking directly to a trader: primary opportunity tonight, key event risks, what to avoid, most important level, position sizing given tonight volatility>"}

CALENDAR RULES:
ASIA (6am-3pm SGT): JPY, AUD, NZD, CNY data only
LONDON (4pm-1am SGT): EUR, GBP, CHF data only
NY (9pm-6am SGT): USD, CAD data only
Include ONLY 2-star and 3-star events. Skip 1-star entirely.
3-star: NFP, CPI, PCE, FOMC, GDP, central bank rate decisions, PMI Flash
2-star: ISM, PPI, Retail Sales, Jobless Claims, JOLTS, IFO, ZEW, Trade Balance

INSTRUMENT RULES:
Always include Gold (XAU/USD) first. Always include DXY second.
Include USD/JPY if intervention risk present or BOJ active.
Include EUR/USD if ECB relevant or DXY breaking key levels.
Include GBP/JPY if carry trade risk elevated.
Include WTI Oil if geopolitical risk elevated or OPEC news.
3-5 instruments total — only relevant ones, not every instrument every time.
DO NOT include sector rotation analysis or individual stock picks.

ALERT RULES:
Only include alerts for genuinely active risks — never manufacture alerts on quiet sessions.
P1: Imminent binary risk in next 2 hours.
P2: Active elevated risk for the full session.
P3: Background risk to monitor this week.
Maximum 3 alerts. Minimum 0 on quiet sessions.

MACRO SECTIONS (always include):
1. Federal Reserve — Policy Path (always)
2. Most relevant CB for this session: BOJ for Asia, ECB/BOE for London, Fed/macro for NY
3. Geopolitical Risk Tracker — only if genuinely active risk worth monitoring
4. Carry Trade / JPY — only if JPY positioning is a live concern
Maximum 4 macro sections.

WEEKLY CONTEXT: Always include. This is what makes the report feel like a real research note — the trader needs to know what happened this week to understand tonight.

Write like a senior JPMorgan analyst: confident, specific, data-driven. Every claim references a specific price level, probability, or data point. No vague generalisations. No sector rotation. No individual stock analysis.`;

const dp=function(b:number){return b>=1000?2:b>=10?3:4;};
const fmt=function(v:any,b:number){
  if(v==null)return"—";
  return v.toLocaleString(undefined,{minimumFractionDigits:dp(b),maximumFractionDigits:dp(b)});
};
const vixClr=function(v:number){return v<15?"#28cc78":v<20?"#e8c858":v<30?"#f09020":"#f04040";};
const vixLbl=function(v:number){return v<15?"CALM":v<20?"NORMAL":v<30?"ELEVATED":"HIGH FEAR";};

function genFB(base:number,vol:number,pts?:number){
  pts=pts||48;var data:any[]=[];var now=Date.now();
  var dailyRange=Math.max(vol*2,0.002);
  var trendDir=Math.random()>0.5?1:-1;
  var trendStrength=dailyRange*(0.3+Math.random()*0.7);
  var startPct=trendDir*(-trendStrength*0.8);
  var p=base*(1+startPct);
  var momentum=0;
  for(var i=0;i<pts;i++){
    momentum=momentum*0.92+(Math.random()-0.5)*dailyRange*0.12;
    var maxMom=dailyRange*0.3;
    if(momentum>maxMom)momentum=maxMom;
    if(momentum<-maxMom)momentum=-maxMom;
    p=p*(1+momentum);
    var maxDev=base*(dailyRange*1.5);
    if(p>base+maxDev)p=base+maxDev-Math.random()*base*0.001;
    if(p<base-maxDev)p=base-maxDev+Math.random()*base*0.001;
    data.push({t:new Date(now-(pts-1-i)*30*60*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),p:parseFloat(p.toFixed(dp(base)))});
  }
  data[data.length-1].p=parseFloat((base*(1+(Math.random()-0.5)*0.001)).toFixed(dp(base)));
  return data;
}

function initMkt(){
  return INSTRUMENTS.map(function(inst){
    var ch=genFB(inst.b,inst.v);var open=ch[0].p;var cur=ch[ch.length-1].p;
    return Object.assign({},inst,{ch:ch,open:open,cur:cur,chg:cur-open,pct:(cur-open)/open*100,live:false,src:"SIM"});
  });
}

function callProxy(body:any,onSuccess:Function,onError:Function){
  var xhr=new XMLHttpRequest();
  xhr.open("POST","/api/analyze",true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.timeout=body.useWebSearch?295000:55000;
  xhr.onload=function(){
    try{
      var raw=(xhr.responseText||"").trim();
      if(!raw.startsWith("{")&&!raw.startsWith("[")){
        onError("Server error (timeout or gateway): "+raw.slice(0,180));return;
      }
      var d=JSON.parse(raw);
      if(d.error){
        var eType=d.error&&d.error.type;
        var eMsg=eType==="overloaded_error"?"Anthropic API overloaded — please try again in 1–2 min":
          eType==="rate_limit_error"?"Rate limit hit — please wait 30 seconds and retry":
          typeof d.error==="string"?d.error:JSON.stringify(d.error);
        onError(eMsg);return;
      }
      var txt=(d.content||[]).map(function(x:any){return x.type==="text"?x.text:"";}).join("");
      if(!txt){onError("Empty response — web search may be unavailable, retry");return;}
      var clean=txt.split("```json").join("").split("```").join("").trim();
      var s=clean.indexOf("{"),ef=clean.lastIndexOf("}");
      if(s!==-1&&ef>s){clean=clean.slice(s,ef+1);}
      else{onError("AI returned plain text instead of JSON: "+clean.slice(0,160)+"…");return;}
      onSuccess(JSON.parse(clean));
    }catch(e:any){onError("Parse error: "+e.message);}
  };
  xhr.onerror=function(){onError("Network error");};
  xhr.ontimeout=function(){onError("Request timed out — web search takes up to 60s, please retry");};
  xhr.send(JSON.stringify(body));
}

function ChartTip(props:any){
  if(!props.active||!props.payload||!props.payload.length)return null;
  return <div style={{background:"#1b2840",border:"1px solid #283d58",borderRadius:6,padding:"7px 11px",fontSize:11}}>
    <div style={{color:"#edf2ff",fontWeight:600}}>{props.payload[0]&&props.payload[0].value&&props.payload[0].value.toLocaleString()}</div>
    <div style={{color:"#486080",marginTop:1}}>{props.label}</div>
  </div>;
}

// ── RORO + SESSION HELPERS ────────────────────────────────
function calcROROScore(mkt:any[]){
  var score=50;
  var vix=mkt.find(function(m){return m.s==="VIX";});
  var dxy=mkt.find(function(m){return m.s==="DX";});
  var spx=mkt.find(function(m){return m.s==="SPX";});
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var usdjpy=mkt.find(function(m){return m.s==="USD/JPY";});
  if(vix){score+=vix.pct>1?-15:vix.pct<-1?15:vix.pct*-5;}
  if(dxy){score+=dxy.pct>0.3?-10:dxy.pct<-0.3?10:dxy.pct*-15;}
  if(spx){score+=spx.pct>0.5?15:spx.pct<-0.5?-15:spx.pct*10;}
  if(gold){score+=gold.pct>0.5?-8:gold.pct<-0.5?8:gold.pct*-5;}
  if(usdjpy){score+=usdjpy.pct>0.3?8:usdjpy.pct<-0.3?-8:usdjpy.pct*10;}
  return Math.max(0,Math.min(100,score));
}

function getROROLabel(score:number){
  if(score>=65)return{label:"RISK-ON",color:"#28cc78",desc:"Equities bid · Gold offered · JPY weak"};
  if(score<=35)return{label:"RISK-OFF",color:"#f04040",desc:"Gold bid · JPY strong · Equities offered"};
  return{label:"NEUTRAL",color:"#f09020",desc:"Mixed signals · No clear regime"};
}

function calcGoldBias(mkt:any[]){
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var dxy=mkt.find(function(m){return m.s==="DX";});
  var vix=mkt.find(function(m){return m.s==="VIX";});
  if(!gold||!dxy||!vix)return"NEUTRAL";
  var score=0;
  if(gold.pct>0.3)score+=2;if(gold.pct<-0.3)score-=2;
  if(dxy.pct<-0.2)score+=2;if(dxy.pct>0.2)score-=2;
  if(vix.pct>1)score+=1;if(vix.pct<-1)score-=1;
  if(score>=2)return"BULLISH";if(score<=-2)return"BEARISH";return"NEUTRAL";
}

function getSessionLabel(){
  var now=new Date();
  var sgt=new Date(now.getTime()+8*60*60*1000);
  var h=sgt.getUTCHours();
  if(h>=6&&h<8)return{label:"🌏 SYDNEY",color:"#40c8d0"};
  if(h>=8&&h<16)return{label:"🌏 ASIA/TOKYO",color:"#40c8d0"};
  if(h>=16&&h<20)return{label:"🌍 LONDON",color:"#4890f8"};
  if(h>=20&&h<21)return{label:"🤝 LDN/NY OVERLAP",color:"#e8c858"};
  if((h>=21&&h<=23)||(h>=0&&h<4))return{label:"🗽 NY SESSION",color:"#e8c858"};
  return{label:"💤 OFF-HOURS",color:"#243347"};
}

function getSessionKey(){
  var h=new Date(Date.now()+8*60*60*1000).getUTCHours();
  if(h>=6&&h<16)return"asia";
  if(h>=16&&h<21)return"london";
  return"ny";
}

export default function Auxiron(){
  var [tab,setTab]=useState("markets");
  var [mkt,setMkt]=useState(initMkt);
  var [sel,setSel]=useState("XAU/USD");
  var [cv,setCv]=useState("single");
  var [quad,setQuad]=useState(DEFAULT_QUAD);
  var [editQ,setEditQ]=useState(false);
  var [catF,setCatF]=useState("All");
  var [hl,setHl]=useState("");
  var [result,setResult]=useState<any>(null);
  var [loading,setLoading]=useState(false);
  var [err,setErr]=useState<string|null>(null);
  var [nowStr,setNowStr]=useState("");
  var [ctx,setCtx]=useState<any>(null);
  var [ctxLoading,setCtxLoading]=useState(false);
  var [ctxErr,setCtxErr]=useState<string|null>(null);
  var [lastRefresh,setLastRefresh]=useState<Date|null>(null);
  var [intel,setIntel]=useState<any>(null);
  var [intelLoading,setIntelLoading]=useState(false);
  var [intelElapsed,setIntelElapsed]=useState(0);
  var [intelErr,setIntelErr]=useState<string|null>(null);
  var [intelSession,setIntelSession]=useState("asia");
  var [edgeImages,setEdgeImages]=useState<{name:string;base64:string;mediaType:string}[]>([]);
  var [sessionLbl,setSessionLbl]=useState(getSessionLabel());
  var cycleRef=useRef(0);
  var [intelCache,setIntelCache]=useState<{[k:string]:any}>({});
  var [ctxCount,setCtxCount]=useState(0);
  var [ctxSessionKey,setCtxSessionKey]=useState("");

  useEffect(function(){
    var id=setInterval(function(){setNowStr(new Date().toUTCString().slice(0,25));},1000);
    setNowStr(new Date().toUTCString().slice(0,25));
    return function(){clearInterval(id);};
  },[]);

  useEffect(function(){
    var id=setInterval(function(){setSessionLbl(getSessionLabel());},60000);
    return function(){clearInterval(id);};
  },[]);

  useEffect(function(){
    if(!intelLoading){setIntelElapsed(0);return;}
    setIntelElapsed(0);
    var id=setInterval(function(){setIntelElapsed(function(n){return n+1;});},1000);
    return function(){clearInterval(id);};
  },[intelLoading]);

  function applyPrices(combined:any){
    if(!combined||Object.keys(combined).length===0)return;
    setMkt(function(prev){
      return prev.map(function(inst){
        var e=combined[inst.s];
        if(!e||!e.price)return inst;
        var cur=parseFloat(e.price);
        if(isNaN(cur)||cur<=0)return inst;
        var open=inst.live?inst.open:parseFloat((cur*(1+(Math.random()-0.52)*inst.v*2)).toFixed(dp(inst.b)));
        var ts=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
        var newCh=inst.ch.slice(-47).concat([{t:ts,p:parseFloat(cur.toFixed(dp(inst.b)))}]);
        return Object.assign({},inst,{cur:cur,open:open,chg:cur-open,pct:(cur-open)/open*100,ch:newCh,live:true,src:"TD"});
      });
    });
    setLastRefresh(new Date());
  }

  var fetchBatch=useCallback(function(syms:string[]){
    if(!syms||syms.length===0)return;
    var batches:string[][]=[];
    for(var i=0;i<syms.length;i+=8)batches.push(syms.slice(i,i+8));
    Promise.allSettled(batches.map(function(b){
      return fetch("/api/prices?symbol="+encodeURIComponent(b.join(","))).then(function(r){return r.json();});
    })).then(function(results){
      var combined:any={};
      results.forEach(function(r){if(r.status==="fulfilled"&&r.value&&typeof r.value==="object")Object.assign(combined,r.value);});
      applyPrices(combined);
    }).catch(function(){});
  },[]);

  var fetchChart=useCallback(function(sym:string){
    fetch("/api/prices?symbol="+encodeURIComponent(sym)+"&endpoint=timeseries&interval=30min&outputsize=48")
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.status==="error"||!d.values||!d.values.length)return;
        var ch=d.values.slice().reverse().map(function(v:any){
          return{t:new Date(v.datetime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),p:parseFloat(v.close)};
        });
        var open=ch[0]&&ch[0].p;
        setMkt(function(prev){
          return prev.map(function(inst){
            if(inst.s!==sym)return inst;
            var cur=(ch[ch.length-1]&&ch[ch.length-1].p)||inst.cur;
            var o=open||inst.open;
            return Object.assign({},inst,{ch:ch,open:o,cur:cur,chg:cur-o,pct:(cur-o)/o*100,live:true,src:"TD"});
          });
        });
      }).catch(function(){});
  },[]);

  useEffect(function(){
    fetchBatch(TIER1);
    setTimeout(function(){fetchBatch(TIER2);},5000);
    var id=setInterval(function(){
      cycleRef.current++;
      fetchBatch(TIER1);
      if(cycleRef.current%12===0)fetchBatch(TIER2);
    },600000);
    return function(){clearInterval(id);};
  },[fetchBatch]);

  useEffect(function(){fetchChart(sel);},[sel,fetchChart]);

  useEffect(function(){
    var id=setInterval(function(){
      setMkt(function(prev){
        var hasNonLive=prev.some(function(i){return!i.live;});
        if(!hasNonLive)return prev;
        return prev.map(function(inst){
          if(inst.live)return inst;
          var tick=inst.v*0.08;
          var cur=parseFloat((inst.cur*(1+(Math.random()-0.492)*tick)).toFixed(dp(inst.b)));
          var newCh=inst.ch.slice(-47).concat([{t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),p:cur}]);
          return Object.assign({},inst,{cur:cur,ch:newCh,chg:cur-inst.open,pct:(cur-inst.open)/inst.open*100});
        });
      });
    },3000);
    return function(){clearInterval(id);};
  },[]);

  function getSnap(){
    return mkt.filter(function(i){
      return["XAU/USD","WTI/USD","DX","US10Y","US02Y","VIX","SPX","NDX","EUR/USD","GBP/USD","USD/JPY"].indexOf(i.s)>=0;
    }).map(function(i){
      return i.l+": "+fmt(i.cur,i.b)+(i.cat==="Bonds"?"% yield":"")+
        " ("+(i.pct>=0?"+":"")+i.pct.toFixed(2)+"%)"+
        (i.live?"":" [SIM]");
    }).join(", ");
  }

  function handleEdgeUpload(e:React.ChangeEvent<HTMLInputElement>){
    var files=Array.from(e.target.files||[]);
    files.forEach(function(file){
      var reader=new FileReader();
      reader.onload=function(ev){
        var dataUrl=ev.target?.result as string;
        var base64=dataUrl.split(",")[1];
        var mediaType=file.type||"image/jpeg";
        setEdgeImages(function(prev){
          if(prev.length>=3)return prev;
          return prev.concat([{name:file.name,base64,mediaType}]);
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value="";
  }

  function analyze(text:string|undefined){
    var inp=(text||hl).trim();if(!inp)return;
    setLoading(true);setErr(null);setResult(null);
    var snap=getSnap();
    var userContent:any;
    if(edgeImages.length>0){
      userContent=[
        ...edgeImages.map(function(img){return{type:"image",source:{type:"base64",media_type:img.mediaType,data:img.base64}};}),
        {type:"text",text:"LIVE MARKET DATA:\n"+snap+"\n\nEVENT:\n"+inp+"\n\nEdgeFinder screenshots are attached above. Please read the COT data, Top Setups, and any positioning signals shown, then cross-analyze against the news event and fill the edgeFinderCrossCheck section in your JSON response."}
      ];
    }else{
      userContent="LIVE MARKET DATA:\n"+snap+"\n\nEVENT:\n"+inp;
    }
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3500,system:AI_SYS,messages:[{role:"user",content:userContent}]},
      function(res:any){setResult(res);setLoading(false);},
      function(e:string){setErr("Failed: "+e);setLoading(false);}
    );
  }

  function fetchCtx(){
    var sk=getSessionKey();
    var newCount=ctxSessionKey===sk?ctxCount+1:1;
    if(newCount>6){setCtxErr("Session limit reached — max 6 briefings per session (3 per half-session).");return;}
    setCtxCount(newCount);setCtxSessionKey(sk);
    setCtxLoading(true);setCtx(null);setCtxErr(null);
    var msg="LIVE MARKET DATA:\n"+getSnap()+
      "\n\nCurrent time SGT: "+new Date().toLocaleString("en-SG",{timeZone:"Asia/Singapore"})+
      "\n\nGenerate a breaking news briefing for what has happened in the last 1-2 hours. Search for the latest news right now.";
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3000,system:CTX_SYS,
       messages:[{role:"user",content:msg}],
       useWebSearch:true},
      function(res:any){setCtx(res);setLastRefresh(new Date());setCtxLoading(false);setCtxErr(null);},
      function(e:string){setCtxErr("Failed: "+e);setCtxLoading(false);}
    );
  }
    
  

  function fetchIntel(session:string,force?:boolean){
    if(!force&&intelCache[session]){setIntel(intelCache[session]);return;}
    setIntelLoading(true);setIntel(null);setIntelErr(null);
    var SESSIONS_MAP:any={
      asia:"ASIA OPEN (SGT 6am-3pm) — Sydney/Tokyo sessions, overnight moves, what moved in US/EU, London setup",
      london:"LONDON OPEN (SGT 4pm-1am) — European session, FX focus, London/NY overlap from 9pm SGT",
      ny:"NY SESSION (SGT 9pm-6am) — London/NY overlap 9pm-1am, Fed speakers, US data, Gold trade setups"
    };
    var label=SESSIONS_MAP[session]||"NY SESSION";
    var msg="LIVE MARKET DATA:\n"+getSnap()+
      "\n\nSESSION: "+label+
      "\n\nToday: "+new Date().toDateString()+
      "\n\nSearch for: latest market news this week and tonight, Gold price drivers and key levels, DXY movement and Fed outlook, JPY intervention risk and BOJ stance, geopolitical active risks, upcoming economic data this session, central bank statements, institutional positioning signals, bank forecasts for Gold."+
      "\n\nGenerate a comprehensive "+label+" intelligence report with: overnight digest, geopolitical events, dynamic market movers, Fed watch, economic events SGT times, GOLD DEEP DIVE (what moving now + buy/sell rumor detection + risk scenarios + price targets), OIL deep dive, SPX+NDX analysis, key levels, instrument bias, trade focus tonight.";
    callProxy(
      {model:"claude-sonnet-4-6",max_tokens:12000,system:INTEL_SYS,
       messages:[{role:"user",content:msg}],useWebSearch:true},
      function(res:any){setIntel(res);setIntelCache(function(p:any){var n={...p};n[session]=res;return n;});setIntelLoading(false);setIntelErr(null);},
      function(e:string){setIntelErr("Failed: "+e);setIntelLoading(false);}
    );
  }

  function toggleQuad(sym:string){
    setQuad(function(prev){
      if(prev.indexOf(sym)>=0)return prev.length>1?prev.filter(function(s){return s!==sym;}):prev;
      if(prev.length>=4)return prev.slice(1).concat([sym]);
      return prev.concat([sym]);
    });
  }

  // ── DERIVED VARS ──────────────────────────────────────
  var cfg=result?(ICFG[result.impactLevel as keyof typeof ICFG]||ICFG.NOISE):null;
  var selI=mkt.find(function(d){return d.s===sel;});
  var vixI=mkt.find(function(d){return d.s==="VIX";});
  var dxyI=mkt.find(function(d){return d.s==="DX";});
  var goldI=mkt.find(function(d){return d.s==="XAU/USD";});
  var y2=mkt.find(function(d){return d.s==="US02Y";});
  var y10=mkt.find(function(d){return d.s==="US10Y";});
  var spread=y2&&y10?parseFloat((y10.cur-y2.cur).toFixed(3)):null;
  var inverted=spread!==null&&spread<0;
  var anyLive=mkt.some(function(m){return m.live;});
  var stClr=anyLive?C.goldL:C.amber;
  var roro_score=calcROROScore(mkt);
  var roro=getROROLabel(roro_score);
  var goldBias=calcGoldBias(mkt);
  var goldBiasColor=goldBias==="BULLISH"?C.up:goldBias==="BEARISH"?C.dn:C.amber;

  var displayed=catF==="All"?mkt.filter(function(m){return m.tier<=2;}):
    catF==="Risk-On"?mkt.filter(function(m){return m.roro==="ON";}):
    catF==="Risk-Off"?mkt.filter(function(m){return m.roro==="OFF";}):
    catF==="FX"?mkt.filter(function(m){return m.cat==="Forex";}):
    catF==="Bonds"?mkt.filter(function(m){return m.cat==="Bonds";}):
    mkt.filter(function(m){return m.tier<=2;});

  const NAV=[
    {key:"markets",label:"Markets",accent:C.goldL,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <rect x="2.5" y="6" width="3" height="8" rx="1" fill={active?"#f0cc5a":"#3a5570"}/>
       <line x1="4" y1="3" x2="4" y2="6" stroke={active?"#f0cc5a":"#3a5570"} strokeWidth="1.5" strokeLinecap="round"/>
       <line x1="4" y1="14" x2="4" y2="16" stroke={active?"#f0cc5a":"#3a5570"} strokeWidth="1.5" strokeLinecap="round"/>
       <rect x="7" y="4" width="3" height="6" rx="1" fill={active?"#22d46e":"#1a3828"}/>
       <line x1="8.5" y1="2" x2="8.5" y2="4" stroke={active?"#22d46e":"#1a3828"} strokeWidth="1.5" strokeLinecap="round"/>
       <line x1="8.5" y1="10" x2="8.5" y2="12" stroke={active?"#22d46e":"#1a3828"} strokeWidth="1.5" strokeLinecap="round"/>
       <rect x="11.5" y="7" width="3" height="7" rx="1" fill={active?"#f04545":"#3a1010"}/>
       <line x1="13" y1="4.5" x2="13" y2="7" stroke={active?"#f04545":"#3a1010"} strokeWidth="1.5" strokeLinecap="round"/>
       <line x1="13" y1="14" x2="13" y2="16" stroke={active?"#f04545":"#3a1010"} strokeWidth="1.5" strokeLinecap="round"/>
     </svg>);}},
    {key:"charts",label:"Charts",accent:C.blue,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <polyline points="2,14 6,8 10,11 16,3" stroke={active?C.blue:"#3a5570"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
       <circle cx="6" cy="8" r="1.5" fill={active?C.blue:"#3a5570"}/>
       <circle cx="10" cy="11" r="1.5" fill={active?C.blue:"#3a5570"}/>
       <circle cx="16" cy="3" r="1.5" fill={active?C.blue:"#3a5570"}/>
       <line x1="2" y1="15.5" x2="16" y2="15.5" stroke={active?"#28405a":"#1e2e42"} strokeWidth="1"/>
     </svg>);}},
    {key:"session",label:"Session",accent:C.bond,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <circle cx="9" cy="9" r="6.5" stroke={active?C.bond:"#3a5570"} strokeWidth="1.5" fill="none"/>
       <line x1="9" y1="4.5" x2="9" y2="9" stroke={active?C.bond:"#3a5570"} strokeWidth="1.8" strokeLinecap="round"/>
       <line x1="9" y1="9" x2="12.2" y2="11.2" stroke={active?"#f0a020":"#3a5570"} strokeWidth="1.8" strokeLinecap="round"/>
       <circle cx="9" cy="9" r="1.2" fill={active?C.bond:"#3a5570"}/>
     </svg>);}},
    {key:"intel",label:"Intel",accent:C.gold,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <path d="M9 2L10.8 6.5H15.8L11.8 9.4L13.3 14.2L9 11.3L4.7 14.2L6.2 9.4L2.2 6.5H7.2L9 2Z"
         stroke={active?C.gold:"#3a5570"} strokeWidth="1.4" strokeLinejoin="round"
         fill={active?"rgba(212,168,67,0.15)":"none"}/>
     </svg>);}},
    {key:"filter",label:"Filter",accent:C.vix,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <path d="M2.5 4H15.5L11 9.5V14.5L7 12.5V9.5L2.5 4Z"
         stroke={active?C.vix:"#3a5570"} strokeWidth="1.4" strokeLinejoin="round"
         fill={active?"rgba(176,96,240,0.15)":"none"}/>
       <circle cx="13.5" cy="13.5" r="2.8" fill={active?C.vix:"none"} stroke={active?"none":"#3a5570"} strokeWidth="1.2"/>
       {active&&<path d="M12.3 13.5L13.2 14.4L14.8 12.6" stroke="#080e14" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>}
     </svg>);}},
  ];

  return(
    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",color:C.txt0}} className="auxiron-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;height:100%;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#1e2d40;border-radius:2px;}
        textarea:focus{outline:none;}
        button{-webkit-tap-highlight-color:transparent;cursor:pointer;font-family:inherit;}
        .tap:active{opacity:0.7;}
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.28s ease forwards;}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:0.1}} .pd{animation:pd 1.5s ease infinite;}
        @keyframes sp{to{transform:rotate(360deg)}} .sp{animation:sp 0.8s linear infinite;}
        @keyframes tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .tk{animation:tk 65s linear infinite;display:inline-block;white-space:nowrap;} .tk:hover{animation-play-state:paused;}
        .auxiron-root{display:flex;width:100%;min-height:100vh;min-height:100dvh;background:#080e14;font-family:'IBM Plex Sans',sans-serif;}
        .auxiron-sidebar{display:none;}
        .auxiron-main{flex:1;display:flex;flex-direction:column;width:100%;min-width:0;}
        .auxiron-content{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:calc(64px + env(safe-area-inset-bottom,0px));-webkit-overflow-scrolling:touch;}
        .auxiron-inner{width:100%;padding:0;}
        .auxiron-bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:300;background:#111820;padding-bottom:env(safe-area-inset-bottom,0px);}
        .auxiron-bottom-nav button{padding:10px 0 6px !important;}
        @media(max-width:480px){.auxiron-inner{font-size:13px;}}
        @media(min-width:481px) and (max-width:1023px){.auxiron-inner{max-width:100%;padding:0 4px;}.auxiron-content{padding-bottom:80px;}.auxiron-bottom-nav{height:68px;}}
        @media(min-width:1024px){
          .auxiron-sidebar{display:flex;flex-direction:column;width:240px;flex-shrink:0;position:fixed;left:0;top:0;bottom:0;z-index:200;background:#111820;border-right:1px solid #1e2d40;}
          .auxiron-main{margin-left:240px;}
          .auxiron-content{padding-bottom:0;}
          .auxiron-bottom-nav{display:none !important;}
          .auxiron-inner{max-width:100%;padding:0;}
        }
        @media(min-width:1280px){.auxiron-sidebar{width:260px;}.auxiron-main{margin-left:260px;}.auxiron-inner{max-width:960px;margin:0 auto;}}
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <div className="auxiron-sidebar">
        <div style={{padding:"16px 14px",borderBottom:"1px solid "+C.border}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:stClr,boxShadow:"0 0 8px "+stClr}} className="pd"/>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,letterSpacing:".1em",color:C.txt0}}>AUX</span>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,letterSpacing:".1em",color:C.gold}}>IRON</span>
            <span style={{fontSize:8,background:"rgba(200,168,64,0.12)",color:C.gold,padding:"2px 5px",borderRadius:3,letterSpacing:".1em",border:"1px solid rgba(200,168,64,0.22)"}}>PRO</span>
          </div>
          <div style={{fontSize:9,color:C.txt3,marginTop:2}}>{nowStr}</div>
        </div>
        <div style={{padding:"10px 14px",borderBottom:"1px solid "+C.border}}>
          {goldI&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10,color:C.gold}}>Gold</span>
              <span style={{fontSize:8,fontWeight:700,color:goldBiasColor,background:"rgba(0,0,0,0.3)",padding:"1px 5px",borderRadius:3,border:"1px solid "+goldBiasColor+"44"}}>{goldBias}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:600,color:goldI.pct>=0?C.up:C.dn,fontVariantNumeric:"tabular-nums"}}>{fmt(goldI.cur,goldI.b)}</div>
              <div style={{fontSize:9,color:goldI.pct>=0?C.up:C.dn}}>{goldI.pct>=0?"+":""}{goldI.pct.toFixed(2)}%</div>
            </div>
          </div>}
          {vixI&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontSize:10,color:C.txt2}}>VIX</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:600,color:vixClr(vixI.cur)}}>{vixI.cur.toFixed(2)}</div>
              <div style={{fontSize:9,color:C.txt3}}>{vixLbl(vixI.cur)}</div>
            </div>
          </div>}
          {dxyI&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:C.txt2}}>DXY</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:600,color:dxyI.pct>=0?C.dn:C.up}}>{dxyI.cur.toFixed(2)}</div>
              <div style={{fontSize:9,color:dxyI.pct>=0?C.dn:C.up}}>{dxyI.pct>=0?"+":""}{dxyI.pct.toFixed(2)}%</div>
            </div>
          </div>}
        </div>
        <div style={{padding:"8px 10px",flex:1,overflowY:"auto"}}>
          {NAV.map(function(item:any){
            var active=tab===item.key;
            return <button key={item.key} className="tap" onClick={function(){setTab(item.key);}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",
                background:active?"rgba(212,168,67,0.08)":"transparent",
                border:active?"1px solid rgba(212,168,67,0.22)":"1px solid transparent",
                borderRadius:9,padding:"9px 12px",marginBottom:3,textAlign:"left",transition:"all 0.12s"}}>
              <div style={{flexShrink:0,width:24,display:"flex",justifyContent:"center"}}>
                {item.icon(active)}
              </div>
              <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:active?700:500,color:active?C.txt0:C.txt2,letterSpacing:".02em"}}>{item.label}</span>
              {active&&<div style={{marginLeft:"auto",width:3,height:18,background:item.accent||C.gold,borderRadius:2}}></div>}
            </button>;
          })}
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid "+C.border,fontSize:8,color:C.txt3,letterSpacing:".06em"}}>© 2025 AUXIRON</div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="auxiron-main">

      {/* HEADER */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,padding:"10px 14px",flexShrink:0}}>
        {/* Top row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:stClr,boxShadow:"0 0 8px "+stClr}} className="pd"/>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,letterSpacing:".1em",color:C.txt0}}>AUX</span>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,letterSpacing:".1em",color:C.gold}}>IRON</span>
            <span style={{fontSize:8,background:"rgba(200,168,64,0.12)",color:C.gold,padding:"2px 6px",borderRadius:3,letterSpacing:".1em",border:"1px solid rgba(200,168,64,0.22)"}}>PRO</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {/* Session timer */}
            <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid "+sessionLbl.color+"44",borderRadius:6,padding:"3px 7px"}}>
              <span style={{fontSize:8,color:sessionLbl.color,fontWeight:600}}>{sessionLbl.label}</span>
            </div>
            {/* RORO pill */}
            <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid "+roro.color+"44",borderRadius:6,padding:"3px 8px"}}>
              <span style={{fontSize:8,fontWeight:700,color:roro.color}}>{roro.label}</span>
            </div>
            <span style={{fontSize:8,color:stClr,letterSpacing:".05em"}}>● {anyLive?"LIVE":"SIM"}</span>
          </div>
        </div>
        {/* RORO score bar */}
        <div style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
            <span style={{fontSize:7,color:"#f04040"}}>RISK-OFF</span>
            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:9,color:C.txt2}}>{roro.desc}</span>
            <span style={{fontSize:7,color:"#28cc78"}}>RISK-ON</span>
          </div>
          <div style={{height:4,background:C.bg2,borderRadius:2,overflow:"hidden",position:"relative"}}>
            <div style={{position:"absolute",left:0,width:"50%",height:"100%",background:"rgba(240,64,64,0.3)"}}/>
            <div style={{position:"absolute",right:0,width:"50%",height:"100%",background:"rgba(40,204,120,0.3)"}}/>
            <div style={{position:"absolute",left:roro_score+"%",transform:"translateX(-50%)",
              width:8,height:8,borderRadius:"50%",background:roro.color,top:-2,
              boxShadow:"0 0 6px "+roro.color}}/>
          </div>
        </div>
        {/* Quick stats */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {goldI&&<div style={{background:C.bg2,border:"1px solid rgba(200,168,64,0.2)",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.gold}}>AU</span>
            <span style={{fontSize:10,fontWeight:600,color:goldI.pct>=0?C.up:C.dn,fontVariantNumeric:"tabular-nums"}}>{fmt(goldI.cur,goldI.b)}</span>
            <span style={{fontSize:8,fontWeight:700,color:goldBiasColor}}>{goldBias}</span>
          </div>}
          {vixI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>VIX</span>
            <span style={{fontSize:10,fontWeight:600,color:vixClr(vixI.cur)}}>{vixI.cur.toFixed(2)}</span>
            <span style={{fontSize:7,color:C.txt3}}>{vixLbl(vixI.cur)}</span>
          </div>}
          {dxyI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>DXY</span>
            <span style={{fontSize:10,fontWeight:600,color:dxyI.pct>=0?C.dn:C.up}}>{dxyI.cur.toFixed(2)}</span>
          </div>}
          {spread!==null&&<div style={{background:C.bg2,border:"1px solid "+(inverted?C.dn:C.up)+"44",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>2s10s</span>
            <span style={{fontSize:10,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</span>
            <span style={{fontSize:7,color:inverted?C.dn:C.up}}>{inverted?"INV":"NRM"}</span>
          </div>}
        </div>
      </div>

      {/* TICKER */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,overflow:"hidden",height:26,display:"flex",alignItems:"center",flexShrink:0}}>
        <div className="tk">
          {mkt.filter(function(m){return m.tier<=2;}).concat(mkt.filter(function(m){return m.tier<=2;})).map(function(m,i){
            var up=m.pct>=0;
            return <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,marginRight:18}}>
              <span style={{fontSize:9,color:C.txt2}}>{m.l}</span>
              <span style={{fontSize:10,fontWeight:500,color:C.txt1,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}</span>
              <span style={{fontSize:9,color:up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}%</span>
            </span>;
          })}
        </div>
      </div>

      <div className="auxiron-content">
        <div className="auxiron-inner">

        {/* ── MARKETS ── */}
        {tab==="markets"&&<div>
          {/* Category filter */}
          <div style={{padding:"8px 12px",display:"flex",gap:5,overflowX:"auto",borderBottom:"1px solid "+C.border}}>
            {FILTER_CATS.map(function(c){
              var a=catF===c;
              return <button key={c} className="tap" onClick={function(){setCatF(c);}}
                style={{background:a?"rgba(200,168,64,0.12)":C.bg2,border:a?"1px solid rgba(200,168,64,0.38)":"1px solid "+C.border,
                  color:a?C.goldL:C.txt2,borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:500,whiteSpace:"nowrap"}}>
                {c}
              </button>;
            })}
          </div>

          {/* RORO reference cards */}
          {(catF==="All"||catF==="Risk-On"||catF==="Risk-Off")&&<div style={{padding:"8px 12px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <div style={{background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.2)",borderRadius:9,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.up,fontWeight:700,marginBottom:4,letterSpacing:".06em"}}>🟢 RISK-ON</div>
              <div style={{fontSize:9,color:C.txt2,lineHeight:1.7}}>US Equities ▲<br/>Oil ▲ · AUD ▲<br/>GBP/JPY ▲</div>
            </div>
            <div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:9,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.dn,fontWeight:700,marginBottom:4,letterSpacing:".06em"}}>🔴 RISK-OFF</div>
              <div style={{fontSize:9,color:C.txt2,lineHeight:1.7}}>Gold ▲ · JPY ▲<br/>DXY ▲ · Bonds ▲<br/>VIX ▲</div>
            </div>
          </div>}

          {/* Yield curve — simplified */}
          {(catF==="All"||catF==="Bonds")&&spread!==null&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border,marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg1,border:"1px solid "+(inverted?"rgba(240,64,64,0.25)":"rgba(40,204,120,0.2)"),borderRadius:8,padding:"9px 12px"}}>
              <div>
                <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:2}}>YIELD CURVE 2s10s</div>
                <div style={{fontSize:14,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,fontWeight:700,color:inverted?C.dn:C.up}}>{inverted?"▼ INVERTED":"▲ NORMAL"}</div>
                {y2&&y10&&<div style={{fontSize:9,color:C.txt3,marginTop:2}}>2Y {y2.cur.toFixed(3)}% · 10Y {y10.cur.toFixed(3)}%</div>}
              </div>
            </div>
          </div>}

          {/* VIX — simplified */}
          {(catF==="All"||catF==="Risk-Off")&&vixI&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"10px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:2}}>VIX — FEAR INDEX</div>
                <div style={{fontSize:22,fontWeight:700,color:vixClr(vixI.cur),fontFamily:"'Syne',sans-serif"}}>{vixI.cur.toFixed(2)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:vixClr(vixI.cur)}}>{vixLbl(vixI.cur)}</div>
                <div style={{fontSize:10,color:C.txt2,marginTop:2}}>{vixI.pct>=0?"+":""}{vixI.pct.toFixed(2)}% today</div>
              </div>
            </div>
          </div>}

          {/* Instrument list */}
          <div style={{padding:"8px 12px",display:"grid",gap:5}}>
            {displayed.filter(function(m){return m.s!=="VIX";}).map(function(m){
              var up=m.pct>=0;var isBond=m.cat==="Bonds";
              var isGold=m.s==="XAU/USD";
              var lc=isBond?C.bond:up?C.up:C.dn;
              var roroColor=m.roro==="ON"?C.up:m.roro==="OFF"?C.dn:C.txt3;
              return <div key={m.s}
                style={{background:C.bg1,border:"1px solid "+(isGold?"rgba(200,168,64,0.25)":C.border),
                  borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:15,fontWeight:600,color:isGold?C.goldL:C.txt0}}>{m.l}</span>
                    <span style={{fontSize:7,fontWeight:700,color:roroColor,background:"rgba(0,0,0,0.3)",padding:"1px 5px",borderRadius:3}}>
                      {m.roro==="ON"?"R-ON":m.roro==="OFF"?"R-OFF":"FX"}
                    </span>
                    {isGold&&<span style={{fontSize:8,fontWeight:700,color:goldBiasColor,background:"rgba(0,0,0,0.3)",padding:"1px 5px",borderRadius:3,border:"1px solid "+goldBiasColor+"44"}}>{goldBias}</span>}
                  </div>
                  <div style={{fontSize:10,color:C.txt1,marginTop:1,display:"flex",alignItems:"center",gap:5}}>
                    <span>{m.s}</span>
                    {m.live?<span style={{color:C.up,fontSize:8}}>● LIVE</span>:<span style={{color:C.txt3,fontSize:8}}>SIM</span>}
                    {m.tier===1&&<span style={{color:C.gold,fontSize:8}}>10m</span>}
                    {m.tier===2&&<span style={{color:C.txt3,fontSize:8}}>2h</span>}
                  </div>
                </div>
                <div style={{width:55,height:22}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.ch.slice(-14)} margin={{top:1,right:0,bottom:1,left:0}}>
                      <Line type="linear" dataKey="p" stroke={lc} strokeWidth={1.4} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{textAlign:"right",minWidth:80}}>
                  <div style={{fontSize:15,fontWeight:600,color:isBond?C.bond:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                  <div style={{fontSize:12,fontWeight:600,marginTop:1,fontVariantNumeric:"tabular-nums",color:up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}% {up?"▲":"▼"}</div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* ── CHARTS ── */}
        {tab==="charts"&&<div className="fu">
          <div style={{padding:"8px 12px",display:"flex",gap:5,borderBottom:"1px solid "+C.border,overflowX:"auto",alignItems:"center"}}>
            {[["single","SINGLE"],["quad","QUAD"]].map(function(pair){
              return <button key={pair[0]} className="tap" onClick={function(){setCv(pair[0]);}}
                style={{background:cv===pair[0]?"rgba(200,168,64,0.12)":C.bg2,border:cv===pair[0]?"1px solid rgba(200,168,64,0.4)":"1px solid "+C.border,
                  color:cv===pair[0]?C.goldL:C.txt2,borderRadius:20,padding:"4px 12px",fontSize:9,fontWeight:500,whiteSpace:"nowrap"}}>{pair[1]}</button>;
            })}
            {cv==="quad"&&<button className="tap" onClick={function(){setEditQ(!editQ);}}
              style={{background:editQ?"rgba(72,144,248,0.12)":C.bg2,border:editQ?"1px solid rgba(72,144,248,0.4)":"1px solid "+C.border,
                color:editQ?C.blue:C.txt2,borderRadius:20,padding:"4px 12px",fontSize:9,marginLeft:"auto"}}>✎ EDIT</button>}
          </div>
          {cv==="quad"&&editQ&&<div style={{padding:"10px 12px",background:C.bg2,borderBottom:"1px solid "+C.border}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:7}}>PICK UP TO 4 — {quad.length}/4</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,maxHeight:160,overflowY:"auto"}}>
              {mkt.map(function(m){
                var isSel=quad.indexOf(m.s)>=0;
                return <button key={m.s} className="tap" onClick={function(){toggleQuad(m.s);}}
                  style={{background:isSel?"rgba(200,168,64,0.15)":C.bg1,border:isSel?"1px solid rgba(200,168,64,0.45)":"1px solid "+C.border,
                    color:isSel?C.goldL:C.txt2,borderRadius:6,padding:"3px 8px",fontSize:9}}>{m.l}</button>;
              })}
            </div>
          </div>}
          {cv==="single"&&<div style={{padding:"7px 12px",display:"flex",gap:4,overflowX:"auto",borderBottom:"1px solid "+C.border}}>
            {mkt.filter(function(m){return m.tier<=2;}).map(function(m){
              var isSel=sel===m.s;
              return <button key={m.s} className="tap" onClick={function(){setSel(m.s);fetchChart(m.s);}}
                style={{background:isSel?"rgba(200,168,64,0.12)":C.bg2,border:isSel?"1px solid rgba(200,168,64,0.4)":"1px solid "+C.border,
                  color:isSel?C.goldL:C.txt2,borderRadius:20,padding:"4px 10px",fontSize:8,fontWeight:isSel?500:400,whiteSpace:"nowrap"}}>{m.l}</button>;
            })}
          </div>}
          {cv==="single"&&selI&&<div style={{padding:"12px"}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"14px"}}>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:2}}>{selI.s} · {selI.cat} · {selI.live?"● LIVE":"SIM"}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:C.txt0,fontFamily:"'IBM Plex Mono',monospace",fontVariantNumeric:"tabular-nums"}}>{fmt(selI.cur,selI.b)}{selI.cat==="Bonds"?"%":""}</div>
                <div style={{display:"flex",gap:10,marginTop:3}}>
                  <span style={{fontSize:13,color:selI.pct>=0?C.up:C.dn}}>{selI.pct>=0?"+":""}{selI.pct.toFixed(2)}%</span>
                  <span style={{fontSize:10,color:C.txt2}}>Open {fmt(selI.open,selI.b)}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={185}>
                <AreaChart data={selI.ch} margin={{top:4,right:4,bottom:4,left:0}}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selI.pct>=0?C.up:C.dn} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={selI.pct>=0?C.up:C.dn} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="t" tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} interval={8}/>
                  <YAxis domain={["auto","auto"]} padding={{top:8,bottom:8}} tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} width={56} tickFormatter={function(v){return fmt(v,selI.b);}}/>
                  <Tooltip content={<ChartTip/>}/>
                  <ReferenceLine y={selI.open} stroke={C.border2} strokeDasharray="3 3"/>
                  <Area type="linear" dataKey="p" stroke={selI.pct>=0?C.up:C.dn} strokeWidth={2} fill="url(#cg)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginTop:10}}>
                {[
                  ["HIGH",Math.max.apply(null,selI.ch.map(function(d:any){return d.p;})),C.up],
                  ["LOW", Math.min.apply(null,selI.ch.map(function(d:any){return d.p;})),C.dn],
                  ["OPEN",selI.open,C.txt1],
                  ["RANGE",((Math.max.apply(null,selI.ch.map(function(d:any){return d.p;}))-Math.min.apply(null,selI.ch.map(function(d:any){return d.p;})))/selI.open*100).toFixed(2)+"%",C.amber],
                ].map(function(item){
                  return <div key={item[0] as string} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"6px 7px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:1}}>{item[0] as string}</div>
                    <div style={{fontSize:10,fontWeight:500,color:item[2] as string,fontVariantNumeric:"tabular-nums"}}>{typeof item[1]==="string"?item[1]:fmt(item[1],selI.b)}</div>
                  </div>;
                })}
              </div>
            </div>
          </div>}
          {cv==="quad"&&<div style={{padding:"12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {quad.map(function(sym){
              var m=mkt.find(function(d){return d.s===sym;});if(!m)return null;
              var up=m.pct>=0;var isBond=m.cat==="Bonds";
              var lc=isBond?C.bond:up?C.up:C.dn;
              var gid="g"+sym.replace(/[^a-z0-9]/gi,"_");
              return <div key={sym} className="tap" onClick={function(){setSel(sym);setCv("single");fetchChart(sym);}}
                style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"11px"}}>
                <div style={{fontSize:9,color:C.txt2,marginBottom:1}}>{m.l}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                <div style={{fontSize:10,color:up?C.up:C.dn,marginBottom:5}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                <ResponsiveContainer width="100%" height={72}>
                  <AreaChart data={m.ch} margin={{top:2,right:2,bottom:2,left:2}}>
                    <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={lc} stopOpacity={0.12}/><stop offset="95%" stopColor={lc} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="2 2" stroke={C.border} vertical={false}/>
                    <YAxis domain={["auto","auto"]} hide/>
                    <ReferenceLine y={m.open} stroke={C.border2} strokeDasharray="2 2"/>
                    <Area type="linear" dataKey="p" stroke={lc} strokeWidth={1.8} fill={"url(#"+gid+")"} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>;
            })}
            {Array.from({length:Math.max(0,4-quad.length)}).map(function(_,i){
              return <div key={"e"+i} className="tap" onClick={function(){setEditQ(true);}}
                style={{background:C.bg1,border:"1px dashed "+C.border,borderRadius:10,padding:"11px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:130}}>
                <span style={{fontSize:11,color:C.txt3}}>+ ADD</span>
              </div>;
            })}
          </div>}
        </div>}

        {/* ── SESSION BRIEFING ── */}
        {tab==="session"&&<div style={{padding:"12px"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>SESSION BRIEFING</div>
              <div style={{fontSize:9,color:C.txt2,marginTop:1}}>{nowStr}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:9,color:ctxCount>=6?C.dn:C.txt3}}>{ctxCount}/6</span>
              <button className="tap" onClick={fetchCtx} disabled={ctxLoading||ctxCount>=6}
                style={{background:ctxLoading||ctxCount>=6?C.bg2:C.gold,color:ctxLoading||ctxCount>=6?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"7px 14px",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                {ctxLoading?[<div key="sp" className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"GENERATING…"]:ctxCount>=6?"◉ LIMIT REACHED":"◉ GENERATE"}
              </button>
            </div>
          </div>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:8}}>LIVE SNAPSHOT</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {["XAU/USD","DX","US10Y","VIX","SPX","NDX","WTI/USD","GBP/USD"].map(function(sym){
                var m=mkt.find(function(d){return d.s===sym;});if(!m)return null;
                var up=m.pct>=0;var isBond=m.cat==="Bonds";var isVix=m.s==="VIX";
                return <div key={sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg2,borderRadius:7,padding:"7px 10px",border:"1px solid "+C.border}}>
                  <div>
                    <div style={{fontSize:9,color:C.txt2}}>{m.l}</div>
                    <div style={{fontSize:13,fontWeight:500,color:isVix?vixClr(m.cur):isBond?C.bond:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                  </div>
                  <div style={{fontSize:11,fontWeight:500,color:isVix?(up?C.dn:C.up):up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                </div>;
              })}
            </div>
          </div>
          {spread!==null&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em"}}>YIELD CURVE 2s10s</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</span>
                <span style={{fontSize:11,fontWeight:700,color:inverted?C.dn:C.up,background:inverted?"rgba(240,64,64,0.1)":"rgba(40,204,120,0.1)",border:"1px solid "+(inverted?C.dn:C.up)+"44",borderRadius:5,padding:"2px 7px"}}>{inverted?"▼ INVERTED":"▲ NORMAL"}</span>
              </div>
            </div>
          </div>}
          {ctxErr&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {ctxErr}</div>}
          {!ctx&&!ctxLoading&&!ctxErr&&<div style={{textAlign:"center",padding:"30px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
            <div style={{fontSize:11,color:C.txt3,letterSpacing:".1em"}}>TAP GENERATE FOR AI SESSION BRIEFING</div>
            <div style={{fontSize:10,color:C.txt3,marginTop:4,opacity:0.6}}>DXY dominance · Money flow · Weekly outlook · Risk-On/Off analysis</div>
          </div>}
          {ctx&&<div className="fu">
            {/* Regime bar */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5,
                    color:SC[ctx.sessionBias as keyof typeof SC]||C.txt1,
                    background:(SC[ctx.sessionBias as keyof typeof SC]||C.txt1)+"18",
                    border:"1px solid "+(SC[ctx.sessionBias as keyof typeof SC]||C.txt1)+"44"}}>
                    {ctx.sessionBias}
                  </span>
                  {ctx.goldBias&&<span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5,
                    color:DC[ctx.goldBias as keyof typeof DC]||C.txt1,
                    background:(DC[ctx.goldBias as keyof typeof DC]||C.txt1)+"18",
                    border:"1px solid "+(DC[ctx.goldBias as keyof typeof DC]||C.txt1)+"44"}}>
                    AU {ctx.goldBias}
                  </span>}
                </div>
                {lastRefresh&&<span style={{fontSize:9,color:C.txt3}}>{lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
              </div>
              {ctx.sessionSummary&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{ctx.sessionSummary}</div>}
              {ctx.regimeUpdate&&!ctx.sessionSummary&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{ctx.regimeUpdate}</div>}
            </div>
            {/* Breaking news */}
            {ctx.breaking&&ctx.breaking.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>⚡ BREAKING</div>
              {ctx.breaking.map(function(item:any,i:number){
                var ic=item.impact&&item.impact.includes("BULLISH")?C.up:item.impact&&item.impact.includes("BEARISH")?C.dn:item.impact==="RISK-OFF"?C.dn:item.impact==="RISK-ON"?C.up:C.amber;
                var tc=item.typeColor||C.blue;
                return <div key={i} style={{background:C.bg1,border:"1px solid "+ic+"33",borderLeft:"3px solid "+ic,borderRadius:9,padding:"11px 13px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:9,fontWeight:700,color:tc,background:tc+"18",padding:"1px 6px",borderRadius:3}}>{item.type}</span>
                      <span style={{fontSize:9,color:C.txt3}}>{item.time}</span>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:ic,background:ic+"18",padding:"2px 7px",borderRadius:4,border:"1px solid "+ic+"44"}}>{item.impact}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:C.txt0,lineHeight:1.45,marginBottom:6}}>{item.headline}</div>
                  <div style={{fontSize:12,color:C.txt1,lineHeight:1.7,marginBottom:6}}>{item.detail}</div>
                  {item.goldReaction&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px",marginBottom:5}}>
                    <span style={{fontSize:9,color:C.gold,fontWeight:600}}>Gold: </span>
                    <span style={{fontSize:10,color:C.txt0}}>{item.goldReaction}</span>
                  </div>}
                  {item.tradingNote&&<div style={{borderLeft:"2px solid "+ic,paddingLeft:8}}>
                    <span style={{fontSize:9,color:ic,fontWeight:600}}>NOW: </span>
                    <span style={{fontSize:10,color:C.txt0}}>{item.tradingNote}</span>
                  </div>}
                </div>;
              })}
            </div>}
            {/* Market moves */}
            {ctx.marketMoves&&ctx.marketMoves.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>MARKET MOVES</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {ctx.marketMoves.map(function(m:any,i:number){
                  var up=m.direction==="up";
                  return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.txt0}}>{m.symbol}</span>
                      <span style={{fontSize:11,fontWeight:600,color:up?C.up:C.dn}}>{m.change}</span>
                    </div>
                    {m.from&&m.to&&<div style={{fontSize:9,color:C.txt3,marginBottom:2}}>{m.from} → {m.to}</div>}
                    {m.note&&<div style={{fontSize:10,color:C.txt2,lineHeight:1.4}}>{m.note}</div>}
                  </div>;
                })}
              </div>
            </div>}
            {/* Next up */}
            {ctx.nextUp&&ctx.nextUp.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>NEXT UP</div>
              {ctx.nextUp.map(function(n:any,i:number){
                var ic=n.impact==="HIGH"?C.dn:C.amber;
                return <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<ctx.nextUp.length-1?"1px solid "+C.border:"none",alignItems:"flex-start"}}>
                  <span style={{fontSize:10,color:C.gold,flexShrink:0,minWidth:50,fontWeight:600}}>{n.time}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.txt0,marginBottom:2}}>{n.event}</div>
                    {n.note&&<div style={{fontSize:10,color:C.txt2,lineHeight:1.4}}>{n.note}</div>}
                  </div>
                  <span style={{fontSize:8,fontWeight:700,color:ic,flexShrink:0}}>{n.impact}</span>
                </div>;
              })}
            </div>}
          </div>}
        </div>}

        {/* ── INTELLIGENCE ── */}
        {tab==="intel"&&(
          <div style={{padding:"12px"}} className="fu">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>MARKET INTELLIGENCE</div>
                
              </div>
            </div>
            <div style={{display:"grid",gap:6,marginBottom:12}}>
              {[
                {key:"asia",icon:"🌏",label:"ASIA OPEN",time:"6am–3pm SGT",color:C.bond,grad:"linear-gradient(135deg,rgba(64,200,208,0.12),rgba(64,200,208,0.04))",bdr:"rgba(64,200,208,0.3)"},
                {key:"london",icon:"🌍",label:"LONDON OPEN",time:"4pm–1am SGT",color:C.blue,grad:"linear-gradient(135deg,rgba(72,144,248,0.12),rgba(72,144,248,0.04))",bdr:"rgba(72,144,248,0.3)"},
                {key:"ny",icon:"🗽",label:"NY SESSION",time:"9pm–6am SGT",color:C.goldL,grad:"linear-gradient(135deg,rgba(200,168,64,0.15),rgba(200,168,64,0.04))",bdr:"rgba(200,168,64,0.35)"}
              ].map(function(s){
                var a=intelSession===s.key&&intel;
                var ld=intelSession===s.key&&intelLoading;
                var cached=!!intelCache[s.key];
                return <button key={s.key} className="tap" onClick={function(){setIntelSession(s.key);fetchIntel(s.key);}}
                  style={{background:(a||ld)?s.grad:C.bg1,border:"1px solid "+((a||ld)?s.bdr:C.border),borderRadius:10,padding:"10px 14px",textAlign:"left",width:"100%"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <span style={{fontSize:17}}>{s.icon}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:(a||ld)?s.color:C.txt0}}>{s.label}</div>
                        <div style={{fontSize:9,color:(a||ld)?s.color:C.txt2}}>{s.time}</div>
                      </div>
                    </div>
                    <span style={{fontSize:10,color:C.txt3}}>{ld?"...":a?"✓":"→"}</span>
                  </div>
                </button>;
              })}
            </div>
            {intelLoading&&(
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"26px 20px",textAlign:"center",marginBottom:10}}>
                <div className="sp" style={{width:22,height:22,border:"3px solid "+C.border2,borderTopColor:C.gold,borderRadius:"50%",margin:"0 auto 10px"}}></div>
                <div style={{fontSize:11,color:C.goldL,letterSpacing:".08em",marginBottom:3}}>SEARCHING WEB + GENERATING</div>
                <div style={{fontSize:9,color:C.txt2,marginBottom:6}}>Live news · Sector flows · Rumor detection</div>
                <div style={{fontSize:10,color:C.txt3,fontVariantNumeric:"tabular-nums"}}>
                  {intelElapsed<5?"Starting up…":intelElapsed<15?"Searching the web…":intelElapsed<30?"Reading market data…":"Generating report…"}
                  <span style={{color:C.gold,marginLeft:6,fontWeight:600}}>{intelElapsed}s</span>
                </div>
              </div>
            )}
            {intelErr&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {intelErr}</div>}
            {!intel&&!intelLoading&&!intelErr&&(
              <div style={{textAlign:"center",padding:"36px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,marginBottom:10,opacity:0.2}}>⬟</div>
                <div style={{fontSize:12,color:C.txt2,letterSpacing:".08em",marginBottom:4}}>SELECT A SESSION ABOVE</div>
                <div style={{fontSize:10,color:C.txt3}}>Gold · Commodities · Indices · Rumor Detection</div>
              </div>
            )}
            {intel&&!intelLoading&&(
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
                <button className="tap" onClick={function(){if(window.confirm("Regenerate Intel report for this session?"))fetchIntel(intelSession,true);}}
                  style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"4px 11px",color:C.txt2,fontSize:9}}>↻ Regenerate</button>
              </div>)}
            {intel&&!intelLoading&&(
              <div className="fu">
                <div style={{background:"linear-gradient(135deg,rgba(200,168,64,0.12),rgba(200,168,64,0.04))",border:"1px solid rgba(200,168,64,0.3)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontSize:10,color:C.goldL,fontWeight:600,marginBottom:4}}>{intel.session} · {intel.generatedAt}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.txt0,lineHeight:1.55}}>{intel.headline}</div>
                  {intel.marketRegime&&<div style={{marginTop:6,display:"inline-block",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:"rgba(0,0,0,0.3)",color:intel.marketRegime==="RISK-OFF"?C.dn:intel.marketRegime==="RISK-ON"?C.up:C.amber,border:"1px solid "+(intel.marketRegime==="RISK-OFF"?C.dn:intel.marketRegime==="RISK-ON"?C.up:C.amber)+"44"}}>{intel.marketRegime}</div>}
                  {intel.regimeDrivers&&<div style={{fontSize:12,color:C.txt1,lineHeight:1.7,marginTop:6}}>{intel.regimeDrivers}</div>}
                  {intel.executiveSummary&&<div style={{fontSize:12,color:C.txt0,lineHeight:1.8,marginTop:8,paddingTop:8,borderTop:"1px solid rgba(200,168,64,0.15)"}}>{intel.executiveSummary}</div>}
                </div>
                {intel.weeklyContext&&(
                  <div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.22)",borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{fontSize:10,color:C.blue,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>📅 THIS WEEK IN MARKETS</div>
                    <div style={{fontSize:12,color:C.txt0,lineHeight:1.8,marginBottom:intel.weeklyContext.biggestMove||intel.weeklyContext.setupForNext?8:0}}>{intel.weeklyContext.summary}</div>
                    {intel.weeklyContext.biggestMove&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 9px",marginBottom:6}}>
                      <span style={{fontSize:9,color:C.gold,fontWeight:600}}>BIGGEST MOVE: </span>
                      <span style={{fontSize:11,color:C.txt0}}>{intel.weeklyContext.biggestMove}</span>
                    </div>}
                    {intel.weeklyContext.setupForNext&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 9px"}}>
                      <span style={{fontSize:9,color:C.blue,fontWeight:600}}>NEXT WEEK SETUP: </span>
                      <span style={{fontSize:11,color:C.txt0}}>{intel.weeklyContext.setupForNext}</span>
                    </div>}
                  </div>
                )}
                {intel.overnightDigest&&(
                  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>🌙 OVERNIGHT DIGEST</div>
                    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8,marginBottom:8}}>{intel.overnightDigest}</div>
                    {intel.geopolitical&&intel.geopolitical.length>0&&(
                      <div>
                        <div style={{fontSize:9,color:C.amber,letterSpacing:".08em",fontWeight:600,marginBottom:5}}>⚡ GEOPOLITICAL</div>
                        {intel.geopolitical.map(function(g:string,i:number){
                          return <div key={i} style={{display:"flex",gap:7,padding:"5px 0",borderBottom:i<intel.geopolitical.length-1?"1px solid "+C.border:"none"}}>
                            <span style={{color:C.dn,flexShrink:0}}>→</span>
                            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.65}}>{g}</span>
                          </div>;
                        })}
                      </div>
                    )}
                  </div>
                )}
                {intel.dynamicMovers&&intel.dynamicMovers.length>0&&(
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:C.goldL,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>📊 TODAY'S MARKET MOVERS</div>
                    <div style={{display:"grid",gap:5}}>
                      {intel.dynamicMovers.map(function(m:any,i:number){
                        var isUp=m.dir==="BULLISH";var cl=isUp?C.up:C.dn;
                        return <div key={i} style={{background:C.bg1,border:"1px solid "+(isUp?"rgba(40,204,120,0.18)":"rgba(240,64,64,0.18)"),borderRadius:9,padding:"10px 12px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0}}>{m.symbol}</span>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:12,fontWeight:600,color:C.txt0}}>{m.price}</div>
                              <div style={{fontSize:10,color:cl,fontWeight:600}}>{m.change}</div>
                            </div>
                          </div>
                          <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{m.why}</div>
                        </div>;
                      })}
                    </div>
                  </div>
                )}
                {intel.fedWatch&&(
                  <div style={{background:C.bg1,border:"1px solid rgba(72,144,248,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{fontSize:10,color:C.blue,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>🏛 FED WATCH{intel.fedWatch.speaker&&intel.fedWatch.speaker!=="NONE"?" · "+intel.fedWatch.speaker:""}</div>
                    <div style={{background:C.bg2,borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                      <div style={{fontSize:12,fontWeight:500,color:C.txt0,lineHeight:1.55,marginBottom:3}}>"{intel.fedWatch.statement}"</div>
                      <div style={{fontSize:11,color:C.blue}}>{intel.fedWatch.marketRead}</div>
                    </div>
                  </div>
                )}
                {intel.gold&&(
                  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.gold}}>📦 GOLD DEEP DIVE</div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.txt0}}>{intel.gold.price}</div>
                        <div style={{fontSize:10,color:C.up,fontWeight:600}}>{intel.gold.chg}</div>
                      </div>
                    </div>
                    {intel.gold.rumor&&(
                      <div style={{background:"rgba(184,88,240,0.07)",border:"1px solid rgba(184,88,240,0.25)",borderRadius:7,padding:"9px 11px",marginBottom:7}}>
                        <div style={{fontSize:10,color:C.vix,fontWeight:600,marginBottom:4}}>📡 {intel.gold.rumor.signal}</div>
                        <div style={{fontSize:11,color:C.txt0,lineHeight:1.55,marginBottom:4}}>{intel.gold.rumor.analysis}</div>
                        <div style={{fontSize:10,color:C.blue,lineHeight:1.5}}>📚 {intel.gold.rumor.analog}</div>
                      </div>
                    )}
                    {intel.gold.drivers&&intel.gold.drivers.map(function(d:string,i:number){
                      return <div key={i} style={{display:"flex",gap:7,padding:"5px 0",borderBottom:i<intel.gold.drivers.length-1?"1px solid "+C.border:"none"}}>
                        <span style={{color:C.gold}}>{i+1}</span>
                        <span style={{fontSize:11,color:C.txt0,lineHeight:1.5}}>{d}</span>
                      </div>;
                    })}
                    {intel.gold.scenarios&&(
                      <div style={{marginTop:8}}>
                        <div style={{fontSize:9,color:C.amber,fontWeight:600,marginBottom:5}}>RISK SCENARIOS</div>
                        {intel.gold.scenarios.map(function(sc:any,i:number){
                          return <div key={i} style={{background:C.bg2,borderRadius:6,padding:"6px 9px",marginBottom:3}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                              <span style={{fontSize:11,fontWeight:600,color:C.txt0}}>{sc.s}</span>
                              <span style={{fontSize:10,color:C.gold,fontWeight:600}}>{sc.p}% · {sc.target}</span>
                            </div>
                            <div style={{fontSize:10,color:C.txt2}}>Trigger: {sc.trigger}</div>
                          </div>;
                        })}
                      </div>
                    )}
                    {intel.gold.note&&(
                      <div style={{marginTop:8,background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.2)",borderRadius:6,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:C.up,marginBottom:2}}>◈ TRADER NOTE</div>
                        <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{intel.gold.note}</div>
                      </div>
                    )}
                  </div>
                )}
                {intel.oil&&(
                  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.amber}}>🛢 OIL DEEP DIVE</div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.txt0}}>{intel.oil.price}</div>
                        <div style={{fontSize:10,color:C.up,fontWeight:600}}>{intel.oil.chg}</div>
                      </div>
                    </div>
                    {intel.oil.rumor&&(
                      <div style={{background:"rgba(184,88,240,0.07)",border:"1px solid rgba(184,88,240,0.25)",borderRadius:7,padding:"9px 11px",marginBottom:7}}>
                        <div style={{fontSize:10,color:C.vix,fontWeight:600,marginBottom:4}}>📡 {intel.oil.rumor.signal}</div>
                        <div style={{fontSize:11,color:C.txt0,lineHeight:1.55,marginBottom:4}}>{intel.oil.rumor.analysis}</div>
                        <div style={{fontSize:10,color:C.blue,lineHeight:1.5}}>📚 {intel.oil.rumor.analog}</div>
                      </div>
                    )}
                    {intel.oil.drivers&&intel.oil.drivers.map(function(d:string,i:number){
                      return <div key={i} style={{display:"flex",gap:7,padding:"5px 0",borderBottom:i<intel.oil.drivers.length-1?"1px solid "+C.border:"none"}}>
                        <span style={{color:C.amber}}>{i+1}</span>
                        <span style={{fontSize:11,color:C.txt0,lineHeight:1.5}}>{d}</span>
                      </div>;
                    })}
                    {intel.oil.note&&(
                      <div style={{marginTop:8,background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.2)",borderRadius:6,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:C.up,marginBottom:2}}>◈ TRADER NOTE</div>
                        <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{intel.oil.note}</div>
                      </div>
                    )}
                  </div>
                )}
                {intel.spx&&(
                  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.up}}>📈 SPX ANALYSIS</div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.txt0}}>{intel.spx.price}</div>
                        <div style={{fontSize:10,color:intel.spx.chg&&intel.spx.chg.startsWith("+")?C.up:C.dn,fontWeight:600}}>{intel.spx.chg}</div>
                      </div>
                    </div>
                    {intel.spx.what&&<div style={{fontSize:11,color:C.txt0,lineHeight:1.65,marginBottom:7}}>{intel.spx.what}</div>}
                    {intel.spx.megacaps&&(
                      <div style={{marginBottom:7}}>
                        <div style={{fontSize:9,color:C.blue,fontWeight:600,marginBottom:5}}>TOP MEGA-CAPS</div>
                        {intel.spx.megacaps.map(function(m:any,i:number){
                          return <div key={i} style={{background:C.bg2,borderRadius:6,padding:"6px 9px",marginBottom:3}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                              <span style={{fontSize:11,fontWeight:700,color:C.txt0}}>{m.t}</span>
                              <span style={{fontSize:10,fontWeight:600,color:m.m&&m.m.startsWith("+")?C.up:C.dn}}>{m.m}</span>
                            </div>
                            <div style={{fontSize:10,color:C.txt1}}>{m.why}</div>
                          </div>;
                        })}
                      </div>
                    )}
                    {intel.spx.sectors&&(
                      <div style={{marginBottom:7}}>
                        <div style={{fontSize:9,color:C.amber,fontWeight:600,marginBottom:5}}>SECTOR ROTATION</div>
                        {intel.spx.sectors.map(function(s:any,i:number){
                          return <div key={i} style={{background:C.bg2,borderRadius:6,padding:"6px 9px",marginBottom:3}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                              <span style={{fontSize:11,fontWeight:600,color:C.txt0}}>{s.f==="IN"?"▲ ":"▼ "}{s.s}</span>
                              <span style={{fontSize:10,fontWeight:600,color:s.c&&s.c.startsWith("+")?C.up:C.dn}}>{s.c}</span>
                            </div>
                            <div style={{fontSize:10,color:C.txt2}}>{s.r}</div>
                          </div>;
                        })}
                      </div>
                    )}
                    {intel.spx.note&&(
                      <div style={{background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.2)",borderRadius:6,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:C.up,marginBottom:2}}>◈ TRADER NOTE</div>
                        <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{intel.spx.note}</div>
                      </div>
                    )}
                  </div>
                )}
                {intel.ndx&&(
                  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.blue}}>📈 NDX ANALYSIS</div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.txt0}}>{intel.ndx.price}</div>
                        <div style={{fontSize:10,color:intel.ndx.chg&&intel.ndx.chg.startsWith("+")?C.up:C.dn,fontWeight:600}}>{intel.ndx.chg}</div>
                      </div>
                    </div>
                    {intel.ndx.what&&<div style={{fontSize:11,color:C.txt0,lineHeight:1.65,marginBottom:7}}>{intel.ndx.what}</div>}
                    {intel.ndx.tech&&(
                      <div style={{marginBottom:7}}>
                        <div style={{fontSize:9,color:C.blue,fontWeight:600,marginBottom:5}}>TECH BREAKDOWN</div>
                        {intel.ndx.tech.map(function(t:any,i:number){
                          return <div key={i} style={{background:C.bg2,borderRadius:6,padding:"6px 9px",marginBottom:3}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                              <span style={{fontSize:11,fontWeight:600,color:C.txt0}}>{t.sub}</span>
                              <span style={{fontSize:10,fontWeight:600,color:t.perf&&t.perf.startsWith("+")?C.up:C.dn}}>{t.perf}</span>
                            </div>
                            <div style={{fontSize:9,color:C.blue,marginBottom:2}}>{t.leaders}</div>
                            <div style={{fontSize:10,color:C.txt1}}>{t.note}</div>
                          </div>;
                        })}
                      </div>
                    )}
                    {intel.ndx.note&&(
                      <div style={{background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.2)",borderRadius:6,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:C.up,marginBottom:2}}>◈ TRADER NOTE</div>
                        <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{intel.ndx.note}</div>
                      </div>
                    )}
                  </div>
                )}
                {intel.dxy&&(
  <div style={{background:C.bg1,border:"1px solid rgba(72,144,248,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.blue}}>DXY — GOLD DRIVER</div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:13,fontWeight:600,color:C.txt0}}>{intel.dxy.price}</div>
        <div style={{fontSize:10,color:intel.dxy.chg&&intel.dxy.chg.startsWith("-")?C.up:C.dn,fontWeight:600}}>{intel.dxy.chg}</div>
      </div>
    </div>
    <div style={{fontSize:11,color:C.txt0,lineHeight:1.65,marginBottom:6}}>{intel.dxy.analysis}</div>
    {intel.dxy.note&&<div style={{background:"rgba(72,144,248,0.07)",borderRadius:6,padding:"7px 10px",fontSize:11,color:C.blue}}>{intel.dxy.note}</div>}
  </div>
)}
{intel.indices&&(
  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>INDICES SNAPSHOT</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
      {intel.indices.spx&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize:11,fontWeight:600,color:C.txt0}}>SPX</span>
          <span style={{fontSize:10,color:intel.indices.spx.chg&&intel.indices.spx.chg.startsWith("+")?C.up:C.dn,fontWeight:600}}>{intel.indices.spx.chg}</span>
        </div>
        <div style={{fontSize:10,color:C.txt1}}>{intel.indices.spx.note}</div>
      </div>}
      {intel.indices.ndx&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize:11,fontWeight:600,color:C.txt0}}>NDX</span>
          <span style={{fontSize:10,color:intel.indices.ndx.chg&&intel.indices.ndx.chg.startsWith("+")?C.up:C.dn,fontWeight:600}}>{intel.indices.ndx.chg}</span>
        </div>
        <div style={{fontSize:10,color:C.txt1}}>{intel.indices.ndx.note}</div>
      </div>}
    </div>
    {intel.indices.regime&&<div style={{fontSize:11,color:C.txt0,lineHeight:1.6}}>{intel.indices.regime}</div>}
  </div>
)}
{intel.watchlist&&intel.watchlist.length>0&&(
  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>WATCHLIST TONIGHT</div>
    <div style={{display:"grid",gap:5}}>
      {intel.watchlist.map(function(w,i){
        var bc=w.bias==="BULLISH"?C.up:w.bias==="BEARISH"?C.dn:C.amber;
        var inst=mkt.find(function(d){return d.s===w.symbol||d.l===w.symbol;});
        return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:13,fontWeight:600,color:C.txt0}}>{w.symbol}</span>
              <span style={{fontSize:9,fontWeight:700,color:bc,background:"rgba(0,0,0,0.3)",padding:"1px 6px",borderRadius:3}}>{w.bias}</span>
            </div>
            {inst&&<span style={{fontSize:11,color:inst.pct>=0?C.up:C.dn}}>{fmt(inst.cur,inst.b)}</span>}
          </div>
          <div style={{fontSize:11,color:C.txt1,lineHeight:1.5,marginBottom:w.keyLevel?3:0}}>{w.note}</div>
          {w.keyLevel&&<div style={{fontSize:10,color:C.gold}}>Key level: {w.keyLevel}</div>}
        </div>;
      })}
    </div>
  </div>
)}
                {intel.tradeFocus&&(
                  <div style={{background:"linear-gradient(135deg,rgba(40,204,120,0.08),rgba(40,204,120,0.03))",border:"1px solid rgba(40,204,120,0.25)",borderRadius:10,padding:"13px"}}>
                    <div style={{fontSize:10,color:C.up,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>🎯 TRADE FOCUS</div>
                    <div style={{fontSize:13,color:C.txt0,lineHeight:1.8}}>{intel.tradeFocus}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── AI FILTER ── */}
        {tab==="filter"&&<div style={{padding:"12px"}}>
          {/* Agentic prompt buttons */}
          <div style={{marginBottom:8}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>QUICK ANALYSIS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[
                {label:"🌍 Geopolitical Risk",prompt:"Analyze current geopolitical risks affecting Gold, Oil and JPY. Include Middle East tensions, Russia-Ukraine, and any active flashpoints."},
                {label:"🏛 Fed Policy Impact",prompt:"Analyze the current Federal Reserve policy stance and how rate cut expectations are affecting Gold, DXY and US equities right now."},
                {label:"🇯🇵 JPY Carry Trade",prompt:"Analyze JPY carry trade risk right now. Is USD/JPY near intervention zone? What is the carry unwind risk and how does it affect Gold?"},
                {label:"📊 Gold Drivers",prompt:"What are the key drivers moving Gold right now? Analyze DXY correlation, real yields, central bank demand, and institutional positioning."},
                {label:"⚡ Risk-On/Off Regime",prompt:"What is the current market risk regime? Is it risk-on or risk-off? What instruments are confirming it and what should traders focus on?"},
                {label:"💵 DXY Analysis",prompt:"Analyze DXY current trend, key levels, and what it means for Gold, EUR/USD and commodity prices. Is the dollar bullish or bearish?"},
              ].map(function(p,i){
                return <button key={i} className="tap" onClick={function(){setHl(p.prompt);analyze(p.prompt);}}
                  style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"9px 10px",
                    textAlign:"left",color:C.txt1,fontSize:11,lineHeight:1.4,fontFamily:"inherit"}}>
                  {p.label}
                </button>;
              })}
            </div>
          </div>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".12em",marginBottom:4}}>OR TYPE / PASTE A HEADLINE</div>
            <div style={{fontSize:10,color:C.txt3,marginBottom:8,opacity:0.7}}>AI analyzes market transmission chain + money flow + scenarios</div>
            <textarea value={hl} onChange={function(e){setHl(e.target.value);}}
              placeholder="e.g. Iran closes Strait of Hormuz following US airstrike…"
              rows={3} style={{width:"100%",background:"transparent",border:"none",color:C.txt0,fontSize:13,resize:"none",lineHeight:1.7,fontFamily:"inherit"}}/>
            <div style={{borderTop:"1px solid "+C.border,marginTop:10,paddingTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div>
                  <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",fontWeight:600}}>◈ EDGEFINDER DATA <span style={{color:C.txt3,fontWeight:400}}>(optional)</span></div>
                  <div style={{fontSize:9,color:C.txt3,marginTop:1}}>Upload screenshots — COT, Top Setups, positioning data</div>
                </div>
                <label htmlFor="edge-upload" style={{background:C.bg2,border:"1px solid rgba(200,168,64,0.3)",color:C.goldL,borderRadius:7,padding:"5px 10px",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:".05em"}}>+ ADD IMAGES</label>
                <input id="edge-upload" type="file" accept="image/*" multiple onChange={handleEdgeUpload} style={{display:"none"}}/>
              </div>
              {edgeImages.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                {edgeImages.map(function(img,i){
                  return <div key={i} style={{position:"relative",borderRadius:6,overflow:"hidden",border:"1px solid rgba(200,168,64,0.3)"}}>
                    <img src={"data:"+img.mediaType+";base64,"+img.base64} style={{height:60,width:"auto",display:"block"}}/>
                    <button onClick={function(){setEdgeImages(function(p){return p.filter(function(_,j){return j!==i;});});}}
                      style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.7)",border:"none",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>×</button>
                    <div style={{background:"rgba(0,0,0,0.6)",position:"absolute",bottom:0,left:0,right:0,fontSize:7,color:C.txt2,padding:"1px 4px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{img.name}</div>
                  </div>;
                })}
                {edgeImages.length<3&&<label htmlFor="edge-upload" style={{height:60,width:48,background:C.bg2,border:"1px dashed "+C.border2,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.txt3,fontSize:18}}>+</label>}
              </div>}
              {edgeImages.length>0&&<div style={{marginTop:6,background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:6,padding:"6px 9px",fontSize:9,color:C.goldL}}>
                ✓ {edgeImages.length} EdgeFinder screenshot{edgeImages.length>1?"s":""} attached — AI will cross-analyze against news event
              </div>}
            </div>
            <button onClick={function(){analyze(undefined);}} disabled={loading||!hl.trim()}
              style={{width:"100%",marginTop:10,background:loading?C.bg2:C.gold,color:loading?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"11px",fontSize:11,fontWeight:500,letterSpacing:".1em",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {loading?[<div key="sp" className="sp" style={{width:12,height:12,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"ANALYZING…"]:[edgeImages.length>0?"◈ ":"▶  ",edgeImages.length>0?"ANALYZE + CROSS-CHECK EDGEFINDER":"ANALYZE IMPACT"]}
            </button>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>QUICK SAMPLES</div>
            {SAMPLES.map(function(s,i){
              return <button key={i} className="tap" onClick={function(){setHl(s);analyze(s);}}
                style={{display:"block",width:"100%",background:C.bg1,border:"1px solid "+C.border,color:C.txt1,borderRadius:8,padding:"9px 12px",fontSize:11,textAlign:"left",marginBottom:4}}>{s}</button>;
            })}
          </div>
          {err&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {err}</div>}
          {result&&cfg&&<div className="fu" style={{background:cfg.bg,border:"1px solid "+cfg.color+"28",borderRadius:12,padding:"14px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:11,flexWrap:"wrap",gap:6}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:cfg.color,letterSpacing:".06em"}}>{result.impactLevel}</div>
                <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:SC[result.marketSentiment as keyof typeof SC]||C.txt1,fontWeight:500}}>{result.marketSentiment}</span>
                  <span style={{fontSize:10,color:C.txt3}}>·</span>
                  <span style={{fontSize:10,color:DC[result.sentimentShift as keyof typeof DC]||C.txt1,fontWeight:500}}>{result.sentimentShift}</span>
                  <span style={{fontSize:10,color:C.txt3}}>·</span>
                  <span style={{fontSize:10,color:C.txt1}}>{result.timeHorizon}</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>IMPACT</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:70,height:4,background:C.bg2,borderRadius:2,overflow:"hidden"}}>
                    <div style={{width:result.impactScore+"%",height:"100%",background:cfg.bar,borderRadius:2}}></div>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:cfg.color}}>{result.impactScore}</span>
                </div>
              </div>
            </div>
            {result.immediateImpact&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.blue,letterSpacing:".1em",marginBottom:4}}>⚡ IMMEDIATE IMPACT</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.immediateImpact}</div>
            </div>}
            {result.moneyFlow&&<div style={{background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:4}}>💰 MONEY FLOW</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.moneyFlow}</div>
            </div>}
            {result.geopoliticalCascade&&<div style={{background:"rgba(184,88,240,0.07)",border:"1px solid rgba(184,88,240,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.vix,letterSpacing:".1em",marginBottom:4}}>🌐 TRANSMISSION CHAIN</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.geopoliticalCascade}</div>
            </div>}
            {result.edgeFinderOverride&&result.edgeFinderOverride.triggered&&<div style={{background:"rgba(240,64,64,0.08)",border:"1px solid rgba(240,64,64,0.3)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.dn,letterSpacing:".1em",marginBottom:4}}>⚠ EDGEFINDER OVERRIDE ALERT</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.edgeFinderOverride.reason}</div>
            </div>}
            {result.edgeFinderCrossCheck&&result.edgeFinderCrossCheck.hasData&&<div style={{background:"rgba(200,168,64,0.08)",border:"2px solid rgba(200,168,64,0.35)",borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:10,color:C.goldL,letterSpacing:".1em",fontWeight:700,marginBottom:8}}>◈ EDGEFINDER CROSS-ANALYSIS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                <div style={{background:"rgba(0,0,0,0.25)",borderRadius:7,padding:"8px 10px",border:"1px solid "+(result.edgeFinderCrossCheck.cotAlignment==="CONTRADICTS"?"rgba(240,64,64,0.3)":result.edgeFinderCrossCheck.cotAlignment==="CONFIRMS"?"rgba(40,204,120,0.3)":"rgba(240,144,32,0.3)")}}>
                  <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>COT DATA</div>
                  <div style={{fontSize:11,fontWeight:700,color:result.edgeFinderCrossCheck.cotAlignment==="CONTRADICTS"?C.dn:result.edgeFinderCrossCheck.cotAlignment==="CONFIRMS"?C.up:C.amber,marginBottom:3}}>{result.edgeFinderCrossCheck.cotAlignment}</div>
                  <div style={{fontSize:10,color:C.txt1,lineHeight:1.5}}>{result.edgeFinderCrossCheck.cotNote}</div>
                </div>
                <div style={{background:"rgba(0,0,0,0.25)",borderRadius:7,padding:"8px 10px",border:"1px solid "+(result.edgeFinderCrossCheck.setupAlignment==="CONTRADICTS"?"rgba(240,64,64,0.3)":result.edgeFinderCrossCheck.setupAlignment==="CONFIRMS"?"rgba(40,204,120,0.3)":"rgba(240,144,32,0.3)")}}>
                  <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>TOP SETUPS</div>
                  <div style={{fontSize:11,fontWeight:700,color:result.edgeFinderCrossCheck.setupAlignment==="CONTRADICTS"?C.dn:result.edgeFinderCrossCheck.setupAlignment==="CONFIRMS"?C.up:C.amber,marginBottom:3}}>{result.edgeFinderCrossCheck.setupAlignment}</div>
                  <div style={{fontSize:10,color:C.txt1,lineHeight:1.5}}>{result.edgeFinderCrossCheck.setupNote}</div>
                </div>
              </div>
              {result.edgeFinderCrossCheck.keyContradiction&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                <div style={{fontSize:8,color:C.dn,letterSpacing:".1em",marginBottom:3}}>⚡ KEY CONTRADICTION</div>
                <div style={{fontSize:11,color:C.txt0,lineHeight:1.5}}>{result.edgeFinderCrossCheck.keyContradiction}</div>
              </div>}
              {result.edgeFinderCrossCheck.resolution&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                <div style={{fontSize:8,color:C.blue,letterSpacing:".1em",marginBottom:3}}>HOW TO RECONCILE</div>
                <div style={{fontSize:11,color:C.txt0,lineHeight:1.5}}>{result.edgeFinderCrossCheck.resolution}</div>
              </div>}
              {result.edgeFinderCrossCheck.tradeVerdict&&<div style={{background:"rgba(200,168,64,0.1)",border:"1px solid rgba(200,168,64,0.3)",borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:8,color:C.gold,letterSpacing:".1em",marginBottom:3}}>TRADE VERDICT</div>
                <div style={{fontSize:12,fontWeight:600,color:C.goldL}}>{result.edgeFinderCrossCheck.tradeVerdict}</div>
              </div>}
            </div>}
            {result.keyDrivers&&result.keyDrivers.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:4}}>KEY DRIVERS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                {result.keyDrivers.map(function(d:string,i:number){return <span key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:5,padding:"2px 7px",fontSize:10,color:C.txt1}}>{d}</span>;})}
              </div>
            </div>}
            {result.affectedInstruments&&result.affectedInstruments.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>AFFECTED INSTRUMENTS</div>
              <div style={{display:"grid",gap:4}}>
                {result.affectedInstruments.map(function(inst:any,i:number){
                  var live=mkt.find(function(d){return d.s===inst.symbol||d.l===inst.symbol;});
                  return <div key={i} style={{background:"rgba(12,17,24,0.6)",border:"1px solid "+C.border,borderRadius:8,padding:"8px 11px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div><span style={{fontSize:12,fontWeight:500,color:C.txt0}}>{inst.symbol}</span><span style={{marginLeft:6,fontSize:11,fontWeight:500,color:DC[inst.direction as keyof typeof DC]||C.txt2}}>{inst.direction}</span></div>
                      <div style={{textAlign:"right"}}>
                        {live&&<div style={{fontSize:10,color:live.pct>=0?C.up:C.dn}}>{fmt(live.cur,live.b)}</div>}
                        {inst.targetLevel&&<div style={{fontSize:9,color:C.txt2}}>→ {inst.targetLevel}</div>}
                        <div style={{fontSize:9,color:C.txt2}}>{inst.confidence}%</div>
                      </div>
                    </div>
                    <div style={{width:"100%",height:2,background:C.bg2,borderRadius:1,overflow:"hidden",marginBottom:4}}>
                      <div style={{width:inst.confidence+"%",height:"100%",background:DC[inst.direction as keyof typeof DC]||C.txt2,borderRadius:1}}></div>
                    </div>
                    <div style={{fontSize:11,color:C.txt1}}>{inst.reason}</div>
                  </div>;
                })}
              </div>
            </div>}
            {result.scenarios&&result.scenarios.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:6}}>SCENARIOS</div>
              <div style={{display:"grid",gap:5}}>
                {result.scenarios.map(function(sc:any,i:number){
                  var scClr=sc.type==="BEARISH_EXTREME"?C.dn:sc.type==="BASE_CASE"?C.amber:C.up;
                  var scBg=sc.type==="BEARISH_EXTREME"?"rgba(240,64,64,0.07)":sc.type==="BASE_CASE"?"rgba(240,144,32,0.07)":"rgba(40,204,120,0.07)";
                  return <div key={i} style={{background:scBg,border:"1px solid "+scClr+"33",borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div>
                        <span style={{fontSize:10,fontWeight:600,color:scClr}}>{sc.type==="BEARISH_EXTREME"?"▼ WORST":sc.type==="BASE_CASE"?"◆ BASE":"▲ BEST"}</span>
                        <span style={{marginLeft:7,fontSize:11,color:C.txt0,fontWeight:500}}>{sc.title}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,fontWeight:600,color:scClr}}>{sc.probability}%</div>
                        {sc.timeline&&<div style={{fontSize:9,color:C.txt3}}>{sc.timeline}</div>}
                      </div>
                    </div>
                    <div style={{fontSize:11,color:C.txt0,lineHeight:1.65,marginBottom:5}}>{sc.description}</div>
                    {sc.instruments&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {sc.instruments.map(function(inst:any,j:number){
                        return <span key={j} style={{background:"rgba(0,0,0,0.25)",border:"1px solid "+C.border,borderRadius:4,padding:"2px 8px",fontSize:9,color:C.txt1}}>
                          <span style={{color:scClr}}>{inst.symbol}</span> {inst.move}
                        </span>;
                      })}
                    </div>}
                    <div style={{fontSize:10,color:C.txt2}}>👁 {sc.watchFor}</div>
                  </div>;
                })}
              </div>
            </div>}
            {result.keyLevelsToWatch&&result.keyLevelsToWatch.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>KEY LEVELS</div>
              {result.keyLevelsToWatch.map(function(kl:any,i:number){
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.txt0,minWidth:60}}>{kl.symbol}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.goldL,minWidth:55}}>{kl.level}</span>
                  <span style={{flex:1,fontSize:10,color:C.txt1}}>{kl.significance}</span>
                </div>;
              })}
            </div>}
            {result.nextCatalysts&&result.nextCatalysts.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>NEXT CATALYSTS</div>
              {result.nextCatalysts.map(function(cat:string,i:number){
                return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,background:"rgba(12,17,24,0.4)",border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px"}}>
                  <span style={{color:C.amber,fontSize:11,flexShrink:0}}>→</span>
                  <span style={{fontSize:11,color:C.txt0}}>{cat}</span>
                </div>;
              })}
            </div>}
            <div style={{background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:3,opacity:0.8}}>◈ TRADER NOTE</div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.8}}>{result.traderNote}</div>
            </div>
          </div>}
          {!result&&!loading&&<div style={{textAlign:"center",padding:"44px 20px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,color:C.txt3,marginBottom:6,opacity:0.28}}>◈</div>
            <div style={{fontSize:11,color:C.txt3,letterSpacing:".1em"}}>PASTE A HEADLINE TO BEGIN</div>
          </div>}
        </div>}

        </div>
      </div>

      {/* BOTTOM NAV — mobile only */}
      <div className="auxiron-bottom-nav" style={{background:C.bg1,borderTop:"1px solid "+C.border}}>
        {NAV.map(function(item:any){
          var active=tab===item.key;
          var ac=item.accent||C.gold;
          return <button key={item.key} className="tap" onClick={function(){setTab(item.key);}}
            style={{flex:1,background:"transparent",border:"none",padding:"8px 0 6px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              position:"relative",transition:"opacity 0.12s",minHeight:54}}>
            {active&&<div style={{position:"absolute",top:0,left:"22%",right:"22%",
              height:2,background:ac,borderRadius:"0 0 2px 2px"}}/>}
            <div style={{width:34,height:30,display:"flex",alignItems:"center",
              justifyContent:"center",background:active?ac+"1a":"transparent",
              borderRadius:8,transition:"background 0.12s"}}>
              {item.icon(active)}
            </div>
            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:9,
              fontWeight:active?700:400,letterSpacing:".04em",
              color:active?ac:C.txt3,transition:"color 0.12s"}}>
              {item.label}
            </span>
          </button>;
        })}
      </div>
      </div>
    </div>
  );
}
