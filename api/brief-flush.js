export const config = { maxDuration: 10 }

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!base || !token) {
    return Response.json({ error: true, message: 'KV not configured' }, { status: 500 });
  }

  const headers = { Authorization: "Bearer " + token };

  const keyMap = {
    monday_week:       "brief:monday_week",
    presession:        "brief:presession",
    nyopen:            "brief:nyopen",
    monday_presession: "brief:monday_presession",
  };

  const keys = {};

  await Promise.all(Object.entries(keyMap).map(async ([name, key]) => {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(`${base}/del/${key}`, {
        method: "GET",
        headers,
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      await r.json();
      keys[name] = 'deleted';
    } catch (e) {
      keys[name] = 'error: ' + e.message;
    }
  }));

  return Response.json({ flushed: true, keys });
}
