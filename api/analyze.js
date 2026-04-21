export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const KEY = process.env.ANTHROPIC_KEY;
  if (!KEY) return res.status(500).json({ error: "No API key configured" });

  try {
    const body = req.body;
    const useWebSearch = body.useWebSearch || false;

    const requestBody = {
      model: useWebSearch ? "claude-sonnet-4-6" : (body.model || "claude-haiku-4-5"),
      max_tokens: body.max_tokens || 1000,
      system: body.system,
      messages: body.messages,
    };

    if (useWebSearch) {
      requestBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
    }

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": KEY,
      "anthropic-version": "2023-06-01",
    };

    if (useWebSearch) {
      headers["anthropic-beta"] = "web-search-2025-03-05";
    }

    // 1 retry on transient errors (429, 500, 504) — never retry 401/403/other
    let response, data;
    for (let attempt = 0; attempt <= 1; attempt++) {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });
      data = await response.json();

      const retryable = response.status === 429 ||
                        response.status === 500 ||
                        response.status === 504;

      if (!retryable || attempt === 1) break;
      await new Promise(r => setTimeout(r, 2000));
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
