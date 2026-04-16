module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var TD_KEY = process.env.TWELVE_KEY;
  var symbol = req.query.symbol;
  var endpoint = req.query.endpoint;
  var interval = req.query.interval || "30min";
  var outputsize = req.query.outputsize || "48";

  if (!symbol) return res.status(400).json({ error: "No symbol" });

  // Correct TwelveData symbol mapping
  // Indices need exchange suffix on free tier
  var TD_MAP = {
    // US Indices - use SPY/QQQ ETFs as proxy (always available on free tier)
    "SPX":     "SPY",        // S&P 500 via SPY ETF
    "NDX":     "QQQ",        // NASDAQ via QQQ ETF  
    "DJI":     "DIA",        // DOW via DIA ETF
    // Volatility
    "VIX":     "VIXY",       // VIX via VIXY ETF
    // DXY - use UUP ETF as proxy
    "DX":      "UUP",        // DXY via UUP ETF
    // European indices
    "DAX":     "EWG",        // DAX via EWG ETF
    "FTSE":    "EWU",        // FTSE via EWU ETF
    "NI225":   "EWJ",        // Nikkei via EWJ ETF
    // Commodities - TwelveData supports these directly
    "XAU/USD": "XAU/USD",
    "XAG/USD": "XAG/USD",
    "WTI/USD": "WTI/USD",
    "BRENT":   "BRENT",
    // Bonds - use ETF proxies
    "US10Y":   "IEF",        // 10Y via IEF ETF
    "US02Y":   "SHY",        // 2Y via SHY ETF
    "US30Y":   "TLT",        // 30Y via TLT ETF
    // Crypto
    "BTC/USD": "BTC/USD",
    "ETH/USD": "ETH/USD",
  };

  // For bonds we need to scale to yield equivalent
  var BOND_ETF = { "US10Y":"IEF", "US02Y":"SHY", "US30Y":"TLT" };

  if (endpoint === "timeseries") {
    try {
      var tdSym = TD_MAP[symbol] || symbol;
      var r = await fetch("https://api.twelvedata.com/time_series?symbol=" +
        encodeURIComponent(tdSym) + "&interval=" + interval +
        "&outputsize=" + outputsize + "&apikey=" + TD_KEY);
      return res.status(200).json(await r.json());
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  var symbols = symbol.split(",").map(function(s){return s.trim();}).filter(Boolean);
  var result = {};

  try {
    var tdSymbols = symbols.map(function(s){return TD_MAP[s]||s;});
    var url = "https://api.twelvedata.com/price?symbol=" +
      encodeURIComponent(tdSymbols.join(",")) + "&apikey=" + TD_KEY;
    var r2 = await fetch(url);
    var data = await r2.json();

    if (symbols.length === 1) {
      if (data.price && !data.code) {
        result[symbols[0]] = { price: data.price, source: "TD" };
      }
    } else {
      symbols.forEach(function(orig, i) {
        var entry = data[tdSymbols[i]];
        if (entry && entry.price && !entry.code) {
          result[orig] = { price: entry.price, source: "TD" };
        }
      });
    }
  } catch(e) { return res.status(500).json({ error: e.message }); }

  return res.status(200).json(result);
};
