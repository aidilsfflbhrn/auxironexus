// Auxiron News Proxy
// Fetches relevant news headlines for a specific instrument
// Uses GNews free API (100 requests/day free tier)

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "No query provided" });

  const GNEWS_KEY = process.env.GNEWS_KEY;

  // If no GNews key, return empty gracefully
  if (!GNEWS_KEY || GNEWS_KEY === "YOUR_GNEWS_KEY") {
    return res.status(200).json({ articles: [] });
  }

  try {
    const url = "https://gnews.io/api/v4/search?q=" +
      encodeURIComponent(q) +
      "&lang=en&max=6&sortby=publishedAt&apikey=" + GNEWS_KEY;

    const r = await fetch(url);
    const data = await r.json();

    if (data.errors) {
      return res.status(200).json({ articles: [] });
    }

    // Format articles for frontend
    const articles = (data.articles || []).map(function(a) {
      return {
        title: a.title,
        description: a.description,
        url: a.url,
        publishedAt: a.publishedAt,
        source: { name: a.source && a.source.name ? a.source.name : "Unknown" },
        image: a.image || null,
      };
    });

    return res.status(200).json({ articles: articles });
  } catch(e) {
    return res.status(200).json({ articles: [], error: e.message });
  }
};
