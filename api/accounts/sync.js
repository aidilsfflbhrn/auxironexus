export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "POST only" });

  const body = req.body;
  if (!body || !body.login) return res.status(401).json({ ok: false, message: "No body" });

  const login = String(body.login);
  let redisKey = null;
  if (process.env.EXNESS_LOGIN && login === String(process.env.EXNESS_LOGIN)) {
    redisKey = "account:exness";
  } else if (process.env.FUNDEDNEXT_LOGIN && login === String(process.env.FUNDEDNEXT_LOGIN)) {
    redisKey = "account:fundednext";
  }

  if (!redisKey) return res.status(401).json({ ok: false, message: "Login not recognised" });

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(500).json({ ok: false, message: "Redis not configured" });

  const payload = JSON.stringify({ ...body, updatedAt: new Date().toISOString() });

  try {
    // SET key value EX 7200
    const r = await fetch(`${url}/set/${encodeURIComponent(redisKey)}/${encodeURIComponent(payload)}/ex/7200`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      return res.status(502).json({ ok: false, message: "Redis write failed: " + errText.slice(0, 100) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
}
