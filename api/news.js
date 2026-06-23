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
  const q = urlParams.get('q') ?? '';
  const symbols = urlParams.get('symbols') ?? '';

  const MARKETAUX_KEY = process.env.MARKETAUX_key;
  const GNEWS_KEY = process.env.GNEWS_key;

  // Try Marketaux first
  if (MARKETAUX_KEY) {
    try {
      const params = new URLSearchParams({
        api_token: MARKETAUX_KEY,
        language: 'en',
        limit: '10',
        sort: 'published_desc',
        filter_entities: 'true',
      });
      if (symbols) {
        params.set('symbols', symbols);
      } else if (q) {
        params.set('search', q);
      }

      const url = 'https://api.marketaux.com/v1/news/all?' + params.toString();
      const r = await fetch(url);
      const data = await r.json();

      if (!data.error && Array.isArray(data.data) && data.data.length > 0) {
        const articles = data.data.map(function(article) {
          return {
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.published_at,
            source: { name: article.source },
            image: article.image_url || null,
            sentiment: article.entities?.[0]?.sentiment_score ?? null,
            relevanceScore: article.relevance_score || null,
          };
        });
        return { articles, source: 'marketaux' };
      }
    } catch (e) {
      // fall through to GNews
    }
  }

  // GNews fallback
  if (!GNEWS_KEY || GNEWS_KEY === "YOUR_GNEWS_KEY") {
    return { articles: [], source: 'gnews' };
  }

  if (!q) {
    return { articles: [], source: 'gnews' };
  }

  const url = "https://gnews.io/api/v4/search?q=" +
    encodeURIComponent(q) +
    "&lang=en&max=6&sortby=publishedAt&apikey=" + GNEWS_KEY;

  const r = await fetch(url);
  const data = await r.json();

  if (data.errors) {
    return { articles: [], source: 'gnews' };
  }

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

  return { articles, source: 'gnews' };
}
