export const config = { maxDuration: 30 }

export default async function handler(req) {
  try {
    const result = await Promise.race([
      run(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000))
    ])
    return Response.json(result)
  } catch(e) {
    return Response.json({ error: e.message, ts: Date.now() })
  }
}

async function run(req) {
  const urlParams = new URLSearchParams(req.url.split('?')[1] ?? '')
  const session = urlParams.get('session') ?? 'presession'

  const keyMap = {
    monday_week: 'brief:monday_week',
    monday_nyopen: 'brief:monday_nyopen',
    presession: 'brief:presession',
    nyopen: 'brief:nyopen'
  }
  const briefKey = keyMap[session] ?? 'brief:presession'

  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN

  if (!kvUrl || !kvToken) {
    return { error: true, message: 'Storage not configured' }
  }

  try {
    const cacheRes = await fetch(`${kvUrl}/get/${briefKey}`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    })

    if (cacheRes.ok) {
      const cacheData = await cacheRes.json()
      const raw = cacheData?.result
      if (raw !== null && raw !== undefined) {
        let parsed = null
        try {
          parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        } catch (e) {
          await fetch(`${kvUrl}/del/${briefKey}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${kvToken}` }
          }).catch(() => {})
          return { notReady: true, error: 'cache_corrupted_cleared' }
        }
        if (!parsed || typeof parsed !== 'object') {
          return { notReady: true, error: 'invalid_cache_shape' }
        }
        return { ...parsed, cached: true }
      }
    }
  } catch (redisError) {
    console.log('Redis read failed:', redisError.message)
  }

  const notReadyMessages = {
    monday_week: 'Monday Week Ahead brief generates automatically at 5:00 AM SGT Sunday.',
    monday_nyopen: 'Monday NY Open brief generates automatically at 9:35 PM SGT Monday.',
    presession: 'Pre-Session brief generates automatically at 8:00 PM SGT.',
    nyopen: 'NY Open brief generates at 9:35 PM SGT — 5 minutes after NY open.'
  }

  return {
    error: false,
    notReady: true,
    session,
    message: notReadyMessages[session] ?? notReadyMessages.presession
  }
}
