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

  var TD_MAP = {
    "SPX":"SPX","NDX":"NDX","DJI":"DJI","DAX":"DAX",
    "FTSE":"FTSE","NI225":"N225","DX":"DX-Y.NYB",
    "XAU/USD":"XAU/USD","XAG/USD":"XAG/USD",
    "WTI/USD":"WTI/USD","BRENT":"BRENT",
    "VIX":"VIX","US02Y":"US02Y","US10Y":"US10Y","US30Y":"US30Y",
    "BTC/USD":"BTC/USD","ETH/USD":"ETH/USD"
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
  var tdSymbols = symbols.map(function(s){return TD_MAP[s]||s;});
  var result = {};

  try {
    var url = "https://api.twelvedata.com/price?symbol=" +
      encodeURIComponent(tdSymbols.join(",")) + "&apikey=" + TD_KEY;
    var r2 = await fetch(url);
    var data = await r2.json();

    if (symbols.length === 1) {
      if (data.price && !data.code) result[symbols[0]] = { price: data.price, source: "TD" };
    } else {
      symbols.forEach(function(orig, i) {
        var entry = data[tdSymbols[i]];
        if (entry && entry.price && !entry.code) result[orig] = { price: entry.price, source: "TD" };
      });
    }
  } catch(e) { return res.status(500).json({ error: e.message }); }

  return res.status(200).json(result);
};
