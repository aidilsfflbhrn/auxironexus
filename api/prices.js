module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, interval, outputsize, endpoint } = req.query;
  const KEY = process.env.TWELVE_KEY;

  try {
    let url = "";
    if (endpoint === "timeseries") {
      url = "https://api.twelvedata.com/time_series?symbol=" + encodeURIComponent(symbol) + "&interval=" + (interval || "30min") + "&outputsize=" + (outputsize || "48") + "&apikey=" + KEY;
    } else {
      url = "https://api.twelvedata.com/price?symbol=" + encodeURIComponent(symbol) + "&apikey=" + KEY;
    }
    const r = await fetch(url);
    const data = await r.json();
    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};
