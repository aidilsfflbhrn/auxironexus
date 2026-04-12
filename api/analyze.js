export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const KEY = "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";

  try {
    const body = await new Promise((resolve, reject) => {
      let raw = "";
      req.on("data", c => { raw += c; });
      req.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch(e) { reject(e); }
      });
      req.on("error", reject);
    });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
