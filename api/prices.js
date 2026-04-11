export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, interval, outputsize, endpoint } = req.query;
  const API_KEY = 'eebba65f9d564154ba5915d5895264ec';

  try {
    let url = '';

    if (endpoint === 'timeseries') {
      url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
        symbol
      )}&interval=${interval || '30min'}&outputsize=${
        outputsize || '48'
      }&apikey=${API_KEY}`;
    } else {
      url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(
        symbol
      )}&apikey=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Proxy fetch failed', detail: error.message });
  }
}
