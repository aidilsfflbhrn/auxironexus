// Auxiron AI Proxy — supports standard + web search requests
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var key = process.env.ANTHROPIC_KEY;
  if (!key) return res.status(500).json({ error: "No API key" });

  try {
    var body = req.body;

    // If web search requested, add the tool
    if (body.useWebSearch) {
      body = Object.assign({}, body);
      delete body.useWebSearch;
      body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      // Use sonnet for web search requests
      body.model = "claude-sonnet-4-20250514";
      // Increase tokens for richer web search responses
      body.max_tokens = body.max_tokens || 4000;
    }

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05"
      },
      body: JSON.stringify(body)
    });

    var data = await response.json();
    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
