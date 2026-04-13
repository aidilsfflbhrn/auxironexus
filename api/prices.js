// Auxiron Multi-Source Market Data Proxy
// Sources: TwelveData (Forex) + Finnhub (Indices/Crypto) + FMP (Commodities/Bonds)
// Automatically falls back if one source fails or runs out of credits

const TD_KEY  = process.env.TWELVE_KEY;   // TwelveData - Forex pairs
const FH_KEY  = process.env.FINNHUB_KEY;  // Finnhub - Indices, Crypto
const FMP_KEY = process.env.FMP_KEY;      // FMP - Commodities, Bonds, VIX

// Symbol routing - which API handles which instrument
const FINNHUB_SYMBOLS = {
  // Indices - Finnhub uses different symbol format
  "SPX":     { fh: "^GSPC",  type: "index"  },
  "NDX":     { fh: "^NDX",   type: "index"  },
  "DJI":     { fh: "^DJI",   type: "index"  },
  "DAX":     { fh: "^GDAXI", type: "index"  },
  "FTSE":    { fh: "^FTSE",  type: "index"  },
  "NI225":   { fh: "^N225",  type: "index"  },
  "DX":      { fh: "DX:CUR", type: "index"  },
  // Crypto
  "BTC/USD": { fh: "BINANCE:BTCUSDT", type: "crypto" },
  "ETH/USD": { fh: "BINANCE:ETHUSDT", type: "crypto" },
};

const FMP_SYMBOLS = {
  // Commodities
  "XAU/USD": { fmp: "GCUSD",  type: "commodity" },
  "XAG/USD": { fmp: "SIUSD",  type: "commodity" },
  "XPT/USD": { fmp: "PLUSD",  type: "commodity" },
  "WTI/USD": { fmp: "CLUSD",  type: "commodity" },
  "BRENT":   { fmp: "BZUSD",  type: "commodity" },
  // Bonds / Yields
  "US02Y":   { fmp: "^TNX",   type: "bond"      },
  "US10Y":   { fmp: "^TNX",   type: "bond"      },
  "US30Y":   { fmp: "^TYX",   type: "bond"      },
  // VIX
  "VIX":     { fmp: "^VIX",   type: "vix"       },
};

// Everything else goes to TwelveData (mainly Forex)

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, interval, outputsize, endpoint } = req.query;

  // Handle timeseries - always use TwelveData
  if (endpoint === "timeseries") {
    try {
      const url = "https://api.twelvedata.com/time_series?symbol=" +
        encodeURIComponent(symbol) + "&interval=" + (interval || "30min") +
        "&outputsize=" + (outputsize || "48") + "&apikey=" + TD_KEY;
      const r = await fetch(url);
      const data = await r.json();
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Handle batch price fetch
  if (!symbol) return res.status(400).json({ error: "No symbol provided" });

  const symbols = symbol.split(",").map(s => s.trim()).filter(Boolean);
  const result = {};

  // Sort symbols by source
  const tdSymbols   = [];
  const fhSymbols   = [];
  const fmpSymbols  = [];

  symbols.forEach(s => {
    if (FINNHUB_SYMBOLS[s]) fhSymbols.push(s);
    else if (FMP_SYMBOLS[s]) fmpSymbols.push(s);
    else tdSymbols.push(s); // Default to TwelveData (mainly Forex)
  });

  const promises = [];

  // ── TwelveData batch (Forex) ──────────────────────────────────────────────
  if (tdSymbols.length > 0 && TD_KEY) {
    // TwelveData allows max 8 per request on free plan
    const batches = [];
    for (let i = 0; i < tdSymbols.length; i += 8) batches.push(tdSymbols.slice(i, i + 8));
    batches.forEach(batch => {
      promises.push(
        fetch("https://api.twelvedata.com/price?symbol=" + encodeURIComponent(batch.join(",")) + "&apikey=" + TD_KEY)
          .then(r => r.json())
          .then(data => {
            // TwelveData returns { SYMBOL: { price: "1.1042" } } for batch
            // or { price: "1.1042" } for single
            if (batch.length === 1) {
              if (data.price) result[batch[0]] = { price: data.price, source: "TD" };
            } else {
              Object.keys(data).forEach(sym => {
                if (data[sym] && data[sym].price) result[sym] = { price: data[sym].price, source: "TD" };
              });
            }
          })
          .catch(() => {})
      );
    });
  }

  // ── Finnhub (Indices + Crypto) ────────────────────────────────────────────
  if (fhSymbols.length > 0 && FH_KEY) {
    fhSymbols.forEach(sym => {
      const cfg = FINNHUB_SYMBOLS[sym];
      if (!cfg) return;
      let url = "";
      if (cfg.type === "crypto") {
        // Finnhub crypto quote
        url = "https://finnhub.io/api/v1/crypto/candle?symbol=" + cfg.fh +
          "&resolution=1&from=" + Math.floor(Date.now()/1000 - 120) +
          "&to=" + Math.floor(Date.now()/1000) + "&token=" + FH_KEY;
      } else {
        // Finnhub stock/index quote
        url = "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(cfg.fh) + "&token=" + FH_KEY;
      }
      promises.push(
        fetch(url)
          .then(r => r.json())
          .then(data => {
            let price = null;
            if (cfg.type === "crypto" && data.c && data.c.length > 0) {
              price = data.c[data.c.length - 1]; // last close
            } else if (data.c && data.c > 0) {
              price = data.c; // current price from quote
            }
            if (price) result[sym] = { price: String(price), source: "FH" };
          })
          .catch(() => {})
      );
    });
  }

  // ── FMP (Commodities + Bonds + VIX) ──────────────────────────────────────
  if (fmpSymbols.length > 0 && FMP_KEY) {
    // FMP batch quote endpoint
    const fmpTickers = fmpSymbols.map(s => FMP_SYMBOLS[s].fmp).filter((v,i,a) => a.indexOf(v) === i);
    promises.push(
      fetch("https://financialmodelingprep.com/api/v3/quote-short/" +
        fmpTickers.join(",") + "?apikey=" + FMP_KEY)
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          // Map FMP tickers back to our symbols
          fmpSymbols.forEach(sym => {
            const cfg = FMP_SYMBOLS[sym];
            const match = data.find(d => d.symbol === cfg.fmp);
            if (match && match.price) result[sym] = { price: String(match.price), source: "FMP" };
          });
        })
        .catch(() => {})
    );
  }

  // Wait for all sources
  await Promise.allSettled(promises);

  return res.status(200).json(result);
};
