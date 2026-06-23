// CFTC COT data proxy — avoids browser CORS restrictions on publicreporting.cftc.gov
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const result = await Promise.race([
      run(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000))
    ])
    return res.json(result)
  } catch(e) {
    return res.status(200).json({ error: e.message, ts: Date.now() })
  }
}

async function run(req) {
  const urlParams = new URLSearchParams(req.url.split('?')[1] ?? '');
  var symbol = urlParams.get('symbol');

  var CFTC_MAP = {
    "XAU/USD": "GOLD - COMMODITY EXCHANGE INC.",
    "XAG/USD": "SILVER - COMMODITY EXCHANGE INC.",
    "WTI/USD": "CRUDE OIL, LIGHT SWEET - ICE FUTURES U.S.",
    "BRENT":   "BRENT LAST DAY - ICE FUTURES U.S.",
    "EUR/USD": "EURO FX - CHICAGO MERCANTILE EXCHANGE",
    "GBP/USD": "BRITISH POUND STERLING - CHICAGO MERCANTILE EXCHANGE",
    "USD/JPY": "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE",
    "AUD/USD": "AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    "NZD/USD": "NEW ZEALAND DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    "USD/CAD": "CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    "USD/CHF": "SWISS FRANC - CHICAGO MERCANTILE EXCHANGE",
    "SPX":     "S&P 500 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE",
    "NDX":     "NASDAQ-100 STOCK INDEX (MINI) - CHICAGO MERCANTILE EXCHANGE",
    "DJI":     "DJIA x $5 - CHICAGO BOARD OF TRADE",
    "DX":      "U.S. DOLLAR INDEX - ICE FUTURES U.S.",
    "BTC/USD": "BITCOIN - CHICAGO MERCANTILE EXCHANGE",
    "ETH/USD": "ETHER CASH SETTLED - CHICAGO MERCANTILE EXCHANGE",
    "US10Y":   "30-YEAR U.S. TREASURY BONDS - CHICAGO BOARD OF TRADE",
    "US02Y":   "2-YEAR U.S. TREASURY NOTES (2 YR.) - CHICAGO BOARD OF TRADE",
    "US30Y":   "30-YEAR U.S. TREASURY BONDS - CHICAGO BOARD OF TRADE",
  };

  var name = CFTC_MAP[symbol];
  if (!name) return { error: "No COT mapping for " + symbol };

  var url = "https://publicreporting.cftc.gov/resource/jun7-fc8e.json" +
    "?$where=" + encodeURIComponent("market_and_exchange_names='" + name + "'") +
    "&$order=report_date_as_yyyy_mm_dd+DESC&$limit=2";

  var r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) return { error: "CFTC HTTP " + r.status };

  var data = await r.json();
  if (!data || data.length === 0)
    return { error: "No CFTC data for " + name };

  var curr = data[0];
  var prev = data[1] || data[0];

  var longs   = parseInt(curr.noncomm_positions_long_all  || 0);
  var shorts  = parseInt(curr.noncomm_positions_short_all || 0);
  var pLongs  = parseInt(prev.noncomm_positions_long_all  || 0);
  var pShorts = parseInt(prev.noncomm_positions_short_all || 0);
  var oi      = parseInt(curr.open_interest_all || 0);
  var oiPrev  = parseInt(prev.open_interest_all || 0);
  var oiChg   = oi - oiPrev;

  var net     = longs - shorts;
  var netChg  = net - (pLongs - pShorts);
  var total   = (longs + shorts) || 1;
  var longPct  = Math.round(longs  / total * 100);
  var shortPct = 100 - longPct;

  var bias = longPct > 58 ? "BULLISH" : longPct < 42 ? "BEARISH" : "NEUTRAL";
  var biasColor = bias === "BULLISH" ? "#00d084" : bias === "BEARISH" ? "#ff4d4d" : "#e8d5a3";

  var reading = (
    bias === "BULLISH"
      ? "Speculators are net long " + longs.toLocaleString() + " contracts (" + longPct + "% long tilt)"
      : bias === "BEARISH"
      ? "Speculators are net short " + Math.abs(net).toLocaleString() + " contracts (" + shortPct + "% short tilt)"
      : "Positioning is near neutral at " + longPct + "/" + shortPct + " long/short"
  ) + (
    netChg > 500  ? ", adding "    + Math.abs(netChg).toLocaleString() + " net longs WoW — accumulation signal." :
    netChg < -500 ? ", reducing "  + Math.abs(netChg).toLocaleString() + " net longs WoW — distribution signal." :
                    " with minimal change week-on-week."
  );

  return {
    date: curr.report_date_as_yyyy_mm_dd,
    instrument: name.split(" - ")[0],
    longs, shorts, net, netChg, oi, oiChg, longPct, shortPct,
    bias, biasColor, reading,
  };
}
