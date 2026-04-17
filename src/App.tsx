import React, { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

const C = {
  bg0:"#0c1118",bg1:"#111820",bg2:"#162030",bg3:"#1b2840",
  border:"#1e2d40",border2:"#283d58",
  txt0:"#edf2ff",txt1:"#8aa4c4",txt2:"#486080",txt3:"#243347",
  gold:"#c8a840",goldL:"#e8c858",
  up:"#28cc78",upD:"#164830",dn:"#f04040",dnD:"#6c1c1c",
  blue:"#4890f8",amber:"#f09020",vix:"#b858f0",bond:"#40c8d0",
};
const ICFG = {
  NOISE:{color:"#486080",bg:"rgba(72,96,128,0.08)",bar:"#243347"},
  LOW:{color:"#4890f8",bg:"rgba(72,144,248,0.07)",bar:"#1850b0"},
  MODERATE:{color:"#f09020",bg:"rgba(240,144,32,0.07)",bar:"#906020"},
  HIGH:{color:"#f04040",bg:"rgba(240,64,64,0.07)",bar:"#6c1c1c"},
  CRITICAL:{color:"#ff1840",bg:"rgba(255,24,64,0.06)",bar:"#980020"},
};
const SC={"RISK-ON":"#28cc78","RISK-OFF":"#f04040","NEUTRAL":"#486080","MIXED":"#f09020"};
const DC={BULLISH:"#28cc78",BEARISH:"#f04040",NEUTRAL:"#486080"};

// CRITICAL: fetch every 10min — Gold, Silver, Oil, SPX, NDX, DXY, VIX
const TIER1=["XAU/USD","XAG/USD","WTI/USD","SPX","NDX","DX","VIX"];
// IMPORTANT: fetch every 2hrs — FX majors, GBP/JPY, Bonds, Brent
const TIER2=["EUR/USD","GBP/USD","USD/JPY","AUD/USD","USD/CAD","USD/CHF","NZD/USD","GBP/JPY","US10Y","US02Y","BRENT","DJI"];

const INSTRUMENTS=[
  {s:"XAU/USD",l:"GOLD",       b:3230,  cat:"Commodities",grp:"Metals", v:0.004,tier:1},
  {s:"XAG/USD",l:"SILVER",     b:32.14, cat:"Commodities",grp:"Metals", v:0.005,tier:1},
  {s:"WTI/USD",l:"OIL WTI",    b:61.85, cat:"Commodities",grp:"Energy", v:0.005,tier:1},
  {s:"BRENT",  l:"BRENT OIL",  b:65.20, cat:"Commodities",grp:"Energy", v:0.005,tier:2},
  {s:"SPX",    l:"S&P 500",    b:5320,  cat:"Indices",    grp:"US",     v:0.003,tier:1},
  {s:"NDX",    l:"NASDAQ 100", b:18540, cat:"Indices",    grp:"US",     v:0.004,tier:1},
  {s:"DJI",    l:"DOW 30",     b:39820, cat:"Indices",    grp:"US",     v:0.003,tier:2},
  {s:"DAX",    l:"DAX",        b:21250, cat:"Indices",    grp:"EU",     v:0.003,tier:3},
  {s:"FTSE",   l:"FTSE 100",   b:8320,  cat:"Indices",    grp:"EU",     v:0.003,tier:3},
  {s:"DX",     l:"DXY",        b:99.82, cat:"Indices",    grp:"US",     v:0.002,tier:1},
  {s:"VIX",    l:"VIX",        b:21.50, cat:"Volatility", grp:"VIX",    v:0.025,tier:1},
  {s:"EUR/USD",l:"EUR/USD",    b:1.1042,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"GBP/USD",l:"GBP/USD",    b:1.2985,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"USD/JPY",l:"USD/JPY",    b:143.25,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"AUD/USD",l:"AUD/USD",    b:0.6312,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"USD/CAD",l:"USD/CAD",    b:1.3845,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"USD/CHF",l:"USD/CHF",    b:0.8962,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"NZD/USD",l:"NZD/USD",    b:0.5712,cat:"Forex",      grp:"Majors", v:0.002,tier:2},
  {s:"GBP/JPY",l:"GBP/JPY",   b:186.10,cat:"Forex",      grp:"Crosses",v:0.002,tier:2},
  {s:"EUR/JPY",l:"EUR/JPY",   b:158.20,cat:"Forex",      grp:"Crosses",v:0.002,tier:3},
  {s:"AUD/JPY",l:"AUD/JPY",   b:90.42, cat:"Forex",      grp:"Crosses",v:0.002,tier:3},
  {s:"US10Y",  l:"US 10Y",    b:4.38,  cat:"Bonds",      grp:"Yields", v:0.006,tier:2},
  {s:"US02Y",  l:"US 2Y",     b:4.02,  cat:"Bonds",      grp:"Yields", v:0.008,tier:2},
  {s:"US30Y",  l:"US 30Y",    b:4.78,  cat:"Bonds",      grp:"Yields", v:0.005,tier:3},
  {s:"BTC/USD",l:"BITCOIN",   b:83420, cat:"Crypto",     grp:"Major",  v:0.008,tier:3},
  {s:"ETH/USD",l:"ETHEREUM",  b:1580,  cat:"Crypto",     grp:"Major",  v:0.010,tier:3},
];

const CATS=["Indices","Forex","Commodities","Bonds","Volatility","Crypto"];
const DEFAULT_QUAD=["XAU/USD","SPX","DX","WTI/USD"];
const SAMPLES=[
  "Federal Reserve surprises with emergency 50bps rate cut amid banking stress",
  "US CPI comes in at 3.8% vs 3.5% expected, core inflation remains sticky",
  "Iran closes Strait of Hormuz following US airstrike on oil facilities",
  "China PMI falls to 48.2, below the 50 contraction threshold",
  "Russia halts natural gas supply to three European nations",
  "US NFP jobs data comes in at 150k vs 200k expected",
];

const AI_SYS=`You are an elite macro financial analyst and geopolitical strategist. You understand intermarket dynamics, institutional money flows, geopolitical risk cascades and how global events transmit through financial markets. Given a news headline or geopolitical event AND live market prices, provide a deep comprehensive analysis.

Respond ONLY with valid JSON, no extra text, no markdown:
{"impactScore":<0-100>,"impactLevel":"<NOISE|LOW|MODERATE|HIGH|CRITICAL>","marketSentiment":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sentimentShift":"<BULLISH|BEARISH|NEUTRAL>","immediateImpact":"<2-3 sentences: what happens to markets in next 1-4 hours based on current prices>","moneyFlow":"<2 sentences: where is institutional money moving and why - into cash/bonds/gold/equities>","geopoliticalCascade":"<2-3 sentences: explain the full transmission chain of this event through markets - e.g. oil spike → inflation → Fed hawkish → DXY up → Gold mixed → equities down>","affectedInstruments":[{"symbol":"<sym>","direction":"<BULLISH|BEARISH|NEUTRAL>","confidence":<0-100>,"currentPrice":<number>,"targetLevel":<number>,"reason":"<one sentence>"}],"keyDrivers":["<d1>","<d2>","<d3>"],"edgeFinderOverride":{"triggered":<true|false>,"reason":"<if this event overrides a scoring model like EdgeFinder, explain why fundamental/geopolitical conditions now outweigh the statistical score>"},"scenarios":[{"type":"BEARISH_EXTREME","title":"<worst case>","probability":<0-100>,"timeline":"<e.g. 2-5 days>","description":"<2 sentences>","watchFor":"<specific trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+8%>"}]},{"type":"BASE_CASE","title":"<most likely>","probability":<0-100>,"timeline":"<e.g. 1-3 days>","description":"<2 sentences>","watchFor":"<specific trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+3%>"}]},{"type":"BULLISH_REVERSAL","title":"<resolution scenario>","probability":<0-100>,"timeline":"<e.g. 1 week>","description":"<2 sentences>","watchFor":"<specific trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.-2%>"}]}],"keyLevelsToWatch":[{"symbol":"<sym>","level":<number>,"significance":"<why this level is critical now>"}],"traderNote":"<3-4 sentences: actionable insight for a retail trader - what to watch, what to avoid, where the opportunity is>","timeHorizon":"<INTRADAY|SHORT-TERM|MEDIUM-TERM|LONG-TERM>","nextCatalysts":["<specific event, data or news that will move this further>"]}
Rules: Probabilities sum to 100. List 3-5 affected instruments. List 3 key levels. List 3 catalysts. Always explain WHY through the full market transmission chain.`;

const CTX_SYS=`You are a professional macro market analyst. Given live market data provide a comprehensive trading session briefing. Respond ONLY with valid JSON, no extra text:
{"sessionBias":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sessionNote":"<2-3 sentences overall market narrative for today>","dxyDominance":{"status":"<LEADING|LAGGING|NEUTRAL>","analysis":"<2 sentences on DXY vs other markets>","vsGold":"<INVERSE|CORRELATED|DECOUPLED>","vsBonds":"<1 sentence>"},"yieldCurve":{"status":"<NORMAL|INVERTED|FLATTENING|STEEPENING>","analysis":"<2 sentences>"},"moneyFlow":"<2 sentences on where institutional money is positioned today>","topMovers":[{"symbol":"<sym>","direction":"<BULLISH|BEARISH>","potentialMove":"<e.g.+2%>","reason":"<1 sentence>"}],"watchlist":[{"symbol":"<sym>","bias":"<BULLISH|BEARISH|NEUTRAL>","entryZone":"<price range>","reason":"<1 sentence>"}],"keyLevels":[{"symbol":"<sym>","level":<number>,"type":"<RESISTANCE|SUPPORT>","note":"<why>"}],"weeklyOutlook":"<2-3 sentences: what are the key themes and events for this week>","riskEvents":["<specific event this week to watch>"],"goldBias":"<BULLISH|BEARISH|NEUTRAL>","oilOutlook":"<1 sentence>"}
Provide 3 topMovers, 3 watchlist, 3 keyLevels, 2 riskEvents.`;

const INST_SYS=`You are a professional market analyst. Given an instrument and current market context respond ONLY with valid JSON:
{"drivers":["<current factor 1>","<current factor 2>","<current factor 3>"],"shortTerm":{"outlook":"<BULLISH|BEARISH|NEUTRAL>","timeframe":"1-7 days","analysis":"<2 sentences referencing current price>","keyLevel":<number>,"keyLevelType":"<SUPPORT|RESISTANCE>"},"nearTerm":{"outlook":"<BULLISH|BEARISH|NEUTRAL>","timeframe":"1-4 weeks","analysis":"<2 sentences>","keyLevel":<number>,"keyLevelType":"<SUPPORT|RESISTANCE>"},"longTerm":{"outlook":"<BULLISH|BEARISH|NEUTRAL>","timeframe":"1-3 months","analysis":"<2 sentences>","keyLevel":<number>,"keyLevelType":"<SUPPORT|RESISTANCE>"},"monthlyOutlook":"<2 sentences on the monthly macro theme for this instrument>","quarterlyOutlook":"<2 sentences on the next quarter macro view>","summary":"<3 sentences actionable trader note>"}`;

const dp=function(b){return b>=1000?2:b>=10?3:4;};
const fmt=function(v,b){
  if(v==null)return"—";
  return v.toLocaleString(undefined,{minimumFractionDigits:dp(b),maximumFractionDigits:dp(b)});
};
const vixClr=function(v){return v<15?"#28cc78":v<20?"#e8c858":v<30?"#f09020":"#f04040";};
const vixLbl=function(v){return v<15?"CALM":v<20?"NORMAL":v<30?"ELEVATED":"HIGH FEAR";};

function genFB(base,vol,pts){
  pts=pts||48; var data=[]; var p=base*(1-vol*1.8); var now=Date.now();
  for(var i=pts-1;i>=0;i--){
    p=p*(1+(Math.random()-0.491)*vol);
    data.push({t:new Date(now-i*30*60*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),p:parseFloat(p.toFixed(dp(base)))});
  }
  data[data.length-1].p=parseFloat((base*(1+(Math.random()-0.5)*vol*0.25)).toFixed(dp(base)));
  return data;
}

function initMkt(){
  return INSTRUMENTS.map(function(inst){
    var ch=genFB(inst.b,inst.v); var open=ch[0].p; var cur=ch[ch.length-1].p;
    return Object.assign({},inst,{ch:ch,open:open,cur:cur,chg:cur-open,pct:(cur-open)/open*100,live:false,src:"SIM"});
  });
}

function callProxy(body,onSuccess,onError){
  var xhr=new XMLHttpRequest();
  xhr.open("POST","/api/analyze",true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.timeout=30000;
  xhr.onload=function(){
    try{
      var d=JSON.parse(xhr.responseText);
      if(d.type==="error"||(d.error&&d.error.type)){onError((d.error&&d.error.message)?d.error.message:JSON.stringify(d.error));return;}
      if(d.error){onError(typeof d.error==="string"?d.error:JSON.stringify(d.error));return;}
      var txt=(d.content||[]).map(function(x){return x.text||"";}).join("");
      if(!txt){onError("Empty response");return;}
      onSuccess(JSON.parse(txt.replace(/```json/g,"").replace(/```/g,"").trim()));
    }catch(e){onError("Parse error: "+e.message);}
  };
  xhr.onerror=function(){onError("Network error");};
  xhr.ontimeout=function(){onError("Timed out - try again");};
  xhr.send(JSON.stringify(body));
}

function ChartTip(props){
  if(!props.active||!props.payload||!props.payload.length)return null;
  return <div style={{background:"#1b2840",border:"1px solid #283d58",borderRadius:6,padding:"7px 11px",fontSize:11}}>
    <div style={{color:"#edf2ff",fontWeight:600}}>{props.payload[0]&&props.payload[0].value&&props.payload[0].value.toLocaleString()}</div>
    <div style={{color:"#486080",marginTop:1}}>{props.label}</div>
  </div>;
}

export default function Auxiron(){
  var [tab,setTab]=useState("markets");
  var [macroAnalysis,setMacroAnalysis]=useState(null);
  var [macroLoading,setMacroLoading]=useState(false);
  var [macroQuery,setMacroQuery]=useState("");
  var [activeScenario,setActiveScenario]=useState(null);
  var [mkt,setMkt]=useState(initMkt);
  var [sel,setSel]=useState("XAU/USD");
  var [cv,setCv]=useState("single");
  var [quad,setQuad]=useState(DEFAULT_QUAD);
  var [editQ,setEditQ]=useState(false);
  var [catF,setCatF]=useState("All");
  var [hl,setHl]=useState("");
  var [result,setResult]=useState(null);
  var [loading,setLoading]=useState(false);
  var [err,setErr]=useState(null);
  var [hist,setHist]=useState([]);
  var [nowStr,setNowStr]=useState("");
  var [ctx,setCtx]=useState(null);
  var [ctxLoading,setCtxLoading]=useState(false);
  var [lastRefresh,setLastRefresh]=useState(null);
  var [detailInst,setDetailInst]=useState(null);
  var [instAnalysis,setInstAnalysis]=useState(null);
  var [instLoading,setInstLoading]=useState(false);
  var cycleRef=useRef(0);

  useEffect(function(){
    var id=setInterval(function(){setNowStr(new Date().toUTCString().slice(0,25));},1000);
    setNowStr(new Date().toUTCString().slice(0,25));
    return function(){clearInterval(id);};
  },[]);

  function applyPrices(combined){
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

  var fetchBatch=useCallback(function(syms){
    if(!syms||syms.length===0)return;
    var batches=[];
    for(var i=0;i<syms.length;i+=8)batches.push(syms.slice(i,i+8));
    Promise.allSettled(batches.map(function(b){
      return fetch("/api/prices?symbol="+encodeURIComponent(b.join(","))).then(function(r){return r.json();});
    })).then(function(results){
      var combined={};
      results.forEach(function(r){if(r.status==="fulfilled"&&r.value&&typeof r.value==="object")Object.assign(combined,r.value);});
      applyPrices(combined);
    }).catch(function(){});
  },[]);

  var fetchChart=useCallback(function(sym){
    fetch("/api/prices?symbol="+encodeURIComponent(sym)+"&endpoint=timeseries&interval=30min&outputsize=48")
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.status==="error"||!d.values||!d.values.length)return;
        var ch=d.values.slice().reverse().map(function(v){
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

  // Tiered fetch: T1 every 10min, T2 every 2hrs (12th cycle)
  useEffect(function(){
    fetchBatch(TIER1);
    setTimeout(function(){fetchBatch(TIER2);},5000);
    var id=setInterval(function(){
      cycleRef.current++;
      fetchBatch(TIER1);
      if(cycleRef.current%12===0)fetchBatch(TIER2);
    },600000); // 10 minutes
    return function(){clearInterval(id);};
  },[fetchBatch]);

  useEffect(function(){fetchChart(sel);},[sel,fetchChart]);

  // Sim for non-live instruments only
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
      return["XAU/USD","WTI/USD","DX","US10Y","US02Y","VIX","SPX","NDX","EUR/USD","GBP/USD","USD/JPY","BRENT"].indexOf(i.s)>=0;
    }).map(function(i){
      return i.l+": "+fmt(i.cur,i.b)+(i.cat==="Bonds"?"% yield":"")+
        " ("+(i.pct>=0?"+":"")+i.pct.toFixed(2)+"%)"+
        (i.live?"":" [SIM]");
    }).join(", ");
  }

  function analyze(text){
    var inp=(text||hl).trim(); if(!inp)return;
    setLoading(true); setErr(null); setResult(null);
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:2500,system:AI_SYS,
       messages:[{role:"user",content:"LIVE MARKET DATA:\n"+getSnap()+"\n\nEVENT/HEADLINE TO ANALYZE:\n"+inp}]},
      function(res){setResult(res);setHist(function(p){return[{headline:inp,result:res,ts:new Date()}].concat(p.slice(0,7));});setLoading(false);},
      function(e){setErr("Failed: "+e);setLoading(false);}
    );
  }

  function fetchCtx(){
    setCtxLoading(true); setCtx(null);
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:1800,system:CTX_SYS,
       messages:[{role:"user",content:"Live market data: "+getSnap()+"\nGenerate comprehensive session briefing."}]},
      function(res){setCtx(res);setLastRefresh(new Date());setCtxLoading(false);},
      function(){setCtxLoading(false);}
    );
  }

  function openDetail(inst){
    setDetailInst(inst); setInstAnalysis(null); setInstLoading(true);
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:1500,system:INST_SYS,
       messages:[{role:"user",content:"Instrument: "+inst.l+" ("+inst.s+")\nCurrent Price: "+fmt(inst.cur,inst.b)+(inst.cat==="Bonds"?"%":"")+"\nDaily Change: "+(inst.pct>=0?"+":"")+inst.pct.toFixed(2)+"%\nMarket Context: "+getSnap()}]},
      function(res){setInstAnalysis(res);setInstLoading(false);},
      function(){setInstLoading(false);}
    );
  }

  
  // ── MACRO INTELLIGENCE ───────────────────────────────────────────────────
  var MACRO_SYS = `You are a world-class macro strategist and financial historian with deep knowledge of intermarket relationships, historical patterns and global risk frameworks. Given live market data and a query, respond ONLY with valid JSON:
{"title":"<analysis title>","overallRisk":"<LOW|MODERATE|HIGH|EXTREME>","marketRegime":"<RISK-ON|RISK-OFF|TRANSITION|CRISIS>","executiveSummary":"<3-4 sentences on current macro environment>","riskScenarios":[{"id":<1-5>,"category":"<GEOPOLITICAL|MONETARY|CREDIT|LIQUIDITY|GROWTH|INFLATION|ENERGY|CURRENCY>","title":"<name>","probabilityPct":<0-100>,"status":"<ACTIVE|WATCH|DORMANT>","description":"<2-3 sentences>","triggerEvents":["<event1>","<event2>"],"marketImpact":{"equities":"<BULLISH|BEARISH|NEUTRAL> — <why>","gold":"<BULLISH|BEARISH|NEUTRAL> — <why>","oil":"<BULLISH|BEARISH|NEUTRAL> — <why>","dxy":"<BULLISH|BEARISH|NEUTRAL> — <why>","bonds":"<BULLISH|BEARISH|NEUTRAL> — <why>"},"historicalAnalog":"<historical event this resembles and outcome>","timeline":"<how quickly this plays out>"}],"timelineOutlook":{"week":"<next 7 days>","month":"<next 30 days>","quarter":"<next 90 days>","year":"<12 month thesis>"},"historicPatterns":[{"pattern":"<name>","currentMatch":"<how current conditions match>","historicalOutcome":"<what happened last time>","impliedMove":"<what this suggests for markets>"},{"pattern":"<name2>","currentMatch":"<match>","historicalOutcome":"<outcome>","impliedMove":"<move>"}],"moneyFlowAnalysis":"<3-4 sentences on institutional positioning>","keyWatchlist":[{"instrument":"<sym>","signal":"<what to watch>","threshold":"<price/level>","implication":"<what it means>"},{"instrument":"<sym2>","signal":"<watch>","threshold":"<level>","implication":"<means>"},{"instrument":"<sym3>","signal":"<watch>","threshold":"<level>","implication":"<means>"}],"traderActionPlan":"<4-5 sentences: concrete guidance for retail trader — what to trade, avoid, how to size, key levels>"}
Provide exactly 5 riskScenarios ordered by probability. Reference current prices throughout.`;

  function fetchMacro(query){
    setMacroLoading(true); setMacroAnalysis(null);
    var snap=getSnap();
    var msg="LIVE MARKET DATA:\n"+snap+"\n\nMACRO ANALYSIS REQUEST:\n"+(query||"Provide comprehensive macro risk analysis of current market environment. Cover all major risk scenarios, historical patterns, timeline outlook and actionable trader guidance.");
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3000,system:MACRO_SYS,messages:[{role:"user",content:msg}]},
      function(res){setMacroAnalysis(res);setMacroLoading(false);},
      function(e){console.log("Macro error:",e);setMacroLoading(false);}
    );
  }

  function toggleQuad(sym){
    setQuad(function(prev){
      if(prev.indexOf(sym)>=0)return prev.length>1?prev.filter(function(s){return s!==sym;}):prev;
      if(prev.length>=4)return prev.slice(1).concat([sym]);
      return prev.concat([sym]);
    });
  }

  var cfg=result?(ICFG[result.impactLevel]||ICFG.NOISE):null;
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

  var displayed=mkt.filter(function(m){
    if(catF==="All")return m.tier<=2;
    return m.cat===catF;
  });

  const NAV=[
    {key:"markets",icon:"◫",label:"Markets"},
    {key:"charts", icon:"▦",label:"Charts"},
    {key:"session",icon:"◉",label:"Session"},
    {key:"macro",  icon:"⬡",label:"Macro"},
    {key:"filter", icon:"◈",label:"AI Filter"},
  ];

  return(
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:C.bg0,fontFamily:"'DM Mono','Courier New',monospace",color:C.txt0,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{display:none;}
        textarea:focus{outline:none;}
        button{-webkit-tap-highlight-color:transparent;cursor:pointer;font-family:inherit;}
        .tap:active{opacity:0.6;}
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.28s ease forwards;}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:0.1}} .pd{animation:pd 1.5s ease infinite;}
        @keyframes sp{to{transform:rotate(360deg)}} .sp{animation:sp 0.8s linear infinite;}
        @keyframes tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .tk{animation:tk 65s linear infinite;display:inline-block;white-space:nowrap;} .tk:hover{animation-play-state:paused;}
      `}</style>

      {/* HEADER */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:stClr,boxShadow:"0 0 8px "+stClr}} className="pd"/>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,letterSpacing:".1em",color:C.txt0}}>AUX</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,letterSpacing:".1em",color:C.gold}}>IRON</span>
          <span style={{fontSize:8,background:"rgba(200,168,64,0.12)",color:C.gold,padding:"2px 6px",borderRadius:3,letterSpacing:".1em",border:"1px solid rgba(200,168,64,0.22)"}}>PRO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {goldI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.gold}}>AU</span>
            <span style={{fontSize:11,fontWeight:600,color:goldI.pct>=0?C.up:C.dn,fontVariantNumeric:"tabular-nums"}}>{fmt(goldI.cur,goldI.b)}</span>
            <span style={{fontSize:8,color:goldI.pct>=0?C.up:C.dn}}>{goldI.pct>=0?"+":""}{goldI.pct.toFixed(1)}%</span>
          </div>}
          {vixI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>VIX</span>
            <span style={{fontSize:11,fontWeight:600,color:vixClr(vixI.cur)}}>{vixI.cur.toFixed(2)}</span>
          </div>}
          {dxyI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>DXY</span>
            <span style={{fontSize:11,fontWeight:600,color:dxyI.pct>=0?C.dn:C.up}}>{dxyI.cur.toFixed(2)}</span>
          </div>}
          <span style={{fontSize:8,color:stClr,letterSpacing:".05em"}}>● {anyLive?"LIVE":"SIM"}</span>
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

      <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>

        {/* MARKETS TAB */}
        {tab==="markets"&&<div>
          <div style={{padding:"8px 12px",display:"flex",gap:5,overflowX:"auto",borderBottom:"1px solid "+C.border}}>
            {["All"].concat(CATS).map(function(c){
              var active=catF===c;
              return <button key={c} className="tap" onClick={function(){setCatF(c);}} style={{background:active?"rgba(200,168,64,0.12)":C.bg2,border:active?"1px solid rgba(200,168,64,0.38)":"1px solid "+C.border,color:active?C.goldL:C.txt2,borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:500,whiteSpace:"nowrap"}}>{c==="Volatility"?"VIX":c}</button>;
            })}
          </div>

          {(catF==="All"||catF==="Bonds")&&y2&&y10&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:6}}>YIELD CURVE</div>
            <div style={{display:"flex",gap:6,overflowX:"auto"}}>
              {[y2,y10].map(function(m){
                return <div key={m.s} className="tap" onClick={function(){openDetail(m);}} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 12px",flexShrink:0,minWidth:88}}>
                  <div style={{fontSize:8,color:C.bond,marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:15,fontWeight:600,color:C.txt0,fontVariantNumeric:"tabular-nums"}}>{m.cur.toFixed(3)}<span style={{fontSize:9,color:C.txt2}}>%</span></div>
                  <div style={{fontSize:9,color:m.chg>=0?C.dn:C.up}}>{m.chg>=0?"+":""}{m.chg.toFixed(3)}</div>
                </div>;
              })}
              {spread!==null&&<div style={{background:inverted?"rgba(240,64,64,0.08)":"rgba(40,204,120,0.06)",border:"1px solid "+(inverted?C.dnD:C.upD),borderRadius:8,padding:"7px 12px",flexShrink:0,minWidth:88}}>
                <div style={{fontSize:8,color:C.txt2,marginBottom:2}}>2s10s</div>
                <div style={{fontSize:15,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</div>
                <div style={{fontSize:8,color:inverted?C.dn:C.up}}>{inverted?"▼ INVERTED":"▲ NORMAL"}</div>
              </div>}
            </div>
          </div>}

          {(catF==="All"||catF==="Volatility")&&vixI&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:6}}>VOLATILITY — VIX</div>
            <div className="tap" onClick={function(){openDetail(vixI);}} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:26,fontWeight:700,color:vixClr(vixI.cur),fontFamily:"'Syne',sans-serif"}}>{vixI.cur.toFixed(2)}</div>
                <div style={{fontSize:10,fontWeight:600,color:vixClr(vixI.cur),marginTop:2}}>{vixLbl(vixI.cur)}</div>
                <div style={{fontSize:9,color:C.txt2,marginTop:1}}>{vixI.pct>=0?"+":""}{vixI.pct.toFixed(2)}% today</div>
              </div>
              <div style={{flex:2}}>
                <div style={{position:"relative",height:8,background:C.bg2,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                  {[{v:15,c:"#28cc78"},{v:20,c:"#e8c858"},{v:30,c:"#f09020"},{v:50,c:"#f04040"}].map(function(seg,idx,arr){
                    var prev=idx===0?0:arr[idx-1].v;
                    return <div key={idx} style={{position:"absolute",left:((prev/50)*100)+"%",width:(((seg.v-prev)/50)*100)+"%",height:"100%",background:seg.c,opacity:0.3}}></div>;
                  })}
                  <div style={{position:"absolute",left:Math.min(vixI.cur/50*100,98)+"%",top:-2,width:3,height:12,background:vixClr(vixI.cur),borderRadius:2}}></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.txt1}}>
                  <span>0</span><span>15</span><span>20</span><span>30</span><span>50+</span>
                </div>
              </div>
            </div>
          </div>}

          <div style={{padding:"8px 12px",display:"grid",gap:5}}>
            {displayed.map(function(m){
              var up=m.pct>=0; var isVix=m.s==="VIX"; var isBond=m.cat==="Bonds";
              var lc=isVix?C.vix:isBond?C.bond:up?C.up:C.dn;
              return <div key={m.s} className="tap" onClick={function(){openDetail(m);}} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.txt0}}>{m.l}</div>
                  <div style={{fontSize:10,color:C.txt1,marginTop:1,display:"flex",alignItems:"center",gap:5}}>
                    <span>{m.s}</span>
                    {m.live?<span style={{color:C.up,fontSize:7}}>● LIVE</span>:<span style={{color:C.txt3,fontSize:7}}>SIM</span>}
                    {m.tier===1&&<span style={{color:C.gold,fontSize:7}}>10m</span>}
                    {m.tier===2&&<span style={{color:C.txt3,fontSize:7}}>2h</span>}
                  </div>
                </div>
                <div style={{width:55,height:22}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.ch.slice(-14)} margin={{top:1,right:0,bottom:1,left:0}}>
                      <Line type="monotone" dataKey="p" stroke={lc} strokeWidth={1.4} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{textAlign:"right",minWidth:80}}>
                  <div style={{fontSize:14,fontWeight:600,color:isVix?vixClr(m.cur):isBond?C.bond:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                  <div style={{fontSize:12,fontWeight:500,marginTop:1,fontVariantNumeric:"tabular-nums",color:isVix?(up?C.dn:C.up):up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}% {up?"▲":"▼"}</div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* CHARTS TAB */}
        {tab==="charts"&&<div className="fu">
          <div style={{padding:"8px 12px",display:"flex",gap:5,borderBottom:"1px solid "+C.border,overflowX:"auto",alignItems:"center"}}>
            {[["single","SINGLE"],["quad","QUAD"],["grid","GRID"]].map(function(pair){
              return <button key={pair[0]} className="tap" onClick={function(){setCv(pair[0]);}} style={{background:cv===pair[0]?"rgba(200,168,64,0.12)":C.bg2,border:cv===pair[0]?"1px solid rgba(200,168,64,0.4)":"1px solid "+C.border,color:cv===pair[0]?C.goldL:C.txt2,borderRadius:20,padding:"4px 12px",fontSize:9,fontWeight:500,whiteSpace:"nowrap"}}>{pair[1]}</button>;
            })}
            {cv==="quad"&&<button className="tap" onClick={function(){setEditQ(!editQ);}} style={{background:editQ?"rgba(72,144,248,0.12)":C.bg2,border:editQ?"1px solid rgba(72,144,248,0.4)":"1px solid "+C.border,color:editQ?C.blue:C.txt2,borderRadius:20,padding:"4px 12px",fontSize:9,marginLeft:"auto"}}>✎ EDIT</button>}
          </div>
          {cv==="quad"&&editQ&&<div style={{padding:"10px 12px",background:C.bg2,borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:11,color:C.txt1,letterSpacing:".1em",marginBottom:7}}>PICK UP TO 4 — {quad.length}/4</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,maxHeight:160,overflowY:"auto"}}>
              {mkt.map(function(m){
                var isSel=quad.indexOf(m.s)>=0;
                return <button key={m.s} className="tap" onClick={function(){toggleQuad(m.s);}} style={{background:isSel?"rgba(200,168,64,0.15)":C.bg1,border:isSel?"1px solid rgba(200,168,64,0.45)":"1px solid "+C.border,color:isSel?C.goldL:C.txt2,borderRadius:6,padding:"3px 8px",fontSize:8}}>{m.l}</button>;
              })}
            </div>
          </div>}
          {cv==="single"&&<div style={{padding:"7px 12px",display:"flex",gap:4,overflowX:"auto",borderBottom:"1px solid "+C.border}}>
            {mkt.filter(function(m){return m.tier<=2;}).map(function(m){
              var isSel=sel===m.s;
              return <button key={m.s} className="tap" onClick={function(){setSel(m.s);fetchChart(m.s);}} style={{background:isSel?"rgba(200,168,64,0.12)":C.bg2,border:isSel?"1px solid rgba(200,168,64,0.4)":"1px solid "+C.border,color:isSel?C.goldL:C.txt2,borderRadius:20,padding:"4px 10px",fontSize:8,fontWeight:isSel?500:400,whiteSpace:"nowrap"}}>{m.l}</button>;
            })}
          </div>}
          {cv==="single"&&selI&&<div style={{padding:"12px"}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"14px"}}>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:C.txt1,letterSpacing:".1em",marginBottom:2}}>{selI.s} · {selI.cat} · {selI.live?"● LIVE":"SIM"}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(selI.cur,selI.b)}{selI.cat==="Bonds"?"%":""}</div>
                <div style={{display:"flex",gap:10,marginTop:3}}>
                  <span style={{fontSize:12,color:selI.pct>=0?C.up:C.dn}}>{selI.pct>=0?"+":""}{selI.pct.toFixed(2)}%</span>
                  <span style={{fontSize:9,color:C.txt2}}>Open {fmt(selI.open,selI.b)}</span>
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
                  <XAxis dataKey="t" tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} interval={8}/>
                  <YAxis domain={["auto","auto"]} tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} width={56} tickFormatter={function(v){return fmt(v,selI.b);}}/>
                  <Tooltip content={<ChartTip/>}/>
                  <ReferenceLine y={selI.open} stroke={C.border2} strokeDasharray="3 3"/>
                  <Area type="monotone" dataKey="p" stroke={selI.pct>=0?C.up:C.dn} strokeWidth={2} fill="url(#cg)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginTop:10}}>
                {[
                  ["HIGH",Math.max.apply(null,selI.ch.map(function(d){return d.p;})),C.up],
                  ["LOW", Math.min.apply(null,selI.ch.map(function(d){return d.p;})),C.dn],
                  ["OPEN",selI.open,C.txt1],
                  ["RANGE",((Math.max.apply(null,selI.ch.map(function(d){return d.p;}))-Math.min.apply(null,selI.ch.map(function(d){return d.p;})))/selI.open*100).toFixed(2)+"%",C.amber],
                ].map(function(item){
                  return <div key={item[0]} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"6px 7px",textAlign:"center"}}>
                    <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:1}}>{item[0]}</div>
                    <div style={{fontSize:9,fontWeight:500,color:item[2],fontVariantNumeric:"tabular-nums"}}>{typeof item[1]==="string"?item[1]:fmt(item[1],selI.b)}</div>
                  </div>;
                })}
              </div>
            </div>
          </div>}
          {cv==="quad"&&<div style={{padding:"12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {quad.map(function(sym){
              var m=mkt.find(function(d){return d.s===sym;}); if(!m)return null;
              var up=m.pct>=0; var isVix=m.s==="VIX"; var isBond=m.cat==="Bonds";
              var lc=isVix?C.vix:isBond?C.bond:up?C.up:C.dn;
              var gid="g"+sym.replace(/[^a-z0-9]/gi,"_");
              return <div key={sym} className="tap" onClick={function(){setSel(sym);setCv("single");fetchChart(sym);}} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"11px"}}>
                <div style={{fontSize:8,color:C.txt2,marginBottom:1}}>{m.l}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:isVix?vixClr(m.cur):C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                <div style={{fontSize:9,color:isVix?(up?C.dn:C.up):up?C.up:C.dn,marginBottom:5}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                <ResponsiveContainer width="100%" height={72}>
                  <AreaChart data={m.ch} margin={{top:2,right:2,bottom:2,left:2}}>
                    <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={lc} stopOpacity={0.12}/><stop offset="95%" stopColor={lc} stopOpacity={0}/></linearGradient></defs>
                    <YAxis domain={["auto","auto"]} hide/>
                    <ReferenceLine y={m.open} stroke={C.border} strokeDasharray="2 2"/>
                    <Area type="monotone" dataKey="p" stroke={lc} strokeWidth={1.8} fill={"url(#"+gid+")"} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>;
            })}
            {Array.from({length:Math.max(0,4-quad.length)}).map(function(_,i){
              return <div key={"e"+i} className="tap" onClick={function(){setEditQ(true);}} style={{background:C.bg1,border:"1px dashed "+C.border,borderRadius:10,padding:"11px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:130}}>
                <span style={{fontSize:10,color:C.txt3}}>+ ADD</span>
              </div>;
            })}
          </div>}
          {cv==="grid"&&<div style={{padding:"12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {mkt.map(function(m){
              var up=m.pct>=0; var isVix=m.s==="VIX"; var isBond=m.cat==="Bonds";
              var lc=isVix?C.vix:isBond?C.bond:up?C.up:C.dn;
              return <div key={m.s} className="tap" onClick={function(){openDetail(m);}} style={{background:C.bg1,border:"1px solid "+(sel===m.s?"rgba(200,168,64,0.3)":C.border),borderRadius:9,padding:"9px"}}>
                <div style={{fontSize:8,color:C.txt2,marginBottom:1}}>{m.l}</div>
                <div style={{fontSize:11,fontWeight:500,color:isVix?vixClr(m.cur):C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                <div style={{fontSize:9,color:isVix?(up?C.dn:C.up):up?C.up:C.dn,marginBottom:4}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                <ResponsiveContainer width="100%" height={40}>
                  <LineChart data={m.ch.slice(-16)} margin={{top:0,right:0,bottom:0,left:0}}>
                    <Line type="monotone" dataKey="p" stroke={lc} strokeWidth={1.4} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>;
            })}
          </div>}
        </div>}

        {/* SESSION TAB */}
        {tab==="session"&&<div style={{padding:"12px"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>SESSION BRIEFING</div>
              <div style={{fontSize:8,color:C.txt2,marginTop:1}}>{nowStr}</div>
            </div>
            <button className="tap" onClick={fetchCtx} disabled={ctxLoading} style={{background:ctxLoading?C.bg2:C.gold,color:ctxLoading?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"7px 14px",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
              {ctxLoading?[<div key="sp" className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"GENERATING…"]:"◉ GENERATE"}
            </button>
          </div>

          {/* Snapshot */}
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:8}}>LIVE SNAPSHOT</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {["XAU/USD","DX","US10Y","VIX","SPX","NDX","WTI/USD","GBP/USD"].map(function(sym){
                var m=mkt.find(function(d){return d.s===sym;}); if(!m)return null;
                var up=m.pct>=0; var isVix=m.s==="VIX"; var isBond=m.cat==="Bonds";
                return <div key={sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg2,borderRadius:7,padding:"7px 10px",border:"1px solid "+C.border}}>
                  <div>
                    <div style={{fontSize:8,color:C.txt2}}>{m.l}</div>
                    <div style={{fontSize:14,fontWeight:600,color:isVix?vixClr(m.cur):isBond?C.bond:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                  </div>
                  <div style={{fontSize:10,fontWeight:500,color:isVix?(up?C.dn:C.up):up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                </div>;
              })}
            </div>
          </div>

          {/* Yield Curve Visual */}
          {y2&&y10&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em"}}>YIELD CURVE</div>
              <div style={{fontSize:8,color:inverted?C.dn:C.up,fontWeight:600}}>{inverted?"▼ INVERTED":"▲ NORMAL"} {spread!==null&&(spread>0?"+":"")+spread+"%"}</div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
              {[y2,y10].map(function(m,i){
                var maxY=Math.max(y2.cur,y10.cur); var h=Math.max((m.cur/maxY)*50,8);
                return <div key={m.s} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:9,fontWeight:600,color:C.bond}}>{m.cur.toFixed(2)}%</div>
                  <div style={{width:"100%",height:h,background:"rgba(64,200,208,0.20)",border:"1px solid "+C.bond,borderRadius:3}}></div>
                  <div style={{fontSize:12,color:C.txt1}}>{["2Y","10Y"][i]}</div>
                </div>;
              })}
            </div>
          </div>}

          {!ctx&&!ctxLoading&&<div style={{textAlign:"center",padding:"30px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
            <div style={{fontSize:24,color:C.txt3,marginBottom:6,opacity:0.3}}>◉</div>
            <div style={{fontSize:10,color:C.txt3,letterSpacing:".1em"}}>TAP GENERATE FOR AI SESSION BRIEFING</div>
            <div style={{fontSize:9,color:C.txt3,marginTop:4,opacity:0.6}}>Includes DXY dominance, money flow, weekly outlook</div>
          </div>}

          {ctx&&<div className="fu">
            {/* Session Bias */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em"}}>SESSION BIAS</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:SC[ctx.sessionBias]||C.txt1,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(200,200,200,0.1)",borderRadius:6,padding:"3px 10px"}}>{ctx.sessionBias}</span>
                  {lastRefresh&&<span style={{fontSize:12,color:C.txt1}}>{lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
                </div>
              </div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75,marginBottom:8}}>{ctx.sessionNote}</div>
              {ctx.moneyFlow&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:3}}>💰 MONEY FLOW</div>
                <div style={{fontSize:12,color:C.txt0,lineHeight:1.6}}>{ctx.moneyFlow}</div>
              </div>}
            </div>

            {/* DXY Dominance */}
            {ctx.dxyDominance&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em"}}>DXY DOMINANCE</div>
                <span style={{fontSize:10,fontWeight:700,color:ctx.dxyDominance.status==="LEADING"?C.dn:ctx.dxyDominance.status==="LAGGING"?C.up:C.amber,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(200,200,200,0.1)",borderRadius:5,padding:"2px 8px"}}>{ctx.dxyDominance.status}</span>
              </div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.7,marginBottom:8}}>{ctx.dxyDominance.analysis}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:3}}>vs GOLD</div>
                  <div style={{fontSize:10,fontWeight:600,color:ctx.dxyDominance.vsGold==="INVERSE"?C.amber:ctx.dxyDominance.vsGold==="CORRELATED"?C.up:C.txt2}}>{ctx.dxyDominance.vsGold}</div>
                </div>
                <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:3}}>vs BONDS</div>
                  <div style={{fontSize:9,color:C.txt1,lineHeight:1.5}}>{ctx.dxyDominance.vsBonds}</div>
                </div>
              </div>
            </div>}

            {/* Yield Curve AI */}
            {ctx.yieldCurve&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em"}}>YIELD CURVE SIGNAL</div>
                <span style={{fontSize:10,fontWeight:700,color:ctx.yieldCurve.status==="INVERTED"?C.dn:ctx.yieldCurve.status==="NORMAL"?C.up:C.amber,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(200,200,200,0.1)",borderRadius:5,padding:"2px 8px"}}>{ctx.yieldCurve.status}</span>
              </div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.65}}>{ctx.yieldCurve.analysis}</div>
            </div>}

            {/* Weekly Outlook */}
            {ctx.weeklyOutlook&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:8,color:C.blue,letterSpacing:".1em",marginBottom:5}}>📅 WEEKLY OUTLOOK</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{ctx.weeklyOutlook}</div>
            </div>}

            {/* Top Movers */}
            {ctx.topMovers&&ctx.topMovers.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:8}}>🔥 TOP MOVERS TODAY</div>
              <div style={{display:"grid",gap:6}}>
                {ctx.topMovers.map(function(m,i){
                  var inst=mkt.find(function(d){return d.s===m.symbol||d.l===m.symbol;});
                  var isUp=m.direction==="BULLISH";
                  return <div key={i} className="tap" onClick={function(){if(inst)openDetail(inst);}} style={{background:C.bg2,border:"1px solid "+(isUp?C.upD:C.dnD),borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,fontWeight:600,color:C.txt0}}>{m.symbol}</span>
                        <span style={{fontSize:9,fontWeight:600,color:isUp?C.up:C.dn}}>{isUp?"▲":"▼"} {m.direction}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:isUp?C.up:C.dn}}>{m.potentialMove}</span>
                    </div>
                    <div style={{fontSize:12,color:C.txt1,lineHeight:1.5}}>{m.reason}</div>
                    {inst&&<div style={{fontSize:9,color:C.txt3,marginTop:3}}>Now: {fmt(inst.cur,inst.b)} ({inst.pct>=0?"+":""}{inst.pct.toFixed(2)}%)</div>}
                  </div>;
                })}
              </div>
            </div>}

            {/* Watchlist */}
            {ctx.watchlist&&ctx.watchlist.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:8}}>◈ WATCHLIST — CROSS-CHECK WITH EDGEFINDER</div>
              <div style={{display:"grid",gap:5}}>
                {ctx.watchlist.map(function(item,i){
                  var inst=mkt.find(function(d){return d.s===item.symbol||d.l===item.symbol;});
                  return <div key={i} className="tap" onClick={function(){if(inst)openDetail(inst);}} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:12,fontWeight:600,color:C.txt0}}>{item.symbol}</span>
                        <span style={{fontSize:9,fontWeight:600,color:item.bias==="BULLISH"?C.up:item.bias==="BEARISH"?C.dn:C.amber}}>{item.bias}</span>
                      </div>
                      {inst&&<span style={{fontSize:10,color:inst.pct>=0?C.up:C.dn}}>{fmt(inst.cur,inst.b)}</span>}
                    </div>
                    <div style={{fontSize:11,color:C.gold,marginBottom:3}}>Entry zone: {item.entryZone}</div>
                    <div style={{fontSize:12,color:C.txt1,lineHeight:1.5}}>{item.reason}</div>
                  </div>;
                })}
              </div>
            </div>}

            {/* Key Levels */}
            {ctx.keyLevels&&ctx.keyLevels.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:7}}>KEY LEVELS</div>
              {ctx.keyLevels.map(function(kl,i){
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<ctx.keyLevels.length-1?6:0,background:C.bg2,borderRadius:7,padding:"8px 10px",border:"1px solid "+C.border}}>
                  <div style={{fontSize:9,fontWeight:600,color:C.txt0,minWidth:65}}>{kl.symbol}</div>
                  <div style={{fontSize:11,fontWeight:600,color:kl.type==="RESISTANCE"?C.dn:C.up,minWidth:60}}>{kl.level}</div>
                  <div style={{fontSize:8,color:kl.type==="RESISTANCE"?C.dn:C.up,minWidth:68}}>{kl.type}</div>
                  <div style={{flex:1,fontSize:9,color:C.txt2}}>{kl.note}</div>
                </div>;
              })}
            </div>}

            {/* Risk Events + Gold/Oil */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px"}}>
              {ctx.riskEvents&&ctx.riskEvents.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:6}}>⚠ RISK EVENTS THIS WEEK</div>
                {ctx.riskEvents.map(function(ev,i){
                  return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:i<ctx.riskEvents.length-1?5:0,background:"rgba(240,144,32,0.07)",border:"1px solid rgba(240,144,32,0.2)",borderRadius:7,padding:"7px 10px"}}>
                    <span style={{color:C.amber,fontSize:10,flexShrink:0}}>→</span>
                    <span style={{fontSize:12,color:C.txt0,lineHeight:1.6}}>{ev}</span>
                  </div>;
                })}
              </div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:3}}>GOLD BIAS</div>
                  <div style={{fontSize:12,fontWeight:700,color:DC[ctx.goldBias]||C.txt1}}>{ctx.goldBias}</div>
                </div>
                {ctx.oilOutlook&&<div>
                  <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:3}}>OIL OUTLOOK</div>
                  <div style={{fontSize:9,color:C.txt2,lineHeight:1.5}}>{ctx.oilOutlook}</div>
                </div>}
              </div>
            </div>
          </div>}
        </div>}

        {/* MACRO INTELLIGENCE TAB */}
        {tab==="macro"&&<div style={{padding:"12px"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>MACRO INTELLIGENCE</div>
              <div style={{fontSize:10,color:C.txt1,marginTop:1}}>Risk scenarios · Historic patterns · Timeline outlook</div>
            </div>
            <button className="tap" onClick={function(){fetchMacro(macroQuery);}} disabled={macroLoading}
              style={{background:macroLoading?C.bg2:C.gold,color:macroLoading?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"7px 14px",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
              {macroLoading?[<div key="sp" className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"ANALYZING…"]:"⬡ GENERATE"}
            </button>
          </div>

          {/* Custom query input */}
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{fontSize:10,color:C.txt1,marginBottom:6}}>Custom analysis (optional)</div>
            <textarea value={macroQuery} onChange={function(e){setMacroQuery(e.target.value);}}
              placeholder="e.g. Analyze Iran-US war escalation impact... or leave blank for full macro scan"
              rows={2} style={{width:"100%",background:"transparent",border:"none",color:C.txt0,fontSize:12,resize:"none",lineHeight:1.6,fontFamily:"inherit"}}/>
          </div>

          {/* Quick scenarios */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.txt1,marginBottom:6}}>QUICK SCENARIOS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {["Oil shock & Strait of Hormuz","Fed pivot scenarios","China slowdown contagion","Dollar collapse thesis","Credit crisis signals","Gold bull run drivers","Geopolitical risk matrix","Recession probability now"].map(function(q,i){
                return <button key={i} className="tap" onClick={function(){setMacroQuery(q);fetchMacro(q);}}
                  style={{background:C.bg2,border:"1px solid "+C.border,color:C.txt1,borderRadius:7,padding:"6px 11px",fontSize:10,textAlign:"left"}}>
                  {q}
                </button>;
              })}
            </div>
          </div>

          {!macroAnalysis&&!macroLoading&&<div style={{textAlign:"center",padding:"40px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,color:C.txt3,marginBottom:8,opacity:0.25}}>⬡</div>
            <div style={{fontSize:12,color:C.txt2,letterSpacing:".08em",marginBottom:4}}>MACRO RISK INTELLIGENCE</div>
            <div style={{fontSize:10,color:C.txt3}}>Tap GENERATE for full risk scenario matrix</div>
            <div style={{fontSize:10,color:C.txt3,marginTop:2}}>or select a quick scenario above</div>
          </div>}

          {macroAnalysis&&<div className="fu">

            {/* Executive Summary */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"13px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:C.txt0}}>{macroAnalysis.title||"Macro Analysis"}</div>
                <div style={{display:"flex",gap:5}}>
                  <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:5,background:"rgba(0,0,0,0.3)",
                    color:macroAnalysis.overallRisk==="EXTREME"?"#ff1840":macroAnalysis.overallRisk==="HIGH"?C.dn:macroAnalysis.overallRisk==="MODERATE"?C.amber:C.up,
                    border:"1px solid "+(macroAnalysis.overallRisk==="EXTREME"?"#ff1840":macroAnalysis.overallRisk==="HIGH"?C.dn:macroAnalysis.overallRisk==="MODERATE"?C.amber:C.up)+"44"}}>
                    {macroAnalysis.overallRisk} RISK
                  </span>
                  <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:5,background:"rgba(0,0,0,0.3)",
                    color:SC[macroAnalysis.marketRegime]||C.txt1,border:"1px solid "+(SC[macroAnalysis.marketRegime]||C.txt1)+"44"}}>
                    {macroAnalysis.marketRegime}
                  </span>
                </div>
              </div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{macroAnalysis.executiveSummary}</div>
            </div>

            {/* Money Flow */}
            {macroAnalysis.moneyFlowAnalysis&&<div style={{background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:10,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:10,color:C.gold,letterSpacing:".1em",marginBottom:6}}>💰 INSTITUTIONAL MONEY FLOW</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{macroAnalysis.moneyFlowAnalysis}</div>
            </div>}

            {/* Risk Scenarios */}
            {macroAnalysis.riskScenarios&&macroAnalysis.riskScenarios.length>0&&<div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:C.txt1,letterSpacing:".1em",marginBottom:8,fontWeight:600}}>⚠ RISK SCENARIO MATRIX</div>
              <div style={{display:"grid",gap:6}}>
                {macroAnalysis.riskScenarios.map(function(sc,i){
                  var isActive=sc.status==="ACTIVE";
                  var isWatch=sc.status==="WATCH";
                  var pctColor=sc.probabilityPct>=70?"#ff1840":sc.probabilityPct>=40?C.amber:sc.probabilityPct>=20?C.blue:C.txt2;
                  var expanded=activeScenario===i;
                  return <div key={i} className="tap" onClick={function(){setActiveScenario(expanded?null:i);}}
                    style={{background:C.bg1,border:"1px solid "+(isActive?C.dn:isWatch?C.amber:C.border),borderRadius:10,padding:"12px",
                      boxShadow:isActive?"0 0 12px rgba(240,64,64,0.15)":isWatch?"0 0 8px rgba(240,144,32,0.1)":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,
                          background:isActive?"rgba(240,64,64,0.15)":isWatch?"rgba(240,144,32,0.1)":"rgba(72,96,128,0.1)",
                          color:isActive?C.dn:isWatch?C.amber:C.txt2}}>
                          {sc.status}
                        </span>
                        <span style={{fontSize:9,color:C.txt2,background:C.bg2,padding:"2px 6px",borderRadius:4}}>{sc.category}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:40,height:3,background:C.bg2,borderRadius:2,overflow:"hidden"}}>
                          <div style={{width:sc.probabilityPct+"%",height:"100%",background:pctColor,borderRadius:2}}></div>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:pctColor}}>{sc.probabilityPct}%</span>
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:C.txt0,marginBottom:4}}>{sc.title}</div>
                    <div style={{fontSize:12,color:C.txt1,lineHeight:1.6}}>{sc.description}</div>

                    {expanded&&<div style={{marginTop:10,borderTop:"1px solid "+C.border,paddingTop:10}}>
                      {/* Trigger Events */}
                      {sc.triggerEvents&&sc.triggerEvents.length>0&&<div style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:C.amber,marginBottom:4}}>⚡ TRIGGER EVENTS</div>
                        {sc.triggerEvents.map(function(ev,j){
                          return <div key={j} style={{fontSize:11,color:C.txt1,padding:"4px 0",borderBottom:j<sc.triggerEvents.length-1?"1px solid "+C.border:"none"}}>→ {ev}</div>;
                        })}
                      </div>}

                      {/* Market Impact */}
                      {sc.marketImpact&&<div style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:C.txt2,marginBottom:5}}>MARKET IMPACT</div>
                        <div style={{display:"grid",gap:4}}>
                          {Object.keys(sc.marketImpact).map(function(key,j){
                            var val=sc.marketImpact[key];
                            var parts=val.split(" — ");
                            var sentiment=parts[0];
                            var reason=parts[1]||"";
                            var sentClr=sentiment==="BULLISH"?C.up:sentiment==="BEARISH"?C.dn:C.amber;
                            return <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",background:C.bg2,borderRadius:6,padding:"6px 9px"}}>
                              <span style={{fontSize:10,color:C.txt2,minWidth:50,textTransform:"uppercase"}}>{key}</span>
                              <span style={{fontSize:10,fontWeight:600,color:sentClr,minWidth:55}}>{sentiment}</span>
                              <span style={{fontSize:10,color:C.txt1,flex:1,lineHeight:1.4}}>{reason}</span>
                            </div>;
                          })}
                        </div>
                      </div>}

                      {/* Historical Analog */}
                      {sc.historicalAnalog&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                        <div style={{fontSize:10,color:C.blue,marginBottom:3}}>📚 HISTORICAL ANALOG</div>
                        <div style={{fontSize:11,color:C.txt1,lineHeight:1.5}}>{sc.historicalAnalog}</div>
                      </div>}

                      <div style={{fontSize:10,color:C.txt2}}>⏱ Timeline: {sc.timeline}</div>
                    </div>}

                    <div style={{fontSize:10,color:C.txt3,marginTop:5,textAlign:"right"}}>{expanded?"▲ less":"▼ expand"}</div>
                  </div>;
                })}
              </div>
            </div>}

            {/* Timeline Outlook */}
            {macroAnalysis.timelineOutlook&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:11,color:C.txt1,letterSpacing:".1em",marginBottom:10,fontWeight:600}}>📅 TIMELINE OUTLOOK</div>
              <div style={{display:"grid",gap:6}}>
                {[
                  {key:"week",   label:"THIS WEEK",    emoji:"⚡", color:C.up},
                  {key:"month",  label:"THIS MONTH",   emoji:"📈", color:C.blue},
                  {key:"quarter",label:"THIS QUARTER", emoji:"🎯", color:C.amber},
                  {key:"year",   label:"12 MONTHS",    emoji:"🔭", color:C.vix},
                ].map(function(item){
                  var val=macroAnalysis.timelineOutlook[item.key];
                  if(!val)return null;
                  return <div key={item.key} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      <span style={{fontSize:12}}>{item.emoji}</span>
                      <span style={{fontSize:10,fontWeight:600,color:item.color,letterSpacing:".08em"}}>{item.label}</span>
                    </div>
                    <div style={{fontSize:12,color:C.txt0,lineHeight:1.65}}>{val}</div>
                  </div>;
                })}
              </div>
            </div>}

            {/* Historic Patterns */}
            {macroAnalysis.historicPatterns&&macroAnalysis.historicPatterns.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:11,color:C.txt1,letterSpacing:".1em",marginBottom:10,fontWeight:600}}>📚 HISTORIC MARKET PATTERNS</div>
              <div style={{display:"grid",gap:8}}>
                {macroAnalysis.historicPatterns.map(function(p,i){
                  return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"11px 12px"}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.goldL,marginBottom:6}}>{p.pattern}</div>
                    <div style={{display:"grid",gap:5}}>
                      <div>
                        <div style={{fontSize:10,color:C.blue,marginBottom:2}}>CURRENT MATCH</div>
                        <div style={{fontSize:12,color:C.txt0,lineHeight:1.55}}>{p.currentMatch}</div>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:C.amber,marginBottom:2}}>HISTORICAL OUTCOME</div>
                        <div style={{fontSize:12,color:C.txt0,lineHeight:1.55}}>{p.historicalOutcome}</div>
                      </div>
                      <div style={{background:"rgba(200,168,64,0.08)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:6,padding:"6px 9px"}}>
                        <div style={{fontSize:10,color:C.gold,marginBottom:2}}>IMPLIED MOVE</div>
                        <div style={{fontSize:12,color:C.txt0,fontWeight:500}}>{p.impliedMove}</div>
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            </div>}

            {/* Key Watchlist */}
            {macroAnalysis.keyWatchlist&&macroAnalysis.keyWatchlist.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:11,color:C.txt1,letterSpacing:".1em",marginBottom:8,fontWeight:600}}>👁 KEY LEVELS TO WATCH</div>
              <div style={{display:"grid",gap:5}}>
                {macroAnalysis.keyWatchlist.map(function(w,i){
                  return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:C.txt0}}>{w.instrument}</span>
                      <span style={{fontSize:11,fontWeight:600,color:C.goldL}}>{w.threshold}</span>
                    </div>
                    <div style={{fontSize:11,color:C.txt1,marginBottom:3}}>{w.signal}</div>
                    <div style={{fontSize:10,color:C.amber}}>→ {w.implication}</div>
                  </div>;
                })}
              </div>
            </div>}

            {/* Trader Action Plan */}
            {macroAnalysis.traderActionPlan&&<div style={{background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.25)",borderRadius:10,padding:"13px"}}>
              <div style={{fontSize:10,color:C.up,letterSpacing:".1em",marginBottom:6,fontWeight:600}}>◈ TRADER ACTION PLAN</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.8}}>{macroAnalysis.traderActionPlan}</div>
            </div>}

          </div>}
        </div>}

        {/* AI FILTER TAB */}
        {tab==="filter"&&&&<div style={{padding:"12px"}}>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".12em",marginBottom:4}}>PASTE HEADLINE, NEWS OR GEOPOLITICAL EVENT</div>
            <div style={{fontSize:9,color:C.txt3,marginBottom:8,opacity:0.7}}>AI will analyze market transmission chain, money flow and scenarios</div>
            <textarea value={hl} onChange={function(e){setHl(e.target.value);}} placeholder="e.g. Iran closes Strait of Hormuz following US airstrike…" rows={3} style={{width:"100%",background:"transparent",border:"none",color:C.txt0,fontSize:13,resize:"none",lineHeight:1.7,fontFamily:"inherit"}}/>
            <button onClick={function(){analyze();}} disabled={loading||!hl.trim()} style={{width:"100%",marginTop:10,background:loading?C.bg2:C.gold,color:loading?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"11px",fontSize:11,fontWeight:500,letterSpacing:".1em",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {loading?[<div key="sp" className="sp" style={{width:12,height:12,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"ANALYZING…"]:"▶  ANALYZE IMPACT"}
            </button>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:5}}>QUICK SAMPLES</div>
            {SAMPLES.map(function(s,i){
              return <button key={i} className="tap" onClick={function(){setHl(s);analyze(s);}} style={{display:"block",width:"100%",background:C.bg1,border:"1px solid "+C.border,color:C.txt2,borderRadius:8,padding:"9px 12px",fontSize:11,textAlign:"left",marginBottom:4}}>{s}</button>;
            })}
          </div>

          {err&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {err}</div>}

          {result&&cfg&&<div className="fu" style={{background:cfg.bg,border:"1px solid "+cfg.color+"28",borderRadius:12,padding:"14px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:11,flexWrap:"wrap",gap:6}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:cfg.color,letterSpacing:".06em"}}>{result.impactLevel}</div>
                <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,color:SC[result.marketSentiment]||C.txt1,fontWeight:500}}>{result.marketSentiment}</span>
                  <span style={{fontSize:9,color:C.txt3}}>·</span>
                  <span style={{fontSize:9,color:DC[result.sentimentShift]||C.txt1,fontWeight:500}}>{result.sentimentShift}</span>
                  <span style={{fontSize:9,color:C.txt3}}>·</span>
                  <span style={{fontSize:9,color:C.txt1}}>{result.timeHorizon}</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:3}}>IMPACT</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:70,height:4,background:C.bg2,borderRadius:2,overflow:"hidden"}}>
                    <div style={{width:result.impactScore+"%",height:"100%",background:cfg.bar,borderRadius:2}}></div>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:cfg.color}}>{result.impactScore}</span>
                </div>
              </div>
            </div>

            {result.immediateImpact&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:7,color:C.blue,letterSpacing:".1em",marginBottom:4}}>⚡ IMMEDIATE IMPACT (1-4 HOURS)</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{result.immediateImpact}</div>
            </div>}

            {result.moneyFlow&&<div style={{background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:7,color:C.gold,letterSpacing:".1em",marginBottom:4}}>💰 MONEY FLOW</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{result.moneyFlow}</div>
            </div>}

            {result.geopoliticalCascade&&<div style={{background:"rgba(184,88,240,0.07)",border:"1px solid rgba(184,88,240,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:7,color:C.vix,letterSpacing:".1em",marginBottom:4}}>🌐 MARKET TRANSMISSION CHAIN</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{result.geopoliticalCascade}</div>
            </div>}

            {result.edgeFinderOverride&&result.edgeFinderOverride.triggered&&<div style={{background:"rgba(240,64,64,0.08)",border:"1px solid rgba(240,64,64,0.3)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:7,color:C.dn,letterSpacing:".1em",marginBottom:4}}>⚠ EDGEFINDER SCORE OVERRIDE ALERT</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{result.edgeFinderOverride.reason}</div>
            </div>}

            {result.keyDrivers&&result.keyDrivers.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:4}}>KEY DRIVERS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                {result.keyDrivers.map(function(d,i){return <span key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:5,padding:"2px 7px",fontSize:9,color:C.txt1}}>{d}</span>;})}
              </div>
            </div>}

            {result.affectedInstruments&&result.affectedInstruments.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:5}}>AFFECTED INSTRUMENTS</div>
              <div style={{display:"grid",gap:4}}>
                {result.affectedInstruments.map(function(inst,i){
                  var live=mkt.find(function(d){return d.s===inst.symbol||d.l===inst.symbol;});
                  return <div key={i} style={{background:"rgba(12,17,24,0.6)",border:"1px solid "+C.border,borderRadius:8,padding:"8px 11px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div><span style={{fontSize:11,fontWeight:500,color:C.txt0}}>{inst.symbol}</span><span style={{marginLeft:6,fontSize:10,fontWeight:500,color:DC[inst.direction]||C.txt2}}>{inst.direction}</span></div>
                      <div style={{textAlign:"right"}}>
                        {live&&<div style={{fontSize:9,color:live.pct>=0?C.up:C.dn}}>{fmt(live.cur,live.b)}</div>}
                        {inst.targetLevel&&<div style={{fontSize:8,color:C.txt2}}>→ {inst.targetLevel}</div>}
                        <div style={{fontSize:8,color:C.txt2}}>{inst.confidence}%</div>
                      </div>
                    </div>
                    <div style={{width:"100%",height:2,background:C.bg2,borderRadius:1,overflow:"hidden",marginBottom:4}}>
                      <div style={{width:inst.confidence+"%",height:"100%",background:DC[inst.direction]||C.txt2,borderRadius:1}}></div>
                    </div>
                    <div style={{fontSize:12,color:C.txt1}}>{inst.reason}</div>
                  </div>;
                })}
              </div>
            </div>}

            {result.scenarios&&result.scenarios.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:6}}>SCENARIO ANALYSIS</div>
              <div style={{display:"grid",gap:5}}>
                {result.scenarios.map(function(sc,i){
                  var scClr=sc.type==="BEARISH_EXTREME"?C.dn:sc.type==="BASE_CASE"?C.amber:C.up;
                  var scBg=sc.type==="BEARISH_EXTREME"?"rgba(240,64,64,0.07)":sc.type==="BASE_CASE"?"rgba(240,144,32,0.07)":"rgba(40,204,120,0.07)";
                  return <div key={i} style={{background:scBg,border:"1px solid "+scClr+"33",borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div>
                        <span style={{fontSize:9,fontWeight:600,color:scClr}}>{sc.type==="BEARISH_EXTREME"?"▼ WORST":sc.type==="BASE_CASE"?"◆ BASE":"▲ BEST"}</span>
                        <span style={{marginLeft:7,fontSize:10,color:C.txt0,fontWeight:500}}>{sc.title}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:10,fontWeight:600,color:scClr}}>{sc.probability}%</div>
                        {sc.timeline&&<div style={{fontSize:12,color:C.txt1}}>{sc.timeline}</div>}
                      </div>
                    </div>
                    <div style={{fontSize:12,color:C.txt0,lineHeight:1.65,marginBottom:5}}>{sc.description}</div>
                    {sc.instruments&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {sc.instruments.map(function(inst,j){
                        return <span key={j} style={{background:"rgba(0,0,0,0.25)",border:"1px solid "+C.border,borderRadius:4,padding:"2px 8px",fontSize:9,color:C.txt1}}>
                          <span style={{color:scClr}}>{inst.symbol}</span> {inst.move}
                        </span>;
                      })}
                    </div>}
                    <div style={{fontSize:9,color:C.txt2}}>👁 {sc.watchFor}</div>
                  </div>;
                })}
              </div>
            </div>}

            {result.keyLevelsToWatch&&result.keyLevelsToWatch.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:5}}>KEY LEVELS</div>
              {result.keyLevelsToWatch.map(function(kl,i){
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <span style={{fontSize:10,fontWeight:600,color:C.txt0,minWidth:60}}>{kl.symbol}</span>
                  <span style={{fontSize:11,fontWeight:600,color:C.goldL,minWidth:55}}>{kl.level}</span>
                  <span style={{flex:1,fontSize:9,color:C.txt2}}>{kl.significance}</span>
                </div>;
              })}
            </div>}

            {result.nextCatalysts&&result.nextCatalysts.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:5}}>NEXT CATALYSTS</div>
              {result.nextCatalysts.map(function(cat,i){
                return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,background:"rgba(12,17,24,0.4)",border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px"}}>
                  <span style={{color:C.amber,fontSize:10,flexShrink:0}}>→</span>
                  <span style={{fontSize:12,color:C.txt0}}>{cat}</span>
                </div>;
              })}
            </div>}

            <div style={{background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:C.gold,letterSpacing:".1em",marginBottom:3,opacity:0.9}}>◈ TRADER NOTE</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.traderNote}</div>
            </div>
          </div>}

          {hist.length>0&&<div>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:5}}>RECENT ANALYSES</div>
            {hist.map(function(h,i){
              var c=ICFG[h.result.impactLevel]||ICFG.NOISE;
              return <div key={i} className="tap" onClick={function(){setHl(h.headline);setResult(h.result);}} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"8px 11px",display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:9,fontWeight:500,color:c.color,minWidth:66}}>{h.result.impactLevel}</span>
                <span style={{flex:1,fontSize:12,color:C.txt1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.headline}</span>
                <span style={{fontSize:12,color:C.txt1}}>{h.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
              </div>;
            })}
          </div>}

          {!result&&!loading&&hist.length===0&&<div style={{textAlign:"center",padding:"44px 20px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,color:C.txt3,marginBottom:6,opacity:0.28}}>◈</div>
            <div style={{fontSize:10,color:C.txt3,letterSpacing:".1em"}}>PASTE A HEADLINE TO BEGIN</div>
          </div>}
        </div>}
      </div>

      {/* INSTRUMENT DETAIL MODAL */}
      {detailInst&&<div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,height:"100%",background:C.bg0,zIndex:500,display:"flex",flexDirection:"column",overflowY:"auto"}}>
        <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button className="tap" onClick={function(){setDetailInst(null);setInstAnalysis(null);}} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"6px 12px",color:C.txt1,fontSize:11}}>← Back</button>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0}}>{detailInst.l}</div>
              <div style={{fontSize:8,color:C.txt2,marginTop:1}}>{detailInst.s} · {detailInst.cat} · {detailInst.live?"● LIVE":"SIM"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:detailInst.pct>=0?C.up:C.dn,fontVariantNumeric:"tabular-nums"}}>{fmt(detailInst.cur,detailInst.b)}{detailInst.cat==="Bonds"?"%":""}</div>
            <div style={{fontSize:11,color:detailInst.pct>=0?C.up:C.dn}}>{detailInst.pct>=0?"+":""}{detailInst.pct.toFixed(2)}% {detailInst.pct>=0?"▲":"▼"}</div>
          </div>
        </div>
        <div style={{padding:"12px",paddingBottom:80}}>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"14px",marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginBottom:12}}>
              {[
                ["HIGH",Math.max.apply(null,detailInst.ch.map(function(d){return d.p;})),C.up],
                ["LOW", Math.min.apply(null,detailInst.ch.map(function(d){return d.p;})),C.dn],
                ["OPEN",detailInst.open,C.txt1],
                ["RANGE",((Math.max.apply(null,detailInst.ch.map(function(d){return d.p;}))-Math.min.apply(null,detailInst.ch.map(function(d){return d.p;})))/detailInst.open*100).toFixed(2)+"%",C.amber],
              ].map(function(item){
                return <div key={item[0]} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"6px 7px",textAlign:"center"}}>
                  <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:1}}>{item[0]}</div>
                  <div style={{fontSize:9,fontWeight:500,color:item[2],fontVariantNumeric:"tabular-nums"}}>{typeof item[1]==="string"?item[1]:fmt(item[1],detailInst.b)}</div>
                </div>;
              })}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={detailInst.ch} margin={{top:4,right:4,bottom:4,left:0}}>
                <defs>
                  <linearGradient id="dcg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={detailInst.pct>=0?C.up:C.dn} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={detailInst.pct>=0?C.up:C.dn} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} interval={8}/>
                <YAxis domain={["auto","auto"]} tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} width={56} tickFormatter={function(v){return fmt(v,detailInst.b);}}/>
                <Tooltip content={<ChartTip/>}/>
                <ReferenceLine y={detailInst.open} stroke={C.border2} strokeDasharray="3 3"/>
                <Area type="monotone" dataKey="p" stroke={detailInst.pct>=0?C.up:C.dn} strokeWidth={2} fill="url(#dcg)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {instLoading&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"20px",textAlign:"center",marginBottom:12}}>
            <div className="sp" style={{width:20,height:20,border:"2px solid "+C.border2,borderTopColor:C.gold,borderRadius:"50%",margin:"0 auto 8px"}}></div>
            <div style={{fontSize:12,color:C.txt1,letterSpacing:".08em"}}>GENERATING AI ANALYSIS…</div>
          </div>}

          {instAnalysis&&!instLoading&&<div className="fu">
            {instAnalysis.drivers&&instAnalysis.drivers.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:8}}>PRICE DRIVERS</div>
              {instAnalysis.drivers.map(function(d,i){
                return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:i<instAnalysis.drivers.length-1?7:0,padding:"7px 10px",background:C.bg2,borderRadius:7,border:"1px solid "+C.border}}>
                  <span style={{color:C.gold,fontSize:11,flexShrink:0}}>{i+1}</span>
                  <span style={{fontSize:13,color:C.txt0,lineHeight:1.6}}>{d}</span>
                </div>;
              })}
            </div>}

            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:10}}>MARKET OUTLOOK</div>
              <div style={{display:"grid",gap:8}}>
                {[
                  {key:"shortTerm", label:"SHORT TERM",   emoji:"⚡"},
                  {key:"nearTerm",  label:"NEAR TERM",    emoji:"📈"},
                  {key:"longTerm",  label:"LONG TERM",    emoji:"🎯"},
                ].map(function(item){
                  var outlook=instAnalysis[item.key]; if(!outlook)return null;
                  var outClr=outlook.outlook==="BULLISH"?C.up:outlook.outlook==="BEARISH"?C.dn:C.amber;
                  return <div key={item.key} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"11px 13px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12}}>{item.emoji}</span>
                        <div>
                          <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em"}}>{item.label}</div>
                          <div style={{fontSize:9,color:C.txt2,marginTop:1}}>{outlook.timeframe}</div>
                        </div>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:outClr,background:"rgba(0,0,0,0.2)",border:"1px solid "+outClr+"44",borderRadius:5,padding:"3px 9px"}}>{outlook.outlook}</span>
                    </div>
                    <div style={{fontSize:13,color:C.txt0,lineHeight:1.65,marginBottom:6}}>{outlook.analysis}</div>
                    {outlook.keyLevel&&<div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"5px 8px"}}>
                      <span style={{fontSize:12,color:C.txt1,letterSpacing:".08em"}}>{outlook.keyLevelType}</span>
                      <span style={{fontSize:11,fontWeight:600,color:outlook.keyLevelType==="RESISTANCE"?C.dn:C.up,fontVariantNumeric:"tabular-nums"}}>{fmt(outlook.keyLevel,detailInst.b)}</span>
                    </div>}
                  </div>;
                })}
              </div>
            </div>

            {(instAnalysis.monthlyOutlook||instAnalysis.quarterlyOutlook)&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
              <div style={{fontSize:12,color:C.txt1,letterSpacing:".1em",marginBottom:10}}>MACRO OUTLOOK</div>
              {instAnalysis.monthlyOutlook&&<div style={{marginBottom:8}}>
                <div style={{fontSize:7,color:C.blue,letterSpacing:".1em",marginBottom:3}}>📅 MONTHLY</div>
                <div style={{fontSize:13,color:C.txt0,lineHeight:1.65}}>{instAnalysis.monthlyOutlook}</div>
              </div>}
              {instAnalysis.quarterlyOutlook&&<div>
                <div style={{fontSize:7,color:C.vix,letterSpacing:".1em",marginBottom:3}}>📊 QUARTERLY</div>
                <div style={{fontSize:13,color:C.txt0,lineHeight:1.65}}>{instAnalysis.quarterlyOutlook}</div>
              </div>}
            </div>}

            {instAnalysis.summary&&<div style={{background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:12,padding:"13px"}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:".1em",marginBottom:5,opacity:0.8}}>◈ TRADER SUMMARY</div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75}}>{instAnalysis.summary}</div>
            </div>}
          </div>}
        </div>
      </div>}

      {/* COPYRIGHT */}
      <div style={{textAlign:"center",padding:"8px",fontSize:12,color:C.txt1,letterSpacing:".06em",borderTop:"1px solid "+C.border,background:C.bg0}}>
        © 2025 AUXIRON. ALL RIGHTS RESERVED.
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.bg1,borderTop:"1px solid "+C.border,display:"flex",zIndex:300,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        {NAV.map(function(item){
          return <button key={item.key} className="tap" onClick={function(){setTab(item.key);}} style={{flex:1,background:"transparent",border:"none",padding:"9px 0 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:tab===item.key?C.goldL:C.txt2,transition:"color 0.12s"}}>
            <span style={{fontSize:14,lineHeight:1}}>{item.icon}</span>
            <span style={{fontSize:8,letterSpacing:".07em",fontWeight:tab===item.key?500:400}}>{item.label}</span>
            {tab===item.key&&<div style={{width:14,height:2,background:C.gold,borderRadius:1,marginTop:1}}></div>}
          </button>;
        })}
      </div>
    </div>
  );
}
