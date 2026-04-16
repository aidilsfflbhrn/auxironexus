// Auxiron Prices Proxy
// TwelveData Basic — Forex + Commodities + ETF proxies for Indices/VIX/DXY/Oil
// ETF scaling: SPY×10=SPX, QQQ×40=NDX, DIA×100=DJI, VXX×0.642=VIX, UUP×3.63=DXY, USO÷1.44=WTI

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

  // Map our symbols to TwelveData symbols + scaling factor
  // scale: multiply TwelveData price by this to get real market value
  var TD_MAP = {
    // Forex + Commodities — native real prices
    "XAU/USD": { td:"XAU/USD",  scale:1      },
    "XAG/USD": { td:"XAG/USD",  scale:1      },
    "WTI/USD": { td:"USO",      scale:0.6944 }, // USO ÷ 1.44
    "BRENT":   { td:"BNO",      scale:0.85   }, // BNO proxy for Brent
    "EUR/USD": { td:"EUR/USD",  scale:1      },
    "GBP/USD": { td:"GBP/USD",  scale:1      },
    "USD/JPY": { td:"USD/JPY",  scale:1      },
    "AUD/USD": { td:"AUD/USD",  scale:1      },
    "USD/CAD": { td:"USD/CAD",  scale:1      },
    "USD/CHF": { td:"USD/CHF",  scale:1      },
    "NZD/USD": { td:"NZD/USD",  scale:1      },
    "GBP/JPY": { td:"GBP/JPY",  scale:1      },
    "EUR/JPY": { td:"EUR/JPY",  scale:1      },
    "AUD/JPY": { td:"AUD/JPY",  scale:1      },
    "EUR/GBP": { td:"EUR/GBP",  scale:1      },
    "EUR/AUD": { td:"EUR/AUD",  scale:1      },
    "EUR/NZD": { td:"EUR/NZD",  scale:1      },
    "EUR/CAD": { td:"EUR/CAD",  scale:1      },
    "EUR/CHF": { td:"EUR/CHF",  scale:1      },
    "GBP/AUD": { td:"GBP/AUD",  scale:1      },
    "GBP/NZD": { td:"GBP/NZD",  scale:1      },
    "GBP/CAD": { td:"GBP/CAD",  scale:1      },
    "GBP/CHF": { td:"GBP/CHF",  scale:1      },
    "AUD/NZD": { td:"AUD/NZD",  scale:1      },
    "AUD/CAD": { td:"AUD/CAD",  scale:1      },
    "AUD/CHF": { td:"AUD/CHF",  scale:1      },
    "NZD/JPY": { td:"NZD/JPY",  scale:1      },
    "NZD/CAD": { td:"NZD/CAD",  scale:1      },
    "NZD/CHF": { td:"NZD/CHF",  scale:1      },
    "CAD/JPY": { td:"CAD/JPY",  scale:1      },
    "CHF/JPY": { td:"CHF/JPY",  scale:1      },
    // ETF proxies — scaled to real market values
    "SPX":     { td:"SPY",      scale:10     }, // SPY × 10 = SPX
    "NDX":     { td:"QQQ",      scale:40     }, // QQQ × 40 = NDX
    "DJI":     { td:"DIA",      scale:100    }, // DIA × 100 = DJI
    "VIX":     { td:"VXX",      scale:0.642  }, // VXX × 0.642 = VIX
    "DX":      { td:"UUP",      scale:3.63   }, // UUP × 3.63 = DXY
    "DAX":     { td:"EWG",      scale:140    }, // EWG proxy for DAX
    "FTSE":    { td:"EWU",      scale:250    }, // EWU proxy for FTSE
    "NI225":   { td:"EWJ",      scale:5500   }, // EWJ proxy for Nikkei
    "BTC/USD": { td:"BTC/USD",  scale:1      },
    "ETH/USD": { td:"ETH/USD",  scale:1      },
    // Bond yields — use fixed values + small simulation (FRED only gives daily)
    "US10Y":   { td:"IEF",      scale:null, bondYield: 4.28 },
    "US02Y":   { td:"SHY",      scale:null, bondYield: 3.76 },
    "US30Y":   { td:"TLT",      scale:null, bondYield: 4.78 },
  };

  // Timeseries — use native TwelveData symbols
  if (endpoint === "timeseries") {
    try {
      var cfg = TD_MAP[symbol];
      var tdSym = cfg ? cfg.td : symbol;
      var r = await fetch("https://api.twelvedata.com/time_series?symbol=" +
        encodeURIComponent(tdSym) + "&interval=" + interval +
        "&outputsize=" + outputsize + "&apikey=" + TD_KEY);
      var data = await r.json();
      // Scale values if needed
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
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  // Batch price fetch
  var symbols = symbol.split(",").map(function(s){ return s.trim(); }).filter(Boolean);
  var result = {};

  // Separate bond symbols (use hardcoded yield values)
  var bondSyms = symbols.filter(function(s) {
    return TD_MAP[s] && TD_MAP[s].bondYield !== undefined;
  });
  var fetchSyms = symbols.filter(function(s) {
    return !TD_MAP[s] || TD_MAP[s].bondYield === undefined;
  });

  // Add bond yields directly (no API needed)
  bondSyms.forEach(function(s) {
    var cfg = TD_MAP[s];
    if (cfg && cfg.bondYield) {
      result[s] = { price: String(cfg.bondYield), source: "FRED" };
    }
  });

  // Fetch prices from TwelveData
  if (fetchSyms.length > 0 && TD_KEY) {
    var batches = [];
    for (var i = 0; i < fetchSyms.length; i += 8) batches.push(fetchSyms.slice(i, i+8));

    await Promise.allSettled(batches.map(function(batch) {
      // Map to TwelveData symbols
      var tdBatch = batch.map(function(s) {
        return TD_MAP[s] ? TD_MAP[s].td : s;
      });
      var url = "https://api.twelvedata.com/price?symbol=" +
        encodeURIComponent(tdBatch.join(",")) + "&apikey=" + TD_KEY;

      return fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (batch.length === 1) {
            if (data.price && !data.code) {
              var cfg = TD_MAP[batch[0]];
              var price = parseFloat(data.price);
              if (cfg && cfg.scale && cfg.scale !== 1) price = price * cfg.scale;
              result[batch[0]] = { price: String(parseFloat(price.toFixed(4))), source: "TD" };
            }
          } else {
            batch.forEach(function(orig, idx) {
              var tdSym = tdBatch[idx];
              var entry = data[tdSym];
              if (entry && entry.price && !entry.code) {
                var cfg = TD_MAP[orig];
                var price = parseFloat(entry.price);
                if (cfg && cfg.scale && cfg.scale !== 1) price = price * cfg.scale;
                result[orig] = { price: String(parseFloat(price.toFixed(4))), source: "TD" };
              }
            });
          }
        }).catch(function() {});
    }));
  }

  return res.status(200).json(result);
};
