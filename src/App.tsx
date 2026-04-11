import React, { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

const TD_KEY = "eebba65f9d564154ba5915d5895264ec";

const C = {
  bg0:"#0c1118", bg1:"#111820", bg2:"#162030", bg3:"#1b2840",
  border:"#1e2d40", border2:"#283d58",
  txt0:"#edf2ff", txt1:"#8aa4c4", txt2:"#486080", txt3:"#243347",
  gold:"#c8a840", goldL:"#e8c858",
  up:"#28cc78", upD:"#164830",
  dn:"#f04040", dnD:"#6c1c1c",
  blue:"#4890f8", amber:"#f09020",
  vix:"#b858f0", bond:"#40c8d0",
};

const ICFG = {
  NOISE:    { color:C.txt2,    bg:"rgba(72,96,128,0.08)",  bar:C.txt3 },
  LOW:      { color:C.blue,    bg:"rgba(72,144,248,0.07)", bar:"#1850b0" },
  MODERATE: { color:C.amber,   bg:"rgba(240,144,32,0.07)", bar:"#906020" },
  HIGH:     { color:C.dn,      bg:"rgba(240,64,64,0.07)",  bar:C.dnD },
  CRITICAL: { color:"#ff1840", bg:"rgba(255,24,64,0.06)",  bar:"#980020" },
};

const SC = { "RISK-ON":C.up, "RISK-OFF":C.dn, "NEUTRAL":C.txt2, "MIXED":C.amber };
const DC = { BULLISH:C.up, BEARISH:C.dn, NEUTRAL:C.txt2 };

const INSTRUMENTS = [
  { s:"SPX",     l:"S&P 500",    b:5320,   cat:"Indices",     grp:"Cash",    v:0.003 },
  { s:"NDX",     l:"NASDAQ 100", b:18540,  cat:"Indices",     grp:"Cash",    v:0.004 },
  { s:"DJI",     l:"DOW 30",     b:39820,  cat:"Indices",     grp:"Cash",    v:0.003 },
  { s:"DAX",     l:"DAX",        b:21250,  cat:"Indices",     grp:"Cash",    v:0.003 },
  { s:"FTSE",    l:"FTSE 100",   b:8320,   cat:"Indices",     grp:"Cash",    v:0.003 },
  { s:"NI225",   l:"NIKKEI",     b:34200,  cat:"Indices",     grp:"Cash",    v:0.004 },
  { s:"DX",      l:"DXY",        b:99.82,  cat:"Indices",     grp:"Cash",    v:0.002 },
  { s:"ES1!",    l:"S&P Fut",    b:5315,   cat:"Futures",     grp:"Index",   v:0.003 },
  { s:"NQ1!",    l:"NASDAQ Fut", b:18510,  cat:"Futures",     grp:"Index",   v:0.004 },
  { s:"YM1!",    l:"DOW Fut",    b:39790,  cat:"Futures",     grp:"Index",   v:0.003 },
  { s:"GC1!",    l:"Gold Fut",   b:3235,   cat:"Futures",     grp:"Metal",   v:0.004 },
  { s:"SI1!",    l:"Silver Fut", b:32.20,  cat:"Futures",     grp:"Metal",   v:0.005 },
  { s:"CL1!",    l:"Oil Fut",    b:61.70,  cat:"Futures",     grp:"Energy",  v:0.005 },
  { s:"NG1!",    l:"NatGas Fut", b:3.42,   cat:"Futures",     grp:"Energy",  v:0.008 },
  { s:"HG1!",    l:"Copper Fut", b:4.62,   cat:"Futures",     grp:"Metal",   v:0.004 },
  { s:"EUR/USD", l:"EUR/USD",    b:1.1042, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"GBP/USD", l:"GBP/USD",    b:1.2985, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"USD/JPY", l:"USD/JPY",    b:143.25, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"USD/CHF", l:"USD/CHF",    b:0.8962, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"AUD/USD", l:"AUD/USD",    b:0.6312, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"NZD/USD", l:"NZD/USD",    b:0.5712, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"USD/CAD", l:"USD/CAD",    b:1.3845, cat:"Forex",       grp:"Majors",  v:0.002 },
  { s:"EUR/GBP", l:"EUR/GBP",    b:0.8505, cat:"Forex",       grp:"EUR",     v:0.002 },
  { s:"EUR/JPY", l:"EUR/JPY",    b:158.20, cat:"Forex",       grp:"EUR",     v:0.002 },
  { s:"EUR/AUD", l:"EUR/AUD",    b:1.7490, cat:"Forex",       grp:"EUR",     v:0.002 },
  { s:"EUR/NZD", l:"EUR/NZD",    b:1.9330, cat:"Forex",       grp:"EUR",     v:0.002 },
  { s:"EUR/CAD", l:"EUR/CAD",    b:1.5290, cat:"Forex",       grp:"EUR",     v:0.002 },
  { s:"EUR/CHF", l:"EUR/CHF",    b:0.9890, cat:"Forex",       grp:"EUR",     v:0.002 },
  { s:"GBP/JPY", l:"GBP/JPY",    b:186.10, cat:"Forex",       grp:"GBP",     v:0.002 },
  { s:"GBP/AUD", l:"GBP/AUD",    b:2.0580, cat:"Forex",       grp:"GBP",     v:0.002 },
  { s:"GBP/NZD", l:"GBP/NZD",    b:2.2740, cat:"Forex",       grp:"GBP",     v:0.002 },
  { s:"GBP/CAD", l:"GBP/CAD",    b:1.7980, cat:"Forex",       grp:"GBP",     v:0.002 },
  { s:"GBP/CHF", l:"GBP/CHF",    b:1.1630, cat:"Forex",       grp:"GBP",     v:0.002 },
  { s:"AUD/JPY", l:"AUD/JPY",    b:90.42,  cat:"Forex",       grp:"AUD",     v:0.002 },
  { s:"AUD/NZD", l:"AUD/NZD",    b:1.1052, cat:"Forex",       grp:"AUD",     v:0.002 },
  { s:"AUD/CAD", l:"AUD/CAD",    b:0.8730, cat:"Forex",       grp:"AUD",     v:0.002 },
  { s:"AUD/CHF", l:"AUD/CHF",    b:0.5640, cat:"Forex",       grp:"AUD",     v:0.002 },
  { s:"NZD/JPY", l:"NZD/JPY",    b:81.88,  cat:"Forex",       grp:"NZD",     v:0.002 },
  { s:"NZD/CAD", l:"NZD/CAD",    b:0.7904, cat:"Forex",       grp:"NZD",     v:0.002 },
  { s:"NZD/CHF", l:"NZD/CHF",    b:0.5108, cat:"Forex",       grp:"NZD",     v:0.002 },
  { s:"CAD/JPY", l:"CAD/JPY",    b:103.50, cat:"Forex",       grp:"JPY",     v:0.002 },
  { s:"CHF/JPY", l:"CHF/JPY",    b:159.90, cat:"Forex",       grp:"JPY",     v:0.002 },
  { s:"XAU/USD", l:"GOLD",       b:3230,   cat:"Commodities", grp:"Metals",  v:0.004 },
  { s:"XAG/USD", l:"SILVER",     b:32.14,  cat:"Commodities", grp:"Metals",  v:0.005 },
  { s:"XPT/USD", l:"PLATINUM",   b:978,    cat:"Commodities", grp:"Metals",  v:0.005 },
  { s:"WTI/USD", l:"OIL WTI",    b:61.85,  cat:"Commodities", grp:"Energy",  v:0.005 },
  { s:"BRENT",   l:"BRENT",      b:65.20,  cat:"Commodities", grp:"Energy",  v:0.005 },
  { s:"US02Y",   l:"US 2Y",      b:4.02,   cat:"Bonds",       grp:"Yields",  v:0.008 },
  { s:"US10Y",   l:"US 10Y",     b:4.38,   cat:"Bonds",       grp:"Yields",  v:0.006 },
  { s:"US30Y",   l:"US 30Y",     b:4.78,   cat:"Bonds",       grp:"Yields",  v:0.005 },
  { s:"VIX",     l:"VIX",        b:21.50,  cat:"Volatility",  grp:"VIX",     v:0.025 },
  { s:"BTC/USD", l:"BITCOIN",    b:83420,  cat:"Crypto",      grp:"Major",   v:0.008 },
  { s:"ETH/USD", l:"ETHEREUM",   b:1580,   cat:"Crypto",      grp:"Major",   v:0.010 },
];

const TD_OK = new Set([
  "EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","NZD/USD","USD/CAD",
  "EUR/GBP","EUR/JPY","EUR/AUD","EUR/NZD","EUR/CAD","EUR/CHF",
  "GBP/JPY","GBP/AUD","GBP/NZD","GBP/CAD","GBP/CHF",
  "AUD/JPY","AUD/NZD","AUD/CAD","AUD/CHF",
  "NZD/JPY","NZD/CAD","NZD/CHF","CAD/JPY","CHF/JPY",
  "XAU/USD","XAG/USD","XPT/USD","WTI/USD","BRENT",
  "BTC/USD","ETH/USD","SPX","NDX","DJI","DAX","FTSE","NI225","DX","VIX",
  "US02Y","US10Y","US30Y",
]);

const CATS = ["Indices","Futures","Forex","Commodities","Bonds","Volatility","Crypto"];
const FX_GRPS = ["Majors","EUR","GBP","AUD","NZD","JPY"];
const FUT_GRPS = ["All","Index","Metal","Energy"];
const DEFAULT_QUAD = ["XAU/USD","EUR/USD","SPX","BTC/USD"];

const SAMPLES = [
  "Federal Reserve surprises with emergency 50bps rate cut amid banking stress",
  "US CPI comes in at 3.8% vs 3.5% expected, core inflation remains sticky",
  "China PMI falls to 48.2, below the 50 contraction threshold",
  "Russia halts natural gas supply to three European nations",
  "UK GDP contracts 0.3% in Q1, recession fears resurface",
  "Elon Musk tweets support for Bitcoin, calls it digital gold",
];

const AI_SYS = `You are an elite financial market analyst. Analyze the news headline and respond ONLY in valid JSON with no extra text:
{"impactScore":<0-100>,"impactLevel":"<NOISE|LOW|MODERATE|HIGH|CRITICAL>","marketSentiment":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sentimentShift":"<BULLISH|BEARISH|NEUTRAL>","affectedInstruments":[{"symbol":"<e.g.EUR/USD>","direction":"<BULLISH|BEARISH|NEUTRAL>","confidence":<0-100>,"reason":"<one sentence>"}],"noiseReason":"<if NOISE explain, else null>","keyDrivers":["<d1>","<d2>"],"traderNote":"<2-3 sentence actionable insight>","timeHorizon":"<INTRADAY|SHORT-TERM|MEDIUM-TERM|LONG-TERM>"}`;

const CTX_SYS = `You are a professional market analyst. Given current market data respond ONLY in valid JSON with no extra text:
{"sessionBias":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","dxyImpact":"<1-2 sentence DXY analysis>","goldBias":"<BULLISH|BEARISH|NEUTRAL>","yieldCurve":"<brief 1 sentence>","keyLevels":[{"symbol":"<sym>","level":<number>,"type":"<RESISTANCE|SUPPORT>","note":"<why>"}],"watchlist":["<sym1>","<sym2>","<sym3>"],"sessionNote":"<2 sentence overall note>"}
Provide exactly 3 keyLevels and 3 watchlist items.`;

const dp = (b) => b >= 1000 ? 2 : b >= 10 ? 3 : 4;
const fmt = (v, b) => v == null ? "—" : v.toLocaleString(undefined, { minimumFractionDigits: dp(b), maximumFractionDigits: dp(b) });
const vixClr = (v) => v < 15 ? C.up : v < 20 ? C.goldL : v < 30 ? C.amber : C.dn;
const vixLbl = (v) => v < 15 ? "CALM" : v < 20 ? "NORMAL" : v < 30 ? "ELEVATED" : "HIGH FEAR";

function genFB(base, vol, pts) {
  pts = pts || 48;
  var data = [];
  var p = base * (1 - vol * 1.8);
  var now = Date.now();
  for (var i = pts - 1; i >= 0; i--) {
    p = p * (1 + (Math.random() - 0.491) * vol);
    data.push({
      t: new Date(now - i * 30 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      p: parseFloat(p.toFixed(dp(base)))
    });
  }
  data[data.length - 1].p = parseFloat((base * (1 + (Math.random() - 0.5) * vol * 0.25)).toFixed(dp(base)));
  return data;
}

function initMkt() {
  return INSTRUMENTS.map(function(inst) {
    var ch = genFB(inst.b, inst.v);
    var open = ch[0].p;
    var cur = ch[ch.length - 1].p;
    return Object.assign({}, inst, { ch: ch, open: open, cur: cur, chg: cur - open, pct: (cur - open) / open * 100, live: false });
  });
}

function ChartTip(props) {
  if (!props.active || !props.payload || !props.payload.length) return null;
  return React.createElement("div", {
    style: { background: C.bg3, border: "1px solid " + C.border2, borderRadius: 6, padding: "7px 11px", fontSize: 11, fontFamily: "'DM Mono',monospace" }
  },
    React.createElement("div", { style: { color: C.txt0, fontWeight: 600 } }, props.payload[0] && props.payload[0].value && props.payload[0].value.toLocaleString()),
    React.createElement("div", { style: { color: C.txt2, marginTop: 1 } }, props.label)
  );
}

export default function Auxiron() {
  var _tab = useState("markets");
  var tab = _tab[0]; var setTab = _tab[1];

  var _mkt = useState(initMkt);
  var mkt = _mkt[0]; var setMkt = _mkt[1];

  var _sel = useState("XAU/USD");
  var sel = _sel[0]; var setSel = _sel[1];

  var _cv = useState("single");
  var cv = _cv[0]; var setCv = _cv[1];

  var _quad = useState(DEFAULT_QUAD);
  var quad = _quad[0]; var setQuad = _quad[1];

  var _editQ = useState(false);
  var editQ = _editQ[0]; var setEditQ = _editQ[1];

  var _catF = useState("All");
  var catF = _catF[0]; var setCatF = _catF[1];

  var _fxGrp = useState("Majors");
  var fxGrp = _fxGrp[0]; var setFxGrp = _fxGrp[1];

  var _futGrp = useState("All");
  var futGrp = _futGrp[0]; var setFutGrp = _futGrp[1];

  var _hl = useState("");
  var hl = _hl[0]; var setHl = _hl[1];

  var _result = useState(null);
  var result = _result[0]; var setResult = _result[1];

  var _loading = useState(false);
  var loading = _loading[0]; var setLoading = _loading[1];

  var _err = useState(null);
  var err = _err[0]; var setErr = _err[1];

  var _hist = useState([]);
  var hist = _hist[0]; var setHist = _hist[1];

  var _status = useState("connecting");
  var status = _status[0]; var setStatus = _status[1];

  var _now = useState("");
  var now = _now[0]; var setNow = _now[1];

  var _ctx = useState(null);
  var ctx = _ctx[0]; var setCtx = _ctx[1];

  var _ctxLoading = useState(false);
  var ctxLoading = _ctxLoading[0]; var setCtxLoading = _ctxLoading[1];

  var _lastRefresh = useState(null);
  var lastRefresh = _lastRefresh[0]; var setLastRefresh = _lastRefresh[1];

  var wsRef = useRef(null);

  useEffect(function() {
    var id = setInterval(function() {
      setNow(new Date().toUTCString().slice(0, 25));
    }, 1000);
    setNow(new Date().toUTCString().slice(0, 25));
    return function() { clearInterval(id); };
  }, []);

  var fetchPrices = useCallback(function() {
    var syms = INSTRUMENTS.filter(function(i) { return TD_OK.has(i.s); }).map(function(i) { return i.s; });
    var batches = [];
    for (var i = 0; i < syms.length; i += 8) batches.push(syms.slice(i, i + 8));

    Promise.allSettled(batches.map(function(b) {
      return fetch("/api/prices?symbol=" + encodeURIComponent(b.join(",")))
        .then(function(r) { return r.json(); });
    })).then(function(results) {
      var combined = {};
      results.forEach(function(r) {
        if (r.status === "fulfilled" && typeof r.value === "object") Object.assign(combined, r.value);
      });
      var updated = 0;
      setMkt(function(prev) {
        return prev.map(function(inst) {
          if (!TD_OK.has(inst.s)) return inst;
          var e = combined[inst.s];
          if (!e || e.status === "error" || !e.price) return inst;
          var cur = parseFloat(e.price);
          if (isNaN(cur) || cur <= 0) return inst;
          updated++;
          var open = inst.live ? inst.open : parseFloat((cur * (1 + (Math.random() - 0.52) * inst.v * 2)).toFixed(dp(inst.b)));
          var newCh = inst.ch.slice(-47).concat([{
            t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            p: parseFloat(cur.toFixed(dp(inst.b)))
          }]);
          return Object.assign({}, inst, { cur: cur, open: open, chg: cur - open, pct: (cur - open) / open * 100, ch: newCh, live: true });
        });
      });
      if (updated > 0) { setStatus("live"); setLastRefresh(new Date()); }
    }).catch(function() { setStatus("simulated"); });
  }, []);

  var fetchChart = useCallback(function(sym) {
    if (!TD_OK.has(sym)) return;
    fetch("/api/prices?symbol=" + encodeURIComponent(sym) + "&endpoint=timeseries&interval=30min&outputsize=48")
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.status === "error" || !d.values || !d.values.length) return;
        var ch = d.values.slice().reverse().map(function(v) {
          return { t: new Date(v.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), p: parseFloat(v.close) };
        });
        var open = ch[0] && ch[0].p;
        setMkt(function(prev) {
          return prev.map(function(inst) {
            if (inst.s !== sym) return inst;
            var cur = (ch[ch.length - 1] && ch[ch.length - 1].p) || inst.cur;
            var o = open || inst.open;
            return Object.assign({}, inst, { ch: ch, open: o, cur: cur, chg: cur - o, pct: (cur - o) / o * 100, live: true });
          });
        });
      }).catch(function() {});
  }, []);

  useEffect(function() {
    fetchPrices();
    var id = setInterval(fetchPrices, 12000);
    return function() { clearInterval(id); };
  }, [fetchPrices]);

  useEffect(function() { fetchChart(sel); }, [sel, fetchChart]);

  useEffect(function() {
    if (status === "live") return;
    var id = setInterval(function() {
      setMkt(function(prev) {
        return prev.map(function(inst) {
          if (inst.live && status === "live") return inst;
          var tick = inst.v * 0.10;
          var cur = parseFloat((inst.cur * (1 + (Math.random() - 0.492) * tick)).toFixed(dp(inst.b)));
          var newCh = inst.ch.slice(-47).concat([{
            t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), p: cur
          }]);
          return Object.assign({}, inst, { cur: cur, ch: newCh, chg: cur - inst.open, pct: (cur - inst.open) / inst.open * 100 });
        });
      });
    }, 3000);
    return function() { clearInterval(id); };
  }, [status]);

  function analyze(text) {
    var inp = (text || hl).trim();
    if (!inp) return;
    setLoading(true); setErr(null); setResult(null);
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: AI_SYS, messages: [{ role: "user", content: "Analyze: \"" + inp + "\"" }] })
    }).then(function(r) { return r.json(); })
      .then(function(d) {
        var txt = (d.content || []).map(function(x) { return x.text || ""; }).join("");
        var res = JSON.parse(txt.replace(/```json|```/g, "").trim());
        setResult(res);
        setHist(function(p) { return [{ headline: inp, result: res, ts: new Date() }].concat(p.slice(0, 7)); });
      })
      .catch(function() { setErr("Analysis failed. Try again."); })
      .finally(function() { setLoading(false); });
  }

  function fetchCtx() {
    setCtxLoading(true);
    var snap = mkt.filter(function(i) { return ["XAU/USD","DX","US10Y","US02Y","VIX","SPX","EUR/USD","WTI/USD","BTC/USD"].indexOf(i.s) >= 0; })
      .map(function(i) { return i.l + ": " + fmt(i.cur, i.b) + " (" + (i.pct >= 0 ? "+" : "") + i.pct.toFixed(2) + "%)"; }).join(", ");
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, system: CTX_SYS, messages: [{ role: "user", content: "Market snapshot: " + snap + ". Provide pre-session briefing." }] })
    }).then(function(r) { return r.json(); })
      .then(function(d) {
        var txt = (d.content || []).map(function(x) { return x.text || ""; }).join("");
        setCtx(JSON.parse(txt.replace(/```json|```/g, "").trim()));
        setLastRefresh(new Date());
      })
      .catch(function() {})
      .finally(function() { setCtxLoading(false); });
  }

  function toggleQuad(sym) {
    setQuad(function(prev) {
      if (prev.indexOf(sym) >= 0) return prev.length > 1 ? prev.filter(function(s) { return s !== sym; }) : prev;
      if (prev.length >= 4) return prev.slice(1).concat([sym]);
      return prev.concat([sym]);
    });
  }

  var cfg = result ? (ICFG[result.impactLevel] || ICFG.NOISE) : null;
  var selI = mkt.find(function(d) { return d.s === sel; });
  var vixI = mkt.find(function(d) { return d.s === "VIX"; });
  var dxyI = mkt.find(function(d) { return d.s === "DX"; });
  var y2   = mkt.find(function(d) { return d.s === "US02Y"; });
  var y10  = mkt.find(function(d) { return d.s === "US10Y"; });
  var y30  = mkt.find(function(d) { return d.s === "US30Y"; });
  var spread = y2 && y10 ? parseFloat((y10.cur - y2.cur).toFixed(3)) : null;
  var inverted = spread !== null && spread < 0;

  var displayed = mkt.filter(function(m) {
    if (catF === "All") return true;
    if (catF === "Forex") return m.cat === "Forex" && m.grp === fxGrp;
    if (catF === "Futures") return m.cat === "Futures" && (futGrp === "All" || m.grp === futGrp);
    return m.cat === catF;
  });

  var stClr = status === "live" ? C.goldL : status === "error" ? C.dn : C.amber;
  var stLbl = status === "live" ? "LIVE" : status === "error" ? "ERROR" : "SIM";

  var NAV = [
    { key: "markets", icon: "◫", label: "Markets" },
    { key: "charts",  icon: "▦", label: "Charts"  },
    { key: "session", icon: "◉", label: "Session" },
    { key: "filter",  icon: "◈", label: "AI Filter"},
  ];

  var S = {
    page:   { maxWidth:480, margin:"0 auto", minHeight:"100vh", background:C.bg0, fontFamily:"'DM Mono','Courier New',monospace", color:C.txt0, display:"flex", flexDirection:"column" },
    hdr:    { background:C.bg1, borderBottom:"1px solid "+C.border, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
    ticker: { background:C.bg1, borderBottom:"1px solid "+C.border, overflow:"hidden", height:26, display:"flex", alignItems:"center", flexShrink:0 },
    body:   { flex:1, overflowY:"auto", paddingBottom:68 },
    nav:    { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.bg1, borderTop:"1px solid "+C.border, display:"flex", zIndex:300 },
    pill:   function(active) { return { background: active ? "rgba(200,168,64,0.12)" : C.bg2, border: active ? "1px solid rgba(200,168,64,0.38)" : "1px solid "+C.border, color: active ? C.goldL : C.txt2, borderRadius:20, padding:"4px 11px", fontSize:9, fontWeight:500, whiteSpace:"nowrap", cursor:"pointer" }; },
    bluepill: function(active) { return { background: active ? "rgba(72,144,248,0.12)" : C.bg2, border: active ? "1px solid rgba(72,144,248,0.35)" : "1px solid "+C.border, color: active ? C.blue : C.txt2, borderRadius:20, padding:"4px 10px", fontSize:9, fontWeight:500, whiteSpace:"nowrap", cursor:"pointer" }; },
    card:   { background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"11px 13px" },
    row:    { display:"flex", alignItems:"center", gap:10 },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{display:none;}
        textarea:focus{outline:none;}
        button{-webkit-tap-highlight-color:transparent;cursor:pointer;font-family:inherit;}
        .tap:active{opacity:0.6;}
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fu 0.28s ease forwards;}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:0.1}}
        .pd{animation:pd 1.5s ease infinite;}
        @keyframes sp{to{transform:rotate(360deg)}}
        .sp{animation:sp 0.8s linear infinite;}
        @keyframes tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .tk{animation:tk 65s linear infinite;display:inline-block;white-space:nowrap;}
        .tk:hover{animation-play-state:paused;}
      `}</style>

      {/* HEADER */}
      <div style={S.hdr}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:stClr, boxShadow:"0 0 8px "+stClr }} className="pd" />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, letterSpacing:".1em", color:C.txt0 }}>AUX</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, letterSpacing:".1em", color:C.gold }}>IRON</span>
          <span style={{ fontSize:8, background:"rgba(200,168,64,0.12)", color:C.gold, padding:"2px 6px", borderRadius:3, letterSpacing:".1em", border:"1px solid rgba(200,168,64,0.22)" }}>PRO</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {vixI && (
            <div style={{ background:C.bg2, border:"1px solid "+C.border, borderRadius:6, padding:"3px 8px", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:8, color:C.txt2 }}>VIX</span>
              <span style={{ fontSize:11, fontWeight:600, color:vixClr(vixI.cur), fontVariantNumeric:"tabular-nums" }}>{vixI.cur.toFixed(2)}</span>
              <span style={{ fontSize:7, color:vixClr(vixI.cur) }}>{vixLbl(vixI.cur)}</span>
            </div>
          )}
          {dxyI && (
            <div style={{ background:C.bg2, border:"1px solid "+C.border, borderRadius:6, padding:"3px 8px", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:8, color:C.txt2 }}>DXY</span>
              <span style={{ fontSize:11, fontWeight:600, color:dxyI.pct >= 0 ? C.dn : C.up, fontVariantNumeric:"tabular-nums" }}>{dxyI.cur.toFixed(2)}</span>
            </div>
          )}
          <span style={{ fontSize:8, color:stClr, letterSpacing:".05em" }}>● {stLbl}</span>
        </div>
      </div>

      {/* TICKER */}
      <div style={S.ticker}>
        <div className="tk">
          {mkt.concat(mkt).map(function(m, i) {
            var up = m.pct >= 0;
            return (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, marginRight:18 }}>
                <span style={{ fontSize:9, color:C.txt2 }}>{m.l}</span>
                <span style={{ fontSize:10, fontWeight:500, color:C.txt1, fontVariantNumeric:"tabular-nums" }}>{fmt(m.cur, m.b)}</span>
                <span style={{ fontSize:9, color: up ? C.up : C.dn, fontVariantNumeric:"tabular-nums" }}>{up ? "+" : ""}{m.pct.toFixed(2)}%</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <div style={S.body}>

        {/* ── MARKETS ── */}
        {tab === "markets" && (
          <div>
            {/* Cat pills */}
            <div style={{ padding:"8px 12px", display:"flex", gap:5, overflowX:"auto", borderBottom:"1px solid "+C.border }}>
              {["All"].concat(CATS).map(function(c) {
                return (
                  <button key={c} className="tap" onClick={function() { setCatF(c); }} style={S.pill(catF === c)}>
                    {c === "Volatility" ? "VIX" : c}
                  </button>
                );
              })}
            </div>

            {/* Forex sub */}
            {catF === "Forex" && (
              <div style={{ padding:"6px 12px", display:"flex", gap:5, overflowX:"auto", borderBottom:"1px solid "+C.border }}>
                {FX_GRPS.map(function(g) {
                  return <button key={g} className="tap" onClick={function() { setFxGrp(g); }} style={S.bluepill(fxGrp === g)}>{g}</button>;
                })}
              </div>
            )}

            {/* Futures sub */}
            {catF === "Futures" && (
              <div style={{ padding:"6px 12px", display:"flex", gap:5, overflowX:"auto", borderBottom:"1px solid "+C.border }}>
                {FUT_GRPS.map(function(g) {
                  return (
                    <button key={g} className="tap" onClick={function() { setFutGrp(g); }}
                      style={{ background: futGrp === g ? "rgba(184,88,240,0.12)" : C.bg2, border: futGrp === g ? "1px solid rgba(184,88,240,0.35)" : "1px solid "+C.border, color: futGrp === g ? C.vix : C.txt2, borderRadius:20, padding:"4px 10px", fontSize:9, fontWeight:500, cursor:"pointer" }}>
                      {g}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Bond yields bar */}
            {(catF === "All" || catF === "Bonds") && y2 && y10 && y30 && (
              <div style={{ padding:"8px 12px", borderBottom:"1px solid "+C.border }}>
                <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:6 }}>YIELD CURVE</div>
                <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
                  {[y2, y10, y30].map(function(m) {
                    return (
                      <div key={m.s} className="tap" onClick={function() { setSel(m.s); setTab("charts"); fetchChart(m.s); }}
                        style={{ background:C.bg2, border:"1px solid "+C.border, borderRadius:8, padding:"7px 12px", flexShrink:0, minWidth:88 }}>
                        <div style={{ fontSize:8, color:C.bond, letterSpacing:".06em", marginBottom:2 }}>{m.l}</div>
                        <div style={{ fontSize:15, fontWeight:600, color:C.txt0, fontVariantNumeric:"tabular-nums" }}>{m.cur.toFixed(3)}<span style={{ fontSize:9, color:C.txt2 }}>%</span></div>
                        <div style={{ fontSize:9, color: m.chg >= 0 ? C.dn : C.up, fontVariantNumeric:"tabular-nums" }}>{m.chg >= 0 ? "+" : ""}{m.chg.toFixed(3)}</div>
                      </div>
                    );
                  })}
                  {spread !== null && (
                    <div style={{ background: inverted ? "rgba(240,64,64,0.08)" : "rgba(40,204,120,0.06)", border:"1px solid "+(inverted ? C.dnD : C.upD), borderRadius:8, padding:"7px 12px", flexShrink:0, minWidth:88 }}>
                      <div style={{ fontSize:8, color:C.txt2, letterSpacing:".06em", marginBottom:2 }}>2s10s</div>
                      <div style={{ fontSize:15, fontWeight:600, color: inverted ? C.dn : C.up, fontVariantNumeric:"tabular-nums" }}>{spread > 0 ? "+" : ""}{spread}%</div>
                      <div style={{ fontSize:8, color: inverted ? C.dn : C.up }}>{inverted ? "▼ INVERTED" : "▲ NORMAL"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIX gauge */}
            {(catF === "All" || catF === "Volatility") && vixI && (
              <div style={{ padding:"8px 12px", borderBottom:"1px solid "+C.border }}>
                <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:6 }}>VOLATILITY — VIX</div>
                <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:26, fontWeight:700, color:vixClr(vixI.cur), fontFamily:"'Syne',sans-serif", fontVariantNumeric:"tabular-nums" }}>{vixI.cur.toFixed(2)}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:vixClr(vixI.cur), marginTop:2 }}>{vixLbl(vixI.cur)}</div>
                    <div style={{ fontSize:9, color:C.txt2, marginTop:1 }}>{vixI.pct >= 0 ? "+" : ""}{vixI.pct.toFixed(2)}% today</div>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ position:"relative", height:8, background:C.bg2, borderRadius:4, overflow:"hidden", marginBottom:6 }}>
                      {[{ v:15, c:"#28cc78" },{ v:20, c:"#e8c858" },{ v:30, c:"#f09020" },{ v:50, c:"#f04040" }].map(function(seg, idx, arr) {
                        var prev = idx === 0 ? 0 : arr[idx-1].v;
                        var w = ((seg.v - prev) / 50) * 100;
                        return <div key={idx} style={{ position:"absolute", left:((prev/50)*100)+"%", width:w+"%", height:"100%", background:seg.c, opacity:0.3 }}></div>;
                      })}
                      <div style={{ position:"absolute", left:Math.min(vixI.cur/50*100, 98)+"%", top:-2, width:3, height:12, background:vixClr(vixI.cur), borderRadius:2 }}></div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:7, color:C.txt3 }}>
                      <span>0</span><span>15</span><span>20</span><span>30</span><span>50+</span>
                    </div>
                    <div style={{ width:100, height:30, marginTop:4 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vixI.ch.slice(-20)} margin={{ top:0, right:0, bottom:0, left:0 }}>
                          <Line type="monotone" dataKey="p" stroke={C.vix} strokeWidth={1.4} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rows */}
            <div style={{ padding:"8px 12px", display:"grid", gap:5 }}>
              {displayed.map(function(m) {
                var up = m.pct >= 0;
                var isVix = m.s === "VIX";
                var isBond = m.cat === "Bonds";
                var lineClr = isVix ? C.vix : isBond ? C.bond : up ? C.up : C.dn;
                return (
                  <div key={m.s} className="tap"
                    onClick={function() { setSel(m.s); setTab("charts"); fetchChart(m.s); }}
                    style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"10px 13px", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:C.txt0 }}>{m.l}</div>
                      <div style={{ fontSize:8, color:C.txt2, marginTop:1, letterSpacing:".06em" }}>
                        {m.s}
                        {m.grp && <span style={{ marginLeft:5, color:C.txt3 }}>{m.grp}</span>}
                        {m.live && <span style={{ marginLeft:5, color:C.up, fontSize:7 }}>● LIVE</span>}
                        {!TD_OK.has(m.s) && <span style={{ marginLeft:5, color:C.txt3, fontSize:7 }}>SIM</span>}
                      </div>
                    </div>
                    <div style={{ width:55, height:22 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={m.ch.slice(-14)} margin={{ top:1, right:0, bottom:1, left:0 }}>
                          <Line type="monotone" dataKey="p" stroke={lineClr} strokeWidth={1.4} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign:"right", minWidth:80 }}>
                      <div style={{ fontSize:12, fontWeight:500, color: isVix ? vixClr(m.cur) : isBond ? C.bond : C.txt0, fontVariantNumeric:"tabular-nums" }}>
                        {fmt(m.cur, m.b)}{isBond ? "%" : ""}
                      </div>
                      <div style={{ fontSize:10, fontWeight:500, marginTop:1, fontVariantNumeric:"tabular-nums", color: isVix ? (up ? C.dn : C.up) : up ? C.up : C.dn }}>
                        {up ? "+" : ""}{m.pct.toFixed(2)}% {up ? "▲" : "▼"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CHARTS ── */}
        {tab === "charts" && (
          <div className="fu">
            <div style={{ padding:"8px 12px", display:"flex", gap:5, borderBottom:"1px solid "+C.border, overflowX:"auto", alignItems:"center" }}>
              {[["single","SINGLE"],["quad","QUAD"],["grid","GRID"]].map(function(pair) {
                return <button key={pair[0]} className="tap" onClick={function() { setCv(pair[0]); }} style={S.pill(cv === pair[0])}>{pair[1]}</button>;
              })}
              {cv === "quad" && (
                <button className="tap" onClick={function() { setEditQ(function(e) { return !e; }); }}
                  style={{ background: editQ ? "rgba(72,144,248,0.12)" : C.bg2, border: editQ ? "1px solid rgba(72,144,248,0.4)" : "1px solid "+C.border, color: editQ ? C.blue : C.txt2, borderRadius:20, padding:"4px 12px", fontSize:9, marginLeft:"auto", cursor:"pointer" }}>
                  ✎ EDIT
                </button>
              )}
            </div>

            {cv === "quad" && editQ && (
              <div style={{ padding:"10px 12px", background:C.bg2, borderBottom:"1px solid "+C.border }}>
                <div style={{ fontSize:8, color:C.txt2, letterSpacing:".1em", marginBottom:7 }}>PICK UP TO 4 — {quad.length}/4</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, maxHeight:160, overflowY:"auto" }}>
                  {mkt.map(function(m) {
                    var isS = quad.indexOf(m.s) >= 0;
                    return (
                      <button key={m.s} className="tap" onClick={function() { toggleQuad(m.s); }}
                        style={{ background: isS ? "rgba(200,168,64,0.15)" : C.bg1, border: isS ? "1px solid rgba(200,168,64,0.45)" : "1px solid "+C.border, color: isS ? C.goldL : C.txt2, borderRadius:6, padding:"3px 8px", fontSize:8, cursor:"pointer" }}>
                        {m.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {cv === "single" && (
              <div style={{ padding:"7px 12px", display:"flex", gap:4, overflowX:"auto", borderBottom:"1px solid "+C.border }}>
                {mkt.map(function(m) {
                  var isS = sel === m.s;
                  return (
                    <button key={m.s} className="tap" onClick={function() { setSel(m.s); fetchChart(m.s); }}
                      style={{ background: isS ? "rgba(200,168,64,0.12)" : C.bg2, border: isS ? "1px solid rgba(200,168,64,0.4)" : "1px solid "+C.border, color: isS ? C.goldL : C.txt2, borderRadius:20, padding:"4px 10px", fontSize:8, fontWeight: isS ? 500 : 400, whiteSpace:"nowrap", cursor:"pointer" }}>
                      {m.l}
                    </button>
                  );
                })}
              </div>
            )}

            {cv === "single" && selI && (
              <div style={{ padding:"12px" }}>
                <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:12, padding:"14px" }}>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:8, color:C.txt2, letterSpacing:".1em", marginBottom:2 }}>
                      {selI.s} · {selI.cat}{selI.live ? " · LIVE" : " · SIM"}
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color:C.txt0, fontVariantNumeric:"tabular-nums" }}>
                      {fmt(selI.cur, selI.b)}{selI.cat === "Bonds" ? "%" : ""}
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:3, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color: selI.pct >= 0 ? C.up : C.dn }}>{selI.pct >= 0 ? "+" : ""}{selI.pct.toFixed(2)}%</span>
                      <span style={{ fontSize:11, color: selI.pct >= 0 ? C.up : C.dn }}>{selI.pct >= 0 ? "▲" : "▼"} {Math.abs(selI.chg).toFixed(dp(selI.b))}</span>
                      <span style={{ fontSize:9, color:C.txt2 }}>Open {fmt(selI.open, selI.b)}</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={185}>
                    <AreaChart data={selI.ch} margin={{ top:4, right:4, bottom:4, left:0 }}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selI.pct >= 0 ? C.up : C.dn} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={selI.pct >= 0 ? C.up : C.dn} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" tick={{ fill:C.txt3, fontSize:8 }} tickLine={false} axisLine={false} interval={8} />
                      <YAxis domain={["auto","auto"]} tick={{ fill:C.txt3, fontSize:8 }} tickLine={false} axisLine={false} width={56} tickFormatter={function(v) { return fmt(v, selI.b); }} />
                      <Tooltip content={<ChartTip />} />
                      <ReferenceLine y={selI.open} stroke={C.border2} strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="p" stroke={selI.pct >= 0 ? C.up : C.dn} strokeWidth={2} fill="url(#cg)" dot={false} activeDot={{ r:3, fill:C.txt0, strokeWidth:0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:5, marginTop:10 }}>
                    {[
                      ["HIGH", Math.max.apply(null, selI.ch.map(function(d) { return d.p; })), C.up],
                      ["LOW",  Math.min.apply(null, selI.ch.map(function(d) { return d.p; })), C.dn],
                      ["OPEN", selI.open, C.txt1],
                      ["RANGE", ((Math.max.apply(null, selI.ch.map(function(d) { return d.p; })) - Math.min.apply(null, selI.ch.map(function(d) { return d.p; }))) / selI.open * 100).toFixed(2) + "%", C.amber],
                    ].map(function(item) {
                      return (
                        <div key={item[0]} style={{ background:C.bg2, border:"1px solid "+C.border, borderRadius:7, padding:"6px 7px", textAlign:"center" }}>
                          <div style={{ fontSize:7, color:C.txt3, letterSpacing:".1em", marginBottom:1 }}>{item[0]}</div>
                          <div style={{ fontSize:9, fontWeight:500, color:item[2], fontVariantNumeric:"tabular-nums" }}>{typeof item[1] === "string" ? item[1] : fmt(item[1], selI.b)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {cv === "quad" && (
              <div style={{ padding:"12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {quad.map(function(sym) {
                  var m = mkt.find(function(d) { return d.s === sym; });
                  if (!m) return null;
                  var up = m.pct >= 0;
                  var isVix = m.s === "VIX";
                  var isBond = m.cat === "Bonds";
                  var lc = isVix ? C.vix : isBond ? C.bond : up ? C.up : C.dn;
                  return (
                    <div key={sym} className="tap" onClick={function() { setSel(sym); setCv("single"); fetchChart(sym); }}
                      style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"11px" }}>
                      <div style={{ fontSize:8, color:C.txt2, marginBottom:1 }}>{m.l}</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color: isVix ? vixClr(m.cur) : C.txt0, fontVariantNumeric:"tabular-nums" }}>{fmt(m.cur, m.b)}{isBond ? "%" : ""}</div>
                      <div style={{ fontSize:9, color: isVix ? (up ? C.dn : C.up) : up ? C.up : C.dn, marginBottom:5, fontVariantNumeric:"tabular-nums" }}>{up ? "+" : ""}{m.pct.toFixed(2)}%</div>
                      <ResponsiveContainer width="100%" height={72}>
                        <AreaChart data={m.ch} margin={{ top:2, right:2, bottom:2, left:2 }}>
                          <defs>
                            <linearGradient id={"g"+sym.replace(/[^a-z0-9]/gi,"_")} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={lc} stopOpacity={0.12} />
                              <stop offset="95%" stopColor={lc} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <YAxis domain={["auto","auto"]} hide />
                          <ReferenceLine y={m.open} stroke={C.border} strokeDasharray="2 2" />
                          <Area type="monotone" dataKey="p" stroke={lc} strokeWidth={1.8} fill={"url(#g"+sym.replace(/[^a-z0-9]/gi,"_")+")"} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
                {Array.from({ length: 4 - quad.length }).map(function(_, i) {
                  return (
                    <div key={"empty"+i} className="tap" onClick={function() { setEditQ(true); }}
                      style={{ background:C.bg1, border:"1px dashed "+C.border, borderRadius:10, padding:"11px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:130 }}>
                      <span style={{ fontSize:10, color:C.txt3 }}>+ ADD</span>
                    </div>
                  );
                })}
              </div>
            )}

            {cv === "grid" && (
              <div style={{ padding:"12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                {mkt.map(function(m) {
                  var up = m.pct >= 0;
                  var isVix = m.s === "VIX";
                  var isBond = m.cat === "Bonds";
                  var lc = isVix ? C.vix : isBond ? C.bond : up ? C.up : C.dn;
                  return (
                    <div key={m.s} className="tap" onClick={function() { setSel(m.s); setCv("single"); fetchChart(m.s); }}
                      style={{ background:C.bg1, border:"1px solid "+(sel === m.s ? "rgba(200,168,64,0.3)" : C.border), borderRadius:9, padding:"9px" }}>
                      <div style={{ fontSize:8, color:C.txt2, marginBottom:1 }}>{m.l}</div>
                      <div style={{ fontSize:11, fontWeight:500, color: isVix ? vixClr(m.cur) : C.txt0, fontVariantNumeric:"tabular-nums" }}>{fmt(m.cur, m.b)}{isBond ? "%" : ""}</div>
                      <div style={{ fontSize:9, color: isVix ? (up ? C.dn : C.up) : up ? C.up : C.dn, marginBottom:4, fontVariantNumeric:"tabular-nums" }}>{up ? "+" : ""}{m.pct.toFixed(2)}%</div>
                      <ResponsiveContainer width="100%" height={40}>
                        <LineChart data={m.ch.slice(-16)} margin={{ top:0, right:0, bottom:0, left:0 }}>
                          <Line type="monotone" dataKey="p" stroke={lc} strokeWidth={1.4} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SESSION ── */}
        {tab === "session" && (
          <div style={{ padding:"12px" }} className="fu">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:C.txt0, letterSpacing:".06em" }}>SESSION BRIEFING</div>
                <div style={{ fontSize:8, color:C.txt2, marginTop:1 }}>AI pre-trade analysis · {now}</div>
              </div>
              <button className="tap" onClick={fetchCtx} disabled={ctxLoading}
                style={{ background: ctxLoading ? C.bg2 : C.gold, color: ctxLoading ? C.txt2 : "#0c1118", border:"none", borderRadius:8, padding:"7px 14px", fontSize:9, fontWeight:500, display:"flex", alignItems:"center", gap:5 }}>
                {ctxLoading ? (
                  <React.Fragment>
                    <div className="sp" style={{ width:10, height:10, border:"2px solid "+C.border2, borderTopColor:C.txt1, borderRadius:"50%" }}></div>
                    GENERATING…
                  </React.Fragment>
                ) : "◉ GENERATE"}
              </button>
            </div>

            <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px", marginBottom:10 }}>
              <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:8 }}>MARKET SNAPSHOT</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {["XAU/USD","DX","US10Y","VIX","SPX","EUR/USD","WTI/USD","BTC/USD"].map(function(sym) {
                  var m = mkt.find(function(d) { return d.s === sym; });
                  if (!m) return null;
                  var up = m.pct >= 0;
                  var isVix = m.s === "VIX";
                  var isBond = m.cat === "Bonds";
                  return (
                    <div key={sym} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:C.bg2, borderRadius:7, padding:"7px 10px", border:"1px solid "+C.border }}>
                      <div>
                        <div style={{ fontSize:8, color:C.txt2 }}>{m.l}</div>
                        <div style={{ fontSize:12, fontWeight:500, color: isVix ? vixClr(m.cur) : isBond ? C.bond : C.txt0, fontVariantNumeric:"tabular-nums" }}>{fmt(m.cur, m.b)}{isBond ? "%" : ""}</div>
                      </div>
                      <div style={{ fontSize:10, fontWeight:500, color: isVix ? (up ? C.dn : C.up) : up ? C.up : C.dn, fontVariantNumeric:"tabular-nums" }}>{up ? "+" : ""}{m.pct.toFixed(2)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {y2 && y10 && y30 && (
              <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em" }}>YIELD CURVE</div>
                  <div style={{ fontSize:8, color: inverted ? C.dn : C.up, fontWeight:600 }}>{inverted ? "▼ INVERTED" : "▲ NORMAL"}</div>
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:60 }}>
                  {[y2, y10, y30].map(function(m, i) {
                    var maxY = Math.max(y2.cur, y10.cur, y30.cur);
                    var h = Math.max((m.cur / maxY) * 50, 8);
                    var bgColor = inverted && i > 0 ? "rgba(64,200,208,0.10)" : "rgba(64,200,208,0.20)";
                    var opac = inverted && i > 0 ? 0.5 : 1;
                    return (
                      <div key={m.s} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <div style={{ fontSize:9, fontWeight:600, color:C.bond, fontVariantNumeric:"tabular-nums" }}>{m.cur.toFixed(2)}%</div>
                        <div style={{ width:"100%", height:h, background:bgColor, border:"1px solid "+C.bond, borderRadius:3, opacity:opac }}></div>
                        <div style={{ fontSize:7, color:C.txt3 }}>{["2Y","10Y","30Y"][i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!ctx && !ctxLoading && (
              <div style={{ textAlign:"center", padding:"30px 20px", background:C.bg1, border:"1px solid "+C.border, borderRadius:10 }}>
                <div style={{ fontSize:24, color:C.txt3, marginBottom:6, opacity:0.3 }}>◉</div>
                <div style={{ fontSize:10, color:C.txt3, letterSpacing:".1em" }}>TAP GENERATE FOR AI SESSION BRIEFING</div>
                <div style={{ fontSize:9, color:C.txt3, marginTop:3, opacity:0.6 }}>Analyses DXY · yields · VIX · key levels</div>
              </div>
            )}

            {ctx && (
              <div className="fu">
                <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em" }}>SESSION BIAS</div>
                    <span style={{ fontSize:12, fontWeight:700, color: SC[ctx.sessionBias] || C.txt1, background:"rgba(0,0,0,0.2)", border:"1px solid rgba(200,200,200,0.1)", borderRadius:6, padding:"3px 10px", letterSpacing:".06em" }}>{ctx.sessionBias}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.txt1, lineHeight:1.7, marginBottom:8 }}>{ctx.sessionNote}</div>
                  <div style={{ fontSize:8, color:C.txt3, letterSpacing:".08em", marginBottom:4 }}>DXY</div>
                  <div style={{ fontSize:11, color:C.txt2, lineHeight:1.6 }}>{ctx.dxyImpact}</div>
                </div>

                {ctx.keyLevels && ctx.keyLevels.length > 0 && (
                  <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px", marginBottom:8 }}>
                    <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:7 }}>KEY LEVELS</div>
                    {ctx.keyLevels.map(function(kl, i) {
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom: i < ctx.keyLevels.length - 1 ? 6 : 0, background:C.bg2, borderRadius:7, padding:"8px 10px", border:"1px solid "+C.border }}>
                          <div style={{ fontSize:9, fontWeight:600, color:C.txt0, minWidth:60 }}>{kl.symbol}</div>
                          <div style={{ fontSize:11, fontWeight:600, color: kl.type === "RESISTANCE" ? C.dn : C.up, minWidth:58, fontVariantNumeric:"tabular-nums" }}>{kl.level}</div>
                          <div style={{ fontSize:8, color: kl.type === "RESISTANCE" ? C.dn : C.up, minWidth:72 }}>{kl.type}</div>
                          <div style={{ flex:1, fontSize:9, color:C.txt2 }}>{kl.note}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {ctx.watchlist && ctx.watchlist.length > 0 && (
                  <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px", marginBottom:8 }}>
                    <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:7 }}>AI WATCHLIST</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {ctx.watchlist.map(function(sym, i) {
                        var m = mkt.find(function(d) { return d.s === sym || d.l === sym; });
                        return (
                          <button key={i} className="tap"
                            onClick={function() { if (m) { setSel(m.s); setTab("charts"); fetchChart(m.s); } }}
                            style={{ background:C.bg2, border:"1px solid rgba(200,168,64,0.3)", color:C.goldL, borderRadius:8, padding:"7px 12px", fontSize:10, fontWeight:500 }}>
                            {sym}
                            {m && <span style={{ marginLeft:5, fontSize:9, color: m.pct >= 0 ? C.up : C.dn }}>{m.pct >= 0 ? "+" : ""}{m.pct.toFixed(2)}%</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:10, padding:"12px" }}>
                  <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:4 }}>YIELD CURVE NOTE</div>
                  <div style={{ fontSize:11, color:C.txt1, lineHeight:1.7 }}>{ctx.yieldCurve}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                    <div>
                      <div style={{ fontSize:8, color:C.txt3, marginBottom:2 }}>GOLD BIAS</div>
                      <div style={{ fontSize:11, fontWeight:600, color: DC[ctx.goldBias] || C.txt1 }}>{ctx.goldBias}</div>
                    </div>
                    {lastRefresh && (
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:8, color:C.txt3, marginBottom:2 }}>GENERATED</div>
                        <div style={{ fontSize:9, color:C.txt2 }}>{lastRefresh.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI FILTER ── */}
        {tab === "filter" && (
          <div style={{ padding:"12px" }}>
            <div style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:12, padding:"13px", marginBottom:10 }}>
              <div style={{ fontSize:8, color:C.txt3, letterSpacing:".12em", marginBottom:7 }}>PASTE HEADLINE OR NEWS STORY</div>
              <textarea value={hl} onChange={function(e) { setHl(e.target.value); }}
                placeholder="e.g. Federal Reserve raises rates by 25bps…"
                rows={3} style={{ width:"100%", background:"transparent", border:"none", color:C.txt0, fontSize:13, resize:"none", lineHeight:1.7, fontFamily:"inherit" }} />
              <button onClick={function() { analyze(); }} disabled={loading || !hl.trim()}
                style={{ width:"100%", marginTop:10, background: loading ? C.bg2 : C.gold, color: loading ? C.txt2 : "#0c1118", border:"none", borderRadius:8, padding:"11px", fontSize:11, fontWeight:500, letterSpacing:".1em", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                {loading ? (
                  <React.Fragment>
                    <div className="sp" style={{ width:12, height:12, border:"2px solid "+C.border2, borderTopColor:C.txt1, borderRadius:"50%" }}></div>
                    ANALYZING…
                  </React.Fragment>
                ) : "▶  ANALYZE IMPACT"}
              </button>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:5 }}>QUICK SAMPLES</div>
              {SAMPLES.map(function(s, i) {
                return (
                  <button key={i} className="tap" onClick={function() { setHl(s); analyze(s); }}
                    style={{ display:"block", width:"100%", background:C.bg1, border:"1px solid "+C.border, color:C.txt2, borderRadius:8, padding:"9px 12px", fontSize:11, textAlign:"left", marginBottom:4 }}>
                    {s}
                  </button>
                );
              })}
            </div>

            {err && <div style={{ background:"rgba(240,64,64,0.07)", border:"1px solid rgba(240,64,64,0.2)", borderRadius:8, padding:"10px 12px", color:C.dn, fontSize:12, marginBottom:10 }}>⚠ {err}</div>}

            {result && cfg && (
              <div className="fu" style={{ background:cfg.bg, border:"1px solid "+cfg.color+"28", borderRadius:12, padding:"14px", marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:11, flexWrap:"wrap", gap:6 }}>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:cfg.color, letterSpacing:".06em" }}>{result.impactLevel}</div>
                    <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                      <span style={{ fontSize:9, color: SC[result.marketSentiment], fontWeight:500 }}>{result.marketSentiment}</span>
                      <span style={{ fontSize:9, color:C.txt3 }}>·</span>
                      <span style={{ fontSize:9, color: DC[result.sentimentShift], fontWeight:500 }}>{result.sentimentShift}</span>
                      <span style={{ fontSize:9, color:C.txt3 }}>·</span>
                      <span style={{ fontSize:9, color:C.txt1 }}>{result.timeHorizon}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:7, color:C.txt3, letterSpacing:".1em", marginBottom:3 }}>IMPACT</div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:70, height:4, background:C.bg2, borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:result.impactScore+"%", height:"100%", background:cfg.bar, borderRadius:2 }}></div>
                      </div>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:cfg.color }}>{result.impactScore}</span>
                    </div>
                  </div>
                </div>

                {result.noiseReason && (
                  <div style={{ background:"rgba(72,96,128,0.1)", border:"1px solid "+C.border, borderRadius:7, padding:"7px 10px", marginBottom:8, fontSize:11, color:C.txt2 }}>
                    🔇 <strong style={{ color:C.txt1 }}>Noise:</strong> {result.noiseReason}
                  </div>
                )}

                {result.keyDrivers && result.keyDrivers.length > 0 && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:7, color:C.txt3, letterSpacing:".1em", marginBottom:4 }}>KEY DRIVERS</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                      {result.keyDrivers.map(function(d, i) {
                        return <span key={i} style={{ background:C.bg2, border:"1px solid "+C.border, borderRadius:5, padding:"2px 7px", fontSize:9, color:C.txt1 }}>{d}</span>;
                      })}
                    </div>
                  </div>
                )}

                {result.affectedInstruments && result.affectedInstruments.length > 0 && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:7, color:C.txt3, letterSpacing:".1em", marginBottom:5 }}>AFFECTED INSTRUMENTS</div>
                    <div style={{ display:"grid", gap:4 }}>
                      {result.affectedInstruments.map(function(inst, i) {
                        var live = mkt.find(function(d) { return d.s === inst.symbol || d.l === inst.symbol; });
                        return (
                          <div key={i} style={{ background:"rgba(12,17,24,0.6)", border:"1px solid "+C.border, borderRadius:8, padding:"8px 11px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                              <div>
                                <span style={{ fontSize:11, fontWeight:500, color:C.txt0 }}>{inst.symbol}</span>
                                <span style={{ marginLeft:6, fontSize:10, fontWeight:500, color: DC[inst.direction] }}>{inst.direction}</span>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                {live && <div style={{ fontSize:9, color: live.pct >= 0 ? C.up : C.dn, fontVariantNumeric:"tabular-nums" }}>{fmt(live.cur, live.b)}</div>}
                                <div style={{ fontSize:8, color:C.txt2 }}>{inst.confidence}%</div>
                              </div>
                            </div>
                            <div style={{ width:"100%", height:2, background:C.bg2, borderRadius:1, overflow:"hidden", marginBottom:4 }}>
                              <div style={{ width:inst.confidence+"%", height:"100%", background: DC[inst.direction], borderRadius:1 }}></div>
                            </div>
                            <div style={{ fontSize:10, color:C.txt2 }}>{inst.reason}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ background:"rgba(12,17,24,0.5)", border:"1px solid "+C.border, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:7, color:C.gold, letterSpacing:".1em", marginBottom:3, opacity:0.8 }}>◈ TRADER NOTE</div>
                  <div style={{ fontSize:11, color:C.txt1, lineHeight:1.8 }}>{result.traderNote}</div>
                </div>
              </div>
            )}

            {hist.length > 0 && (
              <div>
                <div style={{ fontSize:8, color:C.txt3, letterSpacing:".1em", marginBottom:5 }}>RECENT ANALYSES</div>
                <div style={{ display:"grid", gap:4 }}>
                  {hist.map(function(h, i) {
                    var c = ICFG[h.result.impactLevel] || ICFG.NOISE;
                    return (
                      <div key={i} className="tap" onClick={function() { setHl(h.headline); setResult(h.result); }}
                        style={{ background:C.bg1, border:"1px solid "+C.border, borderRadius:8, padding:"8px 11px", display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:9, fontWeight:500, color:c.color, minWidth:66 }}>{h.result.impactLevel}</span>
                        <span style={{ flex:1, fontSize:10, color:C.txt2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.headline}</span>
                        <span style={{ fontSize:8, color:C.txt3 }}>{h.ts.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!result && !loading && hist.length === 0 && (
              <div style={{ textAlign:"center", padding:"44px 20px" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, color:C.txt3, marginBottom:6, opacity:0.28 }}>◈</div>
                <div style={{ fontSize:10, color:C.txt3, letterSpacing:".1em" }}>PASTE A HEADLINE TO BEGIN</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={S.nav}>
        {NAV.map(function(item) {
          return (
            <button key={item.key} className="tap" onClick={function() { setTab(item.key); }}
              style={{ flex:1, background:"transparent", border:"none", padding:"9px 0 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color: tab === item.key ? C.goldL : C.txt2, transition:"color 0.12s" }}>
              <span style={{ fontSize:14, lineHeight:1 }}>{item.icon}</span>
              <span style={{ fontSize:8, letterSpacing:".07em", fontWeight: tab === item.key ? 500 : 400 }}>{item.label}</span>
              {tab === item.key && <div style={{ width:14, height:2, background:C.gold, borderRadius:1, marginTop:1 }}></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

