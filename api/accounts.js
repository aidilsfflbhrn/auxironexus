export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: true, message: "GET only", account: "" });

  const account = req.query.account;
  if (!["exness", "fundednext"].includes(account)) {
    return res.status(400).json({ error: true, message: "account must be 'exness' or 'fundednext'", account: account || "" });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: true, message: "Redis not configured", account });
  }

  const redisKey = `account:${account}`;

  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(redisKey)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) {
      return res.status(502).json({ error: true, message: "Redis read failed", account });
    }
    const d = await r.json();
    const raw = d.result;

    if (!raw) {
      return res.status(200).json({ error: true, message: "No data yet — open MT5 to sync", account });
    }

    let data;
    try { data = JSON.parse(raw); } catch {
      return res.status(200).json({ error: true, message: "Corrupted data in Redis", account });
    }

    const updatedAt = data.updatedAt || null;
    const ageSecs = updatedAt ? (Date.now() - new Date(updatedAt).getTime()) / 1000 : Infinity;
    const isLive = ageSecs < 120;

    return res.status(200).json({ ...data, isLive });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message, account });
  }
}
