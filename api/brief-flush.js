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

  const results = await Promise.all(keys.map(async (key) => {
    try {
      const r = await fetch(`${base}/del/${key}`, { method: "POST", headers });
      const j = await r.json();
      return { key, deleted: j.result };
    } catch (e) {
      return { key, deleted: false, error: e.message };
    }
  }));

  return Response.json({
    flushed: true,
    results,
    message: "All brief caches cleared. Next tap will regenerate."
  });
}
