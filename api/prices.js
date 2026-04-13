module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  var symbol = req.query.symbol;
  var endpoint = req.query.endpoint;
  var interval = req.query.interval || "30min";
  var outputsize = req.query.outputsize || "48";

  var TD_KEY  = process.env.TWELVE_KEY;
  var FH_KEY  = process.env.FINNHUB_KEY;
  var FMP_KEY = process.env.FMP_KEY;

  // Timeseries always uses TwelveData
  if (endpoint === "timeseries") {
    try {
      var url = "https://api.twelvedata.com/time_series?symbol=" +
        encodeURIComponent(symbol) + "&interval=" + interval +
        "&outputsize=" + outputsize + "&apikey=" + TD_KEY;
      var r = await fetch(url);
      var data = await r.json();
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (!symbol) return res.status(400).json({ error: "No symbol" });

  var symbols = symbol.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
  var result = {};

  // Which symbols go to which source
  var FINNHUB_MAP = {
    "SPX":     "^GSPC",
    "NDX":     "^NDX",
    "DJI":     "^DJI",
    "DAX":     "^GDAXI",
    "FTSE":    "^FTSE",
    "NI225":   "^N225",
    "DX":      "DX:CUR",
    "BTC/USD": "BINANCE:BTCUSDT",
    "ETH/USD": "BINANCE:ETHUSDT",
  };

  var FMP_MAP = {
    "XAU/USD": "GCUSD",
    "XAG/USD": "SIUSD",
    "XPT/USD": "PLUSD",
    "WTI/USD": "CLUSD",
    "BRENT":   "BZUSD",
    "US02Y":   "^IRX",
    "US10Y":   "^TNX",
    "US30Y":   "^TYX",
    "VIX":     "^VIX",
  };

  var tdSyms  = [];
  var fhSyms  = [];
  var fmpSyms = [];

  symbols.forEach(function(s) {
    if (FINNHUB_MAP[s]) fhSyms.push(s);
    else if (FMP_MAP[s]) fmpSyms.push(s);
    else tdSyms.push(s);
  });

  var promises = [];

  // TwelveData - Forex pairs
  if (tdSyms.length > 0 && TD_KEY) {
    var batches = [];
    for (var i = 0; i < tdSyms.length; i += 8) batches.push(tdSyms.slice(i, i + 8));
    batches.forEach(function(batch) {
      promises.push(
        fetch("https://api.twelvedata.com/price?symbol=" +
          encodeURIComponent(batch.join(",")) + "&apikey=" + TD_KEY)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (batch.length === 1) {
              if (data && data.price && !data.code) {
                result[batch[0]] = { price: data.price, source: "TD" };
              }
            } else {
              Object.keys(data).forEach(function(sym) {
                if (data[sym] && data[sym].price && !data[sym].code) {
                  result[sym] = { price: data[sym].price, source: "TD" };
                }
              });
            }
          })
          .catch(function() {})
      );
    });
  }

  // Finnhub - Indices and Crypto
  if (fhSyms.length > 0 && FH_KEY) {
    fhSyms.forEach(function(sym) {
      var fhSym = FINNHUB_MAP[sym];
      var isCrypto = sym === "BTC/USD" || sym === "ETH/USD";
      var url = isCrypto
        ? "https://finnhub.io/api/v1/crypto/candle?symbol=" + fhSym + "&resolution=1&from=" + Math.floor(Date.now()/1000 - 300) + "&to=" + Math.floor(Date.now()/1000) + "&token=" + FH_KEY
        : "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(fhSym) + "&token=" + FH_KEY;
      promises.push(
        fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var price = null;
            if (isCrypto && data.c && data.c.length > 0) {
              price = data.c[data.c.length - 1];
            } else if (!isCrypto && data.c && data.c > 0) {
              price = data.c;
            }
            if (price) result[sym] = { price: String(price), source: "FH" };
          })
          .catch(function() {})
      );
    });
  }

  // FMP - Commodities, Bonds, VIX
  if (fmpSyms.length > 0 && FMP_KEY) {
    var fmpTickers = [];
    var fmpTickerToSym = {};
    fmpSyms.forEach(function(sym) {
      var ticker = FMP_MAP[sym];
      if (fmpTickers.indexOf(ticker) < 0) fmpTickers.push(ticker);
      fmpTickerToSym[ticker] = sym;
    });
    promises.push(
      fetch("https://financialmodelingprep.com/api/v3/quote-short/" +
        fmpTickers.join(",") + "?apikey=" + FMP_KEY)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!Array.isArray(data)) return;
          data.forEach(function(item) {
            var sym = fmpTickerToSym[item.symbol];
            if (sym && item.price) result[sym] = { price: String(item.price), source: "FMP" };
          });
        })
        .catch(function() {})
    );
  }

  // Fallback: if no API keys set at all, use TwelveData for everything
  if (tdSyms.length === 0 && fhSyms.length === 0 && fmpSyms.length === 0) {
    try {
      var allBatches = [];
      for (var j = 0; j < symbols.length; j += 8) allBatches.push(symbols.slice(j, j + 8));
      for (var k = 0; k < allBatches.length; k++) {
        var batch = allBatches[k];
        var r2 = await fetch("https://api.twelvedata.com/price?symbol=" +
          encodeURIComponent(batch.join(",")) + "&apikey=" + TD_KEY);
        var d2 = await r2.json();
        if (batch.length === 1) {
          if (d2 && d2.price) result[batch[0]] = { price: d2.price, source: "TD" };
        } else {
          Object.keys(d2).forEach(function(sym) {
            if (d2[sym] && d2[sym].price) result[sym] = { price: d2[sym].price, source: "TD" };
          });
        }
      }
    } catch(e) {}
  }

  await Promise.allSettled(promises);
  return res.status(200).json(result);
};
