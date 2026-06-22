import React, { useState, useEffect } from "react";

const C = {
  bg0:"#080e14", bg1:"#0d1520", bg2:"#121d2c", bg3:"#192538",
  border:"#1e2e42",
  txt0:"#f0f5ff", txt1:"#c2d4e8", txt2:"#7a9ab8", txt3:"#3a5570",
  up:"#22d46e", dn:"#f04545",
  blue:"#4a9eff", amber:"#f0a020",
};

interface CotData {
  date?: string;
  longs?: number;
  shorts?: number;
  net?: number;
  netChg?: number;
  oi?: number;
  oiChg?: number;
  longPct?: number;
  shortPct?: number;
  bias?: string;
  error?: string;
}

interface Sym { s: string; l: string; grp: string; }

const SYMS: Sym[] = [
  { s:"XAU/USD", l:"GOLD",      grp:"Commodities" },
  { s:"XAG/USD", l:"SILVER",    grp:"Commodities" },
  { s:"WTI/USD", l:"OIL",       grp:"Commodities" },
  { s:"BRENT",   l:"BRENT",     grp:"Commodities" },
  { s:"SPX",     l:"S&P 500",   grp:"Indices" },
  { s:"NDX",     l:"NASDAQ",    grp:"Indices" },
  { s:"DJI",     l:"DOW 30",    grp:"Indices" },
  { s:"DX",      l:"DXY",       grp:"Indices" },
  { s:"EUR/USD", l:"EUR/USD",   grp:"Forex" },
  { s:"GBP/USD", l:"GBP/USD",   grp:"Forex" },
  { s:"USD/JPY", l:"USD/JPY",   grp:"Forex" },
  { s:"AUD/USD", l:"AUD/USD",   grp:"Forex" },
  { s:"NZD/USD", l:"NZD/USD",   grp:"Forex" },
  { s:"USD/CAD", l:"USD/CAD",   grp:"Forex" },
  { s:"USD/CHF", l:"USD/CHF",   grp:"Forex" },
  { s:"US10Y",   l:"US 10Y",    grp:"Bonds" },
  { s:"US02Y",   l:"US 2Y",     grp:"Bonds" },
  { s:"US30Y",   l:"US 30Y",    grp:"Bonds" },
  { s:"BTC/USD", l:"BITCOIN",   grp:"Crypto" },
  { s:"ETH/USD", l:"ETHEREUM",  grp:"Crypto" },
];

const GRP_ORDER = ["Commodities", "Indices", "Forex", "Bonds", "Crypto"];

const GRP_COLOR: Record<string, string> = {
  Commodities: "#f0a020",
  Indices: "#b060f0",
  Forex: "#4a9eff",
  Bonds: "#20c8d8",
  Crypto: "#f04545",
};

function fmtOI(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function fmtNet(n: number): string {
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + "K";
  return (n >= 0 ? "+" : "") + n.toLocaleString();
}

function conviction(d: CotData): { label: string; color: string; bg: string } {
  const net = d.net ?? 0;
  const oi = d.oi ?? 0;
  const oiChg = d.oiChg ?? 0;
  if (net > 0 && oiChg > 0) return { label: "CONVICTION", color: C.up,    bg: "rgba(34,212,110,0.12)" };
  if (net < 0 && oiChg > 0) return { label: "EXP SHORT",  color: C.dn,    bg: "rgba(240,69,69,0.12)" };
  if (oi > 1_000_000)        return { label: "CROWDED",    color: C.amber, bg: "rgba(240,160,32,0.12)" };
  return                              { label: "FADING",     color: C.amber, bg: "rgba(240,160,32,0.08)" };
}

const mono = "'IBM Plex Mono',monospace";
const sans = "'IBM Plex Sans',sans-serif";

export default function COT() {
  const [data, setData] = useState<Record<string, CotData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        SYMS.map(sym =>
          fetch("/api/cot?symbol=" + encodeURIComponent(sym.s))
            .then(r => r.json())
            .then((d: CotData) => ({ s: sym.s, d }))
        )
      );
      if (cancelled) return;
      const map: Record<string, CotData> = {};
      for (const res of results) {
        if (res.status === "fulfilled") map[res.value.s] = res.value.d;
      }
      setData(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const hasAny = Object.keys(data).length > 0;

  if (loading && !hasAny) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"40vh", gap:10, fontFamily:sans }}>
        <div style={{ fontSize:10, color:C.txt3, fontFamily:mono, letterSpacing:".1em" }}>LOADING COT DATA…</div>
        <div style={{ fontSize:9, color:C.txt3, fontFamily:mono }}>Fetching CFTC data · 20 instruments</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:sans, color:C.txt0 }}>
      <Zone1 data={data} />
      <Zone2 data={data} />
      <Zone3 data={data} />
    </div>
  );
}

// ── Zone 1: Stacked bar chart ──────────────────────────────────────────────

function Zone1({ data }: { data: Record<string, CotData> }) {
  return (
    <div style={{ borderBottom:"1px solid "+C.border }}>
      <div style={{ padding:"10px 12px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Dot color={C.blue} /><span style={{ fontSize:8, color:C.txt2, fontFamily:mono }}>LONG</span>
          <Dot color={C.dn} /><span style={{ fontSize:8, color:C.txt2, fontFamily:mono }}>SHORT</span>
        </div>
        <div style={{ fontSize:8, color:C.txt3, fontFamily:mono, letterSpacing:".08em" }}>SPECULATOR NET POSITION</div>
      </div>

      <div style={{ overflowX:"auto", display:"flex", gap:6, padding:"0 12px 12px", WebkitOverflowScrolling:"touch" as never }}>
        {SYMS.map(sym => {
          const d = data[sym.s];
          const ok = d && !d.error;
          const lp = d?.longPct ?? 50;
          const sp = d?.shortPct ?? 50;
          const bias = d?.bias ?? "NEUTRAL";
          const lblColor = ok ? (bias === "BULLISH" ? C.up : bias === "BEARISH" ? C.dn : C.txt2) : C.txt3;
          const shortH = Math.round(68 * sp / 100);
          const longH  = 68 - shortH;

          return (
            <div key={sym.s} style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, gap:3 }}>
              <div style={{ width:26, height:68, borderRadius:4, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                <div style={{ height:shortH, background: ok ? C.dn : C.border, opacity: ok ? 1 : 0.35 }} />
                <div style={{ height:longH,  background: ok ? C.blue : C.border, opacity: ok ? 1 : 0.35 }} />
              </div>
              {ok && (
                <div style={{ fontSize:7, fontFamily:mono, textAlign:"center", lineHeight:1.3 }}>
                  <div style={{ color:C.dn }}>{sp}%</div>
                  <div style={{ color:C.blue }}>{lp}%</div>
                </div>
              )}
              <div style={{ fontSize:7, color:lblColor, fontFamily:mono, textAlign:"center", maxWidth:34 }}>
                {sym.l.split("/")[0].substring(0, 6)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Zone 2: Open Interest strip ────────────────────────────────────────────

function Zone2({ data }: { data: Record<string, CotData> }) {
  return (
    <div style={{ borderBottom:"1px solid "+C.border }}>
      <div style={{ padding:"8px 12px 5px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:9, fontWeight:700, color:C.txt2, fontFamily:mono, letterSpacing:".1em" }}>OPEN INTEREST</div>
        <div style={{ display:"flex", gap:8 }}>
          {([
            { label:"CONVICTION", color:C.up },
            { label:"EXP SHORT",  color:C.dn },
            { label:"CROWDED",    color:C.amber },
            { label:"FADING",     color:C.amber },
          ] as { label: string; color: string }[]).map(s => (
            <span key={s.label} style={{ fontSize:6, color:s.color, fontFamily:mono, opacity:0.65, letterSpacing:".05em" }}>{s.label}</span>
          ))}
        </div>
      </div>

      <div style={{ overflowX:"auto", display:"flex", gap:6, padding:"0 12px 12px", WebkitOverflowScrolling:"touch" as never }}>
        {SYMS.map(sym => {
          const d = data[sym.s];
          const ok = d && !d.error;
          const sig = ok ? conviction(d) : null;
          const oiChg = d?.oiChg ?? 0;
          const oiChgPos = oiChg >= 0;

          return (
            <div key={sym.s} style={{
              flexShrink:0, background:C.bg2, border:"1px solid "+C.border,
              borderRadius:8, padding:"8px 10px", minWidth:84,
              display:"flex", flexDirection:"column", gap:5,
            }}>
              <div style={{ fontSize:9, fontWeight:700, color:GRP_COLOR[sym.grp] ?? C.txt1, fontFamily:mono }}>
                {sym.l.split("/")[0].substring(0, 7)}
              </div>
              {ok ? (
                <>
                  <div style={{ fontSize:13, fontWeight:700, color:C.txt0, fontFamily:mono, fontVariantNumeric:"tabular-nums" }}>
                    {fmtOI(d.oi ?? 0)}
                  </div>
                  <div style={{ fontSize:8, color: oiChgPos ? C.up : C.dn, fontFamily:mono, fontWeight:600, fontVariantNumeric:"tabular-nums" }}>
                    {oiChgPos ? "+" : ""}{fmtOI(Math.abs(oiChg))} WoW
                  </div>
                  {sig && (
                    <div style={{
                      background:sig.bg, border:"1px solid "+sig.color+"55",
                      borderRadius:3, padding:"2px 5px", display:"inline-block",
                    }}>
                      <span style={{ fontSize:7, fontWeight:700, color:sig.color, fontFamily:mono, letterSpacing:".05em" }}>
                        {sig.label}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize:9, color:C.txt3, fontFamily:mono }}>–</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Zone 3: Data table ─────────────────────────────────────────────────────

const COL = "72px 34px 34px 56px 50px 44px 38px";

function Zone3({ data }: { data: Record<string, CotData> }) {
  const groups = GRP_ORDER.map(grp => ({ grp, syms: SYMS.filter(s => s.grp === grp) }));

  return (
    <div style={{ overflowX:"auto", paddingBottom:16 }}>
      <div style={{ minWidth:340 }}>
        {/* Header */}
        <div style={{
          display:"grid", gridTemplateColumns:COL, gap:0,
          padding:"6px 12px", borderBottom:"1px solid "+C.border,
          position:"sticky", top:0, background:C.bg1, zIndex:1,
        }}>
          {(["SYMBOL","LONG%","SHORT%","NET POS","WoW Δ","L/S","BIAS"] as string[]).map(col => (
            <div key={col} style={{ fontSize:7, fontWeight:700, color:C.txt3, fontFamily:mono, letterSpacing:".07em" }}>
              {col}
            </div>
          ))}
        </div>

        {groups.map(({ grp, syms }) => (
          <div key={grp}>
            <div style={{
              padding:"5px 12px 3px", fontSize:8, fontWeight:700,
              color:GRP_COLOR[grp] ?? C.txt2, letterSpacing:".12em",
              fontFamily:mono, background:C.bg0, borderBottom:"1px solid "+C.border,
            }}>
              {grp.toUpperCase()}
            </div>

            {syms.map(sym => {
              const d = data[sym.s];
              const ok = d && !d.error;
              const lp  = d?.longPct  ?? 0;
              const sp  = d?.shortPct ?? 0;
              const net = d?.net      ?? 0;
              const chg = d?.netChg   ?? 0;
              const bias = d?.bias ?? "NEUTRAL";
              const biasColor = bias === "BULLISH" ? C.up : bias === "BEARISH" ? C.dn : C.amber;
              const dotColor  = ok ? biasColor : C.txt3;

              return (
                <div key={sym.s} style={{
                  display:"grid", gridTemplateColumns:COL, gap:0,
                  padding:"7px 12px", borderBottom:"1px solid "+C.border,
                  alignItems:"center",
                }}>
                  {/* SYMBOL + dot */}
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <Dot color={dotColor} />
                    <span style={{ fontSize:9, fontWeight:600, color:C.txt1, fontFamily:mono }}>{sym.l}</span>
                  </div>
                  {/* LONG% */}
                  <div style={{ fontSize:9, color: ok ? C.blue : C.txt3, fontFamily:mono, fontVariantNumeric:"tabular-nums" }}>
                    {ok ? lp + "%" : "–"}
                  </div>
                  {/* SHORT% */}
                  <div style={{ fontSize:9, color: ok ? C.dn : C.txt3, fontFamily:mono, fontVariantNumeric:"tabular-nums" }}>
                    {ok ? sp + "%" : "–"}
                  </div>
                  {/* NET POS */}
                  <div style={{ fontSize:9, color: ok ? (net >= 0 ? C.up : C.dn) : C.txt3, fontFamily:mono, fontVariantNumeric:"tabular-nums" }}>
                    {ok ? fmtNet(net) : "–"}
                  </div>
                  {/* WoW Δ */}
                  <div style={{ fontSize:9, color: ok ? (chg >= 0 ? C.up : C.dn) : C.txt3, fontFamily:mono, fontVariantNumeric:"tabular-nums" }}>
                    {ok ? fmtNet(chg) : "–"}
                  </div>
                  {/* L/S bar */}
                  <div style={{ width:44, height:8, borderRadius:2, overflow:"hidden", display:"flex" }}>
                    {ok ? (
                      <>
                        <div style={{ width: (lp / 100 * 44) + "px", background:C.blue }} />
                        <div style={{ flex:1, background:C.dn }} />
                      </>
                    ) : (
                      <div style={{ width:"100%", background:C.border }} />
                    )}
                  </div>
                  {/* BIAS pill */}
                  {ok ? (
                    <div style={{
                      background: bias === "BULLISH" ? "rgba(34,212,110,0.1)" : bias === "BEARISH" ? "rgba(240,69,69,0.1)" : "rgba(240,160,32,0.1)",
                      border:"1px solid "+biasColor+"44",
                      borderRadius:3, padding:"2px 5px",
                      display:"inline-flex", alignItems:"center",
                    }}>
                      <span style={{ fontSize:7, fontWeight:700, color:biasColor, fontFamily:mono, letterSpacing:".05em" }}>
                        {bias === "BULLISH" ? "BULL" : bias === "BEARISH" ? "BEAR" : "NEUT"}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize:9, color:C.txt3 }}>–</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <div style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }} />;
}
