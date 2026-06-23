export const config = { maxDuration: 10 }

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!base || !token) {
    return Response.json({ error: true, message: 'KV not configured' }, { status: 500 });
  }

  const headers = { Authorization: "Bearer " + token };

  const keys = [
    "brief:monday_week",
    "brief:presession",
    "brief:nyopen",
    "brief:monday_presession"
  ];

  const results = (await Promise.allSettled(keys.map(async (key) => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    try {
      const r = await fetch(`${base}/del/${key}`, { method: "POST", headers, signal: ctrl.signal });
      clearTimeout(tid);
      const j = await r.json();
      return { key, deleted: j.result };
    } catch (e) {
      clearTimeout(tid);
      return { key, deleted: false, error: e.message };
    }
  }))).map(r => r.status === 'fulfilled' ? r.value : { key: '?', deleted: false, error: 'settled_rejected' });

  return Response.json({
    flushed: true,
    results,
    message: "All brief caches cleared. Next tap will regenerate."
  });
}
