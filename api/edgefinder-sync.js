// Ingests the weekly EdgeFinder screenshot-derived read. Timestamped on
// receipt (normally Sunday) so it can pass through the same staleness
// machinery every other feed uses — see checkEdgeFinderStaleness() in
// api/lib/pillars.js. This is intentionally a thin store: reading/parsing the
// screenshots themselves stays in the existing news-impact analyzer flow;
// this endpoint just records "here is this week's EdgeFinder read, and when
// it arrived" for the thesis-pillar monitor to compare against.

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "POST only" });

  const body = req.body;
  const read = typeof body?.read === "string" ? body.read.trim() : "";
  if (!read) return res.status(400).json({ ok: false, message: "Missing \"read\" field — the EdgeFinder summary text" });

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(500).json({ ok: false, message: "Redis not configured" });

  const receivedAt = new Date().toISOString();
  const payload = JSON.stringify({ read, receivedAt });

  try {
    const r = await fetch(`${url}/set/edgefinder:latest/${encodeURIComponent(payload)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      return res.status(502).json({ ok: false, message: "Redis write failed: " + errText.slice(0, 100) });
    }
    return res.status(200).json({ ok: true, read, receivedAt });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
}
