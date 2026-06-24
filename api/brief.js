export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*")
  if (req.method === "OPTIONS")
    return res.status(200).end()

  const session = req.query.session || "presession"
  const key = "brief:" + session

  const base = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN

  if (!base || !token) {
    return res.json({
      notReady: true,
      error: "missing_redis_config"
    })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() =>
      controller.abort(), 8000)

    const r = await fetch(`${base}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: controller.signal
    })
    clearTimeout(timeout)

    const j = await r.json()
    const raw = j.result

    if (!raw) {
      return res.json({ notReady: true })
    }

    let parsed
    try {
      parsed = typeof raw === "string"
        ? JSON.parse(raw) : raw
    } catch(e) {
      await fetch(`${base}/del/${key}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.json({
        notReady: true,
        error: "cache_corrupted_cleared"
      })
    }

    if (!parsed || typeof parsed !== "object") {
      return res.json({
        notReady: true,
        error: "invalid_cache_shape"
      })
    }

    return res.json(parsed)

  } catch(e) {
    return res.json({
      notReady: true,
      error: e.message || "redis_timeout"
    })
  }
}
