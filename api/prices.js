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

  // Real TwelveData Basic plan symbols - no ETF proxies
  var TD_MAP = {
    // US Indices - real values
    "SPX":     "SPX",
    "NDX":     "NDX",
    "DJI":     "DJI",
    "DAX":     "DAX",
    "FTSE":    "FTSE",
    "NI225":   "N225",
    // DXY - real value
    "DX":      "DX-Y.NYB",
    // Volatility - real VIX
    "VIX":     "VIX",
    // Commodities - real prices
    "XAU/USD": "XAU/USD",
    "XAG/USD": "XAG/USD",
    "WTI/USD": "WTI/USD",
    "BRENT":   "BRENT",
    // Bond Yields - real yields
    "US02Y":   "US02Y",
    "US10Y":   "US10Y",
    "US30Y":   "US30Y",
    // Crypto - real prices
    "BTC/USD": "BTC/USD",
    "ETH/USD": "ETH/USD",
    // Forex - real prices (already worked)
    "EUR/USD": "EUR/USD",
    "GBP/USD": "GBP/USD",
    "USD/JPY": "USD/JPY",
    "AUD/USD": "AUD/USD",
    "USD/CAD": "USD/CAD",
    "USD/CHF": "USD/CHF",
    "NZD/USD": "NZD/USD",
    "GBP/JPY": "GBP/JPY",
    "EUR/JPY": "EUR/JPY",
    "AUD/JPY": "AUD/JPY",
  };

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
    var tdSymbols = symbols.map(function(s){ return TD_MAP[s] || s; });
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
