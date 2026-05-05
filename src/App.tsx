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
const LOGO_B64="data:image/png;base64,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";
const FAVICON_B64="data:image/png;base64,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";

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

const INST_NEWS_SYS=`You are a concise market analyst. Search the web for the latest news and analysis for the given instrument. Be brief and factual.

Respond ONLY with valid JSON:
{"news":[{"time":"<e.g. 2:45pm May 4>","src":"<source>","headline":"<headline>","sentiment":"<BULLISH|BEARISH|NEUTRAL>","sentimentColor":"<#22d46e|#f04545|#f0a020>","body":"<2-3 sentences: what happened and why it matters>","tags":["<tag1>","<tag2>"]}],"brief":"<3-4 sentences: current macro drivers, key levels, what to watch tonight. Bold key terms with **double asterisks**.>","keyLevels":{"support":<number>,"resistance":<number>,"note":"<1 sentence>"}}

Provide 3-5 news items, most recent first. Keep each body to 2-3 sentences max.`;

const CTX_SYS=`You are a senior market analyst with access to live news via web search. Generate a concise breaking news briefing covering what has happened in the LAST 1-2 HOURS during this trading session.

Search the web RIGHT NOW for: breaking market news last 2 hours, latest Gold and DXY price movement and catalyst, any Fed speaker statements today, JPY or BOJ activity, geopolitical breaking developments, any surprise economic data that just printed.

Respond ONLY with valid JSON:
{"sessionBias":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","regimeUpdate":"<1 sentence: what is driving the current market regime RIGHT NOW>","breaking":[{"time":"<SGT time>","type":"<ECONOMIC DATA|FED SPEAKER|CENTRAL BANK|GEOPOLITICAL|MARKET MOVE>","typeColor":"<use: ECONOMIC DATA=#22c55e, FED SPEAKER=#818cf8, CENTRAL BANK=#fb923c, GEOPOLITICAL=#ef4444, MARKET MOVE=#3b82f6>","headline":"<specific factual headline — what actually happened>","impact":"<BULLISH GOLD|BEARISH GOLD|BULLISH USD|BEARISH USD|RISK-ON|RISK-OFF|NEUTRAL>","detail":"<2-3 sentences: exactly what happened, the specific numbers or statements, and why it matters for traders>","goldReaction":"<how Gold actually moved or is moving in response — be specific with price levels>","tradingNote":"<1 sentence: the single most actionable thing a trader should know right now>"}],"marketMoves":[{"symbol":"<sym>","from":"<price>","to":"<price>","change":"<+/-amount>","direction":"<up|down>","note":"<1 sentence: what caused this move>"}],"nextUp":[{"time":"<SGT>","event":"<specific upcoming event or risk>","impact":"<HIGH|MEDIUM>","note":"<1 sentence why it matters>"}],"goldBias":"<BULLISH|BEARISH|NEUTRAL>","dxyBias":"<BULLISH|BEARISH|NEUTRAL>","sessionSummary":"<2 sentences: plain English summary of what has happened this session so far and what traders should be focused on right now>"}
Provide 1-3 breaking items covering only GENUINELY NEW developments from the last 2 hours — not background context or old news. If nothing significant happened, say so honestly. Provide 3-5 market moves. Provide 2-3 next up items. No economic calendar — that lives in the Intel report only.`;
const INTEL_P1_SYS=`You are a senior macro strategist at a top investment bank. Generate PHASE 1 of a pre-session intelligence briefing — situational awareness only. Be CONCISE. Max 2 sentences per text field. Max 3 items per array. Short, punchy, factual.

Search the web RIGHT NOW for: breaking geopolitical headlines, overnight Asia and Europe market performance, VIX current level, latest economic calendar events this session, active alerts or risks.

Respond ONLY with valid JSON:
{"session":"<ASIA OPEN|LONDON OPEN|NY SESSION>","generatedAt":"<time SGT>","validFor":"<window>","marketRegime":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","regimeDrivers":"<1-2 sentences: what is driving the regime RIGHT NOW>","headline":"<single most important theme tonight>","executiveSummary":"<2-3 sentences: what happened overnight, current picture, biggest risk tonight>","alerts":[{"priority":<1,2,or3>,"type":"<INTERVENTION RISK|BINARY EVENT|GEOPOLITICAL|DATA RISK|CENTRAL BANK>","color":"<#ff1840 for P1|#f0a500 for P2|#fb923c for P3>","headline":"<specific alert>","detail":"<2 sentences: context and probability>","monitor":"<1 sentence: exact trigger level or event to watch>"}],"overnightRecap":{"asia":{"summary":"<1-2 sentences: key Asia session moves>","keyMove":"<e.g. Nikkei -0.8%, Gold flat>"},"europe":{"summary":"<1-2 sentences: key Europe session moves>","keyMove":"<e.g. FTSE +0.4%, EUR/USD -0.2%>"},"usFutures":{"direction":"<HIGHER|LOWER|MIXED>","spx":"<e.g. +0.1%>","ndx":"<e.g. -0.2%>","note":"<1 sentence>"},"sessionHL":{"gold":{"high":<number>,"low":<number>},"dxy":{"high":<number>,"low":<number>},"usdJpy":{"high":<number>,"low":<number>}}},"vixSnapshot":{"level":<number>,"change":"<+/-X.X>","chgPct":"<+/-X.X%>","label":"<CALM|NORMAL|ELEVATED|HIGH FEAR>","labelColor":"<hex>","interpretation":"<1-2 sentences: what VIX level means for tonight>","impactOnGold":"<1 sentence: how VIX affects Gold trading tonight>"},"calendar":[{"time":"<SGT>","flag":"<emoji>","event":"<name>","stars":<2or3>,"forecast":"<value or —>","prev":"<value or —>","impact":"<CRITICAL|HIGH|MEDIUM>","goldBull":"<bullish condition>","goldBear":"<bearish condition>","analysis":"<1 sentence>"}]}

ALERT RULES: Only include genuinely active risks. 0-3 alerts max. P1=imminent, P2=session-long, P3=background.
CALENDAR RULES: ASIA=JPY/AUD/NZD/CNY only. LONDON=EUR/GBP/CHF only. NY=USD/CAD only. 2-star and 3-star only. Max 3 events.
SESSION H/L: Use approximate values based on live data provided. If unavailable use 0.`;

const INTEL_P2_SYS=`You are a senior macro strategist. Generate PHASE 2 deep analysis for a pre-session trading briefing. Be STRICTLY CONCISE — maximum 2 sentences per text field, maximum 3 items per array. No exceptions.

NO web search needed — use the Phase 1 context and your knowledge of current macro conditions.

Respond ONLY with valid JSON:
{"inflationRisk":{"level":"<HIGH|ELEVATED|MODERATE|LOW>","color":"<#f04545 for HIGH|#f0a020 for ELEVATED or MODERATE|#22d46e for LOW>","realYield":"<e.g. 1.82%>","drivers":["<driver1>","<driver2>"],"goldImplication":"<1-2 sentences max>","fedCutProb":"<e.g. July: 38% · Sep: 62%>"},"centralBanks":{"fed":{"rate":"<rate>","nextMeeting":"<date>","cutProb":"<e.g. July 38%>","recentSignal":"<1 sentence>","goldImpact":"<1 sentence>"},"boj":{"rate":"<rate>","nextMeeting":"<date>","hikeProb":"<e.g. June 35%>","recentSignal":"<1 sentence>","goldImpact":"<1 sentence>"},"ecb":{"rate":"<rate>","nextMeeting":"<date>","cutProb":"<e.g. June 78%>","recentSignal":"<1 sentence>","goldImpact":"<1 sentence>"},"whichMattersTonight":"<1 sentence>"},"macro":[{"heading":"<heading>","color":"<hex>","body":"<2 sentences max>","keyData":"<3 data points separated by ·>"}],"liquidityAssessment":{"sessionLiquidity":"<e.g. NORMAL>","thinPeriods":"<e.g. After midnight SGT>","goldSpread":"<e.g. $0.30-0.50>","note":"<1 sentence>"},"positionManagement":{"maxRiskPerTrade":"<e.g. 1.5% max>","stopDistance":"<e.g. Gold min $25>","avoidHours":"<e.g. After 12:30am SGT>","newsRule":"<1 sentence>","note":"<1 sentence>"},"instruments":[{"name":"<name>","color":"<hex>","price":"<price>","bias":"<BULLISH|BEARISH|NEUTRAL|AVOID LONGS|WATCH>","conviction":"<HIGH|MEDIUM|LOW>","summary":"<2 sentences max>","levels":{"s2":<n>,"s1":<n>,"now":<n>,"r1":<n>,"r2":<n>},"setup":"<1-2 sentences: entry stop target or NO SETUP>","avoid":["<condition1>"]}],"watchlist":[{"symbol":"<sym>","price":"<price>","bias":"<bias>","priority":"<CRITICAL|HIGH|MEDIUM>","color":"<hex>","note":"<1 sentence>"}],"tradeFocus":"<3 sentences max: primary opportunity, what to avoid, most important level tonight>"}

RULES: Max 3 macro sections. Max 3 instruments. Max 4 watchlist items. Max 3 array items anywhere. Keep ALL text fields to 1-2 sentences. This is critical for performance.`;


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

function calcInflationRisk(mkt:any[]){
  var y10=mkt.find(function(m){return m.s==="US10Y";});
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var dxy=mkt.find(function(m){return m.s==="DX";});
  var score=50;
  if(y10){score+=y10.pct<-0.1?12:y10.pct>0.1?-12:0;}
  if(gold){score+=gold.pct>0.5?15:gold.pct>0.2?8:gold.pct<-0.5?-15:gold.pct<-0.2?-8:0;}
  if(dxy){score+=dxy.pct<-0.3?10:dxy.pct>0.3?-10:0;}
  score=Math.max(0,Math.min(100,score));
  if(score>=65)return{label:"HIGH INFLATION RISK",color:"#f04545",desc:"Gold bid · Real yields falling · Fed cut likely",score};
  if(score<=35)return{label:"LOW INFLATION RISK",color:"#22d46e",desc:"Real yields rising · Dollar strong · Gold headwind",score};
  return{label:"MODERATE INFLATION",color:"#f0a020",desc:"Mixed signals · Watch Fed & CPI closely",score};
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
function getSessionUnlockSGT(key:string):string{
  if(key==="asia")return"6:00 AM SGT";
  if(key==="london")return"4:00 PM SGT";
  return"9:00 PM SGT";
}
function isSessionActive(key:string):boolean{
  var h=new Date(Date.now()+8*60*60*1000).getUTCHours();
  if(key==="asia")return h>=6&&h<16;
  if(key==="london")return h>=16&&h<21;
  if(key==="ny")return h>=21||h<6;
  return false;
}
function getSessionLabel2(key:string):string{
  if(key==="asia")return"Asia Open";
  if(key==="london")return"London Open";
  return"NY Session";
}

export default function Auxiron(){
  // Inject favicon dynamically
  useEffect(function(){
    var link=document.querySelector("link[rel~='icon']") as HTMLLinkElement||document.createElement("link");
    link.type="image/png";
    link.rel="shortcut icon";
    link.href=FAVICON_B64;
    document.head.appendChild(link);
    // PWA manifest name
    document.title="AuxiroNexus — Pro";
  },[]);
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
  var [intelP1,setIntelP1]=useState<any>(null);
  var [intelP2,setIntelP2]=useState<any>(null);
  var [intelPhase,setIntelPhase]=useState<string>("idle");
  var [intelElapsed,setIntelElapsed]=useState(0);
  var [intelErr,setIntelErr]=useState<string|null>(null);
  var [intelSession,setIntelSession]=useState("asia");
  var [edgeImages,setEdgeImages]=useState<{name:string;base64:string;mediaType:string}[]>([]);
  var [sessionLbl,setSessionLbl]=useState(getSessionLabel());
  var cycleRef=useRef(0);
  var intelElapsedRef=useRef<any>(null);
  var [intelCache,setIntelCache]=useState<{[k:string]:any}>(function(){
    try{
      var saved=localStorage.getItem("auxiron_intel_cache");
      if(saved){
        var parsed=JSON.parse(saved);
        // Restore all valid sessions — expire after 14 hours
        var valid:{[k:string]:any}={};
        var now=Date.now();
        var SESSION_WINDOWS:any={
          asia:{start:6,end:16},
          london:{start:16,end:21},
          ny:{start:21,end:30} // 30 = next day 6am
        };
        Object.keys(parsed).forEach(function(session){
          var entry=parsed[session];
          if(!entry.generatedAt)return;
          var age=(now-new Date(entry.generatedAt).getTime())/1000/3600;
          if(age<14){valid[session]=entry;}  // keep if under 14 hours old
        });
        return valid;
      }
    }catch(e){}
    return {};
  });
  var [ctxCount,setCtxCount]=useState(0);
  var [ctxSessionKey,setCtxSessionKey]=useState("");
  var [instDetail,setInstDetail]=useState<any>(null);
  var [instDetailTab,setInstDetailTab]=useState("news");
  var [instNews,setInstNews]=useState<{[k:string]:any}>({});
  var [instNewsLoading,setInstNewsLoading]=useState(false);
  var [instTf,setInstTf]=useState(1);

  useEffect(function(){
    var id=setInterval(function(){setNowStr(new Date().toUTCString().slice(0,25));},1000);
    setNowStr(new Date().toUTCString().slice(0,25));
    return function(){clearInterval(id);};
  },[]);

  useEffect(function(){
    var id=setInterval(function(){setSessionLbl(getSessionLabel());},60000);
    return function(){clearInterval(id);};
  },[]);



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
    var today=new Date().toDateString();
    var newCount=ctxSessionKey===today?ctxCount+1:1;
    if(newCount>10){setCtxErr("Daily limit reached — max 10 briefings per day.");return;}
    setCtxCount(newCount);setCtxSessionKey(today);
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
    
  

  function fetchInstNews(sym:string,force?:boolean){
    if(!force&&instNews[sym])return;
    setInstNewsLoading(true);
    var inst=mkt.find(function(m){return m.s===sym;});
    var msg="Fetch latest news and brief analysis for: "+sym+(inst?" ("+inst.l+") Current price: "+inst.cur.toFixed(2)+" ("+( inst.pct>=0?"+":"")+inst.pct.toFixed(2)+"%)":"")+"\n\nSearch for the 3-5 most recent and relevant news headlines for this specific instrument.";
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:1500,system:INST_NEWS_SYS,
       messages:[{role:"user",content:msg}],useWebSearch:true},
      function(res:any){setInstNews(function(p:any){var n={...p};n[sym]=res;return n;});setInstNewsLoading(false);},
      function(){setInstNewsLoading(false);}
    );
  }

  function openInstDetail(m:any){
    setInstDetail(m);
    setInstDetailTab("news");
    setInstTf(1);
    if(!instNews[m.s])fetchInstNews(m.s);
  }

  function closeInstDetail(){setInstDetail(null);}

  function fetchIntel(session:string,force?:boolean){
    var currentSession=getSessionKey();
    // Always serve from cache if available — zero API cost
    if(!force&&intelCache[session]){
      setIntelP1(intelCache[session].p1);
      setIntelP2(intelCache[session].p2);
      setIntelPhase("complete");
      return;
    }
    // Block generation if session is not yet active
    if(!isSessionActive(session)&&!force){
      var unlockTime=getSessionUnlockSGT(session);
      setIntelErr("🔒 "+getSessionLabel2(session)+" hasn't started yet. Unlocks at "+unlockTime+". Tap to view your previous report if one was saved.");
      setIntelPhase("idle");
      return;
    }
    setIntelPhase("p1loading");
    setIntelP1(null);setIntelP2(null);setIntelErr(null);
    setIntelElapsed(0);
    clearInterval(intelElapsedRef.current);
    intelElapsedRef.current=setInterval(function(){setIntelElapsed(function(n:number){return n+1;});},1000);
    // Wake lock — keep screen on during generation
    var wakeLock:any=null;
    if("wakeLock" in navigator){
      (navigator as any).wakeLock.request("screen").then(function(lock:any){wakeLock=lock;}).catch(function(){});
    }
    function releaseWakeLock(){if(wakeLock)wakeLock.release().catch(function(){});}
    var SESSIONS_MAP:any={
      asia:"ASIA OPEN (SGT 6am-3pm) — Sydney/Tokyo sessions",
      london:"LONDON OPEN (SGT 4pm-1am) — European session, FX focus",
      ny:"NY SESSION (SGT 9pm-6am) — London/NY overlap, Fed speakers, US data"
    };
    var label=SESSIONS_MAP[session]||"NY SESSION";
    var snap=getSnap();
    var now=new Date().toLocaleString("en-SG",{timeZone:"Asia/Singapore"});
    var p1msg="LIVE MARKET DATA:\n"+snap+"\n\nSESSION: "+label+"\n\nCurrent SGT time: "+now+"\n\nGenerate Phase 1 situational awareness briefing. Search for latest headlines, overnight moves, VIX, economic calendar for tonight.";
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3000,system:INTEL_P1_SYS,
       messages:[{role:"user",content:p1msg}],useWebSearch:true},
      function(p1:any){
        setIntelP1(p1);
        setIntelPhase("p2loading");
        // Pass only compact P1 summary — not full JSON (too large)
    var p1summary="Session: "+label+"\nRegime: "+(p1.marketRegime||"UNKNOWN")+"\nHeadline: "+(p1.headline||"")+"\nAlerts: "+(p1.alerts?p1.alerts.map(function(a:any){return a.type+": "+a.headline;}).join("; "):"none")+"\nVIX: "+(p1.vixSnapshot?p1.vixSnapshot.level+" "+p1.vixSnapshot.label:"unknown");
    var p2msg="LIVE MARKET DATA:\n"+snap+"\n\nSESSION: "+label+"\n\nPHASE 1 SUMMARY:\n"+p1summary+"\n\nGenerate Phase 2 deep analysis: inflation risk, central banks, macro framework, liquidity assessment, position management, instruments with key levels, watchlist, trade focus. Use your knowledge of current macro conditions — no web search needed.";
        callProxy(
          {model:"claude-sonnet-4-6",max_tokens:5000,system:INTEL_P2_SYS,
           messages:[{role:"user",content:p2msg}],useWebSearch:false},
          function(p2:any){
            setIntelP2(p2);
            setIntelPhase("complete");
            clearInterval(intelElapsedRef.current);
            releaseWakeLock();
            setIntelCache(function(prev:any){
              var n={...prev};n[session]={p1,p2};
              try{
                // Save with session metadata so we know when each was generated
                var toSave:any={};
                Object.keys(n).forEach(function(k){
                  toSave[k]={p1:n[k].p1,p2:n[k].p2,generatedAt:new Date().toISOString()};
                });
                localStorage.setItem("auxiron_intel_cache",JSON.stringify(toSave));
              }catch(e){}
              return n;
            });
          },
          function(e:string){setIntelErr("Phase 2 failed: "+e);setIntelPhase("p1done");clearInterval(intelElapsedRef.current);releaseWakeLock();}
        );
      },
      function(e:string){setIntelErr("Failed: "+e);setIntelPhase("idle");clearInterval(intelElapsedRef.current);releaseWakeLock();}
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
  var inflationRisk=calcInflationRisk(mkt);

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
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.28s ease forwards;} @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:0.1}} .pd{animation:pd 1.5s ease infinite;}
        @keyframes sp{to{transform:rotate(360deg)}} .sp{animation:sp 0.8s linear infinite;} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
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
            <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,rgba(74,158,255,0.2),rgba(212,168,67,0.15))",border:"1px solid rgba(212,168,67,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3" fill="#4a9eff" opacity="0.9"/>
                <line x1="9" y1="9" x2="14" y2="4" stroke="#d4a843" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M4.5 13.5 A6.5 6.5 0 0 1 4.5 4.5" stroke="#4a9eff" strokeWidth="1.4" fill="none" opacity="0.7"/>
                <path d="M6 15.2 A8.5 8.5 0 0 1 3 2.8" stroke="#4a9eff" strokeWidth="1" fill="none" opacity="0.4"/>
                <path d="M13.5 4.5 A6.5 6.5 0 0 1 13.5 13.5" stroke="#d4a843" strokeWidth="1.4" fill="none" opacity="0.7"/>
                <path d="M15 2.8 A8.5 8.5 0 0 1 15 15.2" stroke="#d4a843" strokeWidth="1" fill="none" opacity="0.4"/>
              </svg>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:0}}>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,letterSpacing:"-.01em",color:C.txt0}}>Auxiro</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,letterSpacing:"-.01em",color:C.gold}}>Nexus</span>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:"rgba(212,168,67,0.12)",color:C.goldL,padding:"2px 6px",borderRadius:3,letterSpacing:".1em",border:"1px solid rgba(212,168,67,0.25)"}}>PRO</span>
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
              return <div key={m.s} onClick={function(){openInstDetail(m);}} className="tap"
                style={{background:C.bg1,border:"1px solid "+(isGold?"rgba(200,168,64,0.25)":C.border),
                  borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
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
              <span style={{fontSize:9,color:ctxCount>=10?C.dn:C.txt3}}>{ctxCount}/10</span>
              <button className="tap" onClick={fetchCtx} disabled={ctxLoading||ctxCount>=10}
                style={{background:ctxLoading||ctxCount>=10?C.bg2:C.gold,color:ctxLoading||ctxCount>=10?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"7px 14px",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                {ctxLoading?[<div key="sp" className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"GENERATING…"]:ctxCount>=10?"◉ LIMIT REACHED":"◉ GENERATE"}
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
            {/* Session selector */}
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".12em",fontWeight:600,marginBottom:8}}>⬟ INTEL REPORT</div>
              <div style={{display:"grid",gap:5}}>
                {[
                  {key:"asia",icon:"🌏",label:"ASIA OPEN",time:"6am–3pm SGT",color:C.bond},
                  {key:"london",icon:"🌍",label:"LONDON OPEN",time:"4pm–1am SGT",color:C.blue},
                  {key:"ny",icon:"🗽",label:"NY SESSION",time:"9pm–6am SGT",color:C.goldL},
                ].map(function(s){
                  var active=intelSession===s.key;
                  var cached=!!intelCache[s.key];
                  var sessionActive=isSessionActive(s.key);
                  var isLoading=active&&(intelPhase==="p1loading"||intelPhase==="p2loading");
                  var isDone=active&&intelPhase==="complete";
                  // Locked = session not active AND no cached report
                  var isLocked=!sessionActive&&!cached;
                  // Can generate = session is active and no cache yet (or force)
                  var canGenerate=sessionActive&&!cached;
                  return <button key={s.key} className="tap"
                    onClick={function(){
                      setIntelSession(s.key);
                      if(cached){
                        // Load from cache instantly — no API call
                        setIntelP1(intelCache[s.key].p1);
                        setIntelP2(intelCache[s.key].p2);
                        setIntelPhase("complete");
                      } else if(!isLocked){
                        fetchIntel(s.key);
                      }
                      // if locked and no cache: do nothing
                      // if locked and no cache: do nothing
                    }}
                    style={{background:active?"rgba(0,0,0,0.2)":cached?"rgba(34,212,110,0.04)":isLocked?"rgba(0,0,0,0.08)":C.bg1,
                      border:"1px solid "+(active?s.color+"55":cached?"rgba(34,212,110,0.2)":isLocked?C.txt3+"22":C.border),
                      borderRadius:10,padding:"10px 14px",textAlign:"left",width:"100%",
                      opacity:isLocked?0.4:1,cursor:isLocked?"default":"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <span style={{fontSize:17}}>{s.icon}</span>
                        <div>
                          <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,color:active?s.color:C.txt0}}>{s.label}</div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:active?s.color:isLocked?C.txt3:sessionActive?C.up:C.txt2}}>
                            {isLocked?"Unlocks at "+getSessionUnlockSGT(s.key):cached?"✓ Report saved · "+s.time:sessionActive?"● LIVE NOW · "+s.time:s.time}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {isLocked&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,background:"rgba(0,0,0,0.25)",padding:"2px 6px",borderRadius:3}}>🔒</span>}
                        {cached&&!isLoading&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up,background:"rgba(34,212,110,0.12)",padding:"2px 6px",borderRadius:3}}>✓ Saved</span>}
                        {sessionActive&&!cached&&!isLoading&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:s.color,background:s.color+"12",padding:"2px 6px",borderRadius:3}}>Generate</span>}
                        {isLoading&&<div className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:s.color,borderRadius:"50%"}}/>}
                      </div>
                    </div>
                  </button>;
                })}
              </div>
            </div>

            {/* Error state */}
            {intelErr&&<div style={{
              background:intelErr.startsWith("🔒")?"rgba(58,85,112,0.15)":"rgba(240,69,69,0.07)",
              border:"1px solid "+(intelErr.startsWith("🔒")?C.border:"rgba(240,69,69,0.2)"),
              borderRadius:10,padding:"12px 14px",marginBottom:10,
              fontFamily:"'IBM Plex Sans',sans-serif"}}>
              <div style={{fontSize:13,fontWeight:600,color:intelErr.startsWith("🔒")?C.txt1:C.dn,lineHeight:1.6}}>
                {intelErr}
              </div>
            </div>}

            {/* Idle state */}
            {intelPhase==="idle"&&!intelErr&&(
              <div style={{textAlign:"center",padding:"36px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,marginBottom:8,opacity:0.15}}>⬟</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:C.txt3,letterSpacing:".1em",marginBottom:4}}>SELECT SESSION ABOVE</div>
                <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt3}}>Tap a session to generate your pre-market intelligence report</div>
              </div>
            )}

            {/* Phase 1 loading skeleton */}
            {intelPhase==="p1loading"&&(
              <div>
                <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"20px",textAlign:"center",marginBottom:8}}>
                  <div className="sp" style={{width:22,height:22,border:"3px solid "+C.border2,borderTopColor:C.up,borderRadius:"50%",margin:"0 auto 10px"}}/>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:C.up,letterSpacing:".08em",marginBottom:3}}>PHASE 1 · SEARCHING WEB...</div>
                  <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt3,marginBottom:6}}>Alerts · Overnight recap · Economic calendar</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.gold}}>{intelElapsed}s</div>
                </div>
                {[80,110,90].map(function(h,i){return <div key={i} style={{height:h,background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",borderRadius:9,marginBottom:7,animation:"shimmer 1.4s infinite"}}/>;})}
              </div>
            )}

            {/* Phase 1 content */}
            {(intelPhase==="p1done"||intelPhase==="p2loading"||intelPhase==="complete")&&intelP1&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{flex:1,height:1,background:C.border}}/>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up,background:"rgba(34,212,110,0.08)",border:"1px solid rgba(34,212,110,0.2)",borderRadius:4,padding:"2px 8px"}}>✓ PHASE 1 · ALERTS + CALENDAR</span>
                  <div style={{flex:1,height:1,background:C.border}}/>
                </div>

                {/* Header */}
                <div style={{background:"linear-gradient(135deg,rgba(212,168,67,0.1),rgba(212,168,67,0.03))",border:"1px solid rgba(212,168,67,0.28)",borderRadius:10,padding:"13px",marginBottom:8}}>
                  <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
                    {intelP1.marketRegime&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:intelP1.marketRegime==="RISK-OFF"?C.dn:intelP1.marketRegime==="RISK-ON"?C.up:C.amber,background:(intelP1.marketRegime==="RISK-OFF"?C.dn:intelP1.marketRegime==="RISK-ON"?C.up:C.amber)+"18",border:"1px solid "+(intelP1.marketRegime==="RISK-OFF"?C.dn:intelP1.marketRegime==="RISK-ON"?C.up:C.amber)+"44"}}>{intelP1.marketRegime}</span>}
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt3}}>{intelP1.generatedAt} · {intelP1.validFor}</span>
                    {intelCache[intelSession]?.generatedAt&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up}}>✓ Saved locally</span>}
                  </div>
                  {intelP1.headline&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,lineHeight:1.45,marginBottom:6}}>{intelP1.headline}</div>}
                  {intelP1.executiveSummary&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.75}}>{intelP1.executiveSummary}</div>}
                  {intelP1.regimeDrivers&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt2,lineHeight:1.65,marginTop:5}}>{intelP1.regimeDrivers}</div>}
                </div>

                {/* Priority Alerts */}
                {intelP1.alerts&&intelP1.alerts.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>⚡ PRIORITY ALERTS</div>
                  {intelP1.alerts.map(function(a:any,i:number){
                    return <div key={i} style={{background:a.color+"0e",border:"1px solid "+a.color+"33",borderLeft:"3px solid "+a.color,borderRadius:9,padding:"11px 12px",marginBottom:6}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:a.color,letterSpacing:".08em",marginBottom:4}}>P{a.priority} · {a.type}</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,color:C.txt0,lineHeight:1.4,marginBottom:5}}>{a.headline}</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.7,marginBottom:6}}>{a.detail}</div>
                      {a.monitor&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px",borderLeft:"2px solid "+a.color}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:a.color,fontWeight:600}}>MONITOR: </span>
                        <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{a.monitor}</span>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Overnight Recap */}
                {intelP1.overnightRecap&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>🌍 OVERNIGHT RECAP</div>
                  {[["Asia",intelP1.overnightRecap.asia,C.bond],["Europe",intelP1.overnightRecap.europe,C.blue]].map(function(row:any){
                    var name=row[0];var data=row[1];var color=row[2];
                    if(!data)return null;
                    return <div key={name} style={{background:C.bg2,border:"1px solid "+color+"22",borderRadius:8,padding:"9px 11px",marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:color,fontWeight:600}}>{name.toUpperCase()} SESSION</span>
                        {data.keyMove&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.gold}}>{data.keyMove}</span>}
                      </div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.65}}>{data.summary}</div>
                    </div>;
                  })}
                  {intelP1.overnightRecap.usFutures&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px",marginBottom:5}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.amber,fontWeight:600}}>US FUTURES</span>
                      <div style={{display:"flex",gap:8}}>
                        {intelP1.overnightRecap.usFutures.spx&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>SPX <span style={{color:intelP1.overnightRecap.usFutures.spx.startsWith("+")?C.up:C.dn}}>{intelP1.overnightRecap.usFutures.spx}</span></span>}
                        {intelP1.overnightRecap.usFutures.ndx&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>NDX <span style={{color:intelP1.overnightRecap.usFutures.ndx.startsWith("+")?C.up:C.dn}}>{intelP1.overnightRecap.usFutures.ndx}</span></span>}
                      </div>
                    </div>
                    {intelP1.overnightRecap.usFutures.note&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1}}>{intelP1.overnightRecap.usFutures.note}</div>}
                  </div>}
                  {intelP1.overnightRecap.sessionHL&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2,marginBottom:6}}>SESSION HIGHS & LOWS</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                      {[["GOLD",intelP1.overnightRecap.sessionHL.gold,C.gold],["DXY",intelP1.overnightRecap.sessionHL.dxy,C.blue],["USD/JPY",intelP1.overnightRecap.sessionHL.usdJpy,C.jpy]].map(function(row:any){
                        var name=row[0];var hl=row[1];var color=row[2];
                        if(!hl||!hl.high)return null;
                        return <div key={name} style={{textAlign:"center"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:color,marginBottom:2}}>{name}</div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.up}}>H: {hl.high}</div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.dn}}>L: {hl.low}</div>
                        </div>;
                      })}
                    </div>
                  </div>}
                </div>}

                {/* VIX Snapshot */}
                {intelP1.vixSnapshot&&<div style={{background:"rgba(176,96,240,0.07)",border:"1px solid rgba(176,96,240,0.22)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.vix,fontWeight:600,letterSpacing:".1em"}}>📊 VIX ANALYSIS</div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:600,color:intelP1.vixSnapshot.labelColor||C.amber,lineHeight:1}}>{intelP1.vixSnapshot.level}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.dn}}>{intelP1.vixSnapshot.chgPct}</div>
                    </div>
                  </div>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:intelP1.vixSnapshot.labelColor||C.amber,background:(intelP1.vixSnapshot.labelColor||C.amber)+"18",border:"1px solid "+(intelP1.vixSnapshot.labelColor||C.amber)+"44"}}>{intelP1.vixSnapshot.label}</span>
                  <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.75,margin:"7px 0 6px"}}>{intelP1.vixSnapshot.interpretation}</div>
                  {intelP1.vixSnapshot.impactOnGold&&<div style={{background:"rgba(176,96,240,0.08)",borderRadius:6,padding:"6px 9px",borderLeft:"2px solid "+C.vix}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.vix,fontWeight:600}}>GOLD: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{intelP1.vixSnapshot.impactOnGold}</span>
                  </div>}
                </div>}

                {/* Calendar */}
                {intelP1.calendar&&intelP1.calendar.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>📅 ECONOMIC CALENDAR</div>
                  {intelP1.calendar.map(function(ev:any,i:number){
                    var ic=ev.impact==="CRITICAL"?"#ff1840":ev.impact==="HIGH"?C.dn:C.amber;
                    return <div key={i} style={{background:C.bg2,border:"1px solid "+(ev.stars===3?"rgba(255,24,64,0.2)":"rgba(240,165,0,0.15)"),borderRadius:8,padding:"10px 12px",marginBottom:i<intelP1.calendar.length-1?5:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,color:C.txt0}}>{ev.flag} {ev.event}</span>
                            <span>{[1,2,3].map(function(s:number){return <span key={s} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:s<=ev.stars?C.amber:C.txt3}}>★</span>;})}</span>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600,color:C.gold}}>{ev.time}</span>
                            {ev.forecast&&ev.forecast!=="—"&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2}}>Exp: <strong style={{color:C.txt0}}>{ev.forecast}</strong></span>}
                            {ev.prev&&ev.prev!=="—"&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2}}>Prev: <strong style={{color:C.txt0}}>{ev.prev}</strong></span>}
                          </div>
                        </div>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:3,color:ic,background:ic+"18",border:"1px solid "+ic+"33",flexShrink:0,marginLeft:6}}>{ev.impact}</span>
                      </div>
                      {(ev.goldBull||ev.goldBear)&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:ev.analysis?4:0}}>
                        {ev.goldBull&&<div style={{background:"rgba(34,212,110,0.07)",border:"1px solid rgba(34,212,110,0.2)",borderRadius:5,padding:"4px 7px"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up,marginBottom:1}}>GOLD BULLISH IF</div>
                          <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.txt0}}>{ev.goldBull}</div>
                        </div>}
                        {ev.goldBear&&<div style={{background:"rgba(240,69,69,0.07)",border:"1px solid rgba(240,69,69,0.2)",borderRadius:5,padding:"4px 7px"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.dn,marginBottom:1}}>GOLD BEARISH IF</div>
                          <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.txt0}}>{ev.goldBear}</div>
                        </div>}
                      </div>}
                      {ev.analysis&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt1,lineHeight:1.6}}>{ev.analysis}</div>}
                    </div>;
                  })}
                </div>}

                {/* Phase 2 loading */}
                {intelPhase==="p2loading"&&<div>
                  <div style={{display:"flex",alignItems:"center",gap:6,margin:"4px 0 8px"}}>
                    <div style={{flex:1,height:1,background:C.border}}/>
                    <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.amber,background:"rgba(240,160,32,0.08)",border:"1px solid rgba(240,160,32,0.2)",borderRadius:4,padding:"2px 8px"}}>
                      <div className="sp" style={{width:7,height:7,border:"1.5px solid rgba(240,160,32,0.3)",borderTopColor:C.amber,borderRadius:"50%"}}/>
                      PHASE 2 · MACRO + INSTRUMENTS
                    </div>
                    <div style={{flex:1,height:1,background:C.border}}/>
                  </div>
                  {[100,120,90].map(function(h,i){return <div key={i} style={{height:h,background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",borderRadius:9,marginBottom:7,animation:"shimmer 1.4s infinite"}}/>;})}
                </div>}
              </div>
            )}

            {/* Phase 2 content */}
            {intelPhase==="complete"&&intelP2&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{flex:1,height:1,background:C.border}}/>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.gold,background:"rgba(212,168,67,0.08)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:4,padding:"2px 8px"}}>✓ PHASE 2 · DEEP ANALYSIS</span>
                  <div style={{flex:1,height:1,background:C.border}}/>
                </div>

                {/* Inflation Risk */}
                {intelP2.inflationRisk&&<div style={{background:"rgba(240,160,32,0.07)",border:"1px solid rgba(240,160,32,0.22)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.amber,fontWeight:600,letterSpacing:".1em"}}>📈 INFLATION RISK</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:intelP2.inflationRisk.color||C.amber,background:(intelP2.inflationRisk.color||C.amber)+"18",border:"1px solid "+(intelP2.inflationRisk.color||C.amber)+"44"}}>{intelP2.inflationRisk.level}</span>
                      {intelP2.inflationRisk.realYield&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Real yield: <span style={{color:C.dn}}>{intelP2.inflationRisk.realYield}</span></span>}
                    </div>
                  </div>
                  {intelP2.inflationRisk.drivers&&intelP2.inflationRisk.drivers.map(function(d:string,i:number){
                    return <div key={i} style={{display:"flex",gap:6,padding:"3px 0"}}>
                      <span style={{color:C.amber,fontSize:10,flexShrink:0}}>→</span>
                      <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0}}>{d}</span>
                    </div>;
                  })}
                  {intelP2.inflationRisk.goldImplication&&<div style={{background:"rgba(212,168,67,0.08)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:7,padding:"8px 10px",margin:"7px 0 5px"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.gold,fontWeight:600}}>GOLD: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.7}}>{intelP2.inflationRisk.goldImplication}</span>
                  </div>}
                  {intelP2.inflationRisk.fedCutProb&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.fed}}>Fed cut prob: <span style={{color:C.txt0}}>{intelP2.inflationRisk.fedCutProb}</span></div>}
                </div>}

                {/* Central Banks */}
                {intelP2.centralBanks&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.fed,fontWeight:600,letterSpacing:".1em",marginBottom:7}}>🏛 CENTRAL BANKS</div>
                  {intelP2.centralBanks.whichMattersTonight&&<div style={{background:"rgba(136,128,248,0.06)",border:"1px solid rgba(136,128,248,0.2)",borderRadius:6,padding:"6px 9px",marginBottom:7}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.fed,fontWeight:600}}>TONIGHT: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{intelP2.centralBanks.whichMattersTonight}</span>
                  </div>}
                  {[["FED",intelP2.centralBanks.fed,"#8880f8"],["BOJ",intelP2.centralBanks.boj,C.jpy],["ECB",intelP2.centralBanks.ecb,"#34d399"]].map(function(row:any){
                    var name=row[0];var cb=row[1];var color=row[2];
                    if(!cb)return null;
                    return <div key={name} style={{background:C.bg2,border:"1px solid "+color+"22",borderLeft:"2px solid "+color,borderRadius:7,padding:"8px 10px",marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:color,fontWeight:600}}>{name}</span>
                        {cb.rate&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Rate: <span style={{color:C.txt0}}>{cb.rate}</span></span>}
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        {cb.nextMeeting&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Next: <span style={{color:C.gold}}>{cb.nextMeeting}</span></span>}
                        {(cb.cutProb||cb.hikeProb)&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Prob: <span style={{color:C.up}}>{cb.cutProb||cb.hikeProb}</span></span>}
                      </div>
                      {cb.recentSignal&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.6,marginBottom:3}}>{cb.recentSignal}</div>}
                      {cb.goldImpact&&<div style={{borderLeft:"2px solid "+color+"44",paddingLeft:7}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:color}}>GOLD: </span>
                        <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{cb.goldImpact}</span>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Macro */}
                {intelP2.macro&&intelP2.macro.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>🌐 MACRO FRAMEWORK</div>
                  {intelP2.macro.map(function(m:any,i:number){
                    return <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderLeft:"3px solid "+(m.color||C.blue),borderRadius:9,padding:"11px 12px",marginBottom:6}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:m.color||C.blue,letterSpacing:".06em",marginBottom:6,textTransform:"uppercase"}}>{m.heading}</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.8,marginBottom:m.keyData?7:0}}>{m.body}</div>
                      {m.keyData&&<div style={{background:C.bg2,borderRadius:5,padding:"5px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
                        {m.keyData.split(" · ").map(function(d:string,j:number){return <span key={j} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2}}>• {d}</span>;})}
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Liquidity */}
                {intelP2.liquidityAssessment&&<div style={{background:"rgba(32,200,216,0.07)",border:"1px solid rgba(32,200,216,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.bond,fontWeight:600,letterSpacing:".1em",marginBottom:7}}>💧 LIQUIDITY ASSESSMENT</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                    <div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>SESSION LIQUIDITY</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.bond}}>{intelP2.liquidityAssessment.sessionLiquidity}</div>
                    </div>
                    {intelP2.liquidityAssessment.goldSpread&&<div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>GOLD SPREAD</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.txt0}}>{intelP2.liquidityAssessment.goldSpread}</div>
                    </div>}
                  </div>
                  {intelP2.liquidityAssessment.note&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.7,marginBottom:5}}>{intelP2.liquidityAssessment.note}</div>}
                  {intelP2.liquidityAssessment.thinPeriods&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px",borderLeft:"2px solid "+C.bond}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.bond,fontWeight:600}}>THIN: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{intelP2.liquidityAssessment.thinPeriods}</span>
                  </div>}
                </div>}

                {/* Position Management */}
                {intelP2.positionManagement&&<div style={{background:"rgba(34,212,110,0.06)",border:"1px solid rgba(34,212,110,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.up,fontWeight:600,letterSpacing:".1em",marginBottom:7}}>⚖️ POSITION MANAGEMENT</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                    {intelP2.positionManagement.maxRiskPerTrade&&<div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>MAX RISK/TRADE</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:700,color:C.up}}>{intelP2.positionManagement.maxRiskPerTrade.split(" ")[0]}</div>
                    </div>}
                    {intelP2.positionManagement.stopDistance&&<div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>MIN STOP</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:700,color:C.amber}}>{intelP2.positionManagement.stopDistance}</div>
                    </div>}
                  </div>
                  {[intelP2.positionManagement.newsRule,intelP2.positionManagement.note].filter(Boolean).map(function(t:string,i:number){
                    return <div key={i} style={{display:"flex",gap:6,marginBottom:4}}>
                      <span style={{color:C.up,fontSize:11,flexShrink:0}}>→</span>
                      <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{t}</span>
                    </div>;
                  })}
                </div>}

                {/* Instruments */}
                {intelP2.instruments&&intelP2.instruments.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>📊 INSTRUMENT FOCUS</div>
                  {intelP2.instruments.map(function(inst:any,i:number){
                    return <div key={i} style={{background:C.bg1,border:"1px solid "+(inst.color||C.border)+"33",borderRadius:10,padding:"12px",marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:14,fontWeight:700,color:C.txt0}}>{inst.name}</span>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,color:inst.color||C.txt2,background:(inst.color||C.txt2)+"18",border:"1px solid "+(inst.color||C.txt2)+"33"}}>{inst.bias}</span>
                          </div>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt3}}>Conviction: <span style={{color:inst.color||C.txt2}}>{inst.conviction}</span></span>
                        </div>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:600,color:C.txt0}}>{inst.price}</span>
                      </div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.75,marginBottom:8}}>{inst.summary}</div>
                      {inst.levels&&<div style={{display:"flex",gap:4,marginBottom:8}}>
                        {[["S2",inst.levels.s2,C.up,true],["S1",inst.levels.s1,C.up,false],["NOW",inst.levels.now,inst.color||C.txt0,false],["R1",inst.levels.r1,C.dn,false],["R2",inst.levels.r2,C.dn,true]].map(function(row:any){
                          var l=row[0];var v=row[1];var c=row[2];var b=row[3];
                          if(!v)return null;
                          return <div key={l} style={{flex:1,background:C.bg2,border:"1px solid "+(b?c:c+"44"),borderRadius:5,padding:"4px 2px",textAlign:"center"}}>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:C.txt3,marginBottom:1}}>{l}</div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:b?700:400,color:c}}>{v}</div>
                          </div>;
                        })}
                      </div>}
                      {inst.setup&&<div style={{background:(inst.color||C.blue)+"0d",border:"1px solid "+(inst.color||C.blue)+"22",borderRadius:6,padding:"7px 10px"}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:inst.color||C.blue,fontWeight:600}}>SETUP: </span>
                        <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{inst.setup}</span>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Watchlist */}
                {intelP2.watchlist&&intelP2.watchlist.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>👁 WATCHLIST TONIGHT</div>
                  {intelP2.watchlist.map(function(w:any,i:number){
                    var pc=w.priority==="CRITICAL"?"#ff1840":w.priority==="HIGH"?C.dn:C.amber;
                    return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px",marginBottom:i<intelP2.watchlist.length-1?5:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:C.txt0}}>{w.symbol}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,color:w.color||C.txt2,background:(w.color||C.txt2)+"18",border:"1px solid "+(w.color||C.txt2)+"33"}}>{w.bias}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,color:pc,background:pc+"18"}}>{w.priority}</span>
                        </div>
                        {w.price&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:C.txt0}}>{w.price}</span>}
                      </div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.5}}>{w.note}</div>
                    </div>;
                  })}
                </div>}

                {/* Trade Focus */}
                {intelP2.tradeFocus&&<div style={{background:"linear-gradient(135deg,rgba(34,212,110,0.07),rgba(34,212,110,0.02))",border:"1px solid rgba(34,212,110,0.22)",borderRadius:10,padding:"13px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.up,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>🎯 TRADE FOCUS — TONIGHT</div>
                  <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.85}}>{intelP2.tradeFocus}</div>
                </div>}

                {/* Regen button */}
                <div style={{display:"flex",justifyContent:"center",paddingTop:4}}>
                  <button className="tap" onClick={function(){if(window.confirm("Regenerate Intel report for this session?"))fetchIntel(intelSession,true);}}
                    style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:7,padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",color:C.txt2,fontSize:9}}>
                    ↻ Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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

      {/* INSTRUMENT DETAIL MODAL */}
      {instDetail&&(function(){
        var m=instDetail;
        var up=m.pct>=0;
        var isBond=m.cat==="Bonds";
        var isGold=m.s==="XAU/USD";
        var lc=isBond?C.bond:up?C.up:C.dn;
        var tfs=["1D","1W","1M","3M"];
        var pts=[48,7*24,30*8,90*4];
        var chartData=instTf===0?m.ch:genFB(m.b,m.v,pts[instTf]);
        var minP=Math.min.apply(null,chartData.map(function(d:any){return d.p;}))*0.9995;
        var maxP=Math.max.apply(null,chartData.map(function(d:any){return d.p;}))*1.0005;
        var news=instNews[m.s];
        var roroColor=m.roro==="ON"?C.up:m.roro==="OFF"?C.dn:C.txt3;
        return <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",
          width:"100%",maxWidth:480,height:"100%",background:C.bg0,
          zIndex:600,display:"flex",flexDirection:"column",overflowY:"auto",
          animation:"slideUp 0.24s cubic-bezier(0.32,0.72,0,1) forwards"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(180deg,#0d1824,#080e14)",
            borderBottom:"1px solid "+C.border,padding:"14px 16px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <button className="tap" onClick={closeInstDetail}
                style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,
                  borderRadius:8,padding:"6px 11px",fontFamily:"'IBM Plex Sans',sans-serif",
                  color:C.txt1,fontSize:12,fontWeight:500}}>
                ← Back
              </button>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,
                  padding:"2px 7px",borderRadius:3,color:roroColor,
                  background:roroColor+"18",border:"1px solid "+roroColor+"33"}}>
                  {m.roro==="ON"?"R-ON":m.roro==="OFF"?"R-OFF":"FX"}
                </span>
                {isGold&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,
                  padding:"2px 7px",borderRadius:3,color:goldBiasColor,
                  background:goldBiasColor+"18",border:"1px solid "+goldBiasColor+"33"}}>{goldBias}</span>}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,
                  color:isGold?C.goldL:C.txt0,marginBottom:2}}>{m.l}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt3}}>{m.s}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:19,fontWeight:600,
                  color:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,
                  color:up?C.up:C.dn,marginTop:2}}>{up?"+":""}{m.pct.toFixed(2)}% {up?"▲":"▼"}</div>
              </div>
            </div>
            {/* Timeframe selector */}
            <div style={{display:"flex",gap:4}}>
              {tfs.map(function(tf,i){
                return <button key={tf} className="tap" onClick={function(){setInstTf(i);}}
                  style={{flex:1,background:instTf===i?lc+"18":"transparent",
                    border:instTf===i?"1px solid "+lc+"55":"1px solid transparent",
                    borderRadius:6,padding:"4px 0",fontFamily:"'IBM Plex Mono',monospace",
                    fontSize:10,fontWeight:instTf===i?700:400,
                    color:instTf===i?lc:C.txt3,transition:"all 0.12s"}}>
                  {tf}
                </button>;
              })}
            </div>
          </div>
          {/* Chart */}
          <div style={{flexShrink:0,background:C.bg0,padding:"8px 0 0"}}>
            <div style={{height:160}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                  <defs>
                    <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={lc} stopOpacity={0.18}/>
                      <stop offset="95%" stopColor={lc} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} opacity={0.6}/>
                  <XAxis dataKey="t" tick={{fill:C.txt3,fontSize:8,fontFamily:"IBM Plex Mono"}}
                    tickLine={false} axisLine={false} interval={Math.floor(chartData.length/4)}/>
                  <YAxis domain={[minP,maxP]} hide/>
                  <ReferenceLine y={chartData[0]?.p} stroke={C.border2} strokeDasharray="3 3"/>
                  <Tooltip content={function(props:any){
                    if(!props.active||!props.payload?.length)return null;
                    return <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"5px 9px",fontFamily:"'IBM Plex Mono',monospace"}}>
                      <div style={{fontSize:8,color:C.txt3,marginBottom:1}}>{props.label}</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.txt0}}>{props.payload[0].value}</div>
                    </div>;
                  }}/>
                  <Area type="monotone" dataKey="p" stroke={lc} strokeWidth={2}
                    fill="url(#ig)" dot={false} activeDot={{r:3,fill:lc}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* OHLC strip */}
            <div style={{display:"flex",gap:4,padding:"6px 14px 8px"}}>
              {[["Open",chartData[0]?.p?.toLocaleString()],
                ["High",Math.max.apply(null,chartData.map(function(d:any){return d.p;})).toLocaleString()],
                ["Low",Math.min.apply(null,chartData.map(function(d:any){return d.p;})).toLocaleString()],
                ["Now",fmt(m.cur,m.b)]].map(function(row:any){
                return <div key={row[0]} style={{flex:1,background:C.bg1,border:"1px solid "+C.border,
                  borderRadius:6,padding:"4px 6px",textAlign:"center"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>{row[0]}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:C.txt0}}>{row[1]}</div>
                </div>;
              })}
            </div>
          </div>
          {/* Tab bar */}
          <div style={{display:"flex",borderBottom:"1px solid "+C.border,
            background:C.bg1,flexShrink:0,padding:"0 14px"}}>
            {[["news","📰 News"],["brief","⚡ AI Brief"]].map(function(t:any){
              return <button key={t[0]} className="tap" onClick={function(){setInstDetailTab(t[0]);}}
                style={{background:"transparent",border:"none",
                  borderBottom:instDetailTab===t[0]?"2px solid "+(isGold?C.gold:lc):"2px solid transparent",
                  color:instDetailTab===t[0]?C.txt0:C.txt2,padding:"10px 14px",
                  fontFamily:"'IBM Plex Sans',sans-serif",
                  fontSize:12,fontWeight:instDetailTab===t[0]?700:400,transition:"color 0.12s"}}>
                {t[1]}
              </button>;
            })}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",padding:"0 4px"}}>
              <button className="tap" onClick={function(){fetchInstNews(m.s,true);}}
                disabled={instNewsLoading}
                style={{background:"transparent",border:"none",
                  fontFamily:"'IBM Plex Mono',monospace",fontSize:9,
                  color:instNewsLoading?C.txt3:C.gold,display:"flex",alignItems:"center",gap:4}}>
                {instNewsLoading
                  ?<div className="sp" style={{width:9,height:9,border:"1.5px solid "+C.border2,borderTopColor:C.gold,borderRadius:"50%"}}/>
                  :"↻"}
                {instNewsLoading?"Updating...":"Refresh"}
              </button>
            </div>
          </div>
          {/* News tab */}
          {instDetailTab==="news"&&<div style={{padding:"12px 14px",flex:1}}>
            {instNewsLoading&&!news&&<div>
              {[90,110,80].map(function(h,i){return <div key={i} style={{height:h,background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",borderRadius:9,marginBottom:7,animation:"shimmer 1.4s infinite"}}/>;})}
            </div>}
            {news&&news.news&&news.news.map(function(item:any,i:number){
              return <div key={i} style={{background:C.bg1,
                border:"1px solid "+C.border,
                borderLeft:"3px solid "+(item.sentimentColor||C.txt3),
                borderRadius:9,padding:"11px 13px",marginBottom:7,
                animation:"slideUp 0.2s ease forwards",animationDelay:(i*0.04)+"s",opacity:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,
                      padding:"2px 7px",borderRadius:3,color:item.sentimentColor||C.txt2,
                      background:(item.sentimentColor||C.txt2)+"18",
                      border:"1px solid "+(item.sentimentColor||C.txt2)+"44"}}>{item.sentiment}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:C.txt2}}>{item.src}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt3}}>{item.time}</span>
                  </div>
                </div>
                <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,
                  color:C.txt0,lineHeight:1.4,marginBottom:6}}>{item.headline}</div>
                <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,
                  lineHeight:1.7,marginBottom:item.tags?.length?6:0}}>{item.body}</div>
                {item.tags&&item.tags.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {item.tags.map(function(t:string,j:number){
                    return <span key={j} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,
                      color:C.txt3,background:C.bg2,border:"1px solid "+C.border,
                      borderRadius:3,padding:"1px 5px"}}>{t}</span>;
                  })}
                </div>}
              </div>;
            })}
            {!news&&!instNewsLoading&&<div style={{textAlign:"center",padding:"28px",
              background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt3,
                letterSpacing:".1em",marginBottom:4}}>FETCHING NEWS...</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt3}}>
                Searching for {m.l} headlines
              </div>
            </div>}
            <div style={{textAlign:"center",padding:"8px 0",fontFamily:"'IBM Plex Mono',monospace",
              fontSize:9,color:C.txt3,letterSpacing:".06em"}}>
              News from open sources · Tap ↻ to refresh
            </div>
          </div>}
          {/* AI Brief tab */}
          {instDetailTab==="brief"&&<div style={{padding:"12px 14px",flex:1}}>
            {news&&news.brief&&<div style={{background:(isGold?"rgba(212,168,67,0.07)":"rgba(74,158,255,0.07)"),
              border:"1px solid "+(isGold?"rgba(212,168,67,0.25)":"rgba(74,158,255,0.22)"),
              borderLeft:"4px solid "+(isGold?C.gold:lc),
              borderRadius:10,padding:"13px",marginBottom:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,
                color:isGold?C.gold:lc,letterSpacing:".1em",marginBottom:7}}>AI BRIEF · {m.l.toUpperCase()}</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.85}}>
                {news.brief.split(/(\*\*[^*]+\*\*)/).map(function(p:string,i:number){
                  return p.startsWith("**")&&p.endsWith("**")
                    ?<strong key={i} style={{color:C.txt0,fontWeight:700}}>{p.slice(2,-2)}</strong>
                    :<span key={i} style={{color:C.txt1}}>{p}</span>;
                })}
              </div>
            </div>}
            {news&&news.keyLevels&&<div style={{background:C.bg1,border:"1px solid "+C.border,
              borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2,
                letterSpacing:".1em",marginBottom:7}}>KEY LEVELS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:6}}>
                <div style={{background:C.bg2,border:"1px solid rgba(34,212,110,0.3)",
                  borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:2}}>SUPPORT</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:C.up}}>{news.keyLevels.support}</div>
                </div>
                <div style={{background:C.bg2,border:"1px solid rgba(240,69,69,0.3)",
                  borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:2}}>RESISTANCE</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:C.dn}}>{news.keyLevels.resistance}</div>
                </div>
              </div>
              {news.keyLevels.note&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt2,lineHeight:1.6}}>{news.keyLevels.note}</div>}
            </div>}
            {(!news||!news.brief)&&instNewsLoading&&<div>
              {[120,90].map(function(h,i){return <div key={i} style={{height:h,background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",borderRadius:9,marginBottom:7,animation:"shimmer 1.4s infinite"}}/>;})}
            </div>}
            {(!news||!news.brief)&&!instNewsLoading&&<div style={{textAlign:"center",padding:"28px",
              background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt3,letterSpacing:".1em",marginBottom:4}}>
                NO BRIEF YET
              </div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt3}}>
                Tap ↻ Refresh to generate AI analysis
              </div>
            </div>}
          </div>}
        </div>;
      }())}
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
