// Auxiron Prices Proxy — TwelveData upgraded plan
// Upgraded plan: native indices (SPX, NDX, DJI, VIX) + forex + commodities
// Bonds: TwelveData yield symbols (US10Y, US2Y, US30Y), fallback to hardcoded

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(200).end();

  var TD_KEY = process.env.TWELVE_key;
  var symbol = req.query.symbol;
  var endpoint = req.query.endpoint;
  var interval = req.query.interval || "30min";
  var outputsize = req.query.outputsize || "48";

  if (!symbol) return res.status(400).json({ error: "No symbol" });

  // Upgraded plan: native symbols for indices and volatility
  var TD_MAP = {
    // Forex — native
    "XAU/USD": { td:"XAU/USD",  scale:1 },
    "XAG/USD": { td:"XAG/USD",  scale:1 },
    "EUR/USD": { td:"EUR/USD",  scale:1 },
    "GBP/USD": { td:"GBP/USD",  scale:1 },
    "USD/JPY": { td:"USD/JPY",  scale:1 },
    "AUD/USD": { td:"AUD/USD",  scale:1 },
    "USD/CAD": { td:"USD/CAD",  scale:1 },
    "USD/CHF": { td:"USD/CHF",  scale:1 },
    "NZD/USD": { td:"NZD/USD",  scale:1 },
    "GBP/JPY": { td:"GBP/JPY",  scale:1 },
    "EUR/JPY": { td:"EUR/JPY",  scale:1 },
    "AUD/JPY": { td:"AUD/JPY",  scale:1 },
    "EUR/GBP": { td:"EUR/GBP",  scale:1 },
    "EUR/AUD": { td:"EUR/AUD",  scale:1 },
    "EUR/NZD": { td:"EUR/NZD",  scale:1 },
    "EUR/CAD": { td:"EUR/CAD",  scale:1 },
    "EUR/CHF": { td:"EUR/CHF",  scale:1 },
    "GBP/AUD": { td:"GBP/AUD",  scale:1 },
    "GBP/NZD": { td:"GBP/NZD",  scale:1 },
    "GBP/CAD": { td:"GBP/CAD",  scale:1 },
    "GBP/CHF": { td:"GBP/CHF",  scale:1 },
    "AUD/NZD": { td:"AUD/NZD",  scale:1 },
    "AUD/CAD": { td:"AUD/CAD",  scale:1 },
    "AUD/CHF": { td:"AUD/CHF",  scale:1 },
    "NZD/JPY": { td:"NZD/JPY",  scale:1 },
    "NZD/CAD": { td:"NZD/CAD",  scale:1 },
    "NZD/CHF": { td:"NZD/CHF",  scale:1 },
    "CAD/JPY": { td:"CAD/JPY",  scale:1 },
    "CHF/JPY": { td:"CHF/JPY",  scale:1 },
    // Commodities
    "WTI/USD": { td:"WTI/USD",  scale:1 },
    "BRENT":   { td:"BRENT",    scale:1 },
    // Indices — native on upgraded plan
    "SPX":     { td:"SPX",      scale:1 },
    "NDX":     { td:"NDX",      scale:1 },
    "DJI":     { td:"DJI",      scale:1 },
    "DAX":     { td:"DAX",      scale:1 },
    "FTSE":    { td:"FTSE",     scale:1 },
    "NI225":   { td:"NI225",    scale:1 },
    // Volatility — native on upgraded plan
    "VIX":     { td:"VIX",      scale:1 },
    // DXY
    "DX":      { td:"DX",       scale:1 },
    // Crypto
    "BTC/USD": { td:"BTC/USD",  scale:1 },
    "ETH/USD": { td:"ETH/USD",  scale:1 },
    // Bond yields — TwelveData yield symbols (upgraded plan)
    "US10Y":   { td:"US10Y",    scale:1, isBond:true, fallback:4.28 },
    "US02Y":   { td:"US2Y",     scale:1, isBond:true, fallback:3.76 },
    "US30Y":   { td:"US30Y",    scale:1, isBond:true, fallback:4.78 },
  };

  // Timeseries endpoint
  if (endpoint === "timeseries") {
    try {
      var cfg = TD_MAP[symbol];
      var tdSym = cfg ? cfg.td : symbol;
      var url = "https://api.twelvedata.com/time_series?symbol=" +
        encodeURIComponent(tdSym) + "&interval=" + interval +
        "&outputsize=" + outputsize + "&apikey=" + TD_KEY;
      var r = await fetch(url);
      if (!r.ok) return res.status(502).json({ error: "TwelveData HTTP " + r.status });
      var data = await r.json();
      if (data.code && data.code !== 200) return res.status(200).json({ error: data.message || "TwelveData error", code: data.code });
      if (cfg && cfg.scale && cfg.scale !== 1 && data.values) {
        data.values = data.values.map(function(v) {
          return Object.assign({}, v, {
            open:  String(parseFloat(v.open)  * cfg.scale),
            high:  String(parseFloat(v.high)  * cfg.scale),
            low:   String(parseFloat(v.low)   * cfg.scale),
            close: String(parseFloat(v.close) * cfg.scale),
          });
        });
      }
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Batch price fetch
  var symbols = symbol.split(",").map(function(s){ return s.trim(); }).filter(Boolean);
  var result = {};

  // Split bond vs non-bond symbols
  var bondSyms = symbols.filter(function(s) { return TD_MAP[s] && TD_MAP[s].isBond; });
  var fetchSyms = symbols.filter(function(s) { return !TD_MAP[s] || !TD_MAP[s].isBond; });

  // Fetch bond yields from TwelveData; fall back to hardcoded if unavailable
  if (bondSyms.length > 0 && TD_KEY) {
    var bondTdSyms = bondSyms.map(function(s) { return TD_MAP[s].td; });
    try {
      var bondUrl = "https://api.twelvedata.com/price?symbol=" +
        encodeURIComponent(bondTdSyms.join(",")) + "&apikey=" + TD_KEY;
      var bondRes = await fetch(bondUrl);
      var bondData = bondRes.ok ? await bondRes.json() : null;

      bondSyms.forEach(function(orig) {
        var cfg = TD_MAP[orig];
        var entry = bondSyms.length === 1
          ? bondData
          : (bondData ? bondData[cfg.td] : null);
        if (entry && entry.price && !entry.code) {
          result[orig] = { price: String(parseFloat(parseFloat(entry.price).toFixed(4))), source: "TD" };
        } else {
          result[orig] = { price: String(cfg.fallback), source: "FALLBACK" };
        }
      });
    } catch(e) {
      bondSyms.forEach(function(s) {
        result[s] = { price: String(TD_MAP[s].fallback), source: "FALLBACK" };
      });
    }
  } else {
    bondSyms.forEach(function(s) {
      result[s] = { price: String(TD_MAP[s].fallback), source: "FALLBACK" };
    });
  }

  // Fetch all other prices in batches of 8
  if (fetchSyms.length > 0 && TD_KEY) {
    var batches = [];
    for (var i = 0; i < fetchSyms.length; i += 8) batches.push(fetchSyms.slice(i, i + 8));

    await Promise.allSettled(batches.map(function(batch) {
      var tdBatch = batch.map(function(s) { return TD_MAP[s] ? TD_MAP[s].td : s; });
      var url = "https://api.twelvedata.com/price?symbol=" +
        encodeURIComponent(tdBatch.join(",")) + "&apikey=" + TD_KEY;

      return fetch(url)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
          if (!data) return;
          batch.forEach(function(orig, idx) {
            var tdSym = tdBatch[idx];
            // Single-symbol responses return { price, ... } directly; batch returns { SYMBOL: { price, ... } }
            var entry = batch.length === 1 ? data : data[tdSym];
            if (entry && entry.price && !entry.code) {
              var cfg = TD_MAP[orig];
              var price = parseFloat(entry.price);
              if (cfg && cfg.scale && cfg.scale !== 1) price = price * cfg.scale;
              result[orig] = { price: String(parseFloat(price.toFixed(4))), source: "TD" };
            }
          });
        })
        .catch(function() {});
    }));
  }

  return res.status(200).json(result);
}
