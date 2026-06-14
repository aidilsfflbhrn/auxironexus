import React, { useState, useEffect } from "react";
import { getBudgetStatus } from "./lib/budgetGate";

const C2 = {
  bg: "#0a0e1a",
  header: "#0d1320",
  card: "#111827",
  gold: "#e8d5a3",
  blue: "#4a9eff",
  green: "#1d9e75",
  purple: "#9b77e8",
  greyBlue: "#7a9ab8",
  white: "#ffffff",
  up: "#22d46e",
  dn: "#f04545",
};

const DEFAULT_WL = ["XAUUSD", "DXY", "US10Y", "USOIL"];
const WL_OPTIONS = ["XAUUSD", "DXY", "US10Y", "USOIL", "USDJPY", "EURUSD", "GBPUSD", "SPX500", "BTCUSD"];
const SYM_MAP: Record<string, string> = {
  XAUUSD: "XAU/USD", DXY: "DX", US10Y: "US10Y", USOIL: "WTI/USD",
  USDJPY: "USD/JPY", EURUSD: "EUR/USD", GBPUSD: "GBP/USD", SPX500: "SPX", BTCUSD: "XAU/USD",
};
const DISP: Record<string, string> = {
  XAUUSD: "XAU/USD", DXY: "DXY", US10Y: "US 10Y", USOIL: "WTI/USD",
  USDJPY: "USD/JPY", EURUSD: "EUR/USD", GBPUSD: "GBP/USD", SPX500: "SPX 500", BTCUSD: "BTC/USD",
};

const MOCK_NEWS = [
  { headline: "Fed signals pause as core PCE cools to 2.6%, market reprices rate cuts", tag: "BULL", theme: "FED", time: "09:45" },
  { headline: "DXY extends decline as US jobs data misses — gold lifts toward $3,280", tag: "BULL", theme: "GEO", time: "08:22" },
  { headline: "Treasury 10Y yield spikes to 4.45% on supply concerns ahead of auction", tag: "BEAR", theme: "RATES", time: "07:10" },
];

const MOCK_CAL = [
  { time: "21:30", impact: "high", event: "US Non-Farm Payrolls", currency: "USD" },
  { time: "21:30", impact: "high", event: "US Unemployment Rate", currency: "USD" },
  { time: "23:00", impact: "medium", event: "ISM Manufacturing PMI", currency: "USD" },
  { time: "03:00", impact: "low", event: "China Caixin PMI", currency: "CNY" },
  { time: "16:00", impact: "medium", event: "ECB Speakers", currency: "EUR" },
];

function dpf(b: number) { return b >= 1000 ? 2 : b >= 10 ? 3 : 4; }
function fmtP(v: any, b: number) {
  if (v == null) return "—";
  return v.toLocaleString(undefined, { minimumFractionDigits: dpf(b), maximumFractionDigits: dpf(b) });
}

function vixMeta(v: number) {
  if (v < 15) return { label: "CALM", desc: "Markets complacent. Low fear, favours risk-on.", color: "#1d9e75" };
  if (v < 20) return { label: "NORMAL", desc: "Normal volatility. No unusual fear.", color: "#e8d5a3" };
  if (v < 30) return { label: "ELEVATED", desc: "Fear rising. Watch for risk-off flows.", color: "#f0a020" };
  return { label: "HIGH FEAR", desc: "Extreme volatility. Safe-haven demand elevated.", color: "#f04545" };
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return <div style={{ height: 30 }} />;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const W = 60, H = 30;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - mn) / rng) * (H - 6) - 3}`).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface DashboardProps {
  mkt: any[];
  sessionLbl: { label: string; color: string };
  roro: { label: string; color: string; desc: string };
  roro_score: number;
  stClr: string;
  tab: string;
  setTab: (t: string) => void;
  onOpenNav: () => void;
}

export default function Dashboard({ mkt, sessionLbl, roro, roro_score, stClr, tab, setTab, onOpenNav }: DashboardProps) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ax_watchlist") || "null") || DEFAULT_WL; } catch { return DEFAULT_WL; }
  });
  const [showSheet, setShowSheet] = useState(false);
  const [tempWL, setTempWL] = useState<string[]>([]);

  const [acctTab, setAcctTab] = useState<"exness" | "fundednext">("exness");
  const [acctData, setAcctData] = useState<any>(null);
  const [acctLoading, setAcctLoading] = useState(false);
  const [acctError, setAcctError] = useState<string | null>(null);

  useEffect(() => {
    setAcctLoading(true);
    setAcctData(null);
    setAcctError(null);
    fetch(`/api/accounts?account=${acctTab}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setAcctError(d.message || "Connection failed"); setAcctLoading(false); return; }
        setAcctData(d);
        setAcctLoading(false);
      })
      .catch(() => { setAcctError("Network error"); setAcctLoading(false); });
  }, [acctTab]);

  const budget = getBudgetStatus();
  const aiPct = Math.max(0, Math.round(100 - budget.percentage));

  const vixI = mkt.find((m: any) => m.s === "VIX");
  const y10 = mkt.find((m: any) => m.s === "US10Y");
  const y2 = mkt.find((m: any) => m.s === "US02Y");
  const spread = y2 && y10 ? parseFloat((y10.cur - y2.cur).toFixed(3)) : null;
  const inverted = spread !== null && spread < 0;

  const tickerSyms = ["XAU/USD", "DX", "SPX", "VIX", "US10Y", "USD/JPY"];
  const macroText = "Fed hawkish · DXY bid · Gold supported   ·   Yields elevated · Risk-off flows · JPY bid   ·   China slowdown · Oil pressure · AUD weak";

  const sessionShort = sessionLbl.label
    .replace(/[🌏🌍🗽🤝💤] ?/g, "")
    .replace("ASIA/TOKYO", "ASIA")
    .replace("LDN/NY OVERLAP", "LDN/NY");

  function saveWL(list: string[]) {
    setWatchlist(list);
    try { localStorage.setItem("ax_watchlist", JSON.stringify(list)); } catch {}
  }

  function getMkt(key: string) {
    return mkt.find((m: any) => m.s === SYM_MAP[key]);
  }

  function timeAgo(iso: string): string {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return secs + "s ago";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return mins + "m ago";
    return Math.floor(mins / 60) + "h ago";
  }

  const TABS = [
    {
      key: "dashboard", label: "Home", accent: C2.gold, disabled: false,
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="6" height="6" rx="1.5" fill={active ? C2.gold : "rgba(255,255,255,0.25)"} />
          <rect x="11" y="3" width="6" height="6" rx="1.5" fill={active ? C2.gold : "rgba(255,255,255,0.25)"} />
          <rect x="3" y="11" width="6" height="6" rx="1.5" fill={active ? C2.gold : "rgba(255,255,255,0.25)"} />
          <rect x="11" y="11" width="6" height="6" rx="1.5" fill={active ? C2.gold : "rgba(255,255,255,0.25)"} />
        </svg>
      ),
    },
    {
      key: "charts", label: "Charts", accent: C2.blue, disabled: false,
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <polyline points="3,14 7,8 11,11 17,4" stroke={active ? C2.blue : "rgba(255,255,255,0.25)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="3" y1="16" x2="17" y2="16" stroke={active ? C2.blue : "rgba(255,255,255,0.15)"} strokeWidth="1" />
        </svg>
      ),
    },
    {
      key: "axrisk", label: "AX Risk", accent: "#f0a020", disabled: true,
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3L17 16H3L10 3Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="10" y1="8" x2="10" y2="12" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.8" fill="rgba(255,255,255,0.2)" />
        </svg>
      ),
    },
    {
      key: "journal", label: "Journal", accent: C2.purple, disabled: true,
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" />
          <line x1="7" y1="7" x2="13" y2="7" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="7" y1="10" x2="13" y2="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="7" y1="13" x2="11" y2="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "more", label: "More", accent: C2.white, disabled: false,
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="6" cy="10" r="1.5" fill={active ? C2.white : "rgba(255,255,255,0.25)"} />
          <circle cx="10" cy="10" r="1.5" fill={active ? C2.white : "rgba(255,255,255,0.25)"} />
          <circle cx="14" cy="10" r="1.5" fill={active ? C2.white : "rgba(255,255,255,0.25)"} />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ background: C2.bg, minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>

        {/* ── SECTION 1: TRADING PERFORMANCE ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: C2.green, letterSpacing: ".14em", fontWeight: 700, marginBottom: 10 }}>TRADING PERFORMANCE</div>

          {/* Account switcher */}
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {(["exness", "fundednext"] as const).map(key => {
              const active = acctTab === key;
              const label = key === "exness" ? "Exness Live" : "FundedNext";
              let dotColor = "#3a5570";
              let statusText = "";
              if (active && !acctLoading) {
                if (acctError) { dotColor = "#3a5570"; statusText = "Waiting for MT5"; }
                else if (acctData && acctData.isLive) { dotColor = C2.up; statusText = "Live"; }
                else if (acctData && !acctData.isLive && acctData.updatedAt) { dotColor = "#f0a020"; statusText = "Cached · " + timeAgo(acctData.updatedAt); }
              }
              return (
                <button key={key} onClick={() => setAcctTab(key)}
                  style={{ flex: 1, background: active ? "rgba(29,158,117,0.15)" : "rgba(255,255,255,0.04)", border: active ? "1px solid rgba(29,158,117,0.4)" : "1px solid rgba(255,255,255,0.08)", color: active ? C2.green : "rgba(255,255,255,0.4)", borderRadius: 8, padding: "7px 10px", fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", fontWeight: active ? 700 : 400, cursor: "pointer", letterSpacing: ".04em", WebkitTapHighlightColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span>{label}</span>
                  {active && !acctLoading && statusText && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: 8, color: dotColor, fontWeight: 400 }}>{statusText}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {acctLoading && (
            <div style={{ background: C2.card, borderRadius: 12, padding: "20px 14px", marginBottom: 8, border: "1px solid rgba(29,158,117,0.12)", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: ".06em" }}>Loading...</div>
            </div>
          )}

          {/* Error */}
          {acctError && !acctLoading && (
            <div style={{ background: "rgba(240,69,69,0.07)", borderRadius: 12, padding: "14px", marginBottom: 8, border: "1px solid rgba(240,69,69,0.2)" }}>
              <div style={{ fontSize: 11, color: C2.dn, lineHeight: 1.5 }}>⚠ {acctError}</div>
            </div>
          )}

          {/* Live data */}
          {acctData && !acctLoading && !acctError && (
            <>
              {/* Balance card */}
              <div style={{ background: C2.card, borderRadius: 12, padding: "14px", marginBottom: 8, border: "1px solid rgba(29,158,117,0.12)", borderLeft: "3px solid " + C2.green }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: ".08em", marginBottom: 4 }}>ACCOUNT BALANCE</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 30, fontWeight: 700, color: C2.white, lineHeight: 1, marginBottom: 12 }}>
                  ${(acctData.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "TODAY P&L", value: ((acctData.todayPnl ?? 0) >= 0 ? "+$" : "-$") + Math.abs(acctData.todayPnl ?? 0).toFixed(2), color: (acctData.todayPnl ?? 0) >= 0 ? C2.up : C2.dn },
                    { label: "P&L %", value: ((acctData.todayPnlPercent ?? 0) >= 0 ? "+" : "") + (acctData.todayPnlPercent ?? 0).toFixed(2) + "%", color: (acctData.todayPnlPercent ?? 0) >= 0 ? C2.up : C2.dn },
                    { label: "OPEN TRADES", value: String(acctData.openTrades?.length ?? 0), color: C2.white },
                  ].map(item => (
                    <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: ".06em", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open trades */}
              {(acctData.openTrades?.length ?? 0) === 0 && (
                <div style={{ background: C2.card, borderRadius: 8, padding: "10px 12px", marginBottom: 6, border: "1px solid rgba(29,158,117,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>No open trades</div>
                </div>
              )}
              {(acctData.openTrades ?? []).map((trade: any, i: number) => (
                <div key={i} style={{ background: C2.card, borderRadius: 8, padding: "10px 12px", marginBottom: 6, border: "1px solid rgba(29,158,117,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 2, height: 34, borderRadius: 1, background: C2.green, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C2.white }}>{trade.symbol}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, fontWeight: 700, color: trade.type === "BUY" ? C2.up : C2.dn, background: (trade.type === "BUY" ? C2.up : C2.dn) + "18", padding: "1px 5px", borderRadius: 3 }}>{trade.type}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{trade.lots} lots</span>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.2)" }}>{trade.openPrice}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 700, color: trade.profit >= 0 ? C2.up : C2.dn }}>
                      {(trade.profit ?? 0) >= 0 ? "+$" : "-$"}{Math.abs(trade.profit ?? 0).toFixed(2)}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{trade.currentPrice}</div>
                  </div>
                </div>
              ))}

              {/* FundedNext prop metrics panel */}
              {acctTab === "fundednext" && acctData.propMetrics && (
                <div style={{ background: C2.card, borderRadius: 12, padding: "14px", marginTop: 8, border: "1px solid rgba(155,119,232,0.15)" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: C2.purple, letterSpacing: ".12em", fontWeight: 700, marginBottom: 14 }}>PROP FIRM RISK PANEL</div>
                  {[
                    { label: "DAILY DRAWDOWN", used: acctData.propMetrics.dailyDrawdownUsed, limit: acctData.propMetrics.dailyDrawdownLimit, remaining: acctData.propMetrics.dailyDrawdownRemaining },
                    { label: "TOTAL DRAWDOWN", used: acctData.propMetrics.totalDrawdownUsed, limit: acctData.propMetrics.totalDrawdownLimit, remaining: acctData.propMetrics.totalDrawdownRemaining },
                  ].map(m => {
                    const pct = (m.limit ?? 0) > 0 ? Math.min(100, ((m.used ?? 0) / (m.limit ?? 1)) * 100) : 0;
                    const color = pct >= 90 ? C2.dn : pct >= 80 ? "#f0a020" : C2.up;
                    return (
                      <div key={m.label} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: ".06em" }}>{m.label}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color }}>${(m.used ?? 0).toFixed(2)} / ${(m.limit ?? 0).toFixed(2)}</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                          <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 3, transition: "width .5s ease" }} />
                        </div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)" }}>${(m.remaining ?? 0).toFixed(2)} remaining</div>
                      </div>
                    );
                  })}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: ".06em" }}>PROFIT TARGET</span>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: (acctData.propMetrics.profitProgress ?? 0) >= 100 ? C2.up : "rgba(255,255,255,0.4)" }}>
                        ${(acctData.propMetrics.profitCurrent ?? 0).toFixed(2)} / ${(acctData.propMetrics.profitTarget ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: Math.min(100, acctData.propMetrics.profitProgress ?? 0) + "%", background: (acctData.propMetrics.profitProgress ?? 0) >= 100 ? C2.up : C2.green, borderRadius: 3, transition: "width .5s ease" }} />
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{(acctData.propMetrics.profitProgress ?? 0).toFixed(1)}% toward target</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── SECTION 2: WATCHLIST ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: C2.gold, letterSpacing: ".14em", fontWeight: 700 }}>WATCHLIST</div>
            <button onClick={() => { setTempWL([...watchlist]); setShowSheet(true); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L9.5 5H14L10.5 7.5L11.8 12L8 9.5L4.2 12L5.5 7.5L2 5H6.5L8 1Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {watchlist.slice(0, 4).map((key) => {
              const m = getMkt(key);
              const up = m ? m.pct >= 0 : true;
              const price = m ? fmtP(m.cur, m.b) : "—";
              const pct = m ? ((m.pct >= 0 ? "+" : "") + m.pct.toFixed(2) + "%") : "—";
              const sparkData = m && m.ch ? m.ch.slice(-6).map((x: any) => x.p) : [];
              return (
                <div key={key} style={{ background: C2.card, borderRadius: 10, padding: "10px 12px", borderTop: "2px solid rgba(232,213,163,0.18)", border: "1px solid rgba(232,213,163,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 700, color: C2.white }}>{DISP[key] || key}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: up ? C2.up : C2.dn, fontWeight: 700 }}>{pct}</span>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 700, color: C2.white, marginBottom: 8 }}>{price}</div>
                  <Sparkline data={sparkData} color={up ? C2.up : C2.dn} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 3: MACRO INDICATORS ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: C2.purple, letterSpacing: ".14em", fontWeight: 700, marginBottom: 10 }}>MACRO INDICATORS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {/* VIX */}
            <div style={{ background: C2.card, borderRadius: 10, padding: "10px 12px", borderTop: "2px solid rgba(155,119,232,0.18)", border: "1px solid rgba(155,119,232,0.08)" }}>
              <div style={{ fontSize: 7, color: "rgba(155,119,232,0.65)", letterSpacing: ".1em", marginBottom: 5, fontFamily: "'IBM Plex Mono',monospace" }}>VIX</div>
              {vixI ? (() => {
                const meta = vixMeta(vixI.cur);
                const pct = Math.min(100, (vixI.cur / 80) * 100);
                return <>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, color: "#b060f0", lineHeight: 1 }}>{vixI.cur.toFixed(2)}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: meta.color, marginTop: 3, marginBottom: 7, letterSpacing: ".06em" }}>{meta.label}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", marginBottom: 7 }}>
                    <div style={{ height: "100%", width: pct + "%", background: `linear-gradient(90deg,#1d9e75,${meta.color})`, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{meta.desc}</div>
                </>;
              })() : <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", paddingTop: 8 }}>Loading…</div>}
            </div>
            {/* Yield Curve */}
            <div style={{ background: C2.card, borderRadius: 10, padding: "10px 12px", borderTop: "2px solid rgba(155,119,232,0.18)", border: "1px solid rgba(155,119,232,0.08)" }}>
              <div style={{ fontSize: 7, color: "rgba(155,119,232,0.65)", letterSpacing: ".1em", marginBottom: 5, fontFamily: "'IBM Plex Mono',monospace" }}>10Y–2Y SPREAD</div>
              {spread !== null ? <>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, color: C2.blue, lineHeight: 1 }}>{spread > 0 ? "+" : ""}{spread}%</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: inverted ? C2.dn : C2.up, marginTop: 3, marginBottom: 7, letterSpacing: ".06em" }}>{inverted ? "INVERTED" : "NORMAL"}</div>
                <svg width="100%" height="28" viewBox="0 0 80 28" preserveAspectRatio="none" style={{ marginBottom: 7, display: "block" }}>
                  <path d="M0,18 C20,8 50,22 80,10" fill="none" stroke={C2.blue} strokeWidth="2" />
                  <path d="M0,20 C20,17 50,22 80,19" fill="none" stroke="#f04545" strokeWidth="1.5" strokeDasharray="3,2" />
                </svg>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{inverted ? "Inverted signals recession risk." : "Normal curve, economy expanding."}</div>
              </> : <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", paddingTop: 8 }}>Loading…</div>}
            </div>
          </div>
        </div>

        {/* ── SECTION 4: AI NEWS HEADLINES ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: C2.blue, letterSpacing: ".14em", fontWeight: 700, marginBottom: 10 }}>AI NEWS HEADLINES</div>
          {MOCK_NEWS.map((item, i) => (
            <div key={i} style={{ background: C2.card, borderRadius: 9, padding: "10px 12px", marginBottom: 7, border: "1px solid rgba(74,158,255,0.08)", borderLeft: "3px solid " + (item.tag === "BULL" ? C2.up : C2.dn) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, fontWeight: 700, color: item.tag === "BULL" ? C2.up : C2.dn, background: (item.tag === "BULL" ? C2.up : C2.dn) + "18", padding: "1px 5px", borderRadius: 3 }}>{item.tag}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, color: C2.blue, background: "rgba(74,158,255,0.1)", padding: "1px 5px", borderRadius: 3 }}>{item.theme}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{item.time} SGT</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C2.white, lineHeight: 1.5 }}>{item.headline}</div>
            </div>
          ))}
        </div>

        {/* ── SECTION 5: ECONOMIC CALENDAR ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: C2.blue, letterSpacing: ".14em", fontWeight: 700, marginBottom: 10 }}>ECONOMIC CALENDAR · TODAY</div>
          {MOCK_CAL.map((ev, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: C2.card, borderRadius: 8, padding: "9px 12px", marginBottom: 5 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.55)", flexShrink: 0, width: 38 }}>{ev.time}</span>
              <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: ev.impact === "high" ? C2.dn : ev.impact === "medium" ? "#f0a020" : "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 11, color: C2.white, flex: 1 }}>{ev.event}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{ev.currency}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── WATCHLIST SHEET ── */}
      {showSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.65)" }} onClick={() => setShowSheet(false)}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#111827", borderRadius: "14px 14px 0 0", padding: "16px 14px 28px" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: C2.gold, letterSpacing: ".12em", marginBottom: 12 }}>CONFIGURE WATCHLIST · MAX 4</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {WL_OPTIONS.map(key => {
                const sel = tempWL.includes(key);
                return (
                  <button key={key} className="tap"
                    onClick={() => setTempWL(prev => sel ? prev.filter(k => k !== key) : prev.length < 4 ? [...prev, key] : prev)}
                    style={{ background: sel ? "rgba(232,213,163,0.14)" : "rgba(255,255,255,0.04)", border: sel ? "1px solid rgba(232,213,163,0.38)" : "1px solid rgba(255,255,255,0.08)", color: sel ? C2.gold : "rgba(255,255,255,0.45)", borderRadius: 6, padding: "5px 10px", fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>
                    {DISP[key] || key}
                  </button>
                );
              })}
            </div>
            <button className="tap" onClick={() => { saveWL(tempWL); setShowSheet(false); }}
              style={{ width: "100%", background: "rgba(232,213,163,0.1)", border: "1px solid rgba(232,213,163,0.28)", color: C2.gold, borderRadius: 9, padding: "11px", fontSize: 11, fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, letterSpacing: ".04em", cursor: "pointer" }}>
              SAVE WATCHLIST
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
