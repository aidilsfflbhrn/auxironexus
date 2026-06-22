import React, { useState, useEffect, useRef } from "react";

const C = {
  bg0: "#0a0e1a",
  bg1: "#0d1320",
  border: "#1a2535",
  txt0: "#e8edf5",
  txt2: "#7a9ab8",
  txt3: "#3a5570",
  gold: "#e8d5a3",
  up: "#22d46e",
  dn: "#f04545",
  amber: "#f0a020",
};

const FILTERS = [
  { label: "ALL",     q: "financial markets forex gold oil" },
  { label: "GOLD",    q: "gold price" },
  { label: "OIL",     q: "crude oil price" },
  { label: "EUR/USD", q: "eurusd forex" },
  { label: "GBP/USD", q: "gbpusd forex" },
  { label: "S&P 500", q: "S&P 500 stock market" },
  { label: "BTC",     q: "bitcoin crypto" },
];

const BULL_WORDS = ["rally","surge","rise","gain","high","strong","beat","above","optimism","boost","jump","soar"];
const BEAR_WORDS = ["fall","drop","crash","weak","miss","below","concern","risk","decline","plunge","tumble","sink"];

function getSentiment(title: string, desc: string): "BULL" | "BEAR" | "NEUTRAL" {
  const text = ((title ?? "") + " " + (desc ?? "")).toLowerCase();
  const bull = BULL_WORDS.some(w => text.includes(w));
  const bear = BEAR_WORDS.some(w => text.includes(w));
  if (bull && !bear) return "BULL";
  if (bear && !bull) return "BEAR";
  return "NEUTRAL";
}

function timeAgo(publishedAt: string): string {
  const then = new Date(publishedAt ?? "").getTime();
  if (!then) return "–";
  const diffMin = Math.floor((Date.now() - then) / 60_000);
  if (diffMin < 60) return diffMin + "m ago";
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return diffH + "h ago";
  return Math.floor(diffH / 24) + "d ago";
}

interface Article {
  title?: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: { name?: string };
}

const mono = "'IBM Plex Mono',monospace";
const sans = "'IBM Plex Sans',sans-serif";

export default function News() {
  const [filter, setFilter] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [updatedLbl, setUpdatedLbl] = useState("–");
  const filterRef = useRef(0);
  filterRef.current = filter;

  async function fetchNews(filterIdx: number) {
    setLoading(true);
    setErr(false);
    try {
      const r = await fetch("/api/news?q=" + encodeURIComponent(FILTERS[filterIdx]?.q ?? ""));
      const data = await r.json();
      const arts: Article[] = data?.articles ?? [];
      setArticles(arts);
      setErr(arts.length === 0);
      setLastFetch(new Date());
    } catch {
      setArticles([]);
      setErr(true);
    } finally {
      setLoading(false);
    }
  }

  // Fetch on filter change + auto-refresh every 5 min
  useEffect(() => {
    fetchNews(filter);
    const id = setInterval(() => fetchNews(filterRef.current), 5 * 60_000);
    return () => clearInterval(id);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update "X ago" label every minute
  useEffect(() => {
    function tick() {
      if (!lastFetch) { setUpdatedLbl("–"); return; }
      const m = Math.floor((Date.now() - lastFetch.getTime()) / 60_000);
      setUpdatedLbl(m < 1 ? "just now" : m + "m ago");
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [lastFetch]);

  const sentColor = (s: string) => s === "BULL" ? C.up : s === "BEAR" ? C.dn : C.amber;

  return (
    <div style={{ fontFamily: sans, color: C.txt0, background: C.bg0, minHeight: "100%" }}>

      {/* Header */}
      <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: mono, letterSpacing: ".1em" }}>NEWS HEADLINES</div>
          <div style={{ fontSize: 8, color: C.txt3, fontFamily: mono, letterSpacing: ".08em", marginTop: 2 }}>LIVE · GNEWS</div>
        </div>
        <div style={{ fontSize: 9, color: C.txt3, fontFamily: mono }}>Updated {updatedLbl}</div>
      </div>

      {/* Filter pills */}
      <div style={{ overflowX: "auto", display: "flex", gap: 5, padding: "8px 12px", borderBottom: "1px solid " + C.border, flexWrap: "nowrap" as const }}>
        {FILTERS.map((f, i) => {
          const active = filter === i;
          return (
            <button key={f.label} className="tap" onClick={() => setFilter(i)} style={{
              background: active ? "rgba(200,168,64,0.12)" : "#121d2c",
              border: active ? "1px solid rgba(200,168,64,0.38)" : "1px solid " + C.border,
              color: active ? "#f0cc5a" : C.txt2,
              borderRadius: 20, padding: "4px 11px", fontSize: 9, fontWeight: 500,
              whiteSpace: "nowrap" as const, cursor: "pointer", fontFamily: mono,
            }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div style={{ padding: "10px 12px" }}>
        {loading ? (
          <div>
            {[72, 90, 80].map((h, i) => (
              <div key={i} style={{
                height: h,
                background: "linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",
                backgroundSize: "200% 100%",
                borderRadius: 9,
                marginBottom: 8,
                animation: "shimmer 1.4s infinite",
              }} />
            ))}
          </div>
        ) : err ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 12 }}>
            <div style={{ fontSize: 12, color: C.txt3, fontFamily: mono, textAlign: "center", lineHeight: 1.6 }}>
              News unavailable — check GNEWS_KEY
            </div>
            <button className="tap" onClick={() => fetchNews(filter)} style={{
              background: "#121d2c", border: "1px solid #1a2535",
              color: "#c2d4e8", borderRadius: 6, padding: "7px 16px",
              fontSize: 10, fontFamily: mono, cursor: "pointer",
            }}>
              Retry
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {articles.map((art, i) => {
              const sent = getSentiment(art.title ?? "", art.description ?? "");
              const sc = sentColor(sent);
              return (
                <div key={i} className="tap" onClick={() => { if (art.url) window.open(art.url, "_blank"); }} style={{
                  background: C.bg1,
                  border: "1px solid " + C.border,
                  borderLeft: "3px solid " + sc,
                  borderRadius: 9,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}>
                  {/* Source · time · pill */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "nowrap" as const }}>
                    <span style={{ fontSize: 9, color: C.txt3, fontFamily: mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 120 }}>
                      {art.source?.name ?? "–"}
                    </span>
                    <span style={{ fontSize: 8, color: C.txt3, fontFamily: mono, flexShrink: 0 }}>·</span>
                    <span style={{ fontSize: 9, color: C.txt3, fontFamily: mono, flexShrink: 0 }}>
                      {timeAgo(art.publishedAt ?? "")}
                    </span>
                    <div style={{ marginLeft: "auto", background: sc + "22", border: "1px solid " + sc + "55", borderRadius: 3, padding: "2px 6px", flexShrink: 0 }}>
                      <span style={{ fontSize: 7, fontWeight: 700, color: sc, fontFamily: mono, letterSpacing: ".06em" }}>{sent}</span>
                    </div>
                  </div>
                  {/* Headline */}
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e8edf5", lineHeight: 1.45, marginBottom: 5 }}>
                    {art.title ?? "–"}
                  </div>
                  {/* Description */}
                  {art.description && (
                    <div style={{
                      fontSize: 11, color: C.txt2, lineHeight: 1.5,
                      display: "-webkit-box" as never,
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as never,
                      overflow: "hidden",
                    }}>
                      {art.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
