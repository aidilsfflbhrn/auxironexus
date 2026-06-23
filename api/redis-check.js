export default async function handler(req, res) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!base || !token) {
    return res.json({
      error: 'Missing Redis env vars',
      hasUrl: !!base,
      hasToken: !!token
    });
  }

  try {
    // Test 1: ping
    const ping = await fetch(`${base}/ping`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const pingResult = await ping.json();

    // Test 2: list brief keys
    const keys = await fetch(`${base}/keys/brief:*`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const keysResult = await keys.json();

    // Test 3: check monday_week key type and size
    const check = await fetch(
      `${base}/strlen/brief:monday_week`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const checkResult = await check.json();

    return res.json({
      ping: pingResult,
      briefKeys: keysResult,
      mondayWeekSize: checkResult,
      redisUrl: base.substring(0, 30) + '...'
    });
  } catch(e) {
    return res.json({ error: e.message });
  }
}
