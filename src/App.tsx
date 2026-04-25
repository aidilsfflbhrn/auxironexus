import React, { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

const C={
  bg0:"#0c1118",bg1:"#111820",bg2:"#162030",bg3:"#1b2840",
  border:"#1e2d40",border2:"#283d58",
  txt0:"#edf2ff",txt1:"#8aa4c4",txt2:"#486080",txt3:"#243347",
  gold:"#c8a840",goldL:"#e8c858",
  up:"#28cc78",upD:"#164830",dn:"#f04040",dnD:"#6c1c1c",
  blue:"#4890f8",amber:"#f09020",vix:"#b858f0",bond:"#40c8d0",
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
const TIER2=["EUR/USD","GBP/USD","USD/JPY","AUD/USD","GBP/JPY","US10Y","US02Y","DJI"];
const INSTRUMENTS=[
  {s:"XAU/USD",l:"GOLD",       b:3230, cat:"Commodities",grp:"Metals", v:0.004,tier:1},
  {s:"XAG/USD",l:"SILVER",     b:32.14,cat:"Commodities",grp:"Metals", v:0.005,tier:1},
  {s:"WTI/USD",l:"OIL WTI",    b:61.85,cat:"Commodities",grp:"Energy", v:0.005,tier:1},
  {s:"SPX",    l:"S&P 500",    b:5320, cat:"Indices",    grp:"US",     v:0.003,tier:1},
  {s:"NDX",    l:"NASDAQ 100", b:18540,cat:"Indices",    grp:"US",     v:0.004,tier:1},
  {s:"DJI",    l:"DOW 30",     b:39820,cat:"Indices",    grp:"US",     v:0.003,tier:2},
  {s:"DX",     l:"DXY",        b:99.82,cat:"Indices",    grp:"US",     v:0.002,tier:1},
  {s:"VIX",    l:"VIX",        b:21.50,cat:"Volatility", grp:"VIX",    v:0.025,tier:1},
  {s:"EUR/USD",l:"EUR/USD",    b:1.1042,cat:"Forex",     grp:"Majors", v:0.002,tier:2},
  {s:"GBP/USD",l:"GBP/USD",    b:1.2985,cat:"Forex",     grp:"Majors", v:0.002,tier:2},
  {s:"USD/JPY",l:"USD/JPY",    b:143.25,cat:"Forex",     grp:"Majors", v:0.002,tier:2},
  {s:"AUD/USD",l:"AUD/USD",    b:0.6312,cat:"Forex",     grp:"Majors", v:0.002,tier:2},
  {s:"GBP/JPY",l:"GBP/JPY",   b:186.10,cat:"Forex",     grp:"Crosses",v:0.002,tier:2},
  {s:"US10Y",  l:"US 10Y",    b:4.38,  cat:"Bonds",     grp:"Yields", v:0.006,tier:2},
  {s:"US02Y",  l:"US 2Y",     b:4.02,  cat:"Bonds",     grp:"Yields", v:0.008,tier:2},
  {s:"US30Y",  l:"US 30Y",    b:4.78,  cat:"Bonds",     grp:"Yields", v:0.005,tier:3},
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

const AI_SYS=`You are an elite macro financial analyst and geopolitical strategist. Respond ONLY with valid JSON:
{"impactScore":<0-100>,"impactLevel":"<NOISE|LOW|MODERATE|HIGH|CRITICAL>","marketSentiment":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sentimentShift":"<BULLISH|BEARISH|NEUTRAL>","immediateImpact":"<2-3 sentences>","moneyFlow":"<2 sentences on institutional money movement>","geopoliticalCascade":"<2-3 sentences: full transmission chain>","affectedInstruments":[{"symbol":"<sym>","direction":"<BULLISH|BEARISH|NEUTRAL>","confidence":<0-100>,"currentPrice":<number>,"targetLevel":<number>,"reason":"<one sentence>"}],"keyDrivers":["<d1>","<d2>","<d3>"],"edgeFinderOverride":{"triggered":<true|false>,"reason":"<why geopolitical conditions override scoring model>"},"edgeFinderCrossCheck":{"hasData":<true|false>,"cotAlignment":"<CONFIRMS|CONTRADICTS|MIXED|N/A>","cotNote":"<1-2 sentences: what COT data shows vs the event, or N/A>","setupAlignment":"<CONFIRMS|CONTRADICTS|MIXED|N/A>","setupNote":"<1-2 sentences: what top setups show vs event direction, or N/A>","keyContradiction":"<the single most important conflict between EdgeFinder data and the news event, or null>","resolution":"<2 sentences: how to reconcile conflicting signals, which to prioritize and why>","tradeVerdict":"<EDGEFINDER WINS|NEWS WINS|WAIT FOR CONFIRMATION|SPLIT — explain briefly>"},"scenarios":[{"type":"BEARISH_EXTREME","title":"<n>","probability":<0-100>,"timeline":"<e.g. 2-5 days>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+8%>"}]},{"type":"BASE_CASE","title":"<n>","probability":<0-100>,"timeline":"<e.g. 1-3 days>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+3%>"}]},{"type":"BULLISH_REVERSAL","title":"<n>","probability":<0-100>,"timeline":"<e.g. 1 week>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.-2%>"}]}],"keyLevelsToWatch":[{"symbol":"<sym>","level":<number>,"significance":"<why critical now>"}],"traderNote":"<3-4 sentences actionable>","timeHorizon":"<INTRADAY|SHORT-TERM|MEDIUM-TERM|LONG-TERM>","nextCatalysts":["<event1>","<event2>"]}
Probabilities sum to 100. List 3-5 affected instruments. List 3 key levels. Always explain full transmission chain. If EdgeFinder screenshots are attached, read the COT data, top setups, and any positioning data shown, then fill edgeFinderCrossCheck.hasData=true and provide a full cross-analysis highlighting contradictions. If no images provided, set hasData=false and all alignment fields to "N/A".`;

const CTX_SYS=`You are a professional macro market analyst. Respond ONLY with valid JSON:
{"sessionBias":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sessionNote":"<2-3 sentences>","dxyDominance":{"status":"<LEADING|LAGGING|NEUTRAL>","analysis":"<2 sentences>","vsGold":"<INVERSE|CORRELATED|DECOUPLED>","vsBonds":"<1 sentence>"},"yieldCurve":{"status":"<NORMAL|INVERTED|FLATTENING|STEEPENING>","analysis":"<2 sentences>"},"moneyFlow":"<2 sentences on institutional positioning>","topMovers":[{"symbol":"<sym>","direction":"<BULLISH|BEARISH>","potentialMove":"<e.g.+2%>","reason":"<1 sentence>"}],"watchlist":[{"symbol":"<sym>","bias":"<BULLISH|BEARISH|NEUTRAL>","entryZone":"<price range>","reason":"<1 sentence>"}],"keyLevels":[{"symbol":"<sym>","level":<number>,"type":"<RESISTANCE|SUPPORT>","note":"<why>"}],"weeklyOutlook":"<2-3 sentences>","riskEvents":["<event1>","<event2>"],"goldBias":"<BULLISH|BEARISH|NEUTRAL>","oilOutlook":"<1 sentence>"}
Provide 3 topMovers, 3 watchlist, 3 keyLevels, 2 riskEvents.`;


const INTEL_SYS=`You are a professional Gold market analyst. Generate a pre-session trading brief for a retail trader focused on Gold. Search for: 1. Gold price news and drivers today 2. Trump Truth Social posts affecting markets today 3. US economic data today and this week 4. DXY and bond yield movements 5. Bank forecasts for Gold. Respond ONLY with valid JSON: {"session":"<ASIA OPEN|LONDON OPEN|NY SESSION>","generatedAt":"<SGT time>","marketRegime":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","trumpRisk":"<LOW|MODERATE|HIGH|CRITICAL>","verdicts":[{"symbol":"<sym>","verdict":"<TRADE|AVOID|WAIT>","direction":"<LONG|SHORT|NONE>","reason":"<1 sentence>"}],"gold":{"price":"<p>","change":"<c>","trend":"<BULLISH|BEARISH|RANGING>","momentum":"<ACCELERATING|FADING|FLAT>","volatility":"<HIGH|NORMAL|LOW>","sessionBias":"<BULLISH|BEARISH|NEUTRAL>","alignment":{"fundamental":"<BULLISH|BEARISH|NEUTRAL>","fundamentalNote":"<1-2 sentences>","sentiment":"<BULLISH|BEARISH|NEUTRAL>","sentimentNote":"<1-2 sentences>","technical":"<BULLISH|BEARISH|NEUTRAL>","technicalNote":"<1-2 sentences>","verdict":"<ALIGNED|MIXED|CONFLICTED>","verdictNote":"<1 sentence>"},"drivers":{"primaryDriver":"<most important>","dxy":"<DXY impact>","realYields":"<yields impact>","sentiment":"<ETF flows>","catalyst":"<key event>"},"keyLevels":{"strongSupport":<n>,"support":<n>,"current":<n>,"resistance":<n>,"strongResistance":<n>,"note":"<key level tonight>"},"setup":{"hasSetup":<true|false>,"direction":"<LONG|SHORT|NONE>","entryZone":"<range or NONE>","stopLoss":"<price or NONE>","target1":"<price or NONE>","target2":"<price or NONE>","riskReward":"<ratio or NONE>","setupNote":"<2-3 sentences>","invalidation":"<what cancels>"},"avoidIf":["<condition1>","<condition2>"]},"trump":{"active":<true|false>,"riskLevel":"<LOW|MODERATE|HIGH|CRITICAL>","summary":"<1-2 sentences>","goldImpact":"<BULLISH|BEARISH|NEUTRAL>","watchFor":"<what to monitor>"},"context":{"overnightSummary":"<2-3 sentences>","geopolitical":"<1-2 sentences>","weekTheme":"<theme>","nextBigCatalyst":"<next event>"},"events":[{"time":"<SGT>","flag":"<emoji>","event":"<name>","forecast":"<val>","prev":"<val>","impact":"<HIGH|MEDIUM|LOW|CRITICAL>","goldImpact":"<BULLISH|BEARISH|NEUTRAL>"}],"bankViews":[{"bank":"<name>","view":"<Gold view>","target":"<price target>"}],"summary":"<3-4 sentences: what to trade, avoid, key number>"}. Provide verdicts for GOLD, USD/JPY, GBP/JPY, WTI OIL, NDX, SPX, EUR/USD, NIKKEI. Provide 3-5 events, 2-3 bankViews. Be direct.`;

const BRIEF_SYS=`You are a senior macro strategist at a top-tier investment bank with access to live market data and current news. Generate a comprehensive Goldman Sachs-style market brief.

Search for: latest gold oil SPX Fed statements bank forecasts this week economic calendar upcoming US EUR JPY GBP economic events.

Respond ONLY with valid JSON:
{"sessionType":"<ASIA OPEN|PRE-NY>","headline":"<single most important market theme today>","overnightSummary":"<3-4 sentences: what happened overnight, key moves, why — reference actual recent events>","institutionalForecasts":[{"bank":"<Goldman Sachs|JPMorgan|Morgan Stanley|Citi|UBS>","instrument":"<sym>","forecast":"<their current view and target>","timeframe":"<1 week|1 month|Q2 2025>","rationale":"<why>"}],"instrumentReports":[{"symbol":"<sym>","name":"<full name>","currentPrice":<number>,"priceChange":"<+/-X.XX%>","fundamental":{"rating":"<BULLISH|BEARISH|NEUTRAL>","analysis":"<2-3 sentences>","keyDriver":"<most important factor>"},"sentiment":{"positioning":"<LONG HEAVY|LONG LIGHT|NEUTRAL|SHORT LIGHT|SHORT HEAVY>","institutionalBias":"<BULLISH|BEARISH|NEUTRAL>","cotNote":"<1 sentence>"},"technical":{"bias":"<BULLISH|BEARISH|NEUTRAL>","keySupport":<number>,"keyResistance":<number>,"pattern":"<current pattern>","note":"<1-2 sentences>"},"bankConsensus":"<what major banks expect>","riskReward":"<FAVORABLE|NEUTRAL|UNFAVORABLE>","traderNote":"<2 sentences actionable>"}],"economicCalendar":{"thisWeek":[{"date":"<day>","time":"<SGT>","country":"<US|EUR|JPY|GBP>","event":"<name>","impact":"<HIGH|MEDIUM|LOW>","forecast":"<expected>","previous":"<prior>","tradingImplication":"<1 sentence>"}],"thisMonth":[{"date":"<date>","country":"<country>","event":"<name>","impact":"<HIGH|MEDIUM|LOW>","whyItMatters":"<1 sentence>"}],"remainingQuarter":[{"month":"<month>","country":"<country>","event":"<name>","impact":"<HIGH|MEDIUM|LOW>","significance":"<1 sentence>"}]},"weeklyTheme":"<2-3 sentences dominant macro theme>","monthlyOutlook":"<2-3 sentences>","quarterlyView":"<2 sentences Q2 thesis>","traderFocus":"<4-5 sentences: what to trade today, what to avoid, key levels, sizing>","marketRisk":"<ELEVATED|NORMAL|LOW>"}
Provide 3-4 institutional forecasts. Provide 3-4 instrument reports for most relevant instruments. Economic calendar: 4-5 this week HIGH impact events, 5-6 this month, 3-4 remaining quarter. Focus on US events primarily, then EUR/JPY/GBP.`;

const dp=function(b){return b>=1000?2:b>=10?3:4;};
const fmt=function(v,b){
  if(v==null)return"—";
  return v.toLocaleString(undefined,{minimumFractionDigits:dp(b),maximumFractionDigits:dp(b)});
};
const vixClr=function(v){return v<15?"#28cc78":v<20?"#e8c858":v<30?"#f09020":"#f04040";};
const vixLbl=function(v){return v<15?"CALM":v<20?"NORMAL":v<30?"ELEVATED":"HIGH FEAR";};
const impactClr=function(i){return i==="HIGH"?"#f04040":i==="MEDIUM"?"#f09020":"#486080";};

function genFB(base,vol,pts){
  pts=pts||48;var data=[];var now=Date.now();
  // Generate realistic daily-style price movement
  // Daily range: instruments move 0.3%-2% on a typical day
  var dailyRange=Math.max(vol*2, 0.002);
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
    // Apply move
    p=p*(1+momentum);
    // Soft bounds: allow up to 1.5x dailyRange from base
    var maxDev=base*(dailyRange*1.5);
    if(p>base+maxDev)p=base+maxDev-Math.random()*base*0.001;
    if(p<base-maxDev)p=base-maxDev+Math.random()*base*0.001;
    data.push({
      t:new Date(now-(pts-1-i)*30*60*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      p:parseFloat(p.toFixed(dp(base)))
    });
  }
  // Anchor last point near base (live price)
  data[data.length-1].p=parseFloat((base*(1+(Math.random()-0.5)*0.001)).toFixed(dp(base)));
  return data;
}

function initMkt(){
  return INSTRUMENTS.map(function(inst){
    var ch=genFB(inst.b,inst.v);var open=ch[0].p;var cur=ch[ch.length-1].p;
    return Object.assign({},inst,{ch:ch,open:open,cur:cur,chg:cur-open,pct:(cur-open)/open*100,live:false,src:"SIM"});
  });
}

function callProxy(body,onSuccess,onError){
  var xhr=new XMLHttpRequest();
  xhr.open("POST","/api/analyze",true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.timeout=body.useWebSearch?90000:55000;
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
      var txt=(d.content||[]).map(function(x){return x.type==="text"?x.text:"";}).join("");
      if(!txt){onError("Empty response — web search may be unavailable, retry");return;}
      var clean=txt.split("```json").join("").split("```").join("").trim();
      var s=clean.indexOf("{"),ef=clean.lastIndexOf("}");
      if(s!==-1&&ef>s){clean=clean.slice(s,ef+1);}
      else{onError("AI returned plain text instead of JSON: "+clean.slice(0,160)+"…");return;}
      onSuccess(JSON.parse(clean));
    }catch(e){onError("Parse error: "+e.message);}
  };
  xhr.onerror=function(){onError("Network error");};
  xhr.ontimeout=function(){onError("Request timed out — web search takes up to 60s, please retry");};
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
  var [nowStr,setNowStr]=useState("");
  var [ctx,setCtx]=useState(null);
  var [ctxLoading,setCtxLoading]=useState(false);
  var [ctxErr,setCtxErr]=useState(null);
  var [lastRefresh,setLastRefresh]=useState(null);
  var [intelErr,setIntelErr]=useState(null);
  var [intel,setIntel]=useState(null);
  var [intelLoading,setIntelLoading]=useState(false);
  var [intelElapsed,setIntelElapsed]=useState(0);
  var [intelSession,setIntelSession]=useState("asia");
  var [intelOpen,setIntelOpen]=useState<Record<string,boolean>>({});
  var [calTab,setCalTab]=useState("week");
  var [brief,setBrief]=useState(null);
  var [briefLoading,setBriefLoading]=useState(false);
  var [briefErr,setBriefErr]=useState(null);
  var [edgeImages,setEdgeImages]=useState<{name:string;base64:string;mediaType:string}[]>([]);
  var cycleRef=useRef(0);

  useEffect(function(){
    var id=setInterval(function(){setNowStr(new Date().toUTCString().slice(0,25));},1000);
    setNowStr(new Date().toUTCString().slice(0,25));
    return function(){clearInterval(id);};
  },[]);

  useEffect(function(){
    if(!intelLoading){setIntelElapsed(0);return;}
    setIntelElapsed(0);
    var id=setInterval(function(){setIntelElapsed(function(n){return n+1;});},1000);
    return function(){clearInterval(id);};
  },[intelLoading]);


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
      return["XAU/USD","WTI/USD","DX","US10Y","US02Y","VIX","SPX","NDX","EUR/USD","GBP/USD","USD/JPY","BRENT"].indexOf(i.s)>=0;
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
    } else {
      userContent="LIVE MARKET DATA:\n"+snap+"\n\nEVENT:\n"+inp;
    }
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3500,system:AI_SYS,
       messages:[{role:"user",content:userContent}]},
      function(res){setResult(res)setLoading(false);},
      function(e){setErr("Failed: "+e);setLoading(false);}
    );
  }

  function fetchCtx(){
    setCtxLoading(true);setCtx(null);
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:1800,system:CTX_SYS,
       messages:[{role:"user",content:"Live market: "+getSnap()+"\nGenerate session briefing."}]},
      function(res){setCtx(res);setLastRefresh(new Date());setCtxLoading(false);setCtxErr(null);},
      function(e){setCtxErr("Failed: "+e);setCtxLoading(false);}
    );
  }

  }

  }

  function fetchBrief(session){
    setBriefLoading(true);setBrief(null);setBriefErr(null);
    var label=session==="asia"?"ASIA OPEN (SGT 8am-12pm)":"PRE-NY SESSION (SGT 8pm-10pm)";
    var msg="LIVE MARKET DATA:\n"+getSnap()+
      "\n\nSESSION: "+label+
      "\n\nToday's date: "+new Date().toDateString()+
      "\n\nPlease search the web for current market news, bank forecasts and economic calendar data, then generate a comprehensive market brief. Focus on US economic events primarily, then EUR, JPY and GBP. Include upcoming economic events for this week, this month and remaining quarter.";
    callProxy(
      {model:"claude-sonnet-4-6",max_tokens:6000,system:BRIEF_SYS,
       messages:[{role:"user",content:msg}],
       useWebSearch:true},
      function(res){setBrief(res);setBriefLoading(false);setBriefErr(null);},
      function(e){setBriefErr("Failed: "+e);setBriefLoading(false);}
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
  var displayed=mkt.filter(function(m){return catF==="All"?m.tier<=2:m.cat===catF;});

  const NAV=[
    {key:"markets",icon:"◫",label:"Markets"},
    {key:"charts", icon:"▦",label:"Charts"},
    {key:"session",icon:"◉",label:"Session"},
    {key:"intel",  icon:"⬟",label:"Intel"},
    {key:"filter", icon:"◈",label:"Filter"},
  ];

  return(
    <div style={{fontFamily:"'DM Mono','Courier New',monospace",color:C.txt0}} className="auxiron-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
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

        /* ── BASE: mobile-first fills full screen ── */
        .auxiron-root{display:flex;width:100%;min-height:100vh;min-height:100dvh;background:#0c1118;}
        .auxiron-sidebar{display:none;}
        .auxiron-main{flex:1;display:flex;flex-direction:column;width:100%;min-width:0;}
        .auxiron-content{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:calc(64px + env(safe-area-inset-bottom,0px));-webkit-overflow-scrolling:touch;}
        .auxiron-inner{width:100%;padding:0;}
        .auxiron-bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:300;background:#111820;padding-bottom:env(safe-area-inset-bottom,0px);}
        .auxiron-bottom-nav button{padding:10px 0 6px !important;}

        /* ── MOBILE phones (up to 480px) ── */
        @media(max-width:480px){
          .auxiron-inner{font-size:13px;}
        }

        /* ── TABLET portrait: iPad mini, iPad, Galaxy Tab S11 portrait (481px–1023px) ── */
        @media(min-width:481px) and (max-width:1023px){
          .auxiron-inner{max-width:100%;padding:0 4px;}
          .auxiron-content{padding-bottom:80px;}
          .auxiron-bottom-nav{height:68px;}
        }

        /* ── TABLET landscape / large tablet: Galaxy Tab S11 landscape, iPad Pro (1024px–1279px) ── */
        @media(min-width:1024px){
          .auxiron-sidebar{display:flex;flex-direction:column;width:240px;flex-shrink:0;position:fixed;left:0;top:0;bottom:0;z-index:200;background:#111820;border-right:1px solid #1e2d40;}
          .auxiron-main{margin-left:240px;}
          .auxiron-content{padding-bottom:0;}
          .auxiron-bottom-nav{display:none !important;}
          .auxiron-inner{max-width:100%;padding:0;}
        }

        /* ── WIDE desktop (1280px+) ── */
        @media(min-width:1280px){
          .auxiron-sidebar{width:260px;}
          .auxiron-main{margin-left:260px;}
          .auxiron-inner{max-width:960px;margin:0 auto;}
        }
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
        {/* Quick stats */}
        <div style={{padding:"10px 14px",borderBottom:"1px solid "+C.border}}>
          {goldI&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:10,color:C.gold}}>Gold</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:600,color:goldI.pct>=0?C.up:C.dn,fontVariantNumeric:"tabular-nums"}}>{fmt(goldI.cur,goldI.b)}</div>
              <div style={{fontSize:9,color:goldI.pct>=0?C.up:C.dn}}>{goldI.pct>=0?"+":""}{goldI.pct.toFixed(2)}%</div>
            </div>
          </div>}
          {vixI&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
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
        {/* Sidebar nav */}
        <div style={{padding:"8px 10px",flex:1,overflowY:"auto"}}>
          {NAV.map(function(item){
            return <button key={item.key} className="tap" onClick={function(){setTab(item.key);}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:tab===item.key?"rgba(200,168,64,0.10)":"transparent",
                border:tab===item.key?"1px solid rgba(200,168,64,0.25)":"1px solid transparent",
                color:tab===item.key?C.goldL:C.txt2,borderRadius:8,padding:"10px 12px",marginBottom:4,textAlign:"left",transition:"all 0.12s"}}>
              <span style={{fontSize:16,lineHeight:1}}>{item.icon}</span>
              <span style={{fontSize:12,fontWeight:tab===item.key?600:400,letterSpacing:".05em"}}>{item.label}</span>
              {tab===item.key&&<div style={{marginLeft:"auto",width:3,height:16,background:C.gold,borderRadius:2}}></div>}
            </button>;
          })}
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid "+C.border,fontSize:8,color:C.txt3,letterSpacing:".06em"}}>
          © 2025 AUXIRON
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="auxiron-main">

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

      <div className="auxiron-content">
        <div className="auxiron-inner">
        {/* ── MARKETS ── */}
        {tab==="markets"&&<div>
          <div style={{padding:"8px 12px",display:"flex",gap:5,overflowX:"auto",borderBottom:"1px solid "+C.border}}>
            {["All"].concat(CATS).map(function(c){
              var a=catF===c;
              return <button key={c} className="tap" onClick={function(){setCatF(c);}}
                style={{background:a?"rgba(200,168,64,0.12)":C.bg2,border:a?"1px solid rgba(200,168,64,0.38)":"1px solid "+C.border,
                  color:a?C.goldL:C.txt2,borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:500,whiteSpace:"nowrap"}}>
                {c==="Volatility"?"VIX":c}
              </button>;
            })}
          </div>
          {(catF==="All"||catF==="Bonds")&&y2&&y10&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:6}}>YIELD CURVE</div>
            <div style={{display:"flex",gap:6,overflowX:"auto"}}>
              {[y2,y10].map(function(m){
                return <div key={m.s}
                  style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 12px",flexShrink:0,minWidth:88}}>
                  <div style={{fontSize:9,color:C.bond,marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:15,fontWeight:600,color:C.txt0,fontVariantNumeric:"tabular-nums"}}>{m.cur.toFixed(3)}<span style={{fontSize:9,color:C.txt2}}>%</span></div>
                  <div style={{fontSize:10,color:m.chg>=0?C.dn:C.up}}>{m.chg>=0?"+":""}{m.chg.toFixed(3)}</div>
                </div>;
              })}
              {spread!==null&&<div style={{background:inverted?"rgba(240,64,64,0.08)":"rgba(40,204,120,0.06)",border:"1px solid "+(inverted?C.dnD:C.upD),borderRadius:8,padding:"7px 12px",flexShrink:0,minWidth:88}}>
                <div style={{fontSize:9,color:C.txt2,marginBottom:2}}>2s10s</div>
                <div style={{fontSize:15,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</div>
                <div style={{fontSize:9,color:inverted?C.dn:C.up}}>{inverted?"▼ INVERTED":"▲ NORMAL"}</div>
              </div>}
            </div>
          </div>}
          {(catF==="All"||catF==="Volatility")&&vixI&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:6}}>VIX — FEAR INDEX</div>
            <div className="tap" style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:26,fontWeight:700,color:vixClr(vixI.cur),fontFamily:"'Syne',sans-serif"}}>{vixI.cur.toFixed(2)}</div>
                <div style={{fontSize:11,fontWeight:600,color:vixClr(vixI.cur),marginTop:2}}>{vixLbl(vixI.cur)}</div>
                <div style={{fontSize:10,color:C.txt2,marginTop:1}}>{vixI.pct>=0?"+":""}{vixI.pct.toFixed(2)}% today</div>
              </div>
              <div style={{flex:2}}>
                <div style={{position:"relative",height:8,background:C.bg2,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                  {[{v:15,c:"#28cc78"},{v:20,c:"#e8c858"},{v:30,c:"#f09020"},{v:50,c:"#f04040"}].map(function(seg,idx,arr){
                    var prev=idx===0?0:arr[idx-1].v;
                    return <div key={idx} style={{position:"absolute",left:((prev/50)*100)+"%",width:(((seg.v-prev)/50)*100)+"%",height:"100%",background:seg.c,opacity:0.3}}></div>;
                  })}
                  <div style={{position:"absolute",left:Math.min(vixI.cur/50*100,98)+"%",top:-2,width:3,height:12,background:vixClr(vixI.cur),borderRadius:2}}></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.txt3}}>
                  <span>0</span><span>15</span><span>20</span><span>30</span><span>50+</span>
                </div>
              </div>
            </div>
          </div>}
          <div style={{padding:"8px 12px",display:"grid",gap:5}}>
            {displayed.map(function(m){
              var up=m.pct>=0;var isVix=m.s==="VIX";var isBond=m.cat==="Bonds";
              var lc=isVix?C.vix:isBond?C.bond:up?C.up:C.dn;
              return <div key={m.s}
                style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.txt0}}>{m.l}</div>
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
                  <div style={{fontSize:14,fontWeight:500,color:isVix?vixClr(m.cur):isBond?C.bond:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                  <div style={{fontSize:11,fontWeight:500,marginTop:1,fontVariantNumeric:"tabular-nums",color:isVix?(up?C.dn:C.up):up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}% {up?"▲":"▼"}</div>
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
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:7}}>PICK UP TO 4 — {quad.length}/4</div>
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
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(selI.cur,selI.b)}{selI.cat==="Bonds"?"%":""}</div>
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
                  <XAxis dataKey="t" tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} interval={8}/>
                  <YAxis domain={["auto","auto"]} padding={{top:8,bottom:8}} tick={{fill:C.txt3,fontSize:8}} tickLine={false} axisLine={false} width={56} tickFormatter={function(v){return fmt(v,selI.b);}}/>
                  <Tooltip content={<ChartTip/>}/>
                  <ReferenceLine y={selI.open} stroke={C.border2} strokeDasharray="3 3"/>
                  <Area type="linear" dataKey="p" stroke={selI.pct>=0?C.up:C.dn} strokeWidth={2} fill="url(#cg)" dot={false}/>
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
                    <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:1}}>{item[0]}</div>
                    <div style={{fontSize:10,fontWeight:500,color:item[2],fontVariantNumeric:"tabular-nums"}}>{typeof item[1]==="string"?item[1]:fmt(item[1],selI.b)}</div>
                  </div>;
                })}
              </div>
            </div>
          </div>}
          {cv==="quad"&&<div style={{padding:"12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {quad.map(function(sym){
              var m=mkt.find(function(d){return d.s===sym;});if(!m)return null;
              var up=m.pct>=0;var isVix=m.s==="VIX";var isBond=m.cat==="Bonds";
              var lc=isVix?C.vix:isBond?C.bond:up?C.up:C.dn;
              var gid="g"+sym.replace(/[^a-z0-9]/gi,"_");
              return <div key={sym} className="tap" onClick={function(){setSel(sym);setCv("single");fetchChart(sym);}}
                style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"11px"}}>
                <div style={{fontSize:9,color:C.txt2,marginBottom:1}}>{m.l}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:isVix?vixClr(m.cur):C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                <div style={{fontSize:10,color:isVix?(up?C.dn:C.up):up?C.up:C.dn,marginBottom:5}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                <ResponsiveContainer width="100%" height={72}>
                  <AreaChart data={m.ch} margin={{top:2,right:2,bottom:2,left:2}}>
                    <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={lc} stopOpacity={0.12}/><stop offset="95%" stopColor={lc} stopOpacity={0}/></linearGradient></defs>
                    <YAxis domain={["auto","auto"]} hide/>
                    <ReferenceLine y={m.open} stroke={C.border} strokeDasharray="2 2"/>
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


        {/* ── SESSION BRIEFING ── */}
        {tab==="session"&&<div style={{padding:"12px"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>SESSION BRIEFING</div>
              <div style={{fontSize:9,color:C.txt2,marginTop:1}}>{nowStr}</div>
            </div>
            <button className="tap" onClick={fetchCtx} disabled={ctxLoading}
              style={{background:ctxLoading?C.bg2:C.gold,color:ctxLoading?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"7px 14px",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
              {ctxLoading?[<div key="sp" className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"GENERATING…"]:"◉ GENERATE"}
            </button>
          </div>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:8}}>LIVE SNAPSHOT</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {["XAU/USD","DX","US10Y","VIX","SPX","NDX","WTI/USD","GBP/USD"].map(function(sym){
                var m=mkt.find(function(d){return d.s===sym;});if(!m)return null;
                var up=m.pct>=0;var isVix=m.s==="VIX";var isBond=m.cat==="Bonds";
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
          {y2&&y10&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em"}}>YIELD CURVE</div>
              <div style={{fontSize:9,color:inverted?C.dn:C.up,fontWeight:600}}>{inverted?"▼ INVERTED":"▲ NORMAL"} {spread!==null&&(spread>0?"+":"")+spread+"%"}</div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
              {[y2,y10].map(function(m,i){
                var maxY=Math.max(y2.cur,y10.cur);var h=Math.max((m.cur/maxY)*50,8);
                return <div key={m.s} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.bond}}>{m.cur.toFixed(2)}%</div>
                  <div style={{width:"100%",height:h,background:"rgba(64,200,208,0.20)",border:"1px solid "+C.bond,borderRadius:3}}></div>
                  <div style={{fontSize:8,color:C.txt3}}>{["2Y","10Y"][i]}</div>
                </div>;
              })}
            </div>
          </div>}
          {ctxErr&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {ctxErr}</div>}
          {!ctx&&!ctxLoading&&!ctxErr&&<div style={{textAlign:"center",padding:"30px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
            <div style={{fontSize:11,color:C.txt3,letterSpacing:".1em"}}>TAP GENERATE FOR AI SESSION BRIEFING</div>
            <div style={{fontSize:10,color:C.txt3,marginTop:4,opacity:0.6}}>DXY dominance · Money flow · Weekly outlook</div>
          </div>}
          {ctx&&<div className="fu">
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em"}}>SESSION BIAS</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,fontWeight:700,color:SC[ctx.sessionBias]||C.txt1,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(200,200,200,0.1)",borderRadius:6,padding:"3px 10px"}}>{ctx.sessionBias}</span>
                  {lastRefresh&&<span style={{fontSize:9,color:C.txt3}}>{lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
                </div>
              </div>
              <div style={{fontSize:13,color:C.txt0,lineHeight:1.75,marginBottom:8}}>{ctx.sessionNote}</div>
              {ctx.moneyFlow&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:3}}>💰 MONEY FLOW</div>
                <div style={{fontSize:12,color:C.txt1,lineHeight:1.6}}>{ctx.moneyFlow}</div>
              </div>}
            </div>
            {ctx.dxyDominance&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em"}}>DXY DOMINANCE</div>
                <span style={{fontSize:11,fontWeight:700,color:ctx.dxyDominance.status==="LEADING"?C.dn:ctx.dxyDominance.status==="LAGGING"?C.up:C.amber,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(200,200,200,0.1)",borderRadius:5,padding:"2px 8px"}}>{ctx.dxyDominance.status}</span>
              </div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.7,marginBottom:8}}>{ctx.dxyDominance.analysis}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <div style={{fontSize:9,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>vs GOLD</div>
                  <div style={{fontSize:11,fontWeight:600,color:ctx.dxyDominance.vsGold==="INVERSE"?C.amber:ctx.dxyDominance.vsGold==="CORRELATED"?C.up:C.txt2}}>{ctx.dxyDominance.vsGold}</div>
                </div>
                <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <div style={{fontSize:9,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>vs BONDS</div>
                  <div style={{fontSize:10,color:C.txt1,lineHeight:1.5}}>{ctx.dxyDominance.vsBonds}</div>
                </div>
              </div>
            </div>}
            {ctx.yieldCurve&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em"}}>YIELD CURVE SIGNAL</div>
                <span style={{fontSize:11,fontWeight:700,color:ctx.yieldCurve.status==="INVERTED"?C.dn:ctx.yieldCurve.status==="NORMAL"?C.up:C.amber,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(200,200,200,0.1)",borderRadius:5,padding:"2px 8px"}}>{ctx.yieldCurve.status}</span>
              </div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.65}}>{ctx.yieldCurve.analysis}</div>
            </div>}
            {ctx.weeklyOutlook&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:10,color:C.blue,letterSpacing:".1em",marginBottom:5}}>📅 WEEKLY OUTLOOK</div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.75}}>{ctx.weeklyOutlook}</div>
            </div>}
            {ctx.topMovers&&ctx.topMovers.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:8}}>🔥 TOP MOVERS</div>
              <div style={{display:"grid",gap:6}}>
                {ctx.topMovers.map(function(m,i){
                  var inst=mkt.find(function(d){return d.s===m.symbol||d.l===m.symbol;});
                  var isUp=m.direction==="BULLISH";
                  return <div key={i} className="tap"
                    style={{background:C.bg2,border:"1px solid "+(isUp?C.upD:C.dnD),borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13,fontWeight:600,color:C.txt0}}>{m.symbol}</span>
                        <span style={{fontSize:10,fontWeight:600,color:isUp?C.up:C.dn}}>{isUp?"▲":"▼"} {m.direction}</span>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:isUp?C.up:C.dn}}>{m.potentialMove}</span>
                    </div>
                    <div style={{fontSize:11,color:C.txt1,lineHeight:1.5}}>{m.reason}</div>
                    {inst&&<div style={{fontSize:10,color:C.txt3,marginTop:3}}>Now: {fmt(inst.cur,inst.b)} ({inst.pct>=0?"+":""}{inst.pct.toFixed(2)}%)</div>}
                  </div>;
                })}
              </div>
            </div>}
            {ctx.watchlist&&ctx.watchlist.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:8}}>◈ WATCHLIST</div>
              <div style={{display:"grid",gap:5}}>
                {ctx.watchlist.map(function(item,i){
                  var inst=mkt.find(function(d){return d.s===item.symbol||d.l===item.symbol;});
                  return <div key={i} className="tap"
                    style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:13,fontWeight:600,color:C.txt0}}>{item.symbol}</span>
                        <span style={{fontSize:10,fontWeight:600,color:item.bias==="BULLISH"?C.up:item.bias==="BEARISH"?C.dn:C.amber}}>{item.bias}</span>
                      </div>
                      {inst&&<span style={{fontSize:11,color:inst.pct>=0?C.up:C.dn}}>{fmt(inst.cur,inst.b)}</span>}
                    </div>
                    <div style={{fontSize:10,color:C.gold,marginBottom:3}}>Entry: {item.entryZone}</div>
                    <div style={{fontSize:11,color:C.txt1,lineHeight:1.5}}>{item.reason}</div>
                  </div>;
                })}
              </div>
            </div>}
            {ctx.keyLevels&&ctx.keyLevels.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:7}}>KEY LEVELS</div>
              {ctx.keyLevels.map(function(kl,i){
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<ctx.keyLevels.length-1?6:0,background:C.bg2,borderRadius:7,padding:"8px 10px",border:"1px solid "+C.border}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.txt0,minWidth:65}}>{kl.symbol}</div>
                  <div style={{fontSize:12,fontWeight:600,color:kl.type==="RESISTANCE"?C.dn:C.up,minWidth:60}}>{kl.level}</div>
                  <div style={{fontSize:9,color:kl.type==="RESISTANCE"?C.dn:C.up,minWidth:68}}>{kl.type}</div>
                  <div style={{flex:1,fontSize:10,color:C.txt1}}>{kl.note}</div>
                </div>;
              })}
            </div>}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px"}}>
              {ctx.riskEvents&&ctx.riskEvents.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:6}}>⚠ RISK EVENTS</div>
                {ctx.riskEvents.map(function(ev,i){
                  return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,background:"rgba(240,144,32,0.07)",border:"1px solid rgba(240,144,32,0.2)",borderRadius:7,padding:"7px 10px"}}>
                    <span style={{color:C.amber,fontSize:11,flexShrink:0}}>→</span>
                    <span style={{fontSize:11,color:C.txt1,lineHeight:1.6}}>{ev}</span>
                  </div>;
                })}
              </div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:9,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>GOLD BIAS</div>
                  <div style={{fontSize:13,fontWeight:700,color:DC[ctx.goldBias]||C.txt1}}>{ctx.goldBias}</div>
                </div>
                {ctx.oilOutlook&&<div>
                  <div style={{fontSize:9,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>OIL OUTLOOK</div>
                  <div style={{fontSize:10,color:C.txt2,lineHeight:1.5}}>{ctx.oilOutlook}</div>
                </div>}
              </div>
            </div>
          </div>}
        </div>}


        {/* ── INTELLIGENCE ── */}
        {tab==="intel"&&(
          <div style={{padding:"12px"}} className="fu">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>GOLD SESSION BRIEF</div>
                <div style={{fontSize:10,color:C.txt1,marginTop:1}}>Sonnet + web search · Gold-focused · ~$0.06/report</div>
              </div>
            </div>

            <div style={{display:"grid",gap:6,marginBottom:12}}>
              {[
                {key:"asia",icon:"🌏",label:"ASIA OPEN",time:"8am–12pm SGT",color:C.bond,grad:"linear-gradient(135deg,rgba(64,200,208,0.12),rgba(64,200,208,0.04))",bdr:"rgba(64,200,208,0.3)"},
                {key:"london",icon:"🌍",label:"LONDON OPEN",time:"3pm–6pm SGT",color:C.blue,grad:"linear-gradient(135deg,rgba(72,144,248,0.12),rgba(72,144,248,0.04))",bdr:"rgba(72,144,248,0.3)"},
                {key:"ny",icon:"🗽",label:"NY SESSION",time:"9pm–12am SGT",color:C.goldL,grad:"linear-gradient(135deg,rgba(200,168,64,0.15),rgba(200,168,64,0.04))",bdr:"rgba(200,168,64,0.35)"}
              ].map((s) => {
                var a = intelSession===s.key && intel;
                var ld = intelSession===s.key && intelLoading;
                return (
                  <button key={s.key} className="tap" onClick={()=>{setIntelSession(s.key);fetchIntel(s.key);}}
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
                  </button>
                );
              })}
            </div>

            {intelLoading && (
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"26px 20px",textAlign:"center",marginBottom:10}}>
                <div className="sp" style={{width:22,height:22,border:"3px solid "+C.border2,borderTopColor:C.gold,borderRadius:"50%",margin:"0 auto 10px"}}></div>
                <div style={{fontSize:11,color:C.goldL,letterSpacing:".08em",marginBottom:3}}>GENERATING GOLD BRIEF</div>
                <div style={{fontSize:9,color:C.txt2,marginBottom:6}}>Trump watch · Bank views · Gold drivers · Setup</div>
                <div style={{fontSize:10,color:C.txt3,fontVariantNumeric:"tabular-nums"}}>
                  {intelElapsed<5?"Starting up…":intelElapsed<20?"Searching web…":intelElapsed<45?"Analyzing Gold setup…":"Compiling brief…"}
                  <span style={{color:C.gold,marginLeft:6,fontWeight:600}}>{intelElapsed}s</span>
                </div>
              </div>
            )}

            {intelErr&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {intelErr}</div>}
            {!intel && !intelLoading && !intelErr && (
              <div style={{textAlign:"center",padding:"36px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,marginBottom:10,opacity:0.2}}>⬟</div>
                <div style={{fontSize:12,color:C.txt2,letterSpacing:".08em",marginBottom:4}}>SELECT A SESSION ABOVE</div>
                <div style={{fontSize:10,color:C.txt3}}>Gold setup · Trump watch · Bank views · Econ calendar</div>
              </div>
            )}

            {intel && !intelLoading && (
              <div className="fu">

                {/* 1 — regime + trump risk + time */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                  {intel.marketRegime&&<span style={{fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:4,background:"rgba(0,0,0,0.35)",color:intel.marketRegime==="RISK-OFF"?C.dn:intel.marketRegime==="RISK-ON"?C.up:intel.marketRegime==="MIXED"?C.amber:C.txt2,border:"1px solid "+(intel.marketRegime==="RISK-OFF"?C.dn:intel.marketRegime==="RISK-ON"?C.up:intel.marketRegime==="MIXED"?C.amber:C.txt2)+"44"}}>{intel.marketRegime}</span>}
                  {intel.trumpRisk&&(function(){var rc=intel.trumpRisk==="CRITICAL"?"#ff1840":intel.trumpRisk==="HIGH"?C.dn:intel.trumpRisk==="MODERATE"?C.amber:C.up;return <span style={{fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:4,background:"rgba(0,0,0,0.35)",color:rc,border:"1px solid "+rc+"44"}}>🇺🇸 TRUMP {intel.trumpRisk}</span>;})()}
                  {intel.generatedAt&&<span style={{fontSize:9,color:C.txt3,marginLeft:"auto"}}>{intel.session} · {intel.generatedAt}</span>}
                </div>

                {/* 2 — SESSION VERDICTS (collapsible) */}
                {intel.verdicts&&intel.verdicts.length>0&&(function(){
                  var vOpen=intelOpen&&intelOpen.v!==false;
                  var vmap:any={TRADE:C.up,AVOID:C.dn,WAIT:C.amber};
                  var dmap:any={LONG:C.up,SHORT:C.dn,NONE:C.txt3};
                  return <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,marginBottom:8,overflow:"hidden"}}>
                    <button className="tap" onClick={function(){setIntelOpen(function(p:any){return {...p,v:vOpen?false:true};});}}
                      style={{width:"100%",background:"transparent",border:"none",padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                      <div style={{fontSize:10,color:C.txt1,fontWeight:600,letterSpacing:".1em"}}>SESSION VERDICTS</div>
                      <span style={{fontSize:10,color:C.txt3}}>{vOpen?"▲":"▼"}</span>
                    </button>
                    {vOpen&&<div style={{padding:"0 12px 12px",display:"grid",gap:5}}>
                      {intel.verdicts.map(function(v:any,i:number){
                        var vc=vmap[v.verdict]||C.txt2;
                        var dc=dmap[v.direction]||C.txt2;
                        return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px",display:"flex",alignItems:"flex-start",gap:10}}>
                          <div style={{minWidth:72}}>
                            <div style={{fontSize:11,fontWeight:700,color:C.txt0,marginBottom:3}}>{v.symbol}</div>
                            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                              <span style={{fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"rgba(0,0,0,0.3)",color:vc,border:"1px solid "+vc+"44"}}>{v.verdict}</span>
                              {v.direction!=="NONE"&&<span style={{fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"rgba(0,0,0,0.3)",color:dc,border:"1px solid "+dc+"44"}}>{v.direction}</span>}
                            </div>
                          </div>
                          <div style={{fontSize:10,color:C.txt1,lineHeight:1.5,flex:1}}>{v.reason}</div>
                        </div>;
                      })}
                    </div>}
                  </div>;
                })()}

                {/* 3 — GOLD DEEP FOCUS (collapsible, gold gradient) */}
                {intel.gold&&(function(){
                  var g=intel.gold;
                  var gOpen=intelOpen&&intelOpen.g!==false;
                  var chgUp=g.change&&(g.change.startsWith("+")||parseFloat(g.change)>0);
                  var amap:any={BULLISH:C.up,BEARISH:C.dn,NEUTRAL:C.txt2};
                  var vmap:any={ALIGNED:C.up,MIXED:C.amber,CONFLICTED:C.dn};
                  var dmap:any={LONG:C.up,SHORT:C.dn,NONE:C.txt3};
                  var kl=g.keyLevels;
                  var setup=g.setup;
                  return <div style={{background:"linear-gradient(135deg,rgba(200,168,64,0.1),rgba(200,168,64,0.04))",border:"1px solid rgba(200,168,64,0.35)",borderRadius:10,marginBottom:8,overflow:"hidden"}}>
                    <button className="tap" onClick={function(){setIntelOpen(function(p:any){return {...p,g:gOpen?false:true};});}}
                      style={{width:"100%",background:"transparent",border:"none",padding:"11px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.gold}}>🥇 GOLD DEEP FOCUS</div>
                        {g.sessionBias&&<span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:"rgba(0,0,0,0.3)",color:amap[g.sessionBias]||C.txt2,border:"1px solid "+(amap[g.sessionBias]||C.txt2)+"44"}}>{g.sessionBias}</span>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {g.price&&<div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,fontWeight:700,color:C.txt0}}>{g.price}</div>
                          {g.change&&<div style={{fontSize:9,fontWeight:600,color:chgUp?C.up:C.dn}}>{g.change}</div>}
                        </div>}
                        <span style={{fontSize:10,color:C.txt3}}>{gOpen?"▲":"▼"}</span>
                      </div>
                    </button>
                    {gOpen&&<div style={{padding:"0 12px 12px"}}>
                      {/* price strip — trend / momentum / volatility */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:10}}>
                        {[{l:"TREND",v:g.trend},{l:"MOMENTUM",v:g.momentum},{l:"VOLATILITY",v:g.volatility}].map(function(x){
                          var xc=x.v==="BULLISH"||x.v==="ACCELERATING"||x.v==="HIGH"?C.up:x.v==="BEARISH"||x.v==="FADING"?C.dn:C.txt2;
                          return <div key={x.l} style={{background:"rgba(0,0,0,0.25)",borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
                            <div style={{fontSize:8,color:C.txt3,marginBottom:2}}>{x.l}</div>
                            <div style={{fontSize:9,fontWeight:700,color:xc}}>{x.v||"—"}</div>
                          </div>;
                        })}
                      </div>
                      {/* alignment 3-row */}
                      {g.alignment&&(
                        <div style={{marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                            <div style={{fontSize:9,color:C.gold,fontWeight:600,letterSpacing:".08em"}}>ALIGNMENT</div>
                            {g.alignment.verdict&&<span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:3,background:"rgba(0,0,0,0.3)",color:vmap[g.alignment.verdict]||C.txt2,border:"1px solid "+(vmap[g.alignment.verdict]||C.txt2)+"44"}}>{g.alignment.verdict}</span>}
                          </div>
                          {[{k:"fundamental",l:"FUNDAMENTAL"},{k:"sentiment",l:"SENTIMENT"},{k:"technical",l:"TECHNICAL"}].map(function(row){
                            var val=(g.alignment as any)[row.k];
                            var note=(g.alignment as any)[row.k+"Note"];
                            var rc=val==="BULLISH"?C.up:val==="BEARISH"?C.dn:C.txt2;
                            return <div key={row.k} style={{background:"rgba(0,0,0,0.2)",border:"1px solid "+C.border,borderRadius:6,padding:"6px 10px",marginBottom:4}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:note?3:0}}>
                                <span style={{fontSize:9,color:C.txt3}}>{row.l}</span>
                                <span style={{fontSize:9,fontWeight:700,color:rc}}>{val||"—"}</span>
                              </div>
                              {note&&<div style={{fontSize:10,color:C.txt1,lineHeight:1.45}}>{note}</div>}
                            </div>;
                          })}
                          {g.alignment.verdictNote&&<div style={{fontSize:10,color:C.amber,marginTop:4,paddingLeft:2}}>{g.alignment.verdictNote}</div>}
                        </div>
                      )}
                      {/* key levels 5-box */}
                      {kl&&<div style={{marginBottom:10}}>
                        <div style={{fontSize:9,color:C.gold,fontWeight:600,letterSpacing:".08em",marginBottom:5}}>KEY LEVELS</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:kl.note?6:0}}>
                          {[{l:"STR SUP",v:kl.strongSupport,c:"rgba(40,204,120,0.15)"},{l:"SUPPORT",v:kl.support,c:"rgba(40,204,120,0.08)"},{l:"CURRENT",v:kl.current,c:"rgba(200,168,64,0.1)"},{l:"RESIST",v:kl.resistance,c:"rgba(240,64,64,0.08)"},{l:"STR RES",v:kl.strongResistance,c:"rgba(240,64,64,0.15)"}].map(function(box){
                            var tc=box.l.includes("SUP")||box.l==="SUPPORT"?C.up:box.l==="CURRENT"?C.goldL:C.dn;
                            return <div key={box.l} style={{background:box.c,borderRadius:5,padding:"5px 4px",textAlign:"center"}}>
                              <div style={{fontSize:7,color:C.txt3,marginBottom:2}}>{box.l}</div>
                              <div style={{fontSize:9,fontWeight:700,color:tc}}>{box.v||"—"}</div>
                            </div>;
                          })}
                        </div>
                        {kl.note&&<div style={{fontSize:10,color:C.txt1,background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px"}}>{kl.note}</div>}
                      </div>}
                      {/* setup box */}
                      {setup&&(
                        <div style={{background:setup.hasSetup?"rgba(40,204,120,0.07)":"rgba(0,0,0,0.2)",border:"1px solid "+(setup.hasSetup?"rgba(40,204,120,0.25)":C.border),borderRadius:8,padding:"10px",marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{fontSize:9,fontWeight:700,color:setup.hasSetup?C.up:C.txt2,letterSpacing:".08em"}}>🎯 SETUP</div>
                            {setup.direction&&setup.direction!=="NONE"&&<span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:3,background:"rgba(0,0,0,0.3)",color:dmap[setup.direction]||C.txt2,border:"1px solid "+(dmap[setup.direction]||C.txt2)+"44"}}>{setup.direction}</span>}
                          </div>
                          {setup.hasSetup?(
                            <div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:6}}>
                                {[{l:"ENTRY",v:setup.entryZone},{l:"STOP",v:setup.stopLoss},{l:"TARGET 1",v:setup.target1},{l:"TARGET 2",v:setup.target2}].map(function(f){
                                  return <div key={f.l} style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px"}}>
                                    <div style={{fontSize:8,color:C.txt3,marginBottom:1}}>{f.l}</div>
                                    <div style={{fontSize:10,fontWeight:600,color:C.txt0}}>{f.v||"—"}</div>
                                  </div>;
                                })}
                              </div>
                              {setup.riskReward&&<div style={{fontSize:10,color:C.goldL,marginBottom:5}}>R:R {setup.riskReward}</div>}
                              {setup.setupNote&&<div style={{fontSize:11,color:C.txt0,lineHeight:1.6,marginBottom:setup.invalidation?6:0}}>{setup.setupNote}</div>}
                              {setup.invalidation&&<div style={{fontSize:10,color:C.dn}}>✕ Invalidation: {setup.invalidation}</div>}
                            </div>
                          ):<div style={{fontSize:11,color:C.txt2}}>No clear setup for this session.</div>}
                        </div>
                      )}
                      {/* avoidIf box */}
                      {g.avoidIf&&g.avoidIf.length>0&&(
                        <div style={{background:"rgba(240,64,64,0.06)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:7,padding:"8px 10px"}}>
                          <div style={{fontSize:9,color:C.dn,fontWeight:600,letterSpacing:".08em",marginBottom:5}}>⚠ AVOID IF</div>
                          {g.avoidIf.map(function(a:string,i:number){
                            return <div key={i} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:i<g.avoidIf.length-1?"1px solid rgba(240,64,64,0.15)":"none"}}>
                              <span style={{color:C.dn,flexShrink:0,fontSize:10}}>→</span>
                              <span style={{fontSize:10,color:C.txt1,lineHeight:1.45}}>{a}</span>
                            </div>;
                          })}
                        </div>
                      )}
                      {/* drivers */}
                      {g.drivers&&(
                        <div style={{marginTop:8,background:"rgba(0,0,0,0.15)",borderRadius:7,padding:"8px 10px"}}>
                          <div style={{fontSize:9,color:C.gold,fontWeight:600,letterSpacing:".08em",marginBottom:5}}>DRIVERS</div>
                          {[{l:"Primary",v:g.drivers.primaryDriver},{l:"DXY",v:g.drivers.dxy},{l:"Real Yields",v:g.drivers.realYields},{l:"Sentiment",v:g.drivers.sentiment},{l:"Catalyst",v:g.drivers.catalyst}].filter(function(d){return d.v;}).map(function(d){
                            return <div key={d.l} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px solid "+C.border}}>
                              <span style={{fontSize:9,color:C.txt3,minWidth:68,flexShrink:0}}>{d.l}</span>
                              <span style={{fontSize:10,color:C.txt0,lineHeight:1.4}}>{d.v}</span>
                            </div>;
                          })}
                        </div>
                      )}
                    </div>}
                  </div>;
                })()}

                {/* 4 — TRUMP METER (red border) */}
                {intel.trump&&(function(){
                  var t=intel.trump;
                  var rClr=t.riskLevel==="CRITICAL"?"#ff1840":t.riskLevel==="HIGH"?C.dn:t.riskLevel==="MODERATE"?C.amber:C.up;
                  var rBdr=t.riskLevel==="CRITICAL"?"rgba(255,24,64,0.45)":t.riskLevel==="HIGH"?"rgba(240,64,64,0.35)":t.riskLevel==="MODERATE"?"rgba(240,144,32,0.3)":"rgba(40,204,120,0.25)";
                  var rBg=t.riskLevel==="CRITICAL"?"rgba(255,24,64,0.05)":t.riskLevel==="HIGH"?"rgba(240,64,64,0.05)":t.riskLevel==="MODERATE"?"rgba(240,144,32,0.04)":"rgba(40,204,120,0.04)";
                  var gimp:any={BULLISH:C.up,BEARISH:C.dn,NEUTRAL:C.txt2};
                  return <div style={{background:rBg,border:"2px solid "+rBdr,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontSize:10,color:rClr,fontWeight:700,letterSpacing:".1em"}}>🇺🇸 TRUMP METER</div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        {t.goldImpact&&<span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:"rgba(0,0,0,0.3)",color:gimp[t.goldImpact]||C.txt2,border:"1px solid "+(gimp[t.goldImpact]||C.txt2)+"44"}}>GOLD {t.goldImpact}</span>}
                        <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:"rgba(0,0,0,0.3)",color:rClr,border:"1px solid "+rClr+"55"}}>{t.riskLevel}</span>
                      </div>
                    </div>
                    {t.summary&&<div style={{fontSize:11,color:C.txt0,lineHeight:1.6,marginBottom:t.watchFor?7:0}}>{t.summary}</div>}
                    {t.watchFor&&<div style={{fontSize:10,color:rClr,background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 9px"}}>👁 {t.watchFor}</div>}
                  </div>;
                })()}

                {/* 5 — MARKET CONTEXT (collapsible) */}
                {intel.context&&(function(){
                  var ctx=intel.context;
                  var ctxOpen=intelOpen&&intelOpen.c!==false;
                  return <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,marginBottom:8,overflow:"hidden"}}>
                    <button className="tap" onClick={function(){setIntelOpen(function(p:any){return {...p,c:ctxOpen?false:true};});}}
                      style={{width:"100%",background:"transparent",border:"none",padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                      <div style={{fontSize:10,color:C.txt1,fontWeight:600,letterSpacing:".1em"}}>MARKET CONTEXT</div>
                      <span style={{fontSize:10,color:C.txt3}}>{ctxOpen?"▲":"▼"}</span>
                    </button>
                    {ctxOpen&&<div style={{padding:"0 12px 12px"}}>
                      {ctx.overnightSummary&&<div style={{fontSize:12,color:C.txt0,lineHeight:1.75,marginBottom:8}}>{ctx.overnightSummary}</div>}
                      {ctx.geopolitical&&<div style={{background:"rgba(240,144,32,0.07)",border:"1px solid rgba(240,144,32,0.2)",borderRadius:6,padding:"7px 10px",marginBottom:6}}>
                        <div style={{fontSize:9,color:C.amber,fontWeight:600,marginBottom:3}}>⚡ GEOPOLITICAL</div>
                        <div style={{fontSize:11,color:C.txt1,lineHeight:1.55}}>{ctx.geopolitical}</div>
                      </div>}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                        {ctx.weekTheme&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 9px"}}>
                          <div style={{fontSize:8,color:C.txt3,marginBottom:2}}>WEEK THEME</div>
                          <div style={{fontSize:10,color:C.txt0}}>{ctx.weekTheme}</div>
                        </div>}
                        {ctx.nextBigCatalyst&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 9px"}}>
                          <div style={{fontSize:8,color:C.txt3,marginBottom:2}}>NEXT CATALYST</div>
                          <div style={{fontSize:10,color:C.goldL}}>{ctx.nextBigCatalyst}</div>
                        </div>}
                      </div>
                    </div>}
                  </div>;
                })()}

                {/* 6 — ECONOMIC CALENDAR (2 tabs: tonight/this week) */}
                {intel.events&&intel.events.length>0&&(function(){
                  var impClr=function(imp:string){return imp==="CRITICAL"?"#ff1840":imp==="HIGH"?C.dn:imp==="MEDIUM"?C.amber:C.txt3;};
                  var gimp:any={BULLISH:C.up,BEARISH:C.dn,NEUTRAL:C.txt2};
                  var evTonight=intel.events.filter(function(ev:any){return ev.impact==="CRITICAL"||ev.impact==="HIGH";});
                  var evWeek=intel.events;
                  var showTonight=calTab==="today";
                  var activeEvs:any[]=showTonight?(evTonight.length>0?evTonight:evWeek):evWeek;
                  return <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>📅 ECONOMIC CALENDAR</div>
                    <div style={{display:"flex",gap:4,marginBottom:8}}>
                      {[{k:"today",l:"TONIGHT"},{k:"week",l:"THIS WEEK"}].map(function(t){
                        var active=calTab===t.k;
                        return <button key={t.k} className="tap" onClick={function(){setCalTab(t.k);}}
                          style={{flex:1,background:active?C.gold:"transparent",color:active?"#0c1118":C.txt2,border:"1px solid "+(active?C.gold:C.border),borderRadius:6,padding:"5px 6px",fontSize:9,fontWeight:600,letterSpacing:".05em"}}>{t.l}</button>;
                      })}
                    </div>
                    {activeEvs.length>0?(
                      <div style={{display:"grid",gap:5}}>
                        {activeEvs.map(function(ev:any,i:number){
                          var ic=impClr(ev.impact);
                          var gc=gimp[ev.goldImpact];
                          return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:14}}>{ev.flag}</span>
                                <div>
                                  <div style={{fontSize:11,fontWeight:600,color:C.txt0}}>{ev.event}</div>
                                  <div style={{fontSize:9,color:C.txt3}}>{ev.time}</div>
                                </div>
                              </div>
                              <div style={{display:"flex",gap:4,flexShrink:0}}>
                                {ev.goldImpact&&gc&&<span style={{fontSize:8,fontWeight:700,color:gc,background:"rgba(0,0,0,0.3)",border:"1px solid "+gc+"44",borderRadius:3,padding:"2px 5px"}}>XAU {ev.goldImpact}</span>}
                                <span style={{fontSize:8,fontWeight:700,color:ic,background:"rgba(0,0,0,0.3)",border:"1px solid "+ic+"44",borderRadius:3,padding:"2px 6px"}}>{ev.impact}</span>
                              </div>
                            </div>
                            {(ev.forecast||ev.prev)&&<div style={{display:"flex",gap:10}}>
                              {ev.forecast&&<span style={{fontSize:9,color:C.txt2}}>Fcst: <span style={{color:C.txt0}}>{ev.forecast}</span></span>}
                              {ev.prev&&<span style={{fontSize:9,color:C.txt2}}>Prev: <span style={{color:C.txt1}}>{ev.prev}</span></span>}
                            </div>}
                          </div>;
                        })}
                      </div>
                    ):<div style={{fontSize:11,color:C.txt3,textAlign:"center",padding:"12px 0"}}>No events</div>}
                  </div>;
                })()}

                {/* 7 — BANK VIEWS */}
                {intel.bankViews&&intel.bankViews.length>0&&(
                  <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                    <div style={{fontSize:10,color:C.blue,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>🏦 BANK VIEWS</div>
                    <div style={{display:"grid",gap:5}}>
                      {intel.bankViews.map(function(b:any,i:number){
                        return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:700,color:C.txt0,marginBottom:3}}>{b.bank}</div>
                            <div style={{fontSize:10,color:C.txt1,lineHeight:1.5}}>{b.view}</div>
                          </div>
                          {b.target&&<div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:8,color:C.txt3,marginBottom:1}}>TARGET</div>
                            <div style={{fontSize:11,fontWeight:700,color:C.goldL}}>{b.target}</div>
                          </div>}
                        </div>;
                      })}
                    </div>
                  </div>
                )}

                {/* 8 — SESSION SUMMARY (green gradient) */}
                {intel.summary&&(
                  <div style={{background:"linear-gradient(135deg,rgba(40,204,120,0.09),rgba(40,204,120,0.03))",border:"1px solid rgba(40,204,120,0.25)",borderRadius:10,padding:"13px"}}>
                    <div style={{fontSize:10,color:C.up,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>◈ SESSION SUMMARY</div>
                    <div style={{fontSize:13,color:C.txt0,lineHeight:1.8}}>{intel.summary}</div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

                {/* ── AI FILTER ── */}
        {tab==="filter"&&<div style={{padding:"12px"}}>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".12em",marginBottom:4}}>PASTE HEADLINE OR GEOPOLITICAL EVENT</div>
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
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>QUICK SAMPLES</div>
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
                  <span style={{fontSize:10,color:SC[result.marketSentiment]||C.txt1,fontWeight:500}}>{result.marketSentiment}</span>
                  <span style={{fontSize:10,color:C.txt3}}>·</span>
                  <span style={{fontSize:10,color:DC[result.sentimentShift]||C.txt1,fontWeight:500}}>{result.sentimentShift}</span>
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
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.75}}>{result.immediateImpact}</div>
            </div>}
            {result.moneyFlow&&<div style={{background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:4}}>💰 MONEY FLOW</div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.75}}>{result.moneyFlow}</div>
            </div>}
            {result.geopoliticalCascade&&<div style={{background:"rgba(184,88,240,0.07)",border:"1px solid rgba(184,88,240,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.vix,letterSpacing:".1em",marginBottom:4}}>🌐 TRANSMISSION CHAIN</div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.75}}>{result.geopoliticalCascade}</div>
            </div>}
            {result.edgeFinderOverride&&result.edgeFinderOverride.triggered&&<div style={{background:"rgba(240,64,64,0.08)",border:"1px solid rgba(240,64,64,0.3)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.dn,letterSpacing:".1em",marginBottom:4}}>⚠ EDGEFINDER OVERRIDE ALERT</div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.75}}>{result.edgeFinderOverride.reason}</div>
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
                {result.keyDrivers.map(function(d,i){return <span key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:5,padding:"2px 7px",fontSize:10,color:C.txt1}}>{d}</span>;})}
              </div>
            </div>}
            {result.affectedInstruments&&result.affectedInstruments.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>AFFECTED INSTRUMENTS</div>
              <div style={{display:"grid",gap:4}}>
                {result.affectedInstruments.map(function(inst,i){
                  var live=mkt.find(function(d){return d.s===inst.symbol||d.l===inst.symbol;});
                  return <div key={i} style={{background:"rgba(12,17,24,0.6)",border:"1px solid "+C.border,borderRadius:8,padding:"8px 11px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div><span style={{fontSize:12,fontWeight:500,color:C.txt0}}>{inst.symbol}</span><span style={{marginLeft:6,fontSize:11,fontWeight:500,color:DC[inst.direction]||C.txt2}}>{inst.direction}</span></div>
                      <div style={{textAlign:"right"}}>
                        {live&&<div style={{fontSize:10,color:live.pct>=0?C.up:C.dn}}>{fmt(live.cur,live.b)}</div>}
                        {inst.targetLevel&&<div style={{fontSize:9,color:C.txt2}}>→ {inst.targetLevel}</div>}
                        <div style={{fontSize:9,color:C.txt2}}>{inst.confidence}%</div>
                      </div>
                    </div>
                    <div style={{width:"100%",height:2,background:C.bg2,borderRadius:1,overflow:"hidden",marginBottom:4}}>
                      <div style={{width:inst.confidence+"%",height:"100%",background:DC[inst.direction]||C.txt2,borderRadius:1}}></div>
                    </div>
                    <div style={{fontSize:11,color:C.txt1}}>{inst.reason}</div>
                  </div>;
                })}
              </div>
            </div>}
            {result.scenarios&&result.scenarios.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:6}}>SCENARIOS</div>
              <div style={{display:"grid",gap:5}}>
                {result.scenarios.map(function(sc,i){
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
                      {sc.instruments.map(function(inst,j){
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
              {result.keyLevelsToWatch.map(function(kl,i){
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.txt0,minWidth:60}}>{kl.symbol}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.goldL,minWidth:55}}>{kl.level}</span>
                  <span style={{flex:1,fontSize:10,color:C.txt1}}>{kl.significance}</span>
                </div>;
              })}
            </div>}
            {result.nextCatalysts&&result.nextCatalysts.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>NEXT CATALYSTS</div>
              {result.nextCatalysts.map(function(cat,i){
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

      {/* BOTTOM NAV - mobile only */}
      <div className="auxiron-bottom-nav" style={{background:C.bg1,borderTop:"1px solid "+C.border}}>
        {NAV.map(function(item){
          return <button key={item.key} className="tap" onClick={function(){setTab(item.key);}}
            style={{flex:1,background:"transparent",border:"none",padding:"10px 0 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:tab===item.key?C.goldL:C.txt2,transition:"color 0.12s",minHeight:56}}>
            <span style={{fontSize:13,lineHeight:1}}>{item.icon}</span>
            <span style={{fontSize:7,letterSpacing:".06em",fontWeight:tab===item.key?500:400}}>{item.label}</span>
            {tab===item.key&&<div style={{width:14,height:2,background:C.gold,borderRadius:1,marginTop:1}}></div>}
          </button>;
        })}
      </div>
      </div>
    </div>
  );
}
