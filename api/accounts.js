export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const result = await Promise.race([
      run(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
    ])
    return res.json(result)
  } catch(e) {
    return res.status(200).json({ error: e.message, ts: Date.now() })
  }
}

async function run(req) {
  if (req.method !== "GET") {
    return { error: true, message: "GET only", account: "" };
  }

  const urlParams = new URLSearchParams(req.url.split('?')[1] ?? '');
  const account = urlParams.get('account');

  if (!["exness", "fundednext"].includes(account)) {
    return { error: true, message: "account must be 'exness' or 'fundednext'", account: account || "" };
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return { error: true, message: "Redis not configured", account };
  }

  const redisKey = `account:${account}`;

  const r = await fetch(`${url}/get/${encodeURIComponent(redisKey)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) {
    return { error: true, message: "Redis read failed", account };
  }
  const d = await r.json();
  const raw = d.result;

  if (!raw) {
    return { error: true, message: "No data yet — open MT5 to sync", account };
  }

  let data;
  try { data = JSON.parse(raw); } catch {
    return { error: true, message: "Corrupted data in Redis", account };
  }

  const updatedAt = data.updatedAt || null;
  const ageSecs = updatedAt ? (Date.now() - new Date(updatedAt).getTime()) / 1000 : Infinity;
  const isLive = ageSecs < 120;

  return { ...data, isLive };
}
