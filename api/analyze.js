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

    // Retry up to 3 times on overloaded errors
    let data;
    for (let attempt = 0; attempt <= 3; attempt++) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });
      data = await response.json();

      const isOverloaded = response.status === 529 ||
        (data.error && data.error.type === "overloaded_error") ||
        (data.type === "error" && data.error && data.error.type === "overloaded_error");

      if (!isOverloaded || attempt === 3) break;

      // Exponential backoff: 2s, 4s, 6s
      await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
